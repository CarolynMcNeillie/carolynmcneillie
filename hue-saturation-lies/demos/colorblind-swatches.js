// ── colour math ────────────────────────────────────────────────────────────
import { oklchToLinearRGB } from './colour-utils.js';

function linearRGBToOKLCH(r, g, b) {
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  const lc = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b;
  const mc = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b;
  const sc = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b;
  const l_ = Math.cbrt(lc), m_ = Math.cbrt(mc), s_ = Math.cbrt(sc);
  const Lo =  0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_;
  const a  =  1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_;
  const bv =  0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_;
  const Co = Math.sqrt(a*a + bv*bv);
  const Ho = ((Math.atan2(bv, a) * 180 / Math.PI) + 360) % 360;
  return [Lo, Co, Ho];
}

// Deuteranopia matrix — Machado et al. 2009
const M = [0.367322,0.860646,-0.227968, 0.280085,0.672501,0.047413, -0.011820,0.042940,0.968881];

function simulate(L, C, H) {
  const [r, g, b] = oklchToLinearRGB(L, C, H);
  return linearRGBToOKLCH(
    M[0]*r + M[1]*g + M[2]*b,
    M[3]*r + M[4]*g + M[5]*b,
    M[6]*r + M[7]*g + M[8]*b,
  );
}

function lerpOKLCH([L0,C0,H0],[L1,C1,H1],t) {
  let d = H1-H0;
  if (d >  180) d -= 360;
  if (d < -180) d += 360;
  return [L0+(L1-L0)*t, C0+(C1-C0)*t, ((H0+d*t)+360)%360];
}

// ── representative colours (same hues/chroma as colorblind.js TYPE_HUES) ───
const FIG_H = 28,  FIG_C = 0.18;   // red-orange
const BG_H  = 145, BG_C  = 0.16;   // green
const SHARED_L = 0.68;              // same-lightness "before" (Ishihara principle)
const FIG_L    = 0.34;              // a11y dark red
const BG_L     = 0.76;              // a11y light green

// ── mount ────────────────────────────────────────────────────────────────────
export function mount(container) {
  let severity = 0;
  let useA11y  = false;

  const figBefore    = [SHARED_L, FIG_C, FIG_H];
  const figAfter     = [FIG_L,    FIG_C, FIG_H];
  const bgBefore     = [SHARED_L, BG_C,  BG_H];
  const bgAfter      = [BG_L,     BG_C,  BG_H];
  const figBeforeSim = simulate(SHARED_L, FIG_C, FIG_H);
  const figAfterSim  = simulate(FIG_L,    FIG_C, FIG_H);
  const bgBeforeSim  = simulate(SHARED_L, BG_C,  BG_H);
  const bgAfterSim   = simulate(BG_L,     BG_C,  BG_H);

  container.innerHTML = `
    <style>
      .sw-wrap {

        background: #000;

        display: flex; flex-direction: column;
      }
      .sw-stage {
        flex: 1; min-height: 0;
        display: flex;
        align-items: center; justify-content: center;
        gap: 2rem;
        padding: 2rem 3rem 1rem;
      }
      .sw-swatch {
        background: var(--swatch-color);
        color: var(--ink);
        color: contrast-color(var(--swatch-color));
        flex: 1; height: 100%;
        border-radius: var(--radius-lg);
        position: relative;
      }
      .sw-swatch-label {
        position: absolute;
        bottom: 1rem; left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
      }
      .sw-controls { padding: 0.6em 1.2em 0.8em;
        display: flex; flex-direction: column;
        align-items: center; gap: 0.85rem;

        margin: 0 auto 1rem;
        min-width: min(500px, 72%);
      }
      .sw-type-label {
        font: clamp(1rem, 3vw, 1.8rem)/1 var(--font-display);
        letter-spacing: var(--tracking-caps); text-transform: uppercase;
        color: var(--ink);
      }
      .sw-common {
        line-height: 1;
        color: var(--ink-muted);
        margin-top: 0.4em;
      }
      .sw-toggle-row { display: flex; gap: 0.5rem; }

      .sw-slider-row {
        display: flex; align-items: center; gap: 1.25rem;
        width: 100%;

        color: var(--ink-muted);
      }
      .sw-slider-row input[type=range] { flex: 1; }
    </style>
    <div class="sw-wrap demo-root">
      <div class="sw-stage">
        <div class="sw-swatch" id="sw-fig">
          <span class="sw-swatch-label caps-label">Figure</span>
        </div>
        <div class="sw-swatch" id="sw-bg">
          <span class="sw-swatch-label caps-label">Background</span>
        </div>
      </div>
      <div class="sw-controls glass-panel">
        <span class="sw-type-label">Deuteranomaly</span>
        <span class="sw-common caps-label" id="sw-contrast"></span>
        <div class="sw-toggle-row">
          <button class="sw-toggle pill-button active" data-a11y="false" aria-pressed="true">Before</button>
          <button class="sw-toggle pill-button" data-a11y="true" aria-pressed="false">After</button>
        </div>
        <div class="sw-slider-row caps-label ">
          <span>Normal</span>
          <input type="range" id="sw-range" min="0" max="1" step="0.005" value="0" aria-label="Simulation severity">
          <span>Simulated</span>
        </div>
      </div>
    </div>
  `;

  const figEl = container.querySelector('#sw-fig');
  const bgEl  = container.querySelector('#sw-bg');
  const contrastEl = container.querySelector('#sw-contrast');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Read the browser's sRGB pixel after it maps the CSS OKLCH colour to the display gamut.
  function luminance(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const channels = ctx.getImageData(0, 0, 1, 1).data;
    const linear = c => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linear(channels[0]) + 0.7152 * linear(channels[1]) + 0.0722 * linear(channels[2]);
  }

  function css([L, C, H]) {
    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
  }

  function render() {
    const figNorm = useA11y ? figAfter    : figBefore;
    const figSim  = useA11y ? figAfterSim : figBeforeSim;
    const bgNorm  = useA11y ? bgAfter     : bgBefore;
    const bgSim   = useA11y ? bgAfterSim  : bgBeforeSim;
    const figColor = css(lerpOKLCH(figNorm, figSim, severity));
    const bgColor = css(lerpOKLCH(bgNorm, bgSim, severity));
    figEl.style.setProperty('--swatch-color', figColor);
    bgEl.style.setProperty('--swatch-color', bgColor);
    const a = luminance(figColor), b = luminance(bgColor);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    contrastEl.textContent = `Figure/background contrast: ${ratio.toFixed(2)}:1 (${ratio >= 4.5 ? 'WCAG AA' : 'below WCAG AA'})`;
  }

  container.querySelector('#sw-range').addEventListener('input', e => {
    severity = parseFloat(e.target.value);
    render();
  });

  container.querySelectorAll('.sw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      useA11y = btn.dataset.a11y === 'true';
      container.querySelectorAll('.sw-toggle').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      render();
    });
  });

  render();
  return () => { container.innerHTML = ''; };
}
