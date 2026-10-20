import { FREQ_MIN, FREQ_MAX, freqToSpectrum } from './spectrum-colours.js';

// Color name for readout
const COLOR_NAMES = [
  [430, "red"], [492, "orange"], [517, "yellow"],
  [566, "green"], [612, "cyan"], [652, "blue"], [714, "violet"],
];
function freqToName(freq) {
  return COLOR_NAMES.reduce((best, e) =>
    Math.abs(freq - e[0]) < Math.abs(freq - best[0]) ? e : best
  )[1];
}

// ── mount ────────────────────────────────────────────────────────────────
export function mount(container) {
  let freq = 430;
  let amp  = 1.0;

  // ── Styles + HTML ─────────────────────────────────────────────────────
  container.innerHTML = `
    <style>
      .wave-demo {

        padding: 4rem 0;
        display: flex; flex-direction: column; align-items: center;
        background: var(--wave-bg, black);
        color: var(--fg, white);
        transition: background var(--motion-fast), color var(--motion-fast);
      }
      .wave-wrap {
        position: absolute; top: 50%; transform: translateY(-50%);
        width: 100%; height: 260px;
        overflow: hidden; pointer-events: none;
      }
      .wave-svg { display: block; }
      .wave-path {
        fill: none;
        stroke: var(--fg, white);
        stroke-width: 5;
        stroke-linecap: round;
      }
      .wave-readout {
        display: flex; gap: 3rem;
        font-size: var(--text-label);
        letter-spacing: var(--tracking-caps); text-transform: uppercase;
        opacity: 0.75; margin-top: 1.5rem;
      }
      .wave-controls {
        display: flex; flex-direction: column;
        gap: 1.25rem; width: min(600px, 80%);
        margin-top: auto; padding-bottom: 5vh;
      }
      .wave-dial {
        display: flex; align-items: center; gap: 4rem;
        font-size: var(--text-label);
        letter-spacing: var(--tracking-caps); text-transform: uppercase; cursor: pointer;
      }
      .wave-dial-label { flex-shrink: 0; width: 6em; }
      .wave-dial input[type=range] { flex: 1; }
    </style>
    <div class="wave-demo demo-root">
      <div class="wave-wrap">
        <svg class="wave-svg"><path class="wave-path"></path></svg>
      </div>
      <div class="wave-readout">
        <span class="wave-freq-readout"></span>
      </div>
      <div class="wave-controls">
        <label class="wave-dial">
          <span class="wave-dial-label">frequency</span>
          <input type="range" class="wave-freq-input"
            min="${FREQ_MIN}" max="${FREQ_MAX}" step="1" value="${freq}">
        </label>
        <label class="wave-dial">
          <span class="wave-dial-label">amplitude</span>
          <input type="range" class="wave-amp-input"
            min="0" max="1" step="0.01" value="${amp}">
        </label>
      </div>
    </div>
  `;

  const root        = container.querySelector(".wave-demo");
  const waveWrap    = container.querySelector(".wave-wrap");
  const svg         = container.querySelector(".wave-svg");
  const path        = container.querySelector(".wave-path");
  const freqReadout = container.querySelector(".wave-freq-readout");

  container.querySelector(".wave-freq-input")
    .addEventListener("input", e => { freq = parseFloat(e.target.value); update(); });
  container.querySelector(".wave-amp-input")
    .addEventListener("input", e => { amp  = parseFloat(e.target.value); update(); });

  // ── Wave animation ────────────────────────────────────────────────────
  let phase = 0;
  let rafId = null;
  let cachedW = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // The drawing keeps the physics' proportions, magnified:
  // - Waves on screen scale with frequency, 3 at red (430 THz) and 5 at
  //   violet (714 THz), so 3 red waves (700 nm) span 5 violet (420 nm).
  // - Height is linear in amplitude. Brightness is not: see update().
  // - Every colour's crests cross the screen at the same speed, as all
  //   light travels at c, so a higher frequency oscillates faster.
  const wavesOnScreen = () => 3 * freq / FREQ_MIN;
  // Radians per second, per wave on screen. Timed by the clock, not by frames,
  // so the speed is the same on 60 Hz and 120 Hz screens: red oscillates
  // 0.29 times a second, about 1.5 quadrillion times slower than 430 THz.
  const CREST_SPEED = 0.6;
  let lastTime = null;

  function buildPath() {
    const W   = waveWrap.clientWidth;
    if (!Number.isFinite(W) || W <= 0 || !Number.isFinite(freq) || !Number.isFinite(amp) || !Number.isFinite(phase)) return;
    const H   = 260;
    const mid = H / 2;

    // Only update SVG dimensions when width actually changes
    if (W !== cachedW) {
      svg.setAttribute("width",   W);
      svg.setAttribute("height",  H);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      cachedW = W;
    }

    const cycles  = wavesOnScreen();
    const waveAmp = mid * 0.85 * amp;
    const steps   = Math.ceil(W);
    const pts     = [];

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * W;
      const y = mid + Math.sin((i / steps) * cycles * Math.PI * 2 + phase) * waveAmp;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    path.setAttribute("d", pts.join(" "));
  }

  function draw() {
    buildPath();
  }
  function animate(now) {
    rafId = null;
    // Cap the step so a frame after a pause does not jump the wave.
    if (now !== undefined && lastTime !== null) phase += CREST_SPEED * wavesOnScreen() * Math.min(now - lastTime, 100) / 1000;
    lastTime = now ?? null;
    draw();
    if (!reducedMotion.matches) rafId = requestAnimationFrame(animate);
  }
  function motionChanged() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    lastTime = null;
    if (reducedMotion.matches) {
      phase = 0;
      draw();
    } else {
      animate();
    }
  }
  reducedMotion.addEventListener('change', motionChanged);
  const resizeObserver = new ResizeObserver(() => draw());
  resizeObserver.observe(waveWrap);

  // ── Update colors via CSS custom properties ───────────────────────────
  function update() {
    const [hue, chroma, naturalL] = freqToSpectrum(freq);
    // Light's energy goes with amplitude squared, and OKLCH lightness is
    // about the cube root of light, so lightness goes with amplitude^(2/3).
    const L  = naturalL * Math.cbrt(amp * amp);
    const fg = L > 0.55 ? "black" : "white";
    // Fade chroma to 0 near black — ensures oklch(0 0 0) = unambiguous black
    const C  = L < 0.05 ? chroma * (L / 0.05) : chroma;

    // Single custom property: CSS owns the color value and its transition
    root.style.setProperty("--wave-bg", `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${hue.toFixed(1)})`);
    root.style.setProperty("--fg", fg);

    freqReadout.textContent = `${Math.round(freq)} THz · ${freqToName(freq)}`;
    if (reducedMotion.matches) draw();
  }

  update();
  if (!reducedMotion.matches) animate();

  // ── cleanup ───────────────────────────────────────────────────────────
  return function cleanup() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    reducedMotion.removeEventListener('change', motionChanged);
    resizeObserver.disconnect();
    container.innerHTML = "";
  };
}
