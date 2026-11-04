
/* =========================================================
   SPOORZOEKEN — PUZZEL 7: VERFDIEF

   Zelfgenererend mozaïek.
   Geen extern JSON-bestand nodig.

   24.576 onregelmatige mozaïektegels
   9 oorspronkelijke kleuren
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("puzzle7-image");
  const list = document.getElementById("p7-paint-list");
  const progress = document.getElementById("p7-progress");
  const count = document.getElementById("p7-tile-count");

  if (!canvas || !list) return;

  const ctx = canvas.getContext("2d", { alpha: false });

  const neutral = "#77736c";

  const palette = [
    "#EAE4DA",
    "#E1D0BB",
    "#D7AD78",
    "#A2BBC5",
    "#9A9373",
    "#9E743D",
    "#5C6B46",
    "#59441A",
    "#1C2A25"
  ];

  const solved = new Set();

  // Afmetingen van het mozaïek.
  // 192 x 128 = exact 24.576 tegels.
  const W = 192;
  const H = 128;

  const tiles = [];

  // -------------------------------------------------------
  // HERHAALBARE WILLEKEURIGE GETALLEN
  // -------------------------------------------------------

  let seed = 19251925;

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // -------------------------------------------------------
  // GESTILEERDE GAUDÍ-DRAAK
  // -------------------------------------------------------

  function distanceToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;

    const length = dx * dx + dy * dy;

    if (length === 0) {
      return Math.hypot(px - ax, py - ay);
    }

    const t = Math.max(
      0,
      Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length)
    );

    return Math.hypot(
      px - (ax + t * dx),
      py - (ay + t * dy)
    );
  }

  function bodyDistance(x, y) {
    let best = Infinity;

    // Gebogen lichaam via een reeks punten.
    const points = [];

    for (let i = 0; i <= 60; i++) {
      const t = i / 60;

      const px =
        0.13 +
        0.61 * t;

      const py =
        0.57 -
        0.16 * Math.sin(t * Math.PI) +
        0.04 * t;

      points.push([px, py]);
    }

    for (let i = 0; i < points.length - 1; i++) {
      const d = distanceToSegment(
        x, y,
        points[i][0], points[i][1],
        points[i + 1][0], points[i + 1][1]
      );

      best = Math.min(best, d);
    }

    return best;
  }

  function ellipse(x, y, cx, cy, rx, ry) {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }

  function dragonShape(x, y) {
    const body = bodyDistance(x, y) < 0.105;

    const head =
      ellipse(x, y, 0.77, 0.39, 0.115, 0.105) ||
      ellipse(x, y, 0.85, 0.42, 0.075, 0.055);

    const legs =
      ellipse(x, y, 0.29, 0.65, 0.045, 0.13) ||
      ellipse(x, y, 0.48, 0.60, 0.045, 0.13) ||
      ellipse(x, y, 0.65, 0.52, 0.045, 0.12) ||
      ellipse(x, y, 0.76, 0.48, 0.045, 0.10);

    // Staart die omhoog krult.
    const tail =
      distanceToSegment(
        x, y,
        0.14, 0.57,
        0.08, 0.44
      ) < 0.025 ||
      distanceToSegment(
        x, y,
        0.08, 0.44,
        0.13, 0.34
      ) < 0.025;

    return body || head || legs || tail;
  }

  // -------------------------------------------------------
  // KLEURTOEWIJZING
  // -------------------------------------------------------

  function getColourIndex(x, y) {
    const dragon = dragonShape(x, y);

    const pattern =
      Math.sin(x * 95 + Math.sin(y * 35) * 2) +
      Math.cos(y * 83 + Math.sin(x * 27) * 2);

    if (dragon) {
      if (pattern > 1.15) return 3;
      if (pattern > 0.45) return 6;
      if (pattern > -0.25) return 4;
      if (pattern > -0.95) return 5;
      if (x > 0.69 && y < 0.47) return 8;
      return 7;
    }

    // Achtergrond met subtiele kleurvlakken.
    if (y < 0.25) return pattern > 0 ? 0 : 1;
    if (y > 0.78) return pattern > 0.7 ? 2 : 1;
    if (x < 0.12) return 0;
    if (x > 0.90) return 2;

    if (pattern > 1.1) return 0;
    if (pattern > 0.35) return 1;
    if (pattern > -0.45) return 2;
    if (pattern > -1.15) return 3;

    return 4;
  }

  // -------------------------------------------------------
  // ONREGELMATIGE MOZAÏEKTEGELS MAKEN
  // -------------------------------------------------------

  // Iedere rasterkruising krijgt een kleine afwijking.
  // Daardoor sluiten de tegels op elkaar aan, maar zijn
  // ze niet allemaal identiek rechthoekig.

  const points = [];

  for (let y = 0; y <= H; y++) {
    points[y] = [];

    for (let x = 0; x <= W; x++) {
      const edge =
        x === 0 || x === W ||
        y === 0 || y === H;

      points[y][x] = [
        x + (edge ? 0 : (random() - 0.5) * 0.62),
        y + (edge ? 0 : (random() - 0.5) * 0.62)
      ];
    }
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = [
        points[y][x],
        points[y][x + 1],
        points[y + 1][x + 1],
        points[y + 1][x]
      ];

      const cx = (x + 0.5) / W;
      const cy = (y + 0.5) / H;

      tiles.push({
        p,
        c: getColourIndex(cx, cy)
      });
    }
  }

  // -------------------------------------------------------
  // MOZAÏEK TEKENEN
  // -------------------------------------------------------

  function draw() {
    const scale = canvas.width / W;

    ctx.fillStyle = neutral;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const tile of tiles) {
      ctx.beginPath();

      tile.p.forEach((point, index) => {
        const x = point[0] * scale;
        const y = point[1] * scale;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();

      ctx.fillStyle = solved.has(tile.c)
        ? palette[tile.c]
        : neutral;

      ctx.fill();

      ctx.strokeStyle = "#514d47";
      ctx.lineWidth = Math.max(0.35, 0.55 * scale);
      ctx.stroke();
    }
  }

  // -------------------------------------------------------
  // VOORTGANG
  // -------------------------------------------------------

  function updateProgress() {
    progress.textContent =
      `${solved.size} van ${palette.length} kleuren vrijgespeeld`;
  }

  // -------------------------------------------------------
  // VERFPOTJES EN KLEURCODES
  // -------------------------------------------------------

  function buildPalette() {
    list.innerHTML = "";

    palette.forEach((hex, index) => {
      const row = document.createElement("div");
      row.className = "p7-paint-row";
      row.style.setProperty("--pot-colour", hex);

      const clue = document.createElement("div");
      clue.className = "p7-clue";
      clue.textContent =
        "Hier komt de puzzeltekst voor deze hex-code";

      const pot = document.createElement("div");
      pot.className = "p7-pot";
      pot.setAttribute("aria-hidden", "true");

      const field = document.createElement("div");
      field.className = "p7-code-field";

      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.maxLength = 7;
      input.placeholder = "•••••••";
      input.setAttribute("aria-label", `Kleur ${index + 1}`);

      const error = document.createElement("p");
      error.className = "p7-code-error";
      error.setAttribute("aria-live", "polite");

      function checkCode() {
        const value = input.value.trim().toUpperCase();

        if (!/^#[0-9A-F]{6}$/.test(value)) {
          error.textContent =
            "Gebruik een kleurcode van zes tekens.";
          return;
        }

        if (value === hex) {
          solved.add(index);

          row.classList.add("is-solved");
          input.disabled = true;
          input.value = hex;

          error.textContent = "";

          draw();
          updateProgress();
        } else {
          error.textContent = "Deze kleur klopt nog niet.";
        }
      }

      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          checkCode();
        }
      });

      input.addEventListener("change", checkCode);

      field.append(input, error);
      row.append(clue, pot, field);
      list.append(row);
    });
  }

  // -------------------------------------------------------
  // RESPONSIVE CANVAS
  // -------------------------------------------------------

  function resize() {
    const rect = canvas.getBoundingClientRect();

    const cssWidth = Math.max(280, rect.width);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssWidth * (H / W) * dpr);

    draw();
  }

  // -------------------------------------------------------
  // START
  // -------------------------------------------------------

  if (count) {
    count.textContent =
      tiles.length.toLocaleString("nl-NL") + " steentjes";
  }

  buildPalette();
  updateProgress();

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  resize();
});
