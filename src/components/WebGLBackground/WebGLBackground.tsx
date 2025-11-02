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

  // Tile pattern data (15x15, Tile 2)
  const int TILE_SIZE = 15;

  int getPatternValue(int x, int y) {
    int index = y * TILE_SIZE + x;

    // Tile 2 pattern data
    if (index == 0) return 2;
    if (index == 1) return 0;
    if (index == 2) return 0;
    if (index == 3) return 0;
    if (index == 4) return 0;
    if (index == 5) return 0;
    if (index == 6) return 0;
    if (index == 7) return 0;
    if (index == 8) return 0;
    if (index == 9) return 0;
    if (index == 10) return 0;
    if (index == 11) return 0;
    if (index == 12) return 0;
    if (index == 13) return 0;
    if (index == 14) return 2;
    if (index == 15) return 0;
    if (index == 16) return 2;
    if (index == 17) return 2;
    if (index == 18) return 2;
    if (index == 19) return 0;
    if (index == 20) return 0;
    if (index == 21) return 0;
    if (index == 22) return 0;
    if (index == 23) return 1;
    if (index == 24) return 1;
    if (index == 25) return 1;
    if (index == 26) return 1;
    if (index == 27) return 0;
    if (index == 28) return 2;
    if (index == 29) return 0;
    if (index == 30) return 0;
    if (index == 31) return 2;
    if (index == 32) return 2;
    if (index == 33) return 0;
    if (index == 34) return 0;
    if (index == 35) return 0;
    if (index == 36) return 0;
    if (index == 37) return 1;
    if (index == 38) return 1;
    if (index == 39) return 1;
    if (index == 40) return 1;
    if (index == 41) return 0;
    if (index == 42) return 2;
    if (index == 43) return 0;
    if (index == 44) return 0;
    if (index == 45) return 0;
    if (index == 46) return 2;
    if (index == 47) return 0;
    if (index == 48) return 0;
    if (index == 49) return 0;
    if (index == 50) return 0;
    if (index == 51) return 1;
    if (index == 52) return 1;
    if (index == 53) return 1;
    if (index == 54) return 1;
    if (index == 55) return 0;
    if (index == 56) return 2;
    if (index == 57) return 0;
    if (index == 58) return 1;
    if (index == 59) return 0;
    if (index == 60) return 0;
    if (index == 61) return 0;
    if (index == 62) return 0;
    if (index == 63) return 0;
    if (index == 64) return 0;
    if (index == 65) return 0;
    if (index == 66) return 0;
    if (index == 67) return 0;
    if (index == 68) return 0;
    if (index == 69) return 2;
    if (index == 70) return 0;
    if (index == 71) return 1;
    if (index == 72) return 1;
    if (index == 73) return 0;
    if (index == 74) return 0;
    if (index == 75) return 0;
    if (index == 76) return 0;
    if (index == 77) return 0;
    if (index == 78) return 1;
    if (index == 79) return 1;
    if (index == 80) return 1;
    if (index == 81) return 0;
    if (index == 82) return 2;
    if (index == 83) return 0;
    if (index == 84) return 1;
    if (index == 85) return 1;
    if (index == 86) return 1;
    if (index == 87) return 0;
    if (index == 88) return 0;
    if (index == 89) return 0;
    if (index == 90) return 0;
    if (index == 91) return 1;
    if (index == 92) return 0;
    if (index == 93) return 1;
    if (index == 94) return 1;
    if (index == 95) return 0;
    if (index == 96) return 2;
    if (index == 97) return 0;
    if (index == 98) return 0;
    if (index == 99) return 1;
    if (index == 100) return 1;
    if (index == 101) return 1;
    if (index == 102) return 0;
    if (index == 103) return 0;
    if (index == 104) return 0;
    if (index == 105) return 1;
    if (index == 106) return 1;
    if (index == 107) return 0;
    if (index == 108) return 1;
    if (index == 109) return 0;
    if (index == 110) return 2;
    if (index == 111) return 0;
    if (index == 112) return 1;
    if (index == 113) return 0;
    if (index == 114) return 1;
    if (index == 115) return 1;
    if (index == 116) return 0;
    if (index == 117) return 0;
    if (index == 118) return 0;
    if (index == 119) return 1;
    if (index == 120) return 1;
    if (index == 121) return 0;
    if (index == 122) return 1;
    if (index == 123) return 0;
    if (index == 124) return 2;
    if (index == 125) return 0;
    if (index == 126) return 0;
    if (index == 127) return 1;
    if (index == 128) return 1;
    if (index == 129) return 0;
    if (index == 130) return 0;
    if (index == 131) return 1;
    if (index == 132) return 1;
    if (index == 133) return 1;
    if (index == 134) return 0;
    if (index == 135) return 0;
    if (index == 136) return 2;
    if (index == 137) return 0;
    if (index == 138) return 1;
    if (index == 139) return 1;
    if (index == 140) return 0;
    if (index == 141) return 1;
    if (index == 142) return 0;
    if (index == 143) return 0;
    if (index == 144) return 0;
    if (index == 145) return 0;
    if (index == 146) return 1;
    if (index == 147) return 1;
    if (index == 148) return 1;
    if (index == 149) return 0;
    if (index == 150) return 2;
    if (index == 151) return 0;
    if (index == 152) return 1;
    if (index == 153) return 1;
    if (index == 154) return 1;
    if (index == 155) return 0;
    if (index == 156) return 0;
    if (index == 157) return 0;
    if (index == 158) return 0;
    if (index == 159) return 0;
    if (index == 160) return 0;
    if (index == 161) return 1;
    if (index == 162) return 1;
    if (index == 163) return 0;
    if (index == 164) return 2;
    if (index == 165) return 0;
    if (index == 166) return 0;
    if (index == 167) return 0;
    if (index == 168) return 0;
    if (index == 169) return 0;
    if (index == 170) return 0;
    if (index == 171) return 0;
    if (index == 172) return 0;
    if (index == 173) return 0;
    if (index == 174) return 0;
    if (index == 175) return 0;
    if (index == 176) return 1;
    if (index == 177) return 0;
    if (index == 178) return 2;
    if (index == 179) return 0;
    if (index == 180) return 1;
    if (index == 181) return 1;
    if (index == 182) return 1;
    if (index == 183) return 1;
    if (index == 184) return 0;
    if (index == 185) return 0;
    if (index == 186) return 0;
    if (index == 187) return 0;
    if (index == 188) return 2;
    if (index == 189) return 0;
    if (index == 190) return 0;
    if (index == 191) return 0;
    if (index == 192) return 2;
    if (index == 193) return 0;
    if (index == 194) return 1;
    if (index == 195) return 1;
    if (index == 196) return 1;
    if (index == 197) return 1;
    if (index == 198) return 0;
    if (index == 199) return 0;
    if (index == 200) return 0;
    if (index == 201) return 0;
    if (index == 202) return 2;
    if (index == 203) return 2;
    if (index == 204) return 0;
    if (index == 205) return 0;
    if (index == 206) return 2;
    if (index == 207) return 0;
    if (index == 208) return 1;
    if (index == 209) return 1;
    if (index == 210) return 1;
    if (index == 211) return 1;
    if (index == 212) return 0;
    if (index == 213) return 0;
    if (index == 214) return 0;
    if (index == 215) return 0;
    if (index == 216) return 2;
    if (index == 217) return 2;
    if (index == 218) return 2;
    if (index == 219) return 0;
    if (index == 220) return 2;
    if (index == 221) return 0;
    if (index == 222) return 0;
    if (index == 223) return 0;
    if (index == 224) return 0;
    if (index == 225) return 0;
    if (index == 226) return 0;
    if (index == 227) return 0;
    if (index == 228) return 0;
    if (index == 229) return 0;
    if (index == 230) return 0;
    if (index == 231) return 0;
    if (index == 232) return 0;
    if (index == 233) return 0;
    if (index == 234) return 2;

    return 0;
  }

  void main() {
    // Normalize pixel coordinates (0.0 to 1.0)
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // Calculate aspect ratio and correct coordinates to maintain square cells
    float aspect = u_resolution.x / u_resolution.y;
    vec2 correctedUV = uv;

    if (aspect > 1.0) {
      // Landscape: stretch horizontally
      correctedUV.x *= aspect;
    } else {
      // Portrait: stretch vertically
      correctedUV.y /= aspect;
    }

    // Calculate size of one cell in screen space
    // We want one full 30x30 pattern centered, then tiled outward
    float cellSize = min(u_resolution.x, u_resolution.y) / 30.0;

    // Center position in pixels
    vec2 centerPixel = u_resolution * 0.5;

    // Calculate pixel position from center
    vec2 pixelFromCenter = gl_FragCoord.xy - centerPixel;

    // Size of one base tile in pixels
    float baseTileSize = cellSize * float(TILE_SIZE);

    // Which base tile are we in? (can be negative)
    vec2 tileCoordFloat = pixelFromCenter / baseTileSize;
    int tileCol = int(floor(tileCoordFloat.x));
    int tileRow = int(floor(tileCoordFloat.y));

    // Position within the current base tile (in pixels)
    vec2 pixelInTile = pixelFromCenter - vec2(float(tileCol), float(tileRow)) * baseTileSize;

    // Which cell within this base tile (0-14)
    int baseTileX = int(floor(pixelInTile.x / cellSize));
    int baseTileY = int(floor(pixelInTile.y / cellSize));

    // Clamp to valid range
    baseTileX = int(clamp(float(baseTileX), 0.0, float(TILE_SIZE - 1)));
    baseTileY = int(clamp(float(baseTileY), 0.0, float(TILE_SIZE - 1)));

    // Apply alternating flip logic based on tile position
    int tileX = baseTileX;
    int tileY = baseTileY;

    // Odd column tiles flip horizontally
    if (int(mod(float(tileCol), 2.0)) != 0) {
      tileX = TILE_SIZE - 1 - baseTileX;
    }

    // Odd row tiles flip vertically
    if (int(mod(float(tileRow), 2.0)) != 0) {
      tileY = TILE_SIZE - 1 - baseTileY;
    }

    // Get the pattern value for this cell
    int patternValue = getPatternValue(tileX, tileY);

    // Define colors
    vec3 lightColor = vec3(0.90, 0.80, 0.79);  // light pink
    vec3 mediumColor = vec3(0.20, 0.28, 0.40); // medium blue
    vec3 darkColor = vec3(0.11, 0.07, 0.10);   // dark

    // Select color based on pattern value
    vec3 color = darkColor;
    if (patternValue == 1) {
      color = lightColor;
    } else if (patternValue == 2) {
      color = mediumColor;
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
      if (!gl || !program || !resolutionLocationRef.current) return

      // Set canvas size to match display size
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight

      gl.viewport(0, 0, canvas.width, canvas.height)

      // Clear the canvas
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Use our program
      gl.useProgram(program)

      // Set the resolution uniform
      gl.uniform2f(resolutionLocationRef.current, canvas.width, canvas.height)

      // Set up the position attribute
      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    // Initial render
    render()

    // Handle window resize
    const handleResize = () => {
      render()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
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
