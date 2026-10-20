import { GRAYSCALE_ICON } from './icons.js';

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
      }
      /* .grayscale (style.css) keeps each colour's luminance. */
      .yb-hello {
        font-family: var(--font-display);
        font-size: 192px;
        color: #ffff00;
        letter-spacing: normal;
        line-height: 1;
        pointer-events: none;
        user-select: none;
      }

    </style>
    <div class="yb-wrap" id="yb-wrap">
      <span class="yb-hello">Hello</span>
      <button class="icon-button" id="yb-btn" aria-label="Grayscale" title="Grayscale" aria-pressed="false">${GRAYSCALE_ICON}</button>
    </div>
  `;

  const wrap = container.querySelector('#yb-wrap');
  const btn  = container.querySelector('#yb-btn');

  btn.addEventListener('click', () => {
    grayscale = !grayscale;
    wrap.classList.toggle('grayscale', grayscale);
    btn.setAttribute('aria-pressed', String(grayscale));
  });

  return () => { container.innerHTML = ''; };
}
