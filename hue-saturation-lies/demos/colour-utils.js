export function oklchToLinearRGB(L, C, H) {
  const hr = H * Math.PI / 180;
  const a  = C * Math.cos(hr);
  const b  = C * Math.sin(hr);
  const l_ = L + 0.3963377774*a + 0.2158037573*b;
  const m_ = L - 0.1055613458*a - 0.0638541728*b;
  const s_ = L - 0.0894841775*a - 1.2914855480*b;
  const lc = l_**3, mc = m_**3, sc = s_**3;
  return [
     4.0767416621*lc - 3.3077115913*mc + 0.2309699292*sc,
    -1.2684380046*lc + 2.6097574011*mc - 0.3413193965*sc,
    -0.0041960863*lc - 0.7034186147*mc + 1.7076147010*sc,
  ];
}

// The grey with the same WCAG relative luminance as a CSS colour, in CSS:
// in srgb-linear the r, g and b keywords are linear light, so the WCAG
// weights give luminance directly.
const Y = '.2126 * r + .7152 * g + .0722 * b';
export const luminanceGrey = (css) => `color(from ${css} srgb-linear calc(${Y}) calc(${Y}) calc(${Y}))`;

// Desaturate a CSS colour by t (0 = unchanged, 1 = its luminance grey).
// Mixing in linear light keeps the luminance the same at every step, which is
// what the .grayscale filter does at full strength.
export const desaturate = (css, t) =>
  t <= 0 ? css : `color-mix(in srgb-linear, ${css}, ${luminanceGrey(css)} ${t * 100}%)`;
