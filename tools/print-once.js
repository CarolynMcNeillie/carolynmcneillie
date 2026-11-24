import { createPrinter } from '../riso/print.js';

const inks = fetch(new URL('../riso/riso-colors.json', import.meta.url)).then(r => r.json());
export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
export function roughMask(union, scale, dilationPx = 1.5, blurPx = 1) {
  const { width, height } = union;
  const edge = union.getContext('2d', { willReadFrequently: true });
  const dilated = makeCanvas(width, height);
  const dilation = dilated.getContext('2d');
  const radius = Math.ceil(dilationPx * scale);
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius) dilation.drawImage(union, x, y);
    }
  }
  edge.clearRect(0, 0, width, height);
  edge.filter = `blur(${scale * blurPx}px)`;
  edge.drawImage(dilated, 0, 0);
  const pixels = edge.getImageData(0, 0, width, height);
  for (let i = 3; i < pixels.data.length; i += 4) {
    let hash = Math.imul(i, 1597334677) >>> 0;
    if (blurPx !== 1) {
      hash = Math.imul(hash ^ (hash >>> 16), 2246822507) >>> 0;
      hash = Math.imul(hash ^ (hash >>> 13), 3266489909) >>> 0;
      hash ^= hash >>> 16;
    }
    const noise = (hash & 255) / 255;
    pixels.data[i] = pixels.data[i] > 80 + noise * 96 ? 255 : 0;
  }
  edge.putImageData(pixels, 0, 0);
  return union;
}
// A new press owns each print. Dispose the previous context after replacement.
export function printOnce(element, id, className) {
  let previous;
  let draws = 0;
  const dispose = item => {
    item?.canvas.remove();
    item?.gl?.getExtension('WEBGL_lose_context')?.loseContext();
  };
  return async ({ mask, layer, scale, margin, dilation = 1.5, blur = 1 }) => {
    const { width, height } = mask;
    const canvas = makeCanvas(width, height);
    let printer;
    canvas.id = id;
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'absolute', pointerEvents: 'none', maxWidth: 'none' });
    try {
      roughMask(mask, scale, dilation, blur);
      const black = (await inks).find(ink => ink.name === 'Black');
      printer = createPrinter(canvas, { width, height, size: Math.max(width, height) });
      printer.setInks({ paper: '#f1e5df', inks: [{ ...black, density: 1, hiding: 0 }],
        contrast: 1, blackPoint: 0 });
      printer.draw([layer ?? makeCanvas(width, height)], 1);
      const output = makeCanvas(width, height);
      const context = output.getContext('2d');
      context.drawImage(canvas, 0, 0);
      context.globalCompositeOperation = 'destination-in';
      context.drawImage(mask, 0, 0);
      canvas.baked = output;
      const url = `url("${mask.toDataURL()}")`;
      Object.assign(canvas.style, { left: `${-margin}px`, top: `${-margin}px`,
        width: `${width / scale}px`, height: `${height / scale}px`,
        maskImage: url, webkitMaskImage: url, maskSize: '100% 100%', webkitMaskSize: '100% 100%' });
      dispose(previous);
      previous = { canvas, gl: printer.gl };
      element.append(canvas);
      element.classList.add(className);
      canvas.dataset.draws = ++draws;
    } catch (error) {
      dispose({ canvas, gl: printer?.gl });
      dispose(previous);
      previous = null;
      element.classList.remove(className);
      console.warn(`${id} print fallback:`, error.message);
    }
  };
}
