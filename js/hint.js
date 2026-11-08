
/* =========================================================
   SPOORZOEKEN — HINTSYSTEEM
   Interactief treinkaartje met bevestiging en timer
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const kaartje = document.getElementById("hint-ticket");
  const hintTekstElement = document.getElementById("hint-text");
  const bevestiging = document.getElementById("hint-confirm");
  const jaKnop = document.getElementById("hint-yes");
  const neeKnop = document.getElementById("hint-no");

  // Als deze puzzelpagina geen hintkaartje bevat, stoppen.
  if (
    !kaartje ||
    !hintTekstElement ||
    !bevestiging ||
    !jaKnop ||
    !neeKnop
  ) {
    return;
  }

  const puzzelNummer = Number(kaartje.dataset.puzzleNumber);

  // Haal de bijbehorende hint op uit puzzels.js.
  const puzzel =
    typeof puzzels !== "undefined"
      ? haalPuzzelOp(puzzelNummer)
      : null;

  const hintTekst = puzzel && puzzel.hint
    ? puzzel.hint
    : "Voor deze puzzel is nog geen hint beschikbaar.";

  const FLIP_DUUR = 700;
  const HINT_DUUR = 20000;

  let omgedraaid = false;
  let bezigMetDraaien = false;
  let terugTimer = null;

  // Toon de bevestigingsvraag.
  function openBevestiging() {
    bevestiging.hidden = false;
    bevestiging.setAttribute("aria-hidden", "false");
    jaKnop.focus();
  }

  // Sluit de bevestigingsvraag.
  function sluitBevestiging() {
    bevestiging.hidden = true;
    bevestiging.setAttribute("aria-hidden", "true");
    kaartje.focus();
  }

  // Draai het kaartje naar de achterkant.
  function draaiNaarAchterkant() {
    if (bezigMetDraaien || omgedraaid) {
      return;
    }

    hintTekstElement.textContent = hintTekst;

    sluitBevestiging();

    bezigMetDraaien = true;
    omgedraaid = true;

    kaartje.classList.add("is-flipped");

    kaartje.setAttribute(
      "aria-label",
      "Hint zichtbaar. Klik om terug te draaien."
    );

    // De timer begint pas nadat de animatie klaar is.
    setTimeout(function () {

      bezigMetDraaien = false;

      terugTimer = setTimeout(function () {
        draaiNaarVoorkant();
      }, HINT_DUUR);

    }, FLIP_DUUR);
  }

  // Draai het kaartje terug naar de voorkant.
  function draaiNaarVoorkant() {
    if (!omgedraaid || bezigMetDraaien) {
      return;
    }

    clearTimeout(terugTimer);

    bezigMetDraaien = true;
    omgedraaid = false;

    kaartje.classList.remove("is-flipped");

    kaartje.setAttribute(
      "aria-label",
      "Hint bekijken"
    );

    setTimeout(function () {
      bezigMetDraaien = false;
    }, FLIP_DUUR);
  }

  // Klik op het kaartje.
  kaartje.addEventListener("click", function () {

    if (bezigMetDraaien) {
      return;
    }

    if (omgedraaid) {
      draaiNaarVoorkant();
    } else {
      openBevestiging();
    }

  });

  // Ja: toon de hint.
  jaKnop.addEventListener("click", function () {
    draaiNaarAchterkant();
  });

  // Nee: sluit de bevestigingsvraag.
  neeKnop.addEventListener("click", function () {
    sluitBevestiging();
  });

  // Klik buiten het bevestigingsvenster sluit het venster.
  bevestiging.addEventListener("click", function (event) {

    if (event.target === bevestiging) {
      sluitBevestiging();
    }

  });

  // Escape sluit de bevestigingsvraag.
  document.addEventListener("keydown", function (event) {

    if (
      event.key === "Escape" &&
      !bevestiging.hidden
    ) {
      sluitBevestiging();
    }

  });

});
