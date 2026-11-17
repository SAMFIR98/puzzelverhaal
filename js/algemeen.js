
/* =========================================================
   SPOORZOEKEN — ALGEMENE JAVASCRIPT
   Gedeelde functies voor alle pagina's
   ========================================================= */

function normaliseerAntwoord(antwoord) {
  return String(antwoord ?? "")
    .trim()
    .toLocaleLowerCase("nl-NL")
    .normalize("NFC");
}

function vindElement(id) {
  return document.getElementById(id);
}

/**
 * Open een afbeelding in de lightbox.
 */
function openLightbox(afbeeldingUrl, beschrijving = "") {
  const lightbox = vindElement("lightbox");
  const afbeelding = vindElement("lightbox-image");

  if (!lightbox || !afbeelding) return;

  afbeelding.src = afbeeldingUrl;
  afbeelding.alt = beschrijving;

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

/**
 * Sluit de lightbox.
 */
function sluitLightbox() {
  const lightbox = vindElement("lightbox");

  if (!lightbox) return;

  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

/**
 * Algemene initialisatie na het laden van de pagina.
 */
document.addEventListener("DOMContentLoaded", function () {

  // Terug naar de startpagina
  const homeButton = vindElement("home-button");

  if (homeButton) {
    homeButton.addEventListener("click", function () {
      window.location.href = "/";
    });
  }

  // Sluiten van de lightbox bij klikken buiten de afbeelding
  const lightbox = vindElement("lightbox");

  if (lightbox) {
    lightbox.addEventListener("click", function () {
      sluitLightbox();
    });
  }
});

/**
 * Escape sluit de lightbox.
 */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    sluitLightbox();
  }
});
