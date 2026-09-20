import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'

import { activateSkin, parseArgs } from '../scripts/activate-skin.mjs'

const PACKAGE_NAME = 'dsh-linpianpian-skin'
const OTHER_SKIN = '@dsh-external/dsh-client-ui-skin-maid-atelier'

async function writeJson(file, value) {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(value)}\n`, 'utf8')
}

async function installSkin(profileDir, packageName, { valid = true } = {}) {
  const packageDir = join(profileDir, 'node_modules', packageName)
  await writeJson(join(packageDir, 'package.json'), { name: packageName, version: '0.0.1' })
  await writeJson(join(packageDir, 'skin.json'), valid
    ? {
        id: packageName.split('/').at(-1),
        bodyAttr: `data-${packageName.split('/').at(-1)}`,
        package: packageName,
        wiring: { id: `ui-${packageName.split('/').at(-1)}`, bundleWired: true },
      }
    : { package: 'wrong-package' })
}

async function createFixture(t, { state } = {}) {
  const dshHome = await mkdtemp(join(tmpdir(), 'lpp-skin-state-'))
  t.after(() => rm(dshHome, { recursive: true, force: true }))
  const profileDir = join(dshHome, 'profiles', 'web')
  const dependencies = {
    dshmarket: '^1.9.0',
    [PACKAGE_NAME]: 'file:linpianpian.tgz',
    [OTHER_SKIN]: 'file:maid.tgz',
    'not-a-skin': '1.0.0',
  }
  await writeJson(join(profileDir, 'package.json'), {
    dependencies,
    dsh: { profile: { bundles: Object.keys(dependencies) } },
  })
  await installSkin(profileDir, PACKAGE_NAME)
  await installSkin(profileDir, OTHER_SKIN)
  await installSkin(profileDir, 'not-a-skin', { valid: false })
  if (state !== undefined) {
    await writeJson(join(profileDir, '.dsh-market', 'state.json'), state)
  }
  return { dshHome, profileDir }
}

test('activateSkin enables this skin, disables other installed skins, and preserves state', async (t) => {
  const fixture = await createFixture(t, {
    state: {
      disabledSkins: [PACKAGE_NAME, 'stale-skin'],
      futureField: { keep: true },
    },
  })

  const first = await activateSkin({ dshHome: fixture.dshHome })
  assert.equal(first.activeSkin, PACKAGE_NAME)
  assert.equal(first.changed, true)
  assert.deepEqual(first.installedSkins, [PACKAGE_NAME, OTHER_SKIN].sort((a, b) => a.localeCompare(b)))
  assert.deepEqual(new Set(first.disabledSkins), new Set([OTHER_SKIN, 'stale-skin']))

  const state = JSON.parse(await readFile(first.stateFile, 'utf8'))
  assert.deepEqual(state.futureField, { keep: true })
  assert.deepEqual(new Set(state.disabledSkins), new Set([OTHER_SKIN, 'stale-skin']))
  assert.equal(state.disabledSkins.includes(PACKAGE_NAME), false)
  assert.equal((await readdir(dirname(first.stateFile))).some(name => name.endsWith('.tmp')), false)

  const second = await activateSkin({ dshHome: fixture.dshHome })
  assert.equal(second.changed, false)
})

test('activateSkin refuses malformed state without overwriting it', async (t) => {
  const fixture = await createFixture(t)
  const stateFile = join(fixture.profileDir, '.dsh-market', 'state.json')
  await mkdir(dirname(stateFile), { recursive: true })
  await writeFile(stateFile, '{broken', 'utf8')

  await assert.rejects(
    activateSkin({ dshHome: fixture.dshHome }),
    /Invalid JSON in dsh-market state/,
  )
  assert.equal(await readFile(stateFile, 'utf8'), '{broken')
})

test('activateSkin fails when the package is not actually installed', async (t) => {
  const fixture = await createFixture(t, { state: { disabledSkins: [PACKAGE_NAME] } })
  await rm(join(fixture.profileDir, 'node_modules', PACKAGE_NAME), { recursive: true, force: true })
  const stateFile = join(fixture.profileDir, '.dsh-market', 'state.json')
  const before = await readFile(stateFile, 'utf8')

  await assert.rejects(
    activateSkin({ dshHome: fixture.dshHome }),
    /missing from node_modules/,
  )
  assert.equal(await readFile(stateFile, 'utf8'), before)
})

test('parseArgs accepts supported options and rejects incomplete input', () => {
  assert.deepEqual(parseArgs([]), { profile: 'web' })
  assert.deepEqual(
    parseArgs(['--profile', 'preview', '--dsh-home', 'D:\\dsh-home']),
    { profile: 'preview', dshHome: 'D:\\dsh-home' },
  )
  assert.deepEqual(parseArgs(['--help']), { help: true })
  assert.throws(() => parseArgs(['--profile']), /requires a value/)
  assert.throws(() => parseArgs(['--unknown']), /Unknown argument/)
})
