export const PAIRS = [
  { names: ['blue', 'yellow'], a: [0, 0, 255], b: [255, 255, 0] },
  { names: ['red', 'cyan'], a: [255, 0, 0], b: [0, 255, 255] },
  { names: ['purple', 'green'], a: [136, 0, 255], b: [0, 204, 68] },
  { names: ['purple', 'amber'], a: [136, 0, 255], b: [255, 192, 0] },
  { names: ['white', 'pink'], a: [255, 255, 255], b: [255, 20, 147] },
];

// Shared by the RGB and the two model-path slides. The bands slide has its own selection.
export const PATH_PAIRS = [
  ...PAIRS.filter(({ names }) => names.join() !== 'purple,amber'),
  { names: ['black', 'white'], a: [0, 0, 0], b: [255, 255, 255] },
];
export const pathSelection = { index: 0 };

// A pair colour as a developer writes it in CSS: [255, 0, 0] -> #FF0000.
export const hexCSS = (c) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
