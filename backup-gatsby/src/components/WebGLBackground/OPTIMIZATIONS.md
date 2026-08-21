# WebGLBackground Optimizations

## Shader Optimizations

### 1. Move constant color definitions outside main()
**Current:** Colors are defined inside `main()` and recreated for every pixel
```glsl
// Inside main()
vec3 lightColor = vec3(0.90, 0.80, 0.79);
vec3 mediumColor = vec3(0.20, 0.28, 0.40);
vec3 darkColor = vec3(0.11, 0.07, 0.10);
```

**Optimized:** Define as constants at shader top level
```glsl
const vec3 LIGHT_COLOR = vec3(0.90, 0.80, 0.79);
const vec3 MEDIUM_COLOR = vec3(0.20, 0.28, 0.40);
const vec3 DARK_COLOR = vec3(0.11, 0.07, 0.10);
```

**Impact:** Minor performance gain, cleaner code

---

### 2. Reduce float/int conversions
**Current:** Excessive casting between float and int
```glsl
float(TILE_SIZE)  // appears multiple times
int(clamp(float(tileX), 0.0, float(TILE_SIZE - 1)))
```

**Optimized:** Store values in appropriate types, reduce conversions
```glsl
const float TILE_SIZE_F = float(TILE_SIZE);
tileX = clamp(tileX, 0, TILE_SIZE - 1);  // clamp works on ints too
```

**Impact:** Minor performance gain, cleaner code

---

### 3. Simplify mod operations
**Current:** `cellPos` calculation uses mod that could be reused
```glsl
vec2 cellPos = mod(pixelInTile, cellSize) / cellSize;
```

**Optimized:** Could potentially reuse intermediate values if needed elsewhere

**Impact:** Minimal (already fairly optimized)

---

### 4. Remove redundant corner calculation
**Current:** Corner mask calculated twice - once at line 134-139, again at 189-191 for animation
```glsl
// First calculation
float cornerMask = 1.0 - smoothstep(0.8, 1.0, cornerDist);

// Later, inside animation block
cornerMask = 1.0 - smoothstep(0.8, 1.0, scaledCornerDist);  // Recalculated
```

**Optimized:** Restructure to calculate once or store intermediate values

**Impact:** Minor performance gain for animated cells

---

### 5. Optimize branching with vector operations
**Current:** Two separate if statements for mirroring
```glsl
if (baseTileInMega.x == 1.0) {
  pixelInTile.x = tilePixelSize - pixelInTile.x;
}
if (baseTileInMega.y == 1.0) {
  pixelInTile.y = tilePixelSize - pixelInTile.y;
}
```

**Optimized:** Use vector operations to reduce branching
```glsl
vec2 flip = vec2(baseTileInMega.x, baseTileInMega.y);
pixelInTile = mix(pixelInTile, vec2(tilePixelSize) - pixelInTile, flip);
```

**Impact:** Minor performance gain on some GPUs (branch prediction varies)

---

## JavaScript Optimizations

### 6. Only resize canvas when actually resized
**Current:** Canvas resized every frame (line 315-316)
```javascript
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
```

**Optimized:** Check if size changed first
```javascript
if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
```

**Impact:** Significant performance gain - avoids expensive canvas resize and GL state changes

---

### 7. Use VAO (Vertex Array Object)
**Current:** Attribute state set every frame
```javascript
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
```

**Optimized:** Cache attribute state in VAO
```javascript
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Later in render:
gl.bindVertexArray(vao);
```

**Impact:** Minor performance gain, cleaner code

---

### 8. Remove redundant resize handler
**Current:** Resize handler calls render(), but render already runs every frame via requestAnimationFrame
```javascript
const handleResize = () => {
  render();
};
window.addEventListener("resize", handleResize);
```

**Optimized:** Remove resize handler entirely (already handled by optimization #6)

**Impact:** Minor - removes unnecessary render call on resize

---

### 9. Cache attribute locations
**Current:** `positionLocation` is looked up but not stored
```javascript
const positionLocation = gl.getAttribLocation(program, "a_position");
```

**Optimized:** Store in a ref for consistency with uniforms (though less critical since it's only used in setup)

**Impact:** Minimal (already only called once)

---

### 10. Remove unused refs
**Current:** `glRef` and `programRef` stored but never accessed after initialization
```javascript
const glRef = useRef<WebGL2RenderingContext | null>(null);
const programRef = useRef<WebGLProgram | null>(null);
// ... stored but never read
```

**Optimized:** Remove these refs or actually use them if needed

**Impact:** Minimal memory savings, cleaner code

---

## Priority Recommendations

**High Priority:**
- #6: Only resize canvas when needed (significant perf gain)
- #1: Move color constants outside main() (cleaner, minor perf)

**Medium Priority:**
- #7: Use VAO (modern best practice)
- #8: Remove redundant resize handler

**Low Priority:**
- #2, #4, #5, #10: Minor gains, mostly code cleanup
- #3, #9: Already fairly optimal
