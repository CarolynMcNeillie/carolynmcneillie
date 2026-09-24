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
        position: fixed; inset: 0;
        font-family: 'Silkscreen', monospace;
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
        font-size: clamp(1.4rem, 4vw, 3rem);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.85);
        text-align: center; line-height: 1.3;
      }
      .rr-half-code {
        font-size: clamp(0.6rem, 1.4vw, 1rem);
        letter-spacing: 0.08em;
        color: rgba(255,255,255,0.55);
      }
      /* sRGB half */
      .rr-srgb  { background: rgb(255, 0, 0); }
      /* P3 half — on sRGB displays this looks the same as srgb; on P3 it's more vivid */
      .rr-p3    { background: color(display-p3 1 0 0); }

      .rr-controls {
        position: absolute;
        bottom: 2rem; left: 50%; transform: translateX(-50%);
        display: flex; flex-direction: column;
        align-items: center; gap: 0.8rem;
        width: min(520px, 90vw);
        padding: 1rem 1.4rem 1.2rem;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 0.5rem;
        pointer-events: none;
      }
      .rr-controls > * { pointer-events: auto; }
      .rr-badge {
        font-size: 0.5rem; letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.35rem 0.85rem; border-radius: 2px;
        display: inline-block;
      }
      .rr-badge.p3-yes  { background: rgba(100,230,100,0.25); color: rgba(150,255,150,1); }
      .rr-badge.p3-no   { background: rgba(255,200,80,0.25);  color: rgba(255,210,100,1); }

      .rr-sim-btn {
        background: none;
        border: 1px solid rgba(255,255,255,0.35);
        color: rgba(255,255,255,0.8);
        font-family: 'Silkscreen', monospace;
        font-size: 0.5rem; letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.5rem 1.2rem; border-radius: 2px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .rr-sim-btn.active {
        border-color: rgba(255,210,100,0.9);
        color: rgba(255,210,100,1);
        background: rgba(255,200,80,0.15);
      }
      .rr-caption {
        font-size: 0.5rem; letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.65);
        text-align: center; max-width: 480px; line-height: 1.7;
      }

      /* sim mode: overlay a muted rectangle on the sRGB half */
      .rr-sim-overlay {
        position: absolute; inset: 0;
        pointer-events: none;
        background: color-mix(in srgb, rgb(180,0,0) 40%, transparent);
        opacity: 0; transition: opacity 0.3s ease;
      }
      .rr-sim-overlay.visible { opacity: 1; }
    </style>

    <div class="rr-wrap">
      <div class="rr-halves">
        <div class="rr-half rr-srgb" id="rr-srgb">
          <div class="rr-sim-overlay" id="rr-sim-overlay"></div>
          <span class="rr-half-label">sRGB<br>maximum red</span>
          <span class="rr-half-code">rgb(255, 0, 0)</span>
        </div>
        <div class="rr-half rr-p3">
          <span class="rr-half-label">Display P3<br>maximum red</span>
          <span class="rr-half-code">oklch(64.9% 0.2994 29.2)</span>
        </div>
      </div>

      <div class="rr-controls">
        <span class="rr-badge ${hasP3 ? "p3-yes" : "p3-no"}" id="rr-badge">
          ${hasP3 ? "P3 display detected — difference is real" : "sRGB display detected — colours are clipped"}
        </span>
        <button class="rr-sim-btn ${simMode ? "active" : ""}" id="rr-sim-btn" aria-pressed="${simMode}">
          ${simMode ? "simulation: on" : "simulation: off"}
        </button>
        <span class="rr-caption" id="rr-caption"></span>
      </div>
    </div>
  `;

  const simOverlay = container.querySelector("#rr-sim-overlay");
  const simBtn = container.querySelector("#rr-sim-btn");
  const caption = container.querySelector("#rr-caption");

  function render() {
    simOverlay.classList.toggle("visible", simMode);
    simBtn.classList.toggle("active", simMode);
    simBtn.textContent = simMode ? "simulation: on" : "simulation: off";

    if (hasP3) {
      caption.textContent = simMode
        ? "Simulation overlay active. The left half is dimmed to approximate what the right gains — roughly 25% more chromatic red than sRGB can express."
        : "Your display supports Display P3. The right half is genuinely more vivid — not a colour filter, not post-processing. More red photons.";
    } else {
      caption.textContent = simMode
        ? "Simulation mode: the left half is dimmed to show what sRGB is missing. Your display clips both to the same red. A P3 screen would show the right half as a richer, more saturated red."
        : "Your display can only show sRGB — both halves are clipped to the same red. Enable simulation to see what a P3 display gains.";
    }
  }

  simBtn.addEventListener("click", () => {
    simMode = !simMode;
    simBtn.setAttribute("aria-pressed", String(simMode));
    render();
  });
  render();

  return () => {
    container.innerHTML = "";
  };
}
