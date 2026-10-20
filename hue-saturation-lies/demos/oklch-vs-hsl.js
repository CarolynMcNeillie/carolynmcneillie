// ── OKLCH vs HSL — side-by-side comparison ───────────────────────────────────
// The same test as the shortfall demo, run on both colour systems simultaneously.
// HSL fades each colour to the grey with its own luminance, which reveals the
// uneven greys. OKLCH uses chroma=0, which converges to one true grey.

import { desaturate } from './colour-utils.js';
import { GRAYSCALE_ICON } from './icons.js';

const HUES_HSL = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
// OKLCH hue wheel runs the same 0-360° range
const HUES_OKLCH = HUES_HSL;

export function mount(container) {
  let grayActive = false;
  let lightness = 55; // Shared 0–100 value for HSL L and OKLCH L

  container.innerHTML = `
    <style>
      .vs-wrap {
        background: #111;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 1.6rem;
        padding: 1.5rem 2rem;
      }
      .vs-columns {
        display: flex; gap: 2.5rem;
        width: min(800px, 95vw);
      }
      .vs-col {
        flex: 1; display: flex; flex-direction: column; gap: 0.7rem;
      }
      .vs-col-label {
        letter-spacing: var(--tracking-caps);
        color: var(--ink-muted);
        text-align: center;
      }
      .vs-code { color: var(--ink); text-align: center; }
      .vs-swatches {
        display: flex; gap: 3px;
      }
      .vs-swatch {
        flex: 1; height: 90px; border-radius: var(--radius);
      }
      .vs-grey-row {
        display: flex; gap: 3px; opacity: 0.55;
      }
      .vs-grey-row .vs-swatch { height: 14px; border-radius: var(--radius); }
      .vs-grey-label {
        font-size: var(--text-label); letter-spacing: var(--tracking-caps); text-transform: uppercase;
        color: var(--ink-muted); text-align: center;
      }
      .vs-controls {
        width: min(600px, 90vw);
      }
      .vs-gray-control {
        position: absolute; right: 1.5rem; bottom: 1.5rem;
      }
      .vs-row {
        display: flex; align-items: center; gap: 1.2rem;
      }
      .vs-row-label {

        color: var(--ink-muted); width: 17rem; flex-shrink: 0; white-space: nowrap;
      }
      .vs-row input[type=range] { flex: 1; }
    </style>
    <div class="vs-wrap demo-root">
      <div class="vs-columns">
        <div class="vs-col">
          <span class="vs-col-label caps-label " id="hsl-col-label">HSL  L=${lightness}%</span>
          <div class="vs-swatches" id="hsl-row"></div>
          <code class="css-tag vs-code" id="vs-hsl-code"></code>
          <div class="vs-grey-label">→ grey in grayscale</div>
          <div class="vs-grey-row" id="hsl-grey"></div>
        </div>
        <div class="vs-col">
          <span class="vs-col-label caps-label " id="ok-col-label">OKLCH  L=${(lightness / 100).toFixed(2)}</span>
          <div class="vs-swatches" id="ok-row"></div>
          <code class="css-tag vs-code" id="vs-ok-code"></code>
          <div class="vs-grey-label">→ grey in grayscale</div>
          <div class="vs-grey-row" id="ok-grey"></div>
        </div>
      </div>

      <div class="vs-controls">
        <div class="vs-row">
          <span class="vs-row-label caps-label" id="lbl-lightness">Lightness: ${lightness}%</span>
          <input type="range" id="sl-lightness" min="0" max="100" value="${lightness}" aria-label="Lightness for HSL and OKLCH">
        </div>
      </div>
      <button type="button" class="icon-button vs-gray-control" id="vs-gray" aria-label="Grayscale" title="Grayscale" aria-pressed="false">${GRAYSCALE_ICON}</button>
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

  const lblLightness = container.querySelector("#lbl-lightness");
  const hslColLabel = container.querySelector("#hsl-col-label");
  const okColLabel = container.querySelector("#ok-col-label");

  function render() {
    const sat = grayActive ? 0 : 1;
    const okL = lightness / 100;

    hslSwatches.forEach((el, i) => {
      el.style.backgroundColor = desaturate(`hsl(${HUES_HSL[i]} 100% ${lightness}%)`, Number(grayActive));
    });
    // Grey row: each colour's luminance grey, which shows that these "same
    // lightness" colours are actually different greys.
    hslGreys.forEach((el, i) => {
      el.style.backgroundColor = desaturate(`hsl(${HUES_HSL[i]} 100% ${lightness}%)`, 1);
    });

    okSwatches.forEach((el, i) => {
      el.style.backgroundColor = `oklch(${okL} ${(sat * 0.22).toFixed(3)} ${HUES_OKLCH[i]})`;
    });
    okGreys.forEach((el, i) => {
      el.style.backgroundColor = `oklch(${okL} 0 ${HUES_OKLCH[i]})`;
    });

    lblLightness.textContent = `Lightness: ${lightness}%`;
    hslColLabel.textContent = `HSL  L=${lightness}%`;
    okColLabel.textContent = `OKLCH  L=${okL.toFixed(2)}`;
    container.querySelector('#vs-hsl-code').textContent = `hsl(h 100% ${lightness}%)`;
    container.querySelector('#vs-ok-code').textContent = `oklch(${okL.toFixed(2)} 0.22 h)`;
  }

  const grayBtn = container.querySelector('#vs-gray');
  grayBtn.addEventListener('click', () => {
    grayActive = !grayActive;
    grayBtn.setAttribute('aria-pressed', String(grayActive));
    render();
  });
  container.querySelector("#sl-lightness").addEventListener("input", (e) => {
    lightness = +e.target.value;
    render();
  });

  render();
  return () => {
    container.innerHTML = "";
  };
}
