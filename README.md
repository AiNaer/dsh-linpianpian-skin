# Lin Pianpian · Pine-soot & Gilt Study

[简体中文](./README.zh-CN.md)

A standalone presentation-only skin for DeepSeek Harness Web UI. Version 0.2.0
updates the original release to the current Lin Pianpian study design: matched
waterside-library scenes, refined characters, embroidered composer rails and
an osmanthus-decorated sidebar. No backend, model or tool behavior is changed.

## Install or update

**This repository is directly installable as a DeepSeek Harness Web plugin.**
The package is `dsh-linpianpian-skin`, currently `0.2.0`. Host/browser bundles,
the Cordis patch and embedded artwork are included. Regular installation needs
no build, Python, artwork generation or `prepare` script. Harness loads the
plugin; this is not a standalone application.

### 1. Prepare the environment and profile

Requires Node.js `^22.19.0 || >=24.0.0` and pnpm. GitHub installation also requires Git.
On Windows, use PowerShell:

```sh
node --version
npm install --global pnpm
pnpm --version
npx @deepseek-ai/dsh --version
```

All examples target the `web` profile at `~/.dsh/profiles/web`, or
`$DSH_HOME/profiles/web` when configured. Install and launch with the same
profile and `DSH_HOME`. An existing global `dsh` command can replace
`npx @deepseek-ai/dsh`. See the [official Harness repository](https://github.com/deepseek-ai/deepseek-harness)
for host setup.

Stop a running Harness instance with `Ctrl+C` in its terminal before installing
or updating. **Only if the development package is installed**, remove it first:
it shares this release's wiring id.

```sh
npx @deepseek-ai/dsh plugin --profile web remove @dsh-external/dsh-client-ui-skin-linpianpian
```

### 2. Choose one installation method

**A. Install a local checkout (Windows PowerShell).**

```powershell
npx @deepseek-ai/dsh plugin --profile web add 'D:\D盘工作台\dsh-aihong\dsh-linpianpian-skin'
```

Replace the example with the **absolute path** to the directory containing
`package.json`. pnpm 11 records directory installs as `link:`; keep that directory
in place afterward. Using the included bundles does not require `pnpm install`
or `pnpm build`. Rebuild only after editing source files.

**B. Install from GitHub without cloning.**

```sh
npx @deepseek-ai/dsh plugin --profile web add github:AiNaer/dsh-linpianpian-skin#master
```

`master` is the current default branch. For a repeatable installation, replace
it with an existing tag or full commit SHA. A package version does not imply
that a matching Git tag exists.

**C. Pack and install a `.tgz` without linking the source directory.**

Run in PowerShell, using your actual checkout path:

```powershell
Set-Location 'D:\D盘工作台\dsh-aihong\dsh-linpianpian-skin'
pnpm pack --pack-destination .
npx @deepseek-ai/dsh plugin --profile web add 'D:\D盘工作台\dsh-aihong\dsh-linpianpian-skin\dsh-linpianpian-skin-0.2.0.tgz'
```

After version changes, use the filename printed by `pnpm pack`. Keep the archive
for reinstalls. Copying a source folder into Harness's plugins directory alone
does not register the plugin.

Windows method-switching caveat: with pnpm 11.22.0, directory installation and
archive installation into a fresh profile each passed, but switching the same
profile from a directory link to an archive produced `ERR_PNPM_EPERM` / `symlink`.
Choose one method initially. This error means installation did not finish;
resolve pnpm link permissions or leftover dependencies before starting Harness.

### 3. Activate and resolve other skins

Successful `plugin add` automatically registers the plugin in a regular Web
profile; no manual Cordis edit is needed. **Only for profiles with dshmarket
installed**, run the activation helper from the checkout root:

```sh
node scripts/activate-skin.mjs --profile web
```

For GitHub or archive installs, run the installed helper instead (PowerShell):

```powershell
$lppDshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
node (Join-Path $lppDshHome 'profiles/web/node_modules/dsh-linpianpian-skin/scripts/activate-skin.mjs') --profile web
```

The helper requires this package to be installed, preserves unknown state fields,
and refuses malformed JSON. It updates dshmarket state only; it does not restart
Harness or remove other skins from profile registration. If it reports
`does not have dshmarket installed`, skip this step for a regular profile.
dshmarket is not required to install the skin.

Only one full-page skin should mount at a time. A compatible skin manager can
disable other skins. If an older host still loads a disabled skin such as Maid
Atelier, stop Harness, back up the profile's `package.json`, and remove that
package from **both** `dependencies` and `dsh.profile.bundles` before installing
this skin. Keep its `.tgz` in `plugins/` if desired. Changing `disabledSkins`
alone or hiding a body attribute does not prevent duplicate mounting.

### 4. Start and verify

```sh
npx @deepseek-ai/dsh web --port 3080
```

Wait for startup, open <http://127.0.0.1:3080/>, and hard-refresh with `Ctrl+F5`.
On a wide landing page, check the study background, both characters and osmanthus
sidebar, then check light/dark mode and settings. Narrow layouts intentionally
hide characters.

For an additional check, run in the browser developer console:

```js
({
  skinActive: document.body.hasAttribute('data-dsh-linpianpian'),
  maidActive: document.body.hasAttribute('data-dsh-maid-atelier'),
  characterStages: document.querySelectorAll('[data-linpianpian-stage]').length,
  backgroundStages: document.querySelectorAll('[data-lpp-background-stage]').length,
})
```

Expect `true`, `false`, `1`, `1`. If the old UI remains, check the selected
profile, activation state, whether the old server stopped, and whether you
installed a fresh archive. Stop the existing Harness instance if port 3080 is
occupied before starting another.

### 5. Update or uninstall

Stop Harness. If source files changed, run `pnpm check`; create a fresh archive
if using method C. Remove the installed version, then repeat the add command
from A, B or C:

```sh
npx @deepseek-ai/dsh plugin --profile web remove dsh-linpianpian-skin
```

Repeat activation when applicable, restart Harness and hard-refresh.
**Same-version replacements also require remove → add → activate (if applicable)
→ restart → refresh.** Replacing the archive or refreshing alone is insufficient.
First-time installs do not need a remove step.

To uninstall, use the same remove command and restart Harness. The original UI
returns if no other skin is active.

Installation verification (2026-09-20): Harness CLI `0.1.2-rc.1`, Node.js
`24.16.0`, and pnpm `11.22.0`; directory and archive installs were checked
separately under an isolated `DSH_HOME`, including automatic bundle registration
and the installed browser file hash. All 29 tests in `pnpm check` passed.
This installation check did not launch a browser; follow step 4 to verify the UI.
GitHub installation was not exercised in this check.

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
