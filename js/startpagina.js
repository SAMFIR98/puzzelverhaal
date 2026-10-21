
/* =========================================================
   SPOORZOEKEN — STARTPAGINA
   Keuze van het startpunt en navigatie naar puzzels

   Puzzel 1 = begin van het verhaal.
   Een latere puzzelkeuze = laatst opgeloste puzzel.
   Het juiste antwoord brengt je naar de volgende puzzel.
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

    melding.textContent = "";
    vorigAntwoordVeld.value = "";

    if (gekozenNummer === 1) {
      vorigAntwoordWrap.classList.add("hidden");
      startKnop.textContent = "Reis beginnen";
    } else {
      vorigAntwoordWrap.classList.remove("hidden");
      startKnop.textContent = "Antwoord controleren";
    }

    const gekozenPuzzel = haalPuzzelOp(gekozenNummer);

    if (gekozenNummer > 1 && gekozenPuzzel) {
      const label = vorigAntwoordWrap.querySelector("label");

      if (label) {
        label.textContent =
          "Wat was het antwoord op puzzel " + gekozenNummer + "?";
      }

      vorigAntwoordVeld.placeholder =
        "Antwoord van puzzel " + gekozenNummer;
    }
  }

  function beginReis() {
    const gekozenNummer = Number(startKeuze.value);
    const gekozenPuzzel = haalPuzzelOp(gekozenNummer);

    melding.textContent = "";

    if (!gekozenPuzzel) {
      melding.textContent = "Dit startpunt is nog niet beschikbaar.";
      return;
    }

    // Puzzel 1 is het beginpunt: geen antwoord nodig.
    if (gekozenNummer === 1) {
      window.location.href = gekozenPuzzel.pagina;
      return;
    }

    // Controleer het antwoord van de gekozen puzzel.
    if (!controleerAntwoord(gekozenNummer, vorigAntwoordVeld.value)) {
      melding.textContent =
        "Dat antwoord klopt niet. Controleer je antwoord op puzzel " +
        gekozenNummer + ".";
      return;
    }

    // Bij een correct antwoord ga je naar de volgende puzzel.
    const volgendePuzzel = haalVolgendePuzzelOp(gekozenNummer);

    if (!volgendePuzzel) {
      melding.textContent =
        "Er is nog geen volgende puzzel beschikbaar.";
      return;
    }

    window.location.href = volgendePuzzel.pagina;
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
