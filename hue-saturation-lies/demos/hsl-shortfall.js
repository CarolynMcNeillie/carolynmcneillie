// ── HSL Shortfall Demo ───────────────────────────────────────────────────────
// The test: take a set of colours all declared at the same HSL Lightness.
// Remove the saturation, keeping each colour's luminance. If HSL Lightness were
// perceptual, they should all converge to the SAME grey. They don't —
// yellow becomes a light grey, blue a dark one.

import { desaturate } from './colour-utils.js';
import { GRAYSCALE_ICON } from './icons.js';

const HUES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export function mount(container) {
  let grayActive = false;
  let l = 50; // HSL lightness

  container.innerHTML = `
    <style>
      .sf-wrap {

        background: #111;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 2rem;
        padding: 2rem;
      }
      .sf-label {
        letter-spacing: var(--tracking-caps);
         color: var(--ink-muted);
      }
      .sf-code { color: var(--ink); }
      .sf-swatches {
        display: flex; gap: 4px;
        width: min(720px, 95vw);
      }
      .sf-swatch {
        flex: 1;
        height: 110px;
        border-radius: var(--radius);
      }
      .sf-controls {
        display: flex; flex-direction: column; gap: 0.9rem;
        align-items: center;
        width: min(560px, 90vw);
      }
    </style>
    <div class="sf-wrap demo-root">
      <span class="sf-label caps-label" id="sf-top-label">All at HSL Lightness ${l}%</span>
      <div class="sf-swatches" id="sf-row"></div>
      <code class="css-tag sf-code"></code>

      <div class="sf-controls">
        <button type="button" class="icon-button" id="sf-gray" aria-label="Grayscale" title="Grayscale" aria-pressed="false">${GRAYSCALE_ICON}</button>
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
      el.style.backgroundColor = desaturate(`hsl(${HUES[i]} 100% ${l}%)`, Number(grayActive));
    });
    topLbl.textContent = `All at HSL Lightness ${l}%`;
    container.querySelector('.sf-code').textContent = `hsl(h 100% ${l}%)`;
  }

  const grayBtn = container.querySelector('#sf-gray');
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
