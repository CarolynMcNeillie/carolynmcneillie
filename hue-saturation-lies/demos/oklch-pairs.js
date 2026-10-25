// Ratios use the browser's rendered sRGB pixels, not OKLCH coordinates.
import { oklchToLinearRGB } from './colour-utils.js';

const hues = Array.from({ length: 12 }, (_, i) => i * 30);
const LIGHTNESSES = [0.64, 0.36];
function inSRGB(L, C, H) {
  return oklchToLinearRGB(L, C, H).every(channel => channel >= -1e-7 && channel <= 1 + 1e-7);
}
function maxChroma(L, H) {
  let low = 0, high = 0.4;
  for (let i = 0; i < 28; i++) {
    const mid = (low + high) / 2;
    if (inSRGB(L, mid, H)) low = mid;
    else high = mid;
  }
  return low;
}
export const pairingChroma = 0.95 * Math.min(...LIGHTNESSES.flatMap(L => hues.map(H => maxChroma(L, H))));
const pairs = [
  { name: 'HSL', bg: h => `hsl(${h} 78% 68%)`, fg: h => `hsl(${h} 78% 33%)`, label: 'S 78% · L 68% / 33%' },
  { name: 'OKLCH', bg: h => `oklch(64% ${pairingChroma} ${h})`, fg: h => `oklch(36% ${pairingChroma} ${h})`, label: `C ${pairingChroma.toFixed(3)} · L 64% / 36%` },
];
function luminance(rgb) {
  const [r, g, b] = rgb.map(v => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
  return .2126*r + .7152*g + .0722*b;
}
function ratio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x,y) => y-x);
  return (light + .05) / (dark + .05);
}
const floor2 = n => (Math.floor(n * 100 + 1e-9) / 100).toFixed(2);
export function mount(container) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });
  function pixels(css) {
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
  }
  container.innerHTML = `<style>
    .op { background:var(--scrim); color:var(--ink); padding:clamp(20px,4vh,42px) 4vw; display:flex; flex-direction:column; gap:1.5rem; overflow:auto; }
    .op h2 { font:clamp(18px,2vw,32px)/1.2 var(--font-display); text-transform:uppercase; }
    .op-row { display:grid; gap:.6rem; } .op-head { display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
    .op-cells { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:6px; }
    .op-cell { min-width:0; } .op-sample { height:clamp(75px,13vh,130px); display:grid; place-items:center; border-radius:var(--radius); font:32px var(--font-body); }
    .op-result { font:clamp(18px,1.4vw,24px)/1.3 var(--font-body); font-variant-numeric:tabular-nums; text-align:center; }
    .op-note { margin-top:auto; color:var(--ink-soft); }
    @media(max-width:900px) { .op-cells { grid-template-columns:repeat(6,minmax(0,1fr)); } }
  </style><section class="op demo-root" aria-label="HSL and OKLCH accessible colour pairings"><h2>Same gap. Twelve hues.</h2><div class="op-rows"></div><p class="op-note">OKLCH L is not the WCAG contrast formula.</p></section>`;
  const holder = container.querySelector('.op-rows');
  for (const pair of pairs) {
    const row = document.createElement('section'); row.className = 'op-row';
    const cells = hues.map(h => ({ h, bg:pair.bg(h), fg:pair.fg(h), contrast:ratio(pixels(pair.bg(h)), pixels(pair.fg(h))) }));
    const ratios = cells.map(c => c.contrast);
    const head = document.createElement('div'); head.className = 'op-head';
    head.textContent = `${pair.name} · ${pair.label} · min ${floor2(Math.min(...ratios))}:1 · max ${floor2(Math.max(...ratios))}:1`;
    const grid = document.createElement('div'); grid.className = 'op-cells';
    for (const cell of cells) {
      const item = document.createElement('div'); item.className = 'op-cell';
      const sample = document.createElement('div'); sample.className = 'op-sample'; sample.style.background = cell.bg; sample.style.color = cell.fg; sample.textContent = 'Aa';
      const result = document.createElement('div'); result.className = 'op-result'; result.innerHTML = `${cell.h}°<br>${floor2(cell.contrast)}:1`;
      item.append(sample, result); grid.append(item);
    }
    row.append(head, grid); holder.append(row);
  }
  return { cleanup() { container.replaceChildren(); } };
}
