
(() => {
  "use strict";

  const config = window.RADIO_CONFIG;

  if (!config) {
    console.error("De radio-configuratie kon niet worden geladen.");
    return;
  }

  const track = document.getElementById("dial-track");
  const pointer = document.getElementById("dial-pointer");
  const knob = document.getElementById("tuning-knob");
  const marker = knob.querySelector(".knob-marker");
  const numbers = document.getElementById("dial-numbers");
  const ticks = document.getElementById("dial-ticks");

  const valueOutput = document.getElementById("frequency-value");
  const stationOutput = document.getElementById("station-status");
  const playButton = document.getElementById("play-toggle");
  const audio = document.getElementById("radio-audio");

  const range = config.maxWavelength - config.minWavelength;

  let wavelength = clamp(
    config.initialWavelength,
    config.minWavelength,
    config.maxWavelength
  );

  let activeStation = null;
  let dragMode = null;
  let knobStartAngle = 0;
  let knobStartValue = wavelength;

  // Houdt bij welk geluid momenteel actief is.
  let audioMode = null;
  let stationHasPlayed = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function toPercent(value) {
    return ((value - config.minWavelength) / range) * 100;
  }

  function valueFromPointer(event) {
    const rect = track.getBoundingClientRect();

    const pct = clamp(
      (event.clientX - rect.left) / rect.width,
      0,
      1
    );

    return config.minWavelength + pct * range;
  }

  // Stop het huidige geluid en zet het terug naar het begin.
  function stopAudio() {
    audio.pause();

    try {
      audio.currentTime = 0;
    } catch (error) {
      // Het bestand kan nog aan het laden zijn.
    }

    audio.removeAttribute("src");
    audio.load();

    audioMode = null;
  }

  // Start de radio-ruis. Deze blijft eindeloos herhalen.
  function startNoise() {
    if (!config.noiseAudio) return;

    if (audioMode === "noise") return;

    stopAudio();

    audioMode = "noise";
    audio.loop = true;
    audio.src = config.noiseAudio;
    audio.load();

    audio.play().catch(() => {
      // Browsers kunnen automatisch geluid blokkeren.
      // Bij de volgende gebruikersinteractie proberen we opnieuw.
      audioMode = null;
    });
  }

  // Start een gerichte uitzending één keer.
  function startStation(station) {
    if (!station || !station.audio) return;

    stopAudio();

    audioMode = "station";
    audio.loop = false;
    stationHasPlayed = false;

    playButton.disabled = false;
    playButton.textContent = "▶ Uitzending beluisteren";

    audio.src = station.audio;
    audio.load();

    audio.play().catch(() => {
      stationOutput.textContent =
        `${station.title} · druk op beluisteren om te starten`;
    });
  }

  function setWavelength(value) {
    wavelength = Math.round(
      clamp(value, config.minWavelength, config.maxWavelength)
    );

    const pct = toPercent(wavelength);

    pointer.style.left = `${pct}%`;

    pointer.setAttribute("aria-valuenow", wavelength);
    knob.setAttribute("aria-valuenow", wavelength);

    // De linker draaiknop maakt één volledige omwenteling.
    const radius = knob.clientWidth * 0.40;

    marker.style.left = "50%";
    marker.style.top = "50%";

    marker.style.transform =
      `translate(-50%, -50%) rotate(${pct * 3.6}deg) translateY(-${radius}px)`;

    valueOutput.textContent = `${wavelength} meter`;

    selectStation();
  }

  function selectStation() {
    const previousStation = activeStation;

    activeStation =
      config.stations.find(station =>
        Math.abs(station.wavelength - wavelength) <=
        (station.tolerance ?? 0)
      ) || null;

    // Geen gerichte uitzending gevonden: ruis aan.
    if (!activeStation) {
      if (previousStation) {
        stationHasPlayed = false;
      }

      stationOutput.textContent = "Ruis op de ether…";

      playButton.disabled = true;
      playButton.textContent = "Geen uitzending geselecteerd";

      startNoise();
      return;
    }

    // We zijn op een andere gerichte uitzending afgestemd.
    if (activeStation !== previousStation) {
      stationHasPlayed = false;
      startStation(activeStation);
    }

    stationOutput.textContent = activeStation.title;

    if (stationHasPlayed && audio.ended) {
      playButton.disabled = true;
      playButton.textContent = "Uitzending afgelopen";
    } else {
      playButton.disabled = false;

      if (audioMode === "station" && !audio.paused) {
        playButton.textContent = "Ⅱ Pauzeren";
      } else {
        playButton.textContent = "▶ Uitzending beluisteren";
      }
    }
  }

  // Hoek van de linker draaiknop bepalen.
  function angleAt(event) {
    const rect = knob.getBoundingClientRect();

    return Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2)
    ) * 180 / Math.PI;
  }

  function beginKnobDrag(event) {
    dragMode = "knob";

    knobStartAngle = angleAt(event);
    knobStartValue = wavelength;

    knob.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveKnob(event) {
    if (dragMode !== "knob") return;

    let delta = angleAt(event) - knobStartAngle;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    setWavelength(
      knobStartValue + delta / 360 * range
    );
  }

  function beginScaleDrag(event) {
    dragMode = "scale";

    track.setPointerCapture(event.pointerId);
    setWavelength(valueFromPointer(event));

    event.preventDefault();
  }

  function moveScale(event) {
    if (dragMode !== "scale") return;

    setWavelength(valueFromPointer(event));
  }

  function stopDrag() {
    dragMode = null;
  }

  // Bediening via de afstemschaal.
  track.addEventListener("pointerdown", beginScaleDrag);
  track.addEventListener("pointermove", moveScale);
  track.addEventListener("pointerup", stopDrag);
  track.addEventListener("pointercancel", stopDrag);

  // Bediening via de linker draaiknop.
  knob.addEventListener("pointerdown", beginKnobDrag);
  knob.addEventListener("pointermove", moveKnob);
  knob.addEventListener("pointerup", stopDrag);
  knob.addEventListener("pointercancel", stopDrag);

  // Toetsenbordbediening.
  function handleArrowKeys(event) {
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      setWavelength(wavelength - config.tuningStep);
    }

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      setWavelength(wavelength + config.tuningStep);
    }

    if (event.key === "Home") {
      event.preventDefault();
      setWavelength(config.minWavelength);
    }

    if (event.key === "End") {
      event.preventDefault();
      setWavelength(config.maxWavelength);
    }
  }

  pointer.addEventListener("keydown", handleArrowKeys);
  knob.addEventListener("keydown", handleArrowKeys);

  // Handmatig starten of pauzeren van een gerichte uitzending.
  playButton.addEventListener("click", () => {
    if (!activeStation || !activeStation.audio) return;

    if (audioMode !== "station") {
      startStation(activeStation);
      return;
    }

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (audio.ended) return;

    audio.play().catch(() => {
      stationOutput.textContent =
        "Het geluidsbestand kon niet worden afgespeeld.";
    });
  });

  // Audio gestart.
  audio.addEventListener("play", () => {
    if (audioMode === "station") {
      stationHasPlayed = true;
      playButton.disabled = false;
      playButton.textContent = "Ⅱ Pauzeren";
    }
  });

  // Gerichte uitzending afgelopen.
  audio.addEventListener("ended", () => {
    if (audioMode !== "station") return;

    playButton.disabled = true;
    playButton.textContent = "Uitzending afgelopen";

    stationOutput.textContent =
      `${activeStation.title} · uitzending afgelopen`;
  });

  // Fout bij laden of afspelen.
  audio.addEventListener("error", () => {
    if (audioMode === "noise") {
      audioMode = null;
      return;
    }

    if (!activeStation) return;

    stationOutput.textContent =
      "Het geluidsbestand kon niet worden geladen.";

    playButton.disabled = false;
    playButton.textContent = "Opnieuw proberen";
  });

  // Bedieningsknoppen.
  document
    .getElementById("tune-down")
    .addEventListener("click", () => {
      setWavelength(wavelength - config.tuningStep);
    });

  document
    .getElementById("tune-up")
    .addEventListener("click", () => {
      setWavelength(wavelength + config.tuningStep);
    });

  // Terug naar de startpagina.
  document
    .getElementById("home-button")
    .addEventListener("click", () => {
      window.location.href = "../index.html";
    });

  // Opstarten.
  audio.loop = true;
  drawScale();
  setWavelength(wavelength);

  function drawScale() {
    numbers.innerHTML = "";
    ticks.innerHTML = "";

    const count = config.numberOfMajorMarks;

    for (let i = 0; i < count; i++) {
      const val =
        config.minWavelength +
        (range * i / (count - 1));

      const label = document.createElement("span");
      label.textContent = Math.round(val);
      numbers.appendChild(label);

      const major = document.createElement("i");
      major.className = "dial-tick";
      major.style.left = `${i / (count - 1) * 100}%`;
      ticks.appendChild(major);

      if (i < count - 1) {
        for (
          let j = 1;
          j <= config.fineTicksBetweenMajorMarks;
          j++
        ) {
          const minor = document.createElement("i");
          minor.className = "dial-tick minor";

          minor.style.left =
            `${(i + j / (config.fineTicksBetweenMajorMarks + 1)) / (count - 1) * 100}%`;

          ticks.appendChild(minor);
        }
      }
    }
  }

})();
