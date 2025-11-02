/**
 * Color system using OKLCH for perceptually uniform colors
 * and guaranteed WCAG AA accessibility
 *
 * Generates harmonious color palettes from a single base hue
 */

// Base hue for the color scheme (0-360)
// Randomized on each page load for variety!
const BASE_HUE = Math.floor(Math.random() * 360);

// OKLCH to RGB conversion
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // Convert OKLCH to OKLab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab to linear RGB
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  // Gamma correction (linear RGB to sRGB)
  const gammaCorrect = (c: number) => {
    return c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };

  return [
    Math.max(0, Math.min(1, gammaCorrect(r))),
    Math.max(0, Math.min(1, gammaCorrect(g))),
    Math.max(0, Math.min(1, gammaCorrect(b_))),
  ];
}

// Calculate relative luminance (for contrast ratio)
function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate WCAG contrast ratio
function contrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const lum1 = relativeLuminance(rgb1);
  const lum2 = relativeLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate harmonious color palette from base hue
 *
 * Rules:
 * - Deep color: Base hue, dark (L=22%), low chroma for subtlety
 * - Medium color: Same hue, slightly lighter (L=28%) - tonal harmony
 * - Accent color: Complementary offset (150-210° away) for contrast
 * - All colors maintain WCAG AA contrast with white text (L=95%)
 */
function generateColorPalette(baseHue: number) {
  // Normalize hue to 0-360
  const normalizedHue = ((baseHue % 360) + 360) % 360;

  // Accent is offset by ~180° (complementary) with some variation for interest
  // Using 165° instead of exactly 180° for more sophisticated harmony
  const accentHue = (normalizedHue + 165) % 360;

  return {
    // Background: Very dark neutral (low chroma, slightly tinted toward base hue)
    dark: { l: 0.15, c: 0.02, h: normalizedHue },

    // Deep color: Base hue, dark but visible
    medium: { l: 0.22, c: 0.04, h: normalizedHue },

    // Accent color: Complementary hue, similar lightness for balance
    light: { l: 0.28, c: 0.03, h: accentHue },

    // Text: Near white with minimal warmth
    white: { l: 0.95, c: 0.01, h: 60 },
  };
}

// Generate color definitions from base hue
export const colorDefinitions = generateColorPalette(BASE_HUE);

// Convert all colors to RGB
export const colors = {
  dark: oklchToRgb(
    colorDefinitions.dark.l,
    colorDefinitions.dark.c,
    colorDefinitions.dark.h
  ),
  medium: oklchToRgb(
    colorDefinitions.medium.l,
    colorDefinitions.medium.c,
    colorDefinitions.medium.h
  ),
  light: oklchToRgb(
    colorDefinitions.light.l,
    colorDefinitions.light.c,
    colorDefinitions.light.h
  ),
  white: oklchToRgb(
    colorDefinitions.white.l,
    colorDefinitions.white.c,
    colorDefinitions.white.h
  ),
};

// Format RGB for CSS
export function rgbToCss(rgb: [number, number, number]): string {
  return `rgb(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)})`;
}

// Format RGB for GLSL (0-1 range)
export function rgbToGlsl(rgb: [number, number, number]): string {
  return `vec3(${rgb[0].toFixed(3)}, ${rgb[1].toFixed(3)}, ${rgb[2].toFixed(3)})`;
}

// Verify accessibility (for development)
export function verifyAccessibility() {
  const results = {
    textOnDark: contrastRatio(colors.white, colors.dark),
    lightOnDark: contrastRatio(colors.light, colors.dark),
    mediumOnDark: contrastRatio(colors.medium, colors.dark),
  };
  return results;
}

// Export formatted colors
export const cssColors = {
  dark: rgbToCss(colors.dark),
  medium: rgbToCss(colors.medium),
  light: rgbToCss(colors.light),
  white: rgbToCss(colors.white),
};

export const glslColors = {
  dark: rgbToGlsl(colors.dark),
  medium: rgbToGlsl(colors.medium),
  light: rgbToGlsl(colors.light),
  white: rgbToGlsl(colors.white),
};
