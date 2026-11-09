
/* =========================================================
   SPOORZOEKEN — PUZZELGEGEVENS
   Centrale gegevens voor alle puzzelpagina's
   ========================================================= */

const puzzels = {
    1: {
        nummer: 1,
        titel: "Het achtergelaten spoor",
        pagina: "puzzel-1.html",
        vorigePuzzel: null,
        volgendePuzzel: 2,
        hint: "An Marga heeft bij het inpakken van je koffer alles door elkaar gegooid."
    },

    2: {
        nummer: 2,
        titel: "Een onverwachte bestemming",
        pagina: "puzzel-2.html",
        vorigePuzzel: 1,
        volgendePuzzel: 3,
        hint: ""
    },

    3: {
        nummer: 3,
        titel: "Het volgende spoor",
        pagina: "puzzel-3.html",
        vorigePuzzel: 2,
        volgendePuzzel: 4,
        hint: ""
    },

    4: {
        nummer: 4,
        titel: "De grens",
        pagina: "puzzel-4.html",
        vorigePuzzel: 3,
        volgendePuzzel: 5,
        hint: ""
    },

    5: {
        nummer: 5,
        titel: "De angst in de haven",
        pagina: "puzzel-5.html",
        vorigePuzzel: 4,
        volgendePuzzel: 6,
        hint: ""
    },

    6: {
        nummer: 6,
        titel: "Een avond in Madrid",
        pagina: "puzzel-6.html",
        vorigePuzzel: 5,
        volgendePuzzel: 7,
        hint: ""
    },

    7: {
        nummer: 7,
        titel: "Verfdief",
        pagina: "puzzel-7.html",
        vorigePuzzel: 6,
        volgendePuzzel: 8,
        hint: ""
    },

    8: {
        nummer: 8,
        titel: "Leeslampje",
        pagina: "puzzel-8.html",
        vorigePuzzel: 7,
        volgendePuzzel: null,
        hint: ""
    }
};


// Haal een puzzel op aan de hand van het nummer
function haalPuzzelOp(nummer) {
    return puzzels[Number(nummer)] || null;
}


// Haal de volgende puzzel op
function haalVolgendePuzzelOp(nummer) {
    const puzzel = haalPuzzelOp(nummer);

    if (!puzzel || puzzel.volgendePuzzel === null) {
        return null;
    }

    return haalPuzzelOp(puzzel.volgendePuzzel);
}
