
/* =========================================================
   SPOORZOEKEN — GEDEELDE PUZZELPAGINA-FUNCTIES
   Geschikt voor puzzel 1, puzzel 2 en volgende puzzels
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

  let toonTweedeAfbeelding = false;

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

  function controleerInvoer(event) {
    event.preventDefault();

    if (puzzelNummer === null || !antwoordveld) {
      return;
    }

    if (controleerAntwoord(puzzelNummer, antwoordveld.value)) {
      const volgendePuzzel = haalVolgendePuzzelOp(puzzelNummer);

      if (volgendePuzzel && volgendePuzzel.pagina) {
        window.location.href = volgendePuzzel.pagina;
        return;
      }

      // Alleen bij de laatste puzzel verschijnt de succesmelding.
      if (succesmelding) {
        antwoordveld.value = "";
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

  function openLabel() {
    openLightbox("Puzzel%201b.png", "Het label aan de koffer");
  }

  function wisselPuzzel2Afbeelding() {
    if (!puzzel2Afbeelding) return;

    const afbeeldingA = puzzel2Afbeelding.dataset.imageA;
    const afbeeldingB = puzzel2Afbeelding.dataset.imageB;

    if (!afbeeldingA || !afbeeldingB) return;

    if (toonTweedeAfbeelding) {
      puzzel2Afbeelding.src = afbeeldingA;
      puzzel2Afbeelding.alt = "Eerste afbeelding van puzzel 2";
    } else {
      puzzel2Afbeelding.src = afbeeldingB;
      puzzel2Afbeelding.alt = "Tweede afbeelding van puzzel 2";
    }

    toonTweedeAfbeelding = !toonTweedeAfbeelding;
  }

  function voegToetsbedieningToe(element, actie) {
    if (!element) return;

    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        actie();
      }
    });
  }

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
    puzzel2Afbeelding.addEventListener("click", wisselPuzzel2Afbeelding);
    voegToetsbedieningToe(
      puzzel2Afbeelding,
      wisselPuzzel2Afbeelding
    );
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      sluitFoutmelding();
      sluitLightbox();
    }
  });
});
