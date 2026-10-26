import { SLIDES } from "./slides.js";
import { renderTimeline } from "./timeline.js";
import { renderScriptBody } from "./script-format.js";

// \u2500\u2500 Title halo (Joel's idea) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// A display title needs a halo that contrasts its own ink, not a fixed
// light or dark. Read the ink's OKLCH lightness back with the same
// arithmetic the OKLCH slides teach (Bj\u00f6rn Ottosson's sRGB-to-OKLab
// matrices) and pick the opposite end of the scale. A 1x1 canvas asks the
// browser to resolve any valid CSS colour (oklch(), a named colour, rgba()),
// so this works for every ink a slide already uses. Exported so a demo that
// draws its own heading (title.js, about-now.js) can halo it the same way.
let haloProbe = null;
function inkLightness(color) {
  haloProbe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  haloProbe.clearRect(0, 0, 1, 1);
  haloProbe.fillStyle = color;
  haloProbe.fillRect(0, 0, 1, 1);
  const [r, g, b] = haloProbe.getImageData(0, 0, 1, 1).data;
  const toLinear = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}
export function autoHaloColor(color) {
  return inkLightness(color) > 0.5 ? "oklch(0.08 0 0)" : "oklch(0.95 0 0)";
}
// Sets --title-halo-auto on el from el's own computed (cascaded) colour. CSS
// reads it as a fallback: var(--title-halo, var(--title-halo-auto)), so a
// slide's own --title-halo in titleCSS/bodyCSS still wins.
function updateAutoHalo(el) {
  el.style.setProperty("--title-halo-auto", autoHaloColor(getComputedStyle(el).color));
}

// Render the first slide before loading the 3D view. WebGL can be unavailable;
// no-op controls keep the deck usable until the import resolves or fails.
let setVizOffset = () => {};
let setVizRotate = () => {};
let setVizVisible = () => {};
let setVizAxis = () => {};

// The hash names the slide, by id or by index. -1 when it names none.
function slideFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  const index = /^\d+$/.test(hash) ? Number(hash) : SLIDES.findIndex(({ id }) => id === hash);
  return index >= 0 && index < SLIDES.length ? index : -1;
}
let currentSlide = Math.max(slideFromHash(), 0);
let transitioning = false;

// Timers that wait for a CSS fade read the same motion token, so they follow
// it (and drop to 0 under prefers-reduced-motion).
function motionMs(token = "--motion-slow") {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const amount = parseFloat(value);
  if (!Number.isFinite(amount)) return 0;
  return /^[\d.]+ms/.test(value) ? amount : amount * 1000;
}
let activeBgLayer = 0;
// ?step=N opens the slide on its Nth arrow step (0-based), for checks and
// screenshots that cannot press keys.
let currentBgIndex = Math.min(
  Math.max(0, Number(new URLSearchParams(location.search).get("step")) || 0),
  Math.max(0, (SLIDES[currentSlide]?.slide.backgrounds?.length ?? 1) - 1),
);
let currentTitle = "";

const bgLayers = [
  document.querySelector("#slide-bg-a"),
  document.querySelector("#slide-bg-b"),
];
const slideText = document.querySelector("#slide-text");
const slideContentEl = document.querySelector("#slide-content");
const slideTitleEl = document.querySelector("#slide-title");
const slideBodyEl = document.querySelector("#slide-body");
const slideTitleOverlay = document.querySelector("#slide-title-overlay");
const slideBodyCenterEl = document.querySelector("#slide-body-center");
const progressFillEl = document.querySelector("#progress-fill");
const illustrationEl = document.querySelector("#illustration");
const vizLayer = document.querySelector("#viz-layer");
const vizAnnotations = document.querySelector("#viz-annotations");
const demoLayer = document.querySelector("#demo-layer");

// ── Slide audio ─────────────────────────────────────────────────────────
// A slide with `audio: { src, label }` gets a play button under its body
// text. Only the active slide's audio plays: showSlide stops it first.
let slideAudio = null;
const PLAY_ICON = '<path d="M9 7v10l8-5z" fill="currentColor"/>';
const PAUSE_ICON = '<path d="M8 7h3v10H8zM13 7h3v10h-3z" fill="currentColor"/>';

function stopSlideAudio() {
  slideAudio?.pause();
  slideAudio = null;
}

function audioButton({ src, label }) {
  const button = document.createElement("button");
  button.className = "slide-audio";
  const render = (playing) => {
    button.setAttribute("aria-label", `${playing ? "Pause" : "Play"}: ${label}`);
    button.title = button.getAttribute("aria-label");
    button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">${playing ? PAUSE_ICON : PLAY_ICON}</svg>`;
  };
  render(false);
  button.addEventListener("click", () => {
    if (!slideAudio) {
      slideAudio = new Audio(src);
      slideAudio.addEventListener("ended", () => render(false));
    }
    if (slideAudio.paused) {
      slideAudio.play();
      render(true);
    } else {
      slideAudio.pause();
      render(false);
    }
  });
  return button;
}

// ── Demo lifecycle ──────────────────────────────────────────────────────
let currentDemoCleanup = null;
let currentDemoStepFn  = null;
// A demo that returns update(type) can carry over to the next slide when that
// slide uses the same demo: it animates to the new state instead of fading
// out and mounting again (srgb to srgb-2).
let currentDemoName    = null;
let currentDemoUpdate  = null;
let demoCarriedOver    = false;

function unmountDemo() {
  currentDemoCleanup?.();
  currentDemoCleanup = null;
  currentDemoStepFn  = null;
  currentDemoName    = null;
  currentDemoUpdate  = null;
  demoLayer.innerHTML = "";
  demoLayer.style.pointerEvents = "none";
}

// titleStyle "lesson" shows only what follows the first colon of
// "Lesson one: colour harmonies", as a display heading. The serif
// "Lesson one" line was dropped on 26 Oct: it was hard to read.
function setTitleOverlay(title = "", style) {
  slideTitleOverlay.className = style ? `title-${style}` : "";
  const split = style === "lesson" ? title.indexOf(":") : -1;
  if (split < 0) { slideTitleOverlay.textContent = title; return; }
  const heading = document.createElement("span");
  heading.className = "title-heading";
  heading.textContent = title.slice(split + 1).trim();
  slideTitleOverlay.replaceChildren(heading);
}

async function mountDemo(name, type, bgIdx = 0) {
  unmountDemo();
  const slideIdx = currentSlide;
  const { mount } = await import(`./demos/${name}.js`);
  demoLayer.style.pointerEvents = "auto";
  const result = mount(demoLayer, type) ?? null;
  currentDemoName = name;
  if (result && typeof result === "object" && result.cleanup) {
    currentDemoCleanup = result.cleanup;
    currentDemoStepFn  = result.step ?? null;
    currentDemoUpdate  = result.update ?? null;
  } else {
    currentDemoCleanup = result;
  }
  currentDemoStepFn?.(bgIdx);
  if (result?.credit && currentSlide === slideIdx) {
    const sl = SLIDES[slideIdx].slide;
    const attribution = sl.backgrounds?.[bgIdx]?.attribution ?? sl.attribution;
    renderTimeline({ slideIndex: slideIdx, bgIndex: bgIdx, attribution, credit: result.credit });
  }
}

function updateProgress() {
  progressFillEl.style.transform = `scaleX(${(currentSlide + 1) / SLIDES.length})`;
}

// position: which part of a cropped (cover) image stays in view, as CSS
// background-position, e.g. "50% 70%". Set per slide or per step.
// scrim: a CSS gradient drawn over the image, to dim it behind a title.
function applyBgCrossfade(imageUrl, size = "cover", position = "center", scrim) {
  const next = 1 - activeBgLayer;
  bgLayers[next].style.transition = "none";
  bgLayers[next].style.backgroundSize = size;
  bgLayers[next].style.backgroundPosition = position;
  bgLayers[next].style.backgroundImage = imageUrl ? `${scrim ? `${scrim}, ` : ""}url(${imageUrl})` : "";
  bgLayers[next].style.opacity = imageUrl ? "1" : "0";
  bgLayers[next].style.zIndex = "1";
  bgLayers[activeBgLayer].style.zIndex = "2";
  bgLayers[activeBgLayer].style.transition = "opacity var(--motion-slow)";
  bgLayers[activeBgLayer].style.opacity = "0";
  activeBgLayer = next;
}

// fit: "whole" shows the whole artwork on black instead of a cover crop.
// A background entry's fit wins over the slide's.
// Apply a slide's style object. Custom properties (--title-halo) need
// setProperty: plain assignment ignores them.
function applyStyle(el, css) {
  for (const [key, value] of Object.entries(css)) {
    if (key.startsWith("--")) el.style.setProperty(key, value);
    else el.style[key] = value;
  }
}

// On a phone held sideways a whole painting is pillarboxed, and a lesson title
// runs past it onto the black, where its dark ink vanishes. Fill the screen there.
const smallLandscape = matchMedia("(max-width: 900px) and (orientation: landscape)");
function backgroundSize(sl, bgEntry) {
  const fit = bgEntry?.fit ?? sl.fit;
  const titled = bgEntry && "title" in bgEntry ? bgEntry : sl;
  const lessonShown = (titled.titleStyle ?? sl.titleStyle) === "lesson" && !!titled.title;
  if (fit === "whole" && lessonShown && smallLandscape.matches) return "cover";
  return fit === "whole" ? "contain" : sl.backgroundSize ?? "cover";
}

function preloadAdjacentImages(idx) {
  for (const neighbor of [SLIDES[idx - 1], SLIDES[idx + 1]]) {
    if (!neighbor) continue;
    const slide = neighbor.slide;
    const images = slide.backgrounds?.map(({ image }) => image) ?? [slide.backgroundImage];
    for (const src of images) if (src) new Image().src = src;
  }
}

function showSlide(idx, bgIdx = 0) {
  const s = SLIDES[idx];
  const sl = s.slide;
  const sc = s.script;

  // Resolve background entry: multi-bg slides use backgrounds[bgIdx]
  const bgEntry = sl.backgrounds
    ? sl.backgrounds[bgIdx]
    : { image: sl.backgroundImage, attribution: sl.attribution, timeline: sl.timeline };
  if (bgEntry?.vizAxis) vizAnnotations.dataset.vizAxis = bgEntry.vizAxis;
  else delete vizAnnotations.dataset.vizAxis;

  slideContentEl.querySelectorAll(".slide-links").forEach((el) => el.remove());

  // Background crossfade: new image loads at full opacity behind the current layer,
  // then the current layer fades out on top — no flash to black.
  applyBgCrossfade(bgEntry?.image, backgroundSize(sl, bgEntry), bgEntry?.backgroundPosition ?? sl.backgroundPosition, bgEntry?.backgroundScrim ?? sl.backgroundScrim);
  renderTimeline({ slideIndex: idx, bgIndex: bgIdx, attribution: bgEntry?.attribution ?? sl.attribution });

  // Illustration: contained float, independent fade with delay
  illustrationEl.style.transition = "";
  if (sl.illustration) {
    illustrationEl.style.backgroundImage = `url(${sl.illustration})`;
    illustrationEl.style.opacity = 1;
  } else {
    illustrationEl.style.backgroundImage = "";
    illustrationEl.style.opacity = 0;
  }

  slideTitleEl.textContent = sc.title ?? "";
  slideBodyEl.innerHTML = renderScriptBody(sc.body || "");
  const centerHtml = (sl.body || "").replace(/_(.*?)_/g, "<em>$1</em>");
  slideBodyCenterEl.innerHTML = centerHtml;
  slideBodyCenterEl.className = sl.bodyClass ?? "";
  // narrowStack: on a narrow portrait screen, show the whole painting with the
  // title above it on black (style.css), for paintings too busy to letter over.
  document.body.classList.toggle("narrow-stack", !!sl.narrowStack);
  slideBodyCenterEl.style.cssText = "";
  if (sl.bodyCSS) applyStyle(slideBodyCenterEl, sl.bodyCSS);
  slideBodyCenterEl.style.display = sl.body ? "block" : "none";
  updateAutoHalo(slideBodyCenterEl);
  if (sl.subtitle) {
    const subtitle = document.createElement("span");
    subtitle.className = "section-subtitle";
    subtitle.textContent = sl.subtitle;
    slideBodyCenterEl.append(subtitle);
  }
  stopSlideAudio();
  if (sl.audio) slideBodyCenterEl.append(audioButton(sl.audio));
  // A step that sets its own title wins, also when the slide opens on that step.
  const titled = bgEntry && "title" in bgEntry ? bgEntry : sl;
  setTitleOverlay(titled.title, titled.titleStyle);
  slideTitleOverlay.style.cssText = "";
  if (titled.titleCSS) applyStyle(slideTitleOverlay, titled.titleCSS);
  slideTitleOverlay.style.display = titled.title ? "" : "none";
  updateAutoHalo(slideTitleOverlay);
  currentTitle = titled.title ?? "";

  // visibility, not display: a display:none layer has no size, and viz.js
  // sizes the 3D view from this layer's box.
  if (sl.viz) {
    vizLayer.style.visibility = "visible";
    vizLayer.style.pointerEvents = "auto";
    document.body.classList.add("has-viz");
    setVizVisible(true);
  } else {
    vizLayer.style.visibility = "hidden";
    vizLayer.style.pointerEvents = "none";
    document.body.classList.remove("has-viz");
    setVizVisible(false);
  }
  setVizRotate(!!sl.rotate);
  if (sl.viz) setVizAxis(bgEntry?.vizAxis);

  if (demoCarriedOver) {
    demoCarriedOver = false;
  } else if (sl.demo) {
    mountDemo(sl.demo, sl.demoType, bgIdx);
  } else {
    unmountDemo();
  }

  if (sl.links?.length) {
    const linksDiv = document.createElement("div");
    linksDiv.className = "slide-links";
    for (const link of sl.links) {
      const a = document.createElement("a");
      a.href = link.url;
      a.textContent = link.text;
      a.target = "_blank";
      a.rel = "noopener";
      linksDiv.appendChild(a);
    }
    slideContentEl.appendChild(linksDiv);
  }

  const hasSlideContent = sc.title || sc.body || sl.links?.length;
  slideText.style.display = hasSlideContent ? "" : "none";
  updateProgress();
  // Start nearby image requests after the current slide gets a frame to paint.
  requestAnimationFrame(() => requestAnimationFrame(() => preloadAdjacentImages(idx)));
}

// Updates only the background image + attribution — no text fade.
// Used when stepping through a multi-bg slide.
function updateBackground(bgIdx) {
  const sl = SLIDES[currentSlide].slide;
  const bgEntry = sl.backgrounds[bgIdx];
  if (bgEntry.vizAxis) vizAnnotations.dataset.vizAxis = bgEntry.vizAxis;
  else delete vizAnnotations.dataset.vizAxis;
  if (sl.viz) setVizAxis(bgEntry.vizAxis);
  applyBgCrossfade(bgEntry.image, backgroundSize(sl, bgEntry), bgEntry.backgroundPosition ?? sl.backgroundPosition, bgEntry.backgroundScrim ?? sl.backgroundScrim);
  renderTimeline({ slideIndex: currentSlide, bgIndex: bgIdx, attribution: bgEntry.attribution ?? sl.attribution });
  if ('title' in bgEntry) {
    setTitleOverlay(bgEntry.title, bgEntry.titleStyle);
    slideTitleOverlay.style.cssText = "";
    if (bgEntry.titleCSS) applyStyle(slideTitleOverlay, bgEntry.titleCSS);
    slideTitleOverlay.style.display = bgEntry.title ? "" : "none";
    updateAutoHalo(slideTitleOverlay);
  }
  currentDemoStepFn?.(bgIdx);
}

function slideOut({ keepDemo = false } = {}) {
  slideContentEl.style.opacity = "0";
  const nextTitle = SLIDES[currentSlide]?.slide?.title ?? "";
  if (nextTitle !== currentTitle) {
    slideTitleOverlay.style.opacity = "0";
  }
  slideBodyCenterEl.style.opacity = "0";
  vizLayer.style.opacity = "0";
  if (!keepDemo) demoLayer.style.opacity = "0";
  illustrationEl.style.transition = "opacity var(--motion-slow)";
  illustrationEl.style.opacity = "0";
  // bg crossfade is handled by showSlide, not here
}

function slideIn(idx, bgIdx = 0) {
  showSlide(idx, bgIdx);
  requestAnimationFrame(() => {
    slideContentEl.style.opacity = "1";
    slideTitleOverlay.style.opacity = "1";
    if (SLIDES[idx].slide.body) slideBodyCenterEl.style.opacity = "1";
    if (SLIDES[idx].slide.demo) demoLayer.style.opacity = "1";
    // Delay viz until the background crossfade (--motion-slow) finishes
    if (SLIDES[idx].slide.viz) setTimeout(() => { vizLayer.style.opacity = "1"; }, motionMs());
  });
}

// ── Presenter / reader mode ─────────────────────────────────────────────
// Presenter mode is the default; `?reader` opens the notes view. Old
// `?presenter` links still land in presenter mode.
let presenterMode = !new URLSearchParams(location.search).has("reader");
// Reader mode shifts the stage right by the notes sidebar (#slide-text width in style.css).
const readerOffset = () => (presenterMode ? 0 : 380);

function setMode(presenter) {
  presenterMode = presenter;
  document.body.classList.toggle("presenter", presenterMode);
  const offset = readerOffset();
  setVizOffset(offset);
  demoLayer.style.left = offset ? `${offset}px` : "";
  const hash = location.hash;
  // Keep any other query settings (for example ?forest-layers=8); only the
  // mode flag changes. Old ?presenter is dropped, as before.
  const params = new URLSearchParams(location.search);
  params.delete("reader");
  params.delete("presenter");
  const rest = params.toString();
  const search = presenterMode ? (rest ? `?${rest}` : "") : `?reader${rest ? `&${rest}` : ""}`;
  history.replaceState(null, "", location.pathname + search + hash);
  // Mid-transition, slideIn is about to show the new slide anyway. Showing it
  // here too would remount a demo that goToSlide is carrying over.
  if (!transitioning) showSlide(currentSlide, currentBgIndex);
}

setMode(presenterMode);
// Other modules (the script editor) switch modes without a button: dispatch hsl:set-mode.
window.addEventListener("hsl:set-mode", (event) => setMode(!!event.detail?.presenter));

// ── Navigation ─────────────────────────────────────────────────────────
const KEY_DIRS = {
  ArrowRight: true,
  ArrowLeft: false,
  ArrowDown: true,
  ArrowUp: false,
};


// Each slide change adds a history entry, so the browser's Back and Forward
// step through slides. Background steps within a slide do not.
function goToSlide(idx, bgIdx, { record = true } = {}) {
  transitioning = true;
  currentSlide = idx;
  currentBgIndex = bgIdx;
  if (record) history.pushState(null, "", `#${SLIDES[idx].id}`);
  const next = SLIDES[idx].slide;
  const carry = !!currentDemoUpdate && next.demo === currentDemoName;
  if (carry) {
    demoCarriedOver = true;
    currentDemoUpdate(next.demoType, bgIdx);
  }
  slideOut({ keepDemo: carry });
  setTimeout(() => {
    transitioning = false;
    slideIn(idx, bgIdx);
  }, motionMs());
}

// Back, Forward, or an edited hash. Both events can fire for one change;
// the second finds the slide already current and does nothing.
function followHash() {
  const idx = slideFromHash();
  if (idx < 0 || idx === currentSlide) return;
  if (transitioning) {
    setTimeout(followHash, motionMs() + 20);
    return;
  }
  goToSlide(idx, 0, { record: false });
}
window.addEventListener("popstate", followHash);
window.addEventListener("hashchange", followHash);

function navigate(goingForward) {
  if (transitioning) return;
  const sl = SLIDES[currentSlide].slide;
  const bgCount = sl.backgrounds?.length ?? 1;

  if (goingForward) {
    if (sl.backgrounds && currentBgIndex < bgCount - 1) {
      currentBgIndex++;
      updateBackground(currentBgIndex);
      return;
    }
    const nextSlide = Math.min(currentSlide + 1, SLIDES.length - 1);
    if (nextSlide === currentSlide) return;
    goToSlide(nextSlide, 0);
  } else {
    if (currentBgIndex > 0) {
      currentBgIndex--;
      updateBackground(currentBgIndex);
      return;
    }
    const nextSlide = Math.max(currentSlide - 1, 0);
    if (nextSlide === currentSlide) return;
    const prevSl = SLIDES[nextSlide].slide;
    goToSlide(nextSlide, prevSl.backgrounds ? prevSl.backgrounds.length - 1 : 0);
  }
}

// Demo authors can put data-no-swipe on a drag surface or its wrapper.
// Leave controls to their own pointer handlers. The 3D canvases rotate with a
// mouse only (demos/touch-free.js), so a swipe across them still navigates.
let swipeStart = null;
window.addEventListener("pointerdown", (e) => {
  swipeStart = null;
  if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
  if (document.querySelector('#slide-sorter')?.hidden === false) return;
  const blocked = e.composedPath().some((node) => node instanceof Element && (
    node.matches('input, button, select, textarea, label, a, [role="slider"], [role="button"], [data-no-swipe]') ||
    getComputedStyle(node).touchAction.split(/\s+/).includes('none')
  ));
  if (!blocked) swipeStart = { id: e.pointerId, x: e.clientX, y: e.clientY, time: performance.now() };
}, true);
window.addEventListener("pointerup", (e) => {
  if (!swipeStart || e.pointerId !== swipeStart.id) return;
  const { x, y, time } = swipeStart;
  swipeStart = null;
  const dx = e.clientX - x;
  if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(e.clientY - y) * 1.5 && performance.now() - time < 700) {
    navigate(dx < 0);
  }
});
window.addEventListener("pointercancel", () => { swipeStart = null; });

window.addEventListener("keydown", (e) => {
  if (document.querySelector('#slide-sorter')?.hidden === false ||
      e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (e.key === "p" || e.key === "P") {
    setMode(!presenterMode);
    return;
  }
  if (!(e.key in KEY_DIRS)) return;
  e.preventDefault();
  navigate(KEY_DIRS[e.key]);
});

slideIn(currentSlide, currentBgIndex);
// Start in the background right after first paint, even when this is not a viz slide.
// Apply the latest slide and mode, not the state captured when the import began.
requestAnimationFrame(() => requestAnimationFrame(() => {
  import("./viz.js").then((viz) => {
    ({ setVizOffset, setVizRotate, setVizVisible, setVizAxis } = viz);
    const slide = SLIDES[currentSlide].slide;
    setVizOffset(readerOffset());
    setVizVisible(!!slide.viz);
    setVizRotate(!!slide.rotate);
    if (slide.viz) setVizAxis(slide.backgrounds?.[currentBgIndex]?.vizAxis);
  }).catch((err) => {
    console.warn("3D colour-space view unavailable (needs WebGL); continuing without it.", err);
  });
}));
