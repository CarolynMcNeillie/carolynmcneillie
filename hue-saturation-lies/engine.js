import { SLIDES } from "./slides.js";
import { renderTimeline } from "./timeline.js";
import { renderScriptBody } from "./script-format.js";

// Render the first slide before loading the 3D view. WebGL can be unavailable;
// no-op controls keep the deck usable until the import resolves or fails.
let setVizOffset = () => {};
let setVizRotate = () => {};
let setVizVisible = () => {};

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
let currentBgIndex = 0;
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

function applyBgCrossfade(imageUrl, size = "cover") {
  const next = 1 - activeBgLayer;
  bgLayers[next].style.transition = "none";
  bgLayers[next].style.backgroundSize = size;
  bgLayers[next].style.backgroundImage = imageUrl ? `url(${imageUrl})` : "";
  bgLayers[next].style.opacity = imageUrl ? "1" : "0";
  bgLayers[next].style.zIndex = "1";
  bgLayers[activeBgLayer].style.zIndex = "2";
  bgLayers[activeBgLayer].style.transition = "opacity var(--motion-slow)";
  bgLayers[activeBgLayer].style.opacity = "0";
  activeBgLayer = next;
}

// fit: "whole" shows the whole artwork on black instead of a cover crop.
// A background entry's fit wins over the slide's.
function backgroundSize(sl, bgEntry) {
  const fit = bgEntry?.fit ?? sl.fit;
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

  slideContentEl.querySelectorAll(".slide-links").forEach((el) => el.remove());

  // Background crossfade: new image loads at full opacity behind the current layer,
  // then the current layer fades out on top — no flash to black.
  applyBgCrossfade(bgEntry?.image, backgroundSize(sl, bgEntry));
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
  slideBodyCenterEl.style.cssText = "";
  if (sl.bodyCSS) Object.assign(slideBodyCenterEl.style, sl.bodyCSS);
  slideBodyCenterEl.style.display = sl.body ? "block" : "none";
  if (sl.subtitle) {
    const subtitle = document.createElement("span");
    subtitle.className = "section-subtitle";
    subtitle.textContent = sl.subtitle;
    slideBodyCenterEl.append(subtitle);
  }
  stopSlideAudio();
  if (sl.audio) slideBodyCenterEl.append(audioButton(sl.audio));
  slideTitleOverlay.textContent = sl.title ?? "";
  slideTitleOverlay.className = sl.titleStyle ? `title-${sl.titleStyle}` : "";
  slideTitleOverlay.style.cssText = "";
  if (sl.titleCSS) Object.assign(slideTitleOverlay.style, sl.titleCSS);
  slideTitleOverlay.style.display = sl.title ? "" : "none";
  currentTitle = sl.title ?? "";

  // visibility, not display: a display:none layer has no size, and viz.js
  // sizes the 3D view from this layer's box.
  if (sl.viz) {
    vizLayer.style.visibility = "visible";
    vizLayer.style.pointerEvents = "auto";
    document.body.classList.add("has-viz");
    document.body.classList.toggle("viz-no-controls", sl.vizControls === false);
    setVizVisible(true);
  } else {
    vizLayer.style.visibility = "hidden";
    vizLayer.style.pointerEvents = "none";
    document.body.classList.remove("has-viz", "viz-no-controls");
    setVizVisible(false);
  }
  setVizRotate(!!sl.rotate);

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
  applyBgCrossfade(bgEntry.image, backgroundSize(sl, bgEntry));
  renderTimeline({ slideIndex: currentSlide, bgIndex: bgIdx, attribution: bgEntry.attribution ?? sl.attribution });
  if ('title' in bgEntry) {
    slideTitleOverlay.textContent = bgEntry.title;
    slideTitleOverlay.className = bgEntry.titleStyle ? `title-${bgEntry.titleStyle}` : "";
    slideTitleOverlay.style.cssText = "";
    if (bgEntry.titleCSS) Object.assign(slideTitleOverlay.style, bgEntry.titleCSS);
    slideTitleOverlay.style.display = bgEntry.title ? "" : "none";
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
  history.replaceState(null, "", presenterMode ? location.pathname + hash : `?reader${hash}`);
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

slideIn(currentSlide);
// Start in the background right after first paint, even when this is not a viz slide.
// Apply the latest slide and mode, not the state captured when the import began.
requestAnimationFrame(() => requestAnimationFrame(() => {
  import("./viz.js").then((viz) => {
    ({ setVizOffset, setVizRotate, setVizVisible } = viz);
    const slide = SLIDES[currentSlide].slide;
    setVizOffset(readerOffset());
    setVizVisible(!!slide.viz);
    setVizRotate(!!slide.rotate);
    // The axis buttons show only from here on, since viz.js wires their clicks.
    document.body.classList.add("viz-ready");
  }).catch((err) => {
    console.warn("3D colour-space view unavailable (needs WebGL); continuing without it.", err);
  });
}));
