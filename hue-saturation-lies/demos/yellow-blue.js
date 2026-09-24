export function mount(container) {
  let grayscale = false;

  container.innerHTML = `
    <style>
      .yb-wrap {
        position: absolute; inset: 0;
        background: #0000ff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3rem;
        transition: filter 0.3s ease;
      }
      .yb-wrap.grayscale {
        filter: grayscale(1);
      }
      .yb-hello {
        font-family: 'Silkscreen', monospace;
        font-size: clamp(4rem, 18vw, 14rem);
        color: #ffff00;
        letter-spacing: 0.05em;
        line-height: 1;
        pointer-events: none;
        user-select: none;
      }
      .yb-btn {
        font: 600 0.62rem/1 monospace;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.45);
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 999px;
        padding: 0.35rem 0.8rem;
        cursor: pointer;
        transition: color 0.15s, background 0.15s;
      }
      .yb-btn.active {
        color: #fff;
        background: rgba(255,255,255,0.2);
        border-color: rgba(255,255,255,0.4);
      }
    </style>
    <div class="yb-wrap" id="yb-wrap">
      <span class="yb-hello">Hello</span>
      <button class="yb-btn" id="yb-btn">Grayscale</button>
    </div>
  `;

  const wrap = container.querySelector('#yb-wrap');
  const btn  = container.querySelector('#yb-btn');

  btn.addEventListener('click', () => {
    grayscale = !grayscale;
    wrap.classList.toggle('grayscale', grayscale);
    btn.classList.toggle('active', grayscale);
  });

  return () => { container.innerHTML = ''; };
}
