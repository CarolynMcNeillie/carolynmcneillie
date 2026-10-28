// Original ray study of equal-lightness colour edges, inspired by Edna Andrade's
// Op art (Turbo 1-65, 1965), not a copy of it. Alternating rays leave the
// centre, swirl, then break into zigzags like lightning. Magenta and green,
// opposite hues at the same OKLCH L and C, vibrate hardest where they meet.
const PAIRS = [
  ['oklch(0.70 0.18 330)', 'oklch(0.70 0.18 150)'],
  ['oklch(0.55 0.18 330)', 'oklch(0.85 0.18 150)'],
];

const RAYS = 48; // 24 of each colour
const WIDTH = 1600;
const HEIGHT = 1000;
const REACH = Math.hypot(WIDTH, HEIGHT) / 2 + 20; // past the corners
const SECTOR = (Math.PI * 2) / RAYS;

// A triangle wave from 0 to 1 and back over one period.
const triangle = (x) => 2 * Math.abs(x - Math.floor(x + 0.5));

// How far a ray edge has turned at radius r. Near the centre it swirls; further
// out it zigzags, more strongly towards the edges. Every edge turns by the same
// amount at the same radius, so neighbouring edges never cross.
function twist(r) {
  const t = r / REACH;
  const swirl = 1.1 * Math.sqrt(t);
  const zigzag = SECTOR * 1.6 * Math.min(1, t * 2.2) * triangle(r / 110);
  return swirl + zigzag;
}

function point(angle, r) {
  return `${(WIDTH / 2 + r * Math.cos(angle)).toFixed(1)} ${(HEIGHT / 2 + r * Math.sin(angle)).toFixed(1)}`;
}

function rayPath(index) {
  const radii = Array.from({ length: Math.ceil(REACH / 5) + 1 }, (_, i) => Math.min(REACH, i * 5));
  const start = index * SECTOR;
  const out = radii.map((r) => point(start + twist(r), r));
  const back = radii.slice().reverse().map((r) => point(start + SECTOR + twist(r), r));
  return `M ${out.join(' L ')} L ${back.join(' L ')} Z`;
}

export function mount(container, type) {
  container.innerHTML = `
    <style>
      .ri { background: var(--scrim); color: var(--ink); padding: 32px 5vw; display: flex; flex-direction: column; }
      .ri-field { flex: 1; min-height: 0; overflow: hidden; }
      .ri-field svg { width: 100%; height: 100%; display: block; }
      /* Each arrow step fades the stripes to their new colours. */
      .ri-stripe-a, .ri-stripe-b { transition: fill 0.9s ease-in-out; }
      .ri-stripe-a { fill: var(--stripe-a); }
      .ri-stripe-b { fill: var(--stripe-b); }
      .ri-caption { display:none; padding:1rem; background:var(--scrim); font:clamp(16px,2vw,28px) var(--font-code); }
      .ri.has-code .ri-caption { display:block; animation: ri-fade-in 0.9s ease-in-out; }
      @keyframes ri-fade-in { from { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .ri-stripe-a, .ri-stripe-b { transition: none; }
        .ri.has-code .ri-caption { animation: none; }
      }
    </style>
    <section class="ri demo-root" aria-label="Original ray study inspired by Edna Andrade">
      <div class="ri-field">
        <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Alternating magenta and green rays zigzagging out from the centre, an original study inspired by Edna Andrade"></svg>
      </div>
      <code class="ri-caption">--stripe-b: oklch(from var(--stripe-a) l c calc(h + 180));</code>
    </section>`;
  const root = container.querySelector('.ri');
  const svg = root.querySelector('svg');
  const namespace = 'http://www.w3.org/2000/svg';
  const background = document.createElementNS(namespace, 'rect');
  background.setAttribute('width', String(WIDTH));
  background.setAttribute('height', String(HEIGHT));
  background.setAttribute('class', 'ri-stripe-a');
  svg.append(background);
  for (let i = 0; i < RAYS; i += 2) {
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('d', rayPath(i));
    path.setAttribute('class', 'ri-stripe-b');
    svg.append(path);
  }
  function step(n) {
    const index = Math.max(0, Math.min(2, n));
    const [a, b] = PAIRS[index === 2 ? 0 : index];
    root.classList.toggle('has-code', index === 2);
    root.style.setProperty('--stripe-a', a);
    root.style.setProperty('--stripe-b', index === 2 ? 'oklch(from var(--stripe-a) l c calc(h + 180))' : b);
    svg.setAttribute('aria-label', [
      'Zigzagging rays of two hues at equal lightness',
      'Zigzagging rays of two hues at different lightness',
      'Zigzagging rays of two hues at equal lightness, with the second hue computed from the first',
    ][index]);
  }
  step(0);
  return { step, cleanup() { container.replaceChildren(); } };
}
