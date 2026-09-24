// ── RGB / Subpixel Demo ──────────────────────────────────────────────────────
// One pixel. Three subpixel bars. Each bar IS the slider.

function toHex2(n)  { return n.toString(16).padStart(2, '0').toUpperCase(); }
function toBin8(n)  { return n.toString(2).padStart(8, '0'); }

function srgbL(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function textOnBg(r, g, b) {
  const L = 0.2126 * srgbL(r) + 0.7152 * srgbL(g) + 0.0722 * srgbL(b);
  return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? '#000' : '#fff';
}

const CHANNELS = [
  { label: 'R', bg: '#1a0000', fill: (v) => `rgb(${v},0,0)` },
  { label: 'G', bg: '#001a00', fill: (v) => `rgb(0,${v},0)` },
  { label: 'B', bg: '#00001a', fill: (v) => `rgb(0,0,${v})` },
];

export function mount(container, type) {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);

  container.innerHTML = `
    <style>
      .rgb-wrap {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 2rem;
        transition: background-color 0.08s ease, color 0.15s ease;
        font-family: 'Silkscreen', monospace;
      }
      .rgb-pixel {
        display: flex; gap: 3px;
      }
      .rgb-bar-wrap {
        display: flex; flex-direction: column;
        align-items: center; gap: 0.5rem;
      }
      .rgb-bar {
        position: relative;
        width: min(13vw, 13vh);
        height: min(39vw, 39vh); /* 3× the width so 3 bars = square pixel */
        border-radius: 3px;
        overflow: hidden;
        cursor: ns-resize;
      }
      .rgb-bar-fill {
        position: absolute; bottom: 0; left: 0; right: 0;
        transition: height 0.04s ease, background-color 0.04s ease;
        border-radius: 3px;
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
      .rgb-bar-label {
        font-size: 0.55rem; letter-spacing: 0.12em;
        text-transform: uppercase; opacity: 0.5;
      }
      /* Value grid ────────────────────────────────────────────── */
      .rgb-grid {
        display: grid;
        grid-template-columns: 3rem 1fr 1fr 1fr;
        row-gap: 0.6rem;
        column-gap: 0.5rem;
        width: min(420px, 88vw);
      }
      .rgb-grid-corner { /* empty top-left cell */ }
      .rgb-grid-head {
        font-size: 0.55rem; letter-spacing: 0.12em;
        text-transform: uppercase; opacity: 0.5;
        text-align: center;
      }
      .rgb-grid-label {
        font-size: 0.5rem; letter-spacing: 0.1em;
        text-transform: uppercase; opacity: 0.35;
        display: flex; align-items: center;
      }
      .rgb-grid-val {
        font-size: clamp(0.7rem, 2vw, 1rem);
        letter-spacing: 0.04em;
        font-variant-numeric: tabular-nums;
        text-align: center;
        opacity: 0.85;
      }
      .rgb-grid-val.bin {
        font-size: clamp(0.42rem, 1.1vw, 0.58rem);
        letter-spacing: 0.02em;
        opacity: 0.7;
      }
    </style>

    <div class="rgb-wrap" id="rgb-bg">
      <div class="rgb-pixel">
        ${CHANNELS.map((ch, i) => `
          <div class="rgb-bar-wrap">
            <span class="rgb-bar-label">${ch.label}</span>
            <div class="rgb-bar" id="bar-${i}" style="background:${ch.bg}">
              <div class="rgb-bar-fill" id="fill-${i}"></div>
              <input type="range" id="sl-${i}" min="0" max="255" value="${[r,g,b][i]}">
            </div>
          </div>
        `).join('')}
      </div>

      <div class="rgb-grid">
        <span class="rgb-grid-corner"></span>
        <span class="rgb-grid-head">R</span>
        <span class="rgb-grid-head">G</span>
        <span class="rgb-grid-head">B</span>

        <span class="rgb-grid-label">dec</span>
        <span class="rgb-grid-val" id="val-dec-r"></span>
        <span class="rgb-grid-val" id="val-dec-g"></span>
        <span class="rgb-grid-val" id="val-dec-b"></span>

        <span class="rgb-grid-label">hex</span>
        <span class="rgb-grid-val" id="val-hex-r"></span>
        <span class="rgb-grid-val" id="val-hex-g"></span>
        <span class="rgb-grid-val" id="val-hex-b"></span>

        <span class="rgb-grid-label">8-bit</span>
        <span class="rgb-grid-val bin" id="val-bin-r"></span>
        <span class="rgb-grid-val bin" id="val-bin-g"></span>
        <span class="rgb-grid-val bin" id="val-bin-b"></span>
      </div>
    </div>
  `;

  const bg = container.querySelector('#rgb-bg');

  // Cache all refs
  const fills  = [0, 1, 2].map(i => container.querySelector(`#fill-${i}`));
  const decEls = ['r', 'g', 'b'].map(c => container.querySelector(`#val-dec-${c}`));
  const hexEls = ['r', 'g', 'b'].map(c => container.querySelector(`#val-hex-${c}`));
  const binEls = ['r', 'g', 'b'].map(c => container.querySelector(`#val-bin-${c}`));

  function render() {
    const vals = [r, g, b];
    if (type !== 'black') {
      bg.style.backgroundColor = `rgb(${r},${g},${b})`;
      bg.style.color = textOnBg(r, g, b);
    } else {
      bg.style.color = '#fff';
    }

    vals.forEach((v, i) => {
      fills[i].style.height = `${(v / 255 * 100).toFixed(1)}%`;
      fills[i].style.backgroundColor = CHANNELS[i].fill(v);
      decEls[i].textContent = v;
      hexEls[i].textContent = toHex2(v);
      binEls[i].textContent = toBin8(v);
    });
  }

  container.querySelector('#sl-0').addEventListener('input', e => { r = +e.target.value; render(); });
  container.querySelector('#sl-1').addEventListener('input', e => { g = +e.target.value; render(); });
  container.querySelector('#sl-2').addEventListener('input', e => { b = +e.target.value; render(); });

  render();
  return () => { container.innerHTML = ''; };
}
