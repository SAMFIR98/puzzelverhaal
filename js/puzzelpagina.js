
/* =========================================================
   SPOORZOEKEN — GEDEELDE PUZZELPAGINA-FUNCTIES
   Puzzel 1 t/m 7.

   Antwoorden worden gecontroleerd door Cloudflare.
   Foutmeldingen worden centraal gestandaardiseerd.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const formulier = document.getElementById("answer-form");
  const antwoordveld = document.getElementById("answer");
  const foutmelding = document.getElementById("error-overlay");

  let foutSluiten =
    document.getElementById("error-close") ||
    document.getElementById("close-error");

  const startKnop = document.getElementById("home-button");

  const puzzel1Afbeelding = document.getElementById("puzzle1-image");
  const puzzel2Afbeelding = document.getElementById("puzzle2-image");
  const puzzel3Afbeelding = document.getElementById("puzzle3-image");
  const puzzel4Afbeelding = document.getElementById("puzzle4-image");
  const puzzel5Afbeelding = document.getElementById("puzzle5-image");

  const succesmelding = document.getElementById("success-message");

  /* ---------------------------------------------------------
     PUZZELNUMMER BEPALEN VIA DE PAGINANAAM
     --------------------------------------------------------- */

  let puzzelNummer = null;

  const huidigePagina = window.location.pathname;

  const paginaMatch = huidigePagina.match(/puzzel-(\d+)(?:\.html)?\/?$/i);

  if (paginaMatch) {
    puzzelNummer = Number(paginaMatch[1]);
  } else if (puzzel1Afbeelding) {
    puzzelNummer = 1;
  } else if (puzzel2Afbeelding) {
    puzzelNummer = 2;
  } else if (puzzel3Afbeelding) {
    puzzelNummer = 3;
  } else if (puzzel4Afbeelding) {
    puzzelNummer = 4;
  } else if (puzzel5Afbeelding) {
    puzzelNummer = 5;
  }

  console.log("Spoorzoeken: puzzelnummer", puzzelNummer);

  /* ---------------------------------------------------------
     UNIFORME FOUTMELDING
     --------------------------------------------------------- */

  const standaardFoutmelding =
    "Dat is niet het goede antwoord. Het sein staat op rood. " +
    "Vind het goede antwoord om door te kunnen stomen.";

  function maakFoutmeldingUniform() {
    if (!foutmelding) return;

    let foutBox =
      foutmelding.querySelector(".error-box") ||
      foutmelding.querySelector(".error-message");

    if (!foutBox) {
      foutBox = document.createElement("div");
      foutmelding.appendChild(foutBox);
    }

    foutBox.classList.remove("error-message");
    foutBox.classList.add("error-box");

    let afbeelding = foutBox.querySelector("img");

    if (!afbeelding) {
      afbeelding = document.createElement("img");
      foutBox.prepend(afbeelding);
    }

    afbeelding.src = "Stop.png";
    afbeelding.alt = "Stop";

    let titel = foutBox.querySelector("h2");

    if (!titel) {
      titel = document.createElement("h2");
      foutBox.insertBefore(titel, foutBox.querySelector("p"));
    }

    titel.id = "error-title";
    titel.textContent = "Het spoor loopt dood";

    let tekst = foutBox.querySelector("p");

    if (!tekst) {
      tekst = document.createElement("p");
      foutBox.appendChild(tekst);
    }

    tekst.textContent = standaardFoutmelding;

    let knop =
      foutBox.querySelector("#error-close") ||
      foutBox.querySelector("#close-error") ||
      foutBox.querySelector("button");

    if (!knop) {
      knop = document.createElement("button");
      knop.type = "button";
      foutBox.appendChild(knop);
    }

    knop.id = "error-close";
    knop.type = "button";
    knop.textContent = "Opnieuw proberen";

    foutmelding.classList.add("hidden");
    foutmelding.classList.remove("open");

    foutmelding.setAttribute("aria-hidden", "true");
    foutmelding.setAttribute("role", "alertdialog");
    foutmelding.setAttribute("aria-modal", "true");
    foutmelding.setAttribute("aria-labelledby", "error-title");

    foutSluiten = knop;

    console.log("Spoorzoeken: foutmelding gestandaardiseerd.");
  }

  function toonFoutmelding(bericht = standaardFoutmelding) {
    if (!foutmelding) {
      console.error("Spoorzoeken: fout-overlay niet gevonden.");
      return;
    }

    const tekst = foutmelding.querySelector(".error-box p");

    if (tekst) {
      tekst.textContent = bericht;
    }

    foutmelding.classList.remove("hidden");
    foutmelding.classList.add("open");
    foutmelding.setAttribute("aria-hidden", "false");
  }

  function sluitFoutmelding() {
    if (!foutmelding) return;

    foutmelding.classList.remove("open");
    foutmelding.classList.add("hidden");
    foutmelding.setAttribute("aria-hidden", "true");

    const tekst = foutmelding.querySelector(".error-box p");

    if (tekst) {
      tekst.textContent = standaardFoutmelding;
    }
  }

  maakFoutmeldingUniform();

  /* ---------------------------------------------------------
     ANTWOORD CONTROLEREN VIA CLOUDFLARE
     --------------------------------------------------------- */

  async function controleerInvoer(event) {
    event.preventDefault();

    console.log(
      "Spoorzoeken: antwoordcontrole gestart voor puzzel",
      puzzelNummer
    );

    if (puzzelNummer === null || !antwoordveld || !formulier) {
      console.error(
        "Spoorzoeken: formulier, antwoordveld of puzzelnummer ontbreekt."
      );

      toonFoutmelding(
        "De antwoordcontrole kan niet worden gestart. " +
        "Ververs de pagina en probeer het opnieuw."
      );

      return;
    }

    const gegevenAntwoord = antwoordveld.value.trim();

    if (!gegevenAntwoord) {
      antwoordveld.focus();
      return;
    }

    const verzendKnop = formulier.querySelector(
      'button[type="submit"]'
    );

    if (verzendKnop) {
      verzendKnop.disabled = true;
    }

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          puzzleNumber: puzzelNummer,
          answer: gegevenAntwoord
        })
      });

      console.log(
        "Spoorzoeken: serverstatus",
        response.status
      );

      let resultaat;

      try {
        resultaat = await response.json();
      } catch {
        throw new Error(
          "De server heeft geen geldig JSON-antwoord teruggegeven."
        );
      }

      console.log(
        "Spoorzoeken: resultaat antwoordcontrole",
        resultaat
      );

      if (!response.ok || !resultaat.ok) {
        if (resultaat.code === "wrong_answer") {
          toonFoutmelding();
        } else if (resultaat.code === "puzzle_not_configured") {
          toonFoutmelding(
            "Deze puzzel is nog niet goed ingesteld op de server."
          );
        } else if (resultaat.code === "configuration_error") {
          toonFoutmelding(
            "Er is een probleem met de serverinstellingen. " +
            "Probeer het later opnieuw."
          );
        } else {
          toonFoutmelding(
            "De antwoordcontrole is momenteel niet beschikbaar. " +
            "Servermelding: " +
            (resultaat.code || "onbekende fout") +
            ". Probeer het opnieuw."
          );
        }

        return;
      }

      antwoordveld.value = "";

      if (resultaat.nextPage) {
        window.location.href = resultaat.nextPage;
        return;
      }

      if (resultaat.completed && succesmelding) {
        succesmelding.textContent =
          "Uitstekend! Je hebt de laatste puzzel opgelost. De reis is voltooid.";

        succesmelding.classList.remove("hidden");

        succesmelding.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }

    } catch (error) {
      console.error("Spoorzoeken:", error);

      toonFoutmelding(
        "De antwoordcontrole kon niet worden uitgevoerd. " +
        "Controleer je verbinding en probeer het opnieuw."
      );

    } finally {
      if (verzendKnop) {
        verzendKnop.disabled = false;
      }
    }
  }

  /* ---------------------------------------------------------
     PUZZEL 1: LABEL OPENEN
     --------------------------------------------------------- */

  function openLabel() {
    openLightbox("Puzzel%201b.png", "Het label aan de koffer");
  }

  /* ---------------------------------------------------------
     PUZZEL 5: AFBEELDING VERGROTEN
     --------------------------------------------------------- */

  function openPuzzel5Afbeelding() {
    openLightbox(
      "Puzzel%205.png",
      "De haven van San Sebastián"
    );
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

  function maakAanwijzingsknop(cijfer, richting, nummer) {
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

  if (puzzel5Afbeelding) {
    puzzel5Afbeelding.addEventListener(
      "click",
      openPuzzel5Afbeelding
    );

    voegToetsbedieningToe(
      puzzel5Afbeelding,
      openPuzzel5Afbeelding
    );
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
