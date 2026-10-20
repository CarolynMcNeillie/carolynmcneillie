export function mount(container) {
  container.innerHTML = `
    <style>
      .hm-wrap { overflow: hidden; }
      .hm-panel {
        position: absolute;
        top: 0;
        bottom: 0;
        display: grid;
        place-items: center;
        width: 33.333333%;
        transition: left var(--motion-slow), width var(--motion-slow), transform var(--motion-slow), visibility var(--motion-slow);
      }
      .hm-wine {
        left: 0;
        width: 100%;
        background: linear-gradient(120deg in oklch, oklch(0.28 0.09 10), oklch(0.42 0.14 355));
        color: var(--ink);
        color: contrast-color(oklch(0.28 0.09 10));
      }
      .hm-bronze {
        left: 100%;
        width: 50%;
        visibility: hidden;
        background: linear-gradient(120deg in oklch, oklch(0.50 0.09 55), oklch(0.74 0.12 75));
        color: var(--scrim);
        color: contrast-color(oklch(0.74 0.12 75));
      }
      .hm-violet {
        left: 0;
        transform: translateX(-100%);
        visibility: hidden;
        background: linear-gradient(120deg in oklch, oklch(0.36 0.13 300), oklch(0.56 0.17 290));
        color: var(--ink);
        color: contrast-color(oklch(0.36 0.13 300));
      }
      .hm-wrap[data-step="1"] .hm-wine { width: 50%; }
      .hm-wrap[data-step="1"] .hm-bronze { left: 50%; visibility: visible; }
      /* Violet arrives from the left and stays there; the others make room. */
      .hm-wrap[data-step="2"] .hm-wine { left: 33.333333%; width: 33.333333%; }
      .hm-wrap[data-step="2"] .hm-bronze { left: 66.666667%; width: 33.333333%; visibility: visible; }
      .hm-wrap[data-step="2"] .hm-violet { transform: translateX(0); visibility: visible; }
      .hm-label {
        padding: 0 1rem;
        font: 32px/1.25 var(--font-display);
        letter-spacing: var(--tracking-caps);
        text-align: center;
      }
      .hm-wrap[data-step="0"] .hm-wine .hm-label { font-size: 64px; }
      .hm-wrap.hm-initial .hm-panel { transition: none; }
      @media (prefers-reduced-motion: reduce) {
        .hm-wrap .hm-panel { transition: none; }
      }
    </style>
    <div class="hm-wrap demo-root hm-initial" data-step="0">
      <div class="hm-panel hm-wine"><span class="hm-label">wine dark sea.</span></div>
      <div class="hm-panel hm-bronze"><span class="hm-label">bronze sky</span></div>
      <div class="hm-panel hm-violet"><span class="hm-label">violet sheep</span></div>
    </div>
  `;

  const wrap = container.querySelector('.hm-wrap');
  const frame1 = requestAnimationFrame(() => {
    frame2 = requestAnimationFrame(() => wrap.classList.remove('hm-initial'));
  });
  let frame2;
  return {
    step: (n) => { wrap.dataset.step = String(n); },
    cleanup: () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      container.innerHTML = '';
    },
  };
}
