import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { JSDOM } from 'jsdom'

const CLIENT_BUNDLE = fileURLToPath(new URL('../lib/client.js', import.meta.url))

function fakeContext() {
  const disposers = []
  return {
    context: {
      effect(factory) {
        disposers.push(factory())
      },
    },
    dispose() {
      assert.equal(disposers.length, 1)
      disposers.pop()()
    },
  }
}

test('built client mounts once, shares duplicate applies, and restores the page', async () => {
  const dom = new JSDOM(`<!doctype html>
    <html>
      <head><title>Original Harness</title><link id="original-icon" rel="icon" href="/original.png"></head>
      <body data-ds-dark-theme data-dsh-maid-atelier data-lpp-chat-active="legacy" style="--lpp-art-neutral: legacy; --lpp-background-light: legacy-bg; --lpp-art-composer-emblem: legacy-emblem; --lpp-art-composer-top-start: legacy-top">
        <aside data-pane="sidebar"><div></div></aside>
        <main data-pane="conversation" data-phase="active"><div data-chat-flow></div><div data-composer-card><button>Send</button></div></main>
      </body>
    </html>`, {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    url: 'http://127.0.0.1:3080/',
  })
  const { window } = dom
  const timers = new Map()
  let nextTimer = 1
  window.setTimeout = (callback, delay = 0) => {
    const id = nextTimer
    nextTimer += 1
    timers.set(id, { callback, delay })
    return id
  }
  window.clearTimeout = id => timers.delete(id)

  let definition
  window.__ModuleLoader__ = {
    load(value) {
      definition = value
    },
  }
  window.eval(await readFile(CLIENT_BUNDLE, 'utf8'))
  assert.equal(definition.id, 'dsh-linpianpian-skin')
  const client = definition.factory(() => {
    throw new Error('The client bundle must be self-contained')
  })
  assert.equal(typeof client.apply, 'function')

  const first = fakeContext()
  client.apply(first.context)
  const body = window.document.body
  assert.equal(body.hasAttribute('data-dsh-linpianpian'), true)
  assert.equal(body.hasAttribute('data-lpp-chat-active'), true)
  assert.equal(body.hasAttribute('data-lpp-dark-theme'), true)
  assert.equal(body.hasAttribute('data-dsh-maid-atelier'), false)
  assert.equal(window.document.title, '林翩翩 · DeepSeek Harness')
  assert.equal(window.document.querySelectorAll('[data-lpp-background-stage]').length, 1)
  assert.equal(window.document.querySelectorAll('img[data-lpp-background]').length, 2)
  assert.equal(window.document.querySelectorAll('img[data-lpp-background="day"]').length, 1)
  assert.equal(window.document.querySelectorAll('img[data-lpp-background="night"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-linpianpian-stage]').length, 1)
  assert.equal(window.document.querySelectorAll('img[data-lpp-character]').length, 2)
  assert.equal(window.document.querySelectorAll('img[data-lpp-character="left"]').length, 1)
  assert.equal(window.document.querySelectorAll('img[data-lpp-character="right"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="theme-frame"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="top-trim"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="bottom-trim"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="sidebar-frame"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-lpp-corner]').length, 0)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="sidebar-mascot"]').length, 1)
  assert.equal(window.document.querySelectorAll('img[data-lpp-mascot]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="sidebar-width-rule"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-owner="linpianpian"][data-skin-chrome="skin-style"]').length, 1)
  assert.equal(window.document.querySelectorAll('link[rel="icon"]').length, 2)
  assert.match(window.document.querySelector('img[data-lpp-background="day"]').src, /^data:image\/webp;base64,/)
  assert.match(window.document.querySelector('img[data-lpp-background="night"]').src, /^data:image\/webp;base64,/)
  assert.match(window.document.querySelector('img[data-lpp-character="left"]').src, /^data:image\/webp;base64,/)
  assert.match(window.document.querySelector('img[data-lpp-character="right"]').src, /^data:image\/webp;base64,/)
  assert.match(window.document.querySelector('img[data-lpp-mascot]').src, /^data:image\/webp;base64,/)
  assert.match(body.style.getPropertyValue('--lpp-paper-texture'), /^url\("data:image\/png;base64,/)
  assert.match(body.style.getPropertyValue('--lpp-art-composer-emblem'), /^url\("data:image\/webp;base64,/)
  assert.match(body.style.getPropertyValue('--lpp-art-composer-top-start'), /^url\("data:image\/webp;base64,/)
  assert.equal(body.style.getPropertyValue('--lpp-art-composer-embroidery'), '')
  assert.equal(body.style.getPropertyValue('--lpp-art-frame'), '')
  assert.match(body.style.getPropertyValue('--lpp-art-crest'), /^url\("data:image\/webp;base64,/)
  assert.match(
    window.document.querySelector('[data-skin-chrome="skin-style"]').textContent,
    /\[data-composer-card\]/,
  )
  assert.match(
    window.document.querySelector('[data-skin-chrome="skin-style"]').textContent,
    /--lpp-settings-text/,
  )
  assert.match(
    window.document.querySelector('[data-skin-chrome="skin-style"]').textContent,
    /\[data-lpp-settings-open\]/,
  )
  assert.match(
    window.document.querySelector('[data-skin-chrome="skin-style"]').textContent,
    /data-lpp-session-row/,
  )

  const second = fakeContext()
  client.apply(second.context)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="composer-rails"]').length, 1)
  const card = window.document.querySelector('[data-composer-card]')
  const railFrame = card.querySelector('[data-skin-chrome="composer-rails"]')
  assert.equal(railFrame.getAttribute('aria-hidden'), 'true')
  assert.equal(railFrame.querySelectorAll('[data-lpp-composer-rail][data-skin-owner="linpianpian"]').length, 4)
  let sendClicks = 0
  card.querySelector('button').addEventListener('click', () => { sendClicks += 1 })
  card.querySelector('button').click()
  assert.equal(sendClicks, 1, 'decorations must not change host controls')

  // React may replace the card while switching workspaces. Re-seat the rail
  // on the new card, release the detached one, and never duplicate its layer.
  const replacement = window.document.createElement('div')
  replacement.setAttribute('data-composer-card', '')
  card.replaceWith(replacement)
  await new Promise(resolve => setTimeout(resolve, 40))
  assert.equal(railFrame.parentElement, null)
  assert.equal(replacement.querySelectorAll('[data-skin-chrome="composer-rails"]').length, 1)
  replacement.append(window.document.createElement('button'))
  await new Promise(resolve => setTimeout(resolve, 40))
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="composer-rails"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-linpianpian-stage]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="theme-frame"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="top-trim"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="bottom-trim"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="sidebar-frame"]').length, 1)
  assert.equal(window.document.querySelectorAll('[data-skin-chrome="sidebar-mascot"]').length, 1)
  assert.equal(window.document.querySelectorAll('link[rel="icon"]').length, 2)

  first.dispose()
  assert.equal(body.hasAttribute('data-dsh-linpianpian'), true)
  assert.equal(window.document.querySelectorAll('[data-linpianpian-stage]').length, 1)

  second.dispose()
  assert.equal(body.hasAttribute('data-dsh-linpianpian'), false)
  assert.equal(body.getAttribute('data-lpp-chat-active'), 'legacy')
  assert.equal(body.style.getPropertyValue('--lpp-art-neutral'), 'legacy')
  assert.equal(body.style.getPropertyValue('--lpp-background-light'), 'legacy-bg')
  assert.equal(body.style.getPropertyValue('--lpp-art-composer-emblem'), 'legacy-emblem')
  assert.equal(body.style.getPropertyValue('--lpp-art-composer-top-start'), 'legacy-top')
  assert.equal(body.hasAttribute('data-dsh-maid-atelier'), false)
  assert.equal(window.document.title, 'Original Harness')
  assert.equal(window.document.querySelectorAll('[data-skin-owner="linpianpian"]').length, 0)
  assert.equal(window.document.querySelectorAll('link[rel="icon"]').length, 1)
  assert.equal(window.document.querySelector('#original-icon').getAttribute('href'), '/original.png')
  dom.window.close()
})

test('mascot follows the footer through resizing, replacement and shared disposal', async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <aside data-pane="sidebar" style="border-bottom: 2px solid">
      <div class="host_footArea_1"><div data-slot="sidebar.settings"></div></div>
    </aside></body></html>`, {
    pretendToBeVisual: true, runScripts: 'outside-only', url: 'http://127.0.0.1:3080/',
  })
  const { window } = dom
  const { document } = window
  const observers = []
  window.ResizeObserver = class {
    targets = new Set()
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe(target) { this.targets.add(target) }
    unobserve(target) { this.targets.delete(target) }
    disconnect() { this.targets.clear() }
  }
  let sidebar = document.querySelector('aside')
  let foot = sidebar.querySelector('[class*="footArea"]')
  let width = 280
  let sidebarBottom = 800
  let footTop = 750
  const setRects = () => {
    sidebar.getBoundingClientRect = () => ({ top: 20, bottom: sidebarBottom, height: sidebarBottom - 20, width })
    foot.getBoundingClientRect = () => ({ top: footTop, bottom: sidebarBottom - 2, height: sidebarBottom - 2 - footTop, width })
  }
  setRects()
  let definition
  window.__ModuleLoader__ = { load(value) { definition = value } }
  window.eval(await readFile(CLIENT_BUNDLE, 'utf8'))
  const client = definition.factory(() => { throw new Error('Unexpected dependency') })
  const first = fakeContext()
  const second = fakeContext()
  client.apply(first.context)
  client.apply(second.context)
  const geometry = () => document.querySelector('[data-skin-chrome="sidebar-width-rule"]').sheet.cssRules[0].style
  const bottom = () => geometry().getPropertyValue('--lpp-mascot-bottom')
  const observer = observers.find(item => item.targets.has(sidebar))
  const resize = target => observer.callback([{ target, contentRect: target.getBoundingClientRect() }])
  const flush = () => new Promise(resolve => setTimeout(resolve, 40))
  assert.equal(bottom(), '44px', 'padding-box bottom minus footer top minus 4px overlap')
  assert.equal(observer.targets.has(foot), true)
  assert.equal(document.body.style.getPropertyValue('--lpp-mascot-bottom'), '', 'geometry stays in CSSOM')

  footTop = 724
  resize(foot)
  await flush()
  assert.equal(bottom(), '70px', 'footer height changes without a sidebar resize')
  width = 190
  resize(sidebar)
  await flush()
  assert.equal(bottom(), '70px')
  assert.equal(geometry().getPropertyValue('--lpp-mascot-width'), '155.8px')
  sidebarBottom = 900
  footTop = 850
  window.dispatchEvent(new window.Event('resize'))
  await flush()
  assert.equal(bottom(), '44px')

  const oldFoot = foot
  foot = foot.cloneNode(true)
  footTop = 830
  setRects()
  oldFoot.replaceWith(foot)
  await flush()
  assert.equal(bottom(), '64px')
  assert.equal(observer.targets.has(oldFoot), false)
  assert.equal(observer.targets.has(foot), true)

  foot.remove()
  await flush()
  assert.equal(bottom(), '62px', 'missing footer uses the original fallback')
  assert.equal(observer.targets.has(foot), false)
  sidebar.append(foot)
  await flush()
  assert.equal(bottom(), '64px')

  const oldSidebar = sidebar
  sidebar = sidebar.cloneNode(true)
  sidebar.querySelector('[data-skin-chrome="sidebar-mascot"]').remove()
  const previousFoot = foot
  foot = sidebar.querySelector('[class*="footArea"]')
  footTop = 840
  setRects()
  oldSidebar.replaceWith(sidebar)
  await flush()
  assert.equal(bottom(), '54px')
  assert.equal(observer.targets.has(oldSidebar), false)
  assert.equal(observer.targets.has(previousFoot), false)
  assert.equal(observer.targets.has(sidebar), true)
  assert.equal(observer.targets.has(foot), true)
  assert.equal(sidebar.querySelectorAll('[data-skin-chrome="sidebar-mascot"]').length, 1)
  assert.equal(sidebar.querySelectorAll('[data-skin-chrome="sidebar-garland"]').length, 1, 'cloned ornaments are replaced, never duplicated')
  assert.equal(foot.firstElementChild.dataset.skinChrome, 'sidebar-garland')
  assert.equal(foot.firstElementChild.getAttribute('aria-hidden'), 'true')

  first.dispose()
  assert.equal(observer.targets.has(foot), true)
  second.dispose()
  assert.equal(observer.targets.size, 0)
  assert.equal(document.querySelectorAll('[data-skin-owner="linpianpian"]').length, 0)
  assert.equal(document.body.style.getPropertyValue('--lpp-mascot-bottom'), '')
  dom.window.close()
})
