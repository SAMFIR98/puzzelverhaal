
(() => {
  "use strict";

  // =========================================================
  // PUZZEL 3 — HET VERZAMELBORD
  // De negen basisafbeeldingen worden willekeurig gerangschikt.
  // De oorspronkelijke nummers blijven intern behouden.
  // De antwoordcontrole verloopt via puzzelpagina.js en Cloudflare.
  // =========================================================

  const IMAGE_FOLDER = "puzzel3";
  const EXTENSION = ".png";

  const sources = [
    { number: 1, title: "Ontbijten", file: "ontbijten" },
    { number: 2, title: "Lezen", file: "lezen" },
    { number: 3, title: "Skateboarden", file: "skateboarden" },
    { number: 4, title: "Dansen", file: "dansen" },
    { number: 5, title: "Vliegen", file: "vliegen" },
    { number: 6, title: "Bloeien", file: "bloeien" },
    { number: 7, title: "Feliciteren", file: "feliciteren" },
    { number: 8, title: "Fotograferen", file: "fotograferen" },
    { number: 9, title: "Besturen", file: "besturen" }
  ];

  // De juiste combinatie van fragment en vak.
  // slot is het vaknummer: A = 0, B = 1, enzovoort.
  const correctPieces = [
    { source: 9, tile: 1, slot: 0 }, // Besturen -> A
    { source: 8, tile: 2, slot: 1 }, // Fotograferen -> B
    { source: 7, tile: 3, slot: 2 }, // Feliciteren -> C
    { source: 5, tile: 4, slot: 3 }, // Vliegen -> D
    { source: 6, tile: 5, slot: 4 }, // Bloeien -> E
    { source: 4, tile: 6, slot: 5 }, // Dansen -> F
    { source: 3, tile: 7, slot: 6 }, // Skateboarden -> G
    { source: 2, tile: 8, slot: 7 }, // Lezen -> H
    { source: 1, tile: 9, slot: 8 }  // Ontbijten -> I
  ];

  const gallery = document.getElementById("gallery");
  const slots = Array.from(document.querySelectorAll(".slot"));
  const status = document.getElementById("status");
  const clearButton = document.getElementById("clear");

  const pieces = new Map();

  let selectedPiece = null;
  let loadedCount = 0;
  let failedCount = 0;
  let boardLocked = false;

  /* ---------------------------------------------------------
     WILLEKEURIGE VOLGORDE
     --------------------------------------------------------- */

  function shuffleSources(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(
        Math.random() * (i + 1)
      );

      [shuffled[i], shuffled[randomIndex]] =
        [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  /* ---------------------------------------------------------
     AFBEELDINGEN LADEN EN FRAGMENTEN MAKEN
     --------------------------------------------------------- */

  function getImagePath(source) {
    return `${IMAGE_FOLDER}/${source.file}${EXTENSION}`;
  }

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = () => {
        reject(new Error(`Afbeelding niet gevonden: ${path}`));
      };

      image.src = path;
    });
  }

  // Snijdt één van de negen delen uit de originele afbeelding.
  function cropImage(image, tileNumber) {
    const column = (tileNumber - 1) % 3;
    const row = Math.floor((tileNumber - 1) / 3);

    const sourceX = Math.round(
      image.naturalWidth * column / 3
    );

    const sourceY = Math.round(
      image.naturalHeight * row / 3
    );

    const sourceRight = Math.round(
      image.naturalWidth * (column + 1) / 3
    );

    const sourceBottom = Math.round(
      image.naturalHeight * (row + 1) / 3
    );

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("De browser kan geen fragment maken.");
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceRight - sourceX,
      sourceBottom - sourceY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL("image/png");
  }

  /* ---------------------------------------------------------
     VERZAMELBORD
     --------------------------------------------------------- */

  function renderSlot(slot, pieceId = null) {
    slot.innerHTML = "";

    const label = document.createElement("span");
    label.className = "slot-label";
    label.textContent = slot.dataset.label;

    slot.appendChild(label);

    delete slot.dataset.pieceId;

    if (!pieceId) {
      const empty = document.createElement("span");
      empty.className = "empty";
      empty.textContent = "Sleep hier";

      slot.appendChild(empty);
      return;
    }

    const piece = pieces.get(pieceId);

    if (!piece) return;

    slot.dataset.pieceId = pieceId;

    const image = document.createElement("img");
    image.src = piece.data;
    image.alt = `${piece.sourceTitle}, fragment ${piece.tile}`;

    slot.appendChild(image);
  }

  function updatePieceAppearance(pieceId, isUsed) {
    const button = document.querySelector(
      `.tile[data-piece-id="${pieceId}"]`
    );

    if (button) {
      button.classList.toggle("used", isUsed);
    }
  }

  function returnPiece(pieceId) {
    if (boardLocked) return;

    const piece = pieces.get(pieceId);

    if (!piece) return;

    if (piece.slot !== null) {
      const oldSlot = slots[piece.slot];

      if (oldSlot && oldSlot.dataset.pieceId === pieceId) {
        renderSlot(oldSlot);
      }
    }

    piece.slot = null;
    updatePieceAppearance(pieceId, false);
  }

  function placePiece(pieceId, targetSlot) {
    if (boardLocked) return;
    if (!pieces.has(pieceId) || !targetSlot) return;

    const piece = pieces.get(pieceId);

    // Haal het fragment eerst uit zijn huidige vak.
    if (piece.slot !== null) {
      const previousSlot = slots[piece.slot];

      if (previousSlot && previousSlot !== targetSlot) {
        renderSlot(previousSlot);
      }
    }

    // Maak een eventueel bezet doelvak vrij.
    const existingPieceId = targetSlot.dataset.pieceId;

    if (existingPieceId && existingPieceId !== pieceId) {
      const existingPiece = pieces.get(existingPieceId);

      if (existingPiece) {
        existingPiece.slot = null;
      }

      updatePieceAppearance(existingPieceId, false);
    }

    renderSlot(targetSlot, pieceId);

    piece.slot = Number(targetSlot.dataset.index);
    updatePieceAppearance(pieceId, true);

    document.querySelectorAll(".tile.selected").forEach(button => {
      button.classList.remove("selected");
    });

    selectedPiece = null;

    // Controleer direct of het volledige bord goed ligt.
    if (checkBoard()) {
      lockBoard();
      return;
    }

    setStatus(
      `${piece.sourceTitle}, fragment ${piece.tile}, geplaatst op vak ${targetSlot.dataset.label}.`
    );
  }

  function wireTile(button, pieceId) {
    button.addEventListener("dragstart", event => {
      if (boardLocked) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.setData("text/plain", pieceId);
      event.dataTransfer.effectAllowed = "move";

      selectedPiece = pieceId;
    });

    button.addEventListener("click", () => {
      if (boardLocked) return;

      document.querySelectorAll(".tile.selected").forEach(tile => {
        tile.classList.remove("selected");
      });

      selectedPiece = pieceId;
      button.classList.add("selected");

      const piece = pieces.get(pieceId);

      setStatus(
        `Geselecteerd: ${piece.sourceTitle}, fragment ${piece.tile}. Klik daarna op vak A–I.`
      );
    });
  }

  /* ---------------------------------------------------------
     BASISAFBEELDINGEN OPBOUWEN
     --------------------------------------------------------- */

  function showImageError(source, card, path, error) {
    failedCount++;

    const imageArea = card.querySelector(".image-grid");
    imageArea.innerHTML = "";

    const message = document.createElement("div");
    message.className = "image-error";

    message.textContent =
      `Deze afbeelding kan niet worden geladen: ${path}. ` +
      "Controleer de bestandsnaam, extensie en map.";

    imageArea.appendChild(message);

    console.error(
      `Puzzel 3: ${path} kon niet worden geladen.`,
      error
    );

    updateSummary();
  }

  function updateSummary() {
    if (loadedCount + failedCount < sources.length) {
      setStatus(
        `Afbeeldingen laden… ${loadedCount} geladen, ${failedCount} niet beschikbaar.`
      );

      return;
    }

    if (failedCount === 0) {
      setStatus(
        "Alle negen afbeeldingen zijn geladen. Sleep fragmenten naar vak A–I."
      );
    } else {
      setStatus(
        `${loadedCount} van de ${sources.length} afbeeldingen geladen; ` +
        `${failedCount} afbeelding(en) ontbreken. De overige afbeeldingen werken wel.`
      );
    }
  }

  async function buildSourceCard(source) {
    const path = getImagePath(source);

    const card = document.createElement("article");
    card.className = "source-card";

    const title = document.createElement("h3");
    title.className = "source-title";

    // Alleen de naam wordt zichtbaar getoond.
    // Het oorspronkelijke nummer blijft intern behouden.
    title.textContent = source.title;

    const imageArea = document.createElement("div");
    imageArea.className = "image-grid";

    card.appendChild(title);
    card.appendChild(imageArea);

    gallery.appendChild(card);

    try {
      const image = await loadImage(path);

      const fullImage = document.createElement("img");
      fullImage.src = path;
      fullImage.alt = `Basisafbeelding ${source.title}`;

      imageArea.appendChild(fullImage);

      const overlay = document.createElement("div");
      overlay.className = "tile-overlay";

      for (let tile = 1; tile <= 9; tile++) {
        // Gebruik het oorspronkelijke nummer, niet de willekeurige positie.
        const pieceId =
          `image-${source.number}-tile-${tile}`;

        let data;

        try {
          data = cropImage(image, tile);

        } catch (error) {
          console.error(
            `Fragment ${tile} van ${path} kon niet worden gemaakt.`,
            error
          );

          continue;
        }

        pieces.set(pieceId, {
          id: pieceId,
          sourceTitle: source.title,
          sourceNumber: source.number,
          tile,
          data,
          slot: null
        });

        const button = document.createElement("button");
        button.type = "button";
        button.className = "tile";
        button.draggable = true;
        button.dataset.pieceId = pieceId;

        button.setAttribute(
          "aria-label",
          `${source.title}, fragment ${tile}`
        );

        button.title = `${source.title}, fragment ${tile}`;

        const number = document.createElement("span");
        number.className = "tile-number";
        number.textContent = tile;

        button.appendChild(number);

        wireTile(button, pieceId);
        overlay.appendChild(button);
      }

      imageArea.appendChild(overlay);

      loadedCount++;
      updateSummary();

    } catch (error) {
      showImageError(source, card, path, error);
    }
  }

  /* ---------------------------------------------------------
     OPLOSSING CONTROLEREN EN BORD VERGRENDELEN
     --------------------------------------------------------- */

  function checkBoard() {
    if (slots.length !== correctPieces.length) {
      return false;
    }

    return correctPieces.every(expected => {
      const slot = slots[expected.slot];

      if (!slot) return false;

      const expectedPieceId =
        `image-${expected.source}-tile-${expected.tile}`;

      return slot.dataset.pieceId === expectedPieceId;
    });
  }

  function lockBoard() {
    if (boardLocked) return;

    boardLocked = true;
    selectedPiece = null;

    document.querySelectorAll(".tile.selected").forEach(button => {
      button.classList.remove("selected");
    });

    // Vergrendel alle fragmenten, vakken en de leegmaakknop.
    document.querySelectorAll(".tile").forEach(button => {
      button.disabled = true;
      button.draggable = false;
    });

    slots.forEach(slot => {
      slot.setAttribute("aria-disabled", "true");
      slot.style.cursor = "default";
    });

    clearButton.disabled = true;

    setStatus(
      "Uitstekend! Alle negen fragmenten liggen op de juiste plek. Het bord is vergrendeld."
    );
  }

  /* ---------------------------------------------------------
     BEDIENING VAN HET VERZAMELBORD
     --------------------------------------------------------- */

  function setupBoard() {
    slots.forEach(slot => {
      slot.addEventListener("dragover", event => {
        if (boardLocked) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      });

      slot.addEventListener("drop", event => {
        if (boardLocked) return;

        event.preventDefault();

        const pieceId =
          event.dataTransfer.getData("text/plain") || selectedPiece;

        if (pieceId) {
          placePiece(pieceId, slot);
        }
      });

      slot.addEventListener("click", () => {
        if (boardLocked) return;

        if (selectedPiece) {
          placePiece(selectedPiece, slot);
          return;
        }

        // Klik op een bezet vak om het fragment terug te halen.
        const pieceId = slot.dataset.pieceId;

        if (pieceId) {
          returnPiece(pieceId);
          renderSlot(slot);

          setStatus(
            "Fragment teruggehaald. Je kunt een ander fragment kiezen."
          );
        }
      });
    });

    clearButton.addEventListener("click", () => {
      if (boardLocked) return;

      slots.forEach(slot => {
        const pieceId = slot.dataset.pieceId;

        if (pieceId) {
          const piece = pieces.get(pieceId);

          if (piece) {
            piece.slot = null;
          }

          updatePieceAppearance(pieceId, false);
        }

        renderSlot(slot);
      });

      document.querySelectorAll(".tile.selected").forEach(button => {
        button.classList.remove("selected");
      });

      selectedPiece = null;

      setStatus("Het verzamelbord is leeggemaakt.");
    });
  }

  /* ---------------------------------------------------------
     INITIALISATIE
     --------------------------------------------------------- */

  async function init() {
    if (
      !gallery ||
      !status ||
      !clearButton ||
      slots.length !== 9
    ) {
      console.error(
        "Puzzel 3: een of meer HTML-elementen ontbreken."
      );

      return;
    }

    setupBoard();

    // Maak bij iedere nieuwe paginaopening een willekeurige volgorde.
    const shuffledSources = shuffleSources(sources);

    await Promise.all(
      shuffledSources.map(source => buildSourceCard(source))
    );

    updateSummary();
  }

  init();
})();
