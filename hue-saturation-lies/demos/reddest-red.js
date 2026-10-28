// ── Reddest Red Demo ─────────────────────────────────────────────────────────
// sRGB maximum red vs Display P3 maximum red.
// On a P3 display the right half is visibly more vivid.
// On an sRGB-only display both halves look the same: that IS the point.
// A simulation mode approximates the gap for sRGB devices.

export function mount(container) {
  const hasP3 = window.matchMedia("(color-gamut: p3)").matches;
  let simMode = false; // show the actual display colours first on every device

  container.innerHTML = `
    <style>
      .rr-wrap {
        position: absolute; inset: 0;
        font-family: var(--font-body);
      }
      .rr-halves {
        display: flex;
        position: absolute; inset: 0;
      }
      .rr-half {
        flex: 1; display: flex;
        flex-direction: column;
        align-items: center; justify-content: center;
        gap: 0.6rem;
        position: relative;
      }
      .rr-half-label {
        font: 2rem/1.3 var(--font-display);
        letter-spacing: var(--tracking-caps);
        text-transform: uppercase;
        color: var(--ink);
        text-align: center; line-height: 1.3;
      }
      /* Saturated red is near 4:1 against both black and white text at this
         size, too close to call for 16px body text, so the code line gets a
         dark chip behind it rather than relying on the red to be light or
         dark enough on its own. */
      .rr-half-code {
        color: var(--ink);
        background: color-mix(in oklch, var(--scrim) var(--glass), transparent);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius);
      }
      /* sRGB half */
      .rr-srgb  { background: rgb(255, 0, 0); }
      /* P3 half: on an sRGB display this looks the same as srgb; on P3 it's more vivid */
      .rr-p3    { background: color(display-p3 1 0 0); }

      .rr-controls {
        position: absolute; bottom: 1rem; left: 0; right: 0;
        display: flex; justify-content: center;
        pointer-events: none;
      }
      .rr-sim-btn { min-height: 44px; pointer-events: auto; }
      .rr-sim-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
      @media (max-width: 600px) and (orientation: portrait) {
        /* Leave room below the stacked colours for the simulation button. */
        .rr-halves { bottom: 4.5rem; flex-direction: column; }
        .rr-half { min-height: 0; gap: 0.4rem; padding: 0 0.75rem; }
        .rr-half-label { font-size: clamp(1rem, 5vw, 1.5rem); }
        .rr-half-code {
          max-width: 100%;
          font-size: clamp(0.7rem, 3.4vw, 1rem);
          white-space: normal;
          overflow-wrap: anywhere;
          text-align: center;
        }
      }

      /* sim mode: overlay a muted rectangle on the sRGB half */
      .rr-sim-overlay {
        position: absolute; inset: 0;
        pointer-events: none;
        background: color-mix(in srgb, oklch(0.483 0.198 29.2) 40%, transparent);
        opacity: 0; transition: opacity var(--motion-slow);
      }
      .rr-sim-overlay.visible { opacity: 1; }
      @media (prefers-reduced-motion: reduce) {
        .rr-sim-overlay { transition: none; }
      }
    </style>

    <div class="rr-wrap">
      <div class="rr-halves">
        <div class="rr-half rr-srgb" id="rr-srgb">
          <div class="rr-sim-overlay" id="rr-sim-overlay"></div>
          <span class="rr-half-label">sRGB<br>maximum red</span>
          <code class="css-tag rr-half-code">rgb(255 0 0)</code>
        </div>
        <div class="rr-half rr-p3">
          <span class="rr-half-label">Display P3<br>maximum red</span>
          <code class="css-tag rr-half-code">color(display-p3 1 0 0)</code>
        </div>
      </div>

      <div class="rr-controls">
        <button class="rr-sim-btn pill-button ${simMode ? "active" : ""}" id="rr-sim-btn" aria-pressed="${simMode}">
          ${simMode ? "Simulation of a wider-gamut difference: on" : "Simulation: off"}
        </button>
      </div>
    </div>
  `;

  const simOverlay = container.querySelector("#rr-sim-overlay");
  const simBtn = container.querySelector("#rr-sim-btn");

  function render() {
    simOverlay.classList.toggle("visible", simMode);
    simBtn.classList.toggle("active", simMode);
    simBtn.textContent = simMode ? "Simulation of a wider-gamut difference: on" : "Simulation: off";

  }

  const setSim = (on) => {
    simMode = on;
    simBtn.setAttribute("aria-pressed", String(simMode));
    render();
  };
  simBtn.addEventListener("click", () => setSim(!simMode));
  render();

  // Step 0: the real display colours. Step 1 (arrow): the simulation on.
  return {
    step: (i) => setSim(i >= 1),
    credit: hasP3 ? "Your device supports Display P3" : "Your device supports sRGB",
    cleanup: () => { container.innerHTML = ""; },
  };
}
