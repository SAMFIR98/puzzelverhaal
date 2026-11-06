
/* =========================================================
   SPOORZOEKEN — PUZZEL 7: VERFDIEF

   Gebruikt de oorspronkelijke polygonen uit prototype 2.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const canvas = document.getElementById("puzzle7-image");
  const list = document.getElementById("p7-paint-list");
  const progress = document.getElementById("p7-progress");
  const count = document.getElementById("p7-tile-count");

  if (!canvas || !list) {
    console.error("Puzzel 7: canvas of verflijst niet gevonden.");
    return;
  }

  const ctx = canvas.getContext("2d");
  const neutral = "#77736c";
  const solved = new Set();

  const prototypeUrl =
    "/assets/spoorzoeken_barcelona_mozaiek_prototype_v2.html";

  let DATA = null;

  // -------------------------------------------------------
  // TEKSTEN BIJ DE NEGEN VERFPOTJES
  // -------------------------------------------------------

  const clues = [
    "Een Andere Expressie <aantal evangelisten-torens van de Sagrada Família> Duitse Architect",

    "Eusebi <aantal koepels van Palau Güell> Doet <aantal kinderen van Gaudí> Barcelona Bezwijken",

    "Door <aantal door Unesco als werelderfgoed erkende bouwwerken van Gaudí> Antoní's Daden <jaar waarin Gaudí zijn architectuurdiploma behaalde, 18 ..>",

    "Abstract <hoeveel huizen bouwde Gaudi in Park Guell> Bijna Bombastische Cultuur <aantal beuken in de Sagrada Familia>",

    "<Het aantal dat de Bercelonese wijk Nou Barris in zich heeft> Artistiek <leeftijd van de vader van Antoní bij overlijden><leeftijd van Antoní bij overlijden>",

    "<aantal letters van de naam Barcelona> Eulàlia <fout vermelde sterfleeftijd op Antoní's graf> <aantal hoofdgevels van de Sagrada Família> Domènech",

    "<aantal bekende modernistische gebouwen in het Illa de la Discòrdia> Casa <trappenhuisuitgangen op het dak van Casa Milà> Batlló <huisnummer van Casa Antoni Salvadó>",

    "<het huisnummer van Casa Esteve Niubó – Pere IV> <het laagste huisnummer van Casa de Mercedes Aleu de Sala> Artigas",

    "<het aantal architectuurprijzen dat Gaudí won> Catllaràs <het aantal rivieren dat Barcelona omringt> Astorga <dagnummer van de maand juli waarop Antoní Gaudí werd geboren>"
  ];

  // -------------------------------------------------------
  // OORSPRONKELIJKE GEGEVENS OPHALEN
  // -------------------------------------------------------

  async function loadOriginalData() {

    console.log("Puzzel 7: prototype ophalen:", prototypeUrl);

    const response = await fetch(prototypeUrl);

    if (!response.ok) {
      throw new Error(
        "Prototype niet bereikbaar. HTTP-status: " + response.status
      );
    }

    const html = await response.text();

    console.log(
      "Puzzel 7: prototype ontvangen,",
      html.length,
      "tekens."
    );

    const marker = html.indexOf("const DATA");

    if (marker === -1) {
      throw new Error("De regel 'const DATA' is niet gevonden.");
    }

    const jsonStart = html.indexOf("{", marker);

    if (jsonStart === -1) {
      throw new Error("Het begin van het DATA-object ontbreekt.");
    }

    const jsonEnd = html.indexOf("};", jsonStart);

    if (jsonEnd === -1) {
      throw new Error("Het einde van het DATA-object is niet gevonden.");
    }

    const jsonText = html.slice(jsonStart, jsonEnd + 1);

    let data;

    try {
      data = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(
        "De mozaïekgegevens zijn geen geldige JSON: " +
        error.message
      );
    }

    if (
      !data.w ||
      !data.h ||
      !Array.isArray(data.palette) ||
      !Array.isArray(data.tiles)
    ) {
      throw new Error("De structuur van het DATA-object klopt niet.");
    }

    console.log(
      "Puzzel 7: originele gegevens geladen:",
      data.tiles.length,
      "steentjes."
    );

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

      // Aanwijzing links van het verfpotje, zonder hex-code
      const clue = document.createElement("div");
      clue.className = "p7-clue";
      clue.textContent = clues[index] || "";

      // Verfpotje
      const pot = document.createElement("div");
      pot.className = "p7-pot";
      pot.setAttribute("aria-hidden", "true");

      // Leeg invulveld voor de hex-code
      const field = document.createElement("div");
      field.className = "p7-code-field";

      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.maxLength = 7;
      input.value = "";

      input.setAttribute(
        "aria-label",
        `Kleur ${index + 1}`
      );

      // Foutmelding onder het invoerveld
      const error = document.createElement("p");
      error.className = "p7-code-error";
      error.setAttribute("aria-live", "polite");

      // Controleren van de ingevoerde code
      function checkCode() {

        if (input.disabled) return;

        // Een eventueel ingevoerde # verwijderen
        const value = input.value.trim().replace(/^#/, "").toUpperCase();
        const correctCode = hex.replace(/^#/, "").toUpperCase();

        if (value === correctCode) {

          solved.add(index);

          row.classList.add("is-solved");
          input.disabled = true;
          input.value = hex;

          error.textContent = "";

          draw();
          updateProgress();

        } else {

          error.textContent = "Helaas, fout!";

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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

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

  } catch (error) {

    console.error("FOUT BIJ PUZZEL 7:", error);

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
