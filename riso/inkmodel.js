export const DMAX = 1.45;
export const linearize = (c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
export const encode = (c) => c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
export const rgb = (hex) => hex.replace('#', '').match(/../g).map((v) => parseInt(v, 16) / 255);
export const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255)
  .toString(16).padStart(2, '0')).join('');
export function opticalDensity(ink, paper) {
  return ink.map((v, i) => Math.min(DMAX, -Math.log10(Math.max(0.001, Math.min(1, v / paper[i])))));
}
export function deposit(col, paper, density, strength, film, hiding = 0, coverage = 1) {
  return col.map((v, i) => {
    const t = 10 ** (-density[i] * strength * film);
    return t * (v * (1 - hiding * coverage) + paper[i] * hiding * coverage);
  });
}
export function scanTone(col, contrast = 1, blackPoint = 0) {
  return col.map((v) => Math.max(0, Math.min(1, (v - blackPoint) * contrast)));
}
export function composite(inks, paperHex = '#f1ebde', tone = {}) {
  const paper = rgb(paperHex).map(linearize);
  let col = [...paper];
  for (const ink of [...inks].sort((a, b) => a.order - b.order)) {
    const d = opticalDensity(rgb(ink.hex).map(linearize), paper);
    col = deposit(col, paper, d, ink.density, ink.film ?? 1, ink.hiding, ink.coverage ?? 1);
  }
  return hex(scanTone(col, tone.contrast, tone.blackPoint).map(encode));
}
export const drum = (name, hex, order = 0) => ({ name, hex, density: 1, hiding: 0, order });
export const fitted = {
  paper: '#e0dfc4', contrast: 1.117, blackPoint: 0.012,
  inks: [{ ...drum('Calibrated Red', '#e74343'), density: 1.13 },
    { ...drum('Calibrated Light Green', '#26b641', 1), density: 0.67 },
    { ...drum('Calibrated Dark Green', '#06671c', 2), density: 1.07 }],
};
export function presets(palette) {
  const pair = (...names) => names.map((name, order) => drum(name,
    palette.find((p) => p.name === name).hex, order));
  const set = (inks) => ({ inks, paper: '#f1ebde', contrast: 1, blackPoint: 0 });
  return {
    'Schimautz: Circle': { ...fitted, inks: fitted.inks.slice(0, 2) },
    'Schimautz: Kleeblatt': fitted,
    'Pink + Yellow': set(pair('Fluorescent Pink', 'Yellow')),
    'Blue + Fluorescent Orange': set(pair('Blue', 'Fluorescent Orange')),
    'Black + Orange': set(pair('Black', 'Fluorescent Orange')),
  };
}
export function parseSet(text) {
  const value = JSON.parse(text);
  if (!Array.isArray(value.inks) || value.inks.length < 2 || value.inks.length > 4) throw Error('Use 2 to 4 drums.');
  for (const ink of value.inks) {
    if (!/^#[0-9a-f]{6}$/i.test(ink.hex) || typeof ink.name !== 'string') throw Error('Invalid ink.');
    if (!(ink.density >= 0 && ink.density <= 3 && ink.hiding >= 0 && ink.hiding <= 0.5)) {
      throw Error('Invalid density or hiding.');
    }
  }
  if (!/^#[0-9a-f]{6}$/i.test(value.paper)) throw Error('Invalid paper.');
  if (!(value.contrast > 0 && value.contrast <= 4 && value.blackPoint >= 0 && value.blackPoint <= 0.1)) {
    throw Error('Invalid scan tone.');
  }
  value.inks.forEach((ink, i) => { ink.order = i; });
  return value;
}
