// ── constants ──────────────────────────────────────────────────────────────
const LIGHT_L = 0.76,
  LIGHT_C = 0.13;
const DARK_L = 0.47,
  DARK_C = 0.26;
const RED_H = 15;
const BLUE_H = 255;

// ── mount ──────────────────────────────────────────────────────────────────
export function mount(container) {
  let severity = 0;

  container.innerHTML = `
    <style>
      .pk-wrap { position: absolute; inset: 0; font-family: 'Silkscreen', monospace; }
      .pk-screen { position: absolute; inset: 0; display: none; overflow: hidden; }
      .pk-screen.active { display: block; }

      /* Step 0: full-screen pink */
      #pk-full { position: absolute; inset: 0; }

      /* Step 1: pink background, red panel slides in from right */
      #pk-pink-bg { position: absolute; inset: 0; }
      .pk-slide-panel {
        position: absolute; top: 0; right: 0; bottom: 0; width: 50%;
        transform: translateX(100%);
        transition: transform 0.55s ease;
      }
      #pk-s1.entered .pk-slide-panel { transform: translateX(0); }

      /* Step 2: split */
      .pk-split { position: absolute; inset: 0; display: flex; }
      .pk-half { flex: 1; }

      /* Step 3: quad + slider */
      .pk-quad {
        position: absolute; inset: 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
      }
      .pk-cell { position: relative; }
      .pk-cell-label {
        position: absolute;
        bottom: 1.25rem; left: 1.25rem;
        font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase;
        color: rgba(255,255,255,0.8);
        background: rgba(0,0,0,0.35);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        padding: 0.25em 0.6em;
        border-radius: 999px;
      }
      .pk-controls {
        position: absolute;
        bottom: 2.5rem; left: 50%;
        transform: translateX(-50%);
        display: flex; flex-direction: column; align-items: center; gap: 0.85rem;
        padding: 0.6em 1.2em 0.8em;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        min-width: min(500px, 72%);
      }
      .pk-slider-row {
        display: flex; align-items: center; gap: 1.25rem;
        width: 100%;
        font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.4);
      }
      .pk-slider-row input[type=range] {
        flex: 1; height: 2rem; cursor: pointer; accent-color: white;
      }
    </style>
    <div class="pk-wrap">
      <div class="pk-screen" id="pk-s0">
        <div id="pk-full"></div>
      </div>
      <div class="pk-screen" id="pk-s1">
        <div id="pk-pink-bg"></div>
        <div class="pk-slide-panel" id="pk-red-slide"></div>
      </div>
      <div class="pk-screen" id="pk-s2">
        <div class="pk-split">
          <div class="pk-half" id="pk-lblue"></div>
          <div class="pk-half" id="pk-dblue"></div>
        </div>
      </div>
      <div class="pk-screen" id="pk-s3">
        <div class="pk-quad">
          <div class="pk-cell" id="pk-q-pink">
            <span class="pk-cell-label">Pink</span>
          </div>
          <div class="pk-cell" id="pk-q-red">
            <span class="pk-cell-label">Red</span>
          </div>
          <div class="pk-cell" id="pk-q-lblue">
            <span class="pk-cell-label">Light blue</span>
          </div>
          <div class="pk-cell" id="pk-q-dblue">
            <span class="pk-cell-label">Dark blue</span>
          </div>
        </div>
        <div class="pk-controls">
          <div class="pk-slider-row">
            <span>Colour</span>
            <input type="range" id="pk-range" min="0" max="1" step="0.005" value="0" aria-label="Chroma to grey">
            <span>Grey</span>
          </div>
        </div>
      </div>
    </div>
  `;

  function colorOf(L, C, H) {
    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
  }

  const elFull     = container.querySelector("#pk-full");
  const elPinkBg   = container.querySelector("#pk-pink-bg");
  const elRedSlide = container.querySelector("#pk-red-slide");
  const elLblue    = container.querySelector("#pk-lblue");
  const elDblue    = container.querySelector("#pk-dblue");
  const elQPink    = container.querySelector("#pk-q-pink");
  const elQRed     = container.querySelector("#pk-q-red");
  const elQLblue   = container.querySelector("#pk-q-lblue");
  const elQDblue   = container.querySelector("#pk-q-dblue");
  const s1         = container.querySelector("#pk-s1");

  function updateColors() {
    const cf    = 1 - severity;
    const pink  = colorOf(LIGHT_L, LIGHT_C * cf, RED_H);
    const red   = colorOf(DARK_L,  DARK_C  * cf, RED_H);
    const lblue = colorOf(LIGHT_L, LIGHT_C * cf, BLUE_H);
    const dblue = colorOf(DARK_L,  DARK_C  * cf, BLUE_H);

    elFull.style.background     = pink;
    elPinkBg.style.background   = pink;
    elRedSlide.style.background = red;
    elLblue.style.background    = lblue;
    elDblue.style.background    = dblue;
    elQPink.style.background    = pink;
    elQRed.style.background     = red;
    elQLblue.style.background   = lblue;
    elQDblue.style.background   = dblue;
  }

  container.querySelector("#pk-range").addEventListener("input", (e) => {
    severity = parseFloat(e.target.value);
    updateColors();
  });

  function step(n) {
    container.querySelectorAll(".pk-screen").forEach((el, i) => {
      el.classList.toggle("active", i === n);
    });
    if (n === 1) {
      // Double rAF so display:block settles before the transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => s1.classList.add("entered")));
    } else {
      s1.classList.remove("entered");
    }
  }

  updateColors();
  step(0);

  return {
    cleanup: () => { container.innerHTML = ""; },
    step,
  };
}
