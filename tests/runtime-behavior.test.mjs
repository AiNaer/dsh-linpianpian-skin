import test from 'node:test'
import assert from 'node:assert/strict'
import { fixture, composer, rect } from './helpers/harness.mjs'

test('scene waits for its pane, follows replacements and resizes without duplicate layers', async t => {
  const f = fixture('<aside data-pane="sidebar"></aside>'); t.after(f.close)
  const client = f.mount(); client.apply(); t.after(client.dispose)
  assert.equal(f.document.querySelector('[data-lpp-scene]'), null)
  const pane = f.document.createElement('main'); pane.dataset.pane = 'conversation'; pane.innerHTML = composer
  rect(pane, { width: 1400 }); f.document.body.append(pane); await f.flush()
  const scene = f.document.querySelector('[data-lpp-scene]')
  assert.equal(scene.parentElement, pane)
  assert.equal(scene.querySelectorAll('[data-lpp-background-stage], [data-linpianpian-stage]').length, 2)
  assert.equal(f.document.body.dataset.lppSceneSize, 'wide')
  const replacement = f.document.createElement('main'); replacement.dataset.pane = 'conversation'; replacement.innerHTML = composer
  rect(replacement, { width: 800, height: 550, bottom: 550 }); pane.replaceWith(replacement); await f.flush()
  assert.equal(scene.parentElement, replacement)
  assert.equal(f.document.body.dataset.lppSceneSize, 'medium')
  rect(replacement, { width: 500, height: 450, bottom: 450 })
  const ro = f.observers.find(o => o.targets.has(replacement)); ro.callback([{ target: replacement }]); await f.flush()
  assert.equal(f.document.body.dataset.lppSceneSize, 'small')
  assert.equal(f.document.body.hasAttribute('data-lpp-viewport-resizing'), true)
  assert.equal(f.document.querySelectorAll('[data-linpianpian-stage]').length, 1)
  assert.equal(f.document.body.style.getPropertyValue('--lpp-chat-height'), '')
  client.dispose()
  assert.equal(f.frames.size, 0)
  assert.equal(f.document.querySelector('[data-lpp-scene]'), null)
})

test('layout ignores terminal, editor and backdrop mutations, batches structural changes in one frame', async t => {
  const f = fixture(); t.after(f.close)
  const main = f.document.querySelector('main'), side = f.document.querySelector('aside')
  const terminal = f.document.createElement('div'); terminal.className = 'xterm'; f.document.body.append(terminal)
  const backdrop = f.document.createElement('div'); backdrop.dataset.inputBackdrop = ''; main.append(backdrop)
  let reads = 0
  for (const element of [main, side]) element.getBoundingClientRect = () => { reads++; return { width: 1000, height: 800, bottom: 800, top: 0 } }
  const client = f.mount(); client.apply(); t.after(client.dispose); await f.flush(); reads = 0
  terminal.append(f.document.createElement('span')); backdrop.append(f.document.createElement('span'))
  f.document.querySelector('[data-composer-input]').textContent = '正在输入'
  await f.flush(); assert.equal(reads, 0)
  side.append(f.document.createElement('div')); side.append(f.document.createElement('div'))
  await f.flush(); assert.equal(reads, 2, 'one sidebar + one chat measurement in a single pass')
})

test('initialization failure rolls back, permits retry and preserves foreign successor values', async t => {
  const f = fixture(); t.after(f.close)
  f.document.body.setAttribute('data-lpp-dark-theme', 'original')
  f.document.body.style.setProperty('--lpp-art-crest', 'original', 'important')
  const insert = f.window.CSSStyleSheet.prototype.insertRule
  f.window.CSSStyleSheet.prototype.insertRule = () => { throw new Error('CSSOM failure') }
  const failed = f.mount(); assert.throws(failed.apply, /CSSOM failure/)
  failed.dispose()
  assert.equal(f.document.querySelectorAll('[data-skin-owner]').length, 0)
  assert.equal(f.window.__dshLinPianpianSkinMount, undefined)
  f.window.CSSStyleSheet.prototype.insertRule = insert
  const client = f.mount(); client.apply(); client.apply(); await f.flush()
  f.document.body.setAttribute('data-lpp-dark-theme', 'successor')
  client.dispose()
  assert.equal(f.document.body.getAttribute('data-lpp-dark-theme'), 'successor')
  assert.equal(f.document.body.style.getPropertyValue('--lpp-art-crest'), 'original')
  assert.equal(f.document.body.style.getPropertyPriority('--lpp-art-crest'), 'important')
  assert.equal(f.document.querySelectorAll('[data-skin-owner]').length, 0)
})

test('workspace hooks restore pre-existing values and do not erase later writes', async t => {
  const f = fixture('<aside data-pane="sidebar"><div role="tree"><div role="treeitem" aria-expanded="true" data-lpp-workspace-row="old"></div><div role="treeitem" aria-selected="true"></div></div></aside>'); t.after(f.close)
  const client = f.mount(); client.apply(); await f.flush()
  const workspace = f.document.querySelector('[aria-expanded]'), session = f.document.querySelector('[aria-selected]')
  assert.equal(workspace.hasAttribute('data-lpp-workspace-active'), true)
  session.setAttribute('data-lpp-session-row', 'successor')
  client.dispose()
  assert.equal(workspace.getAttribute('data-lpp-workspace-row'), 'old')
  assert.equal(session.getAttribute('data-lpp-session-row'), 'successor')
})

test('customization supplies additive defaults, respects schedules, and restores owned root attributes', t => {
  const f = fixture(); t.after(f.close)
  const root = f.document.documentElement; root.setAttribute('data-lpp-font', 'original')
  let definition
  f.window.addEventListener('dsh:skin-customization-register-v2', e => { definition = e.detail.definition })
  const dispose = f.source('customization').installLppCustomization(root)
  assert.equal(definition.settings.length, 6)
  definition.apply({ values: {}, visibility: {} })
  assert.equal(root.dataset.lppArt, 'visible'); assert.equal(root.dataset.lppBackground, 'visible'); assert.equal(root.dataset.lppSettingsLayout, 'docked')
  definition.apply({ values: { artwork: true, background: false, font: 'serif', centerSettings: true, composerMode: 'scroll' }, visibility: { sfwMode: false } })
  assert.equal(root.dataset.lppArt, 'hidden'); assert.equal(root.dataset.lppFont, 'serif'); assert.equal(root.dataset.lppBackground, 'hidden'); assert.equal(root.dataset.lppSettingsLayout, 'centered')
  root.setAttribute('data-lpp-background', 'successor'); dispose()
  assert.equal(root.dataset.lppFont, 'original'); assert.equal(root.dataset.lppBackground, 'successor'); assert.equal(root.hasAttribute('data-lpp-composer-mode'), false)
})

test('composer hiding dismisses only its open stats, once per transition, including newly mounted seats', async t => {
  const f = fixture(composer + composer); t.after(f.close)
  const seats = [...f.document.querySelectorAll('[data-composer-seat]')]
  const buttons = [...f.document.querySelectorAll('[data-composer-stats] button')]
  let first = 0, second = 0
  buttons[0].setAttribute('aria-expanded', 'true'); buttons[1].setAttribute('aria-expanded', 'true')
  buttons[0].onclick = () => { first++ }; buttons[1].onclick = () => { second++ }
  const dispose = f.source('composer-dismiss').installLppComposerDismiss(f.document.body); t.after(dispose)
  seats[0].setAttribute('data-lpp-composer-hidden', ''); await f.flush()
  assert.equal(first, 1); assert.equal(second, 0)
  seats[0].setAttribute('data-lpp-composer-hidden', ''); await f.flush(); assert.equal(first, 1)
  seats[0].removeAttribute('data-lpp-composer-hidden'); await f.flush()
  seats[0].setAttribute('data-lpp-composer-capsule', ''); await f.flush(); assert.equal(first, 2)
  const clone = seats[1].cloneNode(true); clone.setAttribute('data-lpp-composer-hidden', '')
  let late = 0; clone.querySelector('button').onclick = () => { late++ }
  f.document.body.append(clone); await f.flush(); assert.equal(late, 1)
  dispose(); seats[1].setAttribute('data-lpp-composer-hidden', ''); await f.flush(); assert.equal(second, 0)
})

test('terminal width is locked only for actual grid transitions and restored on cancel or drag', async t => {
  const f = fixture('<div id="root"><div data-slot="root"><div id="frame" style="transition-duration: .2s"><div data-dsh-better-sidebar><div id="host" style="--lpp-locked-width: 42px"><div class="xterm"></div></div></div><div data-produced-files-row></div></div></div></div>'); t.after(f.close)
  const frame = f.document.querySelector('#frame'), host = f.document.querySelector('#host'), row = f.document.querySelector('[data-produced-files-row]')
  rect(host, { width: 450 }); rect(row, { width: 300 })
  const dispose = f.source('terminal-performance').installLppTerminalPerformance(f.document.body); t.after(dispose)
  frame.style.gridTemplateColumns = '100px 1fr'; await f.flush(); assert.equal(host.hasAttribute('data-lpp-width-locked'), false)
  const emit = type => { const e = new f.window.Event(type, { bubbles: true }); Object.defineProperty(e, 'propertyName', { value: 'grid-template-columns' }); frame.dispatchEvent(e) }
  emit('transitionrun'); assert.equal(host.style.getPropertyValue('--lpp-locked-width'), '450px'); assert.equal(row.hasAttribute('data-lpp-width-locked'), true)
  emit('transitioncancel'); assert.equal(host.style.getPropertyValue('--lpp-locked-width'), '42px'); assert.equal(row.hasAttribute('data-lpp-width-locked'), false)
  emit('transitionrun'); frame.setAttribute('data-dragging', ''); await f.flush(); assert.equal(host.hasAttribute('data-lpp-width-locked'), false)
  emit('transitionrun'); assert.equal(host.hasAttribute('data-lpp-width-locked'), false)
})

test('legacy context-meter labels close on hide without touching model or attachment dialogs', async t => {
  const f = fixture(composer); t.after(f.close)
  const card = f.document.querySelector('[data-composer-card]'), seat = f.document.querySelector('[data-composer-seat]')
  const counts = new Map()
  for (const label of ['上下文已用 4%', '4% of context used', '附件预览', '选择模型']) {
    const button = f.document.createElement('button'); button.setAttribute('aria-label', label); button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-expanded', 'true')
    counts.set(label, 0); button.onclick = () => counts.set(label, counts.get(label) + 1); card.append(button)
  }
  const dispose = f.source('composer-dismiss').installLppComposerDismiss(f.document.body)
  seat.setAttribute('data-lpp-composer-hidden', ''); await f.flush()
  assert.deepEqual([...counts.values()], [1, 1, 0, 0]); dispose()
})
