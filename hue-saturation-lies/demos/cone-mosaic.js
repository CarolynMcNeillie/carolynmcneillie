import { spectralCSS } from './spectrum-colours.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const COLOURS = { S: spectralCSS(440), M: spectralCSS(535), L: spectralCSS(620) };

// The same honeycomb as colorblind.js, kept local: there two RNG streams also
// set every radius and fill, so sharing its loop would risk changing the plates.
function buildCells(W, H) {
  const R = Math.min(W, H) / 52;
  const HX = R * 2.08;
  const HY = R * Math.sqrt(3);
  const COLS = Math.ceil(W / HX) + 2;
  const ROWS = Math.ceil(H / HY) + 2;
  let seed = 0xcafebabe;
  const rand = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 0x100000000; };
  const cells = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cells.push({ cx: col * HX + (row % 2) * (HX / 2), cy: row * HY, r: R * 0.78, s: false, row, col });
    }
  }
  // S cones: one per block of 5 rows by 4 columns (5%), at a random place in
  // the block, and never right beside another S. Real S cones form a sparse,
  // roughly even array: neither clumps nor a lattice.
  const at = (row, col) => cells[row * COLS + col];
  for (let br = 0; br < ROWS; br += 5) {
    for (let bc = 0; bc < COLS; bc += 4) {
      for (let tries = 0; tries < 8; tries++) {
        const cell = at(Math.min(ROWS - 1, br + Math.floor(rand() * 5)), Math.min(COLS - 1, bc + Math.floor(rand() * 4)));
        const crowded = cells.some((o) => o.s && Math.hypot(o.cx - cell.cx, o.cy - cell.cy) < HX * 2.5);
        if (!crowded) { cell.s = true; break; }
      }
    }
  }
  // L or M: rank the other cells by a fixed random number, and make the first
  // share of them L. The shares are then exact, and a higher L share only
  // turns M cells into L.
  const others = cells.filter((cell) => !cell.s);
  others.forEach((cell) => { cell.u = rand(); });
  others.sort((a, b) => a.u - b.u).forEach((cell, i) => { cell.rank = (i + 0.5) / others.length; });
  return cells;
}

export function mount(container) {
  container.innerHTML = `
    <style>
      .cm-wrap { background: #111; }
      .cm-svg { display: block; }
      .cm-svg circle { transition: fill 1.2s; }
      .cm-panel.glass-panel {
        position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
        display: flex; flex-direction: column; align-items: center; gap: 0.85rem;
        min-width: min(500px, 72%); padding: 0.6em 1.2em 0.8em;
        background: var(--fill); backdrop-filter: none; -webkit-backdrop-filter: none;
        text-align: center;
      }
      .cm-ratio { font: 32px/1 var(--font-display); letter-spacing: var(--tracking-caps);
        color: var(--ink); }
      .cm-ratio .cm-l { color: ${COLOURS.L}; }
      .cm-ratio .cm-m { color: ${COLOURS.M}; }
      .cm-note { line-height: 1; color: var(--ink-soft); }
      @media (prefers-reduced-motion: reduce) {
        .cm-svg circle { transition: none; }
      }
    </style>
    <div class="cm-wrap demo-root">
      <svg class="cm-svg" role="img"></svg>
      <div class="cm-panel glass-panel">
        <!-- The letters take their cones' colours, so the dots decode them. -->
        <span class="cm-ratio"><span class="cm-l">L</span> : <span class="cm-m">M</span>&nbsp;&nbsp;<span class="cm-num"></span></span>
        <span class="cm-note caps-label">Normal colour vision</span>
      </div>
    </div>`;

  const svg = container.querySelector('.cm-svg');
  const ratio = container.querySelector('.cm-num');
  let cells = [];
  let els = [];
  let currentStep = 0;

  function render() {
    cells.forEach(({ s, rank }, i) => {
      const type = s ? 'S' : rank < (currentStep === 0 ? 1 / 2 : 16 / 17) ? 'L' : 'M';
      els[i].setAttribute('data-cone', type);
      els[i].setAttribute('fill', COLOURS[type]);
    });
    const n = currentStep === 0 ? 1 : 16;
    ratio.textContent = `${n} : 1`;
    const mix = n === 1 ? 'as many L cones as M cones' : `${n} L cones for every M cone`;
    svg.setAttribute('aria-label', `Cone mosaic with ${mix}, and few S cones. Normal colour vision.`);
  }

  function rebuild() {
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    cells = buildCells(W, H);
    const fragment = document.createDocumentFragment();
    els = cells.map(({ cx, cy, r }) => {
      const el = document.createElementNS(SVG_NS, 'circle');
      el.setAttribute('cx', cx.toFixed(1));
      el.setAttribute('cy', cy.toFixed(1));
      el.setAttribute('r', r.toFixed(1));
      fragment.appendChild(el);
      return el;
    });
    svg.replaceChildren(fragment);
    render();
  }

  let resizeTimer;
  const observer = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 150);
  });
  observer.observe(container);
  rebuild();
  return {
    step: n => { currentStep = n; render(); },
    cleanup: () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
      container.innerHTML = '';
    },
  };
}
