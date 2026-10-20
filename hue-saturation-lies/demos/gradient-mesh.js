// A full-stage gradient mesh of real "burou" colours, the Himba term that
// covers what English splits into green and blue. Static, so there is
// nothing to stop under reduced motion.
//
// Source: Roberson, Davidoff, Davies and Shapiro (2005), "Color categories:
// Evidence for the cultural relativity hypothesis", Cognitive Psychology 50,
// 378-411, Appendix II. Every chip here is Munsell Value 5, Chroma 8, and
// 92% to 96% of Himba speakers named it "burou" (7.5GY, at 18%, is where
// burou ends). Colours are the 1943 Munsell renotation xyY (Illuminant C),
// adapted to D65 with Bradford and converted to OKLCH. Most sit slightly
// outside sRGB; an sRGB screen maps them just inside.
const CHIPS = {
  "10GY": "oklch(0.571 0.129 143.5)",
  "2.5G": "oklch(0.569 0.125 155.8)",
  "5G": "oklch(0.569 0.123 164.0)",
  "10G": "oklch(0.568 0.122 175.2)",
  "7.5BG": "oklch(0.569 0.124 195.6)", // English speakers: 51% "blue"
  "10BG": "oklch(0.570 0.126 203.2)",
  "2.5B": "oklch(0.571 0.125 209.9)",
  "5B": "oklch(0.573 0.122 218.1)",
  "7.5B": "oklch(0.575 0.115 225.8)",
};

// English "green" on the left, English "blue" on the right; the word sits on
// the chip English speakers split down the middle. The first layer draws on
// top, so the centre spot sets the colour behind the word.
const SPOTS = [
  // [x%, y%, size%, chip]
  [50, 50, 35, "7.5BG"],
  [0, 20, 55, "10GY"],
  [12, 85, 55, "2.5G"],
  [28, 8, 45, "5G"],
  [34, 70, 40, "10G"],
  [66, 15, 45, "10BG"],
  [70, 88, 50, "2.5B"],
  [88, 40, 50, "5B"],
  [100, 80, 55, "7.5B"],
];

// The word's text takes the higher-contrast of black or white against the
// centre chip.
const CENTRE = CHIPS["7.5BG"];

export function mount(container) {
  // Each spot fades to its own colour at zero alpha. Fading to `transparent`
  // (transparent black) gives dark halos in WebKit.
  const clear = (colour) => colour.replace(")", " / 0)");
  const layers = SPOTS.map(([x, y, size, chip]) =>
    `radial-gradient(circle at ${x}% ${y}%, ${CHIPS[chip]} 0%, ${clear(CHIPS[chip])} ${size}%)`);
  container.innerHTML = `
    <style>
      .gm-word {
        position: absolute; inset: 0; display: grid; place-items: center; margin: 0;
        font: 96px/1 var(--font-display);
        letter-spacing: var(--tracking-caps);
        color: var(--ink);
        color: contrast-color(${CENTRE});
      }
    </style>
    <div class="gm-mesh demo-root" aria-hidden="true"></div>
    <p class="gm-word" lang="hz">burou</p>`;
  const mesh = container.querySelector(".gm-mesh");
  mesh.style.background = `${layers.join(", ")}, ${CENTRE}`;
  return () => { container.innerHTML = ""; };
}
