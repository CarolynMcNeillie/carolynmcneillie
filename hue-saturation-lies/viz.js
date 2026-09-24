import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Delaunator from "delaunator";

THREE.ColorManagement.enabled = true;

// ── Color math: Display P3 → OKLCH ───────────────────────────────────
// P3 uses the same transfer function as sRGB (IEC 61966-2-1)
function p3ToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// CSS Color 4 matrix: linear Display P3 → linear sRGB
function linearP3ToLinearSRGB(r, g, b) {
  return [
     1.2249401 * r - 0.2249401 * g,
    -0.0420576 * r + 1.0420576 * g,
    -0.0196436 * r - 0.0786045 * g + 1.0982481 * b,
  ];
}

function p3ToOKLCH(r, g, b) {
  const [rl, gl, bl] = linearP3ToLinearSRGB(
    p3ToLinear(r), p3ToLinear(g), p3ToLinear(b),
  );
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const l_ = Math.cbrt(l),
    m_ = Math.cbrt(m),
    s_ = Math.cbrt(s);
  const L  =  0.2104542553 * l_ + 0.793617785  * m_ - 0.0040720468 * s_;
  const a  =  1.9779984951 * l_ - 2.428592205  * m_ + 0.4505937099 * s_;
  const bv =  0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766  * s_;
  const C = Math.sqrt(a * a + bv * bv);
  let H = (Math.atan2(bv, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

function onGamutEdge(r, g, b) {
  return (
    r === 0 || g === 0 || b === 0 || r > 0.99 || g > 0.99 || b > 0.99
  );
}

// ── Sample the 6 faces of the Display P3 cube ────────────────────────
const C_MAX = 0.4;
const STEPS = 100;

const positions = []; // flat [x,y,z, ...]
const pts2D = []; // [[x,z], ...] pairs for Delaunator
const rgbColors = [];

for (let ri = 0; ri <= STEPS; ri++) {
  const r = ri / STEPS;
  for (let gi = 0; gi <= STEPS; gi++) {
    const g = gi / STEPS;
    for (let bi = 0; bi <= STEPS; bi++) {
      const b = bi / STEPS;
      if (!onGamutEdge(r, g, b)) continue;
      const [L, C, H] = p3ToOKLCH(r, g, b);
      if (C < 0.001) continue;
      const x = L,
        y = C / (C_MAX * 2),
        z = H / 360;
      positions.push(x, y, z);
      pts2D.push([x, z]);
      rgbColors.push(p3ToLinear(r), p3ToLinear(g), p3ToLinear(b));
    }
  }
}

const bounds = [
  [0, 0, 0],
  [0, 0, 1],
  [1, 0, 0],
  [1, 1, 0],
  [1, 0, 1],
  [1, 1, 1],
];
for (const [x, y, z] of bounds) {
  positions.push(x, y, z);
  pts2D.push([x, z]);
  rgbColors.push(x, x, x);
}

// ── Delaunay triangulation in (L, H) space ───────────────────────────
const geo = new THREE.BufferGeometry();
geo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3),
);
geo.setAttribute("color", new THREE.Float32BufferAttribute(rgbColors, 3));
geo.center();
geo.setIndex(
  new THREE.BufferAttribute(Delaunator.from(pts2D).triangles, 1),
);

// ── Three.js scene ───────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.setAttribute("aria-label", "Interactive 3D OKLCH colour space — drag to rotate");
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace; // P3 and sRGB share the same gamma curve; drawingBufferColorSpace handles the primaries
renderer.drawingBufferColorSpace = THREE.DisplayP3ColorSpace;
document.querySelector("#viz-layer").appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10,
);
camera.position.set(0.9, 0.17, 0.63);

const mat = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});

const topMesh = new THREE.Mesh(geo, mat);
topMesh.translateY(0.3);

const bottom = new THREE.PlaneGeometry(1, 1, 1, 20);
const bottomColors = [];
const rows = bottom.attributes.position.count / 2;
for (let i = 0; i < rows; i++) {
  const v = i / (rows - 1);
  bottomColors.push(v, v, v, v, v, v);
}
bottom.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(bottomColors, 3),
);
bottom.translate(0, 0, -0.2);
bottom.rotateZ(Math.PI * 0.5);
bottom.rotateX(-Math.PI * 0.5);
const bottomMesh = new THREE.Mesh(bottom, mat);

const group = new THREE.Group();
group.add(topMesh);
group.add(bottomMesh);
group.position.y = 0.13;
scene.add(group);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 0.5;
controls.maxDistance = 4;
controls.update();

// ── Visibility flag — set by engine when a viz slide is active ───────
let vizVisible = false;
let vizJustShown = false;
export function setVizVisible(on) {
  if (on && !vizVisible) vizJustShown = true;
  vizVisible = on;
}

// ── Viz viewport offset (shifts center right of sidebar) ────────────
const SIDEBAR_W = 380;
let vizOffset = SIDEBAR_W;
let vizOffsetTarget = SIDEBAR_W;

function applyVizOffset() {
  const w = window.innerWidth;
  const h = window.innerHeight;
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
}
export function setVizRotate(on) {
  controls.autoRotate = on;
}
controls.autoRotateSpeed = 0.6;
applyVizOffset();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  applyVizOffset();
});

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
  });
});

// ── Grayscale toggle ─────────────────────────────────────────────────
const grayBtn = document.querySelector("#viz-grayscale");
let grayActive = false;
grayBtn.addEventListener("click", () => {
  grayActive = !grayActive;
  renderer.domElement.style.filter = grayActive ? "grayscale(1)" : "";
  grayBtn.classList.toggle("active", grayActive);
  grayBtn.setAttribute("aria-pressed", String(grayActive));
  vizJustShown = true; // force a re-render
});

(function animate() {
  requestAnimationFrame(animate);

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

  if (controls.update()) needsRender = true;

  if (vizJustShown) { needsRender = true; vizJustShown = false; }
  if (vizVisible && needsRender) renderer.render(scene, camera);
})();
