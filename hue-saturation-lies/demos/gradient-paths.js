import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Blue to yellow only: the pair the narration names on both path slides.
import { PATH_PAIRS } from './gradient-pairs.js';
const PAIR = PATH_PAIRS[0];
import { oklchToLinearRGB } from './colour-utils.js';
import { buildOklchShape } from './oklch-shape.js';

// sRGB transfer functions, odd-extended for out-of-gamut values (CSS Color 4 sample code).
const decode = v => Math.abs(v) <= 0.04045 ? v / 12.92 : Math.sign(v) * ((Math.abs(v) + 0.055) / 1.055) ** 2.4;
const encode = v => Math.abs(v) <= 0.0031308 ? 12.92 * v : Math.sign(v) * (1.055 * Math.abs(v) ** (1 / 2.4) - 0.055);
const mix = (a, b, t) => a + (b - a) * t;

// CSS Color 4's sRGB -> OKLab matrices. Do not clip intermediate OKLCH
// points: an out-of-gamut point still has a meaningful location in this plot.
function toLab(rgb) {
  const [r, g, b] = rgb.map(decode);
  const l = Math.cbrt(.4122214708*r + .5363325363*g + .0514459929*b);
  const m = Math.cbrt(.2119034982*r + .6806995451*g + .1073969566*b);
  const s = Math.cbrt(.0883024619*r + .2817188376*g + .6299787005*b);
  return [
    .2104542553*l + .7936177850*m - .0040720468*s,
    1.9779984951*l - 2.4285922050*m + .4505937099*s,
    .0259040371*l + .7827717662*m - .8086757660*s,
  ];
}
function toLch([L, a, b]) {
  return [L, Math.hypot(a, b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360];
}
function toHsl([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [((h * 60) % 360 + 360) % 360, s, l];
}
function fromHsl([h, s, l]) {
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}
// Shorter-hue algorithm: an exact -180 degree difference stays negative.
function hues(h1, h2) {
  if (h2 - h1 > 180) h1 += 360;
  else if (h2 - h1 < -180) h2 += 360;
  return [h1, h2];
}
function interpolated(pair, space, t) {
  const a = pair.a.map(v => v / 255), b = pair.b.map(v => v / 255);
  if (space === 'srgb') {
    const rgb = a.map((v, i) => mix(v, b[i], t));
    return { lab: toLab(rgb), rgb };
  }
  if (space === 'hsl') {
    const x = toHsl(a), y = toHsl(b);
    // A zero-saturation endpoint has a powerless hue; borrow the other hue.
    if (!x[1]) x[0] = y[0];
    if (!y[1]) y[0] = x[0];
    const [h1, h2] = hues(x[0], y[0]);
    const hsl = [mix(h1, h2, t), mix(x[1], y[1], t), mix(x[2], y[2], t)];
    const rgb = fromHsl(hsl);
    return { lab: toLab(rgb), rgb, hsl };
  }
  const x = toLch(toLab(a)), y = toLch(toLab(b));
  // Neither end has a hue (black to white): every hue is the same grey, so
  // the path is drawn halfway along the hue axis of the unrolled shape.
  if (x[1] < 1e-7 && y[1] < 1e-7) x[2] = y[2] = 180;
  if (x[1] < 1e-7) x[2] = y[2];
  if (y[1] < 1e-7) y[2] = x[2];
  const [h1, h2] = hues(x[2], y[2]);
  const L = mix(x[0], y[0], t), C = mix(x[1], y[1], t), H = mix(h1, h2, t);
  const lab = [L, C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)];
  return { lab, lch: [L, C, H], rgb: oklchToLinearRGB(L, C, H).map(encode) };
}

const onBicone = ([h, s, l]) => {
  const radius = s * (1 - Math.abs(2 * l - 1));
  const angle = h * Math.PI / 180;
  return new THREE.Vector3(radius * Math.cos(angle), (l - .5) * 2, -radius * Math.sin(angle));
};
// viz.js renders linear P3 vertex channels through an sRGB transfer curve
// into a Display P3 drawing buffer. Use the same channel convention here;
// converting primaries again would make sRGB yellow acquire a blue cast.
// Scale a geometry's linear vertex colours, a dark cast over a solid surface.
const SHAPE_BRIGHTNESS = .08;
// Path thickness per panel (HSL, OKLCH): the OKLCH shape is drawn at a larger
// scale, so its tube and end dots shrink to look the same on screen.
const PATH_SCALE = [1, .6];
function darken(geometry) {
  const colours = geometry.getAttribute('color');
  if (!colours) return;
  for (let i = 0; i < colours.array.length; i++) colours.array[i] *= SHAPE_BRIGHTNESS;
  colours.needsUpdate = true;
}
const colour = rgb => new THREE.Color(...rgb.map(v => decode(Math.max(0, Math.min(1, v)))));
const rgbCSS = ([r, g, b]) => `rgb(${r} ${g} ${b})`;
const isGrey = ([r, g, b]) => r === g && g === b;
// Chrome mixes an OKLCH gradient from zero chroma through an unrelated hue.
// Borrow the other end's hue at imperceptible chroma for a grey endpoint.
const greyLike = (grey, other) =>
  `oklch(from ${rgbCSS(other)} ${+Math.cbrt(decode(grey[0] / 255)).toFixed(4)} 0.0001 h)`;
const oklchEnds = (a, b) => [
  isGrey(a) ? greyLike(a, b) : rgbCSS(a),
  isGrey(b) ? greyLike(b, a) : rgbCSS(b),
];

function mountScene(container, type = 'hsl') {
  if (type !== 'hsl' && type !== 'oklch') throw new Error(`Unknown gradient model: ${type}`);
  const isOklch = type === 'oklch';
  container.innerHTML = `<style>
    .gp-root { position:absolute; inset:0; background:var(--scrim); color:var(--ink); font-family:var(--font-body); overflow:hidden; }
    .gp-models { position:absolute; inset:2rem 1rem 4rem; }
    .gp-canvas { position:absolute; inset:0; }
    .gp-panel { position:absolute; inset:0; pointer-events:none; }
    .gp-axis-label { position:absolute; left:0; top:0; white-space:nowrap; font:var(--text-body)/1.3 var(--font-body); color:var(--ink-muted); }
    .gp-strips { position:absolute; bottom:1.5rem; left:1rem; right:1rem; }
    .gp-strip { height:24px; border-radius:var(--radius); }
    .gp-strip-wrap { position:relative; }
    .gp-marker { position:absolute; top:0; bottom:0; width:2px; background:var(--ink); transform:translateX(-50%); pointer-events:none; filter:drop-shadow(0 0 2px var(--scrim)); }
    .gp-marker::before { content:''; position:absolute; bottom:100%; left:50%; transform:translateX(-50%); border:7px solid transparent; border-top-color:var(--ink); }
    @media (max-width:600px) { .gp-models {inset:1rem .5rem 4rem} .gp-strips {left:.5rem;right:.5rem} }
  </style><div class="gp-root demo-root">
    <div class="gp-models" role="img" aria-label="${isOklch ? 'OKLCH gradient on the unrolled Display P3 gamut' : 'HSL gradient on the HSL bicone'}. Drag to rotate.">
      <div class="gp-canvas"></div>
      <div class="gp-panel"><span class="gp-axis-label" aria-hidden="true">L</span>${isOklch ? '<span class="gp-axis-label" aria-hidden="true">H</span><span class="gp-axis-label" aria-hidden="true">C</span>' : ''}</div>
    </div>
    <div class="gp-strips"><div class="gp-strip-wrap"><div class="gp-strip" aria-hidden="true"></div><div class="gp-marker" aria-hidden="true"></div></div></div>
  </div>`;
  const root = container.querySelector('.gp-root');
  const canvas = container.querySelector('.gp-canvas');
  const strip = root.querySelector('.gp-strip');
  const marker = root.querySelector('.gp-marker');
  const renderStrip = () => {
    const pair = PAIR;
    strip.style.background = `linear-gradient(to right in ${type}, ${(isOklch ? oklchEnds(pair.a, pair.b) : [rgbCSS(pair.a), rgbCSS(pair.b)]).join(', ')})`;
  };
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    canvas.textContent = '3D view unavailable: WebGL is required.';
    renderStrip();
    return { step() {}, cleanup() { container.innerHTML = ''; } };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.drawingBufferColorSpace = THREE.DisplayP3ColorSpace;
  renderer.setClearColor(new THREE.Color(getComputedStyle(root).getPropertyValue('--scrim').trim()));
  canvas.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 30);
  camera.position.set(3.2, 2.3, 4).multiplyScalar(isOklch ? .55 : 1);
  const desktopZoom = isOklch ? 1.8 : 1.9;
  camera.zoom = desktopZoom;
  camera.updateProjectionMatrix();
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  controls.autoRotate = !reducedMotion.matches;
  controls.enableDamping = !reducedMotion.matches;
  const onMotion = () => {
    controls.autoRotate = !reducedMotion.matches;
    controls.enableDamping = !reducedMotion.matches;
    if (reducedMotion.matches && sweepFrame) { stop(); setT(1); }
  };
  reducedMotion.addEventListener('change', onMotion);
  controls.autoRotateSpeed = .45;
  controls.update();
  const resources = [];
  const keep = item => { resources.push(item); return item; };
  const shape = isOklch ? buildOklchShape() : null;
  // Both shapes are solid but darkened, so the full-chroma path stands out.
  // True transparency would show the OKLCH shape's inner folds as bright shards.
  // This build has its own geometry, so the opening slide's shape is untouched.
  if (shape) {
    shape.group.traverse(({ geometry }) => { if (geometry) darken(geometry); });
    scene.add(shape.group);
  }
  // The HSL gamut is a bicone: saturation 1 traces its surface at each L.
  if (!isOklch) {
    const bicone = new THREE.Group();
    scene.add(bicone);
    const conePositions = [], coneColors = [], coneIndices = [];
    const rings = 48, slices = 72;
    for (let li = 0; li <= rings; li++) for (let hi = 0; hi <= slices; hi++) {
      const h = hi / slices * 360, l = li / rings;
      conePositions.push(...onBicone([h, 1, l]).toArray());
      const c = colour(fromHsl([h, 1, l])); coneColors.push(c.r, c.g, c.b);
    }
    for (let li = 0; li < rings; li++) for (let hi = 0; hi < slices; hi++) {
      const a = li * (slices + 1) + hi, b = a + slices + 1;
      coneIndices.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const coneGeometry = keep(new THREE.BufferGeometry());
    coneGeometry.setAttribute('position', new THREE.Float32BufferAttribute(conePositions, 3));
    coneGeometry.setAttribute('color', new THREE.Float32BufferAttribute(coneColors, 3));
    coneGeometry.setIndex(coneIndices);
    bicone.add(new THREE.Mesh(coneGeometry, keep(new THREE.MeshBasicMaterial({
      vertexColors:true, side:THREE.DoubleSide,
    }))));
    darken(coneGeometry);
  }
  const panel = root.querySelector('.gp-panel');
  const pathGroup = new THREE.Group();
  (shape ? shape.group : scene).add(pathGroup);
  const sphere = keep(new THREE.SphereGeometry(.045, 12, 8));
  const ringMaterial = keep(new THREE.MeshBasicMaterial({ color:0xffffff, depthTest:false }));
  const riderMaterial = keep(new THREE.MeshBasicMaterial({ depthTest:false }));
  const ring = new THREE.Mesh(sphere, ringMaterial);
  const rider = new THREE.Mesh(sphere, riderMaterial);
  ring.scale.setScalar(1.9 * PATH_SCALE[Number(isOklch)]);
  rider.scale.setScalar(1.45 * PATH_SCALE[Number(isOklch)]);
  ring.renderOrder = 4; rider.renderOrder = 5;
  pathGroup.add(ring, rider);
  let pathPoints = [];
  let pathResources = [];
  const pathKeep = item => { pathResources.push(item); return item; };
  function renderPair() {
    pathGroup.remove(...pathGroup.children.filter(child => child !== ring && child !== rider));
    pathResources.forEach(r => r.dispose()); pathResources = [];
    const pair = PAIR;
    renderStrip();
    // Public per-sample values make both colour and position testable.
    root.pathData = {};
    {
      const space = type;
      const samples = Array.from({length: 101}, (_, i) => interpolated(pair, space, i / 100));
      const point = sample => {
        if (space === 'hsl') return onBicone(sample.hsl);
        const position = shape.place(...sample.lch);
        if (sample.seamFace === 360) position.z += 1;
        return position;
      };
      const points = samples.map(point);
      pathPoints = points;
      root.pathData[space] = samples.map(({lab, rgb, lch, hsl}, i) => ({lab, rgb, lch, hsl, pos:points[i].toArray()}));
      // Hue is unrolled on the OKLCH model. Break a path at the 0/360 seam
      // rather than drawing a diagonal across the whole box.
      let segments = [samples];
      if (space === 'oklch') {
        const h0 = samples[0].lch[2], h1 = samples[100].lch[2];
        const boundary = h1 > h0 ? 360 : 0;
        if (Math.min(h0, h1) < boundary && Math.max(h0, h1) > boundary) {
          const t = (boundary - h0) / (h1 - h0);
          const crossing = interpolated(pair, space, t);
          const left = {...crossing, lch: [crossing.lch[0], crossing.lch[1], boundary], seamFace: boundary};
          const right = {...crossing, lch: [crossing.lch[0], crossing.lch[1], boundary === 360 ? 0 : 360], seamFace: boundary === 360 ? 0 : 360};
          const split = Math.floor(t * 100);
          segments = [[...samples.slice(0, Number.isInteger(t * 100) ? split : split + 1), left], [right, ...samples.slice(split + 1)]];
        }
      }
      for (const segment of segments) {
        if (segment.length < 2) continue;
        const curve = new THREE.CatmullRomCurve3(segment.map(point), false, 'centripetal');
        const geometry = pathKeep(new THREE.TubeGeometry(curve, segment.length - 1, .025 * PATH_SCALE[Number(isOklch)], 8, false));
        const colors = [];
        segment.forEach(({rgb}) => {
          const c = colour(rgb);
          for (let j = 0; j <= 8; j++) colors.push(c.r, c.g, c.b);
        });
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const tube = new THREE.Mesh(geometry, pathKeep(new THREE.MeshBasicMaterial({ vertexColors:true, side:THREE.DoubleSide, depthTest:false })));
        tube.renderOrder = 2; pathGroup.add(tube);
      }
      for (const i of [0, 100]) {
        const dot = new THREE.Mesh(sphere, pathKeep(new THREE.MeshBasicMaterial({ color:colour(samples[i].rgb), depthTest:false })));
        dot.position.copy(points[i]); dot.scale.setScalar(PATH_SCALE[Number(isOklch)]); dot.renderOrder = 3; pathGroup.add(dot);
      }
    }
  }
  let t = 0, sweepFrame = 0, started = 0, firstStep = true;
  function setT(value) {
    t = value;
    const index = Math.min(99, Math.floor(t * 100));
    const fraction = t * 100 - index;
    const position = pathPoints[index].clone().lerp(pathPoints[index + 1], fraction);
    ring.position.copy(position); rider.position.copy(position);
    riderMaterial.color.copy(colour(interpolated(PAIR, type, t).rgb));
    marker.style.left = `${t * 100}%`;
    root.pathT = t;
  }
  function stop() { if (sweepFrame) cancelAnimationFrame(sweepFrame); sweepFrame = 0; started = 0; }
  function tick(now) {
    if (!started) started = now;
    setT(Math.min(1, (now - started) / 4000));
    if (t < 1) sweepFrame = requestAnimationFrame(tick);
    else stop();
  }
  function step(index) {
    stop();
    if (index < 1) setT(0);
    else if (firstStep || reducedMotion.matches) setT(1);
    else { setT(0); sweepFrame = requestAnimationFrame(tick); }
    firstStep = false;
  }
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    // Retain horizontal room for the path, end dots and rider on tall canvases.
    camera.zoom = width < height ? desktopZoom * Math.min(1, camera.aspect / 1.3) : desktopZoom;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas); resize(); renderPair(); setT(0);
  let raf = 0, active = true;
  const projectLabel = (view, height) => {
    const locations = isOklch ? [
      shape.place(1, 0, 0).add(new THREE.Vector3(0, .13, 0)),
      shape.place(0, 0, 359.99).add(new THREE.Vector3(0, .13, 0)),
      shape.place(0, .4, 0).add(new THREE.Vector3(0, .13, 0)),
    ] : [new THREE.Vector3(0, height, 0)];
    panel.querySelectorAll('.gp-axis-label').forEach((label, i) => {
      const position = locations[i];
      const inView = position.clone().applyMatrix4(view.matrixWorldInverse);
      const point = position.project(view);
      label.hidden = inView.z >= 0 || Math.abs(point.x) > 1 || Math.abs(point.y) > 1;
      if (!label.hidden) label.style.transform = `translate(${(point.x + 1) * panel.clientWidth / 2 + 8}px, ${(-point.y + 1) * panel.clientHeight / 2 - 18}px)`;
    });
  };
  function frame() {
    if (!active || !root.isConnected) return;
    controls.update();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    projectLabel(camera, 1.05);
    raf = requestAnimationFrame(frame);
  }
  frame();
  return {
    step,
    cleanup() {
      stop();
      active = false; cancelAnimationFrame(raf);
      observer.disconnect();
      reducedMotion.removeEventListener('change', onMotion);
      controls.dispose();
      pathResources.forEach(r => r.dispose()); resources.forEach(r => r.dispose()); shape?.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      container.innerHTML = '';
    },
  };
}

// The engine keeps the original callbacks when it carries this demo to the
// next slide, so delegate through the replacement scene after a type change.
export function mount(container, type = 'hsl') {
  let scene = mountScene(container, type);
  return {
    step(index) { scene.step(index); },
    update(nextType, index) {
      if (nextType !== type) {
        scene.cleanup();
        scene = mountScene(container, nextType);
        type = nextType;
      }
      scene.step(index);
    },
    cleanup() { scene.cleanup(); },
  };
}
