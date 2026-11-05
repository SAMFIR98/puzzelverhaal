
/* =========================================================
   SPOORZOEKEN — PUZZEL 7: VERFDIEF

   Gebruikt het oorspronkelijke mozaïek uit prototype 2.

   De DATA wordt rechtstreeks uit het HTML-prototype gelezen.
   Geen kopiëren van de grote polygonendataset nodig.

   1536 x 1024 pixels
   9 oorspronkelijke kleuren
   Oorspronkelijke mozaïekpolygonen
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("puzzle7-image");
  const list = document.getElementById("p7-paint-list");
  const progress = document.getElementById("p7-progress");
  const count = document.getElementById("p7-tile-count");

  if (!canvas || !list) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Het canvas kan niet worden geopend.");
    return;
  }

  const neutral = "#77736c";

  const prototypeUrl =
    "/assets/spoorzoeken_barcelona_mozaiek_prototype_v2.html";

  let DATA;
  const solved = new Set();

  // -------------------------------------------------------
  // OORSPRONKELIJKE MOZAÏEKGEGEVENS OPHALEN
  // -------------------------------------------------------

  async function loadOriginalData() {
    const response = await fetch(prototypeUrl, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "Het oorspronkelijke prototype kon niet worden geladen."
      );
    }

    const html = await response.text();

    /*
      Haal uitsluitend het DATA-object uit het prototype.

      Het object begint bij:
      const DATA = {

      En eindigt direct vóór:
      const ctx = canvas.getContext(...)
    */

    const match = html.match(
      /const\s+DATA\s*=\s*(\{[\s\S]*?\})\s*;\s*const\s+ctx\s*=/
    );

    if (!match || !match[1]) {
      throw new Error(
        "De oorspronkelijke mozaïekgegevens zijn niet gevonden."
      );
    }

    const data = JSON.parse(match[1]);

    if (
      !data.w ||
      !data.h ||
      !Array.isArray(data.palette) ||
      !Array.isArray(data.tiles)
    ) {
      throw new Error(
        "De gegevens van het oorspronkelijke mozaïek zijn onvolledig."
      );
    }

    return data;
  }

  // -------------------------------------------------------
  // MOZAÏEK TEKENEN
  // -------------------------------------------------------

  function draw() {
    if (!DATA) return;

    const scaleX = canvas.width / DATA.w;
    const scaleY = canvas.height / DATA.h;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = neutral;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const tile of DATA.tiles) {
      ctx.beginPath();

      tile.p.forEach((point, index) => {
        const x = point[0] * scaleX;
        const y = point[1] * scaleY;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();

      ctx.fillStyle = solved.has(tile.c)
        ? DATA.palette[tile.c]
        : neutral;

      ctx.fill();

      ctx.strokeStyle = "#514d47";
      ctx.lineWidth = Math.max(
        0.35,
        0.55 * Math.min(scaleX, scaleY)
      );

      ctx.stroke();
    }
  }

  // -------------------------------------------------------
  // VOORTGANG
  // -------------------------------------------------------

  function updateProgress() {
    if (!progress) return;

    progress.textContent =
      `${solved.size} van ${DATA.palette.length} kleuren vrijgespeeld`;
  }

  // -------------------------------------------------------
  // VERFPOTJES EN KLEURCODES
  // -------------------------------------------------------

  function buildPalette() {
    list.innerHTML = "";

    DATA.palette.forEach((hex, index) => {
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
        if (input.disabled) return;

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
          error.textContent =
            "Deze kleur klopt nog niet.";
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
    if (!DATA) return;

    const rect = canvas.getBoundingClientRect();

    const cssWidth = Math.max(280, rect.width);
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width = Math.round(cssWidth * dpr);

    canvas.height = Math.round(
      cssWidth * (DATA.h / DATA.w) * dpr
    );

    draw();
  }

  // -------------------------------------------------------
  // START
  // -------------------------------------------------------

  try {
    DATA = await loadOriginalData();

    if (count) {
      count.textContent =
        DATA.tiles.length.toLocaleString("nl-NL") +
        " steentjes";
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

    console.log(
      "Origineel mozaïek geladen:",
      DATA.tiles.length,
      "steentjes"
    );

  } catch (error) {
    console.error("Puzzel 7:", error);

    list.innerHTML = "";

    const message = document.createElement("p");
    message.className = "p7-code-error";
    message.textContent =
      "Het oorspronkelijke mozaïek kan niet worden geladen. Vernieuw de pagina of probeer het later opnieuw.";

    list.append(message);

    if (progress) {
      progress.textContent = "Mozaïek niet geladen";
    }

    if (count) {
      count.textContent = "";
    }
  }
});
