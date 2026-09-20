/** Only the outer structure matters to layout; resident editors/terminals own their internals. */
const NOISY = '.xterm, [data-composer-input], [data-input-backdrop], [data-input-mirror]'
const OWNED = '[data-skin-owner="linpianpian"]'

export function isLayoutNoise(record: MutationRecord): boolean {
  const target = record.target instanceof Element ? record.target : record.target.parentElement
  if (target?.closest(`${NOISY}, ${OWNED}`)) return true
  if (record.type !== 'childList') return false
  const changed = [...record.addedNodes, ...record.removedNodes]
  // An editor/terminal root replacement must still reconcile the owning card/pane.
  return changed.length > 0 && changed.every(node => node instanceof Element && node.matches(OWNED))
}

export function touches(nodes: Node[], selector: string): boolean {
  return nodes.some(node => node instanceof Element && (node.matches(selector) || node.querySelector(selector) !== null))
}

/** Keep exact originals and restore only writes still owned by this activation. */
export class DomLease {
  private attributes = new Map<Element, Map<string, { original: string | null, written: string | null }>>()
  private styles = new Map<HTMLElement, Map<string, { original: string, priority: string, written: string, writtenPriority: string }>>()

  attr(element: Element, name: string, value: string | null): void {
    let entries = this.attributes.get(element)
    if (!entries) this.attributes.set(element, entries = new Map())
    const entry = entries.get(name) ?? { original: element.getAttribute(name), written: value }
    entry.written = value
    entries.set(name, entry)
    if (element.getAttribute(name) === value) return
    if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, value)
  }

  style(element: HTMLElement, name: string, value: string, priority = ''): void {
    let entries = this.styles.get(element)
    if (!entries) this.styles.set(element, entries = new Map())
    const entry = entries.get(name) ?? { original: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name), written: value, writtenPriority: priority }
    entry.written = value
    entry.writtenPriority = priority
    entries.set(name, entry)
    if (element.style.getPropertyValue(name) !== value || element.style.getPropertyPriority(name) !== priority) element.style.setProperty(name, value, priority)
  }

  release(element?: Element): void {
    for (const [node, entries] of this.attributes) {
      if (element && node !== element) continue
      for (const [name, entry] of entries) {
        if (node.getAttribute(name) !== entry.written) continue
        if (entry.original === null) node.removeAttribute(name)
        else node.setAttribute(name, entry.original)
      }
      this.attributes.delete(node)
    }
    for (const [node, entries] of this.styles) {
      if (element && node !== element) continue
      for (const [name, entry] of entries) {
        if (node.style.getPropertyValue(name) !== entry.written || node.style.getPropertyPriority(name) !== entry.writtenPriority) continue
        if (entry.original === '') node.style.removeProperty(name)
        else node.style.setProperty(name, entry.original, entry.priority)
      }
      this.styles.delete(node)
    }
  }
}
