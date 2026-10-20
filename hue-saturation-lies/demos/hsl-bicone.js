// ── HSL Bicone Demo ───────────────────────────────────────────────────────────
// Interactive 3D double-cone representing the HSL colour space.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function hslToSRGB(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [r + m, g + m, b + m];
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hslToLinear(h, s, l) {
  return hslToSRGB(h, s, l).map(srgbToLinear);
}

const STEPS_H = 72;
const STEPS_L = 49;
const activeMounts = new WeakMap();

export function mount(container) {
  activeMounts.get(container)?.();
  container.style.background = 'var(--scrim)';

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;position:absolute;inset:2rem 1rem 7rem;width:calc(100% - 2rem);height:calc(100% - 9rem);';

  // ── HSL toy ─────────────────────────────────────────────────────────────────
  const toy = document.createElement('div');
  toy.innerHTML = `
    <style>
      .hsl-toy {
        position: absolute; bottom: .75rem; left: 50%;
        transform: translateX(-50%);
        width: min(840px, calc(100% - 4rem));
        display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
        color: var(--ink-muted);
        pointer-events: auto;
      }
      .hsl-toy-sample { display: flex; align-items: center; gap: 1rem; }
      .hsl-toy-chip { width: 3rem; height: 3rem; border-radius: var(--radius); }
      .hsl-toy-code { color: var(--ink); }
      .hsl-toy-controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; width: 100%; }
      .hsl-toy-row { display: flex; align-items: center; gap: .65rem; min-height: 44px; }
      .hsl-toy-label { width: 1.4rem; flex-shrink: 0; }
      .hsl-toy-row input[type=range] { flex: 1; min-width: 0; }
      .hsl-toy-val { min-width: 4ch; text-align: right; flex-shrink: 0; white-space: nowrap; }
      @media (max-width: 650px) {
        .hsl-toy { bottom: 1rem; gap: .5rem; }
        .hsl-toy-controls { grid-template-columns: 1fr; gap: 0; }
      }
    </style>
    <div class="hsl-toy caps-label">
      <div class="hsl-toy-sample">
        <div class="hsl-toy-chip" id="hsl-chip" role="img" aria-label="Selected HSL colour"></div>
        <code class="css-tag hsl-toy-code"></code>
      </div>
      <div class="hsl-toy-controls">
        <div class="hsl-toy-row">
          <label class="hsl-toy-label" for="hsl-h">H</label>
          <input type="range" id="hsl-h" aria-label="Hue" min="0" max="360" step="1" value="200">
          <span class="hsl-toy-val" id="hsl-hv"></span>
        </div>
        <div class="hsl-toy-row">
          <label class="hsl-toy-label" for="hsl-s">S</label>
          <input type="range" id="hsl-s" aria-label="Saturation" min="0" max="100" step="1" value="80">
          <span class="hsl-toy-val" id="hsl-sv"></span>
        </div>
        <div class="hsl-toy-row">
          <label class="hsl-toy-label" for="hsl-l">L</label>
          <input type="range" id="hsl-l" aria-label="Lightness" min="0" max="100" step="1" value="50">
          <span class="hsl-toy-val" id="hsl-lv"></span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(toy);

  const chip  = toy.querySelector('#hsl-chip');
  const slH   = toy.querySelector('#hsl-h');
  const slS   = toy.querySelector('#hsl-s');
  const slL   = toy.querySelector('#hsl-l');
  const valH  = toy.querySelector('#hsl-hv');
  const valS  = toy.querySelector('#hsl-sv');
  const valL  = toy.querySelector('#hsl-lv');

  let moveMarker = () => {};
  function renderToy() {
    const h = +slH.value, s = +slS.value, l = +slL.value;
    const css = `hsl(${h} ${s}% ${l}%)`;
    chip.style.backgroundColor = css;
    toy.querySelector('.hsl-toy-code').textContent = css;
    valH.textContent = h + '°';
    valS.textContent = s + '%';
    valL.textContent = l + '%';
    moveMarker(h, s / 100, l / 100);
  }
  [slH, slS, slL].forEach(sl => sl.addEventListener('input', renderToy));
  renderToy();

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 30);
  camera.position.set(3.2, 2.3, 4);
  camera.zoom = 1.9;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // No auto-rotation: the model holds still until someone drags it.
  controls.enableDamping = !reducedMotion.matches;

  // ── Bicone geometry ─────────────────────────────────────────────────────────
  const posArr = [];
  const colArr = [];

  for (let li = 0; li < STEPS_L; li++) {
    const L    = li / (STEPS_L - 1);
    const maxR = 1 - Math.abs(2 * L - 1);
    for (let hi = 0; hi < STEPS_H; hi++) {
      const H   = (hi / STEPS_H) * 360;
      const rad = H * Math.PI / 180;
      posArr.push(maxR * Math.cos(rad), (L - 0.5) * 2, -maxR * Math.sin(rad));
      colArr.push(...hslToLinear(H, 1, L));
    }
  }

  const idxArr = [];
  for (let li = 0; li < STEPS_L - 1; li++) {
    for (let hi = 0; hi < STEPS_H; hi++) {
      const a = li       * STEPS_H + hi;
      const b = li       * STEPS_H + (hi + 1) % STEPS_H;
      const c = (li + 1) * STEPS_H + (hi + 1) % STEPS_H;
      const d = (li + 1) * STEPS_H + hi;
      idxArr.push(a, b, c,  a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(colArr, 3));
  geo.setIndex(idxArr);

  const mat  = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Keep the selected colour legible even when it lies inside the solid cone.
  const markerGeometry = new THREE.SphereGeometry(.047, 16, 12);
  const markerRing = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: 0x111111, depthTest: false }));
  const markerDot = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
  markerDot.scale.setScalar(.72);
  markerRing.renderOrder = 2;
  markerDot.renderOrder = 3;
  scene.add(markerRing, markerDot);
  renderer.domElement.hslPosition = markerRing.position;
  const markerTarget = new THREE.Vector3();
  let markerStart = markerRing.position.clone();
  let markerStarted = 0;
  const markerDuration = 300;
  moveMarker = (h, s, l) => {
    const radius = s * (1 - Math.abs(2 * l - 1));
    const angle = h * Math.PI / 180;
    markerTarget.set(radius * Math.cos(angle), (l - .5) * 2, -radius * Math.sin(angle));
    markerStart = markerRing.position.clone();
    markerStarted = performance.now();
    if (reducedMotion.matches) markerRing.position.copy(markerTarget);
    markerDot.position.copy(markerRing.position);
    requestRender();
  };

  // ── Render loop ─────────────────────────────────────────────────────────────
  let alive = true;
  let rafId = 0;
  let updating = false;

  function requestRender() {
    if (alive && !rafId) rafId = requestAnimationFrame(animate);
  }
  function animate() {
    rafId = 0;
    if (!alive) return;
    updating = true;
    // update() returns true while a drag is still easing to a stop.
    const moving = controls.update();
    updating = false;
    const elapsed = performance.now() - markerStarted;
    const dotMoving = !reducedMotion.matches && elapsed < markerDuration && !markerRing.position.equals(markerTarget);
    if (dotMoving) {
      const t = Math.min(1, elapsed / markerDuration);
      markerRing.position.lerpVectors(markerStart, markerTarget, t * t * (3 - 2 * t));
    } else markerRing.position.copy(markerTarget);
    markerDot.position.copy(markerRing.position);
    renderer.render(scene, camera);
    if (moving || dotMoving) requestRender();
  }
  function motionChanged() {
    controls.enableDamping = !reducedMotion.matches;
    if (reducedMotion.matches) cancelAnimationFrame(rafId);
    if (reducedMotion.matches) rafId = 0;
    if (reducedMotion.matches) markerRing.position.copy(markerTarget);
    requestRender();
  }
  reducedMotion.addEventListener('change', motionChanged);
  const controlsChanged = () => { if (!updating) requestRender(); };
  controls.addEventListener('change', controlsChanged);
  requestRender();

  // ── Resize ──────────────────────────────────────────────────────────────────
  function resize() {
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  moveMarker(+slH.value, +slS.value / 100, +slL.value / 100);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  const cleanup = () => {
    if (activeMounts.get(container) === cleanup) activeMounts.delete(container);
    alive = false;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    reducedMotion.removeEventListener('change', motionChanged);
    controls.removeEventListener('change', controlsChanged);
    controls.dispose();
    geo.dispose();
    mat.dispose();
    markerGeometry.dispose();
    markerRing.material.dispose();
    markerDot.material.dispose();
    delete renderer.domElement.hslPosition;
    renderer.dispose();
    renderer.forceContextLoss();
    container.style.background = '';
    toy.remove();
    container.innerHTML = '';
  };
  activeMounts.set(container, cleanup);
  return cleanup;
}
