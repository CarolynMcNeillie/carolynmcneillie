// ── Colour Matching Experiment Demo ─────────────────────────────────────────
//
// Simulates the CIE colour matching experiment: split field — left half shows
// a test colour; right half is an additive mixture of three primaries
// (red ≈ 700 nm, green ≈ 546 nm, blue ≈ 436 nm) controlled by sliders.
//
// Mixing is done correctly in linear sRGB (additive light), then converted to
// OKLCH for CSS output.  Both halves are rendered as CSS oklch() values so the
// browser handles them in the same colour space.

// ── Colour math ──────────────────────────────────────────────────────────────

function linearToSRGB(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function linearSRGBToOKLCH(r, g, b) {
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  const lc = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b;
  const mc = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b;
  const sc = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b;
  const l_ = Math.cbrt(lc), m_ = Math.cbrt(mc), s_ = Math.cbrt(sc);
  const L  =  0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_;
  const a  =  1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_;
  const bv =  0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_;
  const C = Math.sqrt(a*a + bv*bv);
  const H = ((Math.atan2(bv, a) * 180 / Math.PI) + 360) % 360;
  return { L, C, H };
}

function oklchToLinearSRGB(L, C, H) {
  const hr = H * Math.PI / 180;
  const a  = C * Math.cos(hr);
  const b  = C * Math.sin(hr);
  const l_ = L + 0.3963377774*a + 0.2158037573*b;
  const m_ = L - 0.1055613458*a - 0.0638541728*b;
  const s_ = L - 0.0894841775*a - 1.2914855480*b;
  const lc = l_**3, mc = m_**3, sc = s_**3;
  return [
     4.0767416621*lc - 3.3077115913*mc + 0.2309699292*sc,
    -1.2684380046*lc + 2.6097574011*mc - 0.3413193965*sc,
    -0.0041960863*lc - 0.7034186147*mc + 1.7076147010*sc,
  ];
}

// ── Primaries ─────────────────────────────────────────────────────────────────
// Approximate CIE 1931 primaries as linear sRGB values.
// Each primary is a near-monochromatic light: red≈700nm, green≈546nm, blue≈436nm.
// Scaled so that full R+G+B produces a bright neutral (≈ equal-energy white).
const PRIMARY_LINEAR = [
  [0.628, 0.034, 0.000], // red   ~700nm
  [0.070, 0.622, 0.000], // green ~546nm
  [0.000, 0.044, 0.628], // blue  ~436nm
];

const PRIMARIES = [
  { label: 'R', accent: '#e85c3a' },
  { label: 'G', accent: '#3ec87a' },
  { label: 'B', accent: '#4d7aff' },
];

// ── Test colours ──────────────────────────────────────────────────────────────
// Each colour is derived by running mixPrimaries at specific weights and
// recording the OKLCH output — so they are guaranteed reachable.
//
//  yellowish  R=0.90 G=0.60 B=0.00  → oklch(0.747 0.153  94)
//  teal       R=0.00 G=0.80 B=0.80  → oklch(0.741 0.109 192)
//  violet     R=0.80 G=0.00 B=0.80  → oklch(0.598 0.204 328)
//  orange-red R=0.90 G=0.00 B=0.00  → oklch(0.544 0.192  35)
//  warm white R=0.70 G=0.70 B=0.70  → oklch(0.786 0.010  90)
const TEST_COLOURS = [
  { L: 0.747, C: 0.153, H: 94  }, // yellowish  (R+G)
  { L: 0.741, C: 0.109, H: 192 }, // teal       (G+B)
  { L: 0.598, C: 0.204, H: 328 }, // violet     (R+B)
  { L: 0.544, C: 0.192, H: 35  }, // orange-red (R only)
  { L: 0.786, C: 0.010, H: 90  }, // warm white (R+G+B)
];

function randomIdx(excluding) {
  let idx;
  do { idx = Math.floor(Math.random() * TEST_COLOURS.length); } while (idx === excluding);
  return idx;
}

let testIdx = randomIdx(-1);

function oklchCSS({ L, C, H }) {
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

function srgbL(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function textOnBg(linR, linG, linB) {
  const lum = 0.2126 * linR + 0.7152 * linG + 0.0722 * linB;
  return (lum + 0.05) / 0.05 >= 1.05 / (lum + 0.05) ? '#000' : '#fff';
}

// Real additive mix: sum linear RGB contributions, convert back to OKLCH.
function mixPrimaries(weights) {
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < 3; i++) {
    r += weights[i] * PRIMARY_LINEAR[i][0];
    g += weights[i] * PRIMARY_LINEAR[i][1];
    b += weights[i] * PRIMARY_LINEAR[i][2];
  }
  // Clamp: physical lights can't go negative
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  return linearSRGBToOKLCH(r, g, b);
}

// ── Mount ─────────────────────────────────────────────────────────────────────
export function mount(container) {
  const weights = [0, 0, 0];

  container.innerHTML = `
    <style>
      .cm-wrap {
        position: absolute; inset: 0;
        background: #0a0a0a;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: 'Silkscreen', monospace;
        gap: 2.5rem;
        padding: 2rem;
      }
      .cm-field {
        display: flex;
        width: min(700px, 90vw);
        height: min(260px, 28vh);
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.08);
      }
      .cm-half {
        flex: 1;
        transition: background-color 0.08s ease;
        position: relative;
      }
      .cm-half-label {
        position: absolute;
        bottom: 0.6rem; left: 50%;
        transform: translateX(-50%);
        font-size: 0.55rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.6;
        pointer-events: none;
        white-space: nowrap;
        transition: color 0.08s ease;
      }
      .cm-divider {
        width: 2px;
        background: #0a0a0a;
        flex-shrink: 0;
      }
      .cm-controls {
        display: flex; flex-direction: column; gap: 1.1rem;
        width: min(700px, 90vw);
      }
      .cm-slider-row {
        display: flex; align-items: center; gap: 1.2rem;
      }
      .cm-primary-dot {
        width: 0.75rem; height: 0.75rem;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cm-slider-label {
        font-size: 0.6rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.45);
        width: 1.4rem;
      }
      .cm-slider-row input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: white;
      }
      .cm-nav {
        display: flex; align-items: center; gap: 1.2rem;
      }
      .cm-nav-btn {
        background: rgba(255,255,255,0.08);
        border: none; border-radius: 4px;
        color: rgba(255,255,255,0.6);
        font: 0.6rem/1 'Silkscreen', monospace;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.5em 1.4em;
        cursor: pointer;
      }
      .cm-nav-btn:hover { background: rgba(255,255,255,0.14); }
      .cm-hint {
        font-size: 0.55rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.25);
      }
    </style>
    <div class="cm-wrap">
      <div class="cm-field">
        <div class="cm-half" id="cm-test">
          <span class="cm-half-label">Test colour</span>
        </div>
        <div class="cm-divider"></div>
        <div class="cm-half" id="cm-mix">
          <span class="cm-half-label">Your mix</span>
        </div>
      </div>
      <div class="cm-controls">
        ${PRIMARIES.map((p, i) => `
          <div class="cm-slider-row">
            <div class="cm-primary-dot" style="background:${p.accent}"></div>
            <span class="cm-slider-label">${p.label}</span>
            <input type="range" class="cm-slider" data-i="${i}"
                   min="0" max="1" step="0.005" value="${weights[i]}">
          </div>
        `).join('')}
      </div>
      <div class="cm-nav">
        <span class="cm-hint">try to match the left half</span>
        <button class="cm-nav-btn" id="cm-next">give me another</button>
      </div>
    </div>
  `;

  const testEl      = container.querySelector('#cm-test');
  const mixEl       = container.querySelector('#cm-mix');
  const testLabelEl = testEl.querySelector('.cm-half-label');
  const mixLabelEl  = mixEl.querySelector('.cm-half-label');

  function render() {
    const t   = TEST_COLOURS[testIdx % TEST_COLOURS.length];
    const mix = mixPrimaries(weights);

    testEl.style.backgroundColor = oklchCSS(t);
    mixEl.style.backgroundColor  = oklchCSS(mix);

    const [tr, tg, tb] = oklchToLinearSRGB(t.L, t.C, t.H);
    testLabelEl.style.color = textOnBg(Math.max(0, tr), Math.max(0, tg), Math.max(0, tb));

    const [mr, mg, mb] = oklchToLinearSRGB(mix.L, mix.C, mix.H);
    mixLabelEl.style.color = textOnBg(Math.max(0, mr), Math.max(0, mg), Math.max(0, mb));
  }

  container.querySelectorAll('.cm-slider').forEach(sl => {
    sl.addEventListener('input', () => {
      weights[+sl.dataset.i] = parseFloat(sl.value);
      render();
    });
  });

  function resetSliders() {
    weights.fill(0);
    container.querySelectorAll('.cm-slider').forEach(sl => { sl.value = 0; });
  }

  container.querySelector('#cm-next').addEventListener('click', () => {
    testIdx = randomIdx(testIdx);
    resetSliders();
    render();
  });

  render();

  return () => { container.innerHTML = ''; };
}
