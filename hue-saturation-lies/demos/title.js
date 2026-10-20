// The title slide, on screen while the room fills, and the closing slide
// (type "thanks"), which reuses the same layout. The closing slide opens on
// "Thank you" alone; the next arrow press fades in the P.S. (step 1).
// The subtitle is placeholder copy for Carolyn.
const SLIDES = {
  // Each heading takes one saturated colour; on black any of them passes 3:1 easily.
  title: { heading: 'Hue,<br>Saturation,<br>Lies', sub: 'Colour theory for the browser', colour: 'oklch(0.75 0.15 40)' },
  thanks: { heading: 'Thank you', sub: 'P.S. We’re hiring.', colour: 'oklch(0.85 0.12 320)' },
};
export function mount(container, type = 'title') {
  const { heading, sub, colour } = SLIDES[type] ?? SLIDES.title;
  container.innerHTML = `
    <style>
      .ttl-root { position: absolute; inset: 0; background: var(--scrim); color: var(--ink); display: grid; place-content: center; gap: 32px; text-align: center; }
      /* 96px keeps Silkscreen on its 8px grid. */
      .ttl-title { margin: 0; font: 96px/1.25 var(--font-display); text-transform: uppercase; letter-spacing: var(--tracking-caps); }
      .ttl-sub { margin: 0; font: var(--text-subtitle)/1.3 var(--font-body); color: var(--ink-soft); transition: opacity var(--motion-slow); }
      /* Hidden, not removed, so the heading does not move when the P.S. appears. */
      .ttl-sub.is-waiting { opacity: 0; visibility: hidden; }
    </style>
    <div class="ttl-root">
      <h1 class="ttl-title" style="color: ${colour}">${heading}</h1>
      <p class="ttl-sub${type === 'thanks' ? ' is-waiting' : ''}">${sub}</p>
    </div>`;
  const subEl = container.querySelector('.ttl-sub');
  const step = i => { if (type === 'thanks') subEl.classList.toggle('is-waiting', i < 1); };
  return { cleanup: () => { container.innerHTML = ''; }, step };
}
