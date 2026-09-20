/**
 * 空态胶囊：当皮肤设置「输入框显示方式」＝空态胶囊时，活跃对话的输入卡为空、
 * 未聚焦、无弹出菜单即收成一条胶囊；点击胶囊聚焦编辑器展开，输入保持展开，
 * 任何打开的浮层（模型选择、模式列表、附件）也保持展开。
 *
 * Ported from dsh-deep-whale maid-atelier composer-capsule.ts (MIT,
 * Small-tailqwq)，属性改为 data-lpp-*，由本皮肤的样式表响应。
 * 折/展的布局切换是瞬时的；只有 transform/opacity 走合成器动画，
 * 状态翻转绝不引起会话区重排。点击绑在输入区的内容（todo、队列消息、
 * 目标进度）不触发——只有落在胶囊卡本体上的点击才夺取焦点。
 */
const SEAT_SELECTOR = '[data-composer-seat]'
const SCROLLPORT_SELECTOR = '[data-conversation-scroll]'
const CHAT_FLOW_SELECTOR = '[data-chat-flow]'
const CARD_SELECTOR = "[data-composer-card]:not([class*='cardWorkspaceTrigger'])"
const INPUT_SELECTOR = '[data-composer-input]'
const MODE_ATTRIBUTE = 'data-lpp-composer-mode'
const CAPSULE_ATTRIBUTE = 'data-lpp-composer-capsule'
const EXPANDING_ATTRIBUTE = 'data-lpp-composer-expanding'
const MENU_OPEN_SELECTOR = "[aria-expanded='true']"
// 在打开的浮层内点击不算离开输入卡
const POPOVER_SELECTOR = [
  '[role="menu"]',
  '[role="listbox"]',
  '[role="dialog"]',
  '[aria-modal="true"]',
  '[data-radix-popper-content-wrapper]',
  '[data-floating-ui-portal]',
].join(',')
const EXPAND_LIFETIME_MS = 280
// 高频子树（终端）的变动与输入卡状态无关，排除在校准路径之外
const HIGH_CHURN_SELECTOR = '.xterm'

interface SeatSnapshot {
  capsule: string | null
  expanding: string | null
}

interface CapsuleOwnership {
  token: symbol
  originals: Map<HTMLElement, SeatSnapshot>
}

const ownershipByDocument = new WeakMap<Document, CapsuleOwnership>()

function phaseRootOf(element: Element): HTMLElement | null {
  let candidate = element.closest<HTMLElement>('[data-phase]')
  while (candidate !== null) {
    const scrollport = candidate.querySelector<HTMLElement>(SCROLLPORT_SELECTOR)
    if (scrollport?.closest('[data-phase]') === candidate) return candidate
    candidate = candidate.parentElement?.closest<HTMLElement>('[data-phase]') ?? null
  }
  return null
}

function belongsToHighChurnSubtree(node: Node): boolean {
  if (node instanceof Element) {
    return node.matches(HIGH_CHURN_SELECTOR) || node.closest(HIGH_CHURN_SELECTOR) !== null
  }
  return (node.parentElement?.closest(HIGH_CHURN_SELECTOR) ?? null) !== null
}

/**
 * @param body - 皮肤挂载元素（document.body），经它取 document；
 * 模式属性挂在 documentElement 上。
 */
export function installLppComposerCapsule(body: HTMLElement): () => void {
  const doc = body.ownerDocument
  const token = Symbol('lpp-composer-capsule')
  const ownership = ownershipByDocument.get(doc) ?? { token, originals: new Map() }
  ownership.token = token
  ownershipByDocument.set(doc, ownership)
  let disposed = false
  const current = (): boolean => !disposed && ownership.token === token
  const remember = (seat: HTMLElement): void => {
    if (ownership.originals.has(seat)) return
    ownership.originals.set(seat, {
      capsule: seat.getAttribute(CAPSULE_ATTRIBUTE),
      expanding: seat.getAttribute(EXPANDING_ATTRIBUTE),
    })
  }
  const write = (seat: HTMLElement, attribute: string, value: string | null): void => {
    if (!current()) return
    remember(seat)
    if (value === null) seat.removeAttribute(attribute)
    else seat.setAttribute(attribute, value)
  }
  const restoreAttribute = (seat: HTMLElement, attribute: string): void => {
    if (!current()) return
    const snapshot = ownership.originals.get(seat)
    if (snapshot === undefined) return
    const value = attribute === CAPSULE_ATTRIBUTE ? snapshot.capsule : snapshot.expanding
    if (value === null) seat.removeAttribute(attribute)
    else seat.setAttribute(attribute, value)
  }
  const restoreSeat = (seat: HTMLElement, snapshot: SeatSnapshot): void => {
    if (snapshot.capsule === null) seat.removeAttribute(CAPSULE_ATTRIBUTE)
    else seat.setAttribute(CAPSULE_ATTRIBUTE, snapshot.capsule)
    if (snapshot.expanding === null) seat.removeAttribute(EXPANDING_ATTRIBUTE)
    else seat.setAttribute(EXPANDING_ATTRIBUTE, snapshot.expanding)
  }
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const wasCapsule = new WeakMap<HTMLElement, boolean>()
  // 用户碰过输入卡（聚焦、输入、点其 chrome）后，胶囊不得在光标背后收起：
  // 点卡片非文字区会 blur 编辑器，无条件的 空+未聚焦 规则会立刻折叠它。
  // 只有明确点击卡外（会话区、todo、侧栏——但不含打开的浮层）才重新武装自动收起。
  const interacted = new WeakMap<HTMLElement, boolean>()
  const composing = new WeakSet<Element>()

  const schedule = (callback: () => void, delay: number): void => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      callback()
    }, delay)
    timers.add(timer)
  }

  const capsuleMode = (): boolean => doc.documentElement.getAttribute(MODE_ATTRIBUTE) === 'capsule'

  const synchronize = (): void => {
    if (!current()) return
    const active = capsuleMode()
    doc.querySelectorAll<HTMLElement>(SEAT_SELECTOR).forEach((seat) => {
      const root = phaseRootOf(seat)
      const scrollport = seat.closest<HTMLElement>(SCROLLPORT_SELECTOR)
      const pending: () => void = () => {
        remember(seat)
        restoreAttribute(seat, CAPSULE_ATTRIBUTE)
        restoreAttribute(seat, EXPANDING_ATTRIBUTE)
      }
      if (
        !active
        || root?.dataset.phase !== 'active'
        || scrollport === null
        || scrollport.querySelector(CHAT_FLOW_SELECTOR) === null
      ) {
        wasCapsule.set(seat, false)
        pending()
        return
      }
      const card = seat.querySelector<HTMLElement>(CARD_SELECTOR)
      const input = card?.querySelector<HTMLElement>(INPUT_SELECTOR) ?? null
      if (card === null || input === null) {
        wasCapsule.set(seat, false)
        pending()
        return
      }
      const empty = (input.textContent ?? '').trim() === ''
      const focused = card.contains(doc.activeElement)
      const menuOpen = card.querySelector(MENU_OPEN_SELECTOR) !== null
      const attachments = card.querySelector("[data-slot='conversation.input.attachments'] [role='group'] > *") !== null
      const next = empty && !focused && !menuOpen && !attachments && !composing.has(seat) && interacted.get(seat) !== true
      const previous = wasCapsule.get(seat) === true
      wasCapsule.set(seat, next)
      if (next) {
        write(seat, CAPSULE_ATTRIBUTE, '')
        restoreAttribute(seat, EXPANDING_ATTRIBUTE)
        return
      }
      restoreAttribute(seat, CAPSULE_ATTRIBUTE)
      if (previous) {
        // 折->展：布局瞬时换回；一次性标记播放 transform/opacity 关键帧，过渡绝不重排
        write(seat, EXPANDING_ATTRIBUTE, '')
        schedule(() => { restoreAttribute(seat, EXPANDING_ATTRIBUTE) }, EXPAND_LIFETIME_MS)
      } else {
        restoreAttribute(seat, EXPANDING_ATTRIBUTE)
      }
    })
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (!current()) return
    const target = event.target
    if (!(target instanceof Element)) return
    const card = target.closest<HTMLElement>(CARD_SELECTOR)
    if (card !== null) {
      const seat = card.closest<HTMLElement>(SEAT_SELECTOR)
      if (seat !== null) interacted.set(seat, true)
      return
    }
    if (target.closest(SEAT_SELECTOR) !== null || target.closest(POPOVER_SELECTOR) !== null) return
    doc.querySelectorAll<HTMLElement>(SEAT_SELECTOR).forEach(seat => { interacted.set(seat, false) })
    synchronize()
  }

  const onFocusIn = (event: FocusEvent): void => {
    if (!current()) return
    const target = event.target
    if (!(target instanceof Element)) return
    const seat = target.closest<HTMLElement>(SEAT_SELECTOR)
    if (seat === null) return
    interacted.set(seat, true)
    synchronize()
  }

  const onFocusOut = (event: FocusEvent): void => {
    if (!current()) return
    const target = event.target
    if (!(target instanceof Element) || target.closest(SEAT_SELECTOR) === null) return
    // 焦点可能移到 seat 外的浮层；让菜单自己的 aria-expanded 先落地
    queueMicrotask(synchronize)
  }

  const onInput = (event: Event): void => {
    if (!current()) return
    const target = event.target
    if (!(target instanceof Element)) return
    const seat = target.closest<HTMLElement>(SEAT_SELECTOR)
    if (seat === null) return
    interacted.set(seat, true)
    synchronize()
  }

  const onComposition = (event: CompositionEvent): void => {
    const target = event.target
    const seat = target instanceof Element ? target.closest(SEAT_SELECTOR) : null
    if (seat === null) return
    if (event.type === 'compositionstart') composing.add(seat)
    else composing.delete(seat)
    onInput(event)
  }

  const onClick = (event: MouseEvent): void => {
    if (!current()) return
    const target = event.target
    if (!(target instanceof Element)) return
    const card = target.closest<HTMLElement>(CARD_SELECTOR)
    if (card === null) return
    const seat = card.closest<HTMLElement>(SEAT_SELECTOR)
    if (seat === null || !seat.hasAttribute(CAPSULE_ATTRIBUTE)) return
    const input = card.querySelector<HTMLElement>(INPUT_SELECTOR)
    if (input === null || card.contains(doc.activeElement)) return
    // 先把 Lexical 根从胶囊 CSS 移出布局的状态还原，再聚焦；
    // focusin 随后完成完整过渡
    interacted.set(seat, true)
    restoreAttribute(seat, CAPSULE_ATTRIBUTE)
    input.focus({ preventScroll: true })
  }

  const touchComposerMutation = (record: MutationRecord): boolean => {
    if (record.type === 'attributes') {
      const element = record.target instanceof Element ? record.target : undefined
      // 会话相位翻转（hero/active/settling）按座全域重新归属
      if (record.attributeName === 'data-phase') {
        return element !== undefined && phaseRootOf(element) === element
      }
      return element?.closest(SEAT_SELECTOR) !== null
    }
    if (belongsToHighChurnSubtree(record.target)) return false
    if (record.target instanceof Element && record.target.closest(INPUT_SELECTOR) !== null) return false
    const changed = [...record.addedNodes, ...record.removedNodes]
    if (changed.length === 0) {
      return record.target instanceof Element && record.target.closest(SEAT_SELECTOR) !== null
    }
    if (changed.every(belongsToHighChurnSubtree)) return false
    const targetElement = record.target instanceof Element ? record.target : undefined
    return (targetElement?.closest(SEAT_SELECTOR) ?? null) !== null
      || (targetElement?.closest(SCROLLPORT_SELECTOR) ?? null) !== null
      || changed.some(node => (
        node instanceof Element
        && (node.matches([SEAT_SELECTOR, CARD_SELECTOR, INPUT_SELECTOR].join(', '))
          || node.querySelector([SEAT_SELECTOR, CARD_SELECTOR, INPUT_SELECTOR].join(', ')) !== null)
      ))
  }

  let observer: MutationObserver | undefined
  let modeObserver: MutationObserver | undefined
  const dispose = (): void => {
    if (disposed) return
    observer?.disconnect()
    modeObserver?.disconnect()
    doc.removeEventListener('pointerdown', onPointerDown, true)
    doc.removeEventListener('focusin', onFocusIn, true)
    doc.removeEventListener('focusout', onFocusOut, true)
    doc.removeEventListener('input', onInput, true)
    doc.removeEventListener('compositionstart', onComposition, true)
    doc.removeEventListener('compositionend', onComposition, true)
    doc.removeEventListener('click', onClick)
    timers.forEach(timer => { clearTimeout(timer) })
    timers.clear()
    if (current()) {
      ownership.originals.forEach((snapshot, seat) => { restoreSeat(seat, snapshot) })
      ownership.originals.clear()
      ownershipByDocument.delete(doc)
    }
    disposed = true
  }
  try {
  observer = new MutationObserver((records) => {
    if (!records.some(touchComposerMutation)) return
    synchronize()
  })
  observer.observe(doc.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-expanded', 'data-phase'],
  })

  // 切换设置项要立即套用或清除胶囊，不等下一次交互
  modeObserver = new MutationObserver(() => { synchronize() })
  modeObserver.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: [MODE_ATTRIBUTE],
  })

  doc.addEventListener('pointerdown', onPointerDown, true)
  doc.addEventListener('focusin', onFocusIn, true)
  doc.addEventListener('focusout', onFocusOut, true)
  doc.addEventListener('input', onInput, true)
  doc.addEventListener('compositionstart', onComposition, true)
  doc.addEventListener('compositionend', onComposition, true)
  doc.addEventListener('click', onClick)
  synchronize()

    return dispose
  } catch (error) {
    dispose()
    throw error
  }
}
