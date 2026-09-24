// ── Visible spectrum: frequency (THz) → OKLCH hue, chroma, natural lightness
// Anchor points derived from spectral sRGB values via full OKLCH pipeline.
// Natural lightness = the L of that spectral colour at full sRGB saturation.
// Piecewise linear interpolation — the mapping is highly nonlinear.
const SPECTRUM = [
  // [freq_THz, hue°, chroma, natural_L]
  [430,  29.2, 0.258, 0.628],  // Red     700 nm
  [492,  42.0, 0.208, 0.690],  // Orange  610 nm
  [517,  95.3, 0.182, 0.887],  // Yellow  580 nm
  [566, 142.5, 0.295, 0.866],  // Green   530 nm
  [612, 194.8, 0.155, 0.905],  // Cyan    490 nm
  [652, 260.8, 0.241, 0.563],  // Blue    460 nm
  [714, 291.0, 0.293, 0.521],  // Violet  420 nm
];

const FREQ_MIN = SPECTRUM[0][0];
const FREQ_MAX = SPECTRUM[SPECTRUM.length - 1][0];

// Returns [hue, chroma, naturalL] — all three interpolated from anchors
function freqToSpectrum(freq) {
  if (freq <= FREQ_MIN) return SPECTRUM[0].slice(1);
  if (freq >= FREQ_MAX) return SPECTRUM[SPECTRUM.length - 1].slice(1);
  for (let i = 1; i < SPECTRUM.length; i++) {
    if (freq <= SPECTRUM[i][0]) {
      const t = (freq - SPECTRUM[i - 1][0]) / (SPECTRUM[i][0] - SPECTRUM[i - 1][0]);
      return [1, 2, 3].map(k => SPECTRUM[i - 1][k] + t * (SPECTRUM[i][k] - SPECTRUM[i - 1][k]));
    }
  }
}

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
        position: absolute; inset: 0;
        padding: 4rem 0;
        display: flex; flex-direction: column; align-items: center;
        background: var(--wave-bg, black);
        color: var(--fg, white);
        transition: background 0.25s ease, color 0.25s ease;
        font-family: 'Silkscreen', monospace;
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
        font-size: clamp(0.7rem, 1.5vw, 0.9rem);
        letter-spacing: 0.08em; text-transform: uppercase;
        opacity: 0.75; margin-top: 1.5rem;
      }
      .wave-controls {
        display: flex; flex-direction: column;
        gap: 1.25rem; width: min(600px, 80%);
        margin-top: auto; padding-bottom: 5vh;
      }
      .wave-dial {
        display: flex; align-items: center; gap: 4rem;
        font-size: clamp(0.6rem, 1.2vw, 0.75rem);
        letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
      }
      .wave-dial-label { flex-shrink: 0; width: 6em; }
      .wave-dial input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: currentColor;
      }
    </style>
    <div class="wave-demo">
      <div class="wave-wrap">
        <svg class="wave-svg"><path class="wave-path"></path></svg>
      </div>
      <div class="wave-readout">
        <span class="wave-freq-readout"></span>
        <span class="wave-amp-readout"></span>
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
  const ampReadout  = container.querySelector(".wave-amp-readout");

  container.querySelector(".wave-freq-input")
    .addEventListener("input", e => { freq = parseFloat(e.target.value); update(); });
  container.querySelector(".wave-amp-input")
    .addEventListener("input", e => { amp  = parseFloat(e.target.value); update(); });

  // ── Wave animation ────────────────────────────────────────────────────
  let phase = 0;
  let rafId = null;
  let cachedW = 0;

  function buildPath(tNorm) {
    const W   = waveWrap.clientWidth || window.innerWidth;
    const H   = 260;
    const mid = H / 2;

    // Only update SVG dimensions when width actually changes
    if (W !== cachedW) {
      svg.setAttribute("width",   W);
      svg.setAttribute("height",  H);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      cachedW = W;
    }

    const cycles  = 2 + tNorm * 6;
    const waveAmp = mid * 0.85 * Math.pow(amp, 0.7);
    const steps   = Math.ceil(W);
    const pts     = [];

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * W;
      const y = mid + Math.sin((i / steps) * cycles * Math.PI * 2 + phase) * waveAmp;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    path.setAttribute("d", pts.join(" "));
  }

  function animate() {
    const tNorm = (freq - FREQ_MIN) / (FREQ_MAX - FREQ_MIN);
    phase += 0.02 + tNorm * 0.04;
    buildPath(tNorm);
    rafId = requestAnimationFrame(animate);
  }

  // ── Update colors via CSS custom properties ───────────────────────────
  function update() {
    const [hue, chroma, naturalL] = freqToSpectrum(freq);
    const L  = amp * naturalL;
    const fg = L > 0.55 ? "black" : "white";
    // Fade chroma to 0 near black — ensures oklch(0 0 0) = unambiguous black
    const C  = L < 0.05 ? chroma * (L / 0.05) : chroma;

    // Single custom property: CSS owns the color value and its transition
    root.style.setProperty("--wave-bg", `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${hue.toFixed(1)})`);
    root.style.setProperty("--fg", fg);

    freqReadout.textContent = `${Math.round(freq)} THz · ${freqToName(freq)}`;
    ampReadout.textContent  = `amplitude ${amp.toFixed(2)}`;
  }

  update();
  animate();

  // ── cleanup ───────────────────────────────────────────────────────────
  return function cleanup() {
    cancelAnimationFrame(rafId);
    container.innerHTML = "";
  };
}
