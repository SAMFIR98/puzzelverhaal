
/* =========================================================
   SPOORZOEKEN — ALGEMENE JAVASCRIPT
   Gedeelde functies voor alle puzzelpagina's
   ========================================================= */

/**
 * Normaliseert een antwoord:
 * - verwijdert spaties aan begin en einde
 * - maakt hoofdletters kleine letters
 * - normaliseert speciale tekens
 */
function normaliseerAntwoord(antwoord) {
  return String(antwoord ?? "")
    .trim()
    .toLocaleLowerCase("nl-NL")
    .normalize("NFC");
}

/**
 * Geeft een element terug als het bestaat.
 * Zo kan dit bestand op verschillende pagina's worden gebruikt,
 * ook als niet elke pagina dezelfde elementen bevat.
 */
function vindElement(id) {
  return document.getElementById(id);
}

/**
 * Toont een melding in een bestaand element.
 */
function toonMelding(elementId, tekst) {
  const element = vindElement(elementId);

  if (element) {
    element.textContent = tekst;
    element.hidden = false;
  }
}

/**
 * Verbergt een melding als die op de pagina aanwezig is.
 */
function verbergMelding(elementId) {
  const element = vindElement(elementId);

  if (element) {
    element.hidden = true;
    element.textContent = "";
  }
}

/**
 * Opent een afbeelding in de gedeelde lightbox.
 * De lightbox-elementen moeten op de betreffende pagina aanwezig zijn.
 */
function openLightbox(afbeeldingUrl, beschrijving = "") {
  const lightbox = vindElement("lightbox");
  const lightboxAfbeelding = vindElement("lightboxImage");

  if (!lightbox || !lightboxAfbeelding) {
    return;
  }

  lightboxAfbeelding.src = afbeeldingUrl;
  lightboxAfbeelding.alt = beschrijving;
  lightbox.classList.add("visible");
  lightbox.setAttribute("aria-hidden", "false");
}

/**
 * Sluit de gedeelde lightbox.
 */
function sluitLightbox() {
  const lightbox = vindElement("lightbox");

  if (!lightbox) {
    return;
  }

  lightbox.classList.remove("visible");
  lightbox.setAttribute("aria-hidden", "true");
}

/**
 * Sluit de lightbox met Escape.
 */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    sluitLightbox();
  }
});
