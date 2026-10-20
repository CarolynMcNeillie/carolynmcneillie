// Script content is plain Markdown separated by explicit slide and section markers.
export const normalizeBody = (body) => body.split('\n').map((line) => line.trim()).join('\n').trim();
export const normalizeScript = ({ title, body }) => ({ title, body: normalizeBody(body) });
export const renderScriptBody = (body) => body.replace(/[&<>]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;',
})[char]).replace(/_(.*?)_/g, '<em>$1</em>');

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
