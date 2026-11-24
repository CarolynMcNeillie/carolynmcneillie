import { mkdir, writeFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

// Use the preview server and a dedicated Chrome CDP port; do not control other browsers.
const origin = process.env.BAKE_ORIGIN || 'http://localhost:8799';
const endpoint = 'http://127.0.0.1:9240';
export async function tab(url) {
  const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then(r => r.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let serial = 0;
  const pending = new Map(), listeners = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
      else entry.resolve(message.result);
    } else listeners.forEach(listener => listener(message));
  });
  return {
    on: listener => listeners.push(listener),
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++serial;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    async close() { socket.close(); await fetch(`${endpoint}/json/close/${target.id}`); }
  };
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const page = await tab('about:blank');
  try {
    await page.send('Page.enable');
    await page.send('Network.enable');
    await page.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page.send('Page.navigate', { url: `${origin}/tools/bake.html` });
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = await page.send('Runtime.evaluate', { expression: 'typeof window.bake' });
      if (result.result.value === 'function') break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const result = await page.send('Runtime.evaluate', {
      expression: 'window.bake()', awaitPromise: true, returnByValue: true
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    await mkdir(new URL('../images/', import.meta.url), { recursive: true });
    for (const [key, value] of Object.entries(result.result.value)) {
      const pngBytes = Buffer.from(value.png.split(',')[1], 'base64');
      const name = key === 'name' ? 'name' : 'card-paper';
      const intermediate = `/tmp/${name}-bake.png`;
      const output = new URL(`../images/${name}.webp`, import.meta.url);
      await writeFile(intermediate, pngBytes);
      execFileSync('cwebp', ['-q', '95', '-sharp_yuv', intermediate, '-o', output.pathname]);
      console.log(`${name}: ${value.width} x ${value.height} CSS px; WebP q=95 ${(await stat(output)).size} B`);
    }
  } finally { await page.close(); }
}
