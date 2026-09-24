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

export function mount(container) {
  container.style.background = '#0e0e0e';

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x0e0e0e, 1);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;position:absolute;inset:0;';

  // ── HSL toy ─────────────────────────────────────────────────────────────────
  const toy = document.createElement('div');
  toy.innerHTML = `
    <style>
      .hsl-toy {
        position: absolute;
        bottom: 2rem; right: 2rem;
        display: flex; flex-direction: column; gap: 0.6rem;
        padding: 0.9rem 1rem;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 0.5rem;
        font-family: 'Silkscreen', monospace;
        font-size: 0.52rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.5);
        min-width: 180px;
        pointer-events: auto;
      }
      .hsl-toy-chip {
        width: 100%; height: 2.5rem;
        border-radius: 0.3rem;
        transition: background-color 0.1s ease;
      }
      .hsl-toy-row {
        display: flex; align-items: center; gap: 0.6rem;
      }
      .hsl-toy-label { width: 1.4rem; flex-shrink: 0; }
      .hsl-toy-row input[type=range] {
        flex: 1; height: 1.5rem; cursor: pointer; accent-color: white;
      }
      .hsl-toy-val { width: 2.2rem; text-align: right; flex-shrink: 0; }
    </style>
    <div class="hsl-toy">
      <div class="hsl-toy-chip" id="hsl-chip"></div>
      <div class="hsl-toy-row">
        <span class="hsl-toy-label">H</span>
        <input type="range" id="hsl-h" min="0" max="360" step="1" value="200">
        <span class="hsl-toy-val" id="hsl-hv"></span>
      </div>
      <div class="hsl-toy-row">
        <span class="hsl-toy-label">S</span>
        <input type="range" id="hsl-s" min="0" max="100" step="1" value="80">
        <span class="hsl-toy-val" id="hsl-sv"></span>
      </div>
      <div class="hsl-toy-row">
        <span class="hsl-toy-label">L</span>
        <input type="range" id="hsl-l" min="0" max="100" step="1" value="50">
        <span class="hsl-toy-val" id="hsl-lv"></span>
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

  function renderToy() {
    const h = +slH.value, s = +slS.value, l = +slL.value;
    chip.style.backgroundColor = `hsl(${h},${s}%,${l}%)`;
    valH.textContent = h + '°';
    valS.textContent = s + '%';
    valL.textContent = l + '%';
  }
  [slH, slS, slL].forEach(sl => sl.addEventListener('input', renderToy));
  renderToy();

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
  camera.position.set(2.8, 2.2, 3.8);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.0;

  // ── Bicone geometry ─────────────────────────────────────────────────────────
  const posArr = [];
  const colArr = [];

  for (let li = 0; li < STEPS_L; li++) {
    const L    = li / (STEPS_L - 1);
    const maxR = 1 - Math.abs(2 * L - 1);
    for (let hi = 0; hi < STEPS_H; hi++) {
      const H   = (hi / STEPS_H) * 360;
      const rad = H * Math.PI / 180;
      posArr.push(maxR * Math.cos(rad), (L - 0.5) * 2, maxR * Math.sin(rad));
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
  mesh.rotation.z = 0.35;
  scene.add(mesh);

  // ── Render loop ─────────────────────────────────────────────────────────────
  let alive = true;
  let rafId;

  function animate() {
    if (!alive) return;
    rafId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ──────────────────────────────────────────────────────────────────
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  return () => {
    alive = false;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    controls.dispose();
    geo.dispose();
    mat.dispose();
    renderer.dispose();
    container.style.background = '';
    toy.remove();
    container.innerHTML = '';
  };
}
