import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { computeSkinFingerprint, writeSkinBuild } from '../scripts/write-skin-build.mjs'

test('build identity is deterministic, CRLF-independent and sensitive to runtime changes', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lpp-build-')); t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'lib'))
  const inputs = ['lib/client.js', 'lib/index.js', 'cordis.patch.yml', 'skin.json']
  for (const name of inputs) await writeFile(join(root, name), 'one\ntwo\n')
  const initial = computeSkinFingerprint(root)
  assert.equal(computeSkinFingerprint(root), initial)
  for (const name of inputs) await writeFile(join(root, name), 'one\r\ntwo\r\n')
  assert.equal(computeSkinFingerprint(root), initial)
  await writeFile(join(root, 'lib/client.js'), 'changed\n')
  assert.notEqual(computeSkinFingerprint(root), initial)
})

test('packaged build metadata identifies the exact runtime without machine paths', async () => {
  const meta = JSON.parse(await readFile('skin.build.json', 'utf8'))
  const pkg = JSON.parse(await readFile('package.json', 'utf8'))
  assert.equal(meta.schema, 1)
  assert.equal(meta.path, '.')
  assert.equal(meta.repository, 'AiNaer/dsh-linpianpian-skin')
  assert.equal(meta.fingerprint, computeSkinFingerprint(process.cwd()))
  assert.ok(pkg.files.includes('skin.build.json'))
  assert.doesNotMatch(JSON.stringify(meta), /[A-Z]:[\\/]/)
})

test('release archives build without a Git remote or commit history', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lpp-release-archive-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'lib'))
  for (const name of ['lib/client.js', 'lib/index.js', 'cordis.patch.yml']) await writeFile(join(root, name), 'fixture\n')
  await writeFile(join(root, 'skin.json'), JSON.stringify({ dshCompatibility: '0.1.2rc1' }))
  await writeFile(join(root, 'package.json'), JSON.stringify({ repository: { url: 'git+https://github.com/AiNaer/dsh-linpianpian-skin.git' } }))
  const result = writeSkinBuild(root)
  assert.equal(result.repository, 'AiNaer/dsh-linpianpian-skin')
  assert.equal(result.sourceCommit, undefined)
  assert.equal(result.fingerprint, computeSkinFingerprint(root))
})
