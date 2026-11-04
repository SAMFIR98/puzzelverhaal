/* SPOORZOEKEN — PUZZEL 7: VERFDIEF
   Weergave van het mozaïek en vrijspelen van de negen verftinten.
*/
document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("puzzle7-image");
  const list = document.getElementById("p7-paint-list");
  const progress = document.getElementById("p7-progress");
  const count = document.getElementById("p7-tile-count");
  if (!canvas || !list) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const neutral = "#77736c";
  const solved = new Set();
  let data;

  try {
    const response = await fetch("assets/puzzel7-mozaiek.json", { cache: "force-cache" });
    if (!response.ok) throw new Error("Mozaïekbestand kon niet worden geladen.");
    data = await response.json();
  } catch (error) {
    list.textContent = "Het mozaïek kan op dit moment niet worden geladen. Vernieuw de pagina om het opnieuw te proberen.";
    console.error(error);
    return;
  }

  count.textContent = data.tiles.length.toLocaleString("nl-NL") + " steentjes";

  function draw() {
    const scale = canvas.width / data.w;
    ctx.fillStyle = neutral;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const tile of data.tiles) {
      ctx.beginPath();
      tile.p.forEach((point, index) => {
        const x = point[0] * scale;
        const y = point[1] * scale;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = solved.has(tile.c) ? data.palette[tile.c] : neutral;
      ctx.fill();
      ctx.strokeStyle = "#514d47";
      ctx.lineWidth = Math.max(0.35, 0.55 * scale);
      ctx.stroke();
    }
  }

  function updateProgress() {
    progress.textContent = `${solved.size} van ${data.palette.length} kleuren vrijgespeeld`;
  }

  function buildPalette() {
    data.palette.forEach((hex, index) => {
      const row = document.createElement("div");
      row.className = "p7-paint-row";
      row.style.setProperty("--pot-colour", hex);

      const clue = document.createElement("div");
      clue.className = "p7-clue";
      clue.textContent = "Hier komt de puzzeltekst voor deze hex-code";

      const pot = document.createElement("div");
      pot.className = "p7-pot";
      pot.setAttribute("aria-hidden", "true");

      const field = document.createElement("div");
      field.className = "p7-code-field";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.maxLength = 7;
      input.placeholder = "•••••••";
      input.setAttribute("aria-label", `Kleur ${index + 1}`);
      const error = document.createElement("p");
      error.className = "p7-code-error";
      error.setAttribute("aria-live", "polite");

      function checkCode() {
        const value = input.value.trim().toUpperCase();
        if (!/^#[0-9A-F]{6}$/.test(value)) {
          error.textContent = "Gebruik een kleurcode van zes tekens.";
          return;
        }
        if (value === hex) {
          solved.add(index);
          row.classList.add("is-solved");
          input.disabled = true;
          input.value = hex;
          error.textContent = "";
          draw();
          updateProgress();
        } else {
          error.textContent = "Deze kleur klopt nog niet.";
        }
      }

      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          checkCode();
        }
      });
      input.addEventListener("change", checkCode);
      field.append(input, error);
      row.append(clue, pot, field);
      list.append(row);
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(280, rect.width);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssWidth * (data.h / data.w) * dpr);
    draw();
  }

  buildPalette();
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();
});
