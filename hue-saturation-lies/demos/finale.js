export function mount(container) {
  container.innerHTML = `<style>
    .fn-root { position:absolute; inset:0; display:grid; place-items:center; background:transparent; color:var(--ink); pointer-events:none; }
    .fn-stack { display:grid; justify-items:center; text-align:center; padding:3rem; opacity:0; background:rgba(0,0,0,.72); transition:opacity .6s; }
    .fn-display { margin:0; font:clamp(24px,4vw,48px)/1.5 var(--font-display); letter-spacing:var(--tracking-caps); color:#fff; }
    .fn-visible .fn-stack { opacity:1; }
    @media(prefers-reduced-motion:reduce) { .fn-stack { transition:none; } }
  </style><div class="fn-root demo-root"><div class="fn-stack"><p class="fn-display">What could you make from there?</p></div></div>`;
  const root = container.querySelector('.fn-root');
  function step(n) { root.classList.toggle('fn-visible', n >= 1); }
  step(0);
  return { step, cleanup() { container.replaceChildren(); } };
}
