import { oklchToLinearRGB } from './colour-utils.js';

const p3 = ([r, g, b]) => [.8224621*r + .177538*g, .0331941*r + .9668058*g, .0170827*r + .0723974*g + .9105199*b];
const inside = rgb => rgb.every(v => v >= -1e-6 && v <= 1 + 1e-6);
function boundary(l, h, convert) {
  let lo = 0, hi = .5;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (inside(convert(oklchToLinearRGB(l, mid, h)))) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function mount(container, initialType) {
  container.innerHTML = `<style>
    .pick { background:var(--scrim); color:var(--ink); display:grid; place-items:center; padding:3vw; }
    .pick-panel { width:min(850px, 95%); display:grid; gap:1.5rem; }
    .pick-swatch { height:clamp(110px, 27vh, 270px); border-radius:var(--radius); border:1px solid var(--line); }
    .pick-code { font:clamp(18px, 3vw, 36px)/1.4 var(--font-code); white-space:nowrap; }
    .pick-labels, .pick-controls { display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; }
    .pick-labels { color:var(--ink-soft); font:var(--text-small) var(--font-body); }
    .pick-controls label { display:grid; gap:.5rem; min-width:0; }
    .pick-controls input { width:100%; }
    .pick-gauge { display:none; }
    .pick-edge .pick-gauge { display:block; }
    .pick-track { position:relative; height:22px; background:linear-gradient(90deg, oklch(0.569 0 0), var(--ink)); border-radius:4px; margin:1rem 0; }
    .pick-mark { position:absolute; top:-7px; height:36px; border-left:3px solid; }
    .pick-srgb { border-color:oklch(1 0 0); } .pick-p3 { border-color:oklch(0.795 0.137 66.1); }
    .pick-gauge p { color:var(--ink-soft); }
    @media(max-width:600px) { .pick-labels, .pick-controls { gap:.3rem; } .pick-code { font-size:16px; } }
  </style><section class="pick demo-root" aria-label="OKLCH colour picker"><div class="pick-panel">
    <div class="pick-swatch"></div><div class="pick-code"></div>
    <div class="pick-controls"><label>Lightness (L)<input type="range" min="0" max="1" step="0.01"></label><label>Chroma (C)<input type="range" min="0" max="0.4" step="0.001"></label><label>Hue (H)<input type="range" min="0" max="360" step="1"></label></div>
    <div class="pick-gauge"><p>Chroma boundary at this lightness and hue</p><div class="pick-track"><span class="pick-mark pick-srgb"></span><span class="pick-mark pick-p3"></span></div><p class="pick-limits"></p><p class="pick-status"></p><p>The browser maps an out-of-gamut request to a colour the display can show.</p></div>
  </div></section>`;
  const root = container.querySelector('.pick');
  const sliders = [...root.querySelectorAll('input')];
  let type = initialType, frame = 0, generation = 0;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let values = [.7, .15, 250];
  function render() {
    const [l, c, h] = values;
    sliders.forEach((slider, i) => { slider.value = String(values[i]); });
    root.querySelector('.pick-swatch').style.background = `oklch(${l} ${c} ${h})`;
    root.querySelector('.pick-code').textContent = `--base: oklch(${l.toFixed(2).replace(/0$/, '')} ${c.toFixed(3).replace(/0$/, '')} ${Math.round(h)});`;
    if (type === 'edge') {
      const srgb = boundary(l, h, rgb => rgb), displayP3 = boundary(l, h, p3);
      root.querySelector('.pick-srgb').style.left = `${srgb / .4 * 100}%`;
      root.querySelector('.pick-p3').style.left = `${displayP3 / .4 * 100}%`;
      root.querySelector('.pick-limits').textContent = `sRGB (white): ${srgb.toFixed(3)} · Display P3 (orange): ${displayP3.toFixed(3)}`;
      root.querySelector('.pick-status').textContent = `Inside sRGB: ${c <= srgb ? 'yes' : 'no'} · Inside Display P3: ${c <= displayP3 ? 'yes' : 'no'}`;
    }
  }
  function animate(target) {
    cancelAnimationFrame(frame);
    const token = ++generation;
    if (motion.matches) { values = target; render(); return; }
    const start = [...values], begin = performance.now();
    function tick(now) {
      if (token !== generation) return;
      const t = Math.min(1, (now - begin) / 650);
      values = start.map((v, i) => v + (target[i] - v) * t);
      render();
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }
  sliders.forEach((slider, i) => slider.addEventListener('input', () => { cancelAnimationFrame(frame); generation++; values[i] = Number(slider.value); render(); }));
  // syntax: each arrow step moves one slider, in reading order: L, then C, then H.
  function step(n) {
    const targets = type === 'controls' ? [[.7,.15,250],[.7,.15,30],[.7,.06,30],[.45,.06,30]] : type === 'edge' ? [[.7,.15,250],[.7,.4,250]] : [[.7,.15,250],[.45,.15,250],[.45,.06,250],[.45,.06,30]];
    animate(targets[Math.max(0, Math.min(n, targets.length - 1))]);
  }
  function update(nextType, n = 0) { type = nextType; root.classList.toggle('pick-edge', type === 'edge'); step(n); }
  root.classList.toggle('pick-edge', type === 'edge');
  render();
  return { step, update, cleanup() { generation++; cancelAnimationFrame(frame); container.replaceChildren(); } };
}
