// Full-screen kaleidoscope of generated flowers, printed like the lab homepage:
// 12.5 sheets a second, a fresh sheet each frame. Every HOLD seconds the next
// flower (with its own inks) blooms out from the centre on a second press that
// sits on top, inside a growing scalloped circle.
// ?seed=<n> starts at that seed (default: random). ?t=<s> freezes. ?noworker uses main-thread prepare.
// Decorative background. ?debug exposes renderAt(t), renderAtAsync(t), mirrorState().
import { createPrinter } from './print.js';
import { configure, genome } from './flower/flower.js';
import { kaleidoscope } from './mirror/kaleido.js';
import { prepareFlower, tintTimes, HOLD, BLOOM, PERIOD } from './mirror/prepare.js';

const FPS = 12.5, SCALLOP_POINTS = 120, BLOOM_ROTATION = 0.2;
// Grounds contrast with the name's paper at >= 4.5:1 (solid mirror ground).
// Greedy order shares the fewest inks with the previous flower, preferring old seeds on ties.
const SEEDS = [0, 2, 16, 26, 4, 14, 64, 50, 52, 62, 160, 74, 40, 110,
  76, 182, 100, 86, 124, 134, 136, 194, 172, 122, 184, 146, 196, 170];

const query = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
async function startBackground() {
const stage = document.querySelector('#riso-background');
const probe = document.createElement('canvas').getContext('webgl2');
if (!probe) {
  stage.remove();
  document.body.dataset.ready = 'true';
  return;
}
probe.getExtension('WEBGL_lose_context')?.loseContext();
configure(await (await fetch(new URL('./riso-colors.json', import.meta.url))).json());
// Each visit starts at a random flower in the list; ?seed=<n> picks one.
const start = query.has('seed') ? Math.max(0, SEEDS.indexOf(Number(query.get('seed'))))
  : Math.floor(Math.random() * SEEDS.length);

const H = 1080;
const W = Math.round(H * Math.min(2.4, Math.max(0.5, innerWidth / innerHeight)) / 2) * 2;
const canvases = [...stage.querySelectorAll('canvas')];
let presses;
for (const canvas of canvases) {
  canvas.addEventListener('webglcontextlost', event => event.preventDefault());
  canvas.addEventListener('webglcontextrestored', () => location.reload());
}
const gap = stage.querySelector('.paper-ring'); // paper ring at the bloom's edge

const cache = new Map(), pending = new Map(), failed = new Set();
let offscreen2d = false;
try { offscreen2d = typeof OffscreenCanvas !== 'undefined' && !!new OffscreenCanvas(1, 1).getContext('2d'); }
catch { /* Document canvases are the fallback. */ }
const makeCanvas = (w, h) => {
  if (offscreen2d)
    return new OffscreenCanvas(w, h);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  return canvas;
};
let worker = null;
try {
  if (!query.has('noworker') && typeof Worker !== 'undefined' && offscreen2d)
    worker = new Worker(new URL('./mirror/prepare.worker.js', import.meta.url), { type: 'module' });
} catch { /* Use document canvases when workers are unavailable. */ }
function requestFlower(i) {
  if (failed.has(i)) return Promise.resolve(null);
  if (cache.has(i)) return Promise.resolve(cache.get(i));
  if (pending.has(i)) return pending.get(i).promise;
  const seed = SEEDS[(start + i) % SEEDS.length], g = genome(seed);
  const request = { i, seed, width: W, height: H, times: tintTimes(i) };
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  promise.catch(error => console.warn('Flower preparation failed', error));
  const finish = result => {
    const flower = { ...result, g, seed };
    cache.set(i, flower); pending.delete(i); resolve(flower);
  };
  const fallback = () => {
    try { finish(prepareFlower({ ...request, g, makeCanvas })); }
    catch (error) { failed.add(i); pending.delete(i); reject(error); }
  };
  pending.set(i, { promise, finish, fallback });
  if (worker) {
    try { worker.postMessage(request); }
    catch (error) { console.warn('Worker request failed', error); setTimeout(fallback, 0); }
  } else setTimeout(fallback, 0);
  return promise;
}
if (worker) {
  worker.onmessage = ({ data }) => {
    const job = pending.get(data.i);
    if (!job) return;
    if (data.error) { console.warn('Worker preparation failed', data.error); job.fallback(); }
    else job.finish(data.result);
  };
  const failWorker = error => {
    console.warn('Flower worker failed; use main-thread prepare', error);
    worker.terminate(); worker = null;
    for (const job of [...pending.values()]) job.fallback();
  };
  worker.onerror = failWorker;
  worker.onmessageerror = failWorker;
}
try {
  presses = canvases.map(canvas => kaleidoscope(createPrinter(canvas, { width: W, height: H }), W, H));
} catch {
  worker?.terminate();
  stage.querySelectorAll('pre').forEach(node => node.remove());
  stage.remove();
  document.body.dataset.ready = 'true';
  return;
}

// Scalloped circle, in CSS px of the stage, centred. p runs 0 to 1.
function bloomClip(p, n, rot, extra = 0) {
  const e = p * p * (3 - 2 * p); // eases in and out, so the bloom starts small
  const R = e * Math.hypot(innerWidth, innerHeight) * 0.62 + (p > 0 ? extra : 0);
  const pts = [];
  for (let k = 0; k < SCALLOP_POINTS; k++) {
    const a = (k / SCALLOP_POINTS) * 2 * Math.PI;
    const r = R * (1 + 0.08 * Math.cos(2 * n * a + rot));
    pts.push(`${(innerWidth / 2 + r * Math.cos(a)).toFixed(1)}px ${(innerHeight / 2 + r * Math.sin(a)).toFixed(1)}px`);
  }
  return `polygon(${pts.join(',')})`;
}

let time = Number(query.get('t') || 0), last = performance.now(), shown = -1;
let paused = query.has('t') || reduced.matches;

function renderAt(t) {
  let candidate = Math.max(0, Number(t));
  let index = Math.floor((Math.floor(candidate * FPS) + 1) / FPS / PERIOD);
  let skips = 0;
  while (failed.has(index) || failed.has(index + 1)) {
    if (++skips > SEEDS.length) return;
    candidate = ++index * PERIOD;
  }
  const frame = Math.floor(candidate * FPS) + 1, ft = frame / FPS;
  const needed = Math.floor(ft / PERIOD);
  if (!cache.has(needed) || (ft - needed * PERIOD > HOLD && !cache.has(needed + 1))) {
    requestFlower(needed); requestFlower(needed + 1);
    return;
  }
  time = candidate;
  shown = frame;
  const i = needed, u = ft - i * PERIOD;
  const current = presses[i % 2], next = presses[(i + 1) % 2];
  const flower = cache.get(i);
  if (current.flower !== flower) current.show(flower);
  const progress = Math.max(0, (u - HOLD) / BLOOM);
  const covered = progress * progress * (3 - 2 * progress) >= 0.9;
  if (!covered) current.draw(ft, frame);
  canvases[i % 2].hidden = covered;
  canvases[i % 2].className = 'outgoing';
  canvases[i % 2].style.clipPath = 'none';
  const incomingCanvas = canvases[(i + 1) % 2];
  if (u > HOLD) {
    const incomingFlower = cache.get(i + 1);
    if (next.flower !== incomingFlower) next.show(incomingFlower);
    next.draw(ft, frame);
    incomingCanvas.hidden = false;
    incomingCanvas.className = 'incoming';
    incomingCanvas.style.clipPath = covered ? 'none'
      : bloomClip(progress, incomingFlower.n, ft * BLOOM_ROTATION);
    gap.hidden = covered;
    gap.style.background = incomingFlower.g.chord.paper;
    gap.style.clipPath = bloomClip(progress, incomingFlower.n, ft * BLOOM_ROTATION, 7);
  } else {
    incomingCanvas.hidden = true;
    gap.hidden = true;
    requestFlower(i + 1); // Prepare on the worker early in the hold.
    for (const k of cache.keys()) if (k < i) cache.delete(k);
  }

}
async function renderAtAsync(t, attempts = 0) {
  if (attempts >= SEEDS.length) return;
  const ft = (Math.floor(Math.max(0, Number(t)) * FPS) + 1) / FPS;
  const i = Math.floor(ft / PERIOD);
  try {
    await requestFlower(i);
    if (ft - i * PERIOD > HOLD) await requestFlower(i + 1);
  } catch {
    return renderAtAsync((i + 1) * PERIOD, attempts + 1);
  }
  if (failed.has(i)) return renderAtAsync((i + 1) * PERIOD, attempts + 1);
  renderAt(t);
}
if (query.has('debug')) {
window.renderAt = renderAt;
window.renderAtAsync = renderAtAsync;
window.mirrorState = () => ({ time, shown, W, H, flowers: [...cache.entries()].map(([i, f]) =>
  ({ i, seed: f.seed, tinted: f.tinted, halftone: f.halftone })) });

}
let raf = null;
reduced.addEventListener('change', async () => {
  paused = reduced.matches || query.has('t');
  if (paused) {
    cancelAnimationFrame(raf);
    raf = null;
    if (reduced.matches && time % PERIOD > HOLD) await renderAtAsync((Math.floor(time / PERIOD) + 1) * PERIOD);
  } else if (raf === null) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
});

await renderAtAsync(time);
document.body.dataset.ready = 'true';
function tick(now) {
  raf = paused ? null : requestAnimationFrame(tick);
  if (!paused && !document.hidden) {
    const next = time + Math.min(0.1, (now - last) / 1000);
    if (Math.floor(next * FPS) + 1 !== shown) renderAt(next);
    else time = next;
  }
  last = now;
}
if (!paused) raf = requestAnimationFrame(tick);
}
await startBackground();
