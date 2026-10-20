
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

  // Bepaal welke puzzel op deze pagina staat.
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

      // Ga direct door naar de volgende puzzel als die bestaat.
      if (volgendePuzzel) {
        window.location.href = volgendePuzzel.pagina;
        return;
      }

      // Alleen tonen als er geen volgende puzzel is ingesteld.
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
     PUZZEL 2: WISSELEN TUSSEN AFBEELDING 2A EN DE JAPANSE
     PUZZEL 2B
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
     AANWIJZINGEN VAN DE JAPANSE PUZZEL

     De kolommen lopen van links naar rechts.
     De rijen lopen van boven naar beneden.
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
     AANWIJZINGEN MAKEN
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
     RASTER MAKEN

     Alle vakjes beginnen wit.
     De speler kan ieder vakje afzonderlijk zwart of wit maken.
     --------------------------------------------------------- */

  function maakVakje(rijNummer, kolomNummer) {
    const vakje = document.createElement("button");

    vakje.type = "button";
    vakje.className = "nonogram-cell";
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
      vakje.classList.toggle("is-black");
      werkVakjeBij();
    });

    werkVakjeBij();

    return vakje;
  }

  /* ---------------------------------------------------------
     DE VOLLEDIGE JAPANSE PUZZEL OPBOUWEN
     --------------------------------------------------------- */

  function bouwNonogram() {
    if (!nonogramBord) return;

    nonogramBord.replaceChildren();

    // Bovenste deel: aanwijzingen van de 15 kolommen.
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

    // De 15 rijen met links de cijfers en rechts de vakjes.
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
  }

  /* ---------------------------------------------------------
     ALLE VAKJES WISSEN
     --------------------------------------------------------- */

  function wisAlleVakjes() {
    if (!nonogramBord) return;

    nonogramBord
      .querySelectorAll(".nonogram-cell")
      .forEach(function (vakje) {
        vakje.classList.remove("is-black");
        vakje.setAttribute("aria-pressed", "false");

        const rij = vakje.getAttribute("aria-label").match(
          /Rij (\d+), kolom (\d+)/
        );

        if (rij) {
          vakje.setAttribute(
            "aria-label",
            `Rij ${rij[1]}, kolom ${rij[2]}, wit`
          );
        }
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

  // Maak het raster zodra de pagina geladen is.
  bouwNonogram();
});
