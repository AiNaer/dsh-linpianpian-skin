# Architecture

The package has two runtime faces joined by the DeepSeek Harness client-plugin
loader.

```text
package.json dsh.bundle
        |
        v
cordis.patch.yml ---- inserts ----> dsh-linpianpian-skin host row
                                         |
                          package.json dsh.client.platform=web
                                         |
                    +--------------------+--------------------+
                    |                                         |
                    v                                         v
             lib/index.js                              lib/client.js
          host apply() (empty)             __ModuleLoader__.load(factory)
                                                              |
                                                              v
                                                     client apply(ctx)
                                                              |
                                      CSS + DOM + state projection effects
                                                              |
                                                              v
                                                disposer restores the page
```

## Package contract

- `package.json#dsh.bundle.patch` points to `./cordis.patch.yml`.
- The patch contains one `insert` row whose package name matches the manifest.
- `package.json#dsh.client.platform` is `web`.
- `exports["./client"]` points to the built browser artifact.
- The client artifact registers exactly the package id declared in the
  manifest.
- Prebuilt artifacts are committed and included in `files`; there is no
  `prepare` script, so a GitHub install requires no build authorization.

`tests/package-contract.test.mjs` verifies these relationships.

## Browser lifecycle

The browser `apply(ctx)` function owns one shared mount per window. Multiple
Cordis applies increment a reference count, so duplicate activation does not
duplicate artwork or style tags. The last disposer:

- disconnects all `MutationObserver` and `ResizeObserver` instances;
- cancels timers and event listeners;
- restores every body attribute and inline property it changed;
- removes every owned node and stylesheet;
- restores the page title and `theme-color` meta state.

`tests/client-lifecycle.test.mjs` exercises mount sharing and cleanup in jsdom.

## Asset pipeline

1. `scripts/bake-art.py` creates compact WebP assets under `assets/`.
2. `scripts/generate-art.mjs` converts the baked assets and the local paper
   texture into data URIs in `src/client/art.generated.ts`.
3. `tsdown` bundles the data, CSS string, and lifecycle code into the single
   `lib/client.js` artifact served by Harness.

The installed skin therefore makes no asset fetches at runtime.

The current release includes the Linshui library scene masters, selected
refined characters, composer embroidery pieces and osmanthus sidebar masters.
`sidebar_art.py` is called by the main baker. Fixed caps and mirrored repeat
strips preserve floral and fabric density across sidebar widths.

The local paper texture is part of this repository. Asset regeneration never
reads a neighboring development checkout. The browser source map also contains
only relative source names.

## Build identity and release lineage

`scripts/write-skin-build.mjs` hashes the two bundles, bundle patch and skin
metadata. It reads the release repository identity from package.json so builds
also work in a source archive or an initial checkout with no remote or HEAD.
Only a clean Git root with a real commit can supply sourceCommit. Release
lineage and notable changes are recorded in CHANGELOG.md.

## Current client modules

The shared mount places backgrounds, characters and trim inside the chat pane;
the footer garland is re-seated on host replacement. DomLease preserves original
attributes/styles, and regional mutation filtering avoids editor/terminal churn.
Composer capsule and scroll modes, settings customization, wide-table expansion,
boot-error decoration and terminal-width protection are independent disposables.
Width-handle light follows host pointer variables and hover/drag state without
adding interaction handlers. Decoration never intercepts native controls.

## Compatibility boundary

The skin intentionally targets semantic data attributes where DeepSeek Harness
exposes them, with class-substring fallbacks for layout regions that currently
lack a stable public slot. These fallbacks are the main compatibility risk
while Harness remains in developer preview. Validate landing, active chat,
settings, sidebar resizing, narrow viewport, and dark mode for each DSH release.
