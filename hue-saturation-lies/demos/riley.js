// Original stripe study of equal-lightness colour edges, not a Riley painting.
const PAIRS = [
  ['oklch(0.68 0.11 40)', 'oklch(0.68 0.09 250)'],
  ['oklch(0.55 0.11 40)', 'oklch(0.80 0.09 250)'],
];

function boundary(x, y) {
  return x + 5 * Math.sin(y / 57 + x / 112);
}

function stripePath(x, width) {
  const points = Array.from({ length: 29 }, (_, i) => i * 18);
  const left = points.map(y => `${boundary(x, y).toFixed(2)} ${y}`);
  const right = points.reverse().map(y => `${boundary(x + width, y).toFixed(2)} ${y}`);
  return `M ${left.join(' L ')} L ${right.join(' L ')} Z`;
}

export function mount(container, type) {
  container.innerHTML = `
    <style>
      .ri { background: var(--scrim); color: var(--ink); padding: 32px 5vw; display: flex; flex-direction: column; }
      .ri-field { flex: 1; min-height: 0; overflow: hidden; }
      .ri-field svg { width: 100%; height: 100%; display: block; }
      .ri-stripe-a { fill: var(--stripe-a); }
      .ri-stripe-b { fill: var(--stripe-b); }
    </style>
    <section class="ri demo-root" aria-label="Original stripe study">
      <div class="ri-field">
        <svg viewBox="0 0 1200 504" preserveAspectRatio="none" role="img" aria-label="Alternating warm and cool wavy stripes, an original study"></svg>
      </div>
    </section>`;
  const root = container.querySelector('.ri');
  const field = root.querySelector('.ri-field');
  const svg = field.querySelector('svg');
  const namespace = 'http://www.w3.org/2000/svg';
  const background = document.createElementNS(namespace, 'rect');
  background.setAttribute('width', '1200');
  background.setAttribute('height', '504');
  background.setAttribute('class', 'ri-stripe-a');
  svg.append(background);
  for (let x = 16; x < 1200; x += 32) {
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('d', stripePath(x, 16));
    path.setAttribute('class', 'ri-stripe-b');
    svg.append(path);
  }
  function step(n) {
    const index = Math.max(0, Math.min(PAIRS.length - 1, n));
    const [a, b] = PAIRS[index];
    root.style.setProperty('--stripe-a', a);
    root.style.setProperty('--stripe-b', b);
    svg.setAttribute('aria-label', [
      'Wavy stripes of two hues at equal lightness',
      'Wavy stripes of two hues at different lightness',
    ][index]);
  }
  step(0);
  return { step, cleanup() { container.replaceChildren(); } };
}
