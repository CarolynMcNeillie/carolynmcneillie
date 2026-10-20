import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildOklchShape } from "./demos/oklch-shape.js";
import { GRAYSCALE_ICON } from "./demos/icons.js";

THREE.ColorManagement.enabled = true;

// ── Three.js scene ───────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
const vizLayer = document.querySelector("#viz-layer");
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(vizLayer.clientWidth, vizLayer.clientHeight);
renderer.domElement.setAttribute("aria-label", "Interactive 3D OKLCH colour space — drag to rotate");
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; // P3 and sRGB share the same gamma curve; drawingBufferColorSpace handles the primaries
renderer.drawingBufferColorSpace = THREE.DisplayP3ColorSpace;
vizLayer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  vizLayer.clientWidth / vizLayer.clientHeight,
  0.1,
  10,
);
camera.position.set(0.9, 0.17, 0.63);

const { group } = buildOklchShape();
scene.add(group);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 0.5;
controls.maxDistance = 4;
controls.update();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// ── Visibility flag — set by engine when a viz slide is active ───────
let vizVisible = false;
let vizJustShown = false;
export function setVizVisible(on) {
  if (on && !vizVisible) vizJustShown = true;
  vizVisible = on;
  if (on) requestRender();
}

// ── Viz viewport offset (shifts center right of sidebar) ────────────
const SIDEBAR_W = 380;
let vizOffset = SIDEBAR_W;
let vizOffsetTarget = SIDEBAR_W;

function applyVizOffset() {
  const w = vizLayer.clientWidth;
  const h = vizLayer.clientHeight;
  const stageX = Math.round(vizOffset);
  const stageW = w - stageX;
  renderer.setViewport(stageX, 0, stageW, h);
  renderer.setScissor(stageX, 0, stageW, h);
  renderer.setScissorTest(stageX > 0);
  camera.aspect = stageW / h;
  camera.updateProjectionMatrix();
}

export function setVizOffset(v) {
  vizOffsetTarget = v;
  if (reducedMotion.matches) {
    vizOffset = v;
    applyVizOffset();
    vizJustShown = true;
    requestRender();
  }
}
let rotateRequested = false;
export function setVizRotate(on) {
  rotateRequested = on;
  controls.autoRotate = on && !reducedMotion.matches;
  requestRender();
}
reducedMotion.addEventListener("change", () => {
  controls.autoRotate = rotateRequested && !reducedMotion.matches;
  controls.enableDamping = !reducedMotion.matches;
  if (reducedMotion.matches) {
    vizOffset = vizOffsetTarget;
    applyVizOffset();
    if (lerpTarget) {
      camera.position.copy(lerpTarget);
      camera.lookAt(controls.target);
      lerpTarget = null;
    }
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  vizJustShown = true;
  requestRender();
});
controls.enableDamping = !reducedMotion.matches;
controls.addEventListener("change", () => {
  if (reducedMotion.matches && !updating) requestRender();
});
controls.autoRotateSpeed = 0.6;
applyVizOffset();

// The stage changes height when the timeline appears, even without a window resize.
new ResizeObserver(() => {
  if (!vizLayer.clientWidth || !vizLayer.clientHeight) return;
  renderer.setSize(vizLayer.clientWidth, vizLayer.clientHeight);
  applyVizOffset();
  vizJustShown = true;
  requestRender();
}).observe(vizLayer);

// ── Preset viewpoints ────────────────────────────────────────────────
const PRESETS = {
  x: new THREE.Vector3(0, 0.1, 1.5),
  y: new THREE.Vector3(0.01, 1.5, 0.01),
  z: new THREE.Vector3(1.5, 0.1, 0),
};
const HOME = camera.position.clone();

let lerpTarget = null;
let activeBtn = null;

function updateAnnotation(axis) {
  document
    .querySelectorAll(".viz-ann")
    .forEach((el) =>
      el.classList.toggle("visible", el.dataset.for === axis),
    );
}

document.querySelectorAll("#rotation-controls button[data-axis]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn === activeBtn) {
      lerpTarget = HOME.clone();
      activeBtn = null;
      document
        .querySelectorAll("#rotation-controls button[data-axis]")
        .forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
    } else {
      lerpTarget = PRESETS[btn.dataset.axis].clone();
      activeBtn = btn;
      document
        .querySelectorAll("#rotation-controls button[data-axis]")
        .forEach((b) => { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    }
    if (reducedMotion.matches) {
      camera.position.copy(lerpTarget);
      camera.lookAt(controls.target);
      lerpTarget = null;
      vizJustShown = true;
      requestRender();
    }
  });
});

// ── Grayscale toggle ─────────────────────────────────────────────────
const grayBtn = document.querySelector("#viz-grayscale");
grayBtn.innerHTML = GRAYSCALE_ICON;
let grayActive = false;
grayBtn.addEventListener("click", () => {
  grayActive = !grayActive;
  renderer.domElement.classList.toggle("grayscale", grayActive);
  grayBtn.setAttribute("aria-pressed", String(grayActive));
  vizJustShown = true; // force a re-render
  requestRender();
});

// The frame loop runs only while a viz slide shows: it stops itself when
// hidden, and setVizVisible(true) starts it again.
let rafId = 0;
let updating = false;
function requestRender() {
  if (vizVisible && !rafId) rafId = requestAnimationFrame(animate);
}
function animate() {
  rafId = vizVisible && !reducedMotion.matches ? requestAnimationFrame(animate) : 0;

  let needsRender = false;

  if (Math.abs(vizOffset - vizOffsetTarget) > 0.5) {
    vizOffset += (vizOffsetTarget - vizOffset) * 0.08;
    applyVizOffset();
    needsRender = true;
  }

  if (lerpTarget) {
    camera.position.lerp(lerpTarget, 0.06);
    camera.lookAt(controls.target);
    if (camera.position.distanceTo(lerpTarget) < 0.005) lerpTarget = null;
    needsRender = true;
  }

  updating = true;
  if (controls.update()) needsRender = true;
  updating = false;

  if (vizJustShown) { needsRender = true; vizJustShown = false; }
  if (vizVisible && needsRender) renderer.render(scene, camera);
}
