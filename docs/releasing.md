# Release checklist

1. Confirm that software files are covered by `LICENSE`, visual assets by
   `LICENSE-ASSETS.md`, and the required copyright line remains in `NOTICE`.
2. Update `version` in `package.json` and the compatibility section in both
   READMEs.
3. Run the full local gate:

   ```sh
   pnpm install --frozen-lockfile
   pnpm generate:art
   pnpm check
   ```

4. Inspect `pnpm pack --dry-run`. It must contain the manifest, DSH patch,
   metadata, build fingerprint, light/dark previews, activation helper,
   notices, prebuilt host/browser files, and client source map. It
   must not contain raw development assets or `node_modules`.
5. Test an isolated profile installation with the current DSH release:

   ```sh
   dsh plugin --profile skin-preview add /absolute/path/to/dsh-linpianpian-skin
   ```

6. Verify the landing page, active conversation, settings, light/dark mode,
   sidebar rail/resizing, workbench overlay, and a narrow viewport.
7. Commit the rebuilt `lib/` artifacts and `skin.build.json` with the source
   change when a release commit is requested. Record the source revision and
   notable changes in CHANGELOG.md.
8. Create a signed version tag and GitHub release. Recommend tag or commit-SHA
   installs in release notes.
9. Add the `dsh-plugin` GitHub repository topic for official ecosystem
   discoverability.
