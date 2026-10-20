import { GRAYSCALE_ICON } from './icons.js';
const LIGHT_L = 0.76;
const LIGHT_C = 0.13;
const DARK_L = 0.47;
const DARK_C = 0.26;
const RED_H = 15;
// Travel the short way around the hue circle, through magenta and purple.
const BLUE_H = -105; // 255 degrees

export function mount(container) {
  container.innerHTML = `
    <style>
      @property --pk-h { syntax: "<number>"; inherits: true; initial-value: ${RED_H}; }
      .pk-wrap {
        --pk-h: ${RED_H};
        --pk-light-c: ${LIGHT_C};
        --pk-dark-c: ${DARK_C};
        transition: --pk-h 1.6s ease-in-out;
        overflow: hidden;
      }
      .pk-left, .pk-right, .pk-top { position: absolute; }
      .pk-left { inset: 0; background: var(--pk-light); }
      .pk-right {
        top: 0; right: 0; bottom: 0; width: 50%;
        background: var(--pk-dark);
        transform: translateX(100%);
        transition: transform var(--motion-slow);
      }
      .pk-wrap[data-step="1"] .pk-right,
      .pk-wrap[data-step="2"] .pk-right,
      .pk-wrap[data-step="3"] .pk-right { transform: translateX(0); }
      .pk-wrap[data-step="1"] .pk-right { transition-delay: 0.4s; }
      .pk-words {
        position: absolute; inset: 0;
        display: grid; place-items: center;
        font: 96px/1 var(--font-display);
        letter-spacing: var(--tracking-caps);
        color: var(--ink);
        color: contrast-color(var(--pk-light));
        opacity: 1;
        transition: opacity var(--motion-slow) 0.4s;
        pointer-events: none;
      }
      .pk-wrap:not([data-step="0"]) .pk-words {
        opacity: 0;
        transition-delay: 0s;
      }
      .pk-top {
        top: 0; right: 0; width: 100%; height: 50%;
        display: grid; grid-template-columns: repeat(2, 1fr);
        transform: translateY(-100%);
        transition: transform var(--motion-slow);
      }
      .pk-wrap[data-step="3"] .pk-top { transform: translateY(0); }
      .pk-cell { display: grid; place-items: center; }
      .pk-top-light { background: var(--pk-top-light); }
      .pk-top-dark { background: var(--pk-top-dark); }
      .pk-cell-label { font: 32px/1 var(--font-display); letter-spacing: var(--tracking-caps); }
      .pk-top-light { color: var(--ink); color: contrast-color(var(--pk-top-light)); }
      .pk-top-dark { color: var(--ink); color: contrast-color(var(--pk-top-dark)); }
      .pk-bottom-light { color: var(--ink); color: contrast-color(var(--pk-light)); }
      .pk-bottom-dark { color: var(--ink); color: contrast-color(var(--pk-dark)); }
      .pk-bottom {
        position: absolute; bottom: 0; height: 50%; width: 100%;
        display: grid; grid-template-columns: repeat(2, 1fr);
        pointer-events: none;
      }
      .pk-bottom .pk-cell-label { opacity: 0; transition: opacity var(--motion-slow); }
      .pk-wrap[data-step="3"] .pk-bottom .pk-cell-label { opacity: 1; }
      .pk-controls {
        padding: 0.35em 1.2em;
        position: absolute; bottom: 1rem; left: 50%;
        transform: translateX(-50%);
        opacity: 0; visibility: hidden;
        transition: opacity var(--motion-slow), visibility 0s 0.4s;
      }
      .pk-wrap[data-step="3"] .pk-controls {
        opacity: 1; visibility: visible; transition: opacity var(--motion-slow), visibility 0s;
      }
      .pk-wrap.pk-initial, .pk-wrap.pk-initial * { transition: none !important; }
      @media (prefers-reduced-motion: reduce) {
        .pk-wrap, .pk-wrap * { transition-duration: 0s !important; transition-delay: 0s !important; }
      }
    </style>
    <div class="pk-wrap demo-root pk-initial" data-step="0"
      style="--pk-light: oklch(${LIGHT_L} var(--pk-light-c) var(--pk-h)); --pk-dark: oklch(${DARK_L} var(--pk-dark-c) var(--pk-h)); --pk-top-light: oklch(${LIGHT_L} var(--pk-light-c) ${RED_H}); --pk-top-dark: oklch(${DARK_L} var(--pk-dark-c) ${RED_H})">
      <div class="pk-left"></div>
      <div class="pk-right"></div>
      <div class="pk-bottom">
        <div class="pk-cell pk-bottom-light"><span class="pk-cell-label">blue</span></div>
        <div class="pk-cell pk-bottom-dark"><span class="pk-cell-label">blue</span></div>
      </div>
      <div class="pk-top">
        <div class="pk-cell pk-top-light"><span class="pk-cell-label">pink</span></div>
        <div class="pk-cell pk-top-dark"><span class="pk-cell-label">red</span></div>
      </div>
      <div class="pk-words">think pink</div>
      <div class="pk-controls">
        <button class="icon-button" id="pk-gray" aria-label="Grayscale" title="Grayscale" aria-pressed="false">${GRAYSCALE_ICON}</button>
      </div>
    </div>
  `;

  const wrap = container.querySelector('.pk-wrap');
  const gray = container.querySelector('#pk-gray');
  let raf1;
  let raf2;
  // .grayscale (style.css) keeps each colour's luminance, as on the Hello slide.
  const onGray = () => {
    const on = wrap.classList.toggle('grayscale');
    gray.setAttribute('aria-pressed', String(on));
  };
  gray.addEventListener('click', onGray);

  function step(n) {
    wrap.dataset.step = String(n);
    wrap.style.setProperty('--pk-h', n >= 2 ? BLUE_H : RED_H);
  }

  // The engine may call step again before this first paint when mounting at a later step.
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => wrap.classList.remove('pk-initial'));
  });

  return {
    step,
    cleanup: () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      gray.removeEventListener('click', onGray);
      container.innerHTML = '';
    },
  };
}
