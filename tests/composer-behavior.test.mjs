import test from 'node:test'
import assert from 'node:assert/strict'
import { fixture, composer } from './helpers/harness.mjs'

test('capsule retains attachments, composition, drafts and open menus; persistent mode clears it', async t => {
  const f = fixture(composer); t.after(f.close)
  const root = f.document.documentElement, seat = f.document.querySelector('[data-composer-seat]'), input = f.document.querySelector('[data-composer-input]')
  root.dataset.lppComposerMode = 'capsule'
  const dispose = f.source('composer-capsule').installLppComposerCapsule(f.document.body); t.after(dispose)
  assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), true)
  const attachments = f.document.querySelector('[data-slot="conversation.input.attachments"]')
  attachments.innerHTML = '<div role="group"><button>image</button></div>'; await f.flush()
  assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), false)
  attachments.replaceChildren(); await f.flush(); assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), true)
  input.dispatchEvent(new f.window.CompositionEvent('compositionstart', { bubbles: true }))
  f.document.body.dispatchEvent(new f.window.Event('pointerdown', { bubbles: true })); await f.flush()
  assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), false)
  input.textContent = '中文草稿'; input.dispatchEvent(new f.window.CompositionEvent('compositionend', { bubbles: true })); await f.flush()
  assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), false)
  input.textContent = ''; input.dispatchEvent(new f.window.Event('input', { bubbles: true }))
  const button = f.document.querySelector('button'); button.setAttribute('aria-expanded', 'true')
  f.document.body.dispatchEvent(new f.window.Event('pointerdown', { bubbles: true })); await f.flush()
  assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), false)
  button.setAttribute('aria-expanded', 'false'); await f.flush(); assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), true)
  root.dataset.lppComposerMode = 'persistent'; await f.flush(); assert.equal(seat.hasAttribute('data-lpp-composer-capsule'), false)
})

test('scroll hides only its active seat, reveals on down, and leaves nested drafts/IME intact', async t => {
  const f = fixture(composer + composer); t.after(f.close)
  f.document.documentElement.dataset.lppComposerMode = 'scroll'
  const dispose = f.source('composer-scroll').installLppComposerScroll(f.document.body); t.after(dispose)
  const scroll = f.document.querySelector('[data-conversation-scroll]'), seat = scroll.querySelector('[data-composer-seat]'), input = seat.querySelector('[data-composer-input]')
  const wheel = (target, deltaY) => target.dispatchEvent(new f.window.WheelEvent('wheel', { deltaY, bubbles: true, composed: true }))
  wheel(scroll, -100); assert.equal(seat.hasAttribute('data-lpp-composer-hidden'), true)
  assert.equal(f.document.querySelectorAll('[data-lpp-composer-hidden]').length, 1)
  wheel(scroll, 100); assert.equal(seat.hasAttribute('data-lpp-composer-hidden'), false)
  input.dispatchEvent(new f.window.CompositionEvent('compositionstart', { bubbles: true })); wheel(scroll, -100)
  assert.equal(seat.hasAttribute('data-lpp-composer-hidden'), false)
  input.dispatchEvent(new f.window.CompositionEvent('compositionend', { bubbles: true }))
  input.style.overflowY = 'auto'; Object.defineProperty(input, 'scrollHeight', { value: 500 }); Object.defineProperty(input, 'clientHeight', { value: 100 })
  wheel(input, -100); assert.equal(seat.hasAttribute('data-lpp-composer-hidden'), false)
  const menu = f.document.createElement('div'); menu.setAttribute('role', 'menu'); scroll.append(menu)
  wheel(menu, -100); assert.equal(seat.hasAttribute('data-lpp-composer-hidden'), false)
  wheel(scroll, -100); f.document.documentElement.dataset.lppComposerMode = 'persistent'; await f.flush()
  assert.equal(seat.hasAttribute('data-lpp-composer-hidden'), false)
})

test('composer installer failure leaves no observer registrations or projected state', t => {
  for (const module of ['composer-capsule', 'composer-scroll']) {
    const f = fixture(composer); t.after(f.close)
    let active = 0
    const RealObserver = f.window.MutationObserver
    f.window.MutationObserver = class extends RealObserver {
      observed = false
      observe(target, options) { if (target === f.document.documentElement) throw new Error('observer failure'); super.observe(target, options); if (!this.observed) { active++; this.observed = true } }
      disconnect() { if (this.observed) active--; this.observed = false; super.disconnect() }
    }
    const install = Object.values(f.source(module))[0]
    assert.throws(() => install(f.document.body), /observer failure/)
    assert.equal(active, 0)
  }
})
