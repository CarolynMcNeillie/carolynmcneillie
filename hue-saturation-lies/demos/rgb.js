// ── RGB / Subpixel Demo ──────────────────────────────────────────────────────
// The black slide has interactive channel bars. The yellow-blue slide uses
// separate cards, so the engine remounts the demo instead of carrying the bars.
import { luminanceGrey } from './colour-utils.js';

const BLUE = 'rgb(0 0 255)';
const YELLOW = 'rgb(255 255 0)';
// Pure channel values are already linear at the endpoints (0 and 1).
const WEIGHTS = [0.2126, 0.7152, 0.0722];
const relativeLuminance = channels => channels.reduce((sum, channel, i) => sum + WEIGHTS[i] * channel, 0);
const LUMINANCE = { blue: relativeLuminance([0, 0, 1]), yellow: relativeLuminance([1, 1, 0]) };

function mountYellowBlue(container) {
  container.innerHTML = `<style>
    .rgb-compare { background:var(--scrim); color:var(--ink); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem; padding:2rem; }
    .rgb-compare-row { display:flex; gap:2rem; width:min(900px, 95%); justify-content:center; }
    .rgb-compare-card { flex:1; max-width:400px; display:grid; gap:1rem; text-align:center; font-size:clamp(18px, 2vw, 28px); }
    .rgb-compare-chip { height:clamp(120px, 24vh, 240px); border-radius:var(--radius); }
    .rgb-compare-grey { height:2rem; border-radius:var(--radius); }
    .rgb-compare-note { color:var(--ink-muted); font-size:var(--text-label); }
  </style><div class="rgb-compare demo-root"><div class="rgb-compare-row"></div></div>`;
  const row = container.querySelector('.rgb-compare-row');
  function step(index) {
    row.replaceChildren();
    for (const [name, colour] of [['blue', BLUE], ['yellow', YELLOW]]) {
      if (index === 0 && name !== 'blue' || index === 1 && name !== 'yellow') continue;
      const card = document.createElement('div');
      card.className = 'rgb-compare-card';
      card.innerHTML = `<div class="rgb-compare-chip"></div><code class="css-tag"></code><div class="rgb-compare-grey"></div><span class="rgb-compare-note"></span>`;
      card.querySelector('.rgb-compare-chip').style.backgroundColor = colour;
      card.querySelector('code').textContent = colour;
      const grey = card.querySelector('.rgb-compare-grey');
      grey.style.backgroundColor = luminanceGrey(colour);
      grey.style.display = index === 2 ? '' : 'none';
      card.querySelector('.rgb-compare-note').textContent = index === 2 ? `Relative luminance: ${LUMINANCE[name].toFixed(3)}` : '';
      row.appendChild(card);
    }
  }
  return { step, cleanup: () => { container.innerHTML = ''; } };
}

function toHex2(n)  { return n.toString(16).padStart(2, '0').toUpperCase(); }

// srgb-2's arrow steps: red, pink (green and blue to half), dark red (red to
// half), middle grey (all three at half), blue, yellow.
const STEPS = [[255, 0, 0], [255, 128, 128], [128, 0, 0], [128, 128, 128], [0, 0, 255], [255, 255, 0]];

const CHANNELS = [
  { label: 'R', bg: '#1a0000', fill: (v) => `rgb(${v},0,0)` },
  { label: 'G', bg: '#001a00', fill: (v) => `rgb(0,${v},0)` },
  { label: 'B', bg: '#00001a', fill: (v) => `rgb(0,0,${v})` },
];

export function mount(container, type) {
  if (type === 'yellow-blue') return mountYellowBlue(container);
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  // How much of the pixel's colour shows in the background: 0 is black.
  let bgAmount = type === 'black' ? 0 : 1;
  let frame = 0;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  container.innerHTML = `
    <style>
      .rgb-wrap {
        --rgb-bg: #000;
        background-color: var(--rgb-bg);
        color: var(--ink);
        color: contrast-color(var(--rgb-bg));
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 2rem;
      }
      .rgb-pixel {
        display: flex; gap: 3px;
      }
      .rgb-css { display: flex; gap: 1.5rem; color: inherit; }
      .rgb-bar-wrap {
        display: flex; flex-direction: column;
        align-items: center; gap: 0.5rem;
      }
      .rgb-bar {
        position: relative;
        width: min(13vw, 13vh);
        height: min(39vw, 39vh); /* 3× the width so 3 bars = square pixel */
        border-radius: var(--radius);
        overflow: hidden;
        cursor: ns-resize;
      }
      .rgb-bar-fill {
        position: absolute; bottom: 0; left: 0; right: 0;
        border-radius: var(--radius);
      }
      /* Invisible native range input overlaid for interaction */
      .rgb-bar input[type=range] {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        opacity: 0;
        cursor: ns-resize;
        margin: 0;
        writing-mode: vertical-lr;
        direction: rtl;
        -webkit-appearance: slider-vertical;
      }
      /* Keep the channel bars large enough to drag on a narrow portrait screen. */
      @media (max-width: 600px) and (orientation: portrait) {
        .rgb-bar { width: 22vw; height: min(66vw, 38vh); }
      }
      .rgb-bar:has(input:focus-visible) { outline: 2px solid var(--ink); outline-offset: 3px; }
      .rgb-bar-label {
        letter-spacing: var(--tracking-caps);
         opacity: 0.5;
      }
    </style>

    <div class="rgb-wrap demo-root" id="rgb-bg">
      <div class="rgb-pixel">
        ${CHANNELS.map((ch, i) => `
          <div class="rgb-bar-wrap">
            <span class="rgb-bar-label caps-label">${ch.label}</span>
            <div class="rgb-bar" id="bar-${i}" style="background:${ch.bg}">
              <div class="rgb-bar-fill" id="fill-${i}"></div>
              <input type="range" id="sl-${i}" aria-label="${['Red', 'Green', 'Blue'][i]} channel" min="0" max="255" value="${[r,g,b][i]}">
            </div>
          </div>
        `).join('')}
      </div>

      <div class="rgb-css"><code class="css-tag" id="rgb-css-dec"></code><code class="css-tag" id="rgb-css-hex"></code></div>
    </div>
  `;

  const bg = container.querySelector('#rgb-bg');

  // Cache all refs
  const fills  = [0, 1, 2].map(i => container.querySelector(`#fill-${i}`));

  function render() {
    const vals = [r, g, b];
    const pct = Math.round(bgAmount * 1000) / 10;
    bg.style.setProperty('--rgb-bg', pct >= 100 ? `rgb(${r},${g},${b})` : pct <= 0 ? '#000' : `color-mix(in oklch, rgb(${r},${g},${b}) ${pct}%, #000)`);
    container.querySelector('#rgb-css-dec').textContent = `rgb(${r} ${g} ${b})`;
    container.querySelector('#rgb-css-hex').textContent = `#${vals.map(toHex2).join('')}`;

    vals.forEach((v, i) => {
      fills[i].style.height = `${(v / 255 * 100).toFixed(1)}%`;
      fills[i].style.backgroundColor = CHANNELS[i].fill(v);
    });
  }

  const sliders = [0, 1, 2].map(i => container.querySelector(`#sl-${i}`));
  const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
  sliders[0].addEventListener('input', e => { stop(); r = +e.target.value; render(); });
  sliders[1].addEventListener('input', e => { stop(); g = +e.target.value; render(); });
  sliders[2].addEventListener('input', e => { stop(); b = +e.target.value; render(); });

  const apply = v => {
    [r, g, b] = v.slice(0, 3).map(Math.round);
    bgAmount = v[3];
    sliders.forEach((el, i) => { el.value = [r, g, b][i]; });
    render();
  };
  // Glide the bars and the background to [r, g, b, bgAmount].
  function glide(to) {
    stop();
    const from = [r, g, b, bgAmount];
    if (motion.matches) { apply(to); return; }
    const duration = 900;
    let start = 0;
    const tick = now => {
      start ||= now;
      const t = Math.min(1, (now - start) / duration);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      apply(from.map((v, i) => v + (to[i] - v) * e));
      frame = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    frame = requestAnimationFrame(tick);
  }
  const target = i => [...STEPS[Math.min(Math.max(i, 0), STEPS.length - 1)], 1];
  // The engine calls step right after mount: that first call jumps, later
  // ones glide. The black slide has no steps.
  let stepped = false;
  function step(i) {
    if (type === 'black') return;
    if (stepped) glide(target(i));
    else { stepped = true; stop(); apply(target(i)); }
  }
  // Going to the colour slide glides to its step; going back to the black
  // slide keeps the bars where they are and fades the colour out.
  function update(nextType, bgIdx = 0) {
    type = nextType;
    stepped = true;
    glide(type === 'black' ? [r, g, b, 0] : target(bgIdx));
  }

  render();
  return { cleanup: () => { stop(); container.innerHTML = ''; }, update, step };
}
