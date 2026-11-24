import { composite, drum, rgb, linearize } from '../inkmodel.js';

export function oklab(hex) {
  const [r, g, b] = rgb(hex).map(linearize);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
const polar = (hex) => {
  const [L, a, b] = oklab(hex);
  return { L, C: Math.hypot(a, b), h: Math.atan2(b, a) * 180 / Math.PI };
};
const gap = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
const papers = ['#f1ebde', '#f2e8d8', '#e9ede5'];
export function buildChords(palette) {
  const colors = palette.map((p) => ({ ...p, ...polar(p.hex) }));
  const scored = [];
  function score(inks) {
    if (!inks.some((ink) => ink.C >= 0.15 || ink.name.includes('Fluorescent'))) return;
    if (inks.filter((ink) => ink.C < 0.04).length > 1) return;
    const delta = gap(inks[0].h, inks[1].h);
    if (!((delta >= 20 && delta <= 60) || delta >= 150)) return;
    const light = Math.abs(inks[0].L - inks[1].L);
    if (light < 0.15) return;
    for (let a = 0; a < inks.length; a++) {
      for (let b = a + 1; b < inks.length; b++) {
        const mix = polar(composite([drum(inks[a].name, inks[a].hex), drum(inks[b].name, inks[b].hex)]));
        if (mix.C < 0.04 && mix.L > 0.3) return;
      }
    }
    if (inks.length === 3) {
      const d = gap(inks[0].h, inks[2].h);
      if (d < 120 || d > 180) return;
      const full = polar(composite(inks.map((ink, i) => drum(ink.name, ink.hex, i))));
      if (full.C < 0.04 && full.L > 0.3) return;
    }
    scored.push({ name: inks.map((p) => p.name).join(' / '), inks,
      score: light * 0.25 + inks.reduce((sum, p) => sum + p.C, 0)
        - inks.filter((p) => p.C < 0.04).length });
  }
  for (let a = 0; a < colors.length; a++) {
    for (let b = a + 1; b < colors.length; b++) {
      for (let c = b + 1; c < colors.length; c++) {
        score([colors[a], colors[b], colors[c]]);
      }
    }
  }
  const hand = [
    ['Persimmon tide', 'Blue', 'Orange', 'Fluorescent Pink', 'Yellow'],
    ['Rose garden', 'Hunter Green', 'Fluorescent Pink', 'Yellow', 'Teal'],
    ['Solar violet', 'Purple', 'Yellow', 'Fluorescent Orange', 'Aqua'],
    ['Fire and sea', 'Midnight', 'Fluorescent Orange', 'Teal', 'Fluorescent Pink'],
    ['Evening iris', 'Violet', 'Sunflower', 'Fluorescent Pink', 'Green'],
    ['Hot postage', 'Burgundy', 'Fluorescent Pink', 'Yellow', 'Orange'],
    ['Petal and pool', 'Blue', 'Fluorescent Pink', 'Yellow', 'Teal'],
    ['Golden midnight', 'Midnight', 'Yellow', 'Fluorescent Orange', 'Green'],
    ['Electric orchard', 'Indigo', 'Fluorescent Pink', 'Green', 'Sunflower'],
    ['Coral lagoon', 'Hunter Green', 'Fluorescent Orange', 'Aqua', 'Yellow'],
    ['Festival', 'Burgundy', 'Fluorescent Pink', 'Blue', 'Yellow'],
    ['Daybreak', 'Purple', 'Fluorescent Orange', 'Sunflower', 'Teal'],
  ].map(([name, ...names]) => ({ name, inks: names.map((n) => palette.find((p) => p.name === n)) }))
    .filter((c) => c.inks.every(Boolean));
  return [...hand, ...scored.sort((a, b) => b.score - a.score).slice(0, 40)]
    .map((c, i) => ({ name: c.name, paper: papers[i % 3], contrast: 1, blackPoint: 0,
      inks: c.inks.map((p, order) => drum(p.name, p.hex, order)) }));
}
