(() => {
  "use strict";
  const config = window.RADIO_CONFIG;
  const stage = document.getElementById("radio-stage");
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
  let wavelength = clamp(config.initialWavelength, config.minWavelength, config.maxWavelength);
  let activeStation = null;
  let dragMode = null;
  let knobStartAngle = 0;
  let knobStartValue = wavelength;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function toPercent(v) { return ((v - config.minWavelength) / range) * 100; }
  function valueFromPointer(event) {
    const rect = track.getBoundingClientRect();
    const pct = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    return config.minWavelength + pct * range;
  }
  function setWavelength(value) {
    wavelength = Math.round(clamp(value, config.minWavelength, config.maxWavelength));
    const pct = toPercent(wavelength);
    pointer.style.left = `${pct}%`;
    pointer.setAttribute("aria-valuenow", wavelength);
    knob.setAttribute("aria-valuenow", wavelength);
    // De linkerknop maakt één volledige omwenteling over het hele bereik.
    marker.style.top = "50%";
    marker.style.left = "50%";
    marker.style.transform = `translate(-50%,-50%) rotate(${pct * 3.6}deg) translateY(-${knob.clientWidth * .36}px)`;
    valueOutput.textContent = `${wavelength} meter`;
    selectStation();
  }
  function drawScale() {
    numbers.innerHTML = "";
    ticks.innerHTML = "";
    const count = config.numberOfMajorMarks;
    for (let i = 0; i < count; i++) {
      const val = config.minWavelength + (range * i / (count - 1));
      const label = document.createElement("span");
      label.textContent = Math.round(val);
      numbers.appendChild(label);
      const major = document.createElement("i");
      major.className = "dial-tick";
      major.style.left = `${i / (count - 1) * 100}%`;
      ticks.appendChild(major);
      if (i < count - 1) {
        for (let j = 1; j <= config.fineTicksBetweenMajorMarks; j++) {
          const minor = document.createElement("i");
          minor.className = "dial-tick minor";
          minor.style.left = `${(i + j / (config.fineTicksBetweenMajorMarks + 1)) / (count - 1) * 100}%`;
          ticks.appendChild(minor);
        }
      }
    }
  }
  function selectStation() {
    activeStation = config.stations.find(s => Math.abs(s.wavelength - wavelength) <= (s.tolerance ?? 4)) || null;
    if (activeStation) {
      stationOutput.textContent = activeStation.title || "Uitzending gevonden";
      playButton.disabled = !activeStation.audio;
      playButton.textContent = activeStation.audio ? "▶ Uitzending beluisteren" : "Audio volgt later";
    } else {
      stationOutput.textContent = "Ruis op de ether…";
      playButton.disabled = true;
      playButton.textContent = "Geen uitzending geselecteerd";
      if (!audio.paused) audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }
  function angleAt(event) {
    const rect = knob.getBoundingClientRect();
    return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
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
    setWavelength(knobStartValue + delta / 360 * range);
  }
  function beginScaleDrag(event) {
    dragMode = "scale";
    track.setPointerCapture(event.pointerId);
    setWavelength(valueFromPointer(event));
    event.preventDefault();
  }
  track.addEventListener("pointerdown", beginScaleDrag);
  track.addEventListener("pointermove", event => { if (dragMode === "scale") setWavelength(valueFromPointer(event)); });
  knob.addEventListener("pointerdown", beginKnobDrag);
  knob.addEventListener("pointermove", moveKnob);
  document.addEventListener("pointerup", () => { dragMode = null; });
  pointer.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); setWavelength(wavelength - config.tuningStep); }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); setWavelength(wavelength + config.tuningStep); }
    if (event.key === "Home") setWavelength(config.minWavelength);
    if (event.key === "End") setWavelength(config.maxWavelength);
  });
  knob.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); setWavelength(wavelength - config.tuningStep); }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); setWavelength(wavelength + config.tuningStep); }
  });
  document.getElementById("tune-down").addEventListener("click", () => setWavelength(wavelength - config.tuningStep));
  document.getElementById("tune-up").addEventListener("click", () => setWavelength(wavelength + config.tuningStep));
  playButton.addEventListener("click", () => {
    if (!activeStation?.audio) return;
    if (audio.src.endsWith(activeStation.audio) && !audio.paused) audio.pause();
    else { audio.src = activeStation.audio; audio.play().catch(() => { stationOutput.textContent = "Het geluidsbestand kon niet worden afgespeeld."; }); }
  });
  audio.addEventListener("play", () => { playButton.textContent = "Ⅱ Pauzeren"; });
  audio.addEventListener("pause", () => { if (activeStation?.audio) playButton.textContent = "▶ Uitzending beluisteren"; });
  document.getElementById("home-button").addEventListener("click", () => { window.location.href = "index.html"; });

  drawScale();
  setWavelength(wavelength);
})();
