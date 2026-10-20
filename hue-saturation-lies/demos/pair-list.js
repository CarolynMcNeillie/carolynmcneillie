import { pairIcon } from './icons.js';

export function pairList({ pairs, get, set, onChange }) {
  const group = document.createElement('div');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Colour pairs');
  group.style.display = 'flex';
  group.style.gap = '.75rem';
  group.style.alignItems = 'center';

  const buttons = pairs.map(({ a, b, names }, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button';
    const name = `Colour pair: ${names[0]} to ${names[1]}`;
    button.setAttribute('aria-label', name);
    button.title = name;
    button.innerHTML = pairIcon(a, b);
    button.addEventListener('click', () => {
      set(index);
      group.update();
      onChange();
    });
    group.append(button);
    return button;
  });
  group.update = () => buttons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === get()));
  });
  group.update();
  return group;
}
