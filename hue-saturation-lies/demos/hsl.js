// ── HSL Interactive Demo ─────────────────────────────────────────────────────
// Hue, Saturation, Lightness — the "human-friendly" way to write sRGB colours.

function srgbL(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function textOnBg(r, g, b) {
  const L = 0.2126 * srgbL(r) + 0.7152 * srgbL(g) + 0.0722 * srgbL(b);
  return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? '#000' : '#fff';
}
// Convert HSL → RGB (for text contrast calculation)
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// Approximate hue name
function hueName(h) {
  const names = ['Red','Orange','Yellow','Yellow-green','Green','Teal','Cyan','Sky','Blue','Indigo','Violet','Magenta'];
  return names[Math.round(h / 30) % 12];
}

export function mount(container) {
  let h = 210, s = 80, l = 50;

  container.innerHTML = `
    <style>
      .hsl-wrap {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 2.5rem;
        padding: 2rem;
        transition: background-color 0.08s ease, color 0.15s ease;
        font-family: 'Silkscreen', monospace;
      }
      .hsl-controls {
        display: flex; flex-direction: column; gap: 1.2rem;
        width: min(560px, 90vw);
      }
      .hsl-row {
        display: flex; align-items: center; gap: 1.2rem;
      }
      .hsl-label {
        font-size: 0.6rem; letter-spacing: 0.1em;
        text-transform: uppercase; opacity: 0.6;
        width: 1.6rem; flex-shrink: 0;
      }
      .hsl-row input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: currentColor;
      }
      .hsl-value {
        font-size: 0.85rem; min-width: 5ch;
        text-align: right; opacity: 0.75;
        font-variant-numeric: tabular-nums;
      }
      /* Hue track: colour gradient */
      #sl-h { accent-color: hsl(210, 80%, 50%); }
      .hsl-notation {
        font-size: clamp(1rem, 3vw, 1.6rem);
        letter-spacing: 0.06em;
        opacity: 0.85;
        font-variant-numeric: tabular-nums;
      }
      .hsl-hue-name {
        font-size: 0.6rem; letter-spacing: 0.14em;
        text-transform: uppercase; opacity: 0.4;
        margin-top: -1rem;
      }
    </style>
    <div class="hsl-wrap" id="hsl-bg">
      <div class="hsl-controls">
        <div class="hsl-row">
          <span class="hsl-label">H</span>
          <input type="range" id="sl-h" min="0" max="360" value="${h}" aria-label="Hue">
          <span class="hsl-value" id="val-h">${h}°</span>
        </div>
        <div class="hsl-row">
          <span class="hsl-label">S</span>
          <input type="range" id="sl-s" min="0" max="100" value="${s}" aria-label="Saturation">
          <span class="hsl-value" id="val-s">${s}%</span>
        </div>
        <div class="hsl-row">
          <span class="hsl-label">L</span>
          <input type="range" id="sl-l" min="0" max="100" value="${l}" aria-label="Lightness">
          <span class="hsl-value" id="val-l">${l}%</span>
        </div>
      </div>
      <div class="hsl-notation" id="hsl-notation"></div>
      <div class="hsl-hue-name" id="hsl-hue-name"></div>
    </div>
  `;

  const bg       = container.querySelector('#hsl-bg');
  const notation = container.querySelector('#hsl-notation');
  const hueLbl   = container.querySelector('#hsl-hue-name');
  const valH     = container.querySelector('#val-h');
  const valS     = container.querySelector('#val-s');
  const valL     = container.querySelector('#val-l');

  function render() {
    const col = `hsl(${h} ${s}% ${l}%)`;
    bg.style.backgroundColor = col;
    const [r, g, b] = hslToRgb(h, s, l);
    bg.style.color = textOnBg(r, g, b);
    valH.textContent = `${h}°`;
    valS.textContent = `${s}%`;
    valL.textContent = `${l}%`;
    notation.textContent = col;
    hueLbl.textContent = `${hueName(h)} · ${s === 0 ? 'grey' : s < 30 ? 'muted' : s < 70 ? 'moderate' : 'vivid'} · ${l < 20 ? 'very dark' : l < 40 ? 'dark' : l < 60 ? 'mid' : l < 80 ? 'light' : 'very light'}`;
  }

  container.querySelector('#sl-h').addEventListener('input', e => { h = +e.target.value; render(); });
  container.querySelector('#sl-s').addEventListener('input', e => { s = +e.target.value; render(); });
  container.querySelector('#sl-l').addEventListener('input', e => { l = +e.target.value; render(); });

  render();
  return () => { container.innerHTML = ''; };
}
