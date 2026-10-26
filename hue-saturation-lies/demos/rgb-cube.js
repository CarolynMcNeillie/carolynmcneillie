import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mouseOnlyControls } from './touch-free.js';

// The sRGB cube for gradient-rgb, drawn like the HSL and OKLCH path models on
// gradient-paths: a darkened solid with the gradient's path in full colour.
// The cube stands on its black corner with white on top, so the grey axis is
// vertical, the same axis the HSL bicone grows around. An sRGB gradient is a
// straight line through the cube; blue to yellow runs corner to opposite
// corner, straight through the grey at the centre. A marker rides the line at
// the slide's current position along the gradient.

const decode = v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
// Vertex colours are linear, as on gradient-paths (see its viz.js note).
const colour = rgb => new THREE.Color(...rgb.map(v => decode(Math.max(0, Math.min(1, v)))));
const SHAPE_BRIGHTNESS = 0.12;
const EDGE_BRIGHTNESS = 0.55;
const SIZE = 1.2; // cube edge in scene units; its height on end is SIZE * sqrt(3)

export function createRgbCube(host, pair) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    host.hidden = true; // the bars and swatch still tell the story
    return { setT() {}, dispose() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.drawingBufferColorSpace = THREE.DisplayP3ColorSpace;
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.set(2.7, 1.35, 2.7);
  const controls = new OrbitControls(camera, renderer.domElement);
  mouseOnlyControls(renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const onMotion = () => {
    controls.autoRotate = !reducedMotion.matches;
    controls.enableDamping = !reducedMotion.matches;
  };
  onMotion();
  reducedMotion.addEventListener('change', onMotion);
  controls.autoRotateSpeed = 0.6;

  const resources = [];
  const keep = item => { resources.push(item); return item; };

  // Work in channel space (0..1 per axis), centred on grey, then stand the
  // cube on its black corner: turn the (1, 1, 1) diagonal to point up.
  const cube = new THREE.Group();
  cube.quaternion.setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(0, 1, 0));
  cube.scale.setScalar(SIZE);
  scene.add(cube);
  const at = ([r, g, b]) => new THREE.Vector3(r - 0.5, g - 0.5, b - 0.5);

  // Solid faces, vertex-coloured by their corners and darkened.
  const box = keep(new THREE.BoxGeometry(1, 1, 1));
  const positions = box.getAttribute('position');
  const faceColours = [];
  for (let i = 0; i < positions.count; i++) {
    const c = colour([positions.getX(i) + 0.5, positions.getY(i) + 0.5, positions.getZ(i) + 0.5]);
    faceColours.push(c.r * SHAPE_BRIGHTNESS, c.g * SHAPE_BRIGHTNESS, c.b * SHAPE_BRIGHTNESS);
  }
  box.setAttribute('color', new THREE.Float32BufferAttribute(faceColours, 3));
  cube.add(new THREE.Mesh(box, keep(new THREE.MeshBasicMaterial({ vertexColors: true }))));

  // The twelve edges, each shaded from one corner colour to the next.
  const edgePositions = [], edgeColours = [];
  for (let axis = 0; axis < 3; axis++) for (const u of [0, 1]) for (const v of [0, 1]) {
    const a = [0, 0, 0], b = [0, 0, 0];
    const [p, q] = [0, 1, 2].filter(n => n !== axis);
    a[p] = b[p] = u; a[q] = b[q] = v; b[axis] = 1;
    for (const corner of [a, b]) {
      edgePositions.push(...at(corner).toArray());
      const c = colour(corner);
      edgeColours.push(c.r * EDGE_BRIGHTNESS, c.g * EDGE_BRIGHTNESS, c.b * EDGE_BRIGHTNESS);
    }
  }
  const edges = keep(new THREE.BufferGeometry());
  edges.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
  edges.setAttribute('color', new THREE.Float32BufferAttribute(edgeColours, 3));
  cube.add(new THREE.LineSegments(edges, keep(new THREE.LineBasicMaterial({ vertexColors: true }))));

  // The gradient: sRGB interpolation is a straight line in this cube.
  const a = pair.a.map(v => v / 255), b = pair.b.map(v => v / 255);
  const mixed = t => a.map((v, i) => v + (b[i] - v) * t);
  const SAMPLES = 64;
  const samples = Array.from({ length: SAMPLES + 1 }, (_, i) => mixed(i / SAMPLES));
  const line = new THREE.CatmullRomCurve3(samples.map(at));
  const RADIAL = 8;
  const tube = keep(new THREE.TubeGeometry(line, SAMPLES, 0.022, RADIAL, false));
  const tubeColours = [];
  samples.forEach(rgb => {
    const c = colour(rgb);
    for (let j = 0; j <= RADIAL; j++) tubeColours.push(c.r, c.g, c.b);
  });
  tube.setAttribute('color', new THREE.Float32BufferAttribute(tubeColours, 3));
  const path = new THREE.Mesh(tube, keep(new THREE.MeshBasicMaterial({ vertexColors: true, depthTest: false })));
  path.renderOrder = 2;
  cube.add(path);
  const sphere = keep(new THREE.SphereGeometry(0.045, 16, 12));
  for (const end of [a, b]) {
    const dot = new THREE.Mesh(sphere, keep(new THREE.MeshBasicMaterial({ color: colour(end), depthTest: false })));
    dot.position.copy(at(end));
    dot.renderOrder = 3;
    cube.add(dot);
  }
  // The rider: the current colour, ringed in white so it reads on the path.
  const ringMaterial = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
  const riderMaterial = keep(new THREE.MeshBasicMaterial({ color: colour(mixed(0.5)), depthTest: false }));
  const ring = new THREE.Mesh(sphere, ringMaterial);
  ring.scale.setScalar(1.9);
  ring.renderOrder = 4;
  const rider = new THREE.Mesh(sphere, riderMaterial);
  rider.scale.setScalar(1.45);
  rider.renderOrder = 5;
  cube.add(ring, rider);

  function setT(t) {
    const rgb = mixed(t);
    ring.position.copy(at(rgb));
    rider.position.copy(at(rgb));
    riderMaterial.color.copy(colour(rgb));
  }
  setT(0.5);

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  let raf = 0, active = true;
  const frame = () => {
    if (!active || !host.isConnected) return;
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  frame();

  return {
    setT,
    dispose() {
      active = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      reducedMotion.removeEventListener('change', onMotion);
      controls.dispose();
      resources.forEach(r => r.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
