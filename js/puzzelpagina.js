
/* =========================================================
   SPOORZOEKEN — GEDEELDE PUZZELPAGINA-FUNCTIES
   Puzzel 1, puzzel 2 en volgende puzzels
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const formulier = document.getElementById("answer-form");
  const antwoordveld = document.getElementById("answer");
  const foutmelding = document.getElementById("error-overlay");
  const foutSluiten = document.getElementById("error-close");
  const startKnop = document.getElementById("home-button");
  const puzzel1Afbeelding = document.getElementById("puzzle1-image");
  const puzzel2Afbeelding = document.getElementById("puzzle2-image");
  const puzzel3Afbeelding = document.getElementById("puzzle3-image");
  const succesmelding = document.getElementById("success-message");

  let puzzelNummer = null;

  if (puzzel1Afbeelding) {
    puzzelNummer = 1;
  } else if (puzzel2Afbeelding) {
    puzzelNummer = 2;
  } else if (puzzel3Afbeelding) {
    puzzelNummer = 3;
  }

  /* ---------------------------------------------------------
     FOUTMELDING
     --------------------------------------------------------- */

  function toonFoutmelding() {
    if (!foutmelding) return;

    foutmelding.classList.add("open");
    foutmelding.setAttribute("aria-hidden", "false");
  }

  function sluitFoutmelding() {
    if (!foutmelding) return;

    foutmelding.classList.remove("open");
    foutmelding.setAttribute("aria-hidden", "true");
  }

  /* ---------------------------------------------------------
     ANTWOORD CONTROLEREN EN DOORGAAN
     --------------------------------------------------------- */

  function controleerInvoer(event) {
    event.preventDefault();

    if (puzzelNummer === null || !antwoordveld) {
      return;
    }

    if (controleerAntwoord(puzzelNummer, antwoordveld.value)) {
      antwoordveld.value = "";

      const volgendePuzzel = haalVolgendePuzzelOp(puzzelNummer);

      if (volgendePuzzel) {
        window.location.href = volgendePuzzel.pagina;
        return;
      }

      if (succesmelding) {
        succesmelding.classList.remove("hidden");
        succesmelding.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    } else {
      toonFoutmelding();
    }
  }

  /* ---------------------------------------------------------
     PUZZEL 1: LABEL OPENEN
     --------------------------------------------------------- */

  function openLabel() {
    openLightbox("Puzzel%201b.png", "Het label aan de koffer");
  }

  /* ---------------------------------------------------------
     PUZZEL 2: WISSELEN TUSSEN AFBEELDING 2A EN NONOGRAM 2B
     --------------------------------------------------------- */

  const afbeeldingWeergave = document.getElementById(
    "puzzle2-image-view"
  );

  const nonogramWeergave = document.getElementById(
    "nonogram-view"
  );

  const nonogramBord = document.getElementById(
    "nonogram-board"
  );

  const terugNaarAfbeeldingKnop = document.getElementById(
    "show-image-a"
  );

  const wisVakjesKnop = document.getElementById(
    "clear-nonogram"
  );

  let nonogramOpgelost = false;

  const nonogramStatus = document.createElement("p");
  nonogramStatus.className = "nonogram-complete-message";
  nonogramStatus.setAttribute("role", "status");
  nonogramStatus.setAttribute("aria-live", "polite");
  nonogramStatus.textContent =
    "Precies, dit staat op het spandoek. Dus... voor wie juichen ze hier? 'Vive les ...'";
  nonogramStatus.hidden = true;

  function toonNonogram() {
    if (!afbeeldingWeergave || !nonogramWeergave) return;

    afbeeldingWeergave.classList.add("hidden");
    nonogramWeergave.classList.remove("hidden");

    nonogramWeergave.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  function toonAfbeeldingA() {
    if (!afbeeldingWeergave || !nonogramWeergave) return;

    nonogramWeergave.classList.add("hidden");
    afbeeldingWeergave.classList.remove("hidden");

    afbeeldingWeergave.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  /* ---------------------------------------------------------
     AANWIJZINGEN VAN DE NONOGRAM
     --------------------------------------------------------- */

  const kolomAanwijzingen = [
    [7, 7],
    [6],
    [5],
    [7, 4],
    [1, 1, 1, 1, 3],
    [1, 1, 1, 2, 2],
    [7, 3, 1],
    [4],
    [7, 3, 1],
    [1, 1, 1, 2, 2],
    [1, 1, 1, 1, 3],
    [7, 4],
    [5],
    [6],
    [7, 7]
  ];

  const rijAanwijzingen = [
    [1, 4, 4, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 4, 4, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 4, 4, 1],
    [0],
    [1, 7, 1],
    [2, 5, 2],
    [3, 3, 3],
    [4, 1, 4],
    [5, 5],
    [6, 6],
    [7, 7]
  ];

  /* ---------------------------------------------------------
     DE JUISTE OPLOSSING

     Elke rij bevat de kolomnummers van de zwarte vakjes.
     --------------------------------------------------------- */

  const juisteOplossing = [
    [1, 4, 5, 6, 7, 9, 10, 11, 12, 15],
    [1, 4, 7, 9, 12, 15],
    [1, 4, 7, 9, 12, 15],
    [1, 4, 5, 6, 7, 9, 10, 11, 12, 15],
    [1, 4, 7, 9, 12, 15],
    [1, 4, 7, 9, 12, 15],
    [1, 4, 5, 6, 7, 9, 10, 11, 12, 15],
    [],
    [1, 5, 6, 7, 8, 9, 10, 11, 15],
    [1, 2, 6, 7, 8, 9, 10, 14, 15],
    [1, 2, 3, 7, 8, 9, 13, 14, 15],
    [1, 2, 3, 4, 8, 12, 13, 14, 15],
    [1, 2, 3, 4, 5, 11, 12, 13, 14, 15],
    [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15],
    [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15]
  ];

  /* ---------------------------------------------------------
     OPLOSSING CONTROLEREN

     Alle 225 vakjes moeten exact overeenkomen met de
     bedoelde oplossing.
     --------------------------------------------------------- */

  function controleerNonogram() {
    if (!nonogramBord || nonogramOpgelost) return;

    const vakjes = nonogramBord.querySelectorAll(
      ".nonogram-cell"
    );

    if (vakjes.length !== 225) return;

    for (const vakje of vakjes) {
      const rijNummer = Number(vakje.dataset.rij);
      const kolomNummer = Number(vakje.dataset.kolom);

      const moetZwart = juisteOplossing[rijNummer - 1]
        .includes(kolomNummer);

      const isZwart = vakje.classList.contains("is-black");

      if (isZwart !== moetZwart) {
        return;
      }
    }

    fixeerNonogram();
  }

  /* ---------------------------------------------------------
     OPLOSSING VASTZETTEN

     Zwarte vakjes worden blauwgrijs (#4B5576).
     Witte vakjes blijven wit.
     --------------------------------------------------------- */

  function fixeerNonogram() {
    if (nonogramOpgelost || !nonogramBord) return;

    nonogramOpgelost = true;

    nonogramBord.classList.add("is-complete");

    nonogramBord
      .querySelectorAll(".nonogram-cell")
      .forEach(function (vakje) {
        const isZwart = vakje.classList.contains("is-black");

        vakje.disabled = true;
        vakje.classList.add("is-locked");

        if (isZwart) {
          vakje.style.backgroundColor = "#4B5576";
        }

        vakje.setAttribute(
          "aria-label",
          `Rij ${vakje.dataset.rij}, kolom ${vakje.dataset.kolom}, ${
            isZwart ? "ingevuld" : "leeg"
          }, correct en vastgezet`
        );

        vakje.setAttribute(
          "aria-pressed",
          String(isZwart)
        );
      });

    if (wisVakjesKnop) {
      wisVakjesKnop.disabled = true;
      wisVakjesKnop.setAttribute("aria-disabled", "true");
    }

    if (nonogramWeergave) {
      if (!nonogramStatus.isConnected) {
        nonogramWeergave.appendChild(nonogramStatus);
      }

      nonogramStatus.hidden = false;
    }
  }

  /* ---------------------------------------------------------
     AANWIJZINGSKNOPPEN MAKEN
     --------------------------------------------------------- */

  function maakAanwijzingsknop(
    cijfer,
    richting,
    nummer
  ) {
    const knop = document.createElement("button");

    knop.type = "button";
    knop.className = "nonogram-clue";
    knop.textContent = String(cijfer);
    knop.setAttribute("aria-pressed", "false");

    function werkToegankelijkheidslabelBij() {
      const status = knop.classList.contains("is-crossed")
        ? "doorgestreept"
        : "niet doorgestreept";

      knop.setAttribute(
        "aria-label",
        `${richting} ${nummer}, aanwijzing ${cijfer}, ${status}`
      );
    }

    knop.addEventListener("click", function () {
      knop.classList.toggle("is-crossed");

      const isDoorgestreept = knop.classList.contains(
        "is-crossed"
      );

      knop.setAttribute(
        "aria-pressed",
        String(isDoorgestreept)
      );

      werkToegankelijkheidslabelBij();
    });

    werkToegankelijkheidslabelBij();

    return knop;
  }

  /* ---------------------------------------------------------
     VAKJES MAKEN
     --------------------------------------------------------- */

  function maakVakje(rijNummer, kolomNummer) {
    const vakje = document.createElement("button");

    vakje.type = "button";
    vakje.className = "nonogram-cell";
    vakje.dataset.rij = String(rijNummer);
    vakje.dataset.kolom = String(kolomNummer);
    vakje.setAttribute("aria-pressed", "false");

    function werkVakjeBij() {
      const isZwart = vakje.classList.contains("is-black");

      vakje.setAttribute(
        "aria-pressed",
        String(isZwart)
      );

      vakje.setAttribute(
        "aria-label",
        `Rij ${rijNummer}, kolom ${kolomNummer}, ${
          isZwart ? "zwart" : "wit"
        }`
      );
    }

    vakje.addEventListener("click", function () {
      if (nonogramOpgelost) return;

      vakje.classList.toggle("is-black");
      werkVakjeBij();

      controleerNonogram();
    });

    werkVakjeBij();

    return vakje;
  }

  /* ---------------------------------------------------------
     DE VOLLEDIGE NONOGRAM OPBOUWEN
     --------------------------------------------------------- */

  function bouwNonogram() {
    if (!nonogramBord) return;

    nonogramBord.replaceChildren();

    const bovensteRij = document.createElement("div");
    bovensteRij.className = "nonogram-top";

    const hoekvak = document.createElement("div");
    hoekvak.className = "nonogram-corner";
    bovensteRij.appendChild(hoekvak);

    const kolomContainer = document.createElement("div");
    kolomContainer.className = "nonogram-column-clues";

    kolomAanwijzingen.forEach(function (aanwijzingen, index) {
      const kolom = document.createElement("div");
      kolom.className = "nonogram-column-clue";

      aanwijzingen.forEach(function (cijfer) {
        kolom.appendChild(
          maakAanwijzingsknop(
            cijfer,
            "Kolom",
            index + 1
          )
        );
      });

      kolomContainer.appendChild(kolom);
    });

    bovensteRij.appendChild(kolomContainer);
    nonogramBord.appendChild(bovensteRij);

    rijAanwijzingen.forEach(function (aanwijzingen, rijIndex) {
      const rijNummer = rijIndex + 1;

      const rij = document.createElement("div");
      rij.className = "nonogram-row";

      const rijCijfers = document.createElement("div");
      rijCijfers.className = "nonogram-row-clues";

      aanwijzingen.forEach(function (cijfer) {
        rijCijfers.appendChild(
          maakAanwijzingsknop(
            cijfer,
            "Rij",
            rijNummer
          )
        );
      });

      rij.appendChild(rijCijfers);

      const rasterRij = document.createElement("div");
      rasterRij.className = "nonogram-grid";

      for (let kolomIndex = 0; kolomIndex < 15; kolomIndex++) {
        rasterRij.appendChild(
          maakVakje(rijNummer, kolomIndex + 1)
        );
      }

      rij.appendChild(rasterRij);
      nonogramBord.appendChild(rij);
    });

    if (nonogramWeergave && !nonogramStatus.isConnected) {
      nonogramWeergave.appendChild(nonogramStatus);
    }
  }

  /* ---------------------------------------------------------
     ALLE VAKJES WISSEN
     --------------------------------------------------------- */

  function wisAlleVakjes() {
    if (!nonogramBord || nonogramOpgelost) return;

    nonogramBord
      .querySelectorAll(".nonogram-cell")
      .forEach(function (vakje) {
        vakje.classList.remove("is-black");
        vakje.setAttribute("aria-pressed", "false");

        vakje.setAttribute(
          "aria-label",
          `Rij ${vakje.dataset.rij}, kolom ${vakje.dataset.kolom}, wit`
        );
      });
  }

  /* ---------------------------------------------------------
     TOETSENBEDIENING
     --------------------------------------------------------- */

  function voegToetsbedieningToe(element, actie) {
    if (!element) return;

    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        actie();
      }
    });
  }

  /* ---------------------------------------------------------
     EVENTLISTENERS
     --------------------------------------------------------- */

  if (formulier) {
    formulier.addEventListener("submit", controleerInvoer);
  }

  if (foutSluiten) {
    foutSluiten.addEventListener("click", sluitFoutmelding);
  }

  if (foutmelding) {
    foutmelding.addEventListener("click", function (event) {
      if (event.target === foutmelding) {
        sluitFoutmelding();
      }
    });
  }

  if (startKnop) {
    startKnop.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

  if (puzzel1Afbeelding) {
    puzzel1Afbeelding.addEventListener("click", openLabel);
    voegToetsbedieningToe(puzzel1Afbeelding, openLabel);
  }

  if (puzzel2Afbeelding) {
    puzzel2Afbeelding.addEventListener("click", toonNonogram);
    voegToetsbedieningToe(puzzel2Afbeelding, toonNonogram);
  }

  if (terugNaarAfbeeldingKnop) {
    terugNaarAfbeeldingKnop.addEventListener(
      "click",
      toonAfbeeldingA
    );
  }

  if (wisVakjesKnop) {
    wisVakjesKnop.addEventListener("click", wisAlleVakjes);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      sluitFoutmelding();
      sluitLightbox();
    }
  });

  bouwNonogram();
});
