import { LIBRARY, SLIDES } from './slides.js';
import { normalizeScript, renderScriptBody } from './script-format.js';

if (['127.0.0.1', 'localhost'].includes(location.hostname)) {
  const panel = document.querySelector('#slide-content');
  const titleEl = document.querySelector('#slide-title');
  const bodyEl = document.querySelector('#slide-body');
  const editor = document.querySelector('#script-editor');
  const input = document.querySelector('#script-edit-title');
  const textarea = document.querySelector('#script-edit-body');
  const countEl = document.querySelector('#script-edit-count');
  const status = document.querySelector('#script-edit-status');
  const banner = document.querySelector('#draft-banner');
  const review = document.querySelector('#draft-review');
  let id, base, timer, pending = Promise.resolve();
  const key = (slideId) => `hsl-draft:${slideId}`;
  const current = () => {
    const hash = decodeURIComponent(location.hash.slice(1));
    return SLIDES[/^\d+$/.test(hash) ? Number(hash) : SLIDES.findIndex((slide) => slide.id === hash)] ?? SLIDES[0];
  };
  const text = () => ({ title: input.value, body: textarea.value });
  const words = (body) => (body.trim().match(/\S+/g) ?? []).length;
  const drafts = () => Object.keys(localStorage).filter((name) => name.startsWith('hsl-draft:'));
  function bannerUpdate() {
    const n = drafts().length;
    banner.hidden = n === 0;
    document.querySelector('#draft-count').textContent = `${n} unsaved edit${n === 1 ? '' : 's'} · Review`;
  }
  function showNotes(slideId) {
    if (current().id !== slideId) return;
    const script = LIBRARY[slideId].script;
    titleEl.textContent = script.title;
    bodyEl.innerHTML = renderScriptBody(script.body);
  }
  async function send(slideId, value, previous, keepalive = false) {
    const response = await fetch(`/api/script/${encodeURIComponent(slideId)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, keepalive,
      // Send only the fields the server accepts: a draft object also carries `at`.
      body: JSON.stringify({
        title: value.title, body: value.body,
        base: { title: previous.title, body: previous.body },
      }),
    });
    if (response.status === 409) return 'conflict';
    if (!response.ok) throw new Error(await response.text());
    LIBRARY[slideId].script = normalizeScript(value);
    // SLIDES entries copied the script object at load; the engine renders
    // notes from them, so point them at the saved text too.
    for (const slide of SLIDES) if (slide.id === slideId) slide.script = LIBRARY[slideId].script;
    showNotes(slideId);
    return 'saved';
  }
  function save(keepalive = false) {
    if (!id) return pending;
    clearTimeout(timer);
    timer = null;
    const slideId = id;
    const value = text();
    status.textContent = 'Saving…';
    pending = pending.catch(() => {}).then(async () => {
      const previous = base;
      try {
        const result = await send(slideId, value, previous, keepalive);
        if (result === 'conflict') {
          status.textContent = 'Conflict: script.md changed. Reload to see it.';
        } else {
          if (id === slideId) base = { ...LIBRARY[slideId].script };
          const draft = JSON.parse(localStorage.getItem(key(slideId)) || 'null');
          if (draft && draft.title === value.title && draft.body === value.body) localStorage.removeItem(key(slideId));
          else if (draft) localStorage.setItem(key(slideId), JSON.stringify({ ...draft, base: LIBRARY[slideId].script }));
          status.textContent = 'Saved';
        }
      } catch {
        status.textContent = 'Not saved: run `node tools/serve.mjs`';
      }
      bannerUpdate();
    });
    return pending;
  }
  function close() {
    if (editor.hidden) return;
    save();
    editor.hidden = true;
    titleEl.hidden = false;
    bodyEl.hidden = false;
    id = null;
  }
  function open() {
    const slide = current();
    if (!Object.hasOwn(LIBRARY, slide.id)) return;
    if (!editor.hidden) close();
    if (document.body.classList.contains('presenter')) window.dispatchEvent(new CustomEvent('hsl:set-mode', { detail: { presenter: false } }));
    id = slide.id;
    const draft = JSON.parse(localStorage.getItem(key(id)) || 'null');
    base = draft?.base ?? { ...LIBRARY[id].script };
    input.value = draft?.title ?? LIBRARY[id].script.title;
    textarea.value = draft?.body ?? LIBRARY[id].script.body;
    count();
    status.textContent = '';
    editor.hidden = false;
    titleEl.hidden = true;
    bodyEl.hidden = true;
    textarea.focus();
  }
  function count() {
    const n = words(textarea.value);
    countEl.textContent = `${n} words · ${(n / 130).toFixed(1)} min`;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
  for (const field of [input, textarea]) field.addEventListener('input', () => {
    count();
    localStorage.setItem(key(id), JSON.stringify({ ...text(), base, at: Date.now() }));
    bannerUpdate();
    clearTimeout(timer);
    timer = setTimeout(save, 1000);
  });
  const flush = () => { if (timer && id) save(true); };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  editor.addEventListener('focusout', () => setTimeout(() => {
    if (!editor.hidden && !editor.contains(document.activeElement)) close();
  }, 0));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !editor.hidden) { event.preventDefault(); close(); return; }
    if (event.key.toLowerCase() === 'e' && !event.repeat &&
        !event.target.closest?.('input, textarea, select, [contenteditable]') &&
        document.querySelector('#slide-sorter')?.hidden !== false) {
      // Without this, the same keypress types an "e" into the textarea that open() just focused.
      event.preventDefault();
      open();
    }
  });
  panel.addEventListener('click', (event) => {
    if (event.target === bodyEl || event.target.closest?.('#slide-body')) open();
  });
  function renderReview() {
    review.replaceChildren();
    for (const name of drafts()) {
      const slideId = name.slice('hsl-draft:'.length);
      let draft;
      try { draft = JSON.parse(localStorage.getItem(name)); } catch { continue; }
      if (!draft || !Object.hasOwn(LIBRARY, slideId)) continue;
      const file = LIBRARY[slideId].script;
      const row = document.createElement('div');
      row.className = 'draft-row';
      const heading = document.createElement('h3');
      heading.textContent = `${slideId}: ${draft.title}`;
      const comparison = document.createElement('div');
      comparison.className = 'draft-comparison';
      for (const [label, value] of [['Draft', draft], ['script.md', file]]) {
        const pre = document.createElement('pre');
        pre.textContent = `${label}: ${value.title}\n\n${value.body}`;
        // The comparison scrolls, so keyboard users need to be able to focus it (WCAG 2.1.1).
        pre.tabIndex = 0;
        pre.setAttribute('role', 'region');
        pre.setAttribute('aria-label', `${label} text for ${slideId}`);
        comparison.append(pre);
      }
      const message = document.createElement('p');
      message.setAttribute('role', 'status');
      const conflict = draft.base?.title !== file.title || draft.base?.body !== file.body;
      if (conflict) message.textContent = 'Conflict: the file changed after this draft';
      const apply = document.createElement('button');
      apply.textContent = 'Apply';
      apply.setAttribute('aria-label', `Apply draft: ${slideId}`);
      let overwrite = false;
      apply.addEventListener('click', async () => {
        if (conflict && !overwrite) {
          overwrite = true;
          apply.textContent = 'Overwrite with draft';
          apply.setAttribute('aria-label', `Overwrite with draft: ${slideId}`);
          return;
        }
        apply.disabled = true;
        try {
          const result = await send(slideId, draft, conflict ? file : draft.base);
          if (result === 'conflict') { message.textContent = 'Conflict: script.md changed. Reload to see it.'; apply.disabled = false; return; }
          localStorage.removeItem(name);
          bannerUpdate();
          renderReview();
        } catch { message.textContent = 'Not saved: run `node tools/serve.mjs`'; apply.disabled = false; }
      });
      const discard = document.createElement('button');
      discard.textContent = 'Discard';
      discard.setAttribute('aria-label', `Discard draft: ${slideId}`);
      discard.addEventListener('click', () => { localStorage.removeItem(name); bannerUpdate(); renderReview(); });
      row.append(heading, comparison, message, apply, discard);
      review.append(row);
    }
  }
  document.querySelector('#draft-review-button').addEventListener('click', () => {
    review.hidden = !review.hidden;
    if (!review.hidden) renderReview();
  });
  document.querySelector('#draft-export').addEventListener('click', () => {
    const data = Object.fromEntries(drafts().map((name) => [name, JSON.parse(localStorage.getItem(name))]));
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hsl-drafts.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  bannerUpdate();
}
