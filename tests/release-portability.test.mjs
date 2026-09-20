import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

test('release art generation is reproducible without a sibling development checkout', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lpp-art-archive-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'assets'))
  await mkdir(join(root, 'scripts'))
  await copyFile('scripts/generate-art.mjs', join(root, 'scripts/generate-art.mjs'))
  for (const name of await readdir('assets')) {
    if (name.startsWith('lpp-')) await copyFile(join('assets', name), join(root, 'assets', name))
  }
  execFileSync(process.execPath, [join(root, 'scripts/generate-art.mjs')], { cwd: root, stdio: 'pipe' })
  assert.equal(await readFile(join(root, 'src/client/art.generated.ts'), 'utf8'), await readFile('src/client/art.generated.ts', 'utf8'))
})
