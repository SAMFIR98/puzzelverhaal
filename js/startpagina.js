/* =========================================================
   SPOORZOEKEN — STARTPAGINA
   Keuze van het startpunt en navigatie naar puzzels

   De keuzelijst wordt automatisch opgebouwd vanuit puzzels.js.
   Een latere puzzelkeuze betekent: laatst opgeloste puzzel.
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

  /**
   * Bouwt de keuzelijst op uit de centrale puzzelgegevens.
   * Puzzel 1 is het beginpunt; latere keuzes zijn laatst opgeloste puzzels.
   */
  function bouwStartkeuzeOp() {
    const huidigNummer = Number(startKeuze.value) || 1;
    startKeuze.replaceChildren();

    Object.values(puzzels)
      .filter(function (puzzel) {
        // Alleen puzzels tonen waarvan een volgende pagina bestaat.
        return puzzel.volgendePuzzel !== null;
      })
      .sort(function (a, b) {
        return a.nummer - b.nummer;
      })
      .forEach(function (puzzel) {
        const optie = document.createElement("option");
        optie.value = String(puzzel.nummer);
        optie.textContent =
          "Puzzel " + puzzel.nummer + " – " + puzzel.titel;
        startKeuze.appendChild(optie);
      });

    if ([...startKeuze.options].some(function (optie) {
      return Number(optie.value) === huidigNummer;
    })) {
      startKeuze.value = String(huidigNummer);
    } else {
      startKeuze.value = "1";
    }
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

    // Controleer het antwoord van de laatst opgeloste puzzel.
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

  bouwStartkeuzeOp();

  startKeuze.addEventListener("change", werkStartformulierBij);
  startKnop.addEventListener("click", beginReis);

  vorigAntwoordVeld.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      beginReis();
    }
  });

  werkStartformulierBij();
});
