/**
 * 输入卡滚动意图显隐：上滚回顾会话时整卡淡出，下滚（或回到底部）淡入。
 * Ported from dsh-deep-whale maid-atelier composer-scroll.ts (MIT,
 * Small-tailqwq)，属性改为 data-lpp-*；由皮肤设置 composerMode
 * （documentElement 的 data-lpp-composer-mode，'scroll' 档）门控。
 *
 * 本模块只在宿主的稳定 data 钩子上呈现可逆的可见性状态；
 * 从不提交提示词、不创建会话。开关关闭（或皮肤管理器尚未投影状态）时，
 * 所有监听器保持惰性，不触碰任何座状态。
 */
const SCROLLPORT_SELECTOR = '[data-conversation-scroll]'
const COMPOSER_SEAT_SELECTOR = '[data-composer-seat]'
const CHAT_FLOW_SELECTOR = '[data-chat-flow]'
const MODE_ATTRIBUTE = 'data-lpp-composer-mode'
const HIDDEN_ATTRIBUTE = 'data-lpp-composer-hidden'
const INTERACTIVE_ATTRIBUTE = 'data-lpp-composer-interactive'
const NESTED_SCROLL_SURFACE_SELECTOR = [
  '[role="menu"]',
  '[role="listbox"]',
  '[role="dialog"]',
  '[aria-modal="true"]',
  '[data-radix-popper-content-wrapper]',
  '[data-floating-ui-portal]',
].join(',')

const SCROLL_THRESHOLD = 10
const BOTTOM_THRESHOLD = 24
// 草稿滚动盒上的滚轮手势可能在此后短暂带动会话区滚动（宿主 InputBar 在
// 草稿盒到顶/到底后转发 delta），那不算「回顾历史」意图
const SEAT_GESTURE_WINDOW_MS = 200

interface SeatSnapshot {
  hidden: string | null
  interactive: string | null
}

interface ScrollOwnership {
  token: symbol
  originals: Map<HTMLElement, SeatSnapshot>
}

const ownershipByDocument = new WeakMap<Document, ScrollOwnership>()

function phaseRootOf(element: Element): HTMLElement | null {
  let candidate = element.closest<HTMLElement>('[data-phase]')
  while (candidate !== null) {
    const scrollport = candidate.querySelector<HTMLElement>(SCROLLPORT_SELECTOR)
    if (scrollport?.closest('[data-phase]') === candidate) return candidate
    candidate = candidate.parentElement?.closest<HTMLElement>('[data-phase]') ?? null
  }
  return null
}

function scrollEnabled(doc: Document): boolean {
  return doc.documentElement.getAttribute(MODE_ATTRIBUTE) === 'scroll'
}

function activeSeatOf(scrollport: HTMLElement): HTMLElement | null {
  const root = phaseRootOf(scrollport)
  if (root?.dataset.phase !== 'active') return null
  // 检查器浮层会挂一个无 chat flow 的额外滚动口，其座已被皮肤 display:none，不得驱动
  if (scrollport.querySelector(CHAT_FLOW_SELECTOR) === null) return null
  return scrollport.querySelector<HTMLElement>(COMPOSER_SEAT_SELECTOR)
}

/** 打开的浮层（模型选择、模式列表、附件）内的滚轮不得驱动输入卡状态 */
function wheelBelongsToNestedSurface(event: WheelEvent, scrollport: HTMLElement): boolean {
  for (const candidate of event.composedPath()) {
    if (candidate === scrollport) break
    if (!(candidate instanceof HTMLElement)) continue
    if (candidate.matches(NESTED_SCROLL_SURFACE_SELECTOR)) return true

    const style = getComputedStyle(candidate)
    if (!/(auto|scroll)/.test(style.overflowY) || candidate.scrollHeight <= candidate.clientHeight) continue
    if (event.deltaY < 0 && candidate.scrollTop > 0) return true
    if (event.deltaY > 0 && candidate.scrollTop + candidate.clientHeight < candidate.scrollHeight) return true
  }
  return false
}

/**
 * 宿主输入卡把草稿放在限高滚动盒里（overflow-y: auto + max-height）。
 * 落在草稿盒上的滚轮手势完全属于草稿——包括到边后宿主把 delta 转发给会话区
 * 的情形；用转发来的滚动驱动隐藏会把用户正在阅读长草稿的输入卡藏掉（还会
 * blur 它），所以这类手势一律不驱动座。
 */
function wheelTargetsSeatDraft(event: WheelEvent): boolean {
  const target = event.target
  if (!(target instanceof Element)) return false
  const seat = target.closest(COMPOSER_SEAT_SELECTOR)
  if (seat === null) return false
  for (const candidate of event.composedPath()) {
    if (candidate === seat) break
    if (!(candidate instanceof HTMLElement)) continue
    const style = getComputedStyle(candidate)
    if (!/(auto|scroll)/.test(style.overflowY)) continue
    if (candidate.scrollHeight > candidate.clientHeight + 1) return true
  }
  return false
}

/**
 * @param body - 皮肤挂载元素（document.body），经它取 document；
 * 开关属性挂在 documentElement 上。
 */
export function installLppComposerScroll(body: HTMLElement): () => void {
  const doc = body.ownerDocument
  const token = Symbol('lpp-composer-scroll')
  const ownership = ownershipByDocument.get(doc) ?? { token, originals: new Map() }
  ownership.token = token
  ownershipByDocument.set(doc, ownership)
  let disposed = false
  const current = (): boolean => !disposed && ownership.token === token
  const remember = (seat: HTMLElement): void => {
    if (ownership.originals.has(seat)) return
    ownership.originals.set(seat, {
      hidden: seat.getAttribute(HIDDEN_ATTRIBUTE),
      interactive: seat.getAttribute(INTERACTIVE_ATTRIBUTE),
    })
  }
  const write = (seat: HTMLElement, attribute: string, value: string | null): void => {
    if (!current()) return
    remember(seat)
    if (value === null) seat.removeAttribute(attribute)
    else seat.setAttribute(attribute, value)
  }
  const restoreSeat = (seat: HTMLElement, snapshot: SeatSnapshot): void => {
    if (snapshot.hidden === null) seat.removeAttribute(HIDDEN_ATTRIBUTE)
    else seat.setAttribute(HIDDEN_ATTRIBUTE, snapshot.hidden)
    if (snapshot.interactive === null) seat.removeAttribute(INTERACTIVE_ATTRIBUTE)
    else seat.setAttribute(INTERACTIVE_ATTRIBUTE, snapshot.interactive)
  }
  const clearSeatStates = (): void => {
    if (!current()) return
    ownership.originals.forEach((snapshot, seat) => { restoreSeat(seat, snapshot) })
  }
  // 每个滚动口的基线惰建，新挂载的会话绝不对首次拆卸式扫场做反应
  const lastTops = new WeakMap<HTMLElement, number>()
  const composing = new WeakSet<Element>()
  const onComposition = (event: CompositionEvent): void => {
    const seat = event.target instanceof Element ? event.target.closest(COMPOSER_SEAT_SELECTOR) : null
    if (seat === null) return
    if (event.type === 'compositionstart') composing.add(seat)
    else composing.delete(seat)
  }

  const blurSeat = (seat: HTMLElement): void => {
    const active = doc.activeElement
    if (active instanceof HTMLElement && seat.contains(active)) active.blur()
  }

  const hideSeat = (seat: HTMLElement): void => {
    if (!current() || !scrollEnabled(doc) || composing.has(seat)) return
    write(seat, INTERACTIVE_ATTRIBUTE, null)
    blurSeat(seat)
    write(seat, HIDDEN_ATTRIBUTE, '')
  }

  const showSeat = (seat: HTMLElement): void => {
    write(seat, HIDDEN_ATTRIBUTE, null)
  }

  const activateSeat = (seat: HTMLElement): void => {
    showSeat(seat)
    write(seat, INTERACTIVE_ATTRIBUTE, '')
    if (!scrollEnabled(doc)) write(seat, INTERACTIVE_ATTRIBUTE, null)
  }

  // 在此之前的时间戳内，会话区滚动一律视为转发的草稿手势
  let seatGestureUntil = 0

  const onScroll = (event: Event): void => {
    if (!current() || !scrollEnabled(doc)) return
    const scrollport = event.target
    if (!(scrollport instanceof HTMLElement) || !scrollport.matches(SCROLLPORT_SELECTOR)) return
    const seat = activeSeatOf(scrollport)
    if (seat === null) return

    const top = scrollport.scrollTop
    const previousTop = lastTops.get(scrollport)
    lastTops.set(scrollport, top)
    if (Date.now() < seatGestureUntil) return

    const distanceToBottom = scrollport.scrollHeight - top - scrollport.clientHeight
    if (distanceToBottom <= BOTTOM_THRESHOLD) {
      showSeat(seat)
      return
    }
    if (previousTop !== undefined && top > previousTop + SCROLL_THRESHOLD) showSeat(seat)
    else if (previousTop !== undefined && top < previousTop - SCROLL_THRESHOLD) hideSeat(seat)
  }

  const onWheel = (event: WheelEvent): void => {
    if (!current() || !scrollEnabled(doc)) return
    // 先于 delta 阈值判断：触控板惯性尾段的小 delta 仍可能经宿主转发串到会话区
    if (wheelTargetsSeatDraft(event)) {
      seatGestureUntil = Date.now() + SEAT_GESTURE_WINDOW_MS
      return
    }
    if (Math.abs(event.deltaY) <= SCROLL_THRESHOLD) return

    for (const candidate of event.composedPath()) {
      if (!(candidate instanceof HTMLElement) || !candidate.matches(SCROLLPORT_SELECTOR)) continue
      const scrollport = candidate
      if (wheelBelongsToNestedSurface(event, scrollport)) return
      const seat = activeSeatOf(scrollport)
      if (seat === null) return
      if (!lastTops.has(scrollport)) lastTops.set(scrollport, scrollport.scrollTop)
      if (event.deltaY < 0) hideSeat(seat)
      else showSeat(seat)
      return
    }
  }

  const onFocusIn = (event: FocusEvent): void => {
    if (!current()) return
    const target = event.target
    if (!(target instanceof Element)) return
    const seat = target.closest<HTMLElement>(COMPOSER_SEAT_SELECTOR)
    if (seat !== null && phaseRootOf(seat)?.dataset.phase === 'active') activateSeat(seat)
  }

  const onFocusOut = (event: FocusEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const seat = target.closest<HTMLElement>(COMPOSER_SEAT_SELECTOR)
    if (seat === null) return
    queueMicrotask(() => {
      if (current() && !seat.contains(doc.activeElement)) write(seat, INTERACTIVE_ATTRIBUTE, null)
    })
  }

  // 关闭设置的瞬间必须立即还原每个座，而不是等下一次滚动手势
  let stateObserver: MutationObserver | undefined
  const dispose = (): void => {
    if (disposed) return
    stateObserver?.disconnect()
    doc.removeEventListener('scroll', onScroll, true)
    doc.removeEventListener('wheel', onWheel, true)
    doc.removeEventListener('focusin', onFocusIn, true)
    doc.removeEventListener('focusout', onFocusOut, true)
    doc.removeEventListener('compositionstart', onComposition, true)
    doc.removeEventListener('compositionend', onComposition, true)
    if (current()) {
      clearSeatStates()
      ownership.originals.clear()
      ownershipByDocument.delete(doc)
    }
    disposed = true
  }
  try {
  stateObserver = new MutationObserver((records) => {
    if (!current()) return
    if (!records.some(record => record.type === 'attributes' && record.attributeName === MODE_ATTRIBUTE)) return
    if (!scrollEnabled(doc)) clearSeatStates()
  })
  stateObserver.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: [MODE_ATTRIBUTE],
  })

  // scroll 不冒泡；在 document 捕获仍能看到每个滚动口的事件，无需逐元素绑定生命周期
  doc.addEventListener('scroll', onScroll, true)
  doc.addEventListener('wheel', onWheel, true)
  doc.addEventListener('focusin', onFocusIn, true)
  doc.addEventListener('focusout', onFocusOut, true)
  doc.addEventListener('compositionstart', onComposition, true)
  doc.addEventListener('compositionend', onComposition, true)

    return dispose
  } catch (error) {
    dispose()
    throw error
  }
}
