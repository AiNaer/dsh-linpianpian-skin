/**
 * Standalone tsdown build for the Lin Pianpian DeepSeek Harness skin:
 *
 * - `lib/index.js`   — host half, ESM, empty apply()
 * - `lib/client.js`  — browser half, CJS closure registered through
 *   `window.__ModuleLoader__.load({ id, factory })`
 *
 * The skin keeps every asset as a base64 data URI and ships its CSS as a
 * JavaScript template string (src/client/skin.ts), so `lib/client.js` is a
 * single self-contained artifact: no CSS sidecar, no runtime fetch.
 */
import { defineConfig } from 'tsdown'

const pluginId = 'dsh-linpianpian-skin'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2022',
    dts: false,
    sourcemap: false,
    clean: false,
    fixedExtension: false,
  },
  {
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    dts: false,
    sourcemap: true,
    clean: false,
    // There are no runtime dependencies; everything (art, CSS, interaction
    // code) inlines into the single browser artifact.
    deps: {
      alwaysBundle: () => true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.MODE': JSON.stringify('production'),
      'import.meta.env': JSON.stringify({ MODE: 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(pluginId)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      codeSplitting: false,
    },
  },
])
