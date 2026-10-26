// Three.js scenes rotate with a mouse only. OrbitControls sets
// touch-action: none on its canvas and claims every touch, which stops a
// phone swiping to the next slide. Call this after new OrbitControls(...):
// touch and pen presses never reach the controls, and the canvas gives
// touch back to the browser, so engine.js sees an ordinary swipe.
export function mouseOnlyControls(canvas) {
  canvas.style.touchAction = "auto";
  canvas.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") e.stopImmediatePropagation();
  }, true);
}
