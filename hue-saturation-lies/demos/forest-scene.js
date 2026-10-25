import { depthOrderIcon } from "./icons.js";
// ── Layered forest scene ─────────────────────────────────────────────────────
// A paper-cut forest in nine flat colour layers plus a sun
// (images/forest-layers.svg, from Forest.svg in Illustrator). Each layer's fill
// is a CSS variable: --layer-1 (nearest, darkest frame) to --layer-9 (the sky),
// and --sun. Any palette set on this container recolours the scene live.
// The SVG is inlined, not loaded through <img>: variables do not reach into an
// external image. The letterbox uses --layer-1 so it reads as part of the frame.
// The layers share the image border, so a border that lands mid-pixel lets the
// lighter layers bleed through as a hairline. The SVG is therefore sized and
// placed in whole pixels.

// The ramps are the three from titian-2 (demos/titian-glaze.js), from the same
// base colour oklch(0.72 0.12 h), run for nine steps instead of six. Step 0 is the
// base. The strength slider sets each ramp's change per step, kept per ramp:
//   black: % of black mixed in per step (titian-2 uses 14)
//   L:     OKLCH lightness removed per step (titian-2 uses 0.07)
//   shift: degrees of hue turned per step (titian-2 uses 5). Its lightness and
//          chroma steps are gentler than titian-2's (L 0.05, C x0.04), so the
//          nearest layers keep enough colour for the hue turn to show.
// "Darkest in front" gives --layer-1 the darkest step and the sky the base.
// The slide opens on HSL green, which has no button: HSL lightness 20% to 80% across the
// eight land layers, hsl(120 100% L), under an hsl(180 100% 50%) cyan sky.
// The Illustrator colours stay in the SVG as fallbacks.
const RAMPS = [
  { name: "Mix towards black in sRGB", label: "Black per step", min: 0, max: 25, by: 1, value: 14,
    show: (v) => `${v}%`,
    step: (i, v) => `color-mix(in srgb, var(--color), black ${Math.min(100, i * v)}%)` },
  { name: "Lower OKLCH L", label: "L per step", min: 0, max: 0.09, by: 0.005, value: 0.07,
    show: (v) => v.toFixed(3),
    step: (i, v) => `oklch(from var(--color) calc(l - ${(i * v).toFixed(3)}) c h)` },
  { name: "Lower L, reduce C, shift H", label: "Hue per step", min: 0, max: 22.5, by: 0.5, value: 10,
    show: (v) => `${v}° (${v * 8}° in all)`,
    step: (i, v) => `oklch(from var(--color) calc(l - ${(i * 0.05).toFixed(2)}) calc(c * ${(1 - i * 0.04).toFixed(2)}) calc(h + ${i * v}))` },
];
// The sun is revealed on a step of its own, after the shift-H ramp: the sky's own
// L and C turned 180 degrees, so it is the sky's complement at the same lightness.
// It rises from behind the hills at full colour: no fade, since an in-between
// opacity would show a different colour and spoil the effect. The land layers
// are drawn over it, so while it waits 280 units down it is out of sight.
// With reduced motion it is simply there.
const SUN = "oklch(from var(--layer-9) l c calc(h + 180))";
const SPIN_SECONDS = 6;
const START_HUE = 250; // the ramps open on a blue base: oklch(0.72 0.12 250)

// Inspecting the shapes: ?forest-layers=1 (or 1,2 or 9,sun) shows only the listed
// layers, over white. With two or more listed, a click toggles the nearest one.
const LAYERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "sun"];
const layerVar = (name) => (name === "sun" ? "--sun" : `--layer-${name}`);
function isolatedLayers() {
  const value = new URLSearchParams(location.search).get("forest-layers");
  if (!value) return null;
  return value.split(",").map((v) => v.trim()).filter((v) => LAYERS.includes(v));
}

export function mount(container) {
  let alive = true;
  // ramp: -1 HSL green (the opening state), 0..2 an index into RAMPS.
  let ramp = -1, hue = 30, darkestFront = true, dragging = false, sunUp = false;
  const strengths = RAMPS.map((r) => r.value);
  const isolate = isolatedLayers();
  const stops = Array.from({ length: 25 }, (_, i) => `oklch(0.72 0.12 ${i * 15}) ${i * 15}deg`).join(", ");
  container.innerHTML = `
    <style>
      .fs-wrap { background: var(--layer-1, #320400); overflow: hidden; }
      .fs-wrap svg { display: block; position: absolute; }
      .fs-wrap.fs-isolate { background: white; }
      .fs-wrap #sun { transform: translateY(280px); transition: transform 2.4s cubic-bezier(0.2, 0.6, 0.3, 1); }
      .fs.fs-sun .fs-wrap #sun { transform: none; }
      /* Ramp, step and order changes glide (tween() adds the class). The wheel,
         slider and spin change every frame, so they stay instant. The sun never
         fades: an in-between colour would break the illusion. */
      .fs.fs-tween .fs-wrap { transition: background-color 0.9s ease-in-out; }
      .fs.fs-tween .fs-wrap g[id^="layer-"] { transition: fill 0.9s ease-in-out; }
      @media (prefers-reduced-motion: reduce) { .fs-wrap #sun, .fs.fs-tween .fs-wrap, .fs.fs-tween .fs-wrap g[id^="layer-"] { transition: none; } }
      .fs-corner { position: absolute; top: 24px; right: 24px; display: flex; align-items: center; gap: 12px; }
      .fs-bottom { position: absolute; left: 24px; right: 24px; bottom: 48px; display: flex; flex-direction: column; align-items: center; gap: 10px; pointer-events: none; }
      .fs-bottom > * { pointer-events: auto; }
      .fs-ramps { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
      /* Brighter than the shared pill: these sit over a bright picture, where the
         resting --ink-muted grey reads as disabled. The chosen ramp is inverted. */
      .fs-ramps .pill-button { white-space: nowrap; color: var(--ink); border-color: var(--ink-muted);
        background: color-mix(in srgb, var(--scrim) var(--glass), transparent); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); }
      .fs-ramps .pill-button:hover { color: var(--ink); background: var(--fill-strong); }
      .fs-ramps .pill-button[aria-pressed="true"] { color: var(--scrim); background: var(--ink); border-color: var(--ink); }
      .fs-wheel { flex: none; width: 64px; height: 64px; position: relative; border-radius: 50%; cursor: crosshair; touch-action: none; background: conic-gradient(${stops}); }
      .fs-wheel::before { content: ""; position: absolute; inset: 10px; border-radius: 50%; background: var(--scrim); pointer-events: none; }
      .fs-wheel:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }
      .fs-wheel[aria-disabled="true"] { opacity: 0.5; cursor: default; }
      .fs-marker { position: absolute; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--ink); transform: translate(-50%, -50%); pointer-events: none; box-shadow: 0 0 0 2px var(--scrim); }
      .fs-strength { display: flex; align-items: center; gap: 12px; font: var(--text-label)/1.2 var(--font-display); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--ink-soft); white-space: nowrap; }
      .fs-strength input { width: 180px; }
      .fs-strength-value { color: var(--ink); min-width: 13em; }
      .fs-strength[hidden] { display: none; }
      @media (max-width: 600px) {
        /* The default value width pushes both ends of this slider off a phone. */
        .fs-strength { box-sizing: border-box; width: 100%; gap: 6px; font-size: 10px; }
        .fs-strength input { width: 70px; min-width: 60px; flex: 1; }
        .fs-strength-value { min-width: 0; max-width: 90px; white-space: normal; }
      }
    </style>
    <div class="fs demo-root">
      <div class="fs-wrap demo-root"></div>
      <div class="fs-corner">
        <button type="button" class="icon-button fs-order"></button>
        <div class="fs-wheel" data-no-swipe role="slider" tabindex="0" aria-label="Hue of the base colour" aria-valuemin="0" aria-valuemax="359"><span class="fs-marker" aria-hidden="true"></span></div>
      </div>
      <div class="fs-bottom">
        <label class="fs-strength glass-chip"><span class="fs-strength-text"></span><input type="range"><span class="fs-strength-value"></span></label>
        <div class="fs-ramps" role="group" aria-label="Darkening ramp"></div>
      </div>
    </div>
  `;
  const root = container.querySelector(".fs");
  const wrap = container.querySelector(".fs-wrap");
  const wheel = container.querySelector(".fs-wheel");
  const marker = container.querySelector(".fs-marker");
  const orderButton = container.querySelector(".fs-order");
  const strength = container.querySelector(".fs-strength");
  const strengthInput = strength.querySelector("input");
  const strengthText = strength.querySelector(".fs-strength-text");
  const strengthValue = strength.querySelector(".fs-strength-value");
  strengthInput.addEventListener("input", () => { if (ramp >= 0) { strengths[ramp] = Number(strengthInput.value); render(); } });
  const rampButtons = RAMPS.map((r) => r.name).map((name, index) => {
    const button = document.createElement("button");
    button.type = "button"; button.className = "pill-button"; button.textContent = name;
    button.addEventListener("click", () => { tween(); ramp = index; sunUp = false; setSpin(false); render(); });
    container.querySelector(".fs-ramps").append(button);
    return button;
  });

  root.style.setProperty("--sun", SUN);
  // Turn colour transitions on for one change, then off again.
  let tweenTimer = 0;
  function tween() {
    root.classList.add("fs-tween");
    clearTimeout(tweenTimer);
    tweenTimer = setTimeout(() => root.classList.remove("fs-tween"), 1000);
  }
  // The engine calls step right after mount: that first paint is instant.
  let firstStep = true;
  // The palette lives on .fs; isolation overrides it on .fs-wrap.
  function render() {
    root.style.setProperty("--color", `oklch(0.72 0.12 ${hue})`);
    for (let n = 1; n <= 9; n++) {
      if (ramp === -1) {
        const k = darkestFront ? n : 9 - n;
        root.style.setProperty(`--layer-${n}`, n === 9 ? "hsl(180 100% 50%)" : `hsl(120 100% ${+(20 + (k - 1) * 60 / 7).toFixed(1)}%)`);
        continue;
      }
      const step = darkestFront ? 9 - n : n - 1;
      root.style.setProperty(`--layer-${n}`, RAMPS[ramp].step(step, strengths[ramp]));
    }
    root.classList.toggle("fs-sun", sunUp);
    rampButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === ramp)));
    wheel.setAttribute("aria-disabled", String(ramp < 0));
    wheel.tabIndex = ramp < 0 ? -1 : 0;
    wheel.setAttribute("aria-valuenow", String(Math.round(hue) % 360));
    strength.hidden = ramp < 0;
    const r = RAMPS[Math.max(0, ramp)], v = ramp < 0 ? r.value : strengths[ramp];
    Object.assign(strengthInput, { min: r.min, max: r.max, step: r.by });
    strengthInput.value = v;
    strengthText.textContent = ramp < 0 ? "Step strength" : r.label;
    strengthValue.textContent = ramp < 0 ? "" : r.show(v);
    const radians = hue * Math.PI / 180;
    marker.style.left = `${50 + 41 * Math.sin(radians)}%`;
    marker.style.top = `${50 - 41 * Math.cos(radians)}%`;
    orderButton.innerHTML = depthOrderIcon(darkestFront);
    const order = darkestFront ? "Darkest in front" : "Darkest at the back";
    orderButton.setAttribute("aria-label", `${order}. Swap darkest and lightest`);
    orderButton.title = `${order}: press to swap`;
  }
  // The wheel is off on the opening HSL greens, which have a fixed hue.
  // The last step keeps the sun scene and turns the base hue round the wheel,
  // one full turn every SPIN_SECONDS. With reduced motion it holds still.
  let spinFrame = 0, spinLast = 0;
  function setSpin(on) {
    if (on && matchMedia("(prefers-reduced-motion: reduce)").matches) on = false;
    if (on === Boolean(spinFrame)) return;
    if (!on) { cancelAnimationFrame(spinFrame); spinFrame = 0; return; }
    spinLast = performance.now();
    const tick = (now) => {
      hue = (hue + (now - spinLast) / 1000 * 360 / SPIN_SECONDS) % 360;
      spinLast = now;
      render();
      spinFrame = requestAnimationFrame(tick);
    };
    spinFrame = requestAnimationFrame(tick);
  }
  function setHue(value) { if (ramp < 0) return; hue = ((Math.round(value) % 360) + 360) % 360; render(); }
  function pointHue(event) {
    const box = wheel.getBoundingClientRect();
    return (Math.atan2(event.clientX - box.left - box.width / 2, box.top + box.height / 2 - event.clientY) * 180 / Math.PI + 360) % 360;
  }
  wheel.addEventListener("pointerdown", (event) => { wheel.setPointerCapture(event.pointerId); dragging = true; setHue(pointHue(event)); });
  wheel.addEventListener("pointermove", (event) => { if (dragging) setHue(pointHue(event)); });
  wheel.addEventListener("pointerup", () => { dragging = false; });
  wheel.addEventListener("pointercancel", () => { dragging = false; });
  wheel.addEventListener("lostpointercapture", () => { dragging = false; });
  wheel.addEventListener("keydown", (event) => {
    const next = { ArrowLeft: hue - 5, ArrowRight: hue + 5, ArrowDown: hue - 1, ArrowUp: hue + 1, Home: 0, End: 359 }[event.key];
    if (next === undefined) return;
    event.preventDefault(); event.stopPropagation();
    setHue(next);
  });
  orderButton.addEventListener("click", () => { tween(); darkestFront = !darkestFront; render(); });
  render();

  if (isolate) {
    wrap.classList.add("fs-isolate");
    for (const name of LAYERS) if (!isolate.includes(name)) wrap.style.setProperty(layerVar(name), "transparent");
    const layers = isolate.filter((v) => v !== "sun").map(Number);
    if (isolate.length > 1 && layers.length) {
      const nearest = layerVar(String(Math.min(...layers)));
      wrap.style.cursor = "pointer";
      wrap.addEventListener("click", () => {
        if (wrap.style.getPropertyValue(nearest) === "transparent") wrap.style.removeProperty(nearest);
        else wrap.style.setProperty(nearest, "transparent");
      });
    }
  }
  let svg = null, aspect = 1;

  function fit() {
    if (!svg) return;
    const { left, top, width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(Math.min(width, height * aspect));
    const h = Math.round(w / aspect);
    // Offsets that put the SVG's corner on a whole screen pixel, even when the
    // wrap itself sits at a fractional position.
    Object.assign(svg.style, {
      width: `${w}px`, height: `${h}px`,
      left: `${Math.round(left + (width - w) / 2) - left}px`,
      top: `${Math.round(top + (height - h) / 2) - top}px`,
    });
  }
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(wrap);

  fetch("./images/forest-layers.svg")
    .then((response) => {
      if (!response.ok) throw new Error(`forest-layers.svg: ${response.status}`);
      return response.text();
    })
    .then((text) => {
      if (!alive) return;
      wrap.innerHTML = text;
      svg = wrap.querySelector("svg");
      const [, , vw, vh] = svg.getAttribute("viewBox").split(/\s+/).map(Number);
      aspect = vw / vh;
      svg.setAttribute("preserveAspectRatio", "none"); // the box already has the viewBox's aspect, within 1px
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "A paper-cut forest in nine colour layers, from the pale sky to the dark trees framing the scene");
    })
    .then(fit)
    .catch((error) => console.warn(error));

  // Arrow-key steps: 0 the HSL greens, 1 to 3 the three ramps in button order,
  // 4 the shift-H ramp with its hue per step cranked to the maximum, 5 the same
  // with the sun revealed, 6 the same with the hue turning. Leaving the greens
  // starts the ramps from a blue base; after that the hue is wherever the wheel
  // left it. Stepping back from the crank returns the slider to where it was.
  const SHIFT = RAMPS.length - 1;
  const CRANK_STEP = RAMPS.length + 1, SUN_STEP = CRANK_STEP + 1, SPIN_STEP = SUN_STEP + 1;
  const CRANK_MS = 1600;
  let cranked = false, beforeCrank = RAMPS[SHIFT].value, crankFrame = 0;
  function glideStrength(goal) {
    cancelAnimationFrame(crankFrame);
    const from = strengths[SHIFT], start = performance.now(), by = RAMPS[SHIFT].by;
    if (firstStep || matchMedia("(prefers-reduced-motion: reduce)").matches) { strengths[SHIFT] = goal; render(); return; }
    const tick = (now) => {
      const t = Math.min(1, (now - start) / CRANK_MS);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      strengths[SHIFT] = Math.round((from + (goal - from) * eased) / by) * by;
      render();
      if (t < 1) crankFrame = requestAnimationFrame(tick);
    };
    crankFrame = requestAnimationFrame(tick);
  }
  function step(n) {
    const next = Math.max(-1, Math.min(SHIFT, n - 1));
    if (next >= 0 && ramp < 0) hue = START_HUE;
    // Glide when the ramp changes; the crank and the spin animate themselves.
    if (!firstStep && next !== ramp) tween();
    ramp = next;
    sunUp = n >= SUN_STEP;
    setSpin(n >= SPIN_STEP);
    const crank = n >= CRANK_STEP;
    if (crank && !cranked) { beforeCrank = strengths[SHIFT]; glideStrength(RAMPS[SHIFT].max); }
    else if (!crank && cranked) glideStrength(beforeCrank);
    cranked = crank;
    firstStep = false;
    render();
  }

  return {
    step,
    cleanup: () => {
      alive = false;
      clearTimeout(tweenTimer);
      cancelAnimationFrame(crankFrame);
      setSpin(false);
      resizeObserver.disconnect();
      container.innerHTML = "";
    },
  };
}
