import { LIBRARY } from "./slide-library.js";
import ORDER from "./running-order.js";
import { parseScript } from "./script-format.js";

export { LIBRARY, ORDER };

try {
  const response = await fetch(new URL('./script.md', import.meta.url));
  if (!response.ok) throw new Error(`script.md: ${response.status}`);
  const scripts = parseScript(await response.text());
  for (const [id, content] of Object.entries(LIBRARY)) {
    content.script = scripts[id] ?? { title: '', body: '' };
  }
} catch (error) {
  console.warn('Script unavailable; continuing without notes.', error);
  for (const content of Object.values(LIBRARY)) content.script = { title: '', body: '' };
}

const escapeHtml = (text) => text.replace(/[&<>"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
})[character]);

export const SLIDES = ORDER.sections.flatMap(({ items }) =>
  items.flatMap((item) => {
    if (item.hidden) return [];
    if ("placeholder" in item) {
      const note = escapeHtml(item.note);
      return [{
        id: item.placeholder,
        placeholder: true,
        slide: { body: note },
        script: { title: "Placeholder", body: note },
      }];
    }
    const content = LIBRARY[item.id];
    if (!content) {
      console.warn(`Unknown slide id: ${item.id}`);
      return [];
    }
    return [{ id: item.id, ...content }];
  }),
);
