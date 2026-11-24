import { random } from '../paper.js';
import { composite } from '../inkmodel.js';
import { oklab, buildChords } from './chords.js';
import { latticeGenome, drawLattice } from './lattice.js';
import { styleGenome, drawStyle } from './styles.js';
import { finishMasks } from './saturation.js';

export const motifs = ['scallop', 'rosette', 'star', 'drops', 'facets', 'band', 'dots'];
let chords = [];
let palette = [];
export function configure(colors) { palette = colors; chords = buildChords(colors); }
export function defaultStyle(seed) {
  const slot = ((seed % 20) + 20) % 20;
  return slot < 18 ? (slot % 2 ? 'bloom' : 'mandala') : 'stipple';
}
export function seedFromHash(hash) {
  const value = new URLSearchParams(hash.replace(/^#/, '')).get('seed');
  return value !== null && Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : 1;
}
export function genome(seed, style) {
  style ||= defaultStyle(seed);
  if (style === 'lattice') return latticeGenome(seed, palette);
  if (style !== 'mandala') return styleGenome(seed, style, palette);
  const rng = random(seed);
  const chord = structuredClone(chords[(seed - 1 >>> 0) % chords.length]);
  const n = [6, 8, 10, 12, 16, 18, 20, 24, 32][Math.floor(rng() * 9)];
  const direction = rng() < 0.5 ? 1 : -1;
  const count = 5 + seed % 5;
  const ladder = [0.15, 0.35, 0.6, 0.85, 1];
  const body = chord.inks.map((ink, drum) => ({ drum, L: oklab(composite([ink], chord.paper))[0] }))
    .sort((a, b) => direction * (a.L - b.L));
  const rings = Array.from({ length: count }, (_, i) => {
    const progress = i / (count - 1);
    const tintIndex = Math.round((direction > 0 ? 1 - progress : progress) * 4);
    const drum = body[Math.min(body.length - 1, Math.floor(progress * body.length))].drum;
    return {
      radius: 1 - progress * 0.84, drum, tint: 1,
      n: i < count / 2 ? n : n * 2,
      motif: i === count - 1 ? 'star' : seed % 3 === 1 && i < 3 ? 'rosette'
        : motifs[(seed + i * 2 - 1 + motifs.length) % motifs.length],
      rotation: i * Math.PI / n, depth: 0.68 + rng() * 0.2,
      detail: ['inset', 'dots', 'veins', 'outline'][(seed + i) % 4],
      detailDrum: (drum + 1 + i % (chord.inks.length - 1)) % chord.inks.length,
      detailTint: 1,
    };
  });
  const ground = seed % 10 < 7 ? (seed % 2 ? 'knockout' : 'overprint') : 'paper';
  const g = { seed, chord, n, direction, twist: rng() < 0.15 ? 0.12 : 0, rings,
    symmetry: 'radial', style: 'mandala', ground, groundDrum: 0, groundTint: 1, radius: 486 };
  if (ground !== 'paper') tuneGround(g);
  return g;
}
export function groundContrast(g) {
  const ground = { ...g.chord.inks[g.groundDrum], film: g.groundTint };
  const ring = { ...g.chord.inks[g.rings[0].drum], film: g.rings[0].tint };
  const groundL = oklab(composite([ground], g.chord.paper))[0];
  const ringL = oklab(composite(g.ground === 'overprint' ? [ground, ring] : [ring], g.chord.paper))[0];
  return { groundL, ringL, delta: Math.abs(groundL - ringL) };
}
function tuneGround(g) {
  // A seed-indexed ground cycle avoids repeatedly selecting the highest-scoring blue.
  const names = ['Midnight', 'Hunter Green', 'Purple', 'Burgundy', 'Indigo', 'Teal',
    'Orange', 'Blue', 'Green', 'Violet', 'Sunflower', 'Fluorescent Pink'];
  const color = palette.find((p) => p.name === names[(g.seed - 1 >>> 0) % names.length]);
  g.chord.inks[0] = { ...g.chord.inks[0], name: color.name, hex: color.hex };
  const candidates = [];
  for (const tint of [1, 0.85, 0.6, 0.35, 0.15]) {
    for (let drum = 1; drum < g.chord.inks.length; drum++) {
      g.groundTint = tint;
      g.rings[0].drum = drum;
      g.rings[0].tint = 1;
      candidates.push({ tint, drum, ...groundContrast(g) });
    }
  }
  if (!candidates.some((c) => c.delta >= 0.25)) {
    const accent = palette.find((p) => p.name === 'Blue');
    g.chord.inks[1] = { ...g.chord.inks[1], name: accent.name, hex: accent.hex };
    g.groundTint = 0.35;
    g.rings[0].drum = 1;
    candidates.push({ tint: 0.35, drum: 1, ...groundContrast(g) });
  }
  const choice = candidates.find((c) => c.delta >= 0.25)
    ?? candidates.sort((a, b) => b.delta - a.delta)[0];
  g.groundTint = choice.tint;
  g.rings[0].drum = choice.drum;
  g.rings[0].tint = 1;
}
function polygon(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fill();
}
export function drawFlower(g, layers, finish = true) {
  const canvases = Array.isArray(layers) ? layers : layers.layers;
  const size = canvases[0].width;
  const scale = size / 1080;
  const contexts = canvases.map((c) => c.getContext('2d', { willReadFrequently: true }));
  contexts.forEach((ctx) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
  });
  if (g.symmetry === 'lattice') {
    drawLattice(g, contexts, size);
    return finish ? finishMasks(g, contexts, size) : null;
  }
  if (['bloom', 'optile', 'stipple'].includes(g.style)) {
    drawStyle(g, contexts, size);
    return finish ? finishMasks(g, contexts, size) : null;
  }
  if (g.ground !== 'paper') {
    const ctx = contexts[g.groundDrum];
    ctx.fillStyle = `rgb(${Math.round(g.groundTint * 255)},${g.groundTint < 1 ? 255 : 0},0)`;
    ctx.fillRect(0, 0, size, size);
    if (g.ground === 'knockout') {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, (g.radius + 14) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  g.rings.flatMap((ring, index) => [
    { ...ring, index },
    ...(ring.drum2 === undefined ? [] : [{ ...ring, drum: ring.drum2, tint: ring.tint2, index }]),
  ]).forEach((ring) => {
    const index = ring.index;
    const r = ring.radius * g.radius;
    const inner = (g.rings[index + 1]?.radius ?? 0) * g.radius * 0.65;
    const ctx = contexts[ring.drum];
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(scale, scale);
    ctx.rotate(ring.rotation + g.twist * index);
    ctx.beginPath();
    ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
    ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
    ctx.clip();
    const color = (t) => `rgb(${Math.round(t * 255)},${t < 1 ? 255 : 0},0)`;
    ctx.fillStyle = color(ring.tint);
    const step = Math.PI * 2 / ring.n;
    if (ring.motif === 'scallop' || ring.motif === 'star') {
      const points = [];
      const count = ring.n * (ring.motif === 'star' ? 2 : 16);
      for (let k = 0; k < count; k++) {
        const a = k / count * Math.PI * 2;
        const radius = ring.motif === 'star' ? r * (k % 2 ? ring.depth : 1)
          : r * (0.95 + 0.05 * Math.cos(a * ring.n));
        points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
      }
      polygon(ctx, points);
    } else {
      for (let k = 0; k < ring.n; k++) {
        ctx.save();
        ctx.rotate(k * step);
        ctx.beginPath();
        if (ring.motif === 'rosette') {
          // Add density on this drum: intersecting circles retain their overlap count.
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgb(${Math.round(ring.tint * 255 / Math.max(3, ring.n / 4))},255,0)`;
          ctx.arc(r * 0.47, 0, r * 0.53, 0, Math.PI * 2);
        } else if (ring.motif === 'dots') {
          ctx.arc(r * 0.85, 0, Math.min(r * 0.13, r * Math.PI / ring.n * 0.72), 0, Math.PI * 2);
        } else if (ring.motif === 'band') {
          ctx.fillStyle = color(ring.tint * (k % 2 ? 0.75 : 1));
          ctx.arc(0, 0, r, -step * 0.44, step * 0.44);
          ctx.arc(0, 0, r * 0.78, step * 0.44, -step * 0.44, true);
        } else if (ring.motif === 'drops') {
          ctx.moveTo(inner * 0.6, 0);
          ctx.bezierCurveTo(r * 0.6, -r * step * 0.43, r, -r * step * 0.32, r, 0);
          ctx.bezierCurveTo(r, r * step * 0.32, r * 0.6, r * step * 0.43, inner * 0.6, 0);
        } else {
          polygon(ctx, [[inner, 0], [r * 0.72, -r * step * 0.38], [r, 0]]);
          ctx.fillStyle = color(ring.tint * 0.5);
          polygon(ctx, [[inner, 0], [r * 0.72, r * step * 0.38], [r, 0]]);
        }
        if (ring.motif !== 'facets') ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
    const detail = contexts[ring.detailDrum];
    detail.save();
    detail.translate(size / 2, size / 2);
    detail.scale(scale, scale);
    detail.rotate(ring.rotation + g.twist * index);
    detail.fillStyle = color(ring.detailTint);
    detail.strokeStyle = color(ring.detailTint);
    detail.lineWidth = ring.detail === 'outline' ? 2 : 1.2;
    for (let k = 0; k < ring.n; k++) {
      detail.save();
      detail.rotate(k * step);
      if (ring.detail === 'dots') {
        for (let j = 0; j < 5; j++) {
          detail.beginPath();
          detail.arc(r * (0.68 + j * 0.055), 0, Math.max(1.5, r * 0.009), 0, Math.PI * 2);
          detail.fill();
        }
      } else if (ring.detail === 'inset') {
        polygon(detail, [[r * 0.56, 0], [r * 0.83, -r * step * 0.12],
          [r * 0.94, 0], [r * 0.83, r * step * 0.12]]);
      } else {
        detail.beginPath();
        detail.moveTo(r * 0.45, 0);
        detail.lineTo(r * 0.97, 0);
        if (ring.detail === 'outline') {
          detail.lineTo(r * 0.76, r * step * 0.3);
          detail.closePath();
        }
        detail.stroke();
      }
      detail.restore();
    }
    detail.restore();
  });
  return finish ? finishMasks(g, contexts, size) : null;
}

export function bindNewFlower(button, next) {
  // Native button activation maps Space, Enter, touch and click to this single handler.
  button.addEventListener('click', next);
}

if (typeof document !== 'undefined' && document.querySelector('#print')) {
  const { createPrinter, makeLayers } = await import('../print.js');
  configure(await (await fetch('../riso-colors.json')).json());
  const canvas = document.querySelector('canvas');
  const printer = createPrinter(canvas, { seed: 41 });
  const layers = makeLayers(1080);
  const button = document.querySelector('#print');
  function render() {
    const start = performance.now();
    const seed = seedFromHash(location.hash);
    const style = new URLSearchParams(location.hash.slice(1)).get('style');
    const g = genome(seed, style);
    printer.setInks(g.chord);
    const screen = g.style === 'stipple' ? 'FM' : 'AM';
    printer.setParams({ screen0: screen, screen1: screen, screen2: screen, screen3: screen });
    const audit = drawFlower(g, layers);
    console.log(`AUDIT ${seed} ${JSON.stringify(audit)}`);
    printer.draw(layers.layers, 1);
    const names = g.chord.inks.map((ink) => ink.name).join(' and ');
    button.setAttribute('aria-label', `${g.symmetry} ${g.n}-fold flower in ${names}. Press for a new one.`);
    document.querySelector('#caption').textContent = `${seed} / ${names}`;
    document.body.style.background = g.chord.paper;
    const elapsed = (performance.now() - start).toFixed(2);
    window.flowerAudit = { ...audit, style: g.style, drawMs: Number(elapsed) };
    console.log(`FLOWER ${seed} ${elapsed} ms`);
    document.documentElement.dataset.drawMs = elapsed;
    document.documentElement.dataset.ready = String(seed);
  }
  bindNewFlower(button, () => {
    const seed = seedFromHash(location.hash) + 1;
    const params = new URLSearchParams(location.hash.slice(1));
    params.set('seed', seed);
    location.hash = params.toString();
  });
  window.addEventListener('hashchange', render);
  render();
}
