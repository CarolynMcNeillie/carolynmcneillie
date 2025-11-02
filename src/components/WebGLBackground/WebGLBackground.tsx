import React, { useEffect, useRef } from "react";
import { glslColors, colors } from "./colors";

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

  // Color constants (generated from OKLCH for accessibility)
  const vec3 LIGHT_COLOR = ${glslColors.light};
  const vec3 MEDIUM_COLOR = ${glslColors.medium};
  const vec3 DARK_COLOR = ${glslColors.dark};

  // Tile pattern data (13x13, Tile 0)
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

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

const WebGLBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resolutionLocationRef = useRef<WebGLUniformLocation | null>(null);
  const timeLocationRef = useRef<WebGLUniformLocation | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    // Look up attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, "a_position");
    resolutionLocationRef.current = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    timeLocationRef.current = gl.getUniformLocation(program, "u_time");

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // Render function
    const render = () => {
      if (
        !gl ||
        !program ||
        !resolutionLocationRef.current ||
        !timeLocationRef.current
      )
        return;

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
      gl.uniform2f(resolutionLocationRef.current, canvas.width, canvas.height);
      gl.uniform1f(timeLocationRef.current, (Date.now() - startTimeRef.current) / 1000);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    let animationFrameId: number;
    const animate = () => {
      render();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -100,
      }}
    />
  );
};

export default WebGLBackground;
