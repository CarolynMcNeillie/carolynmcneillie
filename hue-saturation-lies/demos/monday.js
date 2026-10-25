import { oklchToLinearRGB } from './colour-utils.js';

// WCAG 2 relative luminance of the sRGB-rendered button colour.
// These four colours are inside sRGB; their linear channels need no clipping.
export function labelContrast(L, H) {
  const [r, g, b] = oklchToLinearRGB(L, 0.1, H);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (luminance + 0.05); // white label
}

export function mount(container) {
  container.innerHTML = `<style>
    .mon { background:var(--scrim); color:var(--ink); display:grid; place-content:center; gap:1.5rem; padding:5vw; }
    .mon h2 { font:clamp(24px,3vw,44px)/1.3 var(--font-display); margin:0; }
    .mon code { font:clamp(15px,1.5vw,22px)/1.5 var(--font-code); white-space:pre-wrap; }
    .mon-examples { display:grid; gap:1rem; }
    .mon-pair { display:flex; gap:1rem; flex-wrap:wrap; }
    .mon-state { display:grid; gap:.35rem; flex:1; min-width:160px; }
    .mon-state span { font:clamp(15px,1.3vw,20px) var(--font-body); }
    .mon-button { box-sizing:border-box; padding:1rem 2rem; border-radius:var(--radius); background:var(--base); color:white; font:clamp(18px,2vw,28px) var(--font-body); text-align:center; }
    .mon-hover { background:oklch(from var(--base) calc(l - 0.06) c h); }
    .mon aside { color:var(--ink-soft); border-top:1px solid var(--line); padding-top:1rem; font:clamp(18px,2vw,26px) var(--font-body); }
  </style><section class="mon demo-root"><h2>One colour. One relationship. One component.</h2><code>.button { --base: oklch(0.55 0.1 250); background: var(--base); }
.button:hover { background: oklch(from var(--base) calc(l - 0.06) c h); }</code><div class="mon-examples">
    <div class="mon-pair" style="--base:oklch(0.55 0.1 250)"><div class="mon-state"><span>Base · hue 250</span><div class="mon-button">Button</div></div><div class="mon-state"><span>Hover · hue 250</span><div class="mon-button mon-hover">Button</div></div></div>
    <div class="mon-pair" style="--base:oklch(0.55 0.1 145)"><div class="mon-state"><span>Base · hue 145</span><div class="mon-button">Button</div></div><div class="mon-state"><span>Hover · hue 145</span><div class="mon-button mon-hover">Button</div></div></div>
    </div><aside>Then check: gamut · contrast · context</aside></section>`;
  return { cleanup() { container.replaceChildren(); } };
}
