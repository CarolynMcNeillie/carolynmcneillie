// ── Harmonies Demo ───────────────────────────────────────────────────────────
// Colour wheel showing harmony relationships as spokes on a wheel.
// Drag the wheel to rotate the base hue. Type "hsl" draws the wheel and
// swatches as hsl(h 100% 50%); the default draws OKLCH. Both wheels share
// the base hue and scheme across the slide hand-off.

const MODES = [
  {
    id: "complementary",
    label: "Complementary",
    offsets: [0, 180],
  },
  {
    id: "analogous",
    label: "Analogous",
    offsets: [-30, 0, 30],
  },
  {
    id: "triadic",
    label: "Triadic",
    offsets: [0, 120, 240],
  },
  {
    id: "split",
    label: "Split-complementary",
    offsets: [0, 150, 210],
  },
  {
    id: "tetradic",
    label: "Tetradic",
    offsets: [0, 90, 180, 270],
  },
];

import { maxChroma } from "./oklch-vs-hsl.js";

// The OKLCH wheel sits at L 0.73, the average OKLCH lightness of the HSL
// wheel's hsl(h 100% 50%) colours, and gives each hue 98% of its own sRGB
// maximum chroma (as on an-ok-color-space-3), so the ring never clips.
const OKL = 0.73;
const chromaCache = new Map();
function ringChroma(l, h) {
  const key = `${l.toFixed(3)} ${Math.round(h * 10)}`;
  if (!chromaCache.has(key)) chromaCache.set(key, 0.98 * maxChroma(l, h));
  return chromaCache.get(key);
}

const colourFor = {
  hsl: (h) => `hsl(${Math.round(h) % 360} 100% 50%)`,
};
const MODEL_LABEL = { hsl: "HSL", oklch: "OKLCH" };

// After the two wheels, HSL leaves and each arrow press shows one scheme with a
// painting on the left. The OKLCH wheel takes a colour from the painting as its
// base, and the wheel and swatches use that colour's L and C, so every hue in
// the scheme keeps them. Bases were sampled from the paintings, apart from The
// Scream's and the Café Terrace's, which are Carolyn's picks. At the higher chromas many ring
// hues fall outside sRGB and the browser clips them.
const PAINTINGS = [
  { mode: "complementary", src: "MunchScream.avif", base: { l: 0.517, c: 0.154, h: 47 },
    alt: "Edvard Munch, The Scream: a figure on a bridge under a swirling orange sky, above a dark blue fjord" },
  { mode: "analogous", src: "VanGoghSunflowers.avif", base: { l: 0.79, c: 0.15, h: 90 },
    alt: "Vincent van Gogh, Sunflowers: sunflowers in an ochre vase against a yellow wall, painted almost entirely in yellows and oranges" },
  { mode: "triadic", src: "MatisseDance.avif", base: { l: 0.53, c: 0.16, h: 32 },
    alt: "Henri Matisse, Dance II: five red-orange dancers in a ring on a green hill against a deep blue sky" },
  { mode: "split", src: "VanGoghCafeTerrace.avif", base: { l: 0.68, c: 0.18, h: 267 },
    alt: "Vincent van Gogh, Café Terrace at Night: a yellow-lit café terrace under a starry blue sky" },
  { mode: "tetradic", src: "MatisseWomanWithAHat.avif", base: { l: 0.6, c: 0.107, h: 183 }, // the most chroma that keeps all four swatches in sRGB
    alt: "Henri Matisse, Woman with a Hat: a portrait in loose strokes of teal, violet, pink and ochre" },
];
const TWEEN_MS = 900;
const wrapHue = (h) => ((h % 360) + 360) % 360;
// Up to 3 decimals, trailing zeros dropped: 0.68, 0.089, 31.12.
const num = (v, places = 3) => String(+v.toFixed(places));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const towards = (from, to, t) => from + (to - from) * t;
// Hue the short way round.
const towardsHue = (from, to, t) => wrapHue(from + ((((to - from) % 360) + 540) % 360 - 180) * t);

export function mount(container, type = "oklch") {
  let model = type === "hsl" ? "hsl" : "oklch";
  let currentStep = 0;
  // Opens on HSL's yellow and blue: opposite on an RGB-built wheel, though not
  // opposites to the eye.
  let hue = 60;
  let modeIdx = 0;
  let dragging = false;
  let activeCanvas = null;
  let raf1;
  let raf2;
  let saved = null; // the hue and scheme to return to when leaving the paintings
  let painting = null;

  container.innerHTML = `
    <style>
      .har-wrap {
        background: #111;
        overflow: hidden;
        box-sizing: border-box;
      }
      .har-panel {
        position: absolute;
        top: 50%; left: 50%;
        width: min(46vw, 660px);
        display: flex; flex-direction: column; align-items: center;
        gap: 0.7rem;
        transform: translate(-50%, -50%);
        transition: transform var(--motion-slow), opacity var(--motion-slow), visibility 0s;
      }
      .har-label {
        color: var(--ink-muted); font-size: var(--text-label);
        letter-spacing: var(--tracking-caps); text-transform: uppercase;
      }
      .har-canvas { display: block; cursor: crosshair; flex-shrink: 0; touch-action: none; }
      .har-canvas:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }
      .har-wrap[data-layout="both"] .har-hsl { transform: translate(calc(-50% - 23vw), -50%); }
      .har-wrap[data-layout="both"] .har-oklch { transform: translate(calc(-50% + 23vw), -50%); }
      .har-wrap[data-layout="hsl"] .har-oklch {
        transform: translate(calc(-50% + 110vw), -50%);
      }
      .har-wrap[data-layout="oklch"] .har-hsl {
        transform: translate(calc(-50% - 110vw), -50%);
      }
      .har-wrap[data-layout="hsl"] .har-oklch,
      .har-wrap[data-layout="oklch"] .har-hsl {
        opacity: 0; visibility: hidden;
        transition: transform var(--motion-slow), opacity var(--motion-slow), visibility 0s 0.4s;
      }
      .har-paintings {
        position: absolute; top: 50%; left: calc(50% - 23vw);
        /* As tall as the wheel and its swatches, clear of the scheme buttons. */
        width: min(42vw, 640px); height: 62vh; margin: 0;
        transform: translate(-50%, -50%);
        display: grid; grid-template: 100% / 100%;
        opacity: 0; visibility: hidden;
        transition: opacity 1.2s ease-out, visibility 0s 1.2s;
      }
      .har-paintings img {
        grid-area: 1 / 1; width: 100%; height: 100%; min-height: 0; object-fit: contain;
        opacity: 0; transition: opacity 0.8s ease-out;
      }
      .har-paintings img.is-shown { opacity: 1; }
      .har-wrap[data-layout="painting"] .har-hsl {
        transform: translate(calc(-50% - 110vw), -50%);
        opacity: 0; visibility: hidden;
        transition: transform var(--motion-slow), opacity var(--motion-slow), visibility 0s 0.4s;
      }
      .har-wrap[data-layout="painting"] .har-oklch { transform: translate(calc(-50% + 23vw), -50%); }
      .har-wrap[data-layout="painting"] .har-paintings {
        opacity: 1; visibility: visible;
        transition: opacity 1.2s ease-out 0.4s, visibility 0s;
      }
      .har-wrap.har-initial, .har-wrap.har-initial * { transition: none !important; }
      @media (prefers-reduced-motion: reduce) {
        .har-wrap, .har-wrap * { transition-duration: 0s !important; transition-delay: 0s !important; }
      }
      .har-modes {
        display: flex; gap: 0.4rem; flex-wrap: wrap;
        justify-content: center;
        width: min(560px, 92vw);
        position: absolute; bottom: 1rem; left: 50%;
        transform: translateX(-50%);
      }
      .har-mode-btn {
        background: none;
        border: 1px solid var(--line);
        color: var(--ink-muted);
        font-family: var(--font-display);
        font-size: var(--text-label); letter-spacing: var(--tracking-caps);
        text-transform: uppercase;
        padding: 0.4rem 0.75rem; border-radius: var(--radius);
        cursor: pointer;
        transition: border-color var(--motion-fast), color var(--motion-fast), background var(--motion-fast);
      }
      .har-mode-btn.active {
        border-color: var(--line);
        color: var(--ink);
        background: var(--fill);
      }
      /* Four swatches is the most a scheme has; each must fit its CSS string. */
      .har-swatches {
        display: flex; gap: 6px;
        width: 100%; min-width: 0;
      }
      .har-swatch {
        flex: 1; min-width: 0; min-height: 64px; border-radius: var(--radius);
        display: grid; place-items: center;
        text-align: center; overflow-wrap: anywhere;
        font-size: clamp(0.55rem, 0.75vw, 0.8rem);
        padding: 0.2rem;
        background: var(--swatch);
        color: var(--ink); color: contrast-color(var(--swatch));
      }
      .har-swatch code { font-size: inherit; white-space: normal; overflow-wrap: anywhere; }
      @media (max-width: 900px) {
        .har-panel { width: 46vw; }
        .har-swatch { font-size: 10px; }
        .har-modes { width: 96vw; }
      }
      @media (max-height: 450px) and (max-width: 900px) {
        /* Reserve the bottom of the stage for the two rows of scheme buttons. */
        .har-panel { top: calc(50% - 27px); gap: 0.3rem; }
        .har-canvas { width: 110px !important; height: 110px !important; }
        .har-swatch { min-height: 38px; }
        .har-modes { bottom: 0.3rem; }
        .har-mode-btn { padding: 0.25rem 0.5rem; }
        .har-paintings { height: 48vh; top: calc(50% - 25px); }
      }
    </style>
    <div class="har-wrap demo-root har-initial" id="har-wrap" data-layout="${model}">
      ${["hsl", "oklch"].map((name) => `
        <div class="har-panel har-${name}" data-model="${name}">
          <span class="har-label">${MODEL_LABEL[name]}</span>
          <canvas class="har-canvas" data-no-swipe tabindex="0" role="slider" aria-label="${MODEL_LABEL[name]} colour harmony wheel" aria-valuemin="0" aria-valuemax="359" aria-valuenow="200" aria-valuetext="Base hue 200 degrees"></canvas>
          <div class="har-swatches"></div>
        </div>
      `).join("")}
      <figure class="har-paintings">${PAINTINGS.map((p) => `<img src="./images/${p.src}" alt="${p.alt}">`).join("")}</figure>
      <div class="har-modes" id="har-modes"></div>
    </div>
  `;

  const wrap = container.querySelector("#har-wrap");
  const modesEl = container.querySelector("#har-modes");
  const panels = [...wrap.querySelectorAll(".har-panel")].map((el) => ({
    model: el.dataset.model,
    el,
    canvas: el.querySelector("canvas"),
    swatchesEl: el.querySelector(".har-swatches"),
    ctx: el.querySelector("canvas").getContext("2d"),
  }));

  // What the wheels show. It follows the target (hue, scheme, painting) with a
  // tween, so the dots travel and the OKLCH lightness and chroma fade from one
  // painting to the next. Each new dot starts from an existing one.
  // mix 0 is the wheel's per-hue maximum chroma; mix 1 is a painting's fixed C.
  const view = { hue, l: OKL, c: 0, mix: 0, offsets: [...MODES[0].offsets] };
  let tweenFrame = 0;
  function target() {
    return { hue, l: painting?.base.l ?? OKL, c: painting?.base.c ?? 0, mix: painting ? 1 : 0, offsets: MODES[modeIdx].offsets };
  }
  function settle(animate) {
    cancelAnimationFrame(tweenFrame);
    const to = target();
    const still = !animate || wrap.classList.contains("har-initial") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      Object.assign(view, { ...to, offsets: [...to.offsets] });
      draw();
      return;
    }
    const from = { ...view, offsets: to.offsets.map((_, i) => view.offsets[Math.min(i, view.offsets.length - 1)]) };
    // Only blend chroma between the wheel's maximum and a painting's C, without
    // ramping the painting's C up from zero, which would dip mid-transition.
    if (from.mix === 0) from.c = to.c;
    if (to.mix === 0) to.c = from.c;
    const start = performance.now();
    const frame = (now) => {
      const t = ease(Math.min(1, (now - start) / TWEEN_MS));
      view.hue = towardsHue(from.hue, to.hue, t);
      view.l = towards(from.l, to.l, t);
      view.c = towards(from.c, to.c, t);
      view.mix = towards(from.mix, to.mix, t);
      view.offsets = to.offsets.map((o, i) => towardsHue(from.offsets[i], o, t));
      draw();
      if (t < 1) tweenFrame = requestAnimationFrame(frame);
    };
    tweenFrame = requestAnimationFrame(frame);
  }

  function applyLayout() {
    wrap.dataset.layout = model === "hsl" ? (["hsl", "both"][currentStep] ?? "painting") : "oklch";
    painting = wrap.dataset.layout === "painting" ? PAINTINGS[Math.min(currentStep - 2, PAINTINGS.length - 1)] : null;
    if (painting) {
      saved ??= { hue, modeIdx };
      hue = painting.base.h;
      modeIdx = MODES.findIndex((m) => m.id === painting.mode);
    } else if (saved) {
      ({ hue, modeIdx } = saved);
      saved = null;
    }
    wrap.querySelectorAll(".har-paintings img").forEach((img, i) => img.classList.toggle("is-shown", PAINTINGS[i] === painting));
    settle(true);
  }

  // The engine may set a later step before the first paint.
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => wrap.classList.remove("har-initial"));
  });

  // Build mode buttons
  MODES.forEach((m, i) => {
    const btn = document.createElement("button");
    btn.className = "har-mode-btn" + (i === 0 ? " active" : "");
    btn.setAttribute("aria-pressed", String(i === 0));
    btn.textContent = m.label;
    btn.addEventListener("click", () => {
      modeIdx = i;
      settle(true);
    });
    modesEl.appendChild(btn);
  });

  function activeHues() {
    return view.offsets.map((o) => wrapHue(view.hue + o));
  }

  // The OKLCH wheel, its dots and its swatches take the shown L and C: L 0.73
  // with each hue's own maximum chroma, or a painting's base colour.
  const paint = (panelModel, h) =>
    panelModel === "oklch"
      ? `oklch(${num(view.l)} ${num(towards(ringChroma(view.l, wrapHue(h)), view.c, view.mix))} ${num(wrapHue(h), 2)})`
      : colourFor.hsl(h);

  function draw() {
    panels.forEach(drawPanel);
    modesEl.querySelectorAll(".har-mode-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === modeIdx);
      btn.setAttribute("aria-pressed", String(i === modeIdx));
    });
  }

  function drawPanel({ model: panelModel, canvas, swatchesEl, ctx }) {
    canvas.setAttribute('aria-valuenow', String(Math.round(hue)));
    canvas.setAttribute('aria-valuetext', `Base hue ${Math.round(hue)} degrees`);
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.width / dpr;
    const cx = size / 2,
      cy = size / 2;
    const R = size * 0.42; // outer radius of wheel ring
    const Ri = size * 0.26; // inner radius of wheel ring (donut hole)
    const dotR = Math.max(7, size * 0.026);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // ── Full spectrum ring ───────────────────────────────────────────────────
    for (let deg = 0; deg < 360; deg++) {
      const a0 = ((deg - 90 - 0.7) * Math.PI) / 180;
      const a1 = ((deg - 90 + 1.2) * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.arc(cx, cy, Ri, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = paint(panelModel, deg);
      ctx.fill();
    }

    const hues = activeHues();

    // ── Connecting polygon ───────────────────────────────────────────────────
    if (hues.length > 1) {
      ctx.beginPath();
      hues.forEach((h, i) => {
        const a = ((h - 90) * Math.PI) / 180;
        const x = cx + Ri * 0.85 * Math.cos(a);
        const y = cy + Ri * 0.85 * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ── Spokes + dots ────────────────────────────────────────────────────────
    hues.forEach((h, i) => {
      const a = ((h - 90) * Math.PI) / 180;
      const color = paint(panelModel, h);
      const ex = cx + R * Math.cos(a);
      const ey = cy + R * Math.sin(a);

      // Spoke (center → outer ring edge)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (Ri - 2) * Math.cos(a), cy + (Ri - 2) * Math.sin(a));
      ctx.strokeStyle = color;
      ctx.lineWidth = i === 0 ? 3 : 2;
      ctx.stroke();

      // Dot on outer ring
      ctx.beginPath();
      ctx.arc(ex, ey, dotR, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      // Canvas cannot read var(): resolve the token.
      ctx.strokeStyle = i === 0 ? "white" : getComputedStyle(document.documentElement).getPropertyValue("--ink-soft").trim();
      ctx.lineWidth = i === 0 ? 2.5 : 1.5;
      ctx.stroke();
    });

    // ── Centre ───────────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, dotR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();

    ctx.restore();

    // Update swatches
    if (swatchesEl.children.length !== hues.length) {
      swatchesEl.innerHTML = "";
      hues.forEach(() => {
        const el = document.createElement("div");
        el.className = "har-swatch";
        el.append(Object.assign(document.createElement("code"), { className: "css-tag" }));
        swatchesEl.appendChild(el);
      });
    }
    swatchesEl.querySelectorAll(".har-swatch").forEach((el, i) => {
      const css = paint(panelModel, hues[i]);
      el.style.setProperty("--swatch", css);
      el.firstElementChild.textContent = css;
    });

  }

  // ── Sizing ──────────────────────────────────────────────────────────────────
  function resize() {
    const wrapRect = wrap.getBoundingClientRect();
    // Fixed panel size across layouts; leave space for labels, swatches and buttons.
    const sz = Math.min(wrapRect.width * 0.46 - 24, 660 - 24, wrapRect.height - 190, 460);
    if (sz < 10) return;
    const dpr = window.devicePixelRatio || 1;
    panels.forEach(({ canvas }) => {
      canvas.style.width = sz + "px";
      canvas.style.height = sz + "px";
      canvas.width = Math.round(sz * dpr);
      canvas.height = Math.round(sz * dpr);
    });
    draw();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);

  // ── Drag to rotate base hue ─────────────────────────────────────────────────
  function hueFromPointer(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    return ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;
  }

  panels.forEach(({ canvas }) => {
    canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      activeCanvas = canvas;
      canvas.setPointerCapture(e.pointerId);
      hue = Math.round(hueFromPointer(e, canvas)) % 360;
      settle(false);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging || activeCanvas !== canvas) return;
      hue = Math.round(hueFromPointer(e, canvas)) % 360;
      settle(false);
    });
    canvas.addEventListener("keydown", (event) => {
      const next = {
        ArrowLeft: hue - 5, ArrowDown: hue - 5,
        ArrowRight: hue + 5, ArrowUp: hue + 5,
        Home: 0, End: 359,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      hue = Math.max(0, Math.min(359, Math.round(next)));
      settle(false);
    });
    for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
      canvas.addEventListener(eventName, () => {
        if (activeCanvas === canvas) dragging = false;
      });
    }
  });

  return {
    step(n) {
      currentStep = n;
      applyLayout();
    },
    update(nextType, bgIdx = 0) {
      model = nextType === "hsl" ? "hsl" : "oklch";
      currentStep = bgIdx;
      applyLayout();
    },
    cleanup() {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      cancelAnimationFrame(tweenFrame);
      ro.disconnect();
      container.innerHTML = "";
    },
  };
}
