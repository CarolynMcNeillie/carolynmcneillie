// Original simultaneous-contrast study, after Josef Albers's Interaction of Color.
const WARM = 'oklch(0.35 0.10 55)';
const COOL = 'oklch(0.84 0.06 235)';
const SAME = 'oklch(0.66 0.045 25)';
const LEFT = 'oklch(0.63 0.02 40)';
const RIGHT = 'oklch(0.68 0.02 230)';
const SHARED_GROUND = 'oklch(0.24 0 0)';

export function mount(container, type) {
  container.innerHTML = `
    <style>
      .alb { background: var(--scrim); color: var(--ink); padding: 32px 6vw; display: flex; flex-direction: column; }
      .alb-study { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; container-type: inline-size; transition: gap 600ms ease-in-out; }
      .alb-column { display: flex; flex-direction: column; min-width: 0; }
      .alb-ground { flex: 1; display: grid; place-items: center; }
      .alb-column:first-child .alb-ground { background: var(--warm-ground, var(--ground)); }
      .alb-column:nth-child(2) .alb-ground { background: var(--cool-ground, var(--ground)); }
      .alb-square { width: clamp(90px, 12vw, 160px); aspect-ratio: 1; background: var(--square); transition: transform 600ms ease-in-out; }
      .alb-column:first-child .alb-square { background: var(--square-left, var(--square)); }
      .alb-column:nth-child(2) .alb-square { background: var(--square-right, var(--square)); }
      .alb:is([data-step="1"], [data-step="3"]) .alb-study { gap: 0; }
      .alb:is([data-step="1"], [data-step="3"]) .alb-column:first-child .alb-square { transform: translateX(calc(25cqw - 50%)); }
      .alb:is([data-step="1"], [data-step="3"]) .alb-column:nth-child(2) .alb-square { transform: translateX(calc(50% - 25cqw)); }
      @media (prefers-reduced-motion: reduce) {
        .alb-study, .alb-square { transition-duration: 0s; }
      }
    </style>
    <section class="alb demo-root" data-step="0" aria-label="One colour, two appearances">
      <div class="alb-study">
        <div class="alb-column"><div class="alb-ground"><div class="alb-square" role="img" aria-label="Left colour square"></div></div></div>
        <div class="alb-column"><div class="alb-ground"><div class="alb-square" role="img" aria-label="Right colour square"></div></div></div>
      </div>
    </section>`;
  const root = container.querySelector('.alb');
  const squares = root.querySelectorAll('.alb-square');
  function step(n) {
    const i = Math.max(0, Math.min(3, n));
    root.dataset.step = String(i);
    const heading = i < 2 ? 'One colour, two appearances' : 'Two colours, one appearance?';
    root.setAttribute('aria-label', heading);
    squares[0].setAttribute('aria-label', `Left colour square, ${i < 2 ? SAME : LEFT}`);
    squares[1].setAttribute('aria-label', `Right colour square, ${i < 2 ? SAME : RIGHT}`);
    const declarations = i < 2
      ? [['--square', SAME], ['--warm-ground', WARM], ['--cool-ground', COOL]]
      : i === 2
        ? [['--square-left', LEFT], ['--square-right', RIGHT], ['--warm-ground', WARM], ['--cool-ground', COOL]]
        : [['--square-left', LEFT], ['--square-right', RIGHT], ['--ground', SHARED_GROUND]];
    for (const name of ['--square', '--square-left', '--square-right', '--warm-ground', '--cool-ground', '--ground']) root.style.removeProperty(name);
    declarations.forEach(([name, value]) => root.style.setProperty(name, value));
  }
  step(0);
  return { step, cleanup() { container.replaceChildren(); } };
}
