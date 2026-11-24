import { configure, genome } from '../flower/flower.js';
import { prepareFlower } from './prepare.js';
const ready = fetch(new URL('../riso-colors.json', import.meta.url)).then(r => r.json()).then(configure);
ready.catch(error => console.warn('Worker configuration failed', error));
self.onmessage = async ({ data: request }) => {
  try {
    await ready;
    const result = prepareFlower({ ...request, g: genome(request.seed),
      makeCanvas: (w, h) => new OffscreenCanvas(w, h) });
    self.postMessage({ i: request.i, result }, result.data.map(d => d.buffer));
  } catch (error) {
    self.postMessage({ i: request.i, error: error.message });
  }
};
