// Random hue shift, after ColourShift (colourshift.quick.shopify.io): every pixel
// keeps its lightness and takes a new hue from a palette of random hues keyed to
// lightness, shown side by side in HSL and OKLCH.
// - Palette: a tetradic harmony (four hues 90° apart) from a random base hue,
//   laid across the STOPS lightness positions as ColourShift does: base + 180,
//   + 270, + 0, + 90, + 180 from dark to light. Between stops the hue blends the
//   short way round. Both sides get the same hues.
// - HSL: the pixel's HSL lightness in, hsl(palette hue, 100%, that lightness) out.
// - OKLCH: the pixel's OKLCH L in, oklch(L, chroma, palette hue) out, with the
//   chroma at CAP or the most sRGB allows at that L and hue, whichever is less.
// HSL's lightness is not perceptual, so the same hues scramble its picture;
// OKLCH's is, so the picture survives any roll.
// The dice button, or a click on either picture, rolls new hues. Drop or paste
// an image to try another picture. Nothing is uploaded or saved.
// Each arrow step shows the next artwork from the slide's backgrounds in the
// current hues, then turns the whole palette round the wheel to new ones.
import { oklchToLinearRGB } from './colour-utils.js';
import { LIBRARY } from '../slide-library.js';
import { DICE_ICON } from './icons.js';

// One artwork per arrow step, from the slide's backgrounds (art:).
const ART = (LIBRARY['roll-the-dice']?.slide.backgrounds ?? []).map((entry) => entry.art);
const DEFAULT_IMAGE = ART[0] ?? './images/12Ermine.avif';
const STOPS = [0.15, 0.35, 0.55, 0.75, 0.92];
const MAX_SIDE = 900; // pixels on the longest side of each rendered picture
const CAP = 0.32; // high enough that only the sRGB edge limits chroma
// Tetradic offsets per stop, dark to light (ColourShift's zone map 2, 3, 0, 1, 2).
const TETRADIC = [180, 270, 0, 90, 180];
const tetradic = (base) => TETRADIC.map((offset) => (base + offset) % 360);

const decode = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const DECODE = Float32Array.from({ length: 256 }, (_, v) => decode(v / 255));
// Linear light to an sRGB byte, through a 4096-step table.
const ENCODE = Uint8ClampedArray.from({ length: 4096 }, (_, i) => {
  const v = i / 4095;
  return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
});
const toByte = (v) => ENCODE[Math.max(0, Math.min(4095, Math.round(v * 4095)))];

// The most chroma sRGB allows, per 0.005 of L and per degree of hue.
const inSRGB = (L, C, H) => oklchToLinearRGB(L, C, H).every((v) => v >= -1e-6 && v <= 1 + 1e-6);
let maxChromaTable = null;
function maxChromaAt(L, H) {
  if (!maxChromaTable) {
    maxChromaTable = new Float32Array(201 * 360);
    for (let li = 0; li <= 200; li++) for (let h = 0; h < 360; h++) {
      let low = 0, high = 0.4;
      for (let i = 0; i < 14; i++) { const mid = (low + high) / 2; if (inSRGB(li / 200, mid, h)) low = mid; else high = mid; }
      maxChromaTable[li * 360 + h] = low;
    }
  }
  const li = Math.max(0, Math.min(200, Math.floor(L * 200)));
  return maxChromaTable[li * 360 + (Math.round(H) % 360)];
}

// Hue at lightness x (0..1) for a palette of hues at STOPS.
function paletteHue(hues, x) {
  if (x <= STOPS[0]) return hues[0];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (x <= STOPS[i + 1]) {
      const t = (x - STOPS[i]) / (STOPS[i + 1] - STOPS[i]);
      let d = hues[i + 1] - hues[i];
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      return (hues[i] + d * t + 360) % 360;
    }
  }
  return hues[hues.length - 1];
}

function hslToRgb(h, l, s = 1) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return [f(0), f(8), f(4)];
}

export function mount(container) {
  container.innerHTML = `
    <style>
      .hs { position: absolute; inset: 0; background: var(--scrim); color: var(--ink); box-sizing: border-box; padding: 2rem 2rem 3rem; display: flex; flex-direction: column; gap: 1rem; }
      .hs-pair { flex: 1; min-height: 0; display: flex; gap: 3vw; cursor: pointer; }
      .hs-pair figure { margin: 0; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.75rem; }
      .hs-frame { flex: 1; min-height: 0; position: relative; }
      .hs-frame canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; display: block; }
      .hs-strip { height: 14px; display: block; width: 100%; }
      .hs figcaption { text-align: center; font: var(--text-label)/1.3 var(--font-display); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--ink-soft); }
      .hs figcaption b { color: var(--ink); font-weight: inherit; }
      .hs-foot { display: flex; justify-content: center; }
    </style>
    <div class="hs demo-root">
      <div class="hs-pair" role="button" tabindex="0" aria-label="Roll a new tetradic palette">
        <figure><div class="hs-frame"><canvas class="hs-hsl" role="img" aria-label="The picture recoloured with a tetradic palette at full HSL saturation, keeping HSL lightness"></canvas></div>
          <canvas class="hs-strip hs-strip-hsl" width="512" height="1" aria-hidden="true"></canvas>
          <figcaption><b>HSL</b></figcaption></figure>
        <figure><div class="hs-frame"><canvas class="hs-oklch" role="img" aria-label="The picture recoloured with the same tetradic palette, keeping OKLCH lightness"></canvas></div>
          <canvas class="hs-strip hs-strip-oklch" width="512" height="1" aria-hidden="true"></canvas>
          <figcaption><b>OKLCH</b></figcaption></figure>
      </div>
      <div class="hs-foot">
        <button type="button" class="icon-button hs-roll" data-randomize aria-label="Roll new hues" title="Roll new hues">${DICE_ICON}</button>
      </div>
    </div>`;
  const hslCanvas = container.querySelector('.hs-hsl');
  const okCanvas = container.querySelector('.hs-oklch');
  const hslStrip = container.querySelector('.hs-strip-hsl');
  const okStrip = container.querySelector('.hs-strip-oklch');
  const pair = container.querySelector('.hs-pair');
  let base = Math.random() * 360;
  let hues = tetradic(base);
  // Per pixel, its lightness bin (0..1023) in each model, plus reused output buffers.
  let pixels = null; // { width, height, hslBin, okBin, hslOut, okOut, hslWords, okWords }
  let alive = true;

  // Read a picture once: each pixel's OKLCH L and HSL l.
  function readImage(image) {
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    const okBin = new Uint16Array(width * height), hslBin = new Uint16Array(width * height);
    for (let p = 0, i = 0; p < width * height; p++, i += 4) {
      const r = DECODE[data[i]], g = DECODE[data[i + 1]], b = DECODE[data[i + 2]];
      const lc = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      const mc = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      const sc = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      const L = 0.2104542553 * lc + 0.793617785 * mc - 0.0040720468 * sc;
      okBin[p] = Math.max(0, Math.min(1023, Math.round(L * 1023)));
      hslBin[p] = Math.round((Math.max(data[i], data[i + 1], data[i + 2]) + Math.min(data[i], data[i + 1], data[i + 2])) / 510 * 1023);
    }
    const hslOut = new ImageData(width, height), okOut = new ImageData(width, height);
    pixels = { width, height, hslBin, okBin, hslOut, okOut,
      hslWords: new Uint32Array(hslOut.data.buffer), okWords: new Uint32Array(okOut.data.buffer) };
    for (const c of [hslCanvas, okCanvas]) { c.width = width; c.height = height; }
  }

  // OKLCH colour as sRGB bytes.
  function okBytes(L, H) {
    const C = Math.min(CAP, maxChromaAt(L, H));
    return oklchToLinearRGB(L, C, H).map(toByte);
  }

  function drawStrips() {
    for (const [strip, hsl] of [[hslStrip, true], [okStrip, false]]) {
      const context = strip.getContext('2d');
      const row = context.createImageData(strip.width, 1);
      for (let x = 0; x < strip.width; x++) {
        const v = x / (strip.width - 1), h = paletteHue(hues, v);
        const rgb = hsl ? hslToRgb(h, v).map((c) => Math.round(c * 255)) : okBytes(v, h);
        row.data.set([...rgb, 255], x * 4);
      }
      context.putImageData(row, 0, 0);
    }
  }

  function render() {
    drawStrips();
    if (!pixels) return;
    // Hue and chroma depend only on lightness, so each model gets one colour
    // per lightness bin, packed as RGBA words; the pixels then just look it up.
    const pack = ([r, g, b]) => (255 << 24 | b << 16 | g << 8 | r) >>> 0;
    const hslTable = new Uint32Array(1024), okTable = new Uint32Array(1024);
    for (let k = 0; k < 1024; k++) {
      const x = k / 1023, h = paletteHue(hues, x);
      hslTable[k] = pack(hslToRgb(h, x).map((c) => Math.round(c * 255)));
      okTable[k] = pack(okBytes(x, h));
    }
    const { hslBin, okBin, hslWords, okWords } = pixels;
    for (let p = 0; p < hslBin.length; p++) { hslWords[p] = hslTable[hslBin[p]]; okWords[p] = okTable[okBin[p]]; }
    hslCanvas.getContext('2d').putImageData(pixels.hslOut, 0, 0);
    okCanvas.getContext('2d').putImageData(pixels.okOut, 0, 0);
  }

  let turning = 0; // rAF id while the palette turns
  function stopTurning() { cancelAnimationFrame(turning); turning = 0; }
  function roll() { stopTurning(); base = Math.random() * 360; hues = tetradic(base); render(); }
  // Turn the whole palette round the wheel to a new base hue, 120° to 240° on.
  const TURN_MS = 1200;
  function turn() {
    stopTurning();
    const from = base, by = 120 + Math.random() * 120;
    base = (from + by) % 360;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { hues = tetradic(base); render(); return; }
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - start) / TURN_MS);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      hues = tetradic((from + by * eased) % 360);
      render();
      turning = t < 1 && alive ? requestAnimationFrame(frame) : 0;
    };
    turning = requestAnimationFrame(frame);
  }
  pair.addEventListener('click', roll);
  pair.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault(); event.stopPropagation(); roll();
  });
  container.querySelector('.hs-roll').addEventListener('click', roll);

  // Only the latest request draws, so fast arrow presses land on the right picture.
  let request = 0;
  let shown = null;
  function useUrl(url, revoke, onReady) {
    const mine = ++request;
    shown = url;
    const image = new Image();
    image.onload = () => {
      if (revoke) URL.revokeObjectURL(url);
      if (!alive || mine !== request) return;
      readImage(image); render();
      onReady?.();
    };
    image.onerror = () => { if (revoke) URL.revokeObjectURL(url); };
    image.src = url;
  }
  function showArt(index, onReady) {
    const url = ART[index] ?? DEFAULT_IMAGE;
    if (url !== shown) useUrl(url, false, onReady);
    else onReady?.();
    const next = ART[index + 1];
    if (next) new Image().src = next; // warm the cache for the next press
  }
  function useFile(file) { if (file?.type.startsWith('image/')) useUrl(URL.createObjectURL(file), true); }
  const root = container.querySelector('.hs');
  root.addEventListener('dragover', (event) => event.preventDefault());
  root.addEventListener('drop', (event) => { event.preventDefault(); useFile(event.dataTransfer.files[0]); });
  const onPaste = (event) => {
    const item = [...(event.clipboardData?.items ?? [])].find((entry) => entry.type.startsWith('image/'));
    if (item) useFile(item.getAsFile());
  };
  document.addEventListener('paste', onPaste);

  render();
  showArt(0);
  let arrived = false;
  return {
    step(index) {
      // The first call is the slide arriving: no turn yet. After that, each
      // picture appears in the current hues, then the palette turns to new ones.
      if (!arrived) { arrived = true; showArt(index); return; }
      showArt(index, turn);
    },
    cleanup() { alive = false; stopTurning(); document.removeEventListener('paste', onPaste); container.replaceChildren(); },
  };
}
