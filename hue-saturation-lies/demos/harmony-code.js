export function mount(container) {
  container.innerHTML = `<style>
    .hc { background:var(--scrim); color:var(--ink); display:grid; place-content:center; gap:2rem; padding:4vw; }
    .hc code { white-space:pre-wrap; font:clamp(18px,2.5vw,34px)/1.5 var(--font-code); }
    .hc-swatches { display:flex; gap:1rem; }
    .hc-swatch { width:clamp(120px,22vw,260px); aspect-ratio:1; border-radius:var(--radius); display:flex; align-items:end; padding:1rem; box-sizing:border-box; }
    .hc-base { background:var(--base); } .hc-opposite { background:var(--opposite); }
    .hc-composition { height:clamp(90px,16vh,170px); border-radius:var(--radius); background:oklch(from var(--base) l calc(c * 0.35) h); display:flex; align-items:center; justify-content:flex-end; padding:1.5rem; }
    .hc-accent { width:clamp(36px,5vw,70px); aspect-ratio:1; border-radius:50%; background:var(--opposite); }
    .hc { --base:oklch(0.7 0.15 250); --opposite:oklch(from var(--base) l c calc(h + 180)); }
  </style><section class="hc demo-root" aria-label="Opposite hues with CSS relative colour syntax"><code>--opposite:\n  oklch(from var(--base) l c calc(h + 180));</code><div class="hc-swatches"><div class="hc-swatch hc-base"><span>--base</span></div><div class="hc-swatch hc-opposite"><span>--opposite</span></div></div><div class="hc-composition" aria-label="Quieter base hue field with opposite hue accent"><div class="hc-accent" aria-hidden="true"></div></div></section>`;
  return { cleanup() { container.replaceChildren(); } };
}
