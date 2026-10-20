
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
 * Sluit de lightbox wanneer buiten de afbeelding wordt geklikt.
 */
document.addEventListener("DOMContentLoaded", function () {
  const lightbox = vindElement("lightbox");

  if (!lightbox) return;

  lightbox.addEventListener("click", function () {
    sluitLightbox();
  });
});

/**
 * Escape sluit de lightbox.
 */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    sluitLightbox();
  }
});
