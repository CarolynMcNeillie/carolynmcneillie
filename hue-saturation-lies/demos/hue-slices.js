import { oklchToLinearRGB } from './colour-utils.js';
import { PLAY_ICON, PAUSE_ICON } from './icons.js';

// Seconds for one full turn of the hue wheel when the loop is running.
const LOOP_SECONDS = 12;

// The tallest P3 peak is about 0.363 (hue 146), so 0.4 leaves headroom for its label.
const MAX_C = .4;
const p3 = ([r, g, b]) => [
  .8224621 * r + .177538 * g,
  .0331941 * r + .9668058 * g,
  .0170827 * r + .0723974 * g + .9105199 * b,
];
const inside = rgb => rgb.every(v => v >= -1e-6 && v <= 1 + 1e-6);
const encode = v => v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055;
const clamp = v => Math.max(0, Math.min(1, v));

function boundary(L, hue) {
  let lo = 0, hi = .5;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (inside(p3(oklchToLinearRGB(L, mid, hue)))) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function mount(container) {
  container.innerHTML = `<style>
    .hs-root { position:absolute; inset:0; display:grid; place-items:center; background:#000; color:var(--ink-muted); }
    .hs-panel { width:min(620px, calc(100% - 4rem)); }
    .hs-plot { height:min(65vh, 560px); }
    .hs-plot canvas { width:100%; height:100%; display:block; }
    .hs-row { display:flex; align-items:center; gap:.65rem; min-height:44px; padding:0 1rem 0 2rem; font:var(--text-small)/1.4 var(--font-code); }
    .hs-row input[type=range] { flex:1; min-width:0; }
    .hs-row .icon-button { flex:none; }
    .hs-value { min-width:4ch; text-align:right; }
    .hs-live { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
    @media (max-width:600px) {
      .hs-panel { width:calc(100% - 1rem); }
      .hs-plot { height:min(55vh, 420px); }
      .hs-row { padding:0 .25rem; gap:.25rem; }
    }
  </style><div class="hs-root">
    <div class="hs-panel"><div class="hs-plot"><canvas role="img" aria-label="Hue 264 slice"></canvas></div><div class="hs-row"><button type="button" class="icon-button hs-play" aria-label="Loop through every hue" title="Loop through every hue">${PLAY_ICON}</button><input type="range" min="0" max="360" step="1" value="264" aria-label="Hue"><span class="hs-value" aria-hidden="true"></span><span class="hs-live" aria-live="polite"></span></div></div>
  </div>`;
  const panel = container.querySelector('.hs-panel');
  let raf = 0;
  let alive = true;
  let announce = false;

  function draw() {
    const canvas = panel.querySelector('canvas');
    const hue = Number(panel.querySelector('input').value);
    panel.querySelector('.hs-value').textContent = `${hue}°`;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.width = Math.round(width * dpr);
    const h = canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' });
    if (!ctx) return;
    let image;
    try {
      image = new ImageData(w, h, { colorSpace: ctx.getContextAttributes?.().colorSpace === 'display-p3' ? 'display-p3' : 'srgb' });
    } catch {
      image = ctx.createImageData(w, h);
    }
    const useP3 = image.colorSpace === 'display-p3' && ctx.getContextAttributes?.().colorSpace === 'display-p3';
    const left = Math.round(35 * dpr), right = w - Math.round(16 * dpr);
    const top = Math.round(20 * dpr), bottom = h - Math.round(37 * dpr);
    const plotWidth = right - left, plotHeight = bottom - top;
    if (plotWidth <= 0 || plotHeight <= 0) return;
    let peakL = 0, peakC = 0;
    // Sample independently from the raster so the cusp does not move with viewport width.
    for (let i = 1; i < 400; i++) {
      const L = i / 400, C = boundary(L, hue);
      if (C > peakC) { peakL = L; peakC = C; }
    }
    for (let x = left; x <= right; x++) {
      const L = (x - left) / plotWidth;
      const max = boundary(L, hue);
      const start = Math.max(top, Math.ceil(bottom - max / MAX_C * plotHeight));
      for (let y = start; y <= bottom; y++) {
        const C = (bottom - y) / plotHeight * MAX_C;
        const linear = oklchToLinearRGB(L, C, hue);
        const channels = useP3 ? p3(linear) : linear;
        const offset = (y * w + x) * 4;
        for (let k = 0; k < 3; k++) image.data[offset + k] = Math.round(clamp(encode(clamp(channels[k]))) * 255);
        image.data[offset + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const l = left / dpr, b = bottom / dpr;
    const px = l + peakL * plotWidth / dpr;
    const py = b - peakC / MAX_C * plotHeight / dpr;
    const style = getComputedStyle(panel);
    ctx.strokeStyle = style.getPropertyValue('--ink-muted').trim();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1;
    // A faint baseline, so the height of each peak reads against the same floor.
    ctx.strokeStyle = style.getPropertyValue('--line').trim() || ctx.strokeStyle;
    ctx.beginPath(); ctx.moveTo(l, b + 0.5); ctx.lineTo(right / dpr, b + 0.5); ctx.stroke();
    ctx.strokeStyle = ctx.fillStyle;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, b); ctx.moveTo(px, py); ctx.lineTo(l, py); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = style.getPropertyValue('--ink').trim();
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `${style.getPropertyValue('--text-small').trim()} ${style.getPropertyValue('--font-code').trim()}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(peakL.toFixed(2), px, b + 5);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(peakC.toFixed(2), l - 5, py);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('L', right / dpr - 8, b + 21);
    ctx.fillText('C', l - 18, top / dpr);
    const label = `Hue ${hue}: chroma peaks at ${peakC.toFixed(2)}, at lightness ${peakL.toFixed(2)}`;
    canvas.setAttribute('aria-label', label);
    if (announce) panel.querySelector('.hs-live').textContent = label;
    announce = false;
  }
  function frame() {
    raf = 0;
    if (!alive) return;
    draw();
  }
  function schedule() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  const observer = new ResizeObserver(schedule);
  observer.observe(container);
  const input = panel.querySelector('input');
  input.addEventListener('input', () => { stopLoop(); schedule(); });
  input.addEventListener('change', () => { announce = true; schedule(); });

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const play = panel.querySelector('.hs-play');
  let loop = 0;
  let last = 0;

  function stopLoop() {
    if (loop) cancelAnimationFrame(loop);
    loop = 0;
    last = 0;
    play.innerHTML = PLAY_ICON;
    play.setAttribute('aria-label', 'Loop through every hue');
    play.title = 'Loop through every hue';
  }
  function spin(now) {
    if (!alive) return;
    if (!last) last = now;
    const hue = (Number(input.value) + (now - last) / 1000 / LOOP_SECONDS * 360) % 360;
    last = now;
    input.value = String(Math.round(hue));
    draw();
    loop = requestAnimationFrame(spin);
  }
  play.addEventListener('click', () => {
    if (loop) { stopLoop(); return; }
    if (motion.matches) {
      // Reduced motion: quarter-turn hops rather than a continuous spin.
      input.value = String((Number(input.value) + 90) % 360);
      announce = true;
      schedule();
      return;
    }
    play.innerHTML = PAUSE_ICON;
    play.setAttribute('aria-label', 'Stop the hue loop');
    play.title = 'Stop the hue loop';
    loop = requestAnimationFrame(spin);
  });
  const onMotionChange = () => { if (motion.matches) stopLoop(); };
  motion.addEventListener('change', onMotionChange);

  schedule();
  return {
    cleanup() {
      alive = false;
      stopLoop();
      cancelAnimationFrame(raf);
      motion.removeEventListener('change', onMotionChange);
      observer.disconnect();
      container.innerHTML = '';
    },
  };
}
