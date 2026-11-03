/* =========================================================
   SPOORZOEKEN — CLOUDFLARE WORKER
   Server-side toegangscontrole voor alle puzzelpagina's.

   - Controleert antwoorden op de server.
   - Bewaart vrijgespeelde puzzels in een ondertekende cookie.
   - Blokkeert rechtstreekse toegang tot niet-vrijgespeelde pagina's.
   - Bevat geen openbare antwoordensleutels.
   ========================================================= */

const COOKIE_NAME = "__Host-spoorzoeken";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;
const MAX_PUZZLE_NUMBER = 5;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  let normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function normalizeAnswer(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFC");
}

function getSigningSecret(env) {
  if (
    typeof env.SESSION_SECRET !== "string" ||
    env.SESSION_SECRET.length < 32
  ) {
    throw new Error(
      "SESSION_SECRET ontbreekt of is te kort."
    );
  }

  return env.SESSION_SECRET;
}

async function getSigningKey(env) {
  const secret = getSigningSecret(env);

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign", "verify"]
  );
}

/* ---------------------------------------------------------
   SESSIE AANMAKEN
   --------------------------------------------------------- */

async function createSessionToken(progress, env) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    v: 1,
    p: progress,
    exp: now + SESSION_TTL_SECONDS
  };

  const payloadPart = base64UrlEncode(
    encoder.encode(JSON.stringify(payload))
  );

  const key = await getSigningKey(env);

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadPart)
  );

  const signaturePart = base64UrlEncode(
    new Uint8Array(signature)
  );

  return `${payloadPart}.${signaturePart}`;
}

/* ---------------------------------------------------------
   SESSIE CONTROLEREN
   --------------------------------------------------------- */

function readCookie(request) {
  const cookieHeader = request.headers.get("Cookie") || "";

  const prefix = `${COOKIE_NAME}=`;

  const matchingCookie = cookieHeader
    .split(";")
    .map(value => value.trim())
    .find(value => value.startsWith(prefix));

  if (!matchingCookie) {
    return null;
  }

  return matchingCookie.slice(prefix.length);
}

async function readSession(request, env) {
  const token = readCookie(request);

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const payloadPart = parts[0];
    const signaturePart = parts[1];

    const payloadBytes = base64UrlDecode(payloadPart);
    const signatureBytes = base64UrlDecode(signaturePart);

    const payload = JSON.parse(
      decoder.decode(payloadBytes)
    );

    if (
      payload.v !== 1 ||
      !Number.isInteger(payload.p) ||
      payload.p < 1 ||
      payload.p > MAX_PUZZLE_NUMBER ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const key = await getSigningKey(env);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payloadPart)
    );

    if (!valid) {
      return null;
    }

    return {
      progress: payload.p
    };

  } catch (error) {
    console.warn(
      "Spoorzoeken: ongeldige of verlopen sessie.",
      error
    );

    return null;
  }
}

/* ---------------------------------------------------------
   COOKIE INSTELLEN
   --------------------------------------------------------- */

function cookieHeader(token) {
  return (
    `${COOKIE_NAME}=${token}; ` +
    `Path=/; ` +
    `Max-Age=${SESSION_TTL_SECONDS}; ` +
    `Secure; ` +
    `HttpOnly; ` +
    `SameSite=Lax`
  );
}

function addSessionCookie(response, token) {
  const headers = new Headers(response.headers);

  headers.append(
    "Set-Cookie",
    cookieHeader(token)
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/* ---------------------------------------------------------
   JSON-ANTWOORDEN
   --------------------------------------------------------- */

function jsonResponse(data, status = 200, token = null) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  if (token) {
    headers.append(
      "Set-Cookie",
      cookieHeader(token)
    );
  }

  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

/* ---------------------------------------------------------
   JUISTE ANTWOORDEN OPHALEN

   Ondersteunt:
   - Eén antwoord als tekst.
   - Meerdere juiste antwoorden als array.
   --------------------------------------------------------- */

function haalJuisteAntwoordenOp(answers, puzzleNumber) {
  const configuredAnswer = answers[String(puzzleNumber)];

  if (typeof configuredAnswer === "string") {
    return configuredAnswer.trim()
      ? [normalizeAnswer(configuredAnswer)]
      : null;
  }

  if (Array.isArray(configuredAnswer)) {
    const normalizedAnswers = configuredAnswer
      .filter(answer => typeof answer === "string")
      .map(answer => normalizeAnswer(answer))
      .filter(answer => answer.length > 0);

    return normalizedAnswers.length > 0
      ? normalizedAnswers
      : null;
  }

  return null;
}

/* ---------------------------------------------------------
   ANTWOORDENCONTROLEREN

   De antwoorden worden uitsluitend gelezen uit de
   Cloudflare Secret PUZZLE_ANSWERS.
   --------------------------------------------------------- */

async function handleAnswer(request, env, url) {
  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        code: "method_not_allowed"
      },
      405
    );
  }

  // Voorkom dat andere websites de API kunnen aanroepen.
  const origin = request.headers.get("Origin");

  if (origin) {
    try {
      if (new URL(origin).origin !== url.origin) {
        return jsonResponse(
          {
            ok: false,
            code: "forbidden"
          },
          403
        );
      }
    } catch {
      return jsonResponse(
        {
          ok: false,
          code: "forbidden"
        },
        403
      );
    }
  }

  if (
    typeof env.PUZZLE_ANSWERS !== "string" ||
    !env.PUZZLE_ANSWERS
  ) {
    return jsonResponse(
      {
        ok: false,
        code: "configuration_error"
      },
      503
    );
  }

  let body;

  try {
    const contentLength = Number(
      request.headers.get("Content-Length") || 0
    );

    if (contentLength > 4096) {
      return jsonResponse(
        {
          ok: false,
          code: "request_too_large"
        },
        413
      );
    }

    body = await request.json();

  } catch {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_request"
      },
      400
    );
  }

  const puzzleNumber = Number(body.puzzleNumber);
  const givenAnswer = normalizeAnswer(body.answer);

  if (
    !Number.isInteger(puzzleNumber) ||
    puzzleNumber < 1 ||
    puzzleNumber > MAX_PUZZLE_NUMBER ||
    !givenAnswer ||
    givenAnswer.length > 100
  ) {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_request"
      },
      400
    );
  }

  let answers;

  try {
    answers = JSON.parse(env.PUZZLE_ANSWERS);

    if (
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      throw new Error("Ongeldige antwoordconfiguratie.");
    }

  } catch (error) {
    console.error(
      "Spoorzoeken: PUZZLE_ANSWERS is ongeldig.",
      error
    );

    return jsonResponse(
      {
        ok: false,
        code: "configuration_error"
      },
      503
    );
  }

  const correctAnswers = haalJuisteAntwoordenOp(
    answers,
    puzzleNumber
  );

  if (!correctAnswers) {
    return jsonResponse(
      {
        ok: false,
        code: "puzzle_not_configured"
      },
      503
    );
  }

  const session = await readSession(request, env);
  const currentProgress = session?.progress ?? 1;

  // Verkeerd antwoord: geen nieuwe puzzel vrijgeven.
  if (!correctAnswers.includes(givenAnswer)) {
    const token = await createSessionToken(
      currentProgress,
      env
    );

    return jsonResponse(
      {
        ok: false,
        code: "wrong_answer"
      },
      400,
      token
    );
  }

  // Goed antwoord: geef de volgende puzzel vrij.
  const nextPuzzleNumber = puzzleNumber + 1;

  const newProgress = Math.max(
    currentProgress,
    Math.min(nextPuzzleNumber, MAX_PUZZLE_NUMBER)
  );

  const token = await createSessionToken(
    newProgress,
    env
  );

  const nextPage =
    puzzleNumber < MAX_PUZZLE_NUMBER
      ? `/puzzel-${nextPuzzleNumber}.html`
      : null;

  return jsonResponse(
    {
      ok: true,
      nextPage,
      completed: puzzleNumber === MAX_PUZZLE_NUMBER
    },
    200,
    token
  );
}

/* ---------------------------------------------------------
   PUZZELPAGINA BEVEILIGEN
   --------------------------------------------------------- */

async function handlePuzzlePage(request, env, url, path) {
  const match = path.match(
    /^\/puzzel-(\d+)\.html$/i
  );

  // Onbekende varianten niet als puzzelpagina behandelen.
  if (!match) {
    return new Response("Pagina niet gevonden.", {
      status: 404
    });
  }

  const puzzleNumber = Number(match[1]);

  if (
    !Number.isInteger(puzzleNumber) ||
    puzzleNumber < 1 ||
    puzzleNumber > MAX_PUZZLE_NUMBER
  ) {
    return new Response("Pagina niet gevonden.", {
      status: 404
    });
  }

  if (
    typeof env.SESSION_SECRET !== "string" ||
    env.SESSION_SECRET.length < 32
  ) {
    return new Response(
      "De beveiligingsinstellingen zijn nog niet compleet.",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const session = await readSession(request, env);

  // Een nieuwe speler mag altijd beginnen bij puzzel 1.
  const currentProgress = session?.progress ?? 1;

  // De gevraagde puzzel is nog niet vrijgespeeld.
  if (puzzleNumber > currentProgress) {
    const token = await createSessionToken(
      currentProgress,
      env
    );

    const redirectUrl = new URL("/", url.origin);
    redirectUrl.searchParams.set(
      "locked",
      String(puzzleNumber)
    );

    const headers = new Headers({
      "Location": redirectUrl.toString(),
      "Cache-Control": "no-store"
    });

    headers.append(
      "Set-Cookie",
      cookieHeader(token)
    );

    return new Response(null, {
      status: 302,
      headers
    });
  }

  // Toegang toegestaan: serveer het bestaande HTML-bestand.
  const response = await env.ASSETS.fetch(request);

  // Vernieuw de voortgangscookie.
  const token = await createSessionToken(
    currentProgress,
    env
  );

  return addSessionCookie(response, token);
}

/* ---------------------------------------------------------
   HOOFDROUTINE
   --------------------------------------------------------- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API voor antwoordcontrole.
    if (url.pathname === "/api/answer") {
      return handleAnswer(request, env, url);
    }

    // Onbekende API-routes niet als statische bestanden serveren.
    if (url.pathname.startsWith("/api/")) {
      return new Response("API-route niet gevonden.", {
        status: 404
      });
    }

    let decodedPath;

    try {
      decodedPath = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Ongeldig adres.", {
        status: 400
      });
    }

    // Alle puzzel-HTML-pagina's lopen langs de toegangscontrole.
    if (
      decodedPath.toLowerCase().startsWith("/puzzel-") &&
      decodedPath.toLowerCase().includes(".html")
    ) {
      return handlePuzzlePage(
        request,
        env,
        url,
        decodedPath
      );
    }

    // Overige bestanden blijven gewone statische bestanden.
    // Dit omvat ook puzzel-3.js, afbeeldingen, CSS en algemene JS.
    return env.ASSETS.fetch(request);
  }
};
