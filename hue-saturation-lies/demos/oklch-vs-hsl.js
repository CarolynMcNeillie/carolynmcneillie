// ── OKLCH vs HSL — side-by-side comparison ───────────────────────────────────
// The same test as the shortfall demo, run on both colour systems simultaneously.
// HSL uses CSS filter: grayscale so the browser's luminance model reveals the
// uneven greys. OKLCH uses chroma=0, which converges to one true grey.

const HUES_HSL = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
// OKLCH hue wheel runs the same 0-360° range
const HUES_OKLCH = HUES_HSL;

export function mount(container) {
  let t = 0; // 0 = saturated, 1 = fully desaturated
  let hslL = 55; // HSL  lightness (0–100)
  let okL = 0.72; // OKLCH lightness (0–1)

  container.innerHTML = `
    <style>
      .vs-wrap {
        position: absolute; inset: 0;
        background: #111;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 1.6rem;
        padding: 1.5rem 2rem;
        font-family: 'Silkscreen', monospace;
      }
      .vs-columns {
        display: flex; gap: 2.5rem;
        width: min(800px, 95vw);
      }
      .vs-col {
        flex: 1; display: flex; flex-direction: column; gap: 0.7rem;
      }
      .vs-col-label {
        font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
        color: rgba(255,255,255,0.5);
        text-align: center;
      }
      .vs-swatches {
        display: flex; gap: 3px;
      }
      .vs-swatch {
        flex: 1; height: 90px; border-radius: 3px;
        transition: background-color 0.1s ease, filter 0.1s ease;
      }
      .vs-grey-row {
        display: flex; gap: 3px; opacity: 0.55;
      }
      .vs-grey-row .vs-swatch { height: 14px; border-radius: 2px; }
      .vs-grey-label {
        font-size: 0.45rem; letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.3); text-align: center;
      }
      .vs-controls {
        display: flex; flex-direction: column; gap: 0.85rem;
        width: min(600px, 90vw);
      }
      .vs-row {
        display: flex; align-items: center; gap: 1.2rem;
      }
      .vs-row-label {
        font-size: 0.55rem; letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.4); width: 13rem; flex-shrink: 0;
      }
      .vs-row input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: white;
      }
    </style>
    <div class="vs-wrap">
      <div class="vs-columns">
        <div class="vs-col">
          <span class="vs-col-label" id="hsl-col-label">HSL  L=${hslL}%</span>
          <div class="vs-swatches" id="hsl-row"></div>
          <div class="vs-grey-label">→ grey when desaturated</div>
          <div class="vs-grey-row" id="hsl-grey"></div>
        </div>
        <div class="vs-col">
          <span class="vs-col-label" id="ok-col-label">OKLCH  L=${okL.toFixed(2)}</span>
          <div class="vs-swatches" id="ok-row"></div>
          <div class="vs-grey-label">→ grey when desaturated</div>
          <div class="vs-grey-row" id="ok-grey"></div>
        </div>
      </div>

      <div class="vs-controls">
        <div class="vs-row">
          <span class="vs-row-label" id="lbl-t">Saturation: 100%</span>
          <input type="range" id="sl-t" min="0" max="1" step="0.005" value="0" aria-label="Saturation">
        </div>
        <div class="vs-row">
          <span class="vs-row-label" id="lbl-hsl-l">HSL Lightness: ${hslL}%</span>
          <input type="range" id="sl-hsl-l" min="1" max="99" value="${hslL}" aria-label="HSL Lightness">
        </div>
        <div class="vs-row">
          <span class="vs-row-label" id="lbl-ok-l">OKLCH Lightness: ${okL.toFixed(2)}</span>
          <input type="range" id="sl-ok-l" min="0" max="1" step="0.01" value="${okL}" aria-label="OKLCH Lightness">
        </div>
      </div>
    </div>
  `;

  function buildRow(parentId, count) {
    const parent = container.querySelector(`#${parentId}`);
    return Array.from({ length: count }, () => {
      const el = document.createElement("div");
      el.className = "vs-swatch";
      parent.appendChild(el);
      return el;
    });
  }

  const hslSwatches = buildRow("hsl-row", HUES_HSL.length);
  const okSwatches = buildRow("ok-row", HUES_OKLCH.length);
  const hslGreys = buildRow("hsl-grey", HUES_HSL.length);
  const okGreys = buildRow("ok-grey", HUES_OKLCH.length);

  const lblT = container.querySelector("#lbl-t");
  const lblHslL = container.querySelector("#lbl-hsl-l");
  const lblOkL = container.querySelector("#lbl-ok-l");
  const hslColLabel = container.querySelector("#hsl-col-label");
  const okColLabel = container.querySelector("#ok-col-label");

  function render() {
    const sat = 1 - t;

    hslSwatches.forEach((el, i) => {
      el.style.backgroundColor = `hsl(${HUES_HSL[i]} 100% ${hslL}%)`;
      el.style.filter = `grayscale(${t * 100}%)`;
    });
    // Grey row: full saturation + filter at 100% so the browser's luminance
    // model reveals that these "same lightness" colours are actually different greys.
    hslGreys.forEach((el, i) => {
      el.style.backgroundColor = `hsl(${HUES_HSL[i]} 100% ${hslL}%)`;
      el.style.filter = "grayscale(100%)";
    });

    okSwatches.forEach((el, i) => {
      el.style.backgroundColor = `oklch(${okL} ${(sat * 0.22).toFixed(3)} ${HUES_OKLCH[i]})`;
    });
    okGreys.forEach((el, i) => {
      el.style.backgroundColor = `oklch(${okL} 0 ${HUES_OKLCH[i]})`;
    });

    const satPct = Math.round(sat * 100);
    lblT.textContent = `Saturation: ${satPct}%`;
    lblHslL.textContent = `HSL Lightness: ${hslL}%`;
    lblOkL.textContent = `OKLCH Lightness: ${okL.toFixed(2)}`;
    hslColLabel.textContent = `HSL  L=${hslL}%`;
    okColLabel.textContent = `OKLCH  L=${okL.toFixed(2)}`;
  }

  container.querySelector("#sl-t").addEventListener("input", (e) => {
    t = +e.target.value;
    render();
  });
  container.querySelector("#sl-hsl-l").addEventListener("input", (e) => {
    hslL = +e.target.value;
    render();
  });
  container.querySelector("#sl-ok-l").addEventListener("input", (e) => {
    okL = +e.target.value;
    render();
  });

  render();
  return () => {
    container.innerHTML = "";
  };
}
