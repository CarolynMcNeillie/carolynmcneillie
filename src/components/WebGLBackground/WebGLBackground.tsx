import React, { useEffect, useRef } from "react";

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

  // Tile pattern data (13x13, Tile 0)
  const int TILE_SIZE = 13;
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
    // One base tile is TILE_SIZE cells
    // A "mega-tile" (2x2 mirrored pattern) is 2 * TILE_SIZE cells
    // We want the mega-tile to appear 1.5 times on the shortest axis

    float shortestAxis = min(u_resolution.x, u_resolution.y);
    float megaTileCells = float(TILE_SIZE) * 2.0; // 2x2 grid of base tiles

    // Cell size: shortest axis / (1.5 mega-tiles * cells per mega-tile)
    float cellSize = shortestAxis / (1.5 * megaTileCells);

    // Size of one base tile in pixels
    float tilePixelSize = cellSize * float(TILE_SIZE);

    // Size of one mega-tile (2x2 pattern) in pixels
    float megaTilePixelSize = tilePixelSize * 2.0;

    // Current pixel position
    vec2 pixelPos = gl_FragCoord.xy;

    // Flip Y coordinate (WebGL has Y=0 at bottom, we want Y=0 at top)
    pixelPos.y = u_resolution.y - pixelPos.y;

    // Center the tiling pattern
    // Offset so the center of a mega-tile is at screen center
    pixelPos = pixelPos - u_resolution * 0.5 + vec2(megaTilePixelSize * 0.5);

    // Which mega-tile are we in?
    vec2 megaTileIndex = floor(pixelPos / megaTilePixelSize);

    // Position within the current mega-tile
    vec2 pixelInMegaTile = mod(pixelPos, megaTilePixelSize);

    // Which base tile within the mega-tile? (0 or 1 for x, 0 or 1 for y)
    vec2 baseTileInMega = floor(pixelInMegaTile / tilePixelSize);

    // Position within the base tile
    vec2 pixelInTile = mod(pixelInMegaTile, tilePixelSize);

    // Which cell within the tile BEFORE mirroring (for animation calculation)
    int origTileX = int(floor(pixelInTile.x / cellSize));
    int origTileY = int(floor(pixelInTile.y / cellSize));

    // Apply mirroring based on position in mega-tile
    // Top-left (0,0): original
    // Top-right (1,0): flip X
    // Bottom-left (0,1): flip Y
    // Bottom-right (1,1): flip X and Y

    if (baseTileInMega.x == 1.0) {
      // Right column: flip X
      pixelInTile.x = tilePixelSize - pixelInTile.x;
    }

    if (baseTileInMega.y == 1.0) {
      // Bottom row: flip Y
      pixelInTile.y = tilePixelSize - pixelInTile.y;
    }

    // Which cell within the tile (0 to TILE_SIZE-1) AFTER mirroring (for pattern lookup)
    int tileX = int(floor(pixelInTile.x / cellSize));
    int tileY = int(floor(pixelInTile.y / cellSize));

    // Clamp to valid range
    tileX = int(clamp(float(tileX), 0.0, float(TILE_SIZE - 1)));
    tileY = int(clamp(float(tileY), 0.0, float(TILE_SIZE - 1)));
    origTileX = int(clamp(float(origTileX), 0.0, float(TILE_SIZE - 1)));
    origTileY = int(clamp(float(origTileY), 0.0, float(TILE_SIZE - 1)));

    // Get the pattern value for this cell
    int patternValue = getPatternValue(tileX, tileY);

    // Define colors
    vec3 lightColor = vec3(0.90, 0.80, 0.79);  // light pink
    vec3 mediumColor = vec3(0.20, 0.28, 0.40); // medium blue
    vec3 darkColor = vec3(0.11, 0.07, 0.10);   // dark

    // Select color based on pattern value
    vec3 color = darkColor;
    if (patternValue == 1) {
      color = mediumColor;
    } else if (patternValue == 2) {
      color = lightColor;
    }

    // Add rounded corners
    // Get position within the current cell (0.0 to 1.0)
    vec2 cellPos = mod(pixelInTile, cellSize) / cellSize;

    // Rounded corner radius (as fraction of cell size)
    float cornerRadius = 0.3;

    // Distance from corners
    vec2 corner = max(vec2(0.0), abs(cellPos - 0.5) - (0.5 - cornerRadius));
    float cornerDist = length(corner) / cornerRadius;

    // Smooth fade at the corner
    float cornerMask = 1.0 - smoothstep(0.8, 1.0, cornerDist);

    // Mix with background color based on corner mask
    color = mix(darkColor, color, cornerMask);

    // Animation: fade in and scale from center based on cell position
    // Only animate non-empty cells (patternValue > 0)
    if (patternValue > 0) {
      // Animation is based on the ORIGINAL pattern position (before mirroring)
      // Pattern index 168 (bottom-right at 12,12) should animate first (delay=0)
      // Pattern index 0 (top-left at 0,0) should animate last

      // For mirrored tiles, we need to flip the coordinates to match the visual position
      float animOrigX = float(origTileX);
      float animOrigY = float(origTileY);

      // Top-right tile (X-mirrored): flip X coordinate
      if (baseTileInMega.x == 1.0) {
        animOrigX = float(TILE_SIZE - 1) - float(origTileX);
      }

      // Bottom-left tile (Y-mirrored): flip Y coordinate
      if (baseTileInMega.y == 1.0) {
        animOrigY = float(TILE_SIZE - 1) - float(origTileY);
      }

      // Distance from bottom-right corner (12,12) in the ORIGINAL pattern
      float distX = float(TILE_SIZE - 1) - animOrigX;
      float distY = float(TILE_SIZE - 1) - animOrigY;

      // Calculate delay based on distance from (12,12)
      float delay = (distX + distY) * 0.1;
      float animDuration = 0.5;

      // Time since this cell should start animating
      float cellTime = u_time - delay;

      // Progress from 0 to 1 over the duration
      float progress = clamp(cellTime / animDuration, 0.0, 1.0);

      // Easing function (ease out)
      progress = 1.0 - pow(1.0 - progress, 3.0);

      // Apply scale effect by modifying the corner mask
      // Scale from center of cell
      vec2 fromCenter = cellPos - 0.5;
      fromCenter /= mix(0.01, 1.0, progress); // Avoid division by zero
      vec2 scaledPos = fromCenter + 0.5;

      // Recalculate corner with scaled position
      vec2 scaledCorner = max(vec2(0.0), abs(scaledPos - 0.5) - (0.5 - cornerRadius));
      float scaledCornerDist = length(scaledCorner) / cornerRadius;
      cornerMask = 1.0 - smoothstep(0.8, 1.0, scaledCornerDist);

      // Reapply corner mask with animation
      color = mix(darkColor, color, cornerMask);

      // Fade from background to final color
      color = mix(darkColor, color, progress);
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
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
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
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

const WebGLBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const resolutionLocationRef = useRef<WebGLUniformLocation | null>(null);
  const timeLocationRef = useRef<WebGLUniformLocation | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get WebGL 2.0 context
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL 2.0 not supported");
      return;
    }
    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) {
      console.error("Failed to create shaders");
      return;
    }

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error("Failed to create program");
      return;
    }
    programRef.current = program;

    // Look up attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, "a_position");
    resolutionLocationRef.current = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    timeLocationRef.current = gl.getUniformLocation(program, "u_time");

    // Create a buffer for the fullscreen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Two triangles that cover the screen
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Render function
    const render = () => {
      if (
        !gl ||
        !program ||
        !resolutionLocationRef.current ||
        !timeLocationRef.current
      )
        return;

      // Set canvas size to match display size
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      gl.viewport(0, 0, canvas.width, canvas.height);

      // Clear the canvas with dark background color
      gl.clearColor(0.11, 0.07, 0.1, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use our program
      gl.useProgram(program);

      // Set the resolution uniform
      gl.uniform2f(resolutionLocationRef.current, canvas.width, canvas.height);

      // Set the time uniform (in seconds)
      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      gl.uniform1f(timeLocationRef.current, currentTime);

      // Set up the position attribute
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      render();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      render();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
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
