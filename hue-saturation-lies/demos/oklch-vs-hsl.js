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

export function mount(container) {
  let grayActive = false;
  // HSL at 50%, matching hsl(h 100% 50%) on hue-saturation-lies-2. OKLCH at
  // 0.73, that row's average OKLCH lightness (its swatches run from 0.45 to
  // 0.97), so both rows have the same average lightness. Fixed since 28 Oct:
  // the sliders, the notes and the grey rows came off the slide.
  const lightness = 50;
  const okLightness = 73;

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
         whole point, so they sit at subhead size. */
      .vs-col-label {
        letter-spacing: var(--tracking-caps);
        color: var(--ink-muted);
        text-align: center;
        font-size: var(--text-subhead);
      }
      .vs-code { color: var(--ink); text-align: center; font-size: var(--text-subhead); }
      .vs-swatches {
        display: flex; gap: 3px;
      }
      .vs-swatch {
        flex: 1; height: 160px; border-radius: var(--radius);
      }
      .vs-gray-control {
        position: absolute; right: 1.5rem; bottom: 1.5rem;
      }
      @media (max-width: 900px) {
        .vs-wrap { box-sizing: border-box; padding: 1rem; gap: 1rem; }
        .vs-columns { width: 100%; gap: 1rem; }
        .vs-col { min-width: 0; gap: 0.4rem; }
        .vs-col-label, .vs-code { font-size: clamp(0.7rem, 2vw, 1rem); }
        .vs-gray-control { right: 0.5rem; bottom: 0.5rem; }
      }
      @media (max-width: 600px) {
        .vs-columns { flex-direction: column; gap: 0.6rem; }
        .vs-col { gap: 0.2rem; }
        .vs-col-label, .vs-code { font-size: 0.8rem; }
        .vs-swatch { height: clamp(48px, 10vh, 80px); }
      }
      @media (max-height: 450px) and (min-width: 601px) {
        .vs-wrap { gap: 0.4rem; padding: 0.4rem 1rem; }
        .vs-col { gap: 0.2rem; }
        .vs-swatches .vs-swatch { height: 80px; }
      }
    </style>
    <div class="vs-wrap demo-root">
      <div class="vs-columns">
        <div class="vs-col">
          <span class="vs-col-label caps-label " id="hsl-col-label">HSL  L=${lightness}%</span>
          <div class="vs-swatches" id="hsl-row"></div>
          <code class="css-tag vs-code" id="vs-hsl-code"></code>
        </div>
        <div class="vs-col">
          <span class="vs-col-label caps-label " id="ok-col-label">OKLCH  L=${(okLightness / 100).toFixed(2)}</span>
          <div class="vs-swatches" id="ok-row"></div>
          <code class="css-tag vs-code" id="vs-ok-code"></code>
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

  const hslColLabel = container.querySelector("#hsl-col-label");
  const okColLabel = container.querySelector("#ok-col-label");

  function render() {
    const okL = okLightness / 100;
    const chromas = hueChromas(okL);
    const okColour = i => `oklch(${okL} ${chromas[i].toFixed(5)} ${HUES_OKLCH[i]})`;

    hslSwatches.forEach((el, i) => {
      el.style.backgroundColor = desaturate(`hsl(${HUES_HSL[i]} 100% ${lightness}%)`, Number(grayActive));
    });

    okSwatches.forEach((el, i) => {
      el.style.backgroundColor = desaturate(okColour(i), Number(grayActive));
    });

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

  render();
  return () => {
    container.innerHTML = "";
  };
}
