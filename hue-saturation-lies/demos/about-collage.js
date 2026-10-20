/*
About me, part 2: one still collage of art school and Venice photos (c. 2005 to 2007), on screen
while Carolyn talks: the work first, a little of her. Photos are shown whole
(no cropping), at their own proportions, in two rows; photos in a row share a height.
Images: images/about/ (Carolyn's own photos, unchanged).
*/

// [file, width, height, alt]. Alt text is placeholder copy for Carolyn.
const PHOTOS = {
  painting: ['04-painting.jpg', 604, 453, 'Carolyn beside her large painting of a reclining figure in a checked dress'],
  portrait: ['06-portrait.jpg', 450, 600, 'A large portrait painting hanging in a hallway'],
  case: ['09-case.jpg', 604, 453, 'Carolyn at a work table with an open case of framed pieces'],
  prints: ['03-prints.jpg', 393, 604, 'Two black and white prints of faces'],
  rainbow: ['12-rainbow.jpg', 604, 443, 'Carolyn waving beside a painting of rainbow stripes on an easel'],
  venice: ['10-venice.jpg', 400, 393, 'Carolyn in star-shaped glasses at a window in Venice'],
};
const GAP = 12; // px between photos and between rows

export function mount(container) {
  const rows = [
    ['painting', 'portrait', 'case'],
    ['prints', 'rainbow', 'venice'],
  ].map((row) => row.map((key) => PHOTOS[key]));
  // A row of photos at one height h is h * (sum of width/height) wide. To fit
  // both rows in the stage height, the collage width W must satisfy
  // sum over rows of W / rowAspect <= available height.
  const aspect = (row) => row.reduce((sum, [, w, h]) => sum + w / h, 0);
  const fit = 1 / rows.reduce((sum, row) => sum + 1 / aspect(row), 0);

  container.innerHTML = `
    <style>
      .ph01 { position: absolute; inset: 0; background: var(--scrim); container-type: size; display: grid; place-items: center; }
      .ph01-collage {
        width: min(100cqw - 64px, (100cqh - 64px - ${GAP}px) * ${fit.toFixed(4)});
        display: flex; flex-direction: column; gap: ${GAP}px;
      }
      .ph01-row { display: flex; gap: ${GAP}px; }
      .ph01-row img { display: block; min-width: 0; height: auto; border-radius: var(--radius); }
    </style>
    <div class="ph01">
      <div class="ph01-collage">
        ${rows.map((row) => `<div class="ph01-row">${row.map(([file, w, h, alt]) =>
          `<img src="./images/about/${file}" width="${w}" height="${h}" alt="${alt}" style="flex: ${(w / h).toFixed(4)} 1 0">`).join('')}</div>`).join('')}
      </div>
    </div>`;
  return () => { container.innerHTML = ''; };
}
