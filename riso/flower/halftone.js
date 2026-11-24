import { overlapDelta } from './saturation.js';

// Reserve one radial shading band on one drum, leaving the silhouette and other drums solid.
export function addHalftone(g, images, size) {
  if (g.style === 'stipple') return { uses: ['FM stipple'], screened: 0 };
  const counts = images.map(({ data }) => {
    let n = 0;
    for (let p = 0; p < data.length; p += 4) if (data[p]) n++;
    return n;
  });
  const total = counts.reduce((a, b) => a + b, 0);
  const candidates = g.style === 'bloom' ? counts.slice(0, 3) : counts;
  const drum = candidates.indexOf(Math.max(...candidates));
  const data = images[drum].data;
  const gradient = g.style === 'mandala' || (g.style === 'bloom' && g.seed % 2);
  const radius = size * ({ lattice: 0.26, bloom: 0.28, optile: 0.32, mandala: 0.34 }[g.style]);
  const bins = new Uint32Array(size);
  function distance(p) {
    const pixel = p / 4;
    return Math.floor(Math.abs(Math.hypot(pixel % size - size / 2,
      Math.floor(pixel / size) - size / 2) - radius));
  }
  for (let p = 0; p < data.length; p += 4) if (data[p]) bins[distance(p)]++;
  let width = 0, selected = 0;
  while (selected < total * 0.16 && width < bins.length) selected += bins[width++];
  const cache = new Map();
  for (let p = 0; p < data.length; p += 4) {
    if (!data[p] || distance(p) >= width) continue;
    const pixel = p / 4;
    const r = Math.hypot(pixel % size - size / 2, Math.floor(pixel / size) - size / 2);
    const tint = gradient ? 0.35 + 0.55 * Math.max(0, Math.min(1,
      (r - radius + width) / (width * 2))) : 0.72;
    const density = Math.round(tint * 255);
    let mask = 0;
    images.forEach((image, i) => { if (image.data[p]) mask |= 1 << i; });
    const key = mask * 256 + density;
    if (!cache.has(key)) {
      const inks = g.chord.inks.map((ink, i) => i === drum ? { ...ink, film: density / 255 } : ink);
      let weak = false;
      for (let top = 1; top < inks.length; top++) {
        if ((mask & (1 << top)) && (mask & ((1 << top) - 1))
          && overlapDelta(inks, g.chord.paper, mask, top) < 0.08) weak = true;
      }
      cache.set(key, weak);
    }
    // A weak tinted overlap becomes a knockout, never a washed-out overprint.
    if (cache.get(key)) images.forEach((image, i) => {
      if (i !== drum) { image.data[p] = 0; image.data[p + 1] = 0; }
    });
    data[p] = density;
    data[p + 1] = 255;
  }
  const use = gradient ? 'dot gradient band' : {
    lattice: 'clipped lattice tint', bloom: 'petal shading tint', optile: 'tile ring tint',
  }[g.style];
  return { uses: [use], drum, radius, width, gradient };
}
