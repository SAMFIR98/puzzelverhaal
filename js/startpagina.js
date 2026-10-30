
/* =========================================================
   SPOORZOEKEN — STARTPAGINA
   Keuze van het startpunt en navigatie naar puzzels.

   Antwoorden worden gecontroleerd door Cloudflare.
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

  /* ---------------------------------------------------------
     STARTKEUZE OPBOUWEN
     --------------------------------------------------------- */

  function bouwStartkeuzeOp() {
    const huidigNummer = Number(startKeuze.value) || 1;

    startKeuze.replaceChildren();

    Object.values(puzzels)
      .filter(function (puzzel) {
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

  /* ---------------------------------------------------------
     FORMULIER BIJWERKEN
     --------------------------------------------------------- */

  function werkStartformulierBij() {
    const gekozenNummer = Number(startKeuze.value);

    melding.textContent = "";
    vorigAntwoordVeld.value = "";

    if (gekozenNummer === 1) {
      vorigAntwoordWrap.classList.add("hidden");
      startKnop.textContent = "Reis beginnen";
      return;
    }

    vorigAntwoordWrap.classList.remove("hidden");
    startKnop.textContent = "Antwoord controleren";

    const label = vorigAntwoordWrap.querySelector("label");

    if (label) {
      label.textContent =
        "Wat was het antwoord op puzzel " + gekozenNummer + "?";
    }

    vorigAntwoordVeld.placeholder =
      "Antwoord van puzzel " + gekozenNummer;
  }

  /* ---------------------------------------------------------
     ANTWOORD NAAR CLOUDFLARE STUREN
     --------------------------------------------------------- */

  async function controleerAntwoordOpServer(
    puzzelNummer,
    antwoord
  ) {
    const response = await fetch("/api/answer", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        puzzleNumber: puzzelNummer,
        answer: antwoord
      })
    });

    let resultaat;

    try {
      resultaat = await response.json();
    } catch {
      throw new Error("De server gaf geen geldig antwoord terug.");
    }

    if (!response.ok || !resultaat.ok) {
      if (resultaat.code === "wrong_answer") {
        return {
          ok: false,
          wrongAnswer: true
        };
      }

      throw new Error(
        "De antwoordcontrole is momenteel niet beschikbaar."
      );
    }

    return resultaat;
  }

  /* ---------------------------------------------------------
     REIS BEGINNEN
     --------------------------------------------------------- */

  async function beginReis() {
    const gekozenNummer = Number(startKeuze.value);
    const gekozenPuzzel = haalPuzzelOp(gekozenNummer);

    melding.textContent = "";

    if (!gekozenPuzzel) {
      melding.textContent =
        "Dit startpunt is nog niet beschikbaar.";
      return;
    }

    // Puzzel 1 is het beginpunt.
    if (gekozenNummer === 1) {
      window.location.href = gekozenPuzzel.pagina;
      return;
    }

    const antwoord = vorigAntwoordVeld.value.trim();

    if (!antwoord) {
      melding.textContent = "Vul eerst je antwoord in.";
      vorigAntwoordVeld.focus();
      return;
    }

    startKnop.disabled = true;

    try {
      const resultaat = await controleerAntwoordOpServer(
        gekozenNummer,
        antwoord
      );

      if (!resultaat.ok) {
        melding.textContent =
          "Dat antwoord klopt niet. Controleer je antwoord op puzzel " +
          gekozenNummer + ".";
        vorigAntwoordVeld.select();
        vorigAntwoordVeld.focus();
        return;
      }

      if (!resultaat.nextPage) {
        melding.textContent =
          "Er is nog geen volgende puzzel beschikbaar.";
        return;
      }

      window.location.href = resultaat.nextPage;

    } catch (error) {
      console.error("Spoorzoeken:", error);

      melding.textContent =
        "De antwoordcontrole is momenteel niet beschikbaar. " +
        "Controleer je verbinding en probeer het opnieuw.";

    } finally {
      startKnop.disabled = false;
    }
  }

  /* ---------------------------------------------------------
     EVENTLISTENERS
     --------------------------------------------------------- */

  bouwStartkeuzeOp();

  startKeuze.addEventListener("change", werkStartformulierBij);
  startKnop.addEventListener("click", beginReis);

  vorigAntwoordVeld.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      beginReis();
    }
  });

  werkStartformulierBij();

  // Melding na een poging om een beveiligde pagina rechtstreeks
  // te openen zonder dat deze is vrijgespeeld.
  const parameters = new URLSearchParams(window.location.search);
  const geblokkeerdePuzzel = Number(parameters.get("locked"));

  if (
    Number.isInteger(geblokkeerdePuzzel) &&
    geblokkeerdePuzzel > 1
  ) {
    melding.textContent =
      "Puzzel " + geblokkeerdePuzzel +
      " is nog niet vrijgespeeld. Los eerst de voorafgaande puzzel op.";
  }
});
