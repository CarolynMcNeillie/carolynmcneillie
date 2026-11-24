import { makePaper } from './paper.js';
import { vertex, fragment } from './shader.js';

const paperCache = new Map();
function sharedPaper(seed, size) {
  const key = `${seed}:${size}`;
  if (!paperCache.has(key)) paperCache.set(key, makePaper(seed, size));
  return paperCache.get(key);
}

export const DEFAULT_PARAMS = {
  scene: 'texture study',
  freeze: true,
  fps: 12.5,
  seed: 41,
  paper: '#f1ebde',
  tooth: 1.0,
  speckle: 0.6,
  load: 0.04,
  mottle: 0.05,
  banding: 0.03,
  spread: 1.5,
  softness: 0.06,
  toothShade: 0.035,
  drift: 1.8,
  jitter: 0.9,
  rotation: 0.08,
  scanBlur: 0.6,
  dust: 0.4,
  pitch: 6,
  posterize: 0,
  pitchScale: 1,
  reveal: 0,
  registration: 1,
  clean: false,
  loupe: true,
};
const defaultInks = ['Fluorescent Orange', 'Green', 'Fluorescent Pink', 'Black'];
for (let i = 0; i < 4; i++) {
  DEFAULT_PARAMS[`ink${i}`] = defaultInks[i];
  DEFAULT_PARAMS[`opacity${i}`] = 1;
  DEFAULT_PARAMS[`screen${i}`] = 'AM';
  DEFAULT_PARAMS[`angle${i}`] = [15, 75, 45, 0][i];
}

export function makeLayers(size = 1080) {
  const layers = Array.from({ length: 4 }, () => {
    const layer = document.createElement('canvas');
    layer.width = layer.height = size;
    return layer;
  });
  return { layers, contexts: layers.map((layer) => layer.getContext('2d')) };
}

export function createPrinter(canvas, {
  size = 1080, width = size, height = size, seed = DEFAULT_PARAMS.seed,
} = {}) {
  const params = { ...DEFAULT_PARAMS, seed };
  let set = { inks: [], contrast: 1, blackPoint: 0 };
  try {
    canvas.width = width;
    canvas.height = height;
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
    if (!gl) throw new Error('WebGL2 is unavailable. Use a browser with WebGL2 enabled.');
    function compile(type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment.replaceAll('1080.', `${size}.`)));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const textures = Array.from({ length: 5 }, (_, i) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, i === 0 ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, i === 0 ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(program, i === 0 ? 'paperMap' : `layer${i - 1}`), i);
      return t;
    });
    const loc = (n) => gl.getUniformLocation(program, n);
    gl.uniform2f(loc('resolution'), width, height);
    const extra = [5, 6].map(i => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255]));
      gl.uniform1i(loc(i === 5 ? 'packedMap' : 'original'), i);
      return t;
    });
    function paper() {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[0]);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        size,
        size,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        sharedPaper(params.seed, size)
      );
    }
    function rgb(hex) {
      return hex.match(/[a-f\d]{2}/gi).map((x) => parseInt(x, 16) / 255);
    }
    paper();
    let empty;
    function setInks(next) {
      set = next;
      params.paper = next.paper;
    }
    function setParams(partial) {
      const oldSeed = params.seed;
      Object.assign(params, partial);
      if (params.seed !== oldSeed) paper();
    }
    function draw(layers, frame = 0, packed = false, supplied = null) {
      gl.useProgram(program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.uniform1i(loc('packed'), packed);
      if (!supplied) {
        empty ??= makeLayers(size).layers;
        layers = Array.from({ length: 4 }, (_, i) => layers[i] || empty[i]);
      }
      for (let i = 0; !packed && i < 4; i++) {
        gl.activeTexture(gl.TEXTURE0 + i + 1);
        gl.bindTexture(gl.TEXTURE_2D, supplied ? supplied[i] : textures[i + 1]);
        if (!supplied) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layers[i]);
      }
      for (const key of [
        'posterize',
        'pitchScale',
        'reveal',
        'registration',
        'seed',
        'tooth',
        'speckle',
        'load',
        'mottle',
        'banding',
        'spread',
        'softness',
        'toothShade',
        'drift',
        'jitter',
        'rotation',
        'scanBlur',
        'dust',
        'pitch',
      ])
        gl.uniform1f(loc(key), Number(params[key]));
      gl.uniform1i(loc('study'), params.scene === 'texture study');
      gl.uniform1f(loc('frame'), frame);
      gl.uniform1i(loc('clean'), params.clean);
      gl.uniform3fv(loc('paperColor'), rgb(params.paper));
      gl.uniform3fv(
        loc('inks[0]'),
        Array.from({ length: 4 }, (_, i) => rgb(set.inks[i]?.hex || '#ffffff')).flat()
      );
      gl.uniform4fv(loc('density'), Array.from({ length: 4 }, (_, i) => set.inks[i]?.density ?? 0));
      gl.uniform4fv(loc('hiding'), Array.from({ length: 4 }, (_, i) => set.inks[i]?.hiding ?? 0));
      gl.uniform1f(loc('contrast'), set.contrast);
      gl.uniform1f(loc('blackPoint'), set.blackPoint);
      for (const [uniform, prefix] of [
        ['opacity', 'opacity'],
        ['screens', 'screen'],
        ['angles', 'angle'],
      ])
        gl.uniform4fv(
          loc(uniform),
          Array.from({ length: 4 }, (_, i) =>
            prefix === 'screen'
              ? ['solid', 'AM', 'FM'].indexOf(params[`screen${i}`])
              : params[`${prefix}${i}`]
          )
        );
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    function drawTextures(textures, frame = 0) {
      draw([], frame, false, textures);
    }
    function setOriginal(source) {
      gl.activeTexture(gl.TEXTURE6);
      gl.bindTexture(gl.TEXTURE_2D, extra[1]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
    function drawPacked(source, frame = 0, masks = [1, 1, 1, 1]) {
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE5);
      if (gl.isTexture(source)) gl.bindTexture(gl.TEXTURE_2D, source);
      else {
        gl.bindTexture(gl.TEXTURE_2D, extra[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
      gl.uniform4fv(loc('drumMask'), masks);
      draw([], frame, true);
    }
    return { setInks, setParams, draw, drawTextures, drawPacked, setOriginal, gl, params, size, width, height };
  } catch (e) {
    const error = document.createElement('pre');
    error.textContent = `Printer failed: ${e.message}`;
    canvas.insertAdjacentElement('afterend', error);
    throw e;
  }
}
