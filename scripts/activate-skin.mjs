import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const PACKAGE_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_PROFILE = 'web'
const STATE_DIRECTORY = '.dsh-market'
const STATE_FILE = 'state.json'

function assertRecord(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must contain a JSON object`)
  }
  return value
}

async function readJson(file, label, { optional = false } = {}) {
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch (error) {
    if (optional && error?.code === 'ENOENT') return null
    throw new Error(`Cannot read ${label} at ${file}: ${error.message}`, { cause: error })
  }
  try {
    return assertRecord(JSON.parse(text), label)
  } catch (error) {
    if (error.message.endsWith('must contain a JSON object')) throw error
    throw new Error(`Invalid JSON in ${label} at ${file}: ${error.message}`, { cause: error })
  }
}

async function fileExists(file) {
  try {
    await stat(file)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function validateProfile(profile) {
  if (typeof profile !== 'string' || !/^[A-Za-z0-9._-]+$/.test(profile)) {
    throw new Error('Profile must contain only letters, digits, dot, underscore, or hyphen')
  }
  if (profile === '.' || profile === '..') throw new Error('Profile cannot be . or ..')
  return profile
}

function installedPackageNames(manifest) {
  const dependencies = assertRecord(manifest.dependencies ?? {}, 'profile dependencies')
  const dsh = manifest.dsh === undefined ? {} : assertRecord(manifest.dsh, 'profile dsh')
  const profile = dsh.profile === undefined ? {} : assertRecord(dsh.profile, 'profile dsh.profile')
  const bundles = Array.isArray(profile.bundles)
    ? profile.bundles.filter(name => typeof name === 'string')
    : []
  return [...new Set([...Object.keys(dependencies), ...bundles])]
}

function validSkinMetadata(value, packageName) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const wiring = value.wiring
  return value.package === packageName
    && typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.bodyAttr === 'string'
    && value.bodyAttr.length > 0
    && wiring !== null
    && typeof wiring === 'object'
    && !Array.isArray(wiring)
    && typeof wiring.id === 'string'
    && wiring.id.length > 0
}

export async function discoverInstalledSkins(profileDir, manifest) {
  const skins = []
  for (const packageName of installedPackageNames(manifest)) {
    const metadataFile = join(profileDir, 'node_modules', packageName, 'skin.json')
    const metadata = await readJson(metadataFile, `${packageName} skin metadata`, { optional: true })
    if (metadata !== null && validSkinMetadata(metadata, packageName)) skins.push(packageName)
  }
  return skins.sort((left, right) => left.localeCompare(right))
}

async function ownPackageName(packageRoot) {
  const manifest = await readJson(join(packageRoot, 'package.json'), 'skin package manifest')
  if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
    throw new Error('Skin package manifest must declare a package name')
  }
  return manifest.name
}

async function writeJsonAtomically(file, value) {
  const directory = dirname(file)
  await mkdir(directory, { recursive: true })
  const temporary = join(directory, `.${STATE_FILE}.${process.pid}.${Date.now()}.tmp`)
  try {
    await writeFile(temporary, `${JSON.stringify(value)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, file)
  } catch (error) {
    await unlink(temporary).catch(() => {})
    throw new Error(`Cannot update dsh-market state at ${file}: ${error.message}`, { cause: error })
  }
}

export async function activateSkin({
  dshHome = process.env.DSH_HOME || join(homedir(), '.dsh'),
  packageRoot = PACKAGE_ROOT,
  profile = DEFAULT_PROFILE,
} = {}) {
  validateProfile(profile)
  const resolvedDshHome = resolve(dshHome)
  const profileDir = join(resolvedDshHome, 'profiles', profile)
  const profileManifest = await readJson(join(profileDir, 'package.json'), `${profile} profile manifest`)
  const dependencies = assertRecord(profileManifest.dependencies ?? {}, 'profile dependencies')
  if (!Object.hasOwn(dependencies, 'dshmarket')) {
    throw new Error(`Profile ${profile} does not have dshmarket installed`)
  }

  const packageName = await ownPackageName(packageRoot)
  if (!Object.hasOwn(dependencies, packageName)) {
    throw new Error(`${packageName} is not installed in profile ${profile}`)
  }
  const installedManifest = join(profileDir, 'node_modules', packageName, 'package.json')
  if (!(await fileExists(installedManifest))) {
    throw new Error(`${packageName} is listed in profile ${profile} but missing from node_modules`)
  }

  const skins = await discoverInstalledSkins(profileDir, profileManifest)
  if (!skins.includes(packageName)) {
    throw new Error(`${packageName} does not expose valid installed skin.json metadata`)
  }

  const stateFile = join(profileDir, STATE_DIRECTORY, STATE_FILE)
  const existingState = await readJson(stateFile, 'dsh-market state', { optional: true }) ?? {}
  const existingDisabled = Array.isArray(existingState.disabledSkins)
    ? existingState.disabledSkins.filter(name => typeof name === 'string')
    : []
  const disabled = new Set(existingDisabled)
  disabled.delete(packageName)
  for (const skin of skins) {
    if (skin !== packageName) disabled.add(skin)
  }
  const disabledSkins = [...disabled].sort((left, right) => left.localeCompare(right))
  const nextState = { ...existingState, disabledSkins }
  const changed = JSON.stringify(existingState) !== JSON.stringify(nextState)
  if (changed) await writeJsonAtomically(stateFile, nextState)

  return {
    activeSkin: packageName,
    changed,
    disabledSkins,
    installedSkins: skins,
    profile,
    stateFile,
  }
}

export function parseArgs(argv) {
  const options = { profile: DEFAULT_PROFILE }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') return { help: true }
    if (argument !== '--profile' && argument !== '--dsh-home') {
      throw new Error(`Unknown argument: ${argument}`)
    }
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`${argument} requires a value`)
    }
    if (argument === '--profile') options.profile = value
    else options.dshHome = value
    index += 1
  }
  return options
}

function printHelp() {
  console.log('Usage: pnpm skin:activate -- [--profile web] [--dsh-home <path>]')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    printHelp()
    return
  }
  const result = await activateSkin(options)
  console.log(`Active skin: ${result.activeSkin}`)
  console.log(`Disabled skins: ${result.disabledSkins.join(', ') || '(none)'}`)
  console.log(`State: ${result.stateFile}${result.changed ? ' (updated)' : ' (unchanged)'}`)
  console.log('Restart the Harness web profile, then hard-refresh the browser.')
}

const invokedFile = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (invokedFile === import.meta.url) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
