// The title slide, on screen while the room fills, and the closing slide
// (type "thanks"), which reuses the same layout. The closing slide opens on
// "Thank you" alone; the next arrow press fades in the P.S. (step 1).
// The subtitle is placeholder copy for Carolyn.
// The closing slide also shows a QR code for the deck in the top right corner,
// with its address under it, so "Thank you" keeps the centre. images/qr-hue-saturation-lies.svg is a static file made once with
// `npx qrcode -t svg -e M -q 4` (no runtime dependency); its white quiet zone
// is part of the image.
import { autoHaloColor } from "../engine.js";
const SLIDES = {
  // Each heading takes one saturated colour; on black any of them passes 3:1 easily.
  title: { heading: 'Hue,<br>Saturation,<br>Lies', sub: 'Colour theory for the browser', colour: 'oklch(0.75 0.15 40)' },
  thanks: { heading: 'Thank you', sub: 'P.S. We’re hiring.', colour: 'oklch(0.85 0.12 320)' },
};
export function mount(container, type = 'title') {
  const { heading, sub, colour } = SLIDES[type] ?? SLIDES.title;
  // The halo (Joel's idea): a crisp pixel outline behind the heading, in the
  // colour that contrasts this slide's own ink (style.css .halo-text).
  const halo = autoHaloColor(colour);
  container.innerHTML = `
    <style>
      .ttl-root { position: absolute; inset: 0; background: var(--scrim); color: var(--ink); display: grid; place-content: center; gap: 32px; text-align: center; }
      /* 96px (--text-display) keeps Silkscreen on its 8px grid. */
      .ttl-title { margin: 0; font: var(--text-display)/var(--leading-display) var(--font-display); text-transform: uppercase; letter-spacing: var(--tracking-caps); --title-halo-auto: ${halo}; }
      .ttl-sub { margin: 0; font: var(--text-subhead)/var(--leading-subhead) var(--font-body); color: var(--ink-soft); transition: opacity var(--motion-slow); }
      @media (max-width: 900px) {
        .ttl-root { padding: 1rem; gap: min(32px, 4vh); }
        .ttl-title { font-size: clamp(20px, min(9vw, 13vh), 96px); line-height: 1.15; }
        .ttl-sub { font-size: clamp(16px, min(5vw, 5vh), 28px); }
      }
      /* Hidden, not removed, so the heading does not move when the P.S. appears. */
      .ttl-sub.is-waiting { opacity: 0; visibility: hidden; }
      .ttl-link { position: absolute; top: 32px; right: 32px; width: 180px; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
      .ttl-qr { width: 180px; height: 180px; image-rendering: pixelated; border-radius: var(--radius); }
      .ttl-url { font: var(--text-body)/1.3 var(--font-body); color: var(--ink); text-align: center; }
      @media (max-width: 900px) {
        .ttl-link { top: 16px; right: 16px; width: min(120px, 18vh); gap: 8px; }
        .ttl-qr { width: min(120px, 18vh); height: min(120px, 18vh); }
        .ttl-url { font-size: 12px; }
      }
    </style>
    <div class="ttl-root">
      <h1 class="ttl-title halo-text" style="color: ${colour}">${heading}</h1>
      ${type === 'thanks' ? `<p class="ttl-link">
        <img class="ttl-qr" src="./images/qr-hue-saturation-lies.svg" alt="QR code for carolynmcneillie.com/hue-saturation-lies">
        <span class="ttl-url">carolynmcneillie.com/<wbr>hue-saturation-lies</span>
      </p>` : ''}
      <p class="ttl-sub${type === 'thanks' ? ' is-waiting' : ''}">${sub}</p>
    </div>`;
  const subEl = container.querySelector('.ttl-sub');
  const step = i => { if (type === 'thanks') subEl.classList.toggle('is-waiting', i < 1); };
  return { cleanup: () => { container.innerHTML = ''; }, step };
}
