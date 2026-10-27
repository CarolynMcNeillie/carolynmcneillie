// ── HSL Contrast Demo ────────────────────────────────────────────────────────
import { PLAY_ICON, PAUSE_ICON, GRAYSCALE_ICON } from './icons.js';

// Same hue & saturation, different lightness, swept around the hue circle
// with the WCAG contrast of each degree shown as it passes.

function hslToSRGB(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [r + m, g + m, b + m];
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function wcagLuminance(h, s, l) {
  const [r, g, b] = hslToSRGB(h, s, l);
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

const CT_S = 90, CT_BG_L = 91, CT_FG_L = 60;
// OKLCH variant (the-contrast-ratio-problem): both chromas stay inside sRGB at
// every degree (the blue and yellow cusps limit them). The text lightness is
// set so the sweep opens at blue on 4.56:1, the HSL sweep's starting ratio,
// for a fair comparison. It stays between 4.52:1 and 4.63:1 all the way round.
const OK_BG_L = 0.85, OK_BG_C = 0.07, OK_FG_L = 0.4565, OK_FG_C = 0.075;
function oklchLuminance(l, c, h) {
  const rad = h * Math.PI / 180;
  const a = c * Math.cos(rad), b = c * Math.sin(rad);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const rgb = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S,
  ];
  return rgb.reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
}
// The sample text is 32px (24pt) regular, which WCAG 2 counts as large text
// (at least 18pt regular or 14pt bold), so AA needs 3:1, not 4.5:1
// (SC 1.4.3). Change this if the text size changes. The ratio runs from
// 1.119:1 at 60° to 4.566:1 at 240°, and AA passes from 220° to 281.8°.
const AA_LARGE = 3;
// Truncate, never round up: 2.996:1 shown as 3.00:1 would read as a pass.
const shown = (ratio) => (Math.floor(ratio * 100) / 100).toFixed(2);
// One readout per degree, so each PASS/FAIL edge is exact to the degree.
const STEPS = 360;
const PERIOD = 6;  // seconds per full circle
// Reduced motion steps 10° at a time; a fixed pace of one step per second
// keeps it calm however fast the sweep is.
const REDUCED_PERIOD = 36;
// The slide opens paused on blue, where the pair passes best (4.566:1), and
// the sweep starts from there. A negative delay puts both animations at this
// hue; the play button only changes animation-play-state.
const START_H = 240;
const at = (period) => -(START_H / 360) * period;

// One layer, two animations that share a clock:
// - the hue sweeps smoothly through a registered custom property, so the
//   whole stage is one flat fill (no stacked layers, no blur over motion);
// - the readout is a strip of precomputed rows that steps with transform,
//   which the compositor moves without repainting.
// Each row covers the 1° centred on its hue (hence the half-step delay).
// Removing this demo's DOM removes both animations.
export function mount(container, type) {
  const oklch = type === 'oklch';
  // The HSL sweep says it while the ratio collapses; the OKLCH sweep means it.
  const message = type === 'talked' ? 'We already talked about this.' : oklch ? 'This is actually fine.' : 'This is fine.';
  const color = (h, foreground) => oklch
    ? `oklch(${foreground ? OK_FG_L : OK_BG_L} ${foreground ? OK_FG_C : OK_BG_C} ${h})`
    : `hsl(${h} ${CT_S}% ${foreground ? CT_FG_L : CT_BG_L}%)`;
  const passes = [];
  const rows = Array.from({ length: STEPS }, (_, i) => {
    const h = i * 360 / STEPS;
    const bgLum = oklch ? oklchLuminance(OK_BG_L, OK_BG_C, h) : wcagLuminance(h, CT_S, CT_BG_L);
    const fgLum = oklch ? oklchLuminance(OK_FG_L, OK_FG_C, h) : wcagLuminance(h, CT_S, CT_FG_L);
    const ratio = (Math.max(bgLum, fgLum) + 0.05) / (Math.min(bgLum, fgLum) + 0.05);
    const pass = ratio >= AA_LARGE;
    passes[i] = pass;
    return `
      <div class="hc-row">
        <span class="hc-ratio-num">${shown(ratio)}:1</span>
        <span class="hc-badge ${pass ? "pass" : "fail"}">AA ${pass ? "PASS" : "FAIL"}</span>
        <span class="hc-hue">${h}°</span>
      </div>`;
  }).join("");

  container.innerHTML = `
    <style>
      @property --hc-h { syntax: "<number>"; inherits: true; initial-value: 0; }
      @keyframes hc-hue { to { --hc-h: 360; } }
      @keyframes hc-tick { to { transform: translateY(-100%); } }
      .hc-root { position: absolute; inset: 0; }
      /* The hue animates here, not on .hc-root: an inherited property restyles
         every descendant each frame, and the readout strip has 1,440 nodes. */
      .hc-wrap {
        animation: hc-hue ${PERIOD}s linear ${at(PERIOD)}s infinite paused;
        position: absolute; inset: 0;
        display: flex;
        align-items: center; justify-content: center;
        background: ${color('var(--hc-h)', false)};
      }
      .hc-text {
        font-family: var(--font-display);
        font-size: 2rem; /* 8px grid for Silkscreen; large text for WCAG (see AA_LARGE). */
        line-height: 1.4;
        text-align: center;
        max-width: 70%;
        color: ${color('var(--hc-h)', true)};
        user-select: none;
      }
      /* The face is drawn in the text colour, so it has the text's contrast. */
      .hc-face svg { width: 1.1em; height: 1.1em; vertical-align: -0.2em; margin-left: 0.3em; }
      .hc-face svg[hidden] { display: none; }
      /* One compact, solid rail: blur over the moving stage would repaint. */
      .hc-controls {
        position: absolute;
        bottom: calc(var(--footer-height) + 1.5rem); left: 50%;
        transform: translateX(-50%);
        padding: 0.55rem 0.8rem 0.55rem 1.2rem;
        background: var(--fill);
        border: 1px solid var(--line);
        border-radius: var(--radius-pill);
        color: var(--ink-muted);
        white-space: nowrap;
      }
      .hc-ticker { height: 3rem; overflow: hidden; }
      .hc-rows {
        animation: hc-tick ${PERIOD}s steps(${STEPS}) ${at(PERIOD) - PERIOD / STEPS / 2}s infinite paused;
      }
      .hc-row {
        height: 3rem;
        display: flex; align-items: center; gap: 0.5rem;
      }
      /* The ratio and the verdict are the point of the slide: make them big. */
      .hc-ratio-num { color: var(--ink); font-size: 2rem; min-width: 6ch; }
      .hc-badge { font-size: 1rem; line-height: 1; white-space: nowrap; }
      .hc-badge.pass { color: var(--good); }
      .hc-badge.fail { color: var(--bad); }
      .hc-hue { margin-left: auto; min-width: 4ch; text-align: right; }
      .hc-root.playing :is(.hc-wrap, .hc-rows, .hc-needle) { animation-play-state: running; }
      /* Desaturate the stage only: the readout and the wheel keep their colour. */
      .hc-root.gray .hc-wrap { filter: url(#luminance-gray); }
      /* That grey keeps each colour's WCAG luminance, so the grey text and grey
         background have exactly the contrast ratio in the readout. */
      /* A small hue wheel: the ring is the text colour at every hue, and the
         needle turns with the same clock as the background (0° at the top,
         clockwise, as conic-gradient draws it). */
      .hc-wheel {
        position: relative; flex: none;
        width: 44px; height: 44px;
        border-radius: 50%;
        background: conic-gradient(${Array.from({ length: 13 }, (_, i) => color(i * 30, true)).join(', ')});
        mask: radial-gradient(closest-side, transparent 64%, #000 66%);
      }
      .hc-wheel-box { position: relative; width: 44px; height: 44px; flex: none; }
      .hc-needle {
        position: absolute; inset: 0;
        animation: hc-hue ${PERIOD}s linear ${at(PERIOD)}s infinite paused;
        transform: rotate(calc(var(--hc-h) * 1deg));
        color: var(--ink);
      }
      .hc-head { display: flex; align-items: center; gap: 0.75rem; }
      .hc-head .hc-ticker { width: 20rem; flex: none; }
      @media (max-width: 900px) {
        /* Keep the sample proportional to the short side without changing desktop type. */
        .hc-text {
          font-size: clamp(1.5rem, min(8vw, 8vh), 2rem);
          max-width: calc(100vw - 2rem);
        }
      }
      @media (max-width: 650px) {
        /* The readout gets its own row so the wheel and buttons stay on screen. */
        .hc-controls {
          box-sizing: border-box;
          width: calc(100vw - 1rem);
          max-width: 22rem;
          padding-inline: 0.5rem;
        }
        .hc-head { flex-wrap: wrap; justify-content: center; gap: 0.3rem; }
        .hc-head .hc-ticker { width: 100%; flex: 0 0 100%; }
        .hc-row { justify-content: space-between; gap: 0.25rem; }
        .hc-ratio-num { font-size: 1.5rem; }
        .hc-badge { font-size: 0.875rem; }
        .hc-hue { margin-left: 0; font-size: 0.75rem; }
      }
      /* Reduced motion: no sweep. Both step together, 10° every second. */
      @media (prefers-reduced-motion: reduce) {
        .hc-wrap { animation: hc-hue ${REDUCED_PERIOD}s steps(36) ${at(REDUCED_PERIOD)}s infinite paused; }
        .hc-rows { animation: hc-tick ${REDUCED_PERIOD}s steps(36) ${at(REDUCED_PERIOD)}s infinite paused; }
        .hc-needle { animation: hc-hue ${REDUCED_PERIOD}s steps(36) ${at(REDUCED_PERIOD)}s infinite paused; }
      }
    </style>
    <div class="hc-root">
      <div class="hc-wrap">
        <p class="hc-text">${message}<span class="hc-face" aria-hidden="true"><svg class="hc-smile" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="16" cy="16" r="13.5"/><circle cx="11" cy="13" r="1.5" fill="currentColor"/><circle cx="21" cy="13" r="1.5" fill="currentColor"/><path d="M9.5 19.5Q16 26 22.5 19.5"/></svg><svg class="hc-grimace" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" hidden><circle cx="16" cy="16" r="13.5"/><circle cx="11" cy="12.5" r="1.5" fill="currentColor"/><circle cx="21" cy="12.5" r="1.5" fill="currentColor"/><rect x="8.5" y="17.5" width="15" height="7" rx="2"/><path d="M8.5 21h15M12.5 17.5v7M16 17.5v7M19.5 17.5v7" stroke-width="1.5"/></svg></span></p>
      </div>
      <div class="hc-controls caps-label">
        <div class="hc-head">
          <div class="hc-ticker"><div class="hc-rows">${rows}</div></div>
          <div class="hc-wheel-box" aria-hidden="true">
            <div class="hc-wheel"></div>
            <svg class="hc-needle" viewBox="0 0 44 44"><path d="M22 22V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 8l-4 6h8z" fill="currentColor"/><circle cx="22" cy="22" r="2.5" fill="currentColor"/></svg>
          </div>
          <button type="button" class="icon-button hc-play" aria-label="Play the hue sweep" title="Play the hue sweep">${PLAY_ICON}</button>
          <button type="button" class="icon-button hc-gray" aria-label="Grayscale" title="Grayscale" aria-pressed="false">${GRAYSCALE_ICON}</button>
        </div>
      </div>
    </div>
  `;

  const root = container.querySelector(".hc-root");
  const button = container.querySelector(".hc-play");
  const setPlaying = (playing) => {
    root.classList.toggle("playing", playing);
    const label = playing ? "Pause the hue sweep" : "Play the hue sweep";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
  };
  button.addEventListener("click", () => setPlaying(!root.classList.contains("playing")));

  // The face follows the same verdict as the readout row for the current
  // degree. The hue lives in the animated --hc-h, so read it once a frame.
  const wrap = container.querySelector(".hc-wrap");
  const smile = container.querySelector(".hc-smile");
  const grimace = container.querySelector(".hc-grimace");
  let frame = 0;
  let shownPass = null;
  const tick = () => {
    const raw = parseFloat(getComputedStyle(wrap).getPropertyValue("--hc-h"));
    const h = Number.isFinite(raw) ? raw : START_H;
    const pass = passes[Math.round(h) % STEPS];
    if (pass !== shownPass) {
      shownPass = pass;
      smile.toggleAttribute("hidden", !pass);
      grimace.toggleAttribute("hidden", pass);
    }
    frame = requestAnimationFrame(tick);
  };
  tick();

  const grayButton = container.querySelector(".hc-gray");
  grayButton.addEventListener("click", () => {
    grayButton.setAttribute("aria-pressed", String(root.classList.toggle("gray")));
  });

  return {
    step(index) { setPlaying(index > 0); },
    cleanup() {
      cancelAnimationFrame(frame);
      container.innerHTML = "";
    },
  };
}
