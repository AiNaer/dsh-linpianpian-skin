/** Transition protection inspired by dsh-deep-whale/orca-link (MIT, Small-tailqwq). */
import { DomLease } from './dom-changes'

const FRAME = "[id='root'] > div[data-slot='root'] > div"
const SURFACES = '[data-dsh-better-sidebar] .xterm, [data-produced-files-row]'

export function installLppTerminalPerformance(body: HTMLElement): () => void {
  let leases: DomLease | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let frame: Element | undefined
  const observer = new MutationObserver(() => {
    if (frame?.hasAttribute('data-dragging') || frame?.isConnected === false) release()
  })
  const release = (): void => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    observer.disconnect()
    leases?.release()
    leases = undefined
    frame = undefined
  }
  const onTransition = (event: Event): void => {
    const transition = event as TransitionEvent
    const target = transition.target
    if (!(target instanceof HTMLElement) || !target.matches(FRAME) || transition.propertyName !== 'grid-template-columns') return
    if (transition.type !== 'transitionrun') {
      if (target === frame) release()
      return
    }
    release()
    if (target.hasAttribute('data-dragging')) return
    // A real transitionrun is the contract: no guessed locks for hosts without grid animation.
    const measured = [...body.querySelectorAll<HTMLElement>(SURFACES)]
      .map(node => node.matches('.xterm') ? node.parentElement : node)
      .filter((node): node is HTMLElement => node !== null)
      .map(node => ({ node, width: node.getBoundingClientRect().width }))
      .filter(item => item.width > 0)
    frame = target
    leases = new DomLease()
    for (const { node, width } of measured) {
      leases.attr(node, 'data-lpp-width-locked', '')
      leases.style(node, '--lpp-locked-width', `${width}px`)
    }
    observer.observe(target, { attributes: true, attributeFilter: ['data-dragging'] })
    observer.observe(body, { childList: true })
    const durations = getComputedStyle(target).transitionDuration.split(',').map(value => parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000))
    const delays = getComputedStyle(target).transitionDelay.split(',').map(value => parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000))
    timer = setTimeout(release, Math.max(380, ...durations.map((duration, index) => duration + (delays[index % delays.length] || 0) + 100)))
  }
  for (const name of ['transitionrun', 'transitionend', 'transitioncancel']) body.addEventListener(name, onTransition, true)
  return () => {
    for (const name of ['transitionrun', 'transitionend', 'transitioncancel']) body.removeEventListener(name, onTransition, true)
    release()
  }
}
