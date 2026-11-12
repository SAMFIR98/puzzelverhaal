/* ==========================================================
   SPOORZOEKEN — RADIOCONFIGURATIE

   Hier beheer je de afstemrange en de uitzendingen.
   Voeg later per uitzending een frequentie (in meters), titel
   en audiobestand toe. Gebruik paden relatief aan puzzel-x.html.

   Voorbeeld:
   { wavelength: 425, title: "Avondconcert", audio: "audio/avondconcert.mp3" }
   ========================================================== */
window.RADIO_CONFIG = {
  minWavelength: 200,
  maxWavelength: 1000,
  initialWavelength: 600,
  numberOfMajorMarks: 9,
  fineTicksBetweenMajorMarks: 4,
  tuningStep: 5,
  stations: [
    // Voeg uitzendingen hieronder toe. Frequenties zijn golflengtes in meters.
    // { wavelength: 425, title: "Avondconcert", audio: "audio/avondconcert.mp3" },
    // { wavelength: 710, title: "Nieuwsbericht", audio: "audio/nieuwsbericht.mp3" }
  ]
};
