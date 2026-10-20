// A screen recording that fills the stage. Plays once on arrival, muted, and
// stops on its last frame (no loop). Mounted only while its slide is active,
// so it never plays in the background; unmounting stops and releases it.
// demoType names the file in ./video/, e.g. "editions" -> ./video/editions.mp4.
export function mount(container, type) {
  container.innerHTML = `
    <style>
      .vid-root { position: absolute; inset: 0; background: var(--scrim); }
      .vid-root video { width: 100%; height: 100%; object-fit: contain; display: block; }
    </style>
    <div class="vid-root">
      <video src="./video/${type}.mp4" muted playsinline autoplay preload="auto" aria-hidden="true"></video>
    </div>`;
  const video = container.querySelector('video');
  // Autoplay is allowed because the video is muted; play() covers a browser
  // that skips the attribute when the element is added by script.
  video.play().catch(() => {});
  return () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    container.innerHTML = '';
  };
}
