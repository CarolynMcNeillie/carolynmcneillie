import { drawFlower } from '../flower/flower.js';
export const SIZE = 1080;
const TINT = 0.45;
export const HOLD = 11, BLOOM = 2.6, PERIOD = HOLD + BLOOM;

// Moments used to pick flower i's halftone band. Flower i is on screen from
// i*PERIOD - BLOOM to (i+1)*PERIOD; these samples start at i*PERIOD instead, as in
// the first version, so each flower keeps the band (and look) it was approved with.
export function tintTimes(i) {
  return Array.from({ length: 6 }, (_, k) => i * PERIOD + k / 5 * (PERIOD + BLOOM));
}

function forEachSample(times, width, height, phase, n, visit) {
  const gw = 96, gh = Math.round(gw * height / width);
  for (const [moment, t] of times.entries()) {
    const w = windowAt(t, phase);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const [x, y] = sourcePoint(( (i + .5) / gw - .5) * width, ((j + .5) / gh - .5) * height, w, n);
      const inside = x >= 0 && y >= 0 && x < SIZE && y < SIZE;
      const p = inside ? (Math.floor(y) * SIZE + Math.floor(x)) * 4 : (2 * SIZE + 2) * 4;
      visit(p, Math.min(BINS, Math.floor(Math.hypot(x - SIZE / 2, y - SIZE / 2) / BAND)), moment);
    }
  }
  return gw * gh;
}

// Window path: centre offset (source px), turn and zoom, all slow sines.
// `phase` gives each flower its own path.
export function windowAt(t, phase = 0) {
  const s = t + phase * 97;
  const cx = 120 * Math.sin(s * 0.061) + 50 * Math.sin(s * 0.037 + 1.3);
  const cy = 120 * Math.sin(s * 0.053 + 2.1) + 50 * Math.sin(s * 0.031 + 0.4);
  const turn = 0.6 * Math.sin(s * 0.031) + s * 0.012;
  const zoom = 2.1 + 0.45 * Math.sin(s * 0.041 + 0.8); // stays inside the flower
  return { cx, cy, turn, zoom };
}

// Where an output pixel (x, y from the centre) samples the flower layer, in
// source layer px. Fold into the wedge, then undo the window.
function sourcePoint(x, y, w, n) {
  const wedge = Math.PI / n;
  let a = Math.atan2(y, x);
  a = ((a % (2 * wedge)) + 2 * wedge) % (2 * wedge);
  if (a > wedge) a = 2 * wedge - a;
  const r = Math.hypot(x, y) / w.zoom, c = Math.cos(w.turn), s = Math.sin(w.turn);
  const qx = r * Math.cos(a), qy = r * Math.sin(a);
  return [SIZE / 2 + w.cx + c * qx - s * qy, SIZE / 2 + w.cy + s * qx + c * qy];
}

// Knockouts instead of overprints: where inks meet, only the top one prints,
// so the press's registration offset shows a hairline of paper on one side of a
// shape and a thin double layer on the other. The ink that covers least is on
// top (details sit over the larger shapes behind them). Edge pixels split their
// coverage, so a perfectly registered sheet would show neither gap nor overlap.
function knockOut(images, drums) {
  const n = SIZE * SIZE * 4;
  const area = images.slice(0, drums).map((im) => {
    let c = 0;
    for (let p = 0; p < n; p += 16) if (im.data[p] > 0) c++;
    return c;
  });
  const order = area.map((a, d) => d).sort((a, b) => area[a] - area[b]);
  for (let p = 0; p < n; p += 4) {
    let left = 1;
    for (const d of order) {
      const data = images[d].data;
      if (data[p] === 0) continue;
      // A screened pixel's R is a tint, not coverage: it covers fully.
      const cover = data[p + 1] > 127 ? 1 : data[p] / 255;
      if (left < 1) data[p] = Math.round(data[p] * left);
      left *= 1 - cover;
      if (left <= 0) left = 0;
    }
  }
}

const BAND = 30, BINS = SIZE / 2 / BAND; // ring bins of 30 px; bin BINS = outside

// Builds one flower for the mirror, with sparing halftone set on purpose: one
// ring band of one ink prints as a tint through the screen. The band is picked
// so it covers about `share` of the mirrored picture over `times` (the time the
// flower is on screen). Halftone the generator drew elsewhere becomes solid.
export function prepareFlower({ g, seed, times, width, height, share = 0.1, makeCanvas }) {
  const n = [6, 8, 6, 5][seed % 4], phase = seed;
  const flower = { layers: Array.from({ length: 4 }, () => makeCanvas(SIZE, SIZE)) };
  drawFlower(g, flower);
  const ctxs = flower.layers.map((l) => l.getContext('2d', { willReadFrequently: true }));
  const images = ctxs.map((ctx) => ctx.getImageData(0, 0, SIZE, SIZE));
  const drums = Math.min(4, g.chord.inks.length);
  knockOut(images, drums);
  const hist = Array.from({ length: 4 }, () => new Array(BINS + 1).fill(0));
  const samples = forEachSample(times, width, height, phase, n, (p, bin) => {
    for (let d = 0; d < drums; d++) if (images[d].data[p] > 0) hist[d][bin]++;
  });
  const total = samples * times.length;
  let pick = { d: -1, lo: 0, hi: 0, cover: 0 }, gap = Infinity;
  for (let d = 0; d < drums; d++)
    for (let lo = 0; lo < BINS; lo++) {
      let sum = 0;
      for (let hi = lo; hi < BINS; hi++) {
        sum += hist[d][hi];
        const c = sum / total;
        if (Math.abs(c - share) < gap) { gap = Math.abs(c - share); pick = { d, lo, hi, cover: c }; }
      }
    }
  const r0 = pick.lo * BAND, r1 = (pick.hi + 1) * BAND;
  images.forEach((im, d) => {
    const data = im.data;
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        const p = (y * SIZE + x) * 4;
        if (data[p] === 0) continue;
        const rs = Math.hypot(x - SIZE / 2, y - SIZE / 2);
        if (d === pick.d && rs >= r0 && rs < r1) {
          if (data[p + 1] <= 127) data[p] = Math.round(data[p] * TINT); // solid becomes a tint
          data[p + 1] = 255;
        } else if (data[p + 1] > 127) {
          data[p] = data[p] >= 77 ? 255 : 0; // other halftone becomes solid
          data[p + 1] = 0;
        }
      }

  });
  const screened = times.map(() => 0);
  forEachSample(times, width, height, phase, n, (p, bin, moment) => {
    if (images.some(({ data }) => data[p] > 0 && data[p + 1] > 127)) screened[moment]++;
  });
  const data = [0, 2].map(d => {
    const packed = new Uint8Array(SIZE * SIZE * 4);
    for (let p = 0; p < packed.length; p += 4) {
      packed[p] = images[d].data[p]; packed[p + 1] = images[d].data[p + 1];
      packed[p + 2] = images[d + 1].data[p]; packed[p + 3] = images[d + 1].data[p + 1];
    }
    return packed;
  });
  return { data, n, phase, moments: screened.map(count => count / samples),
    corner: images.map(im => [...im.data.slice((2 * SIZE + 2) * 4, (2 * SIZE + 2) * 4 + 2)]),
    tinted: pick, halftone: screened.reduce((sum, count) => sum + count, 0) / total };
}
