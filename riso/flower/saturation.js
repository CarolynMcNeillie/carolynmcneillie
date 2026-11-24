import { composite } from '../inkmodel.js';
import { addHalftone } from './halftone.js';
import { oklab } from './chords.js';
export function overlapDelta(inks, paper, mask, top) {
  const under = inks.filter((_, i) => (mask & (1 << i)) && i !== top);
  const a = oklab(composite(under, paper));
  const b = oklab(composite([...under, inks[top]], paper));
  return Math.hypot(...a.map((v, i) => v - b[i]));
}
export function finishMasks(g, contexts, size) {
  const count = g.chord.inks.length;
  const images = contexts.slice(0, count).map((c) => c.getImageData(0, 0, size, size));
  const allowed = new Map();
  for (let mask = 1; mask < 1 << count; mask++) {
    let result = mask;
    for (let top = count - 1; top > 0; top--) {
      if (!(result & (1 << top)) || result === (1 << top)) continue;
      if (overlapDelta(g.chord.inks, g.chord.paper, result, top) < 0.08) result = 1 << top;
    }
    allowed.set(mask, result);
  }
  let solid = 0, area = 0, minimum = Infinity;
  const seen = new Set();
  for (let p = 0; p < size * size * 4; p += 4) {
    let mask = 0;
    for (let i = 0; i < count; i++) if (images[i].data[p] > 0) mask |= 1 << i;
    const keep = allowed.get(mask) || 0;
    seen.add(keep);
    for (let i = 0; i < count; i++) {
      const data = images[i].data;
      if (!(keep & (1 << i))) { data[p] = 0; data[p + 1] = 0; continue; }
      if (g.style !== 'stipple') { data[p] = 255; data[p + 1] = 0; }
      area += data[p] / 255;
      if (data[p] === 255 && data[p + 1] === 0) solid++;
    }
  }
  for (const mask of seen) for (let top = 1; top < count; top++) {
    if ((mask & (1 << top)) && (mask & ((1 << top) - 1))) {
      minimum = Math.min(minimum, overlapDelta(g.chord.inks, g.chord.paper, mask, top));
    }
  }
  const halftone = addHalftone(g, images, size);
  if (g.style === 'stipple') {
    images.forEach((image, i) => contexts[i].putImageData(image, 0, 0));
    return { solidShare: solid / area, halftoneShare: 0, halftone,
      minOverprintDelta: Number.isFinite(minimum) ? minimum : null,
      composition: g.composition, chord: g.chord.inks.map((i) => i.name).join('/') };
  }
  solid = 0; area = 0;
  let screened = 0;
  const tinted = new Map();
  minimum = Infinity;
  for (let p = 0; p < size * size * 4; p += 4) {
    let mask = 0;
    images.forEach(({ data }, i) => { if (data[p]) mask |= 1 << i; });
    const densities = images.map(({ data }) => data[p]);
    const key = `${mask}/${densities.join('/')}`;
    if (!tinted.has(key)) {
      const inks = g.chord.inks.map((ink, i) => ({ ...ink, film: densities[i] / 255 }));
      let delta = Infinity;
      for (let top = 1; top < count; top++) {
        if ((mask & (1 << top)) && (mask & ((1 << top) - 1))) {
          delta = Math.min(delta, overlapDelta(inks, g.chord.paper, mask, top));
        }
      }
      tinted.set(key, delta);
    }
    minimum = Math.min(minimum, tinted.get(key));
    images.forEach(({ data }) => {
      if (!data[p]) return;
      area++;
      if (data[p + 1] > 127) screened++;
      else solid++;
    });
  }
  images.forEach((image, i) => contexts[i].putImageData(image, 0, 0));
  return { solidShare: solid / area, halftoneShare: g.style === 'stipple' ? 0 : screened / area,
    halftone, minOverprintDelta: Number.isFinite(minimum) ? minimum : null,
    composition: g.composition || `${g.style}/${g.n}/${g.seed % 5}/${g.seed % 3}`,
    chord: g.chord.inks.map((i) => i.name).join('/') };
}
