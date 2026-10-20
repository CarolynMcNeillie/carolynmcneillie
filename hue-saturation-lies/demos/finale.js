// The closing challenge. The stress decides the meaning ("CAN" do, can
// "DO"), so the two halves are Silkscreen lines and the stressed words step
// up from the soft ink to true white. The lead-in is a serif line in the
// subtitle style the title slide uses. Pure black, like the other title
// slides.
export function mount(container) {
  container.innerHTML = `
    <style>
      .fn-root {
        position: absolute; inset: 0; display: grid; place-items: center;
        background: #000;
      }
      .fn-stack { display: grid; gap: 1rem; justify-items: center; text-align: center; }
      .fn-serif { margin: 0; font: var(--text-subtitle)/1.3 var(--font-body); color: var(--ink-soft); }
      .fn-display {
        margin: 0;
        /* 48px keeps Silkscreen on its 8px grid. */
        font: 48px/1.5 var(--font-display);
        letter-spacing: var(--tracking-caps);
        color: var(--ink-soft);
      }
      .fn-display strong { font-weight: inherit; color: #fff; }
    </style>
    <div class="fn-root demo-root">
      <div class="fn-stack">
        <p class="fn-serif">Let's find the magic in the gap between</p>
        <p class="fn-display">What we <strong>CAN</strong>&nbsp;do,<br>and what we can&nbsp;<strong>DO</strong>.</p>
      </div>
    </div>`;
  return () => { container.innerHTML = ''; };
}
