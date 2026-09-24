// ── HSL Contrast Demo ────────────────────────────────────────────────────────
// Same hue & saturation, different lightness — drag through hues to see
// that HSL's L cannot guarantee a consistent contrast ratio.

function hslToSRGB(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [r + m, g + m, b + m];
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function wcagLuminance(h, s, l) {
  const [r, g, b] = hslToSRGB(h, s, l);
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

// Tightest gap (~31 L points) that still passes at H=240 (~4.57:1)
const CT_S = 90, CT_BG_L = 91, CT_FG_L = 60;

export function mount(container) {
  container.innerHTML = `
    <style>
      .hc-wrap {
        position: absolute; inset: 0;
        display: flex;
        align-items: center; justify-content: center;
        transition: background-color 0.08s ease;
      }
      .hc-text {
        font-family: 'Silkscreen', monospace;
        font-size: clamp(1rem, 3vw, 2.2rem);
        line-height: 1.4;
        text-align: center;
        max-width: 70%;
        transition: color 0.08s ease;
        pointer-events: none;
        user-select: none;
      }
      .hc-controls {
        position: absolute;
        bottom: 2rem; right: 2rem;
        display: flex; flex-direction: column; gap: 0.6rem;
        padding: 0.9rem 1rem;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 0.5rem;
        font-family: 'Silkscreen', monospace;
        font-size: 0.52rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.5);
        min-width: 200px;
        pointer-events: auto;
      }
      .hc-ratio-row {
        display: flex; justify-content: space-between; align-items: center;
      }
      .hc-ratio-num {
        font-size: 0.85rem;
        color: rgba(255,255,255,0.9);
      }
      .hc-badge {
        font-size: 0.52rem;
        padding: 0.2em 0.6em;
        border-radius: 999px;
        border: 1px solid;
      }
      .hc-badge.pass { color: #4ade80; border-color: #4ade80; }
      .hc-badge.fail { color: #f87171; border-color: #f87171; }
      .hc-row {
        display: flex; align-items: center; gap: 0.6rem;
      }
      .hc-label { width: 1.4rem; flex-shrink: 0; }
      .hc-row input[type=range] {
        flex: 1; height: 1.5rem; cursor: pointer; accent-color: white;
      }
      .hc-val { width: 2.4rem; text-align: right; flex-shrink: 0; }
      .hc-note {
        font-size: 0.46rem; color: rgba(255,255,255,0.3); line-height: 1.6;
      }
    </style>
    <div class="hc-wrap" id="hc-wrap">
      <p class="hc-text" id="hc-text">The quick brown fox jumped over the lazy dogs.</p>
    </div>
    <div class="hc-controls">
      <div class="hc-ratio-row">
        <span class="hc-ratio-num" id="hc-ratio"></span>
        <span class="hc-badge" id="hc-badge"></span>
      </div>
      <div class="hc-row">
        <span class="hc-label">H</span>
        <input type="range" id="hc-h" min="0" max="359" step="1" value="240">
        <span class="hc-val" id="hc-hv"></span>
      </div>
    </div>
  `;

  const wrap = container.querySelector("#hc-wrap");
  const text = container.querySelector("#hc-text");
  const ratio = container.querySelector("#hc-ratio");
  const badge = container.querySelector("#hc-badge");
  const slH = container.querySelector("#hc-h");
  const valH = container.querySelector("#hc-hv");

  function render() {
    const h = +slH.value;
    const bgLum = wcagLuminance(h, CT_S, CT_BG_L);
    const fgLum = wcagLuminance(h, CT_S, CT_FG_L);
    const hi = Math.max(bgLum, fgLum),
      lo = Math.min(bgLum, fgLum);
    const r = (hi + 0.05) / (lo + 0.05);
    const pass = r >= 4.5;

    wrap.style.backgroundColor = `hsl(${h},${CT_S}%,${CT_BG_L}%)`;
    text.style.color = `hsl(${h},${CT_S}%,${CT_FG_L}%)`;
    ratio.textContent = r.toFixed(2) + ":1";
    badge.textContent = pass ? "AA pass" : "AA fail";
    badge.className = "hc-badge " + (pass ? "pass" : "fail");
    valH.textContent = h + "°";
  }

  slH.addEventListener("input", render);
  render();

  return () => {
    container.innerHTML = "";
  };
}
