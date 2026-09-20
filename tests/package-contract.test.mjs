import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { parse } from 'yaml'

async function readJson(name) {
  return JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), 'utf8'))
}

// Read the actual encoded canvas, so an accidental legacy bottom crop or
// alpha-flattening fails even when the generated resource names are unchanged.
function webpCanvas(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  const chunk = bytes.toString('ascii', 12, 16)
  if (chunk === 'VP8L') {
    assert.equal(bytes[20], 0x2f)
    const bits = bytes.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, alpha: Boolean(bits & 0x10000000) }
  }
  if (chunk === 'VP8X') {
    return {
      width: bytes.readUIntLE(24, 3) + 1,
      height: bytes.readUIntLE(27, 3) + 1,
      alpha: Boolean(bytes[20] & 0x10),
    }
  }
  assert.equal(chunk, 'VP8 ')
  assert.deepEqual([...bytes.subarray(23, 26)], [0x9d, 0x01, 0x2a])
  return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff, alpha: false }
}

test('approved scene artwork retains native canvases and transparent characters', async () => {
  for (const [name, width, height, alpha] of [
    ['lpp-bg-day.webp', 1672, 941, false],
    ['lpp-bg-night.webp', 1672, 941, false],
    ['lpp-char-left.webp', 1024, 1536, true],
    ['lpp-char-right.webp', 1133, 1388, true],
    ['lpp-workspace-osmanthus.webp', 96, 96, true],
  ]) {
    const bytes = await readFile(new URL(`../assets/${name}`, import.meta.url))
    assert.deepEqual(webpCanvas(bytes), { width, height, alpha }, name)
  }
})

test('sidebar ornaments retain alpha and fixed-height caps and are embedded in the shipped bundle', async () => {
  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  for (const name of ['ribbon-left', 'ribbon-right', 'ribbon-tile', 'new-left', 'new-right', 'new-tile', 'settings-left', 'settings-right', 'settings-tile', 'corner-tl', 'corner-tr', 'corner-bl', 'corner-br', 'garland']) {
    const bytes = await readFile(new URL(`../assets/lpp-sidebar-${name}.webp`, import.meta.url))
    const canvas = webpCanvas(bytes)
    assert.equal(canvas.alpha, true, name)
    if (/^(ribbon|new|settings)-/.test(name)) assert.equal(canvas.height, 192, name)
    assert.ok(client.includes(bytes.toString('base64').slice(0, 120)), `${name} is bundled without a file URL`)
  }
})

test('manifest, skin metadata, and bundle patch describe the same client plugin', async () => {
  const manifest = await readJson('package.json')
  const skin = await readJson('skin.json')
  const patch = parse(await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8'))

  assert.equal(skin.package, manifest.name)
  assert.equal(skin.wiring.bundleWired, true)
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.deepEqual(manifest.dsh.client.inject, [])
  assert.equal(patch.length, 1)
  assert.equal(patch[0].insert.length, 1)
  assert.equal(patch[0].insert[0].id, skin.wiring.id)
  assert.equal(patch[0].insert[0].name, manifest.name)
  assert.equal(manifest.exports['./client'], './lib/client.js')
  for (const required of [
    'lib/index.js',
    'lib/client.js',
    'lib/client.js.map',
    'cordis.patch.yml',
    'skin.json',
    'preview',
    'scripts/activate-skin.mjs',
    'skin.build.json',
  ]) {
    assert.equal(manifest.files.includes(required), true, `${required} must be packed`)
  }
})

test('built artifacts expose the expected host and browser entry points', async () => {
  const host = await import(new URL('../lib/index.js', import.meta.url))
  assert.equal(typeof host.apply, 'function')

  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.match(client, /^window\.__ModuleLoader__\.load\(\{/)
  assert.match(client, /id: "dsh-linpianpian-skin"/)
  assert.match(client, /exports\.apply = apply/)
  assert.match(client, /backgroundDay/)
  assert.match(client, /backgroundNight/)
  assert.match(client, /charLeft/)
  assert.match(client, /charRight/)
  assert.match(client, /composerEmblem/)
  assert.match(client, /composerTopStart/)
  assert.match(client, /composerRightEnd/)
  assert.doesNotMatch(client, /composerFrame|composerEmbroidery|--lpp-art-frame/)
  assert.match(client, /data-skin-chrome=['"]theme-frame['"]|theme-frame/)
  assert.match(client, /data-dsh-maid-atelier/)
  assert.match(client.slice(-300), /return module\.exports;\s*}\s*}\);\s*\/\/# sourceMappingURL=client\.js\.map\s*$/)
  const map = JSON.parse(await readFile(new URL('../lib/client.js.map', import.meta.url), 'utf8'))
  assert.equal(map.file, 'client.js')
  assert.ok(map.sources.length > 0)
  for (const source of map.sources) assert.doesNotMatch(source, /^[A-Z]:|^file:|^https?:/i)
})
