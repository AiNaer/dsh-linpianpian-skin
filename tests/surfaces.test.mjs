import test from 'node:test'
import assert from 'node:assert/strict'
import { fixture } from './helpers/harness.mjs'

test('wide tables expand by geometry, yield to native modals, and restore on resize/disposal', async t => {
  const f = fixture('<div data-chat-flow-kind="assistant-step"><div class="markdown"><div class="md-table-wide"><table><tr><td>wide data</td></tr></table></div></div></div>'); t.after(f.close)
  const bubble = f.document.querySelector('.markdown'), wrapper = f.document.querySelector('.md-table-wide'), table = f.document.querySelector('table')
  Object.defineProperty(bubble, 'clientWidth', { configurable: true, value: 400 })
  Object.defineProperty(table, 'scrollWidth', { configurable: true, value: 900 })
  const runtime = f.source('table-card').installLppTableCards({}); t.after(runtime.dispose)
  const button = wrapper.querySelector('[data-lpp-table-expand]'); assert.ok(button)
  button.click(); assert.equal(f.document.querySelectorAll('[data-lpp-table-lightbox]').length, 1)
  const modal = f.document.createElement('div'); modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); f.document.body.append(modal); await f.flush()
  assert.equal(wrapper.hasAttribute('data-lpp-table-open'), false)
  modal.remove(); await f.flush()
  const ro = f.observers.find(o => o.targets.has(bubble))
  ro.callback([{ target: bubble, contentBoxSize: [{ inlineSize: 1000 }], contentRect: { width: 1000 } }])
  assert.equal(wrapper.hasAttribute('data-lpp-table-expandable'), false)
  runtime.dispose()
  assert.equal(f.document.querySelectorAll('[data-lpp-table-expand], [data-lpp-table-lightbox]').length, 0)
  assert.equal(wrapper.querySelector('table'), table, 'host table is preserved')
})

test('table partial installation failure retracts controls and attributes', t => {
  const f = fixture('<div class="markdown"><div class="md-table-wide"><table><tr><td>x</td></tr></table></div></div>'); t.after(f.close)
  Object.defineProperty(f.document.querySelector('.markdown'), 'clientWidth', { value: 400 })
  Object.defineProperty(f.document.querySelector('table'), 'scrollWidth', { value: 900 })
  const wrapper = f.document.querySelector('.md-table-wide')
  wrapper.addEventListener = () => { throw new Error('listener failure') }
  assert.throws(() => f.source('table-card').installLppTableCards({}), /listener failure/)
  assert.equal(f.document.querySelector('[data-lpp-table-expand]'), null)
  assert.equal(wrapper.hasAttribute('data-lpp-table-frame'), false)
})

test('settings navigation follows remaining scroll range and restores original hint', t => {
  const f = fixture('<div data-slot="sidebar.settings"><div role="presentation"><div role="dialog"><nav><header>Settings</header><div><button>General</button></div></nav></div></div></div>'); t.after(f.close)
  const nav = f.document.querySelector('nav'), list = nav.lastElementChild
  Object.defineProperty(list, 'scrollHeight', { value: 700 }); Object.defineProperty(list, 'clientHeight', { value: 300 })
  nav.setAttribute('data-lpp-settings-more', 'original')
  const runtime = f.source('settings-navigation').createLppSettingsNavigation(f.document.body)
  runtime.synchronize()
  assert.equal(nav.getAttribute('data-lpp-settings-more'), '')
  list.scrollTop = 400; list.dispatchEvent(new f.window.Event('scroll')); assert.equal(nav.hasAttribute('data-lpp-settings-more'), false)
  runtime.dispose(); assert.equal(nav.getAttribute('data-lpp-settings-more'), 'original')
})

test('boot failure enhancement leaves the report intact and retracts when failure disappears', async t => {
  const f = fixture('<div data-dsh-boot><div>Failed to load plugins</div><pre>Original diagnostic</pre></div>'); t.after(f.close)
  const boot = f.document.querySelector('[data-dsh-boot]')
  const dispose = f.source('boot-error').installLppBootError()
  assert.equal(boot.hasAttribute('data-lpp-boot-error'), true)
  assert.equal(boot.querySelector('pre').textContent, 'Original diagnostic')
  boot.firstElementChild.textContent = 'Loading'; await f.flush(); assert.equal(boot.hasAttribute('data-lpp-boot-error'), false)
  dispose()
})
