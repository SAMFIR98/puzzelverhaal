
/* =========================================================
   SPOORZOEKEN — STARTPAGINA
   Keuze van het startpunt en navigatie naar puzzels
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const startKeuze = document.getElementById("start-puzzle");
  const vorigAntwoordVeld = document.getElementById("previous-answer");
  const vorigAntwoordWrap = document.getElementById("previous-answer-wrap");
  const startKnop = document.getElementById("start-button");
  const melding = document.getElementById("access-message");

  if (
    !startKeuze ||
    !vorigAntwoordVeld ||
    !vorigAntwoordWrap ||
    !startKnop ||
    !melding
  ) {
    return;
  }

  function werkStartformulierBij() {
    const gekozenNummer = Number(startKeuze.value);
    const puzzel = haalPuzzelOp(gekozenNummer);

    melding.textContent = "";
    vorigAntwoordVeld.value = "";

    if (puzzel && puzzel.vorigePuzzel !== null) {
      vorigAntwoordWrap.classList.remove("hidden");
    } else {
      vorigAntwoordWrap.classList.add("hidden");
    }
  }

  function beginReis() {
    const gekozenNummer = Number(startKeuze.value);
    const puzzel = haalPuzzelOp(gekozenNummer);

    melding.textContent = "";

    if (!puzzel) {
      melding.textContent = "Dit startpunt is nog niet beschikbaar.";
      return;
    }

    if (puzzel.vorigePuzzel !== null) {
      const vorigAntwoord = vorigAntwoordVeld.value;
      const vorigePuzzel = haalPuzzelOp(puzzel.vorigePuzzel);

      if (
        !vorigePuzzel ||
        !vorigePuzzel.antwoord ||
        normaliseerAntwoord(vorigAntwoord) !==
          normaliseerAntwoord(vorigePuzzel.antwoord)
      ) {
        melding.textContent =
          "Dat antwoord klopt niet. Los eerst de vorige puzzel op.";
        return;
      }
    }

    window.location.href = puzzel.pagina;
  }

  startKeuze.addEventListener("change", werkStartformulierBij);
  startKnop.addEventListener("click", beginReis);

  vorigAntwoordVeld.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      beginReis();
    }
  });

  werkStartformulierBij();
});
