// Visible spectrum: frequency (THz) → OKLCH hue, chroma, natural lightness.
// Anchor points derived from spectral sRGB values via full OKLCH pipeline.
// Natural lightness = the L of that spectral colour at full sRGB saturation.
// Piecewise linear interpolation: the mapping is highly nonlinear.
const SPECTRUM = [
  // [freq_THz, hue°, chroma, natural_L]
  [430,  29.2, 0.258, 0.628],  // Red     700 nm
  [492,  42.0, 0.208, 0.690],  // Orange  610 nm
  [517,  95.3, 0.182, 0.887],  // Yellow  580 nm
  [566, 142.5, 0.295, 0.866],  // Green   530 nm
  [612, 194.8, 0.155, 0.905],  // Cyan    490 nm
  [652, 260.8, 0.241, 0.563],  // Blue    460 nm
  [714, 291.0, 0.293, 0.521],  // Violet  420 nm
];

export const FREQ_MIN = SPECTRUM[0][0];
export const FREQ_MAX = SPECTRUM[SPECTRUM.length - 1][0];

// Returns [hue, chroma, naturalL], all three interpolated from anchors.
export function freqToSpectrum(freq) {
  if (freq <= FREQ_MIN) return SPECTRUM[0].slice(1);
  if (freq >= FREQ_MAX) return SPECTRUM[SPECTRUM.length - 1].slice(1);
  for (let i = 1; i < SPECTRUM.length; i++) {
    if (freq <= SPECTRUM[i][0]) {
      const t = (freq - SPECTRUM[i - 1][0]) / (SPECTRUM[i][0] - SPECTRUM[i - 1][0]);
      return [1, 2, 3].map(k => SPECTRUM[i - 1][k] + t * (SPECTRUM[i][k] - SPECTRUM[i - 1][k]));
    }
  }
}

// Convert nanometres to THz using the speed of light in vacuum (nm/s).
export function wavelengthToSpectrum(nm) {
  return freqToSpectrum(299792.458 / nm);
}

export function spectralCSS(nm) {
  const [h, c, l] = wavelengthToSpectrum(nm);
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}
