import { createFold } from './fold.js';
export function kaleidoscope(printer, width, height) {
  const fold = createFold(printer.gl, width, height);
  let flower = null;
  function show(next) {
    flower = next;
    fold.show(next);
    printer.setInks(next.g.chord);
    printer.setParams({ screen0: 'AM', screen1: 'AM', screen2: 'AM', screen3: 'AM' });
  }
  function draw(t, frame) {
    if (flower) printer.drawTextures(fold.draw(t), frame);
  }
  return { show, draw, get flower() { return flower; } };
}
