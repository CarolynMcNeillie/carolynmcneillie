// Presenter pointer: a blown-up, deliberately pixelated arrow (a hand over
// controls) that follows the mouse and fades out when the mouse rests, so it
// only draws attention while it is moving. The system cursor is hidden in
// presenter view (style.css); text fields keep the normal text cursor.
// Images: images/cursor/, built by tools/cursors.mjs.
const IDLE_MS = 1500;
const INTERACTIVE = 'a, button, label, select, summary, input[type="range"], input[type="checkbox"], [role="button"], [role="slider"], [role="tab"]';
const TEXT = 'textarea, input[type="text"], input[type="search"], [contenteditable="true"]';
// Hotspots, in CSS pixels from the image's top left: the arrow tip and the fingertip.
const SHAPES = {
  arrow: { src: './images/cursor/arrow.png', src2x: './images/cursor/arrow@2x.png', x: 1, y: 1 },
  hand: { src: './images/cursor/hand.png', src2x: './images/cursor/hand@2x.png', x: 17, y: 1 },
};

const pointer = document.createElement('img');
pointer.id = 'presenter-pointer';
pointer.alt = '';
pointer.setAttribute('aria-hidden', 'true');
document.body.append(pointer);

let shape = '';
let idleTimer = 0;
function setShape(name) {
  if (name === shape) return;
  shape = name;
  pointer.src = SHAPES[name].src;
  pointer.srcset = `${SHAPES[name].src} 1x, ${SHAPES[name].src2x} 2x`;
}
setShape('arrow');

function hide() { pointer.classList.remove('is-visible'); }

document.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch' || !document.body.classList.contains('presenter')) { hide(); return; }
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest(TEXT)) { hide(); return; } // the system text cursor shows here
  const name = target?.closest(INTERACTIVE) ? 'hand' : 'arrow';
  setShape(name);
  const { x, y } = SHAPES[name];
  pointer.style.transform = `translate(${event.clientX - x}px, ${event.clientY - y}px)`;
  pointer.classList.add('is-visible');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(hide, IDLE_MS);
}, { passive: true });
document.addEventListener('pointerleave', hide);
document.documentElement.addEventListener('mouseleave', hide);
window.addEventListener('blur', hide);
