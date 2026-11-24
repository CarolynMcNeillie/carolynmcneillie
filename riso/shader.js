export const vertex = `#version 300 es
in vec2 position;
out vec2 uv;
void main() {
  uv = position * .5 + .5;
  gl_Position = vec4(position, 0, 1);
}`;
export const fragment = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 outputColor;
uniform sampler2D paperMap, layer0, layer1, layer2, layer3;
uniform vec3 inks[4], paperColor;
uniform vec4 opacity, screens, angles, density, hiding;
uniform float contrast, blackPoint;
uniform float frame, seed, tooth, speckle, load, mottle, banding, spread, softness;
uniform float toothShade, drift, jitter, rotation, scanBlur, dust, pitch;
uniform bool clean, packed;
uniform sampler2D packedMap, original;
uniform vec2 resolution;
uniform float posterize, pitchScale, reveal, registration;
uniform vec4 drumMask;
float hash(float x) { return fract(sin(x * 127.1 + seed * 3.17) * 43758.5453); }
mat2 rotate(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
vec2 layer(int i, vec2 p) {
  if (any(lessThan(p, vec2(0))) || any(greaterThan(p, vec2(1)))) return vec2(0);
  if (packed) {
    float d = texture(packedMap, p)[i];
    if (posterize > 0.) d = floor(d * (posterize - 1.) + .5) / (posterize - 1.);
    return vec2(d, drumMask[i]);
  }
  if (i == 0) return texture(layer0, p).rg;
  if (i == 1) return texture(layer1, p).rg;
  if (i == 2) return texture(layer2, p).rg;
  return texture(layer3, p).rg;
}
// Mirrors inkmodel.js linearize.
vec3 linearize(vec3 c) {
  return mix(c / 12.92, pow((c + .055) / 1.055, vec3(2.4)), step(vec3(.04045), c));
}
// Mirrors inkmodel.js encode.
vec3 encode(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0)), vec3(1. / 2.4)) - .055,
    step(vec3(.0031308), c));
}
// Mirrors inkmodel.js opticalDensity.
vec3 opticalDensity(vec3 ink, vec3 paper) {
  return min(vec3(1.45), -log(clamp(ink / paper, .001, 1.)) / log(10.));
}
// Mirrors inkmodel.js deposit.
vec3 deposit(vec3 col, vec3 paper, vec3 d, float strength, float film, float hide, float c) {
  vec3 t = pow(vec3(10), -d * strength * film);
  return mix(col * t, paper * t, hide * c);
}
// Mirrors inkmodel.js scanTone.
vec3 scanTone(vec3 col) { return clamp((col - blackPoint) * contrast, 0., 1.); }
// Each sheet samples a seamless paper tile at an integer orientation and offset.
vec2 sheetUv(vec2 p) {
  vec2 q = rotate(floor(hash(frame + 19.) * 4.) * 1.5707963) * (p - .5) + .5;
  if (hash(frame + 22.) > .5) q.x = 1. - q.x;
  return q + floor(vec2(hash(frame + 41.), hash(frame + 42.)) * 1080.) / 1080.;
}
// Drums and scanner placement drift separately on each sheet.
vec2 registerInk(int i, vec2 p) {
  float fi = float(i), key = frame * 13. + fi * 97.;
  vec2 offset = (vec2(hash(fi + 1.), hash(fi + 2.)) - .5) * 2. * drift;
  offset += (vec2(hash(key + 3.), hash(key + 4.)) - .5) * 2. * jitter;
  offset += (vec2(hash(frame + 5.), hash(frame + 6.)) - .5) * 2.;
  float a = (hash(key + 7.) - .5) * 2. * rotation * .0174533;
  if (registration == 1. && resolution.x == resolution.y)
    return rotate(a) * (p - .5) * (1. + (hash(key + 8.) - .5) * .002) + .5 + offset / 1080.;
  return rotate(a * registration) * (p - .5) * (1. + (hash(key + 8.) - .5) * .002 * registration)
    + .5 + offset * registration / resolution;
}
// A narrow ink ramp allows pixel-scale bites, not long fibre scratches.
float spreadInk(int i, vec2 q) {
  vec2 r = resolution.x == resolution.y ? vec2(spread / 1080., 0) : vec2(spread / resolution.x, 0);
  float center = layer(i, q).r;
  float top = layer(i, q + r.yx).r, bottom = layer(i, q - r.yx).r;
  float ramp = (center * 4. + layer(i, q + r).r + layer(i, q - r).r + top + bottom) / 8.;
  // A one-pixel stroke carries a full ink dose instead of losing half to spread.
  if (top + bottom < .2 && center > .2) return max(ramp, .9);
  return ramp;
}
// Scene authors choose where a density becomes round AM dots.
float screenField(int i, vec2 q, float d, float mask, float grain) {
  if (mask < .5 || screens[i] < .5) return d - .5;
  if (screens[i] > 1.5) return d - grain;
  vec2 grid = rotate(angles[i] * .0174533) * q * 1080. / pitch;
  if (packed) grid = rotate(angles[i] * .0174533) * q * resolution / (pitch * pitchScale);
  // Circular spots below half tone, circular paper holes above it.
  vec2 cell = fract(grid + (d > .5 ? .5 : 0.)) - .5;
  float radius = sqrt(min(d, 1. - d) / 3.1415927);
  float field = (radius - length(cell)) * 4.;
  return (d > .5 ? -field : field) - load;
}
// One stochastic threshold forms both edge bites and interior pinholes.
float inkTransfer(float field, float d, float grain) {
  float t = field + load - tooth * (grain - .5);
  return smoothstep(-softness, softness, t) * step(.001, d);
}
// Dense local grain changes film thickness; formation remains faint.
float filmThickness(float c, vec4 paper, vec2 sheet, float key, vec2 q, bool black) {
  float grain = paper.g - .5;
  float walk = mix(hash(floor(q.y * 40.) + key), hash(floor(q.y * 40.) + key + 1.), fract(q.y * 40.));
  float film = 1. - mottle * (paper.b - .5) * .02;
  film -= banding * (walk - .5) * .01;
  return c * film * (1. + (hash(key + 12.) - .5) * .002);
}
vec3 printAt(vec2 p) {
  vec2 sheet = sheetUv(p);
  vec4 paper = texture(paperMap, sheet);
  vec3 col = linearize(paperColor);
  bool isClean = clean && p.x < .5;
  for (int i = 0; i < 4; i++) {
    if (density[i] <= 0.) continue;
    vec2 q = isClean ? p : registerInk(i, p);
    float d = spreadInk(i, q);
    float field = screenField(i, q, d, layer(i, q).g, paper.g);
    bool screened = layer(i, q).g > .5 && screens[i] > .5;
    float c = inkTransfer(field, d, paper.g);
    bool black = dot(inks[i], vec3(1)) < .1;
    if (!black && d > .98) c *= 1. - smoothstep(.988, .998, paper.g);
    // Dot rims average partial ink coverage; tooth only nudges their contours.
    if (screened) {
      float transfer = field + load - tooth * (paper.g - .5) * .16;
      c = smoothstep(-.19, .19, transfer) * step(.001, d);
    }
    float film = filmThickness(c, paper, sheet, frame * 13. + float(i) * 97., q, black);
    if (isClean) film = layer(i, p).r;
    // A symmetric film fluctuation preserves the swatch instead of darkening every channel.
    float noise = (paper.g - .5) * speckle * .27;
    vec3 paperLinear = linearize(paperColor);
    vec3 dInk = opticalDensity(linearize(inks[i]), paperLinear);
    vec3 printed = encode(paperLinear * pow(vec3(10), -dInk * density[i]));
    vec3 pigment = linearize(clamp(printed + noise, 0., 1.));
    dInk = -log(max(pigment / paperLinear, vec3(.001))) / log(10.);
    col = deposit(col, paperLinear, dInk, 1., clamp(film * opacity[i], 0., 1.), hiding[i], c);
  }
  if (!isClean) {
    col *= 1. - toothShade * (paper.r - .5);
    col *= 1. - dust * paper.a * .5;
  }
  return col;
}
void main() {
  vec2 p = vec2(uv.x, 1. - uv.y);
  if (reveal >= 1.) {
    outputColor = vec4(texture(original, p).rgb, 1);
    return;
  }
  vec3 c = printAt(p);
  if (scanBlur > 0.) {
    vec2 d = resolution.x == resolution.y ? vec2(scanBlur / 1080., 0) : vec2(scanBlur / resolution.x, 0);
    c = (c * 4. + printAt(p + d) + printAt(p - d) + printAt(p + d.yx) + printAt(p - d.yx)) / 8.;
  }
  if (reveal == 0.) outputColor = vec4(encode(scanTone(c)), 1);
  else outputColor = vec4(encode(mix(scanTone(c), linearize(texture(original, p).rgb), reveal)), 1);
}`;
