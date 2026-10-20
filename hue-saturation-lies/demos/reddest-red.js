// ── Reddest Red Demo ─────────────────────────────────────────────────────────
// sRGB maximum red vs Display P3 maximum red.
// On a P3 display the right half is visibly more vivid.
// On an sRGB-only display both halves look the same — that IS the point.
// A simulation mode approximates the gap for sRGB devices.

export function mount(container) {
  const hasP3 = window.matchMedia("(color-gamut: p3)").matches;
  let simMode = !hasP3; // default: sim on sRGB devices, off on P3

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
      .rr-half-code { color: var(--ink); }
      /* sRGB half */
      .rr-srgb  { background: rgb(255, 0, 0); }
      /* P3 half — on sRGB displays this looks the same as srgb; on P3 it's more vivid */
      .rr-p3    { background: color(display-p3 1 0 0); }

      .rr-controls {
        position: absolute; bottom: 1rem; left: 0; right: 0;
        display: flex; justify-content: center;
        pointer-events: none;
      }
      .rr-sim-btn { min-height: 44px; pointer-events: auto; }
      .rr-sim-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
      @media (max-width: 600px) {
        .rr-half { justify-content: flex-start; padding-top: 8rem; }
      }

      /* sim mode: overlay a muted rectangle on the sRGB half */
      .rr-sim-overlay {
        position: absolute; inset: 0;
        pointer-events: none;
        background: color-mix(in srgb, rgb(180,0,0) 40%, transparent);
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
          ${simMode ? "simulation: on" : "simulation: off"}
        </button>
      </div>
    </div>
  `;

  const simOverlay = container.querySelector("#rr-sim-overlay");
  const simBtn = container.querySelector("#rr-sim-btn");

  function render() {
    simOverlay.classList.toggle("visible", simMode);
    simBtn.classList.toggle("active", simMode);
    simBtn.textContent = simMode ? "simulation: on" : "simulation: off";

  }

  simBtn.addEventListener("click", () => {
    simMode = !simMode;
    simBtn.setAttribute("aria-pressed", String(simMode));
    render();
  });
  render();

  return {
    credit: hasP3 ? "Your device supports Display P3" : "Your device supports sRGB",
    cleanup: () => { container.innerHTML = ""; },
  };
}
