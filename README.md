# Lin Pianpian · Pine-soot & Gilt Study

[简体中文](./README.zh-CN.md)

A standalone presentation-only skin for DeepSeek Harness Web UI. Version 0.2.0
updates the original release to the current Lin Pianpian study design: matched
waterside-library scenes, refined characters, embroidered composer rails and
an osmanthus-decorated sidebar. No backend, model or tool behavior is changed.

![Light preview](./preview/light.webp)
![Dark preview](./preview/dark.webp)

## Install or update

Requires Node.js `^22.19.0 || >=24.0.0` and pnpm. Prebuilt JavaScript is included;
installation does not run a prepare script or require artwork generation.

```sh
npm install --global pnpm
npx @deepseek-ai/dsh plugin --profile web add github:AiNaer/dsh-linpianpian-skin
npx @deepseek-ai/dsh web
```

For repeatable installations, append `#<tag-or-commit-sha>` to the GitHub source.
For a local checkout, use its **absolute directory path** as the add argument.
When replacing a local build at the same version, remove the installed package
and add the absolute checkout path or freshly packed tarball again. Restart
Harness and hard-refresh the page after every installation or update.

```sh
npx @deepseek-ai/dsh plugin --profile web remove dsh-linpianpian-skin
npx @deepseek-ai/dsh plugin --profile web add /absolute/path/to/dsh-linpianpian-skin
```

Use only one full-page skin at a time. The development package
`@dsh-external/dsh-client-ui-skin-linpianpian` and this release share a wiring id;
remove the development package from the selected profile before installing this
release. Other skins can stay installed if a compatible skin manager disables
them. If an older host still mounts a disabled skin, remove its active profile
entry before restarting; merely hiding its body attribute is insufficient.

For profiles using dshmarket, the repository includes an optional activation helper:

```sh
node scripts/activate-skin.mjs --profile web
```

It preserves unknown state fields, refuses malformed state, and requires this
release to be installed. It does not restart Harness. Uninstall with the remove
command above and restart Harness to restore the original UI.

## Features

- Matched 1672 × 941 day/night waterside-library scenes, contained in the chat area.
- Refined transparent characters that move aside for active chats, settings and narrow layouts.
- Pine-soot green, gilt and warm ivory surfaces with readable light/dark palettes.
- Fixed-density embroidered composer rails and an independent jade emblem.
- Complete osmanthus button frames, workspace ribbon, fine selected-session
  border, edge-aligned footer garland and a subdued sidebar mascot.
- Pine/gold content-width grips that flow on hover and track the pointer during dragging.
- Composer capsule/scroll modes, wide-table expansion, settings-navigation hints,
  startup-error styling, reduced-motion support and lifecycle/performance guards.
- All assets are embedded; no runtime image requests, tracking or credential access.

## Customization and compatibility

A compatible skin-manager exposes six settings: body font, background visibility,
centered wide-screen settings, character visibility, scheduled quiet-art periods
and composer display mode. Existing values use additive defaults.
**dshmarket 1.45.1 alone does not implement this configuration interface.**

The synchronized implementation was verified against Harness `0.1.2rc1` and Cordis
`4.0.1` on the Web profile. The compatibility field records that verification,
not a promise for every newer preview build. Recheck after host upgrades.

## Development

```sh
pnpm install --frozen-lockfile
pnpm check
```

To rebuild artwork after changing masters:

```sh
python -m pip install -r requirements-dev.txt
python scripts/bake-art.py
pnpm generate:art
pnpm check
```

`pnpm check` runs type checking, builds, tests and a package dry-run. The build
writes `lib/index.js`, `lib/client.js`, its source map and `skin.build.json`.
Both asset generation and builds work without a sibling development checkout or
Git remote. Do not hand-edit generated files. Preview images are in `preview/`.

The runtime archive includes prebuilt output, metadata, previews, notices,
READMEs and the activation helper; raw source art and development tests stay in
the repository. See [architecture](./docs/architecture.md) and
the [release checklist](./docs/releasing.md).

## License and attribution

Original release software retains the [PolyForm Noncommercial license](./LICENSE).
Original visual assets retain the [asset license](./LICENSE-ASSETS.md).
Third-party character material and adapted code retain their own attribution and
restrictions; those terms are not broadened by the release licenses. See
[NOTICE](./NOTICE) for the character source and the retained MIT code notice.
