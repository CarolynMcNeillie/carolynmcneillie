import { drum } from '../inkmodel.js';
import { oklab } from './chords.js';
export const styles = ['mandala', 'lattice', 'bloom', 'optile', 'stipple'];
export function styleGenome(seed, style, palette) {
  const sets = style === 'stipple' ? [
    ['Orange', 'Blue'], ['Fluorescent Orange', 'Midnight'], ['Fluorescent Pink', 'Indigo'],
  ] : [
    ['Fluorescent Pink', 'Orange', 'Crimson', 'Teal'],
    ['Fluorescent Orange', 'Sunflower', 'Scarlet', 'Hunter Green'],
    ['Fluorescent Pink', 'Orange', 'Bright Red', 'Blue'],
    ['Fluorescent Orange', 'Yellow', 'Crimson', 'Sea Blue'],
  ];
  const names = sets[((seed - 1) % sets.length + sets.length) % sets.length];
  const inks = names.map((name) => palette.find((p) => p.name === name));
  inks.sort((a, b) => oklab(b.hex)[0] - oklab(a.hex)[0]);
  return { seed, style, symmetry: 'radial', n: 5 + seed % 4, rings: [], ground: 'paper',
    chord: { name: names.join('/'), paper: '#f1ebde', contrast: 1, blackPoint: 0,
      inks: inks.map((p, i) => drum(p.name, p.hex, i)) },
    inset: 2 + seed % 3, heart: seed % 3, rays: 20 + seed % 7 * 4,
    composition: `${style}/${5 + seed % 4}/${2 + seed % 3}/${seed % 7}` };
}
function petal(ctx, r, width, heart) {
  ctx.beginPath();
  ctx.moveTo(65, 0);
  ctx.bezierCurveTo(r * 0.45, -width, r, -width, r, -width * 0.28);
  if (heart) {
    ctx.bezierCurveTo(r + 8, -width * 0.1, r - 35, 0, r - 24, 0);
    ctx.bezierCurveTo(r - 35, 0, r + 8, width * 0.1, r, width * 0.28);
  } else ctx.quadraticCurveTo(r + 60, 0, r, width * 0.28);
  ctx.bezierCurveTo(r, width, r * 0.45, width, 65, 0);
  ctx.closePath();
}
export function drawStyle(g, contexts, size) {
  const scale = size / 1080;
  contexts.forEach((c) => { c.save(); c.translate(size / 2, size / 2); c.scale(scale, scale); });
  // Knockouts reserve a shape on every other drum, preserving vivid inset colours.
  function paint(drumIndex, path, knockout = true) {
    contexts.forEach((ctx, i) => {
      if (!knockout && i !== drumIndex) return;
      ctx.fillStyle = i === drumIndex ? '#f00' : '#000';
      ctx.beginPath(); path(ctx); ctx.fill();
    });
  }
  const circle = (r, x = 0, y = 0) => (c) => c.arc(x, y, r, 0, Math.PI * 2);
  if (g.style === 'bloom') {
    if (!g.omitGround) paint(3, (c) => c.rect(-540, -540, 1080, 1080));
    // A stem and paired leaves give the bloom a botanical silhouette.
    paint(2, (c) => { c.rect(-9, 100, 18, 440); c.ellipse(94, 390, 110, 36, -0.55, 0, Math.PI * 2); });
    for (let j = 0; j < g.inset; j++) {
      for (let k = 0; k < g.n; k++) {
        paint(j % 3, (c) => {
          c.save(); c.rotate(k * Math.PI * 2 / g.n - Math.PI / 2);
          petal(c, 440 - j * 78, 160 - j * 26, g.heart); c.restore();
        });
      }
    }
    for (let k = 0; k < g.n * 3; k++) {
      const a = k * Math.PI * 2 / (g.n * 3);
      const x = Math.cos(a), y = Math.sin(a);
      paint(3, (c) => { c.moveTo(x * 80, y * 80); c.lineTo(x * 224, y * 224);
        c.lineTo(x * 224 + 3, y * 224 + 3); c.lineTo(x * 80 + 3, y * 80 + 3); });
      paint(3, (c) => c.ellipse(x * 224, y * 224, 8, g.seed % 2 ? 13 : 8, a, 0, Math.PI * 2));
      contexts.forEach((c) => { c.fillStyle = '#000'; c.beginPath();
        c.arc(x * 146, y * 146, 7, 0, Math.PI * 2); c.fill(); });
    }
    paint(3, circle(106)); paint(1, circle(73)); paint(0, circle(37));
  } else if (g.style === 'optile') {
    paint(2, (c) => c.rect(-510, -510, 1020, 1020));
    for (let k = 0; k < g.rays; k++) {
      const a = k * Math.PI * 2 / g.rays, b = (k + 1) * Math.PI * 2 / g.rays;
      paint(k % 2 ? 0 : 3, (c) => { c.rect(-490, -490, 980, 980);
        c.save(); c.clip(); c.beginPath(); c.moveTo(0, 0);
        c.arc(0, 0, 730, a, b); c.closePath(); c.restore(); });
    }
    for (let j = 0; j < 7; j++) paint(j % 4, (c) =>
      c.ellipse(0, 0, 345 - j * 44, 285 - j * 36, (g.seed % 3 - 1) * 0.12, 0, Math.PI * 2));
    for (const x of [-408, 408]) for (const y of [-408, 408]) {
      for (let j = 0; j < 4; j++) paint((j + 1) % 4, circle(78 - j * 19, x, y));
    }
  } else {
    paint(0, (c) => c.rect(-540, -540, 1080, 1080));
    const ctx = contexts[1];
    for (let k = 0; k < g.n + 2; k++) {
      ctx.save(); ctx.rotate(k * Math.PI * 2 / (g.n + 2));
      const grad = ctx.createRadialGradient(240, 0, 20, 260, 0, 215);
      grad.addColorStop(0, 'rgb(8,255,0)'); grad.addColorStop(0.65, 'rgb(35,255,0)');
      grad.addColorStop(1, 'rgb(245,255,0)'); ctx.fillStyle = grad;
      petal(ctx, 454, 139, 0); ctx.fill();
      ctx.strokeStyle = 'rgb(170,255,0)'; ctx.lineWidth = 4;
      for (let j = 0; j < 3; j++) {
        ctx.save(); ctx.translate(30 + j * 24, 0); ctx.scale(0.86 - j * 0.08, 0.86 - j * 0.08);
        petal(ctx, 454, 139, 0); ctx.stroke(); ctx.restore();
      }
      ctx.restore();
    }
  }
  contexts.forEach((c) => c.restore());
}
