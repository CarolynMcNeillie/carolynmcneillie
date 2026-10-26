/*
About me, part 1: now. The laptop photo, zoomed out and anchored right,
with "hello." in the space beside it.
Image: images/about/now-laptop.jpg (Carolyn's photo, unchanged).
*/
import { autoHaloColor } from "../engine.js";

// Vertical crop for the full-bleed layout: 0% shows the top of the photo,
// 100% the bottom. This keeps her face and hands both in the wide band.
const BAND = '46%';
// Zoom out: the photo fills this share of the stage width, anchored right
// (where Carolyn sits), and its left edge fades into the black stage. 1 fills
// the whole width; lower shows more of the photo.
const ZOOM = 0.8;

export function mount(container) {
  // The halo (Joel's idea): a crisp pixel outline, so "hello." stays crisp
  // where it crosses the mask into the photo, not just on the black stage.
  const halo = autoHaloColor(getComputedStyle(document.documentElement).getPropertyValue("--ink").trim());
  container.innerHTML = `
    <style>
      .ph01n { position: absolute; inset: 0; background: var(--scrim); color: var(--ink); }
      .ph01n-bleed { position: absolute; top: 0; right: 0; width: ${ZOOM * 100}%; height: 100%; object-fit: cover; object-position: 50% ${BAND}; display: block; mask-image: linear-gradient(to right, transparent, #000 20%); }
      /* "hello." in the space left of Carolyn. Silkscreen has no lowercase, so it reads as caps. */
      .ph01n-hello { position: absolute; left: 29%; bottom: 33%; transform: translateX(-50%); margin: 0; font: var(--text-display)/1 var(--font-display); color: var(--ink); --title-halo-auto: ${halo}; }
      @media (max-width: 900px) {
        .ph01n-hello { left: 30%; font-size: clamp(20px, min(9vw, 13vh), 96px); }
      }
      @media (max-width: 900px) and (orientation: portrait) {
        /* Fill the stage without the left black band, and keep Carolyn's face and body in the narrow crop. */
        .ph01n-bleed { width: 100%; object-position: right center; mask-image: none; }
        .ph01n::after { content: ''; position: absolute; inset: 0 0 auto; height: 24%; background: linear-gradient(to bottom, rgba(0,0,0,.7), transparent); pointer-events: none; }
        .ph01n-hello { z-index: 1; top: 5%; bottom: auto; left: 5%; transform: none; font-size: clamp(24px, 8vw, 40px); }
      }
    </style>
    <div class="ph01n">
        <img class="ph01n-bleed" src="./images/about/now-laptop.jpg" width="3072" height="4080" alt="Carolyn at her laptop at a Shopify event">
        <p class="ph01n-hello">hello.</p>
    </div>`;
  return () => { container.innerHTML = ''; };
}
