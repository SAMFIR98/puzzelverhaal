
/* =========================================================
   SPOORZOEKEN — CENTRALE PUZZELGEGEVENS
   Titels en paginaverwijzingen.
   Antwoorden worden uitsluitend op de server bewaard.
   ========================================================= */

const puzzels = {
  1: {
    nummer: 1,
    titel: "Het achtergelaten spoor",
    pagina: "puzzel-1.html",
    vorigePuzzel: null,
    volgendePuzzel: 2
  },

  2: {
    nummer: 2,
    titel: "Een onverwachte bestemming",
    pagina: "puzzel-2.html",
    vorigePuzzel: 1,
    volgendePuzzel: 3
  },

  3: {
    nummer: 3,
    titel: "Het volgende spoor",
    pagina: "puzzel-3.html",
    vorigePuzzel: 2,
    volgendePuzzel: 4
  },

  4: {
    nummer: 4,
    titel: "De grens",
    pagina: "puzzel-4.html",
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
 * Haalt de volgende puzzel op, indien die bestaat.
 */
function haalVolgendePuzzelOp(nummer) {
  const puzzel = haalPuzzelOp(nummer);

  if (!puzzel || puzzel.volgendePuzzel === null) {
    return null;
  }

  return haalPuzzelOp(puzzel.volgendePuzzel);
}
