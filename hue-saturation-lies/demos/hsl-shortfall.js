// ── HSL Shortfall Demo ───────────────────────────────────────────────────────
// The test: take a set of colours all declared at the same HSL Lightness.
// Remove the saturation (via CSS filter: grayscale). If HSL Lightness were
// perceptual, they should all converge to the SAME grey. They don't —
// yellow becomes a light grey, blue a dark one.

const HUES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export function mount(container) {
  let t = 0; // 0 = saturated, 1 = grey
  let l = 50; // HSL lightness

  container.innerHTML = `
    <style>
      .sf-wrap {
        position: absolute; inset: 0;
        background: #111;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 2rem;
        padding: 2rem;
        font-family: 'Silkscreen', monospace;
      }
      .sf-label {
        font-size: 0.55rem; letter-spacing: 0.1em;
        text-transform: uppercase; color: rgba(255,255,255,0.4);
      }
      .sf-swatches {
        display: flex; gap: 4px;
        width: min(720px, 95vw);
      }
      .sf-swatch {
        flex: 1;
        height: 110px;
        border-radius: 4px;
        transition: background-color 0.12s ease, filter 0.12s ease;
      }
      .sf-controls {
        display: flex; flex-direction: column; gap: 0.9rem;
        align-items: center;
        width: min(560px, 90vw);
      }
      .sf-slider-row {
        display: flex; align-items: center; gap: 1.2rem; width: 100%;
      }
      .sf-slider-label {
        font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
        color: rgba(255,255,255,0.45); width: 10rem; flex-shrink: 0;
      }
      .sf-slider-row input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: white;
      }
    </style>
    <div class="sf-wrap">
      <span class="sf-label" id="sf-top-label">All at HSL Lightness ${l}%</span>
      <div class="sf-swatches" id="sf-row"></div>

      <div class="sf-controls">
        <div class="sf-slider-row">
          <span class="sf-slider-label" id="sl-t-label">Saturation: 100%</span>
          <input type="range" id="sl-t" min="0" max="1" step="0.005" value="0" aria-label="Saturation">
        </div>
        <div class="sf-slider-row">
          <span class="sf-slider-label" id="sl-l-label">Lightness: 50%</span>
          <input type="range" id="sl-l" min="0" max="100" value="50" aria-label="Lightness">
        </div>
      </div>
    </div>
  `;

  const row = container.querySelector("#sf-row");
  const topLbl = container.querySelector("#sf-top-label");

  // Build swatch elements
  const swatches = HUES.map(() => {
    const el = document.createElement("div");
    el.className = "sf-swatch";
    row.appendChild(el);
    return el;
  });

  function render() {
    swatches.forEach((el, i) => {
      el.style.backgroundColor = `hsl(${HUES[i]} 100% ${l}%)`;
      el.style.filter = `grayscale(${t * 100}%)`;
    });
    const satPct = Math.round(100 * (1 - t));
    topLbl.textContent = `All at HSL Lightness ${l}%`;
    container.querySelector("#sl-t-label").textContent =
      `Saturation: ${satPct}%`;
    container.querySelector("#sl-l-label").textContent = `Lightness: ${l}%`;
    if (t > 0.9) {
      caption.textContent =
        "Same declared Lightness — different perceived brightness. Yellow is much brighter than blue.";
    } else {
      caption.textContent =
        "If HSL Lightness were perceptual, draining the saturation would leave identical greys.";
    }
  }

  container.querySelector("#sl-t").addEventListener("input", (e) => {
    t = +e.target.value;
    render();
  });
  container.querySelector("#sl-l").addEventListener("input", (e) => {
    l = +e.target.value;
    render();
  });

  render();
  return () => {
    container.innerHTML = "";
  };
}
