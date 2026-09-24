// ── CIE 1931 xy Chromaticity Diagram ────────────────────────────────────────

// CIE 1931 spectral locus, 380–700 nm at 5 nm steps [x, y]
const LOCUS = [
  [0.1741, 0.0050], // 380
  [0.1740, 0.0050], // 385
  [0.1738, 0.0049], // 390
  [0.1736, 0.0049], // 395
  [0.1733, 0.0048], // 400
  [0.1730, 0.0048], // 405
  [0.1726, 0.0048], // 410
  [0.1721, 0.0048], // 415
  [0.1714, 0.0051], // 420
  [0.1703, 0.0058], // 425
  [0.1689, 0.0069], // 430
  [0.1669, 0.0086], // 435
  [0.1644, 0.0109], // 440
  [0.1611, 0.0138], // 445
  [0.1566, 0.0177], // 450
  [0.1510, 0.0227], // 455
  [0.1440, 0.0297], // 460
  [0.1355, 0.0399], // 465
  [0.1241, 0.0578], // 470
  [0.1096, 0.0868], // 475
  [0.0913, 0.1327], // 480
  [0.0687, 0.2007], // 485
  [0.0454, 0.2950], // 490
  [0.0235, 0.4127], // 495
  [0.0082, 0.5384], // 500
  [0.0039, 0.6548], // 505
  [0.0139, 0.7502], // 510
  [0.0389, 0.8120], // 515
  [0.0743, 0.8338], // 520
  [0.1142, 0.8262], // 525
  [0.1547, 0.8059], // 530
  [0.1929, 0.7816], // 535
  [0.2296, 0.7543], // 540
  [0.2658, 0.7243], // 545
  [0.3016, 0.6923], // 550
  [0.3373, 0.6589], // 555
  [0.3731, 0.6245], // 560
  [0.4087, 0.5896], // 565
  [0.4441, 0.5547], // 570
  [0.4788, 0.5202], // 575
  [0.5125, 0.4866], // 580
  [0.5448, 0.4544], // 585
  [0.5752, 0.4242], // 590
  [0.6029, 0.3965], // 595
  [0.6270, 0.3725], // 600
  [0.6482, 0.3514], // 605
  [0.6658, 0.3340], // 610
  [0.6801, 0.3197], // 615
  [0.6915, 0.3083], // 620
  [0.7006, 0.2993], // 625
  [0.7079, 0.2920], // 630
  [0.7140, 0.2859], // 635
  [0.7190, 0.2809], // 640
  [0.7230, 0.2770], // 645
  [0.7260, 0.2740], // 650
  [0.7283, 0.2717], // 655
  [0.7300, 0.2700], // 660
  [0.7311, 0.2689], // 665
  [0.7320, 0.2680], // 670
  [0.7327, 0.2673], // 675
  [0.7334, 0.2666], // 680
  [0.7340, 0.2660], // 685
  [0.7344, 0.2656], // 690
  [0.7346, 0.2654], // 695
  [0.7347, 0.2653], // 700
];

// ── Gamut definitions ─────────────────────────────────────────────────────────
const GAMUTS = [
  {
    id: 'srgb',
    label: 'sRGB',
    // R, G, B primaries in CIE xy
    primaries: [[0.640, 0.330], [0.300, 0.600], [0.150, 0.060]],
    stroke: 'rgba(255,255,255,0.9)',
    labelOffsets: [[10, -4], [-20, -10], [-20, 12]],
  },
  {
    id: 'p3',
    label: 'Display P3',
    primaries: [[0.680, 0.320], [0.265, 0.690], [0.150, 0.060]],
    stroke: 'rgba(255,200,80,0.95)',
    labelOffsets: [[10, -4], [-20, -10], [-20, 12]],
  },
  {
    id: 'rec2020',
    label: 'Rec. 2020',
    primaries: [[0.708, 0.292], [0.170, 0.797], [0.131, 0.046]],
    stroke: 'rgba(100,230,255,0.95)',
    labelOffsets: [[10, -4], [-24, -10], [-24, 12]],
  },
];

// ── Colour math ───────────────────────────────────────────────────────────────

function inPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi))
      inside = !inside;
  }
  return inside;
}

function buildPolygon() { return [...LOCUS, LOCUS[0]]; }

function xyzToLinearSRGB(X, Y, Z) {
  return [
     3.2404542*X - 1.5371385*Y - 0.4985314*Z,
    -0.9692660*X + 1.8760108*Y + 0.0415560*Z,
     0.0556434*X - 0.2040259*Y + 1.0572252*Z,
  ];
}

function linearToSRGB(c) {
  return c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c, 1/2.4) - 0.055;
}

function mapToSRGB(X, Y, Z) {
  const Xw = 0.3127/0.3290, Yw = 1, Zw = (1 - 0.3127 - 0.3290)/0.3290;
  let [r, g, b] = xyzToLinearSRGB(X, Y, Z);
  if (r < 0 || g < 0 || b < 0) {
    let lo = 0, hi = 1;
    for (let iter = 0; iter < 30; iter++) {
      const t = (lo + hi) * 0.5;
      [r, g, b] = xyzToLinearSRGB(X + (Xw-X)*t, Y + (Yw-Y)*t, Z + (Zw-Z)*t);
      if (r < -1e-5 || g < -1e-5 || b < -1e-5) lo = t; else hi = t;
    }
  }
  const maxC = Math.max(r, g, b);
  if (maxC > 1) { r /= maxC; g /= maxC; b /= maxC; }
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  return [
    Math.round(linearToSRGB(r) * 255),
    Math.round(linearToSRGB(g) * 255),
    Math.round(linearToSRGB(b) * 255),
  ];
}

// ── Layout constants (shared between drawBase and drawGamut) ──────────────────
const X0 = 0, X1 = 0.78, Y0 = 0, Y1 = 0.90;
const ML = 48, MB = 40, MR = 16, MT = 16;

function makeToPixel(W, H) {
  const DW = W - ML - MR, DH = H - MT - MB;
  return (cx, cy) => [
    ML + ((cx - X0) / (X1 - X0)) * DW,
    MT + (1 - (cy - Y0) / (Y1 - Y0)) * DH,
  ];
}

// ── Base draw: rasterise + chrome (slow — cache to offscreen canvas) ──────────
function drawBase(canvas) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const DW = W - ML - MR, DH = H - MT - MB;
  const toPixel = makeToPixel(W, H);
  const poly = buildPolygon();

  const imageData = ctx.createImageData(W, H);
  const data = imageData.data;

  for (let py = MT; py < MT + DH; py++) {
    for (let px = ML; px < ML + DW; px++) {
      const cx = X0 + ((px - ML) / DW) * (X1 - X0);
      const cy = Y0 + (1 - (py - MT) / DH) * (Y1 - Y0);
      if (!inPolygon(cx, cy, poly) || cy < 1e-6) continue;
      const [r, g, b] = mapToSRGB(cx / cy, 1, (1 - cx - cy) / cy);
      const idx = (py * W + px) * 4;
      data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Spectral locus outline
  ctx.beginPath();
  for (let i = 0; i < LOCUS.length; i++) {
    const [px, py] = toPixel(LOCUS[i][0], LOCUS[i][1]);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // D65 white point
  const [wpx, wpy] = toPixel(0.3127, 0.3290);
  ctx.beginPath();
  ctx.arc(wpx, wpy, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.textAlign = 'left';
  ctx.fillText('D65', wpx + 6, wpy + 4);

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ML, MT + DH); ctx.lineTo(ML + DW, MT + DH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ML, MT);      ctx.lineTo(ML, MT + DH);      ctx.stroke();

  ctx.font = '500 11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'center';
  ctx.fillText('x', ML + DW / 2, H - 8);
  ctx.save();
  ctx.translate(12, MT + DH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('y', 0, 0);
  ctx.restore();

  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let v = 0.1; v < 0.75; v += 0.1) {
    const px = ML + ((v - X0) / (X1 - X0)) * DW;
    ctx.textAlign = 'center';
    ctx.fillText(v.toFixed(1), px, MT + DH + 14);
  }
  ctx.textAlign = 'right';
  for (let v = 0.1; v < 0.85; v += 0.1) {
    const py = MT + (1 - (v - Y0) / (Y1 - Y0)) * DH;
    ctx.fillText(v.toFixed(1), ML - 4, py + 4);
  }

  // Wavelength ticks
  const TICK_NM = [460, 470, 480, 490, 500, 510, 520, 530, 540, 560, 580, 600, 620, 660, 700];
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  for (const nm of TICK_NM) {
    const idx = Math.round((nm - 380) / 5);
    if (idx < 0 || idx >= LOCUS.length) continue;
    const [lx, ly] = LOCUS[idx];
    const [px, py] = toPixel(lx, ly);
    const dx = lx - 0.33, dy = ly - 0.33;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = dx/len, ny = -dy/len;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + nx*5, py + ny*5); ctx.stroke();
    ctx.textAlign = nx > 0 ? 'left' : 'right';
    ctx.fillText(nm, px + nx*14, py + ny*14 + 3);
  }
}

// ── Gamut overlay: blit base + darken outside selected triangle ───────────────
function drawGamut(canvas, offscreen, gamut) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const toPixel = makeToPixel(W, H);

  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(offscreen, 0, 0);

  if (!gamut) return;

  // Even-odd compound path: horseshoe (outer) + triangle (inner).
  // Pixels inside the horseshoe but outside the triangle are filled once (odd)
  // → darkened. Pixels inside both are filled twice (even) → untouched.
  ctx.beginPath();
  for (let i = 0; i < LOCUS.length; i++) {
    const [px, py] = toPixel(LOCUS[i][0], LOCUS[i][1]);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  for (let i = 0; i < 3; i++) {
    const [px, py] = toPixel(gamut.primaries[i][0], gamut.primaries[i][1]);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fill('evenodd');

  // Triangle outline
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const [px, py] = toPixel(gamut.primaries[i][0], gamut.primaries[i][1]);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = gamut.stroke;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Primary labels
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.fillStyle = gamut.stroke;
  for (let i = 0; i < 3; i++) {
    const [px, py] = toPixel(gamut.primaries[i][0], gamut.primaries[i][1]);
    const [dx, dy] = gamut.labelOffsets[i];
    ctx.textAlign = dx > 0 ? 'left' : 'right';
    ctx.fillText(['R', 'G', 'B'][i], px + dx, py + dy);
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────
export function mount(container) {
  container.innerHTML = `
    <style>
      .cie-wrap {
        position: absolute; inset: 0;
        background: #111;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 1rem;
      }
      .cie-canvas { display: block; }
      .cie-buttons {
        display: flex; gap: 0.6rem;
      }
      .cie-btn {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        color: rgba(255,255,255,0.55);
        font: 0.6rem/1 'Silkscreen', monospace;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.5em 1em;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .cie-btn:hover { background: rgba(255,255,255,0.13); color: rgba(255,255,255,0.8); }
      .cie-btn.active { color: #fff; border-color: var(--btn-color, #fff); background: rgba(255,255,255,0.12); }
    </style>
    <div class="cie-wrap">
      <canvas class="cie-canvas"></canvas>
      <div class="cie-buttons">
        ${GAMUTS.map(g => `<button class="cie-btn" data-id="${g.id}">${g.label}</button>`).join('')}
      </div>
    </div>
  `;

  const canvas    = container.querySelector('canvas');
  const offscreen = document.createElement('canvas');
  let selectedId  = null;

  function getGamut() { return GAMUTS.find(g => g.id === selectedId) ?? null; }

  function redraw() { drawGamut(canvas, offscreen, getGamut()); }

  function resize() {
    const W = container.clientWidth  || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;
    const btnH = 48;
    const size = Math.min(W - 20, H - btnH - 28, 680);
    canvas.width = offscreen.width  = size;
    canvas.height = offscreen.height = Math.round(size * 0.88);
    drawBase(offscreen);
    redraw();
  }

  container.querySelectorAll('.cie-btn').forEach(btn => {
    const gamut = GAMUTS.find(g => g.id === btn.dataset.id);
    btn.style.setProperty('--btn-color', gamut.stroke.replace(/,[^,]+\)$/, ',1)'));
    btn.addEventListener('click', () => {
      selectedId = selectedId === btn.dataset.id ? null : btn.dataset.id;
      container.querySelectorAll('.cie-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.id === selectedId));
      redraw();
    });
  });

  let resizeTimer;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
  window.addEventListener('resize', onResize);
  resize();

  return () => {
    window.removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);
    container.innerHTML = '';
  };
}
