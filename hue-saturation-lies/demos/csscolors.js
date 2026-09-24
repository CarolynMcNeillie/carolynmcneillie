// ── Named CSS Colours ────────────────────────────────────────────────────────
// All 148 CSS named colours (CSS Color Level 4).
// RGB values resolved at runtime via the browser's CSS parser.

const COLOR_NAMES = [
  'aliceblue','antiquewhite','aqua','aquamarine','azure','beige','bisque',
  'black','blanchedalmond','blue','blueviolet','brown','burlywood','cadetblue',
  'chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan',
  'darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey',
  'darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred',
  'darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey',
  'darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey',
  'dodgerblue','firebrick','floralwhite','forestgreen','fuchsia','gainsboro',
  'ghostwhite','gold','goldenrod','gray','green','greenyellow','grey',
  'honeydew','hotpink','indianred','indigo','ivory','khaki','lavender',
  'lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan',
  'lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink',
  'lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey',
  'lightsteelblue','lightyellow','lime','limegreen','linen','magenta','maroon',
  'mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen',
  'mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred',
  'midnightblue','mintcream','mistyrose','moccasin','navajowhite','navy',
  'oldlace','olive','olivedrab','orange','orangered','orchid','palegoldenrod',
  'palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru',
  'pink','plum','powderblue','purple','rebeccapurple','red','rosybrown',
  'royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell',
  'sienna','silver','skyblue','slateblue','slategray','slategrey','snow',
  'springgreen','steelblue','tan','teal','thistle','tomato','turquoise',
  'violet','wheat','white','whitesmoke','yellow','yellowgreen',
];

// Use the browser's CSS parser to resolve each name to [r, g, b] 0-255.
function resolveColors() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;width:0;height:0';
  document.body.appendChild(probe);
  const result = COLOR_NAMES.map(name => {
    probe.style.backgroundColor = name;
    const s = getComputedStyle(probe).backgroundColor; // "rgb(r, g, b)"
    const m = s.match(/\d+/g);
    return { name, r: +m[0], g: +m[1], b: +m[2] };
  });
  document.body.removeChild(probe);
  return result;
}

// RGB → HSL hue (0–360), saturation (0–1), lightness (0–1)
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  switch (max) {
    case r: h = ((g - b) / d + 6) % 6; break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4; break;
  }
  return { h: h * 60, s, l };
}

// Sort colours by hue; neutrals (low saturation or near-white/black) go last
function sortByHue(colors) {
  const chromatic = [], neutral = [];
  for (const c of colors) {
    const { h, s, l } = rgbToHsl(c.r, c.g, c.b);
    if (s < 0.08 || l < 0.06 || l > 0.94) {
      neutral.push({ ...c, h, s, l });
    } else {
      chromatic.push({ ...c, h, s, l });
    }
  }
  chromatic.sort((a, b) => a.h - b.h);
  neutral.sort((a, b) => a.l - b.l);
  return [...chromatic, ...neutral];
}

// WCAG relative luminance of an sRGB channel (0–255)
function srgbLuminance(c8) {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relativeLuminance(r, g, b) {
  return 0.2126 * srgbLuminance(r) + 0.7152 * srgbLuminance(g) + 0.0722 * srgbLuminance(b);
}
// Returns '#000' or '#fff' — whichever gives higher contrast against the bg
function legibleTextColor(r, g, b) {
  const L = relativeLuminance(r, g, b);
  const contrastBlack = (L + 0.05) / 0.05;
  const contrastWhite = 1.05 / (L + 0.05);
  return contrastBlack >= contrastWhite ? '#000' : '#fff';
}

export function mount(container) {
  const colors = sortByHue(resolveColors());

  container.innerHTML = `
    <style>
      .cc-wrap {
        position: fixed; inset: 0;
        overflow: hidden;
        background: #111;
      }
      .cc-grid {
        display: grid;
        width: 100%; height: 100%;
      }
      .cc-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .cc-name {
        font: 0.5rem/1.2 'Silkscreen', monospace;
        letter-spacing: 0.02em;
        text-align: center;
        word-break: break-word;
      }
    </style>
    <div class="cc-wrap">
      <div class="cc-grid" id="cc-grid"></div>
    </div>
  `;

  const grid = container.querySelector('#cc-grid');

  for (const { name, r, g, b } of colors) {
    const cell = document.createElement('div');
    cell.className = 'cc-cell';
    cell.style.backgroundColor = name;
    const label = document.createElement('span');
    label.className = 'cc-name';
    label.textContent = name;
    label.style.color = legibleTextColor(r, g, b);
    cell.appendChild(label);
    grid.appendChild(cell);
  }

  // Find column count that makes cells as square as possible for the given viewport
  function applyGrid() {
    const W = window.innerWidth, H = window.innerHeight;
    const count = colors.length;
    let bestCols = 1, bestScore = Infinity;
    const TARGET_RATIO = 3; // cells should be ~3× wider than tall
    for (let cols = 1; cols <= count; cols++) {
      const rows = Math.ceil(count / cols);
      const cellW = W / cols, cellH = H / rows;
      const score = Math.abs(Math.log((cellW / cellH) / TARGET_RATIO));
      if (score < bestScore) { bestScore = score; bestCols = cols; }
    }
    const rows = Math.ceil(count / bestCols);
    grid.style.gridTemplateColumns = `repeat(${bestCols}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
  }

  applyGrid();
  window.addEventListener('resize', applyGrid);

  return () => {
    window.removeEventListener('resize', applyGrid);
    container.innerHTML = '';
  };
}
