import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import ts from 'typescript'

export const composer = `<section data-phase="active"><div data-conversation-scroll><div data-chat-flow></div><div data-composer-seat><div data-composer-card><div data-slot="conversation.input.attachments"></div><div data-composer-input contenteditable="true" tabindex="0"></div><div data-composer-stats><button aria-expanded="false" aria-haspopup="dialog">stats</button></div></div></div></div></section>`

export function fixture(html = `<aside data-pane="sidebar"></aside><main data-pane="conversation">${composer}</main>`) {
  const dom = new JSDOM(`<!doctype html><html><head><title>Harness</title></head><body>${html}</body></html>`, { pretendToBeVisual: true, runScripts: 'outside-only', url: 'http://127.0.0.1:3080/' })
  const { window } = dom
  const frames = new Map()
  let id = 0
  window.requestAnimationFrame = cb => { frames.set(++id, cb); return id }
  window.cancelAnimationFrame = key => frames.delete(key)
  const observers = []
  window.ResizeObserver = class {
    targets = new Set()
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe(target) { this.targets.add(target) }
    unobserve(target) { this.targets.delete(target) }
    disconnect() { this.targets.clear() }
  }
  const flush = async () => {
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => window.queueMicrotask(resolve))
      const jobs = [...frames.values()]; frames.clear()
      jobs.forEach(cb => cb(window.performance.now()))
    }
  }
  const cache = new Map()
  const cleanups = new Set()
  const source = (name) => {
    const path = resolve('src/client', name.replace(/\.ts$/, '') + '.ts')
    if (cache.has(path)) return cache.get(path)
    const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const exports = {}; cache.set(path, exports)
    window.eval(`(function(require,exports){${code}\n})`)(dep => source(dep), exports)
    return exports
  }
  const mount = (path = 'lib/client.js') => {
    let definition
    window.__ModuleLoader__ = { load: value => { definition = value } }
    window.eval(readFileSync(path, 'utf8'))
    const client = definition.factory(() => { throw new Error('Unexpected dependency') })
    const disposers = []
    const dispose = () => disposers.splice(0).reverse().forEach(fn => fn())
    cleanups.add(dispose)
    return { apply: () => client.apply({ effect: factory => { disposers.push(factory()) } }), dispose }
  }
  return { dom, window, document: window.document, frames, observers, flush, source, mount, close: () => { cleanups.forEach(fn => fn()); window.close() } }
}

export function rect(element, values) {
  element.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, bottom: 800, right: 1000, height: 800, width: 1000, ...values })
}
