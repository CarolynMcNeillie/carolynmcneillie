import React, { useEffect, useRef } from "react"

const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;

  // Tile pattern data (13x13, Tile 0)
  const int TILE_SIZE = 13;

  int getPatternValue(int x, int y) {
    int index = y * TILE_SIZE + x;

    // Tile 0 pattern data (13x13) - Fresh transcription from tiles.ts
    // Row 0
    if (index == 0) return 2;
    if (index == 1) return 0;
    if (index == 2) return 2;
    if (index == 3) return 2;
    if (index == 4) return 0;
    if (index == 5) return 0;
    if (index == 6) return 0;
    if (index == 7) return 0;
    if (index == 8) return 0;
    if (index == 9) return 0;
    if (index == 10) return 0;
    if (index == 11) return 0;
    if (index == 12) return 1;
    // Row 1
    if (index == 13) return 0;
    if (index == 14) return 2;
    if (index == 15) return 0;
    if (index == 16) return 0;
    if (index == 17) return 0;
    if (index == 18) return 0;
    if (index == 19) return 0;
    if (index == 20) return 1;
    if (index == 21) return 1;
    if (index == 22) return 1;
    if (index == 23) return 0;
    if (index == 24) return 1;
    if (index == 25) return 0;
    // Row 2
    if (index == 26) return 2;
    if (index == 27) return 0;
    if (index == 28) return 2;
    if (index == 29) return 0;
    if (index == 30) return 0;
    if (index == 31) return 0;
    if (index == 32) return 0;
    if (index == 33) return 1;
    if (index == 34) return 1;
    if (index == 35) return 0;
    if (index == 36) return 1;
    if (index == 37) return 0;
    if (index == 38) return 0;
    // Row 3
    if (index == 39) return 2;
    if (index == 40) return 0;
    if (index == 41) return 0;
    if (index == 42) return 0;
    if (index == 43) return 0;
    if (index == 44) return 0;
    if (index == 45) return 0;
    if (index == 46) return 1;
    if (index == 47) return 0;
    if (index == 48) return 1;
    if (index == 49) return 0;
    if (index == 50) return 1;
    if (index == 51) return 0;
    // Row 4
    if (index == 52) return 0;
    if (index == 53) return 0;
    if (index == 54) return 0;
    if (index == 55) return 0;
    if (index == 56) return 1;
    if (index == 57) return 1;
    if (index == 58) return 1;
    if (index == 59) return 0;
    if (index == 60) return 1;
    if (index == 61) return 0;
    if (index == 62) return 1;
    if (index == 63) return 1;
    if (index == 64) return 0;
    // Row 5
    if (index == 65) return 0;
    if (index == 66) return 0;
    if (index == 67) return 0;
    if (index == 68) return 0;
    if (index == 69) return 1;
    if (index == 70) return 1;
    if (index == 71) return 0;
    if (index == 72) return 1;
    if (index == 73) return 0;
    if (index == 74) return 1;
    if (index == 75) return 1;
    if (index == 76) return 1;
    if (index == 77) return 0;
    // Row 6
    if (index == 78) return 0;
    if (index == 79) return 0;
    if (index == 80) return 0;
    if (index == 81) return 0;
    if (index == 82) return 1;
    if (index == 83) return 0;
    if (index == 84) return 1;
    if (index == 85) return 0;
    if (index == 86) return 1;
    if (index == 87) return 0;
    if (index == 88) return 0;
    if (index == 89) return 0;
    if (index == 90) return 0;
    // Row 7
    if (index == 91) return 0;
    if (index == 92) return 1;
    if (index == 93) return 1;
    if (index == 94) return 1;
    if (index == 95) return 0;
    if (index == 96) return 1;
    if (index == 97) return 0;
    if (index == 98) return 1;
    if (index == 99) return 1;
    if (index == 100) return 0;
    if (index == 101) return 0;
    if (index == 102) return 0;
    if (index == 103) return 0;
    // Row 8
    if (index == 104) return 0;
    if (index == 105) return 1;
    if (index == 106) return 1;
    if (index == 107) return 0;
    if (index == 108) return 1;
    if (index == 109) return 0;
    if (index == 110) return 1;
    if (index == 111) return 1;
    if (index == 112) return 1;
    if (index == 113) return 0;
    if (index == 114) return 0;
    if (index == 115) return 0;
    if (index == 116) return 0;
    // Row 9
    if (index == 117) return 0;
    if (index == 118) return 1;
    if (index == 119) return 0;
    if (index == 120) return 1;
    if (index == 121) return 0;
    if (index == 122) return 1;
    if (index == 123) return 0;
    if (index == 124) return 0;
    if (index == 125) return 0;
    if (index == 126) return 0;
    if (index == 127) return 0;
    if (index == 128) return 0;
    if (index == 129) return 2;
    // Row 10
    if (index == 130) return 0;
    if (index == 131) return 0;
    if (index == 132) return 1;
    if (index == 133) return 0;
    if (index == 134) return 1;
    if (index == 135) return 1;
    if (index == 136) return 0;
    if (index == 137) return 0;
    if (index == 138) return 0;
    if (index == 139) return 0;
    if (index == 140) return 2;
    if (index == 141) return 0;
    if (index == 142) return 2;
    // Row 11
    if (index == 143) return 0;
    if (index == 144) return 1;
    if (index == 145) return 0;
    if (index == 146) return 1;
    if (index == 147) return 1;
    if (index == 148) return 1;
    if (index == 149) return 0;
    if (index == 150) return 0;
    if (index == 151) return 0;
    if (index == 152) return 0;
    if (index == 153) return 0;
    if (index == 154) return 2;
    if (index == 155) return 0;
    // Row 12
    if (index == 156) return 1;
    if (index == 157) return 0;
    if (index == 158) return 0;
    if (index == 159) return 0;
    if (index == 160) return 0;
    if (index == 161) return 0;
    if (index == 162) return 0;
    if (index == 163) return 0;
    if (index == 164) return 0;
    if (index == 165) return 2;
    if (index == 166) return 2;
    if (index == 167) return 0;
    if (index == 168) return 2;

    return 0;
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

    gl_FragColor = vec4(color, 1.0);
  }
`

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

const WebGLBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const resolutionLocationRef = useRef<WebGLUniformLocation | null>(null)
  const timeLocationRef = useRef<WebGLUniformLocation | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get WebGL context
    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }
    glRef.current = gl

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create shaders')
      return
    }

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader)
    if (!program) {
      console.error('Failed to create program')
      return
    }
    programRef.current = program

    // Look up attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    resolutionLocationRef.current = gl.getUniformLocation(program, 'u_resolution')
    timeLocationRef.current = gl.getUniformLocation(program, 'u_time')

    // Create a buffer for the fullscreen quad
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // Two triangles that cover the screen
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    // Render function
    const render = () => {
      if (!gl || !program || !resolutionLocationRef.current || !timeLocationRef.current) return

      // Set canvas size to match display size
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight

      gl.viewport(0, 0, canvas.width, canvas.height)

      // Clear the canvas with dark background color
      gl.clearColor(0.11, 0.07, 0.10, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Use our program
      gl.useProgram(program)

      // Set the resolution uniform
      gl.uniform2f(resolutionLocationRef.current, canvas.width, canvas.height)

      // Set the time uniform (in seconds)
      const currentTime = (Date.now() - startTimeRef.current) / 1000
      gl.uniform1f(timeLocationRef.current, currentTime)

      // Set up the position attribute
      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      render()
      animationFrameId = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Handle window resize
    const handleResize = () => {
      render()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -100,
      }}
    />
  )
}

export default WebGLBackground
