import { LIGHT_ICON } from './icons.js';

// Original afterimage experiment, not a reproduction of an artwork.
// At L=0.70, C=0.12, sRGB excludes H 193-206, and their opposites 13-26.
// Snap these narrow intervals to the nearest in-gamut edge so both squares stay in sRGB.
function safeHue(hue) {
  const h = Math.round((hue + 360) % 360) % 360;
  if (h >= 13 && h <= 26) return h < 20 ? 12 : 27;
  if (h >= 193 && h <= 206) return h < 200 ? 192 : 207;
  return h;
}

export function mount(container) {
  const stops = Array.from({ length: 25 }, (_, i) => `oklch(0.70 0.12 ${i * 15}) ${i * 15}deg`).join(', ');
  container.innerHTML = `
    <style>
      .after { --base: oklch(0.70 0.12 30); --opposite: oklch(from var(--base) l c calc(h + 180)); background: var(--scrim); position: absolute; inset: 0; }
      .after-stage { position: absolute; inset: 0; pointer-events: none; }
      .after-square { position: absolute; top: 42%; width: min(28vw, 42vh); aspect-ratio: 1; transform: translateY(-50%); display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box; }
      .after-square span { font: clamp(14px, 1.4vw, 20px)/1 var(--font-code); color: oklch(0.2 0 0); }
      .after-code { position: absolute; left: 50%; top: calc(42% + min(14vw, 21vh) + 32px); transform: translateX(-50%); margin: 0; white-space: pre; font: clamp(16px, 1.9vw, 28px)/1.5 var(--font-code); color: var(--ink); }
      .after-left { right: calc(50% + 24px); background: var(--base); }
      .after-right { left: calc(50% + 24px); background: var(--opposite); }
      .after-dot { position: absolute; left: 50%; top: 42%; width: 14px; height: 14px; transform: translate(-50%, -50%); border: 3px solid var(--ink); border-radius: 50%; background: var(--scrim); }
      .after-controls { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 28px; }
      .after-wheel { width: 112px; height: 112px; position: relative; border-radius: 50%; cursor: crosshair; touch-action: none; background: conic-gradient(${stops}); }
      .after-wheel::before { content: ''; position: absolute; inset: 16px; border-radius: 50%; background: var(--scrim); pointer-events: none; }
      .after-wheel:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }
      .after-marker { position: absolute; left: 50%; top: 50%; width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--ink); transform: translate(-50%, -50%); pointer-events: none; box-shadow: 0 0 0 2px var(--scrim); }
      .after-marker-b { width: 10px; height: 10px; border-color: var(--ink-soft); }
      .after-light { position: relative; }
      .after[data-white] { background: #fff; }
      .after[data-white] .after-square, .after[data-white] .after-wheel, .after[data-white] .after-code { visibility: hidden; }
      .after[data-white] .after-dot { border-color: #111; background: #fff; }
      .after[data-white] .after-light { opacity: 0; }
      @media (max-width: 850px) {
        .after-controls { bottom: 20px; }
        .after-square { width: min(38vw, 30vh); padding: 8px; }
        .after-code { width: min(90vw, 560px); white-space: pre-wrap; overflow-wrap: anywhere; text-align: center; font-size: 12px; }
      }
      @media (max-width: 850px) and (max-height: 450px) {
        .after-square, .after-dot { top: 38%; }
        .after-square { width: min(27vw, 35vh); }
        .after-code { top: 70%; font-size: 11px; line-height: 1.2; }
        .after-wheel { width: 64px; height: 64px; }
        .after-wheel::before { inset: 10px; }
        .after-controls { bottom: 8px; }
      }
    </style>
    <section class="after demo-root" aria-label="Afterimage colour experiment">
      <div class="after-stage" role="img" aria-label="Two opposite colour squares, --base and --opposite, with a central fixation dot">
        <div class="after-square after-left"><span>--base</span></div><div class="after-square after-right"><span>--opposite</span></div>
        <div class="after-dot" aria-hidden="true"></div>
      </div>
      <pre class="after-code"><code>--opposite:
  oklch(from var(--base) l c calc(h + 180));</code></pre>
      <div class="after-controls">
        <div class="after-wheel" data-no-swipe role="slider" tabindex="0" aria-label="Hue of the left square" aria-valuemin="0" aria-valuemax="359" aria-valuenow="30">
          <span class="after-marker after-marker-a" aria-hidden="true"></span>
          <span class="after-marker after-marker-b" aria-hidden="true"></span>
        </div>
        <button type="button" class="icon-button after-light" aria-label="Hold for a white screen" title="Hold for a white screen">${LIGHT_ICON}</button>
      </div>
    </section>`;
  const root = container.querySelector('.after');
  const wheel = root.querySelector('.after-wheel');
  const button = root.querySelector('.after-light');
  let hue = 30;
  let dragging = false;
  let pointerHeld = false;
  function setHue(value) {
    hue = safeHue(value);
    root.style.setProperty('--base', `oklch(0.70 0.12 ${hue})`);
    wheel.setAttribute('aria-valuenow', String(hue));
    for (const [selector, angle] of [['.after-marker-a', hue], ['.after-marker-b', hue + 180]]) {
      const radians = angle * Math.PI / 180;
      const marker = root.querySelector(selector);
      marker.style.left = `${50 + 41 * Math.sin(radians)}%`;
      marker.style.top = `${50 - 41 * Math.cos(radians)}%`;
    }
  }
  function pointHue(event) {
    const box = wheel.getBoundingClientRect();
    return (Math.atan2(event.clientX - box.left - box.width / 2, box.top + box.height / 2 - event.clientY) * 180 / Math.PI + 360) % 360;
  }
  function onPointerDown(event) {
    wheel.setPointerCapture(event.pointerId);
    dragging = true;
    setHue(pointHue(event));
  }
  function onPointerMove(event) { if (dragging) setHue(pointHue(event)); }
  function stopDrag() { dragging = false; }
  function onWheelKey(event) {
    const next = { ArrowLeft: hue - 1, ArrowRight: hue + 1, Home: 0, End: 359 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    setHue(next);
  }
  function hold(event) {
    if (event.button !== 0) return;
    pointerHeld = true;
    root.dataset.white = '';
  }
  function release() { pointerHeld = false; delete root.dataset.white; }
  function onButtonBlur() { if (!pointerHeld) release(); }
  function onButtonKeyDown(event) {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    root.dataset.white = '';
  }
  function onButtonKeyUp(event) {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    release();
  }
  wheel.addEventListener('pointerdown', onPointerDown);
  wheel.addEventListener('pointermove', onPointerMove);
  wheel.addEventListener('pointerup', stopDrag);
  wheel.addEventListener('pointercancel', stopDrag);
  wheel.addEventListener('lostpointercapture', stopDrag);
  wheel.addEventListener('keydown', onWheelKey);
  button.addEventListener('pointerdown', hold);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
  button.addEventListener('keydown', onButtonKeyDown);
  button.addEventListener('keyup', onButtonKeyUp);
  button.addEventListener('blur', onButtonBlur);
  window.addEventListener('blur', release);
  setHue(hue);
  return () => {
    window.removeEventListener('blur', release);
    container.replaceChildren();
  };
}
