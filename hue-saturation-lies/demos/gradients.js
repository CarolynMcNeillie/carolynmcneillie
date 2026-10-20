// ── Gradients Demo ───────────────────────────────────────────────────────────
// The same two sRGB colours, interpolated three ways with plain CSS gradients.
// The endpoints are identical in every band; only the mixing space changes.
// OKLCH midpoints can fall outside sRGB; a screen that cannot show them maps
// them back in gamut, which does not change how the mix is interpolated.
// HSL note: blue (240°) and yellow (60°), and red (0°) and cyan (180°), are
// exactly 180° apart. CSS `shorter hue` then makes no adjustment, so blue to
// yellow goes down through cyan and green, and red to cyan goes up through
// yellow and green.

import { PAIRS, hexCSS as hex } from './gradient-pairs.js';
import { pairList } from './pair-list.js';
import { GRAYSCALE_ICON } from './icons.js';

const rgb = ([r, g, b]) => `rgb(${r} ${g} ${b})`;
const isGrey = ([r, g, b]) => r === g && g === b;
// OKLCH endpoints for one pair. A grey has no hue, and Chrome draws an OKLCH
// gradient from a zero-chroma stop through an unrelated hue (white to pink
// went via blue, even with the hue written as `none`). So a grey end borrows
// the other end's hue with a chroma of 0.0001, which still looks like the
// grey (white renders 255 254 255). Its lightness is the cube root of its
// linear value.
const linear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const greyLike = (grey, other) =>
  `oklch(from ${rgb(other)} ${+Math.cbrt(linear(grey[0] / 255)).toFixed(4)} 0.0001 h)`;
const oklchEnds = (a, b) => [
  isGrey(a) ? greyLike(a, b) : rgb(a),
  isGrey(b) ? greyLike(b, a) : rgb(b),
];

export function mount(container) {
  let current = 0;

  container.innerHTML = `
    <style>
      .gr-wrap {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        font-family: var(--font-display);
      }
      .gr-bands { flex: 1; display: flex; flex-direction: column; }
      .gr-band { flex: 1; position: relative; }
      /* The band's own CSS, centred on it. No box behind it: the text takes
         whichever of black or white contrasts more with the band's midpoint,
         which color-mix() finds in the same space the gradient mixes in. */
      .gr-band-tag {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        max-width: calc(100% - 3.6rem);
        margin: 0;
        text-align: center;
        color: var(--ink);
        color: contrast-color(var(--gr-mid));
      }
      .gr-divider { height: 3px; background: var(--scrim); flex-shrink: 0; }
      /* Its own strip under the bands, so it never covers a gradient. */
      .gr-controls {
        flex-shrink: 0;
        padding: 0.75rem 1.8rem;
        display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 1rem 2rem;
        background: var(--scrim);
      }
      @media (max-width: 600px) {
        .gr-band { min-height: 0; }
        .gr-band-tag { left: 1rem; max-width: calc(100% - 2rem); }
      }
    </style>

    <div class="gr-wrap">
      <div class="gr-bands">
      <div class="gr-band" id="gr-srgb"><code class="gr-band-tag css-tag"></code></div>
      <div class="gr-divider"></div>
      <div class="gr-band" id="gr-hsl"><code class="gr-band-tag css-tag"></code></div>
      <div class="gr-divider"></div>
      <div class="gr-band" id="gr-oklch"><code class="gr-band-tag css-tag"></code></div>
      </div>

      <div class="gr-controls">
        <div id="gr-pair-control"></div>
        <button class="icon-button" id="gr-gray" aria-label="Grayscale" title="Grayscale" aria-pressed="false">${GRAYSCALE_ICON}</button>
      </div>
    </div>
  `;

  const bands = ['srgb', 'hsl', 'oklch'].map((id) => container.querySelector(`#gr-${id}`));

  function render() {
    const { a: ca, b: cb } = PAIRS[current];
    ['srgb', 'hsl', 'oklch'].forEach((space, i) => {
      // The OKLCH band swaps a grey end for its Chrome-safe twin (see oklchEnds);
      // the label shows the plain CSS a reader would write.
      const ends = (space === 'oklch' ? oklchEnds(ca, cb) : [hex(ca), hex(cb)]).join(', ');
      bands[i].style.background = `linear-gradient(to right in ${space}, ${ends})`;
      bands[i].style.setProperty('--gr-mid', `color-mix(in ${space}, ${ends})`);
      bands[i].firstElementChild.textContent =
        `linear-gradient(to right in ${space}, ${hex(ca)}, ${hex(cb)})`;
    });
  }

  container.querySelector('#gr-pair-control').append(pairList({
    pairs: PAIRS, get: () => current, set: value => { current = value; }, onChange: render,
  }));

  const grayBtn = container.querySelector('#gr-gray');
  const grWrap = container.querySelector('.gr-bands');
  let grayActive = false;
  grayBtn.addEventListener('click', () => {
    grayActive = !grayActive;
    grWrap.classList.toggle('grayscale', grayActive);
    grayBtn.setAttribute('aria-pressed', String(grayActive));
  });

  render();
  return () => { container.innerHTML = ''; };
}
