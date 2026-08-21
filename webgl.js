// WebGL Background with Animated Tile Pattern
// Converted from React/TypeScript to vanilla JavaScript

// Color System - OKLCH to RGB conversion for perceptually uniform colors
const BASE_HUE = Math.floor(Math.random() * 360);

function oklchToRgb(l, c, h) {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const gammaCorrect = (c) => {
    return c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };

  return [
    Math.max(0, Math.min(1, gammaCorrect(r))),
    Math.max(0, Math.min(1, gammaCorrect(g))),
    Math.max(0, Math.min(1, gammaCorrect(b_))),
  ];
}

function generateColorPalette(baseHue) {
  const normalizedHue = ((baseHue % 360) + 360) % 360;
  const accentHue = (normalizedHue + 165) % 360;

  return {
    dark: { l: 0.15, c: 0.02, h: normalizedHue },
    medium: { l: 0.22, c: 0.04, h: normalizedHue },
    light: { l: 0.28, c: 0.03, h: accentHue },
  };
}

const colorDefinitions = generateColorPalette(BASE_HUE);
const colors = {
  dark: oklchToRgb(colorDefinitions.dark.l, colorDefinitions.dark.c, colorDefinitions.dark.h),
  medium: oklchToRgb(colorDefinitions.medium.l, colorDefinitions.medium.c, colorDefinitions.medium.h),
  light: oklchToRgb(colorDefinitions.light.l, colorDefinitions.light.c, colorDefinitions.light.h),
};

function rgbToGlsl(rgb) {
  return `vec3(${rgb[0].toFixed(3)}, ${rgb[1].toFixed(3)}, ${rgb[2].toFixed(3)})`;
}

const glslColors = {
  dark: rgbToGlsl(colors.dark),
  medium: rgbToGlsl(colors.medium),
  light: rgbToGlsl(colors.light),
};

// Shader Sources
const vertexShaderSource = `#version 300 es
  in vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `#version 300 es
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;

  out vec4 fragColor;

  // Color constants
  const vec3 LIGHT_COLOR = ${glslColors.light};
  const vec3 MEDIUM_COLOR = ${glslColors.medium};
  const vec3 DARK_COLOR = ${glslColors.dark};

  // Tile pattern data (13x13)
  const int TILE_SIZE = 13;
  const float TILE_SIZE_F = 13.0;
  const int PATTERN[169] = int[169](
    2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 2, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0,
    2, 0, 2, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0,
    2, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0,
    0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0,
    0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0,
    0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 2,
    0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 2, 0, 2,
    0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 2, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2
  );

  int getPatternValue(int x, int y) {
    int index = y * TILE_SIZE + x;
    return PATTERN[index];
  }

  void main() {
    float shortestAxis = min(u_resolution.x, u_resolution.y);
    float megaTileCells = TILE_SIZE_F * 2.0;
    float cellSize = shortestAxis / (1.5 * megaTileCells);
    float tilePixelSize = cellSize * TILE_SIZE_F;
    float megaTilePixelSize = tilePixelSize * 2.0;

    vec2 pixelPos = gl_FragCoord.xy;
    pixelPos.y = u_resolution.y - pixelPos.y;
    pixelPos = pixelPos - u_resolution * 0.5 + vec2(megaTilePixelSize * 0.5);

    vec2 pixelInMegaTile = mod(pixelPos, megaTilePixelSize);
    vec2 baseTileInMega = floor(pixelInMegaTile / tilePixelSize);
    vec2 pixelInTile = mod(pixelInMegaTile, tilePixelSize);

    int origTileX = int(floor(pixelInTile.x / cellSize));
    int origTileY = int(floor(pixelInTile.y / cellSize));

    if (baseTileInMega.x == 1.0) {
      pixelInTile.x = tilePixelSize - pixelInTile.x;
    }
    if (baseTileInMega.y == 1.0) {
      pixelInTile.y = tilePixelSize - pixelInTile.y;
    }

    int tileX = int(clamp(floor(pixelInTile.x / cellSize), 0.0, float(TILE_SIZE - 1)));
    int tileY = int(clamp(floor(pixelInTile.y / cellSize), 0.0, float(TILE_SIZE - 1)));
    origTileX = int(clamp(float(origTileX), 0.0, float(TILE_SIZE - 1)));
    origTileY = int(clamp(float(origTileY), 0.0, float(TILE_SIZE - 1)));

    int patternValue = getPatternValue(tileX, tileY);

    vec3 color = DARK_COLOR;
    if (patternValue == 1) {
      color = MEDIUM_COLOR;
    } else if (patternValue == 2) {
      color = LIGHT_COLOR;
    }

    vec2 cellPos = mod(pixelInTile, cellSize) / cellSize;
    float cornerRadius = 0.3;
    vec2 corner = max(vec2(0.0), abs(cellPos - 0.5) - (0.5 - cornerRadius));
    float cornerDist = length(corner) / cornerRadius;
    float cornerMask = 1.0 - smoothstep(0.8, 1.0, cornerDist);
    color = mix(DARK_COLOR, color, cornerMask);

    if (patternValue > 0) {
      float animOrigX = float(origTileX);
      float animOrigY = float(origTileY);

      if (baseTileInMega.x == 1.0) {
        animOrigX = float(TILE_SIZE - 1) - float(origTileX);
      }
      if (baseTileInMega.y == 1.0) {
        animOrigY = float(TILE_SIZE - 1) - float(origTileY);
      }

      float distX = float(TILE_SIZE - 1) - animOrigX;
      float distY = float(TILE_SIZE - 1) - animOrigY;
      float delay = (distX + distY) * 0.1;
      float animDuration = 0.5;
      float cellTime = u_time - delay;
      float progress = clamp(cellTime / animDuration, 0.0, 1.0);
      progress = 1.0 - pow(1.0 - progress, 3.0);

      vec2 fromCenter = cellPos - 0.5;
      fromCenter /= mix(0.01, 1.0, progress);
      vec2 scaledPos = fromCenter + 0.5;

      vec2 scaledCorner = max(vec2(0.0), abs(scaledPos - 0.5) - (0.5 - cornerRadius));
      float scaledCornerDist = length(scaledCorner) / cornerRadius;
      cornerMask = 1.0 - smoothstep(0.8, 1.0, scaledCornerDist);

      color = mix(DARK_COLOR, color, cornerMask);
      color = mix(DARK_COLOR, color, progress);
    }

    fragColor = vec4(color, 1.0);
  }
`;

// WebGL Setup
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

// Initialize WebGL
function initWebGL() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.warn('WebGL2 not supported');
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return;

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return;

  // Setup attributes and uniforms
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const startTime = Date.now();

  // Render loop
  function render() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const needsResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

    if (needsResize) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const [r, g, b] = colors.dark;
    gl.clearColor(r, g, b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, (Date.now() - startTime) / 1000);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  render();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWebGL);
} else {
  initWebGL();
}
