// A colour-design analogy to glazing, not a physical pigment simulation.
const NAMES = ['Mix towards black in sRGB', 'Lower OKLCH L', 'Lower L, reduce C, shift H'];
function expressions(i) {
  const delta = (i * 0.07).toFixed(2);
  return [
    `color-mix(in srgb, var(--color), black ${i * 14}%)`,
    `oklch(from var(--color) calc(l - ${delta}) c h)`,
    `oklch(from var(--color) calc(l - ${delta}) calc(c * ${(1 - i * 0.08).toFixed(2)}) calc(h + ${i * 5}))`,
  ];
}
export function mount(container, type) {
  let hue = 30, selected = 4, rowSelected = 2;
  let dragging = false;
  const stops = Array.from({ length: 25 }, (_, i) => `oklch(0.72 0.12 ${i * 15}) ${i * 15}deg`).join(', ');
  container.innerHTML = `
    <style>
      .tg { background: var(--scrim); color: var(--ink); padding: 44px 5vw; display: flex; flex-direction: column; gap: 20px; font-family: var(--font-body); }
      .tg-controls { align-self: flex-end; }
      .tg-wheel { width: 112px; height: 112px; position: relative; border-radius: 50%; cursor: crosshair; touch-action: none; background: conic-gradient(${stops}); }
      .tg-wheel::before { content: ''; position: absolute; inset: 16px; border-radius: 50%; background: var(--scrim); pointer-events: none; }
      .tg-wheel:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }
      .tg-marker { position: absolute; left: 50%; top: 50%; width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--ink); transform: translate(-50%, -50%); pointer-events: none; box-shadow: 0 0 0 2px var(--scrim); }
      .tg-rows { flex: 1; min-height: 0; display: grid; gap: 16px; }
      .tg-row { min-height: 0; display: grid; grid-template-columns: 200px 1fr; gap: 16px; align-items: center; }
      .tg-label { font: var(--text-label)/1.4 var(--font-display); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--ink-soft); }
      .tg-swatches { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; height: 100%; }
      .tg-swatch { border: 0; border-radius: var(--radius); min-height: 75px; cursor: pointer; outline: 2px solid transparent; outline-offset: 2px; }
      .tg-swatch[aria-pressed="true"], .tg-swatch:focus-visible { outline-color: var(--ink); }
      .tg-detail { border-top: 1px solid var(--line); padding-top: 15px; display: grid; gap: 6px; }
      .tg-detail .css-tag { font-size: 18px; white-space: normal; overflow-wrap: anywhere; }
      @media (max-width: 900px) { .tg-row { grid-template-columns: 140px 1fr; } .tg { padding: 24px; } }
      @media (max-width: 900px) and (max-height: 450px) {
        /* Keep the ramp above the code, with the wheel in its own corner. */
        .tg { padding: 10px 24px; gap: 6px; }
        .tg-controls { position: absolute; top: 8px; right: 24px; }
        .tg-wheel { width: 56px; height: 56px; }
        .tg-wheel::before { inset: 9px; }
        .tg-rows { margin-top: 52px; gap: 4px; }
        .tg-row { grid-template-columns: 130px 1fr; gap: 8px; }
        .tg-label { font-size: 12px; line-height: 1.15; }
        .tg-swatches { gap: 5px; }
        .tg-swatch { min-height: 32px; }
        .tg-detail { padding-top: 5px; gap: 2px; }
        .tg-detail .css-tag { font-size: 13px; line-height: 1.2; }
      }
      @media (max-width: 600px) {
        .tg { gap: 10px; }
        .tg-row { grid-template-columns: 145px 1fr; gap: 8px; }
        .tg-label { font-size: 12px; }
        .tg-swatches { gap: 5px; }
        .tg-detail .css-tag { font-size: 14px; }
      }
    </style>
    <section class="tg demo-root" aria-label="Glaze-like colour ramp">
      <div class="tg-controls"><div class="tg-wheel" data-no-swipe role="slider" tabindex="0" aria-label="Hue of the colour" aria-valuemin="0" aria-valuemax="359" aria-valuenow="30"><span class="tg-marker" aria-hidden="true"></span></div></div>
      <div class="tg-rows"></div><div class="tg-detail" aria-live="polite"></div>
    </section>`;
  const root = container.querySelector('.tg');
  const wheel = root.querySelector('.tg-wheel');
  const marker = root.querySelector('.tg-marker');
  function render() {
    const color = `oklch(0.72 0.12 ${hue})`;
    root.style.setProperty('--color', color);
    wheel.setAttribute('aria-valuenow', String(hue));
    const radians = hue * Math.PI / 180;
    marker.style.left = `${50 + 41 * Math.sin(radians)}%`;
    marker.style.top = `${50 - 41 * Math.cos(radians)}%`;
    root.querySelectorAll('.tg-swatch').forEach(button => {
      const row = Number(button.dataset.row), i = Number(button.dataset.index);
      button.style.background = expressions(i)[row];
      button.setAttribute('aria-label', `${NAMES[row]}, hue ${hue}, step ${i + 1}`);
      button.setAttribute('aria-pressed', String(i === selected && row === rowSelected));
    });
    const detail = root.querySelector('.tg-detail');
    const lines = [`--color: ${color};`, `background: ${expressions(selected)[rowSelected]};`];
    detail.replaceChildren(...lines.map(line => { const code = document.createElement('code'); code.className = 'css-tag'; code.textContent = line; return code; }));
  }
  function setHue(value) {
    hue = ((Math.round(value) % 360) + 360) % 360;
    render();
  }
  function pointHue(event) {
    const box = wheel.getBoundingClientRect();
    return (Math.atan2(event.clientX - box.left - box.width / 2, box.top + box.height / 2 - event.clientY) * 180 / Math.PI + 360) % 360;
  }
  wheel.addEventListener('pointerdown', event => {
    wheel.setPointerCapture(event.pointerId);
    dragging = true;
    setHue(pointHue(event));
  });
  wheel.addEventListener('pointermove', event => { if (dragging) setHue(pointHue(event)); });
  wheel.addEventListener('pointerup', () => { dragging = false; });
  wheel.addEventListener('pointercancel', () => { dragging = false; });
  wheel.addEventListener('lostpointercapture', () => { dragging = false; });
  wheel.addEventListener('keydown', event => {
    const next = { ArrowLeft: hue - 1, ArrowRight: hue + 1, Home: 0, End: 359 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    setHue(next);
  });
  const rows = root.querySelector('.tg-rows');
  NAMES.forEach((name, row) => {
      const section = document.createElement('div'); section.className = 'tg-row';
      const label = document.createElement('span'); label.className = 'tg-label'; label.textContent = name;
      const swatches = document.createElement('div'); swatches.className = 'tg-swatches';
      for (let i = 0; i < 6; i++) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'tg-swatch';
        button.dataset.row = row;
        button.dataset.index = i;
        button.addEventListener('click', () => { selected = i; rowSelected = row; render(); });
        swatches.append(button);
      }
    section.append(label, swatches); rows.append(section);
  });
  render();
  return () => container.replaceChildren();
}
