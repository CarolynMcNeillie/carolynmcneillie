import { windowAt, SIZE } from './prepare.js';
const vertex = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2. - 1., 0., 1.);
}`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D sourceA, sourceB;
uniform vec2 resolution, centre;
uniform float turn, zoom, count;
uniform vec4 cornerA, cornerB;
layout(location=0) out vec4 drum0;
layout(location=1) out vec4 drum1;
layout(location=2) out vec4 drum2;
layout(location=3) out vec4 drum3;
void main() {
  vec2 p = gl_FragCoord.xy - resolution * .5;
  float wedge = 3.141592653589793 / count;
  float a = mod(atan(p.y, p.x), 2. * wedge);
  a = min(a, 2. * wedge - a);
  vec2 q = length(p) / zoom * vec2(cos(a), sin(a));
  vec2 f = vec2(${SIZE / 2}.) + centre + mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;
  bool inside = all(greaterThanEqual(f, vec2(0.))) && all(lessThan(f, vec2(${SIZE}.)));
  vec4 A = inside ? texture(sourceA, f / ${SIZE}.) : cornerA;
  vec4 B = inside ? texture(sourceB, f / ${SIZE}.) : cornerB;
  drum0 = vec4(A.rg, 0., 1.); drum1 = vec4(A.ba, 0., 1.);
  drum2 = vec4(B.rg, 0., 1.); drum3 = vec4(B.ba, 0., 1.);
}`;
export function createFold(gl, width, height) {
  function compile(type, text) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, text); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  const locations = new Map();
  const loc = name => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name);
  };
  for (const name of ['sourceA', 'sourceB', 'resolution', 'centre', 'turn', 'zoom', 'count',
    'cornerA', 'cornerB']) loc(name);
  const vao = gl.createVertexArray(), framebuffer = gl.createFramebuffer();
  function texture(w, h, data = null) {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, t);
    for (const param of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
      gl.texParameteri(gl.TEXTURE_2D, param, gl.LINEAR);
    for (const param of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T])
      gl.texParameteri(gl.TEXTURE_2D, param, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return t;
  }
  const targets = Array.from({ length: 4 }, () => texture(width, height));
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  targets.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
  gl.drawBuffers(targets.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Fold framebuffer failed');
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  let sources = [], flower, corners;
  function show(next) {
    sources.forEach(t => gl.deleteTexture(t));
    flower = next;
    sources = next.data.map(data => texture(SIZE, SIZE, data));
    next.data = null;
    corners = [0, 2].map(d => new Float32Array(next.corner.slice(d, d + 2).flat().map(v => v / 255)));
  }
  function draw(t) {
    const w = windowAt(t, flower.phase);
    gl.useProgram(program); gl.bindVertexArray(vao);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); gl.viewport(0, 0, width, height);
    sources.forEach((s, i) => {
      gl.activeTexture(gl.TEXTURE7 + i); gl.bindTexture(gl.TEXTURE_2D, s);
      gl.uniform1i(loc(i ? 'sourceB' : 'sourceA'), 7 + i);
    });
    gl.uniform2f(loc('resolution'), width, height); gl.uniform2f(loc('centre'), w.cx, w.cy);
    gl.uniform1f(loc('turn'), w.turn); gl.uniform1f(loc('zoom'), w.zoom);
    gl.uniform1f(loc('count'), flower.n);
    gl.uniform4fv(loc('cornerA'), corners[0]);
    gl.uniform4fv(loc('cornerB'), corners[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindVertexArray(null);
    return targets;
  }
  return { show, draw };
}
