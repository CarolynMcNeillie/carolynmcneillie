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
  button.addEventListener('click', () => {
    const pressed = button.getAttribute('aria-pressed') !== 'true';
    layers.forEach(layer => layer.classList.toggle('grayscale', pressed));
    button.setAttribute('aria-pressed', String(pressed));
  });
  return () => {
    layers.forEach(layer => layer.classList.remove('grayscale'));
    container.style.pointerEvents = '';
    container.replaceChildren();
  };
}
