import { GRAYSCALE_ICON } from './icons.js';

export function mount(container) {
  const layers = document.querySelectorAll('.slide-bg-layer');
  container.innerHTML = `
    <style>
      .painting-gray-control { position: absolute; right: 1.5rem; bottom: 1.5rem; pointer-events: auto; }
    </style>
    <button class="icon-button painting-gray-control" type="button" aria-label="Grayscale" title="Grayscale" aria-pressed="false">${GRAYSCALE_ICON}</button>`;
  // The demo layer covers the painting, but only the button accepts input.
  container.style.pointerEvents = 'none';
  const button = container.querySelector('button');
  const setGray = (pressed) => {
    layers.forEach(layer => layer.classList.toggle('grayscale', pressed));
    button.setAttribute('aria-pressed', String(pressed));
  };
  button.addEventListener('click', () => setGray(button.getAttribute('aria-pressed') !== 'true'));
  // lesson-two: step 0 the title, step 1 the painting, step 2 (arrow) grey.
  const step = (i) => setGray(i >= 2);
  return { step, cleanup: () => {
    layers.forEach(layer => layer.classList.remove('grayscale'));
    container.style.pointerEvents = '';
    container.replaceChildren();
  } };
}
