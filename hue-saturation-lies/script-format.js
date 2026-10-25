// Script content is plain Markdown separated by explicit slide and section markers.
export const normalizeBody = (body) => {
  let fenced = false;
  return body.split('\n').map((line) => {
    if (line.trim().startsWith('```')) { fenced = !fenced; return line.trim(); }
    return fenced ? line.trimEnd() : line.trim();
  }).join('\n').trim();
};
export const normalizeScript = ({ title, body }) => ({ title, body: normalizeBody(body) });

const escapeHTML = (text) => text.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function spokenWords(body) {
  const clean = body
    .replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
    .replace(/\(\[[^\]]+\]\([^)]*\)\)/g, '')
    .replace(/\[[^\]]*\](?!\([^)]*\))/g, '')
    .replace(/\(Audience participation:[^)]*\)/gs, '');
  return (clean.match(/\S+/g) ?? []).length;
}

export function renderScriptBody(body) {
  const tokens = [];
  const keep = (html) => {
    tokens.push(html);
    return `\u0000${tokens.length - 1}\u0000`;
  };
  let html = escapeHTML(body)
    .replace(/^```[^\n]*\n([\s\S]*?)^```\s*$/gm, (_, code) => keep(`<pre><code>${code.replace(/\n$/, '')}</code></pre>`))
    .replace(/`([^`\n]+)`/g, (_, code) => keep(`<code>${code}</code>`))
    .replace(/\(\[([^\]]+)\]\((https?:\/\/[^)]+)\)\)/g, (_, label, url) => keep(`<a class="cite" href="${url}">(${label})</a>`))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label, url) => keep(`<a href="${url}">${label}</a>`))
    .replace(/\[([^\]\n]+)\]/g, (_, cue) => keep(`<span class="cue">[${cue}]</span>`));
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>');
  return html.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

export function parseScript(text) {
  const scripts = Object.create(null);
  let id = null;
  let title = null;
  let body = [];
  function finish() {
    if (id !== null) {
      if (title === null) title = '';
      if (Object.hasOwn(scripts, id)) throw new Error(`Duplicate slide: ${id}`);
      scripts[id] = { title, body: body.join('\n').trim() };
    }
  }
  for (const line of text.split(/\r?\n/)) {
    const section = /^<!-- section: (.+) -->$/.exec(line);
    const slide = /^<!-- slide: ([a-z0-9-]+) -->$/.exec(line);
    if (section || slide) {
      finish();
      id = slide?.[1] ?? null;
      title = null;
      body = [];
    } else if (id !== null && title === null) {
      if (!line.trim()) continue;
      if (/^##( |$)/.test(line)) title = line === '##' ? '' : line.slice(3);
      else { title = ''; body.push(line); }
    } else if (id !== null) {
      body.push(line);
    }
  }
  finish();
  return scripts;
}

export function serializeScript(order, scripts) {
  return order.sections.map(({ name, items }) => [
    `<!-- section: ${name} -->`,
    ...items.filter((item) => 'id' in item).map(({ id }) => {
      const script = scripts[id];
      if (!script) throw new Error(`Missing script: ${id}`);
      return `<!-- slide: ${id} -->\n${script.title ? `## ${script.title}` : '##'}\n\n${normalizeBody(script.body)}`;
    }),
  ].join('\n\n')).join('\n\n') + '\n';
}
