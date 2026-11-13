
/* ==========================================================
   SPOORZOEKEN — RADIOCONFIGURATIE
   ========================================================== */

window.RADIO_CONFIG = {

  minWavelength: 200,
  maxWavelength: 1000,

  initialWavelength: 600,

  numberOfMajorMarks: 9,
  fineTicksBetweenMajorMarks: 4,

  tuningStep: 5,

  // Standaardgeluid wanneer er geen zender wordt ontvangen.
  noiseAudio: "ruis.mp3",

  // Gerichte uitzendingen.
  stations: [

    {
      wavelength: 600,
      title: "In Moeders Keuken",
      audio: "In%20Moeders%20Keuken.mp3",
      tolerance: 0
    }

    // Nieuwe uitzendingen kun je hier toevoegen:
    //
    // {
    //   wavelength: 425,
    //   title: "Avondconcert",
    //   audio: "audio/avondconcert.mp3",
    //   tolerance: 0
    // }

  ]

};
