# carolynmcneillie.com

Personal site. Framework-free: one self-contained HTML file, six images, no build
step and no dependencies.

## Structure

```
.
├── index.html          # everything: markup, inlined CSS, inline WebGL2 module
├── images/
│   ├── Carolyn.png     # social share image (twitter:image)
│   ├── icon.png        # favicon
│   ├── codepen.svg     # social icons
│   ├── github.svg
│   ├── linkedin.svg
│   └── medium.svg
├── CNAME               # custom domain for GitHub Pages
└── .nojekyll           # skip Jekyll; nothing here needs processing
```

The animated WebGL2 background is an inline `<script type="module">` in
`index.html` (around line 362), not a separate file. All CSS is inlined in
`<head>` so there is no render-blocking stylesheet. The only external requests
are Google Fonts (Montserrat).

## Running locally

No build, no install. Serve the directory:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Opening `index.html` directly via `file://` will not work, because the inline
script is an ES module and modules require an HTTP origin.

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
