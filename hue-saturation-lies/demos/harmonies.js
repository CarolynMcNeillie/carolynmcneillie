// ── OKLCH Harmonies Demo ─────────────────────────────────────────────────────
// Colour wheel showing OKLCH harmony relationships as spokes on a wheel.
// Drag the wheel to rotate the base hue.

const MODES = [
  {
    id: "complementary",
    label: "Complementary",
    desc: "One step across the wheel. Pure contrast.",
    offsets: [0, 180],
  },
  {
    id: "analogous",
    label: "Analogous",
    desc: "Neighbours on the wheel. Natural harmony.",
    offsets: [-30, 0, 30],
  },
  {
    id: "triadic",
    label: "Triadic",
    desc: "Three colours, 120° apart. Balanced energy.",
    offsets: [0, 120, 240],
  },
  {
    id: "split",
    label: "Split-complementary",
    desc: "Base + the two neighbours of its complement.",
    offsets: [0, 150, 210],
  },
  {
    id: "tetradic",
    label: "Tetradic",
    desc: "Four colours, 90° apart. Rich and complex.",
    offsets: [0, 90, 180, 270],
  },
];

const OKL = 0.68,
  OKC = 0.18;

export function mount(container) {
  let hue = 200;
  let modeIdx = 0;
  let dragging = false;

  container.innerHTML = `
    <style>
      .har-wrap {
        position: absolute; inset: 0;
        background: #111;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 1rem;
        padding: 1.2rem 2rem 1.5rem;
        font-family: 'Silkscreen', monospace;
        box-sizing: border-box;
      }
      #har-canvas { display: block; cursor: crosshair; flex-shrink: 0; }
      .har-modes {
        display: flex; gap: 0.4rem; flex-wrap: wrap;
        justify-content: center;
        width: min(560px, 92vw);
        flex-shrink: 0;
      }
      .har-mode-btn {
        background: none;
        border: 1px solid rgba(255,255,255,0.15);
        color: rgba(255,255,255,0.4);
        font-family: 'Silkscreen', monospace;
        font-size: 0.42rem; letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.4rem 0.75rem; border-radius: 2px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .har-mode-btn.active {
        border-color: rgba(255,255,255,0.6);
        color: rgba(255,255,255,0.9);
        background: rgba(255,255,255,0.07);
      }
      .har-swatches {
        display: flex; gap: 6px;
        width: min(560px, 92vw);
        flex-shrink: 0;
      }
      .har-swatch {
        flex: 1; height: 52px; border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      .har-desc {
        font-size: 0.48rem; letter-spacing: 0.08em; text-transform: uppercase;
        color: rgba(255,255,255,0.3); text-align: center;
        max-width: 460px; line-height: 1.7;
        flex-shrink: 0;
      }
    </style>
    <div class="har-wrap" id="har-wrap">
      <canvas id="har-canvas" role="img" aria-label="OKLCH colour harmony wheel — drag to rotate hue"></canvas>
      <div class="har-swatches" id="har-swatches"></div>
      <div class="har-modes" id="har-modes"></div>
      <span class="har-desc" id="har-desc"></span>
    </div>
  `;

  const canvas = container.querySelector("#har-canvas");
  const wrap = container.querySelector("#har-wrap");
  const modesEl = container.querySelector("#har-modes");
  const descEl = container.querySelector("#har-desc");
  const swatchesEl = container.querySelector("#har-swatches");
  const ctx = canvas.getContext("2d");

  // Build mode buttons
  MODES.forEach((m, i) => {
    const btn = document.createElement("button");
    btn.className = "har-mode-btn" + (i === 0 ? " active" : "");
    btn.setAttribute("aria-pressed", String(i === 0));
    btn.textContent = m.label;
    btn.addEventListener("click", () => {
      modeIdx = i;
      draw();
    });
    modesEl.appendChild(btn);
  });

  function activeHues() {
    return MODES[modeIdx].offsets.map((o) => (((hue + o) % 360) + 360) % 360);
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.width / dpr;
    const cx = size / 2,
      cy = size / 2;
    const R = size * 0.42; // outer radius of wheel ring
    const Ri = size * 0.26; // inner radius of wheel ring (donut hole)
    const dotR = Math.max(7, size * 0.026);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // ── Full spectrum ring ───────────────────────────────────────────────────
    for (let deg = 0; deg < 360; deg++) {
      const a0 = ((deg - 90 - 0.7) * Math.PI) / 180;
      const a1 = ((deg - 90 + 1.2) * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.arc(cx, cy, Ri, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = `oklch(${OKL} ${OKC} ${deg})`;
      ctx.fill();
    }

    const hues = activeHues();

    // ── Connecting polygon ───────────────────────────────────────────────────
    if (hues.length > 1) {
      ctx.beginPath();
      hues.forEach((h, i) => {
        const a = ((h - 90) * Math.PI) / 180;
        const x = cx + Ri * 0.85 * Math.cos(a);
        const y = cy + Ri * 0.85 * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ── Spokes + dots ────────────────────────────────────────────────────────
    hues.forEach((h, i) => {
      const a = ((h - 90) * Math.PI) / 180;
      const color = `oklch(${OKL} ${OKC} ${h})`;
      const ex = cx + R * Math.cos(a);
      const ey = cy + R * Math.sin(a);

      // Spoke (center → outer ring edge)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (Ri - 2) * Math.cos(a), cy + (Ri - 2) * Math.sin(a));
      ctx.strokeStyle = color;
      ctx.lineWidth = i === 0 ? 3 : 2;
      ctx.stroke();

      // Dot on outer ring
      ctx.beginPath();
      ctx.arc(ex, ey, dotR, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = i === 0 ? "white" : "rgba(255,255,255,0.65)";
      ctx.lineWidth = i === 0 ? 2.5 : 1.5;
      ctx.stroke();
    });

    // ── Centre ───────────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, dotR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();

    ctx.restore();

    // Update swatches
    if (swatchesEl.children.length !== hues.length) {
      swatchesEl.innerHTML = "";
      hues.forEach(() => {
        const el = document.createElement("div");
        el.className = "har-swatch";
        swatchesEl.appendChild(el);
      });
    }
    swatchesEl.querySelectorAll(".har-swatch").forEach((el, i) => {
      el.style.backgroundColor = `oklch(${OKL} ${OKC} ${hues[i]})`;
    });

    // Update buttons + description
    modesEl
      .querySelectorAll(".har-mode-btn")
      .forEach((btn, i) => {
        btn.classList.toggle("active", i === modeIdx);
        btn.setAttribute("aria-pressed", String(i === modeIdx));
      });
    const mode = MODES[modeIdx];
    descEl.textContent = mode.desc + "  ·  All at OKLCH L=0.68 C=0.18.";
  }

  // ── Sizing ──────────────────────────────────────────────────────────────────
  function resize() {
    const wrapRect = wrap.getBoundingClientRect();
    // Rough fixed height for buttons row + desc + gaps + padding
    const reserved = 120;
    const sz = Math.min(wrapRect.width - 40, wrapRect.height - reserved, 500);
    if (sz < 10) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = sz + "px";
    canvas.style.height = sz + "px";
    canvas.width = Math.round(sz * dpr);
    canvas.height = Math.round(sz * dpr);
    draw();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);

  // ── Drag to rotate base hue ─────────────────────────────────────────────────
  function hueFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    return ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360;
  }

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    hue = hueFromPointer(e);
    draw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    hue = hueFromPointer(e);
    draw();
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });
  canvas.addEventListener("pointercancel", () => {
    dragging = false;
  });

  return () => {
    ro.disconnect();
    container.innerHTML = "";
  };
}
