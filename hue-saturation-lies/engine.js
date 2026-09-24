import { SLIDES } from "./slides.js";

// viz.js builds a THREE.WebGLRenderer at module scope, which throws outright
// where WebGL is unavailable (blocklisted GPU, disabled by policy, hardened
// privacy browsers). A static import would take this whole module down with it
// and render nothing at all, so load it defensively and fall back to no-ops:
// the slides, narration and demos then still work, minus the 3D gamut view.
let setVizOffset = () => {};
let setVizRotate = () => {};
let setVizVisible = () => {};
try {
  ({ setVizOffset, setVizRotate, setVizVisible } = await import("./viz.js"));
} catch (err) {
  console.warn(
    "3D colour-space view unavailable (needs WebGL); continuing without it.",
    err,
  );
  document.body.classList.add("no-viz");
}

const hashSlide = parseInt(location.hash.slice(1), 10);
let currentSlide = hashSlide >= 0 && hashSlide < SLIDES.length ? hashSlide : 0;
let transitioning = false;
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
const statusEl = document.querySelector("#slide-status");
const hudEl = document.querySelector("#slide-hud");
const hudTitleEl = document.querySelector("#hud-title");
const hudAttrEl = document.querySelector("#hud-attribution");
const hudCounterEl = document.querySelector("#hud-counter");
const illustrationEl = document.querySelector("#illustration");
const vizLayer = document.querySelector("#viz-layer");
const demoLayer = document.querySelector("#demo-layer");
const modeToggle = document.querySelector("#mode-toggle");

// ── Demo lifecycle ──────────────────────────────────────────────────────
let currentDemoCleanup = null;
let currentDemoStepFn  = null;

function unmountDemo() {
  currentDemoCleanup?.();
  currentDemoCleanup = null;
  currentDemoStepFn  = null;
  demoLayer.innerHTML = "";
  demoLayer.style.pointerEvents = "none";
}

async function mountDemo(name, type, bgIdx = 0) {
  unmountDemo();
  const { mount } = await import(`./demos/${name}.js`);
  demoLayer.style.pointerEvents = "auto";
  const result = mount(demoLayer, type) ?? null;
  if (result && typeof result === "object" && result.cleanup) {
    currentDemoCleanup = result.cleanup;
    currentDemoStepFn  = result.step ?? null;
  } else {
    currentDemoCleanup = result;
  }
  currentDemoStepFn?.(bgIdx);
}

function updateCounter() {
  hudCounterEl.textContent = `${currentSlide + 1} / ${SLIDES.length}`;
}

function applyBgCrossfade(imageUrl) {
  const next = 1 - activeBgLayer;
  bgLayers[next].style.transition = "none";
  bgLayers[next].style.backgroundImage = imageUrl ? `url(${imageUrl})` : "";
  bgLayers[next].style.opacity = imageUrl ? "1" : "0";
  bgLayers[next].style.zIndex = "1";
  bgLayers[activeBgLayer].style.zIndex = "2";
  bgLayers[activeBgLayer].style.transition = "opacity 0.8s ease";
  bgLayers[activeBgLayer].style.opacity = "0";
  activeBgLayer = next;
}

function setAttribution(attr) {
  if (attr) {
    hudAttrEl.innerHTML = attr.url
      ? `<a href="${attr.url}" target="_blank" rel="noopener">${attr.text}</a>`
      : attr.text;
    hudEl.style.display = "";
  } else {
    hudAttrEl.innerHTML = "";
    hudEl.style.display = "none";
  }
}

function showSlide(idx, bgIdx = 0) {
  const s = SLIDES[idx];
  const sl = s.slide;
  const sc = s.script;

  // Resolve background entry: multi-bg slides use backgrounds[bgIdx]
  const bgEntry = sl.backgrounds
    ? sl.backgrounds[bgIdx]
    : { image: sl.backgroundImage, attribution: sl.attribution };

  slideContentEl.querySelectorAll(".slide-links").forEach((el) => el.remove());

  // Background crossfade: new image loads at full opacity behind the current layer,
  // then the current layer fades out on top — no flash to black.
  applyBgCrossfade(bgEntry?.image);
  bgLayers[activeBgLayer].style.backgroundSize = sl.backgroundSize ?? "cover";
  setAttribution(bgEntry?.attribution);

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
  hudTitleEl.textContent = sc.title ?? "";
  slideBodyEl.innerHTML = (sc.body || "").replace(/_(.*?)_/g, "<em>$1</em>");
  const centerHtml = (sl.body || "").replace(/_(.*?)_/g, "<em>$1</em>");
  slideBodyCenterEl.innerHTML = centerHtml;
  slideBodyCenterEl.className = sl.bodyClass ?? "";
  slideBodyCenterEl.style.cssText = "";
  if (sl.bodyCSS) Object.assign(slideBodyCenterEl.style, sl.bodyCSS);
  slideBodyCenterEl.style.display = sl.body ? "block" : "none";
  slideTitleOverlay.textContent = sl.title ?? "";
  slideTitleOverlay.className = sl.titleStyle ? `title-${sl.titleStyle}` : "";
  slideTitleOverlay.style.cssText = "";
  if (sl.titleCSS) Object.assign(slideTitleOverlay.style, sl.titleCSS);
  slideTitleOverlay.style.display = sl.title ? "" : "none";
  currentTitle = sl.title ?? "";

  if (sl.viz) {
    vizLayer.style.display = "";
    vizLayer.style.pointerEvents = "auto";
    document.body.classList.add("has-viz");
    setVizVisible(true);
  } else {
    vizLayer.style.display = "none";
    vizLayer.style.pointerEvents = "none";
    document.body.classList.remove("has-viz");
    setVizVisible(false);
  }
  setVizRotate(!!sl.rotate);

  if (sl.demo) {
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
  updateCounter();
}

// Updates only the background image + attribution — no text fade.
// Used when stepping through a multi-bg slide.
function updateBackground(bgIdx) {
  const sl = SLIDES[currentSlide].slide;
  const bgEntry = sl.backgrounds[bgIdx];
  applyBgCrossfade(bgEntry.image);
  setAttribution(bgEntry.attribution);
  if ('title' in bgEntry) {
    slideTitleOverlay.textContent = bgEntry.title;
    slideTitleOverlay.className = bgEntry.titleStyle ? `title-${bgEntry.titleStyle}` : "";
    slideTitleOverlay.style.cssText = "";
    if (bgEntry.titleCSS) Object.assign(slideTitleOverlay.style, bgEntry.titleCSS);
    slideTitleOverlay.style.display = bgEntry.title ? "" : "none";
  }
  currentDemoStepFn?.(bgIdx);
}

function slideOut() {
  slideContentEl.style.opacity = "0";
  statusEl.style.opacity = "0";
  hudEl.style.opacity = "0";
  const nextTitle = SLIDES[currentSlide]?.slide?.title ?? "";
  if (nextTitle !== currentTitle) {
    slideTitleOverlay.style.opacity = "0";
  }
  slideBodyCenterEl.style.opacity = "0";
  vizLayer.style.opacity = "0";
  demoLayer.style.opacity = "0";
  illustrationEl.style.transition = "opacity 0.3s ease";
  illustrationEl.style.opacity = "0";
  // bg crossfade is handled by showSlide, not here
}

function slideIn(idx, bgIdx = 0) {
  showSlide(idx, bgIdx);
  requestAnimationFrame(() => {
    slideContentEl.style.opacity = "1";
    statusEl.style.opacity = "1";
    hudEl.style.opacity = "1";
    slideTitleOverlay.style.opacity = "1";
    if (SLIDES[idx].slide.body) slideBodyCenterEl.style.opacity = "1";
    if (SLIDES[idx].slide.demo) demoLayer.style.opacity = "1";
    // Delay viz until bg crossfade finishes (crossfade = 0.8s)
    if (SLIDES[idx].slide.viz) setTimeout(() => { vizLayer.style.opacity = "1"; }, 800);
  });
}

// ── Presenter / reader mode ─────────────────────────────────────────────
let presenterMode = new URLSearchParams(location.search).has("presenter");

function setMode(presenter) {
  presenterMode = presenter;
  document.body.classList.toggle("presenter", presenterMode);
  modeToggle.textContent = presenterMode ? "›" : "‹";
  modeToggle.setAttribute("aria-label", presenterMode ? "Open presenter notes" : "Close presenter notes");
  modeToggle.setAttribute("aria-pressed", String(presenterMode));
  const offset = presenterMode ? 0 : 380;
  setVizOffset(offset);
  demoLayer.style.left = offset ? `${offset}px` : "";
  const hash = location.hash;
  history.replaceState(null, "", presenterMode ? `?presenter${hash}` : location.pathname + hash);
  showSlide(currentSlide);
}

setMode(presenterMode);
modeToggle.addEventListener("click", () => setMode(!presenterMode));

// ── Navigation ─────────────────────────────────────────────────────────
const KEY_DIRS = {
  ArrowRight: true,
  ArrowLeft: false,
  ArrowDown: true,
  ArrowUp: false,
};

const prevBtn = document.querySelector("#slide-prev");
const nextBtn = document.querySelector("#slide-next");

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
    transitioning = true;
    currentSlide = nextSlide;
    currentBgIndex = 0;
    history.replaceState(null, "", `#${currentSlide}`);
    slideOut();
    setTimeout(() => {
      transitioning = false;
      slideIn(currentSlide, 0);
    }, 300);
  } else {
    if (currentBgIndex > 0) {
      currentBgIndex--;
      updateBackground(currentBgIndex);
      return;
    }
    const nextSlide = Math.max(currentSlide - 1, 0);
    if (nextSlide === currentSlide) return;
    transitioning = true;
    currentSlide = nextSlide;
    const prevSl = SLIDES[currentSlide].slide;
    currentBgIndex = prevSl.backgrounds ? prevSl.backgrounds.length - 1 : 0;
    history.replaceState(null, "", `#${currentSlide}`);
    slideOut();
    setTimeout(() => {
      transitioning = false;
      slideIn(currentSlide, currentBgIndex);
    }, 300);
  }
}

prevBtn?.addEventListener("click", () => navigate(false));
nextBtn?.addEventListener("click", () => navigate(true));

window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") {
    setMode(!presenterMode);
    return;
  }
  if (!(e.key in KEY_DIRS)) return;
  e.preventDefault();
  navigate(KEY_DIRS[e.key]);
});

slideIn(currentSlide);
