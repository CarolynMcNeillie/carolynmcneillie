import { LIBRARY, ORDER, SLIDES } from './slides.js';

const dialog = document.querySelector('#slide-sorter');
const sectionsEl = document.querySelector('#sorter-sections');
const totalEl = document.querySelector('#sorter-total');
const statusEl = document.querySelector('#sorter-save-status');
const closeButton = document.querySelector('#sorter-close');
let order = structuredClone(ORDER);
let lastFocus;
let dirty = false;
let saved = false;
let saveQueue = Promise.resolve();
let saveFailed = false;

const words = (text = '') => (text.trim().match(/\S+/g) || []).length;
const itemId = (item) => item.id ?? item.placeholder;
const content = (item) => item.id ? LIBRARY[item.id] : { slide: {}, script: { title: 'Placeholder', body: item.note } };
const visibleIds = () => order.sections.flatMap((section) => section.items.filter((item) => !item.hidden).map(itemId));
const minuteLabel = (count) => `${(count / 130).toFixed(1)} min`;
const button = (text, label, click) => {
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = text;
  if (label) el.setAttribute('aria-label', label);
  el.addEventListener('click', click);
  return el;
};
function updateStatus(text) { statusEl.textContent = text; }
function save() {
  dirty = true;
  const snapshot = JSON.stringify(order);
  updateStatus('Saving…');
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    try {
      const response = await fetch('/api/running-order', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: snapshot,
      });
      if (!response.ok) throw new Error(await response.text());
      saved = true;
      saveFailed = false;
      if (snapshot === JSON.stringify(order)) updateStatus('Saved');
    } catch {
      saveFailed = true;
      updateStatus('Not saved: run `node tools/serve.mjs`');
    }
  });
}
function change(focusId, focusControl) {
  render(focusId, focusControl);
  save();
}
function find(id) {
  for (const section of order.sections) {
    const index = section.items.findIndex((item) => itemId(item) === id);
    if (index !== -1) return { section, index, item: section.items[index] };
  }
  return null;
}
function move(id, targetSection, position, focusControl) {
  const origin = find(id);
  if (!origin) return;
  const from = origin.section.items;
  const destination = order.sections[targetSection].items;
  const [item] = from.splice(origin.index, 1);
  if (from === destination && origin.index < position) position--;
  destination.splice(position, 0, item);
  change(id, focusControl);
}
function moveByKey(id, direction) {
  const origin = find(id);
  if (!origin) return;
  const si = order.sections.indexOf(origin.section);
  const focusControl = direction > 0 ? 'sorter-move-down' : 'sorter-move-up';
  const position = origin.index + direction;
  if (position >= 0 && position < origin.section.items.length) {
    // move() removes the card first, so a downward target is one past its final index.
    move(id, si, direction > 0 ? position + 1 : position, focusControl);
    return;
  }
  // At a section edge: end of the previous section or start of the next, empty ones included.
  const target = si + direction;
  if (target < 0 || target >= order.sections.length) return;
  move(id, target, direction > 0 ? 0 : order.sections[target].items.length, focusControl);
}
function moveSection(from, to, focusDirection) {
  if (to < 0 || to >= order.sections.length || to === from) return;
  const [section] = order.sections.splice(from, 1);
  order.sections.splice(to, 0, section);
  change();
  if (!focusDirection) return;
  const group = sectionsEl.children[to];
  const preferred = group.querySelector(`[data-section-move="${focusDirection}"]`);
  (preferred.disabled ? group.querySelector(`[data-section-move="${-focusDirection}"]`) : preferred).focus();
}
function openSlide(id) {
  const item = find(id)?.item;
  if (!item || item.hidden) return;
  // The order can change while the sorter is open; reload reads the saved order.
  close(id);
}
function makeCard(item) {
  const id = itemId(item);
  const { slide, script } = content(item);
  const card = document.createElement('li');
  card.className = 'sorter-card';
  card.dataset.id = id;
  if (item.hidden) card.classList.add('is-hidden');
  card.draggable = true;
  card.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragover', (event) => { event.preventDefault(); card.classList.add('drop-target'); });
  card.addEventListener('dragleave', () => card.classList.remove('drop-target'));
  card.addEventListener('drop', (event) => {
    event.preventDefault();
    card.classList.remove('drop-target');
    const source = event.dataTransfer.getData('text/plain');
    if (source === id || !find(source)) return;
    const sectionIndex = order.sections.findIndex((section) => section.items.includes(item));
    const index = order.sections[sectionIndex].items.indexOf(item);
    move(source, sectionIndex, index + (event.clientY > card.getBoundingClientRect().top + card.offsetHeight / 2 ? 1 : 0));
  });
  const image = slide.backgrounds?.[0]?.image ?? slide.backgroundImage ?? slide.illustration;
  const thumb = document.createElement('div');
  thumb.className = 'sorter-thumb';
  if (image) thumb.style.backgroundImage = `url("${image.replaceAll('"', '%22')}")`;
  thumb.setAttribute('aria-hidden', 'true');
  card.append(thumb);
  const details = document.createElement('div');
  details.className = 'sorter-details';
  const title = item.placeholder ? item.note || 'Placeholder' : [slide.title, script.title].filter(Boolean).filter((value, index, titles) => titles.indexOf(value) === index).join(' / ') || id;
  const heading = button(title, null, () => openSlide(id));
  heading.className = 'sorter-card-link';
  heading.disabled = !!item.hidden;
  if (!item.hidden) card.title = 'Go to this slide';
  // The whole card jumps to the slide; its own buttons (title, move, hide, edit) keep their jobs.
  card.addEventListener('click', (event) => {
    if (event.target.closest('button') || item.hidden) return;
    openSlide(id);
  });
  details.append(heading);
  const kind = item.placeholder ? 'placeholder' : slide.demo ? `demo: ${slide.demo}` : slide.viz ? 'viz' : image ? 'image' : 'body text';
  const meta = document.createElement('span');
  meta.className = 'sorter-meta';
  meta.textContent = `${id} · ${kind} · ${words(script.body)} words`;
  details.append(meta);
  card.append(details);
  const controls = document.createElement('div');
  controls.className = 'sorter-controls';
  const label = item.placeholder ? `placeholder: ${item.note}` : id;
  const up = button('↑', `Move ${label} up`, () => moveByKey(id, -1));
  up.classList.add('sorter-move-up');
  const down = button('↓', `Move ${label} down`, () => moveByKey(id, 1));
  down.classList.add('sorter-move-down');
  const visibility = button(item.hidden ? 'Show' : 'Hide', `${item.hidden ? 'Show' : 'Hide'} ${label}`, () => {
    item.hidden = !item.hidden;
    change(id, 'sorter-visibility-toggle');
  });
  visibility.className = 'sorter-visibility-toggle';
  controls.append(up, down, visibility);
  if (item.placeholder) {
    controls.append(button('Edit', `Edit ${label}`, () => {
      const note = prompt('Placeholder note', item.note);
      if (note === null) return;
      item.note = note;
      change(id);
    }), button('Delete', `Delete ${label}`, () => {
      find(id).section.items.splice(find(id).index, 1);
      change();
    }));
  }
  card.append(controls);
  return card;
}
function render(focusId, focusControl) {
  sectionsEl.replaceChildren();
  let total = 0;
  for (const [si, section] of order.sections.entries()) {
    const wordCount = section.items.reduce((sum, item) => sum + (item.hidden ? 0 : words(content(item).script.body)), 0);
    total += wordCount;
    const group = document.createElement('section');
    group.className = 'sorter-section';
    const header = document.createElement('div');
    header.className = 'sorter-section-header';
    const title = document.createElement('h3');
    title.textContent = `${section.name} · ${minuteLabel(wordCount)}`;
    const rename = button('Rename', `Rename ${section.name}`, () => {
      const name = prompt('Section name', section.name);
      if (!name?.trim()) return;
      section.name = name.trim();
      change();
    });
    const remove = button('Delete', `Delete ${section.name}`, () => {
      order.sections.splice(si, 1);
      change();
    });
    remove.disabled = !!section.items.length || order.sections.length === 1;
    const sectionUp = button('↑', `Move section ${section.name} up`, () => moveSection(si, si - 1, -1));
    sectionUp.dataset.sectionMove = '-1';
    sectionUp.disabled = si === 0;
    const sectionDown = button('↓', `Move section ${section.name} down`, () => moveSection(si, si + 1, 1));
    sectionDown.dataset.sectionMove = '1';
    sectionDown.disabled = si === order.sections.length - 1;
    header.append(title, sectionUp, sectionDown, rename, remove);
    // Drag a section by its header. Cards carry their id as text/plain, so the
    // "section:" prefix keeps the two kinds of drag apart.
    header.draggable = true;
    header.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', `section:${si}`);
      event.dataTransfer.effectAllowed = 'move';
    });
    group.addEventListener('dragover', (event) => { event.preventDefault(); group.classList.add('drop-target'); });
    group.addEventListener('dragleave', (event) => {
      if (!group.contains(event.relatedTarget)) group.classList.remove('drop-target');
    });
    group.addEventListener('drop', (event) => {
      group.classList.remove('drop-target');
      const data = event.dataTransfer.getData('text/plain');
      if (data.startsWith('section:')) {
        event.preventDefault();
        const from = Number(data.slice('section:'.length));
        const after = event.clientY > group.getBoundingClientRect().top + group.offsetHeight / 2;
        let to = si + (after ? 1 : 0);
        if (from < to) to--;
        moveSection(from, to);
        return;
      }
      // A card or list drop already placed the card. Anywhere else in the
      // section (header, gap, placeholder button) puts it at the end.
      if (event.defaultPrevented || !find(data)) return;
      event.preventDefault();
      move(data, si, section.items.length);
    });
    group.append(header);
    const list = document.createElement('ol');
    list.className = 'sorter-list';
    list.addEventListener('dragover', (event) => event.preventDefault());
    list.addEventListener('drop', (event) => {
      if (event.target.closest('.sorter-card')) return;
      event.preventDefault();
      const id = event.dataTransfer.getData('text/plain');
      if (find(id)) move(id, si, section.items.length);
    });
    for (const item of section.items) list.append(makeCard(item));
    group.append(list, button('+ Placeholder', `Add placeholder to ${section.name}`, () => {
      const note = prompt('Placeholder note');
      if (note === null) return;
      const usedIds = new Set(order.sections.flatMap(({ items }) => items.map(itemId)));
      let number = 1;
      while (usedIds.has(`ph-${number}`)) number++;
      const id = `ph-${number}`;
      section.items.push({ placeholder: id, note });
      change(id);
    }));
    sectionsEl.append(group);
  }
  totalEl.textContent = `Talk total · ${minuteLabel(total)} · ${total} words`;
  if (focusId) sectionsEl.querySelectorAll('.sorter-card').forEach((card) => {
    if (card.dataset.id === focusId) card.querySelector(focusControl ? `.${focusControl}` : '.sorter-controls button').focus();
  });
}
function open() {
  if (!dialog.hidden) return;
  lastFocus = document.activeElement;
  dirty = false;
  saved = false;
  saveFailed = false;
  order = structuredClone(ORDER);
  render();
  updateStatus('Ready');
  dialog.hidden = false;
  for (const sibling of document.body.children) if (sibling !== dialog && sibling.tagName !== 'SCRIPT') sibling.inert = true;
  closeButton.focus();
}
async function close(destination) {
  if (dialog.hidden) return;
  await saveQueue;
  dialog.hidden = true;
  for (const sibling of document.body.children) sibling.inert = false;
  if (lastFocus instanceof HTMLElement && lastFocus !== document.body) lastFocus.focus();
  if (dirty && (!saved || saveFailed)) order = structuredClone(ORDER);
  const id = destination ?? (() => {
    const current = decodeURIComponent(location.hash.slice(1));
    const active = /^\d+$/.test(current) ? SLIDES[Number(current)]?.id : current || SLIDES[0]?.id;
    return visibleIds().includes(active) ? active : visibleIds()[0];
  })();
  if ((saved && !saveFailed) || destination) {
    history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
    location.reload();
  }
}
closeButton.addEventListener('click', () => close());
document.querySelector('#sorter-add-section').addEventListener('click', () => {
  const name = prompt('Section name');
  if (!name?.trim()) return;
  order.sections.push({ name: name.trim(), items: [] });
  change();
});
// The sorter saves through tools/serve.mjs, so it only opens on localhost.
const onLocalhost = ['127.0.0.1', 'localhost'].includes(location.hostname);
window.addEventListener('keydown', (event) => {
  const editable = event.target.closest?.('input, textarea, select, [contenteditable]');
  if (dialog.hidden) {
    if (onLocalhost && !editable && event.key.toLowerCase() === 's' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault(); open();
    }
    return;
  }
  if (event.key === 'Escape' || (event.key.toLowerCase() === 's' && !editable && !event.altKey && !event.ctrlKey && !event.metaKey)) {
    event.preventDefault(); close(); return;
  }
  if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    const card = document.activeElement?.closest?.('.sorter-card');
    if (card) { event.preventDefault(); moveByKey(card.dataset.id, event.key === 'ArrowUp' ? -1 : 1); }
    return;
  }
  if (event.key === 'Tab') {
    const focusable = [...dialog.querySelectorAll('button:not(:disabled)')];
    const next = event.shiftKey ? focusable.at(-1) : focusable[0];
    if ((event.shiftKey && document.activeElement === focusable[0]) || (!event.shiftKey && document.activeElement === focusable.at(-1))) {
      event.preventDefault(); next.focus();
    }
  }
});
