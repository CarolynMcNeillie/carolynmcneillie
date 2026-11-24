import { drum } from '../inkmodel.js';

export function latticeGenome(seed, palette) {
  const names = [
    ['Midnight', 'Fluorescent Pink', 'Orange'],
    ['Hunter Green', 'Fluorescent Orange', 'Yellow'],
    ['Purple', 'Fluorescent Pink', 'Sunflower'],
    ['Indigo', 'Fluorescent Orange', 'Aqua'],
    ['Burgundy', 'Fluorescent Pink', 'Yellow'],
    ['Black', 'Fluorescent Pink', 'Orange'],
    ['Blue', 'Fluorescent Orange', 'Yellow'],
    ['Teal', 'Fluorescent Pink', 'Sunflower'],
  ][(seed - 1 >>> 0) % 8];
  const inks = names.map((name, i) => drum(name, palette.find((p) => p.name === name).hex, i));
  const grid = 3 + seed % 3;
  const pitch = 920 / grid;
  return { seed, symmetry: 'lattice', style: 'lattice', n: 4, ground: 'paper', groundDrum: 0,
    chord: { inks, paper: '#e8e3db', contrast: 1, blackPoint: 0 }, rings: [], pitch, grid,
    clipShape: ['disc', 'square', 'rounded'][Math.floor(seed / 3) % 3],
    composition: `lattice/${grid}/${[6, 8, 12, 16][seed % 4]}/${Math.floor(seed / 3) % 3}/${seed % 2}`, 
    layers: [
      { shape: 'star', drum: 2, tint: 1, points: [6, 8, 12, 16][seed % 4], radius: 470, depth: 0.34 },
      { shape: 'grid', drum: 0, tint: 1, clip: seed % 2 ? undefined : 'outside-disc' },
      { shape: 'disc', drum: 1, tint: 1, clip: 'grid', radius: 425 + seed % 3 * 12 },
      { shape: 'inner-grid', drum: 0, tint: 1, clip: 'disc' },
    ] };
}
function shape(ctx, name, g, layer) {
  ctx.beginPath();
  if (name === 'disc' || name === 'outside-disc') {
    if (name === 'outside-disc') ctx.rect(-540, -540, 1080, 1080);
    const r = g.layers[2].radius;
    if (g.clipShape === 'disc') ctx.arc(0, 0, r, 0, Math.PI * 2, name === 'outside-disc');
    else if (g.clipShape === 'rounded') ctx.roundRect(-r, -r, r * 2, r * 2, 110);
    else ctx.rect(-r, -r, r * 2, r * 2);
  } else if (name.includes('grid')) {
    const inner = name === 'inner-grid';
    for (let y = 0; y < g.grid; y++) {
      for (let x = 0; x < g.grid; x++) {
        if (inner && (x === 0 || x === g.grid - 1 || y === 0 || y === g.grid - 1)) continue;
        const cx = (x - (g.grid - 1) / 2) * g.pitch;
        const cy = (y - (g.grid - 1) / 2) * g.pitch;
        ctx.moveTo(cx + g.pitch / 2, cy);
        ctx.arc(cx, cy, g.pitch / 2, 0, Math.PI * 2);
      }
    }
  } else {
    for (let i = 0; i < layer.points * 2; i++) {
      const a = i * Math.PI / layer.points - Math.PI / 2;
      const r = layer.radius * (i % 2 ? layer.depth : 1);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
  }
}
export function drawLattice(g, contexts, size) {
  for (const layer of g.layers) {
    const ctx = contexts[layer.drum];
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(size / 1080, size / 1080);
    if (layer.clip) {
      shape(ctx, layer.clip, g, layer);
      ctx.clip('evenodd');
    }
    shape(ctx, layer.shape, g, layer);
    ctx.fillStyle = `rgb(${Math.round(layer.tint * 255)},${layer.tint < 1 ? 255 : 0},0)`;
    ctx.fill();
    ctx.restore();
  }
}
