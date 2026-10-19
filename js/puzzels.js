
/* =========================================================
   SPOORZOEKEN — PUZZELGEGEVENS
   Centrale registratie van de puzzels
   ========================================================= */

const puzzels = {
  1: {
    nummer: 1,
    titel: "Het achtergelaten spoor",
    pagina: "puzzel-1.html",
    antwoord: null,
    vorigePuzzel: null,
    volgendePuzzel: 2
  },

  2: {
    nummer: 2,
    titel: "Een onverwachte bestemming",
    pagina: "puzzel-2.html",
    antwoord: "bordeaux",
    vorigePuzzel: 1,
    volgendePuzzel: null
  }
};

/**
 * Geeft de gegevens van een puzzel terug.
 */
function haalPuzzelOp(nummer) {
  return puzzels[Number(nummer)] ?? null;
}

/**
 * Controleert of een antwoord overeenkomt met het juiste antwoord.
 * Hoofdletters en spaties aan begin en einde tellen niet mee.
 */
function controleerAntwoord(nummer, gegevenAntwoord) {
  const puzzel = haalPuzzelOp(nummer);

  if (!puzzel || puzzel.antwoord === null) {
    return false;
  }

  return (
    normaliseerAntwoord(gegevenAntwoord) ===
    normaliseerAntwoord(puzzel.antwoord)
  );
}

/**
 * Geeft de volgende puzzel terug, indien bekend.
 */
function haalVolgendePuzzelOp(nummer) {
  const puzzel = haalPuzzelOp(nummer);

  if (!puzzel || puzzel.volgendePuzzel === null) {
    return null;
  }

  return haalPuzzelOp(puzzel.volgendePuzzel);
}
