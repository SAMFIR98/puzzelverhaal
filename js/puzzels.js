/* =========================================================
   SPOORZOEKEN — CENTRALE PUZZELGEGEVENS
   Alle puzzels, antwoorden en paginaverwijzingen
   ========================================================= */

const puzzels = {
  1: {
    nummer: 1,
    titel: "Het achtergelaten spoor",
    pagina: "puzzel-1.html",
    antwoord: "bordeaux",
    vorigePuzzel: null,
    volgendePuzzel: 2
  },

  2: {
    nummer: 2,
    titel: "Een onverwachte bestemming",
    pagina: "puzzel-2.html",
    antwoord: "girondins",
    vorigePuzzel: 1,
    volgendePuzzel: 3
  },

  3: {
    nummer: 3,
    titel: "Het volgende spoor",
    pagina: "puzzel-3.html",
    antwoord: "chanel",
    vorigePuzzel: 2,
    volgendePuzzel: 4
  },

  4: {
    nummer: 4,
    titel: "Tijdelijke puzzelpagina",
    pagina: "puzzel-4.html",
    antwoord: "",
    vorigePuzzel: 3,
    volgendePuzzel: null
  }
};

/**
 * Haalt de gegevens van een puzzel op.
 */
function haalPuzzelOp(nummer) {
  return puzzels[Number(nummer)] ?? null;
}

/**
 * Normaliseert een antwoord.
 * Hoofdletters en spaties aan begin en einde tellen niet mee.
 */
function normaliseerAntwoord(antwoord) {
  return String(antwoord ?? "").trim().toLowerCase();
}

/**
 * Controleert een antwoord.
 */
function controleerAntwoord(nummer, gegevenAntwoord) {
  const puzzel = haalPuzzelOp(nummer);

  if (!puzzel || !puzzel.antwoord) {
    return false;
  }

  return (
    normaliseerAntwoord(gegevenAntwoord) ===
    normaliseerAntwoord(puzzel.antwoord)
  );
}

/**
 * Haalt de volgende puzzel op, indien die bestaat.
 */
function haalVolgendePuzzelOp(nummer) {
  const puzzel = haalPuzzelOp(nummer);

  if (!puzzel || puzzel.volgendePuzzel === null) {
    return null;
  }

  return haalPuzzelOp(puzzel.volgendePuzzel);
}
