// Randomness mosaic: a flat, geometric recreation of a tile mosaic, one cell per
// tile in its average colour (demos/mosaic-data.js, from tools/mosaic-extract.mjs).
// Step 0: the cells in their own colours.
// Step 1: every cell gets a random hue, shown side by side in HSL (saturation
// 100%, same L) and OKLCH (same L, and one chroma per lightness: the most that
// every hue can reach at that L, so chroma does not jump from hue to hue).
// In "One C per L" both sides share each cell's random hue; in full-chroma mode
// HSL draws from the whole wheel (see roll). A click on either mosaic rolls again.
// Cells are half a source tile across and down (see SPLIT). The default
// OKLCH mode is full chroma at C 0.2.
// Any other picture can be tried: drop or paste an image on the slide, or use
// "Load image". It is cut into BASE_COLS square tiles across, averaged in linear
// light, and gets the same treatment. Nothing is uploaded or saved.
import { COLS, ROWS, TILE_ASPECT, TILES } from './mosaic-data.js';
import { oklchToLinearRGB } from './colour-utils.js';

const GAP = 0; // grout, as a share of a cell's height (0: cells touch)
const SVG_NS = 'http://www.w3.org/2000/svg';
// One cell size: half a source tile across and down. The built-in mosaic's
// tiles are each split into 2 x 2 cells of the tile's colour (splitting the
// image itself would average the grout into the cells); a loaded image is cut
// straight into BASE_COLS cells across.
const SPLIT = 2;
const BASE_COLS = 31 * SPLIT;

const decode = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const encode = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const linearOf = (hex) => [1, 3, 5].map((i) => decode(parseInt(hex.slice(i, i + 2), 16) / 255));
function okL([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}
const hslL = (srgb) => ((Math.max(...srgb) + Math.min(...srgb)) / 2) * 100;

const inSRGB = (L, C, H) => oklchToLinearRGB(L, C, H).every((v) => v >= -1e-6 && v <= 1 + 1e-6);
function maxChroma(L, H) {
  let low = 0, high = 0.4;
  for (let i = 0; i < 18; i++) {
    const mid = (low + high) / 2;
    if (inSRGB(L, mid, H)) low = mid; else high = mid;
  }
  return low;
}
// The chroma every hue can reach at this lightness (checked every 5 degrees,
// with a 2% margin for the hues in between).
const chromaCache = new Map();
function sharedChroma(L) {
  const key = L.toFixed(3);
  if (!chromaCache.has(key)) {
    let c = Infinity;
    for (let h = 0; h < 360; h += 5) c = Math.min(c, maxChroma(L, h));
    chromaCache.set(key, c * 0.98);
  }
  return chromaCache.get(key);
}

// Full-chroma mode: every OKLCH cell sits at one chroma, the full C. Only some
// hues reach that chroma at a given lightness, and none do below a certain L, so:
// 1. find the darkest L where any hue reaches the full C (always a blue, near 265);
// 2. lift the picture's darks so its darkest cell lands there, keeping its
//    lightest cell where it is (a straight remap: a gamma curve cannot lift a
//    pure black, which a loaded image can have);
// 3. give each cell a random hue from the hues that reach the full C at its L.
// Deep cells get a handful of blues; lighter cells get more and more of the wheel.
function darkestL(C) {
  let low = 0, high = 1;
  const reaches = (L) => { for (let h = 250; h <= 280; h += 0.5) if (maxChroma(L, h) >= C) return true; return false; };
  for (let i = 0; i < 16; i++) { const mid = (low + high) / 2; if (reaches(mid)) high = mid; else low = mid; }
  return high;
}
// Hues (whole degrees) whose max chroma at L reaches C, per 0.005 of L.
const hueCache = new Map();
function huesReaching(L, C) {
  const Lb = Math.round(L * 200) / 200;
  const key = `${Lb.toFixed(3)}|${C}`;
  if (!hueCache.has(key)) {
    const out = [];
    for (let h = 0; h < 360; h++) if (maxChroma(Lb, h) >= C) out.push(h);
    hueCache.set(key, out);
  }
  return hueCache.get(key);
}

// Merge size x size source tiles into one cell, averaged in linear light.
function cellsFor(size, { cols: COLS, rows: ROWS, aspect, hexes }) {
  const cols = Math.ceil(COLS / size), rows = Math.ceil(ROWS / size);
  const cells = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const sum = [0, 0, 0];
    let n = 0;
    for (let y = row * size; y < Math.min(ROWS, (row + 1) * size); y++) {
      for (let x = col * size; x < Math.min(COLS, (col + 1) * size); x++) {
        linearOf(hexes[y * COLS + x]).forEach((v, i) => { sum[i] += v; });
        n++;
      }
    }
    const linear = sum.map((v) => v / n);
    const srgb = linear.map(encode);
    const hex = '#' + srgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
    const L = okL(linear);
    cells.push({ hex, l: +hslL(srgb).toFixed(1), L: +L.toFixed(4), C: sharedChroma(L) });
  }
  return { cols, rows, aspect, cells };
}

const hexOf = (linear) => '#' + linear.map((v) => Math.round(Math.min(1, Math.max(0, encode(v))) * 255).toString(16).padStart(2, '0')).join('');
// Cut an image into BASE_COLS square tiles across and average each in linear light.
function sourceFromImage(image) {
  const cols = BASE_COLS;
  const rows = Math.max(1, Math.round((cols * image.naturalHeight) / image.naturalWidth));
  const tile = Math.max(8, Math.floor(1600 / cols)); // pixels sampled per tile side
  const canvas = document.createElement('canvas');
  canvas.width = cols * tile;
  canvas.height = rows * tile;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const lut = Array.from({ length: 256 }, (_, v) => decode(v / 255));
  const hexes = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const sum = [0, 0, 0];
    for (let y = row * tile; y < (row + 1) * tile; y++) for (let x = col * tile; x < (col + 1) * tile; x++) {
      const i = (y * canvas.width + x) * 4;
      sum[0] += lut[data[i]]; sum[1] += lut[data[i + 1]]; sum[2] += lut[data[i + 2]];
    }
    hexes.push(hexOf(sum.map((v) => v / (tile * tile))));
  }
  return { cols, rows, aspect: 1, hexes };
}

function drawGrid(svg, { cols, rows, aspect: TILE_ASPECT, cells }) {
  svg.replaceChildren();
  svg.setAttribute('viewBox', `${-GAP / 2} ${-GAP / 2} ${cols * TILE_ASPECT + GAP} ${rows + GAP}`);
  return cells.map((_, i) => {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', ((i % cols) * TILE_ASPECT + GAP / 2).toFixed(4));
    rect.setAttribute('y', (Math.floor(i / cols) + GAP / 2).toFixed(4));
    rect.setAttribute('width', (TILE_ASPECT - GAP).toFixed(4));
    rect.setAttribute('height', (1 - GAP).toFixed(4));
    svg.append(rect);
    return rect;
  });
}

const svgFor = (label) => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  // Touching cells: no anti-aliased hairlines between neighbours.
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label);
  return svg;
};

export function mount(container) {
  container.innerHTML = `
    <style>
      .mo { position: absolute; inset: 0; background: var(--scrim); color: var(--ink); box-sizing: border-box; padding: 2rem 2rem 3rem; display: flex; flex-direction: column; gap: 1rem; }
      .mo [hidden] { display: none !important; }
      .mo-stage { flex: 1; min-height: 0; display: flex; }
      .mo-original { flex: 1; min-height: 0; margin: 0; display: flex; }
      .mo-original svg { flex: 1; min-width: 0; height: 100%; }
      .mo-random { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 1rem; cursor: pointer; }
      .mo-pair { flex: 1; min-height: 0; display: flex; gap: 3vw; }
      .mo-pair figure { margin: 0; flex: 1; min-width: 0; height: 100%; display: flex; flex-direction: column; gap: 1rem; }
      .mo-pair svg { flex: 1; min-height: 0; width: 100%; display: block; }
      .mo figcaption { text-align: center; font: var(--text-label)/1.3 var(--font-display); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--ink-soft); }
      .mo figcaption b { color: var(--ink); font-weight: inherit; }
      .mo-foot { display: flex; align-items: center; justify-content: center; gap: 1.5rem; }
      .mo-sizes .pill-button[aria-pressed="true"] { color: var(--scrim); background: var(--ink); border-color: var(--ink); }
      .mo-full-c { display: flex; align-items: center; gap: 0.5rem; color: var(--ink); }
      .mo-full-c input { width: 140px; }
      .mo-foot { flex-wrap: wrap; }
      .mo-hint { margin: 0; font: var(--text-label)/1.3 var(--font-body); color: var(--ink-muted); }
      .mo-sizes { display: flex; align-items: center; gap: 0.5rem; font: var(--text-label)/1.2 var(--font-display); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--ink-soft); }
    </style>
    <div class="mo demo-root">
      <div class="mo-stage">
        <figure class="mo-original"></figure>
        <div class="mo-random" role="button" tabindex="0" aria-label="Roll new random hues" hidden>
          <div class="mo-pair">
            <figure class="mo-hsl"><figcaption><b>HSL</b> · random hue, S 100%, same L</figcaption></figure>
            <figure class="mo-oklch"><figcaption class="mo-ok-caption"></figcaption></figure>
          </div>
        </div>
      </div>
      <div class="mo-foot">
        <div class="mo-sizes mo-modes" role="group" aria-label="OKLCH chroma">OKLCH
          <button type="button" class="pill-button" data-mode="shared" aria-pressed="false">One C per L</button>
          <button type="button" class="pill-button" data-mode="full" aria-pressed="false">Full C</button>
          <label class="mo-full-c" hidden><input type="range" min="0.08" max="0.2" step="0.01" value="0.2" aria-label="Full chroma"> <span></span></label>
        </div>
        <button type="button" class="pill-button mo-load">Load image</button>
        <input type="file" accept="image/*" class="mo-file" hidden>
        <p class="mo-hint" hidden>Click the mosaics to roll again</p>
      </div>
    </div>`;
  const originalSvg = svgFor('A mosaic portrait of the Mona Lisa, each cell one flat colour');
  const hslSvg = svgFor('The mosaic with a random hue on every cell at full HSL saturation, keeping each cell’s HSL lightness');
  const oklchSvg = svgFor('The mosaic with a random hue on every cell, keeping each cell’s OKLCH lightness, with one chroma per lightness');
  container.querySelector('.mo-original').append(originalSvg);
  container.querySelector('.mo-hsl').prepend(hslSvg);
  container.querySelector('.mo-oklch').prepend(oklchSvg);
  const originalFigure = container.querySelector('.mo-original');
  const random = container.querySelector('.mo-random');
  const hint = container.querySelector('.mo-hint');

  let grid, originalRects, hslRects, oklchRects;
  let mode = 'full', fullC = 0.2;
  const caption = container.querySelector('.mo-ok-caption');
  const modeButtons = [...container.querySelectorAll('[data-mode]')];
  const fullControl = container.querySelector('.mo-full-c');
  const fullInput = fullControl.querySelector('input');
  const fullValue = fullControl.querySelector('span');
  function roll() {
    if (mode === 'shared') {
      caption.innerHTML = '<b>OKLCH</b> · random hue, same L, one C per L';
      grid.cells.forEach(({ l, L, C }, i) => {
        const h = (Math.random() * 360).toFixed(1);
        hslRects[i].setAttribute('fill', `hsl(${h} 100% ${l}%)`);
        oklchRects[i].setAttribute('fill', `oklch(${L} ${C.toFixed(4)} ${h})`);
      });
      return;
    }
    const Ls = grid.cells.map(({ L }) => L);
    const top = Math.max(...Ls), bottom = Math.min(...Ls), floor = darkestL(fullC);
    const lift = bottom >= floor ? (L) => L : (L) => floor + ((L - bottom) * (top - floor)) / (top - bottom);
    caption.innerHTML = `<b>OKLCH</b> · C ${fullC.toFixed(2)}, hues that reach it, same L`;
    fullValue.textContent = `C ${fullC.toFixed(2)} · darkest L ${floor.toFixed(3)}${bottom >= floor ? '' : ` · darks lifted from ${bottom.toFixed(3)}`}`;
    grid.cells.forEach(({ l, L }, i) => {
      const lifted = lift(L);
      const hues = huesReaching(lifted, fullC);
      const h = hues.length ? hues[Math.floor(Math.random() * hues.length)] + Math.random() - 0.5 : 265;
      // Rounding L to its cache bin can leave a hue just short: fit C to be sure.
      const c = Math.min(fullC, maxChroma(lifted, h));
      // HSL has no notion of which hues can reach a chroma, so its hue is drawn
      // from the whole wheel. Sharing the OKLCH hue would smuggle the picture's
      // lightness into HSL through the hue choice.
      hslRects[i].setAttribute('fill', `hsl(${(Math.random() * 360).toFixed(1)} 100% ${l}%)`);
      oklchRects[i].setAttribute('fill', `oklch(${lifted.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(1)})`);
    });
  }
  function setMode(next) {
    mode = next;
    modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    fullControl.hidden = mode !== 'full';
    roll();
  }
  modeButtons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  fullInput.addEventListener('input', () => { fullC = Number(fullInput.value); roll(); });
  const split = Array.from({ length: ROWS * SPLIT }, (_, y) =>
    Array.from({ length: COLS * SPLIT }, (_, x) => TILES[Math.floor(y / SPLIT) * COLS + Math.floor(x / SPLIT)][0])).flat();
  let source = { cols: COLS * SPLIT, rows: ROWS * SPLIT, aspect: TILE_ASPECT, hexes: split };
  const size = 1;
  function setSize() {
    grid = cellsFor(size, source);
    originalRects = drawGrid(originalSvg, grid);
    hslRects = drawGrid(hslSvg, grid);
    oklchRects = drawGrid(oklchSvg, grid);
    grid.cells.forEach(({ hex }, i) => originalRects[i].setAttribute('fill', hex));
    roll();
  }
  setSize();
  setMode(mode);

  // Try another picture: drop it, paste it, or pick a file.
  function useFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      source = sourceFromImage(image);
      URL.revokeObjectURL(url);
      setSize();
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }
  const fileInput = container.querySelector('.mo-file');
  container.querySelector('.mo-load').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => useFile(fileInput.files[0]));
  const root = container.querySelector('.mo');
  root.addEventListener('dragover', (event) => { event.preventDefault(); });
  root.addEventListener('drop', (event) => { event.preventDefault(); useFile(event.dataTransfer.files[0]); });
  const onPaste = (event) => {
    const item = [...(event.clipboardData?.items ?? [])].find((entry) => entry.type.startsWith('image/'));
    if (item) useFile(item.getAsFile());
  };
  document.addEventListener('paste', onPaste);

  random.addEventListener('click', roll);
  random.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    roll();
  });

  // One step: the slide opens on the random hues. The original-colour view is
  // kept in the markup (randomised = false shows it) but the deck never uses it.
  function step() {
    const randomised = true;
    originalFigure.hidden = randomised;
    random.hidden = !randomised;
    hint.hidden = !randomised;
  }
  step(0);
  return { step, cleanup() { document.removeEventListener('paste', onPaste); container.replaceChildren(); } };
}
