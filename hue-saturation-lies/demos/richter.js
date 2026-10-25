// Original Kelly-inspired colour-panel study with seeded randomness.
const COLUMNS = 12;
const ROWS = 8;
const SEED = 0x52696368;
import { oklchToLinearRGB } from './colour-utils.js';

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert OKLCH to linear sRGB to find the largest in-gamut chroma at a fixed L and H.
function inSRGB(l, c, h) {
  return oklchToLinearRGB(l, c, h).every(channel => channel >= -0.000001 && channel <= 1.000001);
}

function gamutChroma(l, c, h) {
  if (inSRGB(l, c, h)) return c;
  let low = 0, high = c;
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    if (inSRGB(l, mid, h)) low = mid;
    else high = mid;
  }
  // Stay inside the boundary after rounding for the CSS readout.
  return Math.max(0, low - 0.0001);
}

export function mount(container, type) {
  container.innerHTML = `
    <style>
      .richter { background: var(--scrim); color: var(--ink); padding: 32px 5vw; display: flex; flex-direction: column; gap: 16px; }
      .richter header { display: flex; justify-content: flex-end; }
      .richter-shuffle { min-height: 44px; padding: 8px 22px; color: var(--ink); }
      .richter-shuffle:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
      .richter-grid { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-template-rows: repeat(8, minmax(0, 1fr)); gap: 2px; background: var(--scrim); }
      .richter-panel { min-width: 0; min-height: 0; }
      .richter-code { display:none; background:#000c; padding:1rem; font:clamp(16px,2vw,26px) var(--font-code); }
      .richter.has-code .richter-code { display:grid; gap:.5rem; }
      .richter-code label { display:grid; grid-template-columns: 7em 1fr; gap:1rem; align-items:center; font: var(--text-small) var(--font-display); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--ink-soft); }
      .richter-code input { flex:1; }
    </style>
    <section class="richter demo-root" aria-label="Original random colour panel study">
      <header><button class="pill-button richter-shuffle" type="button">Shuffle</button></header>
      <div class="richter-grid" role="img" aria-label="Twelve columns and eight rows of colour panels"></div>
      <div class="richter-code"><code></code><label>Lightness<input type="range" aria-label="Grid lightness" min="0" max="1" step="0.01" value="0.7"></label><label>Chroma<input type="range" aria-label="Grid chroma" min="0" max="0.3" step="0.01" value="0.1"></label></div>
    </section>`;
  const root = container.querySelector('.richter');
  const grid = root.querySelector('.richter-grid');
  const panels = Array.from({ length: COLUMNS * ROWS }, () => {
    const panel = document.createElement('div');
    panel.className = 'richter-panel';
    grid.append(panel);
    return panel;
  });
  let mode = 0, shuffle = 0, code = false, l = .7, c = .1;
  const sliders = [...root.querySelectorAll('input')];
  function draw() {
    const rng = random(SEED + mode * 100003 + shuffle * 9973);
    panels.forEach(panel => {
      if (mode === 0) {
        const channels = Array.from({ length: 3 }, () => Math.floor(rng() * 256));
        panel.style.backgroundColor = `rgb(${channels.join(' ')})`;
      } else {
        const h = rng() * 360;
        panel.style.backgroundColor = `oklch(${l.toFixed(4)} ${gamutChroma(l, c, h).toFixed(4)} ${h.toFixed(2)})`;
      }
    });
    root.querySelector('.richter-code code').textContent = `background: oklch(${l.toFixed(2)} ${c.toFixed(2)} var(--random-h));`;
    sliders.forEach((slider, i) => { slider.value = String(i === 0 ? l : c); });
  }
  function step(n) {
    if (code) {
      mode = 1;
      if (n === 0 || n === 3) { l = .7; c = .1; }
      if (n === 1) { l = .5; c = .1; }
      if (n === 2) { l = .5; c = .05; }
      if (n === 3) shuffle++;
    } else {
      mode = Math.max(0, Math.min(1, n));
      l = .7; c = .1;
    }
    draw();
  }
  function update(type, n = 0) {
    code = type === 'code';
    root.classList.toggle('has-code', code);
    step(n);
  }
  sliders.forEach((slider, i) => slider.addEventListener('input', () => {
    if (i === 0) l = Number(slider.value); else c = Number(slider.value);
    draw();
  }));
  root.querySelector('.richter-shuffle').addEventListener('click', () => { shuffle++; draw(); });
  update(type, 0);
  return { step, update, cleanup() { container.replaceChildren(); } };
}
