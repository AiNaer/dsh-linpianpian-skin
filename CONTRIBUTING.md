# Contributing

Thank you for improving the Lin Pianpian skin.

## Setup

```sh
pnpm install --frozen-lockfile
pnpm check
```

Node.js must satisfy the range in `package.json`. Keep pnpm at the declared
`packageManager` version when updating the lockfile.

## Change rules

- Keep all skin selectors scoped by `body[data-dsh-linpianpian]` unless a
  narrowly documented host selector requires otherwise.
- Pair every DOM, event, observer, timer, attribute, style, title, or meta-tag
  mutation with Cordis disposal cleanup.
- Do not add runtime network requests or remote asset URLs.
- Do not hand-edit `src/client/art.generated.ts` or files under `lib/`.
- Rebuild and commit `lib/index.js`, `lib/client.js`, and `lib/client.js.map`
  plus `skin.build.json` whenever runtime source changes. Git installs rely on these files.
- Preserve visible text contrast in both light and dark themes, settings,
  dialogs, code blocks, and narrow layouts.

## Artwork changes

Only submit artwork you created or have documented permission to redistribute.
Record the author, source, license, and any required attribution in `NOTICE`.
Do not remove an existing attribution or broaden a license without evidence.

After changing baked artwork:

```sh
python -m pip install -r requirements-dev.txt
python scripts/bake-art.py
pnpm generate:art
pnpm build
pnpm test
```

## Pull requests

Describe the user-visible change, the DSH version tested, and the checks you
ran. Include before/after screenshots for visual changes.
