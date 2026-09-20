/**
 * 设置类目导航的「还有更多」投影：类目列表可继续下滚时给 nav 打
 * data-lpp-settings-more，样式表据此在底部画一枚描金下滑提示。
 * Ported from dsh-deep-whale maid-atelier settings-navigation.ts (MIT,
 * Small-tailqwq)。宿主重建导航时由皮肤既有的设置 observer 重新 synchronize。
 */
const NAV_SELECTOR = "[data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav"
const MORE_ATTRIBUTE = 'data-lpp-settings-more'

interface SettingsNavigation {
  synchronize: () => void
  dispose: () => void
}

const installations = new WeakMap<Document, { users: number, controller: SettingsNavigation }>()

export function createLppSettingsNavigation(body: HTMLElement): SettingsNavigation {
  const doc = body.ownerDocument
  let installation = installations.get(doc)
  if (installation === undefined) {
    installation = { users: 0, controller: createNavigation(body) }
    installations.set(doc, installation)
  }
  const current = installation
  current.users += 1
  let active = true
  return {
    synchronize: () => { if (active) current.controller.synchronize() },
    dispose: () => {
      if (!active) return
      active = false
      if (--current.users > 0) return
      current.controller.dispose()
      installations.delete(doc)
    },
  }
}

function createNavigation(body: HTMLElement): SettingsNavigation {
  let active = true
  let nav: HTMLElement | null = null
  let list: HTMLElement | null = null
  let originalMore: string | null = null
  let writtenMore: string | null = null
  let resizeObserver: ResizeObserver | undefined

  const update = (): void => {
    if (!active || nav === null || list === null) return
    const more = list.scrollHeight - list.clientHeight - Math.max(0, list.scrollTop) > 1
    writtenMore = more ? '' : null
    if (nav.getAttribute(MORE_ATTRIBUTE) === writtenMore) return
    if (writtenMore === null) nav.removeAttribute(MORE_ATTRIBUTE)
    else nav.setAttribute(MORE_ATTRIBUTE, writtenMore)
  }

  const detach = (): void => {
    resizeObserver?.disconnect()
    resizeObserver = undefined
    list?.removeEventListener('scroll', update)
    if (nav !== null && nav.getAttribute(MORE_ATTRIBUTE) === writtenMore) {
      if (originalMore === null) nav.removeAttribute(MORE_ATTRIBUTE)
      else nav.setAttribute(MORE_ATTRIBUTE, originalMore)
    }
    nav = null
    list = null
  }

  const synchronize = (): void => {
    if (!active) return
    const nextNav = body.querySelector<HTMLElement>(NAV_SELECTOR)
    const nextList = nextNav?.querySelector<HTMLElement>(':scope > :last-child') ?? null
    if (nav !== nextNav || list !== nextList) {
      detach()
      nav = nextNav
      list = nextList
      originalMore = nav?.getAttribute(MORE_ATTRIBUTE) ?? null
      writtenMore = originalMore
      if (list !== null) {
        try {
          list.addEventListener('scroll', update, { passive: true })
          if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(update)
            resizeObserver.observe(list)
          }
        } catch (error) {
          detach()
          throw error
        }
      }
    }
    update()
  }

  const dispose = (): void => {
    if (!active) return
    active = false
    detach()
  }
  return { synchronize, dispose }
}
