
(() => {
  "use strict";

  // Map met de negen afbeeldingen.
  const IMAGE_FOLDER = "puzzel3";

  // Verander dit naar ".jpg" of ".webp" als dat de echte extensie is.
  const EXTENSION = ".png";

  const sources = [
    { title: "1 – Ontbijten", file: "ontbijten" },
    { title: "2 – Lezen", file: "lezen" },
    { title: "3 – Skateboarden", file: "skateboarden" },
    { title: "4 – Dansen", file: "dansen" },
    { title: "5 – Vliegen", file: "vliegen" },
    { title: "6 – Bloeien", file: "bloeien" },
    { title: "7 – Feliciteren", file: "feliciteren" },
    { title: "8 – Fotograferen", file: "fotograferen" },
    { title: "9 – Besturen", file: "besturen" }
  ];

  const gallery = document.getElementById("gallery");
  const slots = Array.from(document.querySelectorAll(".slot"));
  const status = document.getElementById("status");
  const clearButton = document.getElementById("clear");

  const pieces = new Map();

  let selectedPiece = null;
  let loadedCount = 0;
  let failedCount = 0;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function getImagePath(source) {
    return `${IMAGE_FOLDER}/${source.file}${EXTENSION}`;
  }

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Afbeelding niet gevonden: ${path}`));

      image.src = path;
    });
  }

  // Snijdt één van de negen delen uit de originele afbeelding.
  function cropImage(image, tileNumber) {
    const column = (tileNumber - 1) % 3;
    const row = Math.floor((tileNumber - 1) / 3);

    const sourceX = Math.round(image.naturalWidth * column / 3);
    const sourceY = Math.round(image.naturalHeight * row / 3);
    const sourceRight = Math.round(image.naturalWidth * (column + 1) / 3);
    const sourceBottom = Math.round(image.naturalHeight * (row + 1) / 3);

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
    if (!pieces.has(pieceId) || !targetSlot) return;

    const piece = pieces.get(pieceId);

    // Haal het fragment eerst uit zijn huidige vak.
    if (piece.slot !== null) {
      const previousSlot = slots[piece.slot];

      if (previousSlot && previousSlot !== targetSlot) {
        renderSlot(previousSlot);
      }
    }

    // Als het doelvak al gevuld is, komt dat fragment weer vrij.
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

    setStatus(
      `${piece.sourceTitle}, fragment ${piece.tile}, geplaatst op vak ${targetSlot.dataset.label}.`
    );
  }

  function wireTile(button, pieceId) {
    button.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", pieceId);
      event.dataTransfer.effectAllowed = "move";
      selectedPiece = pieceId;
    });

    button.addEventListener("click", () => {
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

    console.error(`Puzzel 3: ${path} kon niet worden geladen.`, error);

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
        `${loadedCount} van de sources.length afbeeldingen geladen; ` +
        `${failedCount} afbeelding(en) ontbreken. De overige afbeeldingen werken wel.`
          .replace("sources.length", String(sources.length))
      );
    }
  }

  async function buildSourceCard(source, index) {
    const path = getImagePath(source);

    const card = document.createElement("article");
    card.className = "source-card";

    const title = document.createElement("h3");
    title.className = "source-title";
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
        const pieceId = `image-${index + 1}-tile-${tile}`;

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
      // Een fout bij deze afbeelding blokkeert de andere acht niet.
      showImageError(source, card, path, error);
    }
  }

  function setupBoard() {
    slots.forEach(slot => {
      slot.addEventListener("dragover", event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      });

      slot.addEventListener("drop", event => {
        event.preventDefault();

        const pieceId =
          event.dataTransfer.getData("text/plain") || selectedPiece;

        if (pieceId) {
          placePiece(pieceId, slot);
        }
      });

      slot.addEventListener("click", () => {
        if (selectedPiece) {
          placePiece(selectedPiece, slot);
          return;
        }

        // Klik op een bezet vak om het fragment terug te halen.
        const pieceId = slot.dataset.pieceId;

        if (pieceId) {
          returnPiece(pieceId);
          renderSlot(slot);
          setStatus("Fragment teruggehaald. Je kunt een ander fragment kiezen.");
        }
      });
    });

    clearButton.addEventListener("click", () => {
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

  async function init() {
    if (!gallery || !status || !clearButton || slots.length !== 9) {
      console.error("Puzzel 3: een of meer HTML-elementen ontbreken.");
      return;
    }

    setupBoard();

    // Alle afbeeldingen worden onafhankelijk geladen.
    await Promise.all(
      sources.map((source, index) => buildSourceCard(source, index))
    );

    updateSummary();
  }

  init();
})();
