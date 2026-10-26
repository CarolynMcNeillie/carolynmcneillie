import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mouseOnlyControls } from "./demos/touch-free.js";
import { buildOklchShape } from "./demos/oklch-shape.js";

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
const shapeBox = new THREE.Box3().setFromObject(group);

const controls = new OrbitControls(camera, renderer.domElement);
mouseOnlyControls(renderer.domElement);
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

let stage = { x: 0, w: 1, h: 1 };
function applyVizOffset() {
  const w = vizLayer.clientWidth;
  const h = vizLayer.clientHeight;
  // The reader sidebar is absent on narrow portrait screens; keep the model centred.
  const portrait = w < h && w <= 900;
  const stageX = portrait ? 0 : Math.round(vizOffset);
  const stageW = w - stageX;
  stage = { x: stageX, w: stageW, h };
  renderer.setViewport(stageX, 0, stageW, h);
  renderer.setScissor(stageX, 0, stageW, h);
  renderer.setScissorTest(stageX > 0);
  camera.aspect = stageW / h;
  // Preserve horizontal room for the shape at every camera preset and on resize.
  camera.zoom = portrait ? Math.min(1, camera.aspect / (1060 / 900)) : 1;
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
      camera.position.copy(lerpTarget.position);
      camera.up.copy(lerpTarget.up);
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

// The mesh uses x for lightness, y for chroma and z for hue (0 to 360).
// Align each direction with its annotation: L increases right, C rises
// vertically, and H increases diagonally from bottom left to top right.
const HOME = { position: camera.position.clone(), up: camera.up.clone() };
const PRESETS = {
  l: { position: new THREE.Vector3(0, 0.1, 1.5), up: new THREE.Vector3(0, 1, 0) },
  c: { position: new THREE.Vector3(-1.5, 0, 0), up: new THREE.Vector3(0, 1, 0) },
  h: { position: new THREE.Vector3(0.01, 1.5, 0.01), up: new THREE.Vector3(1, 0, 1).normalize() },
};
let lerpTarget = null;
let firstAxis = true;
let currentAxis = null;

// The hue view's scale runs from 0 to 360 degrees along the shape's own hue
// axis, through the middle of the shape, wherever the camera puts it.
const hueAnn = document.querySelector('#viz-annotations .viz-ann[data-for="y"]');
function alignHueAnnotation() {
  const line = hueAnn?.querySelector(':scope > line');
  const texts = hueAnn?.querySelectorAll(':scope > text');
  const ctm = hueAnn?.getScreenCTM();
  if (!line || texts.length < 3 || !ctm) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const toSvg = (z) => {
    const c = shapeBox.getCenter(new THREE.Vector3());
    const ndc = new THREE.Vector3(c.x, c.y, z).project(camera);
    const px = rect.left + stage.x + (ndc.x + 1) / 2 * stage.w;
    const py = rect.top + (1 - ndc.y) / 2 * stage.h;
    return new DOMPoint(px, py).matrixTransform(ctm.inverse());
  };
  const a = toSvg(shapeBox.min.z), b = toSvg(shapeBox.max.z);
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const dx = (b.x - a.x) / len, dy = (b.y - a.y) / len;
  const set = (el, attrs) => { for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v.toFixed(2)); };
  set(line, { x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  set(texts[0], { x: a.x - dx * 2.5, y: a.y - dy * 2.5 + 0.3 });
  set(texts[1], { x: b.x + dx * 2.5, y: b.y + dy * 2.5 + 0.3 });
  set(texts[2], { x: (a.x + b.x) / 2 - dy * 2.5, y: (a.y + b.y) / 2 + dx * 2.5 + 0.3 });
}

export function setVizAxis(axis) {
  currentAxis = axis ?? null;
  const target = PRESETS[axis] ?? HOME;
  if (firstAxis || reducedMotion.matches) {
    camera.position.copy(target.position);
    camera.up.copy(target.up);
    camera.lookAt(controls.target);
    lerpTarget = null;
    vizJustShown = true;
  } else {
    lerpTarget = target;
  }
  firstAxis = false;
  requestRender();
}

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
    camera.position.lerp(lerpTarget.position, 0.06);
    camera.up.lerp(lerpTarget.up, 0.06).normalize();
    camera.lookAt(controls.target);
    if (camera.position.distanceTo(lerpTarget.position) < 0.005 &&
        camera.up.distanceTo(lerpTarget.up) < 0.005) lerpTarget = null;
    needsRender = true;
  }

  updating = true;
  if (controls.update()) needsRender = true;
  updating = false;

  if (vizJustShown) { needsRender = true; vizJustShown = false; }
  if (vizVisible && needsRender) {
    renderer.render(scene, camera);
    if (currentAxis === "h") alignHueAnnotation();
  }
}
