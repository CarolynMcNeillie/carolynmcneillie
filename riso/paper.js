export const SIZE = 1080;
export function random(seed) {
  let a = Number(seed) >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function canvas(size = SIZE) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}
function blur(source, amount) {
  const SIZE = source.width;
  const pad = Math.ceil(amount * 4);
  const tiled = document.createElement('canvas');
  tiled.width = tiled.height = SIZE + pad * 2;
  const tg = tiled.getContext('2d');
  for (const x of [-SIZE, 0, SIZE]) {
    for (const y of [-SIZE, 0, SIZE]) tg.drawImage(source, x + pad, y + pad);
  }
  const c = canvas(SIZE);
  const g = c.getContext('2d');
  g.filter = `blur(${amount}px)`;
  g.drawImage(tiled, -pad, -pad);
  return g.getImageData(0, 0, SIZE, SIZE).data;
}
export function makePaper(seed, size = SIZE) {
  const SIZE = size;
  const rng = random(seed),
    c = canvas(size),
    g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 48000; i++) {
    const x = rng() * SIZE,
      y = rng() * SIZE,
      angle = rng() * Math.PI * 2,
      length = 3 + rng() * 22;
    g.strokeStyle = rng() > 0.5 ? 'rgba(255,255,255,.23)' : 'rgba(0,0,0,.23)';
    g.lineWidth = 0.4 + rng();
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(
      x + Math.cos(angle) * length * 0.5 + 2,
      y + Math.sin(angle) * length * 0.5 - 2,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    g.stroke();
    for (const dx of [-SIZE, 0, SIZE])
      for (const dy of [-SIZE, 0, SIZE]) {
        if (!dx && !dy) continue;
        g.beginPath();
        g.moveTo(x + dx, y + dy);
        g.quadraticCurveTo(
          x + dx + Math.cos(angle) * length * 0.5 + 2,
          y + dy + Math.sin(angle) * length * 0.5 - 2,
          x + dx + Math.cos(angle) * length,
          y + dy + Math.sin(angle) * length
        );
        g.stroke();
      }
  }
  let image = g.getImageData(0, 0, SIZE, SIZE);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (rng() - 0.5) * 55;
    for (let j = 0; j < 3; j++) image.data[i + j] += n;
  }
  g.putImageData(image, 0, 0);
  const tooth = blur(c, 0.6);
  image = g.createImageData(SIZE, SIZE);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = rng() * 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = n;
    image.data[i + 3] = 255;
  }
  g.putImageData(image, 0, 0);
  const speckle = g.getImageData(0, 0, SIZE, SIZE).data;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 650; i++) {
    g.fillStyle = rng() > 0.5 ? '#ffffff22' : '#00000022';
    g.beginPath();
    const x = rng() * SIZE,
      y = rng() * SIZE,
      r = 20 + rng() * 60;
    for (const dx of [-SIZE, 0, SIZE])
      for (const dy of [-SIZE, 0, SIZE]) {
        g.beginPath();
        g.arc(x + dx, y + dy, r, 0, Math.PI * 2);
        g.fill();
      }
  }
  const formation = blur(c, 25);
  g.clearRect(0, 0, SIZE, SIZE);
  g.strokeStyle = '#fff';
  g.fillStyle = '#fff';
  for (let i = 0; i < 380; i++) {
    const x = rng() * SIZE,
      y = rng() * SIZE;
    if (rng() < 0.2) {
      g.lineWidth = 0.6;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 3 + rng() * 9, y + rng() * 6);
      g.stroke();
    } else g.fillRect(x, y, 0.7 + rng() * 1.6, 0.7 + rng() * 1.6);
  }
  const dust = g.getImageData(0, 0, SIZE, SIZE).data;
  const out = new Uint8Array(SIZE * SIZE * 4);
  for (let i = 0; i < out.length; i += 4) {
    out[i] = Math.max(0, Math.min(255, (tooth[i] - 128) * 3.8 + 128));
    out[i + 1] = speckle[i];
    out[i + 2] = formation[i];
    out[i + 3] = dust[i + 3];
  }
  return out;
}
