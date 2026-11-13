window.RADIO_CONFIG = {
  minWavelength: 200,
  maxWavelength: 1000,

  // De radio start voortaan buiten een zendergebied.
  initialWavelength: 350,

  numberOfMajorMarks: 9,
  fineTicksBetweenMajorMarks: 4,
  tuningStep: 5,

  noiseAudio: "ruis.mp3",

  stations: [
    {
      wavelength: 600,
      title: "In Moeders Keuken",
      audio: "In%20Moeders%20Keuken.mp3",
      tolerance: 0
    }
  ]
};
