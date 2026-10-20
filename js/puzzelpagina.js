
/* =========================================================
   SPOORZOEKEN — GEDEELDE PUZZELPAGINA-FUNCTIES
   Antwoordcontrole, foutmelding en afbeeldingen
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const formulier = document.getElementById("answer-form");
  const antwoordveld = document.getElementById("answer");
  const foutmelding = document.getElementById("error-overlay");
  const foutSluiten = document.getElementById("error-close");
  const startKnop = document.getElementById("home-button");
  const puzzelAfbeelding = document.getElementById("puzzle1-image");

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

    const gegevenAntwoord = antwoordveld.value;

    if (controleerAntwoord(1, gegevenAntwoord)) {
      window.location.href = haalVolgendePuzzelOp(1).pagina;
    } else {
      toonFoutmelding();
    }
  }

  function openLabel() {
    openLightbox("Puzzel%201b.png", "Het label aan de koffer");
  }

  if (formulier && antwoordveld) {
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

  if (puzzelAfbeelding) {
    puzzelAfbeelding.addEventListener("click", openLabel);

    puzzelAfbeelding.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLabel();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      sluitFoutmelding();
    }
  });
});
