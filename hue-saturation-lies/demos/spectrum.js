import { spectralCSS } from './spectrum-colours.js';

// Boundaries in Hz (conventional approximate regions, not sharp physical
// transitions): radio 1 kHz–300 MHz; microwave 300 MHz–300 GHz;
// infrared 300 GHz–430 THz; visible 430–750 THz; ultraviolet
// 750 THz–30 PHz; X-ray 30 PHz–30 EHz; gamma 30 EHz–100 ZHz.
// Radio and microwave overlap in some conventions; this diagram uses 300 MHz
// as the dividing line. Both open ends are clipped to the displayed axis.
const BOUNDS = [1e3, 3e8, 3e11, 4.3e14, 7.5e14, 3e16, 3e19, 1e23];
const NAMES = ['RADIO', 'MICROWAVE', 'INFRARED', 'VISIBLE', 'ULTRAVIOLET', 'X-RAY', 'GAMMA'];
const logMin = Math.log10(BOUNDS[0]);
const logRange = Math.log10(BOUNDS.at(-1)) - logMin;
const xAt = (f, left, width) => left + (Math.log10(f) - logMin) / logRange * width;
const esc = n => n.toFixed(2);

export function mount(container) {
  container.innerHTML = `
    <style>
      .spectrum-demo { background: var(--scrim); color: var(--ink); display: grid; place-items: center;
        padding: 1rem 2rem; }
      .spectrum-svg { display: block; width: 100%; height: 100%; }
      .spectrum-label { fill: var(--ink-soft); font-size: 16px; }
      .spectrum-muted { fill: var(--ink-muted); font-size: 16px; }
      .spectrum-stroke { fill: none; stroke: var(--ink); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
      .spectrum-rule { fill: none; stroke: var(--ink-faint); stroke-width: 1; }
    </style>
    <div class="spectrum-demo demo-root">
      <svg class="spectrum-svg svg-display" role="img" aria-label="Electromagnetic spectrum on a logarithmic frequency axis. A wave tightens from radio to gamma rays; visible light is a tiny rainbow sliver between infrared and ultraviolet."></svg>
    </div>`;

  const root = container.querySelector('.spectrum-demo');
  const svg = container.querySelector('.spectrum-svg');
  function render() {
    const W = svg.clientWidth, H = svg.clientHeight;
    if (!W || !H) return;
    const margin = Math.min(48, W * .07), span = W - 2 * margin;
    const amp = Math.min(90, H * .15);
    const visStart = xAt(BOUNDS[3], margin, span), visEnd = xAt(BOUNDS[4], margin, span);
    const stops = Array.from({length: 19}, (_, i) =>
      `<stop offset="${i / 18 * 100}%" stop-color="${spectralCSS(700 - i / 18 * 300)}"/>`).join('');
    // Keep labels at the actual log-midpoint of each span. Only use a second
    // row when neighbouring labels cannot fit on the same row.
    const rowEnds = [-Infinity, -Infinity];
    const bands = NAMES.map((name, i) => {
      if (i === 3) return null; // Visible is too narrow for text; use a leader above.
      const center = (xAt(BOUNDS[i], margin, span) + xAt(BOUNDS[i + 1], margin, span)) / 2;
      const halfWidth = name.length * 6; // 16px Silkscreen plus letter spacing.
      // First row with room; if neither has room, the one that ends earlier.
      const free = rowEnds.findIndex((end) => center - halfWidth > end + 12);
      const row = free !== -1 ? free : rowEnds[0] <= rowEnds[1] ? 0 : 1;
      rowEnds[row] = center + halfWidth;
      return {name, center, row};
    }).filter(Boolean);
    const rows = bands.some(({row}) => row === 1) ? 2 : 1;
    const mid = H / 2 - (rows === 2 ? 66 : 48);
    const axisY = mid + amp + 48;
    const labelsY = axisY + 42;
    const captionY = labelsY + (rows === 2 ? 90 : 66);
    const visibleLabelX = Math.max(margin, Math.min(W - margin - 125, visStart - 52));
    const labels = bands.map(({name, center, row}) =>
      `<text x="${esc(center)}" y="${esc(labelsY + row * 36)}" text-anchor="middle" class="spectrum-label">${name}</text>`).join('');
    const ticks = BOUNDS.map(f => {
      const x = xAt(f, margin, span);
      return `M${esc(x)} ${esc(axisY - 6)}v12`;
    }).join(' ');
    const waveY = x => {
      const t = (x - margin) / span;
      // Diagrammatic local wavelength: cycles grow smoothly with log frequency.
      // A screen cannot resolve the actual ~20 orders of magnitude in wavelength.
      return mid + amp * Math.sin(2 * Math.PI * (2 * t + 5 * t * t));
    };
    let path = '';
    for (let x = margin; x <= W - margin; x += 2) path += `${path ? 'L' : 'M'}${esc(x)},${esc(waveY(x))}`;
    path += `L${esc(W - margin)},${esc(waveY(W - margin))}`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `
      <defs><linearGradient id="spectrum-rainbow" x1="${esc(visStart)}" x2="${esc(visEnd)}" y1="0" y2="0" gradientUnits="userSpaceOnUse">${stops}</linearGradient>
        <clipPath id="spectrum-visible-clip"><rect x="${esc(visStart)}" y="0" width="${esc(visEnd - visStart)}" height="${H}"/></clipPath></defs>
      <path d="${path}" class="spectrum-stroke"/>
      <path d="${path}" fill="none" stroke="url(#spectrum-rainbow)" stroke-width="5" stroke-linecap="round" clip-path="url(#spectrum-visible-clip)"/>
      <path d="M${margin} ${esc(axisY)}H${W - margin} ${ticks}" class="spectrum-rule"/>
      <path d="M${esc(visStart)} ${esc(mid - amp - 6)} V${esc(mid - amp - 32)} H${esc(visibleLabelX + 32)}" class="spectrum-rule"/>
      <text x="${visibleLabelX}" y="${esc(mid - amp - 48)}" class="spectrum-label">VISIBLE</text>
      <text x="${visibleLabelX}" y="${esc(mid - amp - 25)}" class="spectrum-muted">400–700 NM</text>
      ${labels}
      <text x="${esc(W / 2)}" y="${esc(captionY)}" text-anchor="middle" class="spectrum-label">FREQUENCY (LOG SCALE)</text>`;
  }
  const observer = new ResizeObserver(render);
  observer.observe(root);
  render();
  return () => { observer.disconnect(); container.innerHTML = ''; };
}
