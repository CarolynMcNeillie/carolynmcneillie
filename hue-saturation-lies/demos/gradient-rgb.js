import { PATH_PAIRS, pathSelection } from './gradient-pairs.js';
import { pairList } from './pair-list.js';
import { PLAY_ICON } from './icons.js';

const channels = ['red', 'green', 'blue'];
const rgb = values => `rgb(${values.join(' ')})`;

export function mount(container) {
  let t = .5;
  let frame = 0;
  let started = 0;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  container.innerHTML = `<style>
    .g-rgb { position:absolute; inset:0; background:var(--scrim); color:var(--ink); font-family:var(--font-body); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.5rem; padding:2rem; box-sizing:border-box; overflow:auto; }
    .g-rgb-heading { align-self:stretch; max-width:72rem; width:100%; margin:0 auto; }
    .g-rgb-heading p { color:var(--ink-soft); margin:.5rem 0 0; font:var(--text-body)/1.5 var(--font-body); }
    .g-rgb-pixel { display:flex; align-items:center; justify-content:space-around; gap:2rem; width:min(78%, 72rem); }
    .g-rgb-bars { display:flex; gap:3px; }
    .g-rgb-bar-group { display:flex; flex-direction:column; align-items:center; gap:.5rem; }
    .g-rgb-bar { position:relative; width:clamp(2.5rem,5vw,5rem); height:clamp(7.5rem,15vw,15rem); border-radius:var(--radius); overflow:hidden; }
    .g-rgb-bar-fill { position:absolute; bottom:0; left:0; right:0; border-radius:var(--radius); }
    .g-rgb-bar-label { color:var(--ink-muted); }
    .g-rgb-swatch-col { display:flex; flex-direction:column; align-items:center; gap:.5rem; }
    .g-rgb-swatch { width:clamp(7rem,15vw,14rem); aspect-ratio:1; border-radius:var(--radius); border:1px solid var(--ink-muted); }
    .g-rgb-swatch-tag { color:var(--ink); }
    .g-rgb-plot { width:min(78%, 72rem); flex:none; }
    .g-rgb-strip-wrap { position:relative; touch-action:none; cursor:crosshair; }
    .g-rgb-strip { height:64px; }
    .g-rgb-marker { position:absolute; top:0; bottom:0; width:2px; transform:translateX(-50%); background:var(--ink); pointer-events:none; filter:drop-shadow(0 0 2px var(--scrim)); }
    .g-rgb-marker::before { content:''; position:absolute; bottom:100%; left:50%; transform:translateX(-50%); border:7px solid transparent; border-top-color:var(--ink); }
    .g-rgb-range { position:absolute; inset:0; width:100%; height:64px; margin:0; opacity:0; pointer-events:none; }
    .g-rgb-strip-wrap:has(.g-rgb-range:focus-visible) { outline:2px solid var(--ink); outline-offset:3px; }
    .g-rgb-controls { display:flex; gap:.75rem; }
    @media (max-width:700px) { .g-rgb { gap:1rem; padding:1rem; } .g-rgb-pixel { gap:1rem; width:100%; } .g-rgb-plot { width:100%; } .g-rgb-swatch { width:5rem; } }
  </style><div class="g-rgb demo-root">
    <div class="g-rgb-heading"><div class="caps-label" id="g-rgb-title"></div><p>Move along the gradient. Each channel travels in a straight line, on its own.</p></div>
    <div class="g-rgb-pixel">
      <div class="g-rgb-bars">${channels.map((name, i) => `<div class="g-rgb-bar-group"><span class="g-rgb-bar-label caps-label">${name[0]}</span><div class="g-rgb-bar" style="background:${['#1a0000', '#001a00', '#00001a'][i]}"><div class="g-rgb-bar-fill"></div></div></div>`).join('')}</div>
      <div class="g-rgb-swatch-col"><div class="g-rgb-swatch" role="img" aria-label="Current gradient colour"></div><code class="css-tag g-rgb-swatch-tag"></code></div>
    </div>
    <div class="g-rgb-plot"><div class="g-rgb-strip-wrap"><div class="g-rgb-strip" role="img" aria-label="Gradient from blue to yellow"></div><div class="g-rgb-marker" aria-hidden="true"></div><input class="g-rgb-range" type="range" min="0" max="1000" value="500" aria-label="Position along the gradient"></div></div><div class="g-rgb-controls"><span class="g-rgb-pair"></span><button type="button" class="icon-button g-rgb-play" aria-label="Play the gradient once" title="Play the gradient once">${PLAY_ICON}</button></div>
  </div>`;

  const pair = () => PATH_PAIRS[pathSelection.index];
  const strip = container.querySelector('.g-rgb-strip');
  const wrap = container.querySelector('.g-rgb-strip-wrap');
  const marker = container.querySelector('.g-rgb-marker');
  const range = container.querySelector('.g-rgb-range');
  const fills = [...container.querySelectorAll('.g-rgb-bar-fill')];

  function renderPair() {
    const { a, b, names } = pair();
    container.querySelector('#g-rgb-title').textContent = `${names[0]} to ${names[1]}`;
    strip.style.background = `linear-gradient(to right in srgb, ${rgb(a)}, ${rgb(b)})`;
    strip.setAttribute('aria-label', `Gradient from ${names[0]} to ${names[1]}`);
    render();
  }
  function render() {
    const { a, b } = pair();
    const values = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    values.forEach((value, i) => {
      fills[i].style.height = `${value / 255 * 100}%`;
      fills[i].style.backgroundColor = rgb(channels.map((_, j) => i === j ? value : 0));
    });
    container.querySelector('.g-rgb-swatch').style.backgroundColor = rgb(values);
    container.querySelector('.g-rgb-swatch-tag').textContent = rgb(values);
    marker.style.left = `${t * 100}%`;
    range.value = String(Math.round(t * 1000));
    range.setAttribute('aria-valuetext', `${Math.round(t * 100)} percent: red ${values[0]}, green ${values[1]}, blue ${values[2]}`);
  }
  function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; started = 0; }
  function scrub(event, element) {
    stop();
    const rect = element.getBoundingClientRect();
    t = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    render();
  }
  const onStrip = event => scrub(event, strip);
  wrap.addEventListener('pointermove', onStrip);
  wrap.addEventListener('pointerdown', onStrip);
  range.addEventListener('input', () => { stop(); t = Number(range.value) / 1000; render(); });
  function tick(now) {
    if (!started) started = now;
    t = Math.min(1, (now - started) / 4000);
    render();
    if (t < 1) frame = requestAnimationFrame(tick);
    else { frame = 0; started = 0; }
  }
  container.querySelector('.g-rgb-play').addEventListener('click', () => {
    stop();
    if (motion.matches) { t = t >= 1 ? 0 : Math.ceil((t * 4 + .000001)) / 4; render(); }
    else { t = 0; render(); frame = requestAnimationFrame(tick); }
  });
  const onMotionChange = () => { if (motion.matches) stop(); };
  motion.addEventListener('change', onMotionChange);
  container.querySelector('.g-rgb-pair').append(pairList({
    pairs: PATH_PAIRS, get: () => pathSelection.index,
    set: index => { pathSelection.index = index; }, onChange: renderPair,
  }));
  renderPair();
  return () => {
    stop();
    motion.removeEventListener('change', onMotionChange);
    wrap.removeEventListener('pointermove', onStrip);
    wrap.removeEventListener('pointerdown', onStrip);
    container.innerHTML = '';
  };
}
