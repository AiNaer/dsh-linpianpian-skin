/** Adapted from dsh-deep-whale/maid-atelier (MIT, Small-tailqwq). */
import { isLayoutNoise } from './dom-changes'
const SEAT = '[data-composer-seat]'
// 0.1.2rc1 context meter predates data-composer-stats. Only its verified
// localized accessible labels qualify; arbitrary dialog triggers stay alone.
const OPEN_STATS = [
  "[data-composer-stats] button[aria-expanded='true'][aria-haspopup='dialog']",
  "[data-composer-card] button[aria-expanded='true'][aria-haspopup='dialog'][aria-label^='上下文已用 ']",
  "[data-composer-card] button[aria-expanded='true'][aria-haspopup='dialog'][aria-label$=' of context used']",
].join(',')
const HIDING = ['data-lpp-composer-hidden', 'data-lpp-composer-capsule']

export function installLppComposerDismiss(body: HTMLElement): () => void {
  const hidden = new WeakMap<Element, boolean>()
  const synchronize = (seat: Element): void => {
    const next = HIDING.some(attr => seat.hasAttribute(attr))
    if (hidden.get(seat) === next) return
    hidden.set(seat, next)
    if (next) seat.querySelectorAll<HTMLButtonElement>(OPEN_STATS).forEach(button => button.click())
  }
  const observer = new MutationObserver(records => {
    const seats = new Set<Element>()
    for (const record of records) {
      if (isLayoutNoise(record)) continue
      if (record.target instanceof Element && record.target.matches(SEAT) && body.contains(record.target)) seats.add(record.target)
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue
        if (node.matches(SEAT)) seats.add(node)
        node.querySelectorAll(SEAT).forEach(seat => seats.add(seat))
      }
    }
    seats.forEach(synchronize)
  })
  try {
    observer.observe(body, { attributes: true, attributeFilter: HIDING, subtree: true, childList: true })
    body.querySelectorAll(SEAT).forEach(synchronize)
  } catch (error) {
    observer.disconnect()
    throw error
  }
  return () => observer.disconnect()
}
