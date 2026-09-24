// ── colour math (same as colorblind.js) ────────────────────────────────────
function oklchToLinearRGB(L, C, H) {
  const hr = H * Math.PI / 180;
  const a  = C * Math.cos(hr);
  const b  = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const lc = l_**3, mc = m_**3, sc = s_**3;
  return [
     4.0767416621*lc - 3.3077115913*mc + 0.2309699292*sc,
    -1.2684380046*lc + 2.6097574011*mc - 0.3413193965*sc,
    -0.0041960863*lc - 0.7034186147*mc + 1.7076147010*sc,
  ];
}

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
        position: absolute; inset: 0;
        background: #000;
        font-family: 'Silkscreen', monospace;
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
        flex: 1; height: 100%;
        border-radius: 0.5rem;
        position: relative;
      }
      .sw-swatch-label {
        position: absolute;
        bottom: 1rem; left: 50%;
        transform: translateX(-50%);
        font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase;
        color: rgba(255,255,255,0.7);
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        padding: 0.25em 0.6em;
        border-radius: 999px;
        white-space: nowrap;
      }
      .sw-controls {
        display: flex; flex-direction: column;
        align-items: center; gap: 0.85rem;
        padding: 0.6em 1.2em 0.8em;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        margin: 0 auto 2.5rem;
        min-width: min(500px, 72%);
      }
      .sw-type-label {
        font: clamp(1rem, 3vw, 1.8rem)/1 'Silkscreen', monospace;
        letter-spacing: 0.06em; text-transform: uppercase;
        color: rgba(255,255,255,0.9);
      }
      .sw-common {
        font: 0.58rem/1 'Silkscreen', monospace;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.45);
        margin-top: 0.4em;
      }
      .sw-toggle-row { display: flex; gap: 0.5rem; }
      .sw-toggle {
        font: 600 0.62rem/1 monospace;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.45);
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 999px;
        padding: 0.35rem 0.8rem;
        cursor: pointer;
        transition: color 0.15s, background 0.15s;
      }
      .sw-toggle.active {
        color: #fff;
        background: rgba(255,255,255,0.2);
        border-color: rgba(255,255,255,0.4);
      }
      .sw-slider-row {
        display: flex; align-items: center; gap: 1.25rem;
        width: 100%;
        font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.4);
      }
      .sw-slider-row input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: white;
      }
    </style>
    <div class="sw-wrap">
      <div class="sw-stage">
        <div class="sw-swatch" id="sw-fig">
          <span class="sw-swatch-label">Figure</span>
        </div>
        <div class="sw-swatch" id="sw-bg">
          <span class="sw-swatch-label">Background</span>
        </div>
      </div>
      <div class="sw-controls">
        <span class="sw-type-label">Deuteranomaly</span>
        <span class="sw-common">WCAG AA contrast (4.5:1)</span>
        <div class="sw-toggle-row">
          <button class="sw-toggle active" data-a11y="false" aria-pressed="true">Before</button>
          <button class="sw-toggle" data-a11y="true" aria-pressed="false">After</button>
        </div>
        <div class="sw-slider-row">
          <span>Normal</span>
          <input type="range" id="sw-range" min="0" max="1" step="0.005" value="0" aria-label="Simulation severity">
          <span>Simulated</span>
        </div>
      </div>
    </div>
  `;

  const figEl = container.querySelector('#sw-fig');
  const bgEl  = container.querySelector('#sw-bg');

  function css([L, C, H]) {
    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
  }

  function render() {
    const figNorm = useA11y ? figAfter    : figBefore;
    const figSim  = useA11y ? figAfterSim : figBeforeSim;
    const bgNorm  = useA11y ? bgAfter     : bgBefore;
    const bgSim   = useA11y ? bgAfterSim  : bgBeforeSim;
    figEl.style.background = css(lerpOKLCH(figNorm, figSim, severity));
    bgEl.style.background  = css(lerpOKLCH(bgNorm,  bgSim,  severity));
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
