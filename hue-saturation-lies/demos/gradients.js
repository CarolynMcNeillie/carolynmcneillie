// ── Gradients Demo ───────────────────────────────────────────────────────────
// Compare CSS gradient interpolation in sRGB vs OKLCH.
// In sRGB, gradients between complementary colours pass through a muddy grey.
// In OKLCH, they take the shortest perceptual path — staying vivid.

const PAIRS = [
  {
    label:  'Blue → Yellow',
    hint:   'sRGB passes through grey. HSL swings around the hue wheel — vivid but uneven brightness. OKLCH stays vivid and perceptually consistent.',
    a:      { srgb: '#2255ff', oklch: 'oklch(0.52 0.28 264)' },
    b:      { srgb: '#f0c000', oklch: 'oklch(0.83 0.19 91)'  },
  },
  {
    label:  'Red → Cyan',
    hint:   'sRGB goes through a dark brown. HSL routes through the spectrum but spikes in brightness. OKLCH arcs through coral and teal evenly.',
    a:      { srgb: '#ff2020', oklch: 'oklch(0.60 0.24 26)'  },
    b:      { srgb: '#00d8d8', oklch: 'oklch(0.82 0.14 196)' },
  },
  {
    label:  'Purple → Green',
    hint:   'sRGB creates a washed midpoint. HSL travels through blue and cyan — colourful but brightness lurches. OKLCH keeps chroma high and even.',
    a:      { srgb: '#8800ff', oklch: 'oklch(0.48 0.28 293)' },
    b:      { srgb: '#00cc44', oklch: 'oklch(0.75 0.20 145)' },
  },
  {
    label:  'White → Vivid Pink',
    hint:   'sRGB loses saturation quickly. HSL holds hue but brightness is inconsistent. OKLCH holds colour longer and fades more naturally.',
    a:      { srgb: '#ffffff', oklch: 'oklch(1 0 0)'         },
    b:      { srgb: '#ff1493', oklch: 'oklch(0.60 0.28 0)'   },
  },
];

export function mount(container) {
  let current = 0;

  container.innerHTML = `
    <style>
      .gr-wrap {
        position: fixed; inset: 0;
        display: flex; flex-direction: column;
        font-family: 'Silkscreen', monospace;
      }
      .gr-band {
        flex: 1; position: relative;
      }
      .gr-band-tag {
        position: absolute; top: 50%; left: 1.8rem;
        transform: translateY(-50%);
        font-size: 0.5rem; letter-spacing: 0.12em; text-transform: uppercase;
        color: rgba(255,255,255,0.9);
        text-shadow: 0 1px 6px rgba(0,0,0,0.8);
      }
      .gr-divider {
        height: 3px; background: rgba(0,0,0,0.35); flex-shrink: 0;
      }
      .gr-controls {
        position: absolute;
        bottom: 2.5rem; left: 50%; transform: translateX(-50%);
        display: flex; flex-direction: column;
        align-items: center; gap: 1rem;
        padding: 0.9rem 1.6rem 1.1rem;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        min-width: min(460px, 80vw);
        pointer-events: none;
      }
      .gr-controls > * { pointer-events: auto; }
      .gr-pair-label {
        font-size: 0.55rem; letter-spacing: 0.14em;
        text-transform: uppercase; color: rgba(255,255,255,0.85);
      }
      .gr-nav {
        display: flex; align-items: center; gap: 1.4rem;
      }
      .gr-nav-btn {
        background: none;
        border: 1px solid rgba(255,255,255,0.35);
        color: rgba(255,255,255,0.7);
        font-family: 'Silkscreen', monospace;
        font-size: 0.48rem; letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.45rem 1rem; border-radius: 2px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
      }
      .gr-nav-btn:hover {
        border-color: rgba(255,255,255,0.7);
        color: rgba(255,255,255,1);
      }
      .gr-nav-dots { display: flex; gap: 6px; }
      .gr-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transition: background 0.2s;
      }
      .gr-dot.active { background: rgba(255,255,255,0.9); }
      .gr-hint {
        font-size: 0.5rem; letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.6); text-align: center;
        max-width: 420px; line-height: 1.7;
      }
    </style>

    <div class="gr-wrap">
      <div class="gr-band" id="gr-srgb">
        <span class="gr-band-tag">sRGB</span>
      </div>
      <div class="gr-divider"></div>
      <div class="gr-band" id="gr-hsl">
        <span class="gr-band-tag">HSL</span>
      </div>
      <div class="gr-divider"></div>
      <div class="gr-band" id="gr-oklch">
        <span class="gr-band-tag">OKLCH</span>
      </div>

      <div class="gr-controls">
        <span class="gr-pair-label" id="gr-label"></span>
        <div class="gr-nav">
          <button class="gr-nav-btn" id="gr-prev" aria-label="Previous gradient pair">← prev</button>
          <div class="gr-nav-dots" id="gr-dots" aria-hidden="true"></div>
          <button class="gr-nav-btn" id="gr-next" aria-label="Next gradient pair">next →</button>
        </div>
        <span class="gr-hint" id="gr-hint"></span>
        <button class="gr-nav-btn" id="gr-gray" aria-pressed="false">grayscale: off</button>
      </div>
    </div>
  `;

  const bandSrgb  = container.querySelector('#gr-srgb');
  const bandHsl   = container.querySelector('#gr-hsl');
  const bandOklch = container.querySelector('#gr-oklch');
  const labelEl   = container.querySelector('#gr-label');
  const hintEl    = container.querySelector('#gr-hint');
  const dotsEl    = container.querySelector('#gr-dots');

  PAIRS.forEach(() => {
    const d = document.createElement('div');
    d.className = 'gr-dot';
    dotsEl.appendChild(d);
  });

  function render() {
    const p = PAIRS[current];
    bandSrgb.style.background  = `linear-gradient(to right, ${p.a.srgb}, ${p.b.srgb})`;
    bandHsl.style.background   = `linear-gradient(in hsl to right, ${p.a.srgb}, ${p.b.srgb})`;
    bandOklch.style.background = `linear-gradient(in oklch to right, ${p.a.oklch}, ${p.b.oklch})`;
    labelEl.textContent = p.label;
    hintEl.textContent  = p.hint;
    dotsEl.querySelectorAll('.gr-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
  }

  container.querySelector('#gr-prev').addEventListener('click', () => {
    current = (current - 1 + PAIRS.length) % PAIRS.length;
    render();
  });
  container.querySelector('#gr-next').addEventListener('click', () => {
    current = (current + 1) % PAIRS.length;
    render();
  });

  const grayBtn = container.querySelector('#gr-gray');
  const grWrap  = container.querySelector('.gr-wrap');
  let grayActive = false;
  grayBtn.addEventListener('click', () => {
    grayActive = !grayActive;
    grWrap.style.filter = grayActive ? 'grayscale(1)' : '';
    grayBtn.classList.toggle('active', grayActive);
    grayBtn.setAttribute('aria-pressed', String(grayActive));
    grayBtn.textContent = grayActive ? 'grayscale: on' : 'grayscale: off';
  });

  render();
  return () => { container.innerHTML = ''; };
}
