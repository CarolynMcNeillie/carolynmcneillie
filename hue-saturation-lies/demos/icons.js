// The first colour goes on the left, matching the gradient's direction.
export function pairIcon(a, b) {
  const rgb = ([r, g, bl]) => `rgb(${r} ${g} ${bl})`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3h5v18H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4" fill="${rgb(a)}"/>
    <path d="M12 3h5a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-5Z" fill="${rgb(b)}"/>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>`;
}

// A water drop with a slash: "colour off". The drop's outline stops short of
// the slash on both sides, so the two never touch. The outline is a generated path of short lines.
export const GRAYSCALE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 14.5L18 13.8L17.8 13L17.7 12.3L17.4 11.5L17.1 10.8L16.8 10L16.4 9.3L15.9 8.6L15.5 7.8L15 7.1L14.5 6.4L14 5.7L13.5 5L13 4.3L12.5 3.7L12 3L12 3L11.5 3.7L11 4.3L10.5 5L10 5.7L9.5 6.4M6.9 10.8L6.6 11.5L6.3 12.3L6.2 13L6 13.8L6 14.5L6.1 15.3L6.2 16.1L6.5 16.8L6.8 17.5L7.2 18.2L7.8 18.7L8.3 19.3L9 19.7L9.7 20L10.4 20.3L11.2 20.4L12 20.5L12.8 20.4L13.6 20.3L14.3 20L15 19.7L15.7 19.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.5 3.5l17 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// An outline sun for the press-and-hold white screen.
export const LIGHT_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M19.07 4.93l-1.42 1.42m-11.3 11.3-1.42 1.42" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

// A die showing five, for rolling new random values.
export const DICE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.25" cy="8.25" r="1.5"/><circle cx="15.75" cy="8.25" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.25" cy="15.75" r="1.5"/><circle cx="15.75" cy="15.75" r="1.5"/></g></svg>`;

export const PAUSE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>`;

export const PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m7 4 13 8-13 8Z" fill="currentColor"/></svg>`;

// Two stacked squares, the front one at the lower left. The filled square is the
// darkest layer, so the icon shows the current order: filled in front means
// "darkest in front". The front square is always filled, with the button colour
// when it is the light one, so it hides the corner of the square behind it.
export function depthOrderIcon(darkestFront) {
  const front = darkestFront ? "currentColor" : "var(--fill)";
  const back = darkestFront ? "none" : "currentColor";
  return `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="3" width="12" height="12" rx="2.5" fill="${back}" stroke="currentColor" stroke-width="2"/>
    <rect x="3" y="9" width="12" height="12" rx="2.5" fill="${front}" stroke="currentColor" stroke-width="2"/>
  </svg>`;
}
