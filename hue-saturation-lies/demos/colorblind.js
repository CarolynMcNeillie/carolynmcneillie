// ── Color math ─────────────────────────────────────────────────────────────

function oklchToLinearRGB(L, C, H) {
  const hr = H * Math.PI / 180;
  const a  = C * Math.cos(hr);
  const b  = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const lc = l_ ** 3, mc = m_ ** 3, sc = s_ ** 3;

  return [
     4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc,
  ];
}

function linearRGBToOKLCH(r, g, b) {
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);

  const lc = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const mc = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const sc = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(lc), m_ = Math.cbrt(mc), s_ = Math.cbrt(sc);

  const L  =  0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a  =  1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bv =  0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + bv * bv);
  const H = ((Math.atan2(bv, a) * 180 / Math.PI) + 360) % 360;
  return [L, C, H];
}

// Machado et al. 2009 — dichromacy simulation matrices (linear sRGB)
const CVD_MATRICES = {
  deuteranopia:  [ 0.367322,  0.860646, -0.227968,  0.280085,  0.672501,  0.047413, -0.011820,  0.042940,  0.968881],
  protanopia:    [ 0.152286,  1.052583, -0.204868,  0.114503,  0.786281,  0.099216, -0.003882, -0.048116,  1.051998],
  tritanopia:    [ 1.255528, -0.076749, -0.178779, -0.078411,  0.930809,  0.147602,  0.004733,  0.691367,  0.303900],
};

// Anomaly types share the same confusion axis as their anopia counterparts;
// the slider lerps from typical → full dichromacy, passing through the
// anomalous experience along the way.
const ANOPIA_FOR = { deuteranomaly: 'deuteranopia', protanomaly: 'protanopia', 'deuteranomaly-a11y': 'deuteranopia' };

function simulateOKLCH(L, C, H, type) {
  // Achromatopsia: zero chroma in OKLCH — perceptually accurate greyscale
  if (type === 'achromatopsia') return [L, 0, H];
  const m = CVD_MATRICES[ANOPIA_FOR[type] ?? type];
  const [r, g, b] = oklchToLinearRGB(L, C, H);
  return linearRGBToOKLCH(
    m[0]*r + m[1]*g + m[2]*b,
    m[3]*r + m[4]*g + m[5]*b,
    m[6]*r + m[7]*g + m[8]*b,
  );
}

// Lerp hue via shortest arc
function lerpHue(a, b, t) {
  let d = b - a;
  if (d >  180) d -= 360;
  if (d < -180) d += 360;
  return ((a + d * t) + 360) % 360;
}

function lerpOKLCH([L0, C0, H0], [L1, C1, H1], t) {
  return [L0 + (L1-L0)*t, C0 + (C1-C0)*t, lerpHue(H0, H1, t)];
}

// ── Shape tests ──────────────────────────────────────────────────────────────
// Standard parametric heart: (x²+y²-1)³ - x²y³ ≤ 0  (y is up)
function inHeart(nx, ny) {
  return (nx*nx + ny*ny - 1)**3 - nx*nx * ny**3 <= 0;
}

// Returns a (cx, cy) → boolean function for the given type.
// Deuteranopia/protanopia/tritanopia: bold digit rendered to an offscreen
// canvas; figure = inside the glyph alpha mask.
// Achromatopsia: parametric heart in normalised coords.
const SHAPE_DIGITS = { deuteranomaly: '8', protanomaly: '6', tritanopia: '3', 'deuteranomaly-a11y': '8' };

const CVD_COMMON = {
  deuteranomaly:       'Red-green colour blindness',
  protanomaly:         'Red-green colour blindness',
  tritanopia:          'Blue-yellow colour blindness',
  achromatopsia:       'Complete colour blindness',
  'deuteranomaly-a11y': 'WCAG AA contrast (4.5:1)',
};

const CVD_LABELS = {
  'deuteranomaly-a11y': 'Deuteranomaly',
};

function buildShapeTest(type, W, H) {
  if (type === 'achromatopsia') {
    const scale = Math.min(W, H) * 0.28;
    const hcx = W / 2, hcy = H / 2 + scale * 0.05;
    return (cx, cy) => inHeart((cx - hcx) / scale, -(cy - hcy) / scale);
  }

  const digit  = SHAPE_DIGITS[type];
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx  = canvas.getContext('2d');
  const size = Math.min(W, H) * 0.82;
  ctx.fillStyle = 'white';
  ctx.font = `900 ${size}px Arial Black, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(digit, W / 2, H / 2);
  const { data } = ctx.getImageData(0, 0, W, H);
  return (cx, cy) => {
    const px = Math.round(cx), py = Math.round(cy);
    if (px < 0 || py < 0 || px >= W || py >= H) return false;
    return data[(py * W + px) * 4 + 3] > 128;
  };
}

// ── Circle generation ────────────────────────────────────────────────────────
const CVD_TYPES = ['deuteranomaly', 'protanomaly', 'tritanopia', 'achromatopsia', 'deuteranomaly-a11y'];

// Hue ranges [base, spread] and chroma [base, spread] chosen so the
// figure/ground pair lies on that type's confusion axis and collapses
// dramatically under simulation.
// figL/bgL: fixed OKLCH lightness for figure/background (overrides shared L).
// Chosen so (bgL³ + 0.05) / (figL³ + 0.05) ≥ 4.5 (WCAG AA).
const TYPE_HUES = {
  deuteranomaly:       { fig: [20,  30], bg: [130, 40], c: [0.14, 0.06] }, // red-orange vs green
  protanomaly:         { fig: [20,  30], bg: [130, 40], c: [0.14, 0.06] }, // same pair
  tritanopia:          { fig: [255, 20], bg: [145, 25], c: [0.20, 0.06] }, // blue vs green — classic S-cone confusion axis
  achromatopsia:       { fig: [340, 80], bg: [160, 110], c: [0.18, 0.06] }, // warm vs cool — maximum colour contrast before collapse
  'deuteranomaly-a11y': { fig: [20, 30], bg: [130, 40], c: [0.16, 0.06], figL: 0.34, bgL: 0.76 }, // same hues, lightness split for ≥4.5:1 WCAG AA
};

function buildCircles(W, H, type) {
  const inShape = buildShapeTest(type, W, H);

  // Two independent xorshift32 RNGs: one for layout, one for colour.
  // Keeping them separate means positions/radii are identical across all types.
  let lseed = 0xdeadbeef;
  const lrand = () => { lseed ^= lseed << 13; lseed ^= lseed >> 17; lseed ^= lseed << 5; return (lseed >>> 0) / 0x100000000; };

  let cseed = 0xcafebabe;
  const crand = () => { cseed ^= cseed << 13; cseed ^= cseed >> 17; cseed ^= cseed << 5; return (cseed >>> 0) / 0x100000000; };

  // Honeycomb grid: centers at hex positions, slight radius variation for texture
  const R    = Math.min(W, H) / 52;
  const HX   = R * 2.08;
  const HY   = R * Math.sqrt(3);
  const COLS = Math.ceil(W / HX) + 2;
  const ROWS = Math.ceil(H / HY) + 2;

  const circles = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cx = col * HX + (row % 2) * (HX / 2);
      const cy = row * HY;
      const r  = R * (0.70 + lrand() * 0.14); // layout RNG

      const figure = inShape(cx, cy);

      // L shared across types — Ishihara principle:
      // brightness alone cannot reveal the heart.
      const L = 0.62 + crand() * 0.12;

      // Per-type: hue pair + chroma optimised for that type's confusion axis.
      // figL/bgL override the shared L for a11y variants to guarantee WCAG contrast.
      // normalsAlt/simulatedAlt store the same hues but with shared L, for the toggle.
      const normals      = {};
      const simulated    = {};
      const normalsAlt   = {};
      const simulatedAlt = {};
      for (const cvdType of CVD_TYPES) {
        const { fig, bg, c, figL, bgL } = TYPE_HUES[cvdType];
        const baseL = figL !== undefined ? (figure ? figL : bgL) : L;
        const C   = c[0] + crand() * c[1];
        const Hue = figure
          ? (fig[0] + crand() * fig[1]) % 360
          : (bg[0]  + crand() * bg[1])  % 360;
        normals[cvdType]   = [baseL, C, Hue];
        simulated[cvdType] = simulateOKLCH(baseL, C, Hue, cvdType);
        // For a11y types, also store the before version (shared L, same hues)
        if (figL !== undefined) {
          normalsAlt[cvdType]   = [L, C, Hue];
          simulatedAlt[cvdType] = simulateOKLCH(L, C, Hue, cvdType);
        }
      }

      circles.push({ cx, cy, r, normals, simulated, normalsAlt, simulatedAlt });
    }
  }

  return circles;
}

// ── mount ────────────────────────────────────────────────────────────────────
export function mount(container, type = 'deuteranomaly') {
  let circles = [];
  let els     = [];
  let severity = 0;

  const label      = CVD_LABELS[type] ?? (type.charAt(0).toUpperCase() + type.slice(1));
  const common     = CVD_COMMON[type];
  const isA11yType = TYPE_HUES[type]?.figL !== undefined;
  let useA11y = false;

  container.innerHTML = `
    <style>
      .cvd-wrap {
        position: absolute; inset: 0;
        background: #111;
        font-family: 'Silkscreen', monospace;
      }
      .cvd-svg { display: block; }
      .cvd-controls {
        position: absolute;
        bottom: 2.5rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex; flex-direction: column;
        align-items: center; gap: 0.85rem;
        padding: 0.6em 1.2em 0.8em;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        min-width: min(500px, 72%);
      }
      .cvd-type-label {
        font: clamp(1rem, 3vw, 1.8rem)/1 'Silkscreen', monospace;
        letter-spacing: 0.06em; text-transform: uppercase;
        color: rgba(255,255,255,0.9);
      }
      .cvd-common {
        font: 0.58rem/1 'Silkscreen', monospace;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.45);
        margin-top: 0.4em;
      }
      .cvd-slider-row {
        display: flex; align-items: center; gap: 1.25rem;
        width: 100%;
        font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.4);
      }
      .cvd-slider-row input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: white;
      }
      .cvd-toggle-row {
        display: flex; gap: 0.5rem;
      }
      .cvd-toggle {
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
      .cvd-toggle.active {
        color: #fff;
        background: rgba(255,255,255,0.2);
        border-color: rgba(255,255,255,0.4);
      }
    </style>
    <div class="cvd-wrap">
      <svg class="cvd-svg" role="img" aria-label="Ishihara-style colour blindness test pattern"></svg>
      <div class="cvd-controls">
        <span class="cvd-type-label">${label}</span>
        <span class="cvd-common">${common}</span>
        ${isA11yType ? `<div class="cvd-toggle-row">
          <button class="cvd-toggle active" data-a11y="false" aria-pressed="true">Before</button>
          <button class="cvd-toggle" data-a11y="true" aria-pressed="false">After</button>
        </div>` : ''}
        <div class="cvd-slider-row">
          <span>Normal</span>
          <input type="range" id="cvd-range" min="0" max="1" step="0.005" value="0" aria-label="Simulation severity">
          <span>Simulated</span>
        </div>
      </div>
    </div>
  `;

  const svg = container.querySelector('svg');

  function render() {
    circles.forEach(({ normals, simulated, normalsAlt, simulatedAlt }, i) => {
      const useBefore = isA11yType && !useA11y;
      const norm = useBefore ? normalsAlt[type] : normals[type];
      const sim  = useBefore ? simulatedAlt[type] : simulated[type];
      const [L, C, H] = lerpOKLCH(norm, sim, severity);
      els[i].setAttribute('fill', `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`);
    });
  }

  function rebuild() {
    const W = container.clientWidth  || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;
    svg.setAttribute('width',   W);
    svg.setAttribute('height',  H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    circles = buildCircles(W, H, type);
    els = circles.map(({ cx, cy, r }) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      el.setAttribute('cx', cx.toFixed(1));
      el.setAttribute('cy', cy.toFixed(1));
      el.setAttribute('r',  r.toFixed(1));
      svg.appendChild(el);
      return el;
    });
    render();
  }

  container.querySelector('#cvd-range').addEventListener('input', e => {
    severity = parseFloat(e.target.value);
    render();
  });

  if (isA11yType) {
    container.querySelectorAll('.cvd-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        useA11y = btn.dataset.a11y === 'true';
        container.querySelectorAll('.cvd-toggle').forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        render();
      });
    });
  }

  let resizeTimer;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(rebuild, 150); };
  window.addEventListener('resize', onResize);

  rebuild();
  return () => {
    window.removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);
    container.innerHTML = '';
  };
}
