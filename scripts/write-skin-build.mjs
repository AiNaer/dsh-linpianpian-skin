// Fingerprint contract adapted from dsh-deep-whale (MIT, Small-tailqwq).
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export function computeSkinFingerprint(root) {
  const hash = createHash('sha256')
  for (const name of ['lib/client.js', 'lib/index.js', 'cordis.patch.yml', 'skin.json']) {
    const content = readFileSync(resolve(root, name), 'utf8').replaceAll('\r\n', '\n')
    hash.update(`${name}\0${Buffer.byteLength(content)}\0`)
    hash.update(content)
  }
  return hash.digest('hex')
}

export function writeSkinBuild(root = process.cwd()) {
  const git = (...args) => {
    try {
      return execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    } catch { return undefined }
  }
  const skin = JSON.parse(readFileSync(resolve(root, 'skin.json'), 'utf8'))
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  if (skin.dshCompatibility !== undefined && !/^\d+\.\d+\.\d+rc\d+$/.test(skin.dshCompatibility)) throw new Error('Invalid dshCompatibility')
  const repositoryUrl = typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url
  const repository = repositoryUrl?.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1]
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('Expected a GitHub repository in package.json')
  // Source archives and the first, uncommitted release checkout have no HEAD.
  // Do not accidentally claim the parent repository's commit for an archive.
  const top = git('rev-parse', '--show-toplevel')
  const clean = top !== undefined && resolve(top) === resolve(root)
    && git('status', '--porcelain', '--untracked-files=normal') === ''
  const sourceCommit = clean ? git('rev-parse', 'HEAD') : undefined
  const result = {
    schema: 1,
    fingerprint: computeSkinFingerprint(root),
    ...(sourceCommit && /^[a-f0-9]{40}$/.test(sourceCommit) ? { sourceCommit } : {}),
    repository,
    path: '.',
  }
  const target = resolve(root, 'skin.build.json')
  writeFileSync(`${target}.tmp`, `${JSON.stringify(result, null, 2)}\n`)
  renameSync(`${target}.tmp`, target)
  return result
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) writeSkinBuild()
