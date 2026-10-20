// Original colour-panel study: seeded randomness, not a reproduction of a Richter work.
const COLUMNS = 12;
const ROWS = 8;
const SEED = 0x52696368;

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
  const radians = h * Math.PI / 180;
  const a = c * Math.cos(radians), b = c * Math.sin(radians);
  const ll = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const ss = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
    -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
    -0.0041960863 * ll - 0.7034186147 * mm + 1.7076147010 * ss,
  ].every(channel => channel >= -0.000001 && channel <= 1.000001);
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
    </style>
    <section class="richter demo-root" aria-label="Original random colour panel study">
      <header><button class="pill-button richter-shuffle" type="button">Shuffle</button></header>
      <div class="richter-grid" role="img" aria-label="Twelve columns and eight rows of colour panels"></div>
    </section>`;
  const root = container.querySelector('.richter');
  const grid = root.querySelector('.richter-grid');
  const panels = Array.from({ length: COLUMNS * ROWS }, () => {
    const panel = document.createElement('div');
    panel.className = 'richter-panel';
    grid.append(panel);
    return panel;
  });
  let mode = 0, shuffle = 0;
  function draw() {
    const rng = random(SEED + mode * 100003 + shuffle * 9973);
    panels.forEach(panel => {
      if (mode === 0) {
        const channels = Array.from({ length: 3 }, () => Math.floor(rng() * 256));
        panel.style.backgroundColor = `rgb(${channels.join(' ')})`;
      } else {
        const l = 0.62 + rng() * 0.16;
        const c = 0.06 + rng() * 0.08;
        const h = rng() * 360;
        panel.style.backgroundColor = `oklch(${l.toFixed(4)} ${gamutChroma(l, c, h).toFixed(4)} ${h.toFixed(2)})`;
      }
    });
  }
  function step(n) {
    mode = Math.max(0, Math.min(1, n));
    shuffle = 0;
    draw();
  }
  root.querySelector('.richter-shuffle').addEventListener('click', () => { shuffle++; draw(); });
  step(0);
  return { step, cleanup() { container.replaceChildren(); } };
}
