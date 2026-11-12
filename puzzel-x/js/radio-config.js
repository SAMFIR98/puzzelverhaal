
/* ==========================================================
   SPOORZOEKEN — RADIOCONFIGURATIE

   Hier beheer je de afstemrange en de uitzendingen.

   Per uitzending kun je instellen:
   - wavelength: golflengte in meters
   - title: titel die verschijnt bij het vinden van de zender
   - audio: pad naar het geluidsbestand
   - tolerance: toegestane afwijking in meters (optioneel)

   Gebruik paden relatief aan puzzel-x.html.

   Voorbeeld:
   {
     wavelength: 425,
     title: "Avondconcert",
     audio: "audio/avondconcert.mp3",
     tolerance: 4
   }
   ========================================================== */

window.RADIO_CONFIG = {

  minWavelength: 200,
  maxWavelength: 1000,

  initialWavelength: 600,

  numberOfMajorMarks: 9,
  fineTicksBetweenMajorMarks: 4,

  tuningStep: 5,

  stations: [

    // Voorbeeld:
    // {
    //   wavelength: 425,
    //   title: "Avondconcert",
    //   audio: "audio/avondconcert.mp3",
    //   tolerance: 4
    // },

    // {
    //   wavelength: 710,
    //   title: "Nieuwsbericht",
    //   audio: "audio/nieuwsbericht.mp3",
    //   tolerance: 4
    // }

  ]

};
