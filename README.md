# carolynmcneillie.com

Personal site. Framework-free HTML and local JavaScript modules. No build step.

## Structure

```
.
├── index.html          # markup and inline CSS
├── riso/               # two-press risograph flower background (WebGL2)
├── tools/              # offline name and card print baker
├── images/             # baked name.webp and nine-slice card-paper.webp
│   ├── Carolyn.png     # social share image (twitter:image)
│   ├── icon.png        # favicon
│   ├── codepen.svg     # social icons
│   ├── github.svg
│   ├── linkedin.svg
│   └── medium.svg
├── CNAME               # custom domain for GitHub Pages
└── .nojekyll           # skip Jekyll; nothing here needs processing
```

`riso/background.js` runs the decorative kaleidoscope from riso-lab. Reduced
motion shows one still frame. See `riso/README.md` for source and ink credits.
The only external requests are Google Fonts (Montserrat).

## Running locally

No build, no install. Serve the directory:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Opening `index.html` directly via `file://` will not work. The external
`riso/background.js` script uses ES modules, which need an HTTP origin.

Background flags:
- `?seed=0` starts with that flower seed.
- `?t=4` freezes at that time in seconds.
- `?noworker` prepares flowers on the main thread.
- `?debug` exposes `renderAt`, `renderAtAsync`, and `mirrorState` on `window`.

Combine flags with `&`, for example `?seed=0&t=4&debug`.

## Re-bake the name and card

Use Node.js with built-in WebSocket support and `cwebp` on PATH.
With the preview server on port 8799, start dedicated Chrome on port 9240:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9240 --user-data-dir=/tmp/carolyn-bake-chrome --use-angle=metal about:blank > /tmp/carolyn-bake-chrome.log 2>&1 &
CHROME_PID=$!
node tools/bake.mjs
kill "$CHROME_PID"
```

The baker keeps its lossless PNG intermediates in `/tmp`, outside the repo.
It encodes the images with `cwebp -q 95 -sharp_yuv`. Update their `?v=` values
in `index.html` after a re-bake.

The tool opens its own tab, prints at 2x, saves alpha WebP images, and closes the tab.
Set `BAKE_ORIGIN` to use another preview port. The live page only prints the background.
The card uses 8px nine-slice borders; its centre texture scales with the content box.

## Deploying

GitHub Pages, classic branch build, serving from **`main`** at the repo root.
Pushing to `main` publishes the site; a build takes under a minute.

Verify settings with:

```bash
gh api repos/CarolynMcNeillie/carolynmcneillie/pages
```

Expected: `source.branch` = `main`, `source.path` = `/`, `cname` =
`carolynmcneillie.com`, `https_enforced` = `true`.

Two files must stay at the root or the deploy breaks:

- `CNAME` — dropping it unbinds the custom domain and the site reverts to
  `carolynmcneillie.github.io`.
- `.nojekyll` — without it Pages runs Jekyll on every push, which adds ~35s and
  silently ignores any path beginning with an underscore.

## History

This replaced a Gatsby site in November 2025 (~200KB of JS and 31 dependencies
for a page with no routing, no state and no SSR). The Gatsby source and an
interim duplicate `dist/` copy were removed from the deployed branch; both remain
in git history if ever needed.

Previously the site was served from a separate `gh-pages` branch while `main`
held the stale Gatsby source, so the default branch did not describe what was
live. Source and deploy are now the same branch.
