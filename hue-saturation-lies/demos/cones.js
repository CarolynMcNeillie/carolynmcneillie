import { spectralCSS } from './spectrum-colours.js';

// Govardovskii et al. (2000), Visual Neuroscience 17:509–528, A1 alpha-band
// visual-pigment template. x = lambdaMax / lambda; alpha absorbance is the
// reciprocal of the sum of three exponentials and 0.674. Normalised to 1.
// Approximate cone-fundamental peaks, not measured fundamentals: S 440 nm,
// M 535 nm, L 565 nm; Q 550 nm is an illustrative fourth-pigment variant.
function pigment(nm, peak) {
  const x = peak / nm;
  const a = 0.8795 + 0.0459 * Math.exp(-((peak - 300) ** 2) / 11940);
  return 1 / (Math.exp(69.7 * (a - x)) + Math.exp(28 * (0.922 - x)) + Math.exp(-14.9 * (1.104 - x)) + 0.674);
}
const PIGMENTS = [
  {name: 'S', peak: 440}, {name: 'M', peak: 535},
  {name: 'L', peak: 565}, {name: 'Q', peak: 550},
];
const maxValue = peak => Math.max(...Array.from({length: 601}, (_, i) => pigment(380 + i * .6, peak)));
const fmt = n => n.toFixed(2);

// type 'trichromat' draws S, M and L only. The default also draws the dashed
// Q, hidden at step 0 and faded in at step 1.
export function mount(container, type) {
  const pigments = type === 'trichromat' ? PIGMENTS.filter(({name}) => name !== 'Q') : PIGMENTS;
  const BASE = 'Normalised sensitivity from 400 to 700 nanometres for S, M, and L cones';
  const Q_TEXT = ', plus a dashed hypothetical Q cone between M and L.';
  container.innerHTML = `
    <style>
      .cones-demo { background: var(--scrim); color: var(--ink); display: grid; place-items: center;
        padding: 1rem 2rem; }
      .cones-svg { width: 100%; height: 100%; display: block; }
      .cones-label { font-size: var(--text-label); fill: var(--ink-soft); }
      .cones-muted { font-size: var(--text-label); fill: var(--ink-muted); }
      .cones-rule { stroke: var(--ink-faint); stroke-width: 1; fill: none; }
      .cones-q { opacity: 0; transition: opacity 1s; }
      .cones-demo[data-step="1"] .cones-q { opacity: 1; }
      @media (prefers-reduced-motion: reduce) { .cones-q { transition: none; } }
    </style>
    <div class="cones-demo demo-root" data-step="0">
      <svg class="cones-svg svg-display" role="img" aria-label="${BASE}."></svg>
    </div>`;
  const root = container.querySelector('.cones-demo');
  const svg = container.querySelector('.cones-svg');
  function render() {
    const W = svg.clientWidth, H = svg.clientHeight;
    if (!W || !H) return;
    const left = Math.min(72, W * .12), right = W - left, width = right - left;
    const xAt = nm => left + (nm - 400) / 300 * width;
    const height = Math.min(H * .52, 420);
    // Centre the curves, peak labels, and axis caption within the usable stage.
    const baseline = H / 2 - 42 + height / 2, top = baseline - height;
    const gradient = Array.from({length: 61}, (_, i) =>
      `<stop offset="${i / 60 * 100}%" stop-color="${spectralCSS(400 + i * 5)}"/>`).join('');
    const curves = pigments.map(({name, peak}) => {
      const coords = Array.from({length: 301}, (_, i) => {
        const x = xAt(400 + i);
        const y = baseline - pigment(400 + i, peak) / maxValue(peak) * height;
        return `${i ? 'L' : 'M'}${fmt(x)},${fmt(y)}`;
      }).join('');
      // L is conventionally drawn red-orange despite its yellow-green peak.
      // 620 nm supplies that display colour from the shared spectral map.
      const fill = name === 'Q' ? 'var(--ink)' : spectralCSS(name === 'L' ? 620 : peak);
      const opacity = name === 'Q' ? '.04' : '.16';
      const stroke = name === 'Q' ? 'var(--ink)' : fill;
      const open = name === 'Q' ? '<g class="cones-q">' : '', close = name === 'Q' ? '</g>' : '';
      return `${open}<path d="${coords}L${fmt(right)},${fmt(baseline)}H${fmt(left)}Z" fill="${fill}" fill-opacity="${opacity}"/>
        <path d="${coords}" fill="none" stroke="${stroke}" stroke-width="${name === 'Q' ? 3 : 4}" ${name === 'Q' ? 'stroke-dasharray="9 8"' : ''} stroke-linecap="round" stroke-linejoin="round"/>
        <text x="${fmt(xAt(peak))}" y="${fmt(top - (name === 'Q' ? 22 : 12))}" text-anchor="middle" class="cones-label">${name}</text>${close}`;
    }).join('');
    const ticks = Array.from({length: 7}, (_, i) => {
      const x = xAt(400 + i * 50);
      return `<path d="M${fmt(x)} ${fmt(baseline + 36)}v8" class="cones-rule"/>
        <text x="${fmt(x)}" y="${fmt(baseline + 68)}" text-anchor="middle" class="cones-muted">${400 + i * 50}</text>`;
    }).join('');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `<defs><linearGradient id="cones-rainbow">${gradient}</linearGradient></defs>
      <path d="M${fmt(left)} ${fmt(baseline)}H${fmt(right)}" class="cones-rule"/>
      ${curves}
      <rect x="${fmt(left)}" y="${fmt(baseline + 14)}" width="${fmt(width)}" height="14" fill="url(#cones-rainbow)"/>
      ${ticks}
      <text x="${fmt(W / 2)}" y="${fmt(Math.min(H - 15, baseline + 106))}" text-anchor="middle" class="cones-label">WAVELENGTH (NM)</text>`;
  }
  const observer = new ResizeObserver(render);
  observer.observe(root);
  render();
  const cleanup = () => { observer.disconnect(); container.innerHTML = ''; };
  if (pigments.length === 3) return cleanup;
  return {
    cleanup,
    step: (n) => {
      root.dataset.step = n ? '1' : '0';
      svg.setAttribute('aria-label', BASE + (n ? Q_TEXT : '.'));
    },
  };
}
