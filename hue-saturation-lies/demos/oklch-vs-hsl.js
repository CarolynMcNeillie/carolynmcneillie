// ── OKLCH vs HSL — side-by-side comparison ───────────────────────────────────
// The same test as the shortfall demo, run on both colour systems simultaneously.
// Both rows fade to the grey with the original colour's relative luminance.

import { desaturate, oklchToLinearRGB } from './colour-utils.js';
import { GRAYSCALE_ICON } from './icons.js';

const HUES_HSL = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
// OKLCH hue wheel runs the same 0-360° range
const HUES_OKLCH = HUES_HSL;

// The largest chroma that stays inside sRGB for this lightness and hue.
export function maxChroma(lightness, hue) {
  let lo = 0, hi = 0.5;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (oklchToLinearRGB(lightness, mid, hue).every(v => v >= 0 && v <= 1)) lo = mid;
    else hi = mid;
  }
  return lo;
}

// Each hue gets 98% of its own sRGB maximum, so the row is as vivid as sRGB
// allows while L stays fixed and no swatch needs gamut mapping.
export function hueChromas(lightness) {
  return HUES_OKLCH.map(hue => 0.98 * maxChroma(lightness, hue));
}

// The OKLCH lightness of an sRGB colour given as hsl(h 100% l%).
function hslOklchL(h, l) {
  const k = (n) => (n + h / 30) % 12, a = Math.min(l, 1 - l);
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [0, 8, 4].map((n) => lin(l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  const L = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const M = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const S = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S;
}

export function mount(container) {
  let grayActive = false;
  // HSL opens at 50%, matching hsl(h 100% 50%) on hue-saturation-lies-2. OKLCH
  // opens at 0.73, that row's average OKLCH lightness (its swatches run from
  // 0.45 to 0.97), so both rows have the same average lightness.
  let lightness = 50;
  let okLightness = 73;

  container.innerHTML = `
    <style>
      .vs-wrap {
        background: oklch(0.178 0 0);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 1.6rem;
        padding: 1.5rem 2rem;
      }
      .vs-columns {
        display: flex; gap: 2.5rem;
        width: min(1200px, 95vw);
      }
      .vs-col {
        flex: 1; display: flex; flex-direction: column; gap: 0.7rem;
      }
      /* The two column heads and the CSS they expand to are the slide's
         whole point, so they sit a full rung above the commentary below. */
      .vs-col-label {
        letter-spacing: var(--tracking-caps);
        color: var(--ink-muted);
        text-align: center;
        font-size: var(--text-subhead);
      }
      .vs-code { color: var(--ink); text-align: center; font-size: var(--text-subhead); }
      .vs-note { color: var(--ink-soft); text-align: center; font: var(--text-body)/1.3 var(--font-body); margin-top: -0.3rem; }
      .vs-swatches {
        display: flex; gap: 3px;
      }
      .vs-swatch {
        flex: 1; height: 160px; border-radius: var(--radius);
      }
      .vs-grey-row {
        display: flex; gap: 3px;
      }
      .vs-grey-row .vs-swatch { height: 48px; border-radius: var(--radius); }
      .vs-grey-label {
        font-size: var(--text-label); letter-spacing: var(--tracking-caps); text-transform: uppercase;
        color: var(--ink-muted); text-align: center;
      }
      .vs-controls {
        width: min(600px, 90vw);
        display: flex; flex-direction: column; gap: 0.6rem;
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
      @media (max-width: 900px) {
        .vs-wrap { box-sizing: border-box; padding: 1rem; gap: 1rem; }
        .vs-columns { width: 100%; gap: 1rem; }
        .vs-col { min-width: 0; gap: 0.4rem; }
        .vs-col-label, .vs-code { font-size: clamp(0.7rem, 2vw, 1rem); }
        .vs-note { font-size: clamp(0.7rem, 1.7vw, 0.9rem); }
        .vs-grey-label { font-size: clamp(0.65rem, 1.5vw, 0.85rem); }
        .vs-controls { width: min(100%, 500px); padding-right: 2.5rem; box-sizing: border-box; }
        .vs-row { gap: 0.5rem; }
        .vs-row-label { width: 10rem; font-size: 0.7rem; }
        .vs-gray-control { right: 0.5rem; bottom: 0.5rem; }
      }
      @media (max-width: 600px) {
        .vs-columns { flex-direction: column; gap: 0.6rem; }
        .vs-col { gap: 0.2rem; }
        .vs-col-label, .vs-code { font-size: 0.8rem; }
        .vs-note { font-size: 0.75rem; margin: 0; }
        .vs-grey-label { font-size: 0.68rem; }
        .vs-swatch { height: clamp(48px, 10vh, 80px); }
        .vs-grey-row .vs-swatch { height: 20px; }
        .vs-row-label { width: 9rem; }
      }
      @media (max-height: 450px) and (min-width: 601px) {
        .vs-wrap { gap: 0.4rem; padding: 0.4rem 1rem; }
        .vs-col { gap: 0.2rem; }
        .vs-swatches .vs-swatch { height: 80px; }
        .vs-grey-row .vs-swatch { height: 18px; }
        .vs-controls { flex-direction: row; gap: 1rem; }
        .vs-row { flex: 1; min-width: 0; }
        .vs-row-label { width: auto; }
      }
    </style>
    <div class="vs-wrap demo-root">
      <div class="vs-columns">
        <div class="vs-col">
          <span class="vs-col-label caps-label " id="hsl-col-label">HSL  L=${lightness}%</span>
          <div class="vs-swatches" id="hsl-row"></div>
          <code class="css-tag vs-code" id="vs-hsl-code"></code>
          <div class="vs-note" id="vs-hsl-note"></div>
          <div class="vs-grey-label">luminance-preserving grayscale</div>
          <div class="vs-grey-row" id="hsl-grey"></div>
        </div>
        <div class="vs-col">
          <span class="vs-col-label caps-label " id="ok-col-label">OKLCH  L=${(okLightness / 100).toFixed(2)}</span>
          <div class="vs-swatches" id="ok-row"></div>
          <code class="css-tag vs-code" id="vs-ok-code"></code>
          <div class="vs-note" id="vs-ok-note"></div>
          <div class="vs-grey-label">luminance-preserving grayscale</div>
          <div class="vs-grey-row" id="ok-grey"></div>
        </div>
      </div>

      <div class="vs-controls">
        <div class="vs-row">
          <span class="vs-row-label caps-label" id="lbl-lightness">HSL lightness: ${lightness}%</span>
          <input type="range" id="sl-lightness" min="0" max="100" value="${lightness}" aria-label="HSL lightness">
        </div>
        <div class="vs-row">
          <span class="vs-row-label caps-label" id="lbl-ok-lightness">OKLCH L: ${(okLightness / 100).toFixed(2)}</span>
          <input type="range" id="sl-ok-lightness" min="0" max="100" value="${okLightness}" aria-label="OKLCH lightness">
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
    const okL = okLightness / 100;
    const chromas = hueChromas(okL);
    const okColour = i => `oklch(${okL} ${chromas[i].toFixed(5)} ${HUES_OKLCH[i]})`;

    hslSwatches.forEach((el, i) => {
      el.style.backgroundColor = desaturate(`hsl(${HUES_HSL[i]} 100% ${lightness}%)`, Number(grayActive));
    });
    // Grey row: each colour's luminance grey, which shows that these "same
    // lightness" colours are actually different greys.
    hslGreys.forEach((el, i) => {
      el.style.backgroundColor = desaturate(`hsl(${HUES_HSL[i]} 100% ${lightness}%)`, 1);
    });

    okSwatches.forEach((el, i) => {
      el.style.backgroundColor = desaturate(okColour(i), Number(grayActive));
    });
    okGreys.forEach((el, i) => {
      el.style.backgroundColor = desaturate(okColour(i), 1);
    });

    const hslLs = HUES_HSL.map((h) => hslOklchL(h, lightness / 100));
    const mean = hslLs.reduce((a, b) => a + b) / hslLs.length;
    container.querySelector('#vs-hsl-note').textContent = `Really OKLCH L ${Math.min(...hslLs).toFixed(2)} to ${Math.max(...hslLs).toFixed(2)}, averaging ${mean.toFixed(2)}`;
    container.querySelector('#vs-ok-note').textContent = `Every swatch at OKLCH L ${okL.toFixed(2)}`;
    lblLightness.textContent = `HSL lightness: ${lightness}%`;
    container.querySelector('#lbl-ok-lightness').textContent = `OKLCH L: ${okL.toFixed(2)}`;
    hslColLabel.textContent = `HSL  L=${lightness}%`;
    okColLabel.textContent = `OKLCH  L=${okL.toFixed(2)}  max C`;
    container.querySelector('#vs-hsl-code').textContent = `hsl(h 100% ${lightness}%)`;
    container.querySelector('#vs-ok-code').textContent = `oklch(${okL.toFixed(2)} c h)`;
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
  container.querySelector("#sl-ok-lightness").addEventListener("input", (e) => {
    okLightness = +e.target.value;
    render();
  });

  render();
  return () => {
    container.innerHTML = "";
  };
}
