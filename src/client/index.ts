/**
 * Lin Pianpian study-room skin for the DeepSeek Harness web GUI.
 *
 * Pure display-layer client plugin:
 * - body scope `data-dsh-linpianpian` gates every CSS write
 * - a two-character stage over a day/night study-room backdrop; phase
 *   changes only slide/resize the characters, nothing remounts
 * - all artwork lives in art.generated.ts as base64 webp data URIs; large
 *   scenes render through real <img> nodes, small ornaments ride CSS vars
 * - the workspace tree, sidebar width, composer phase motion and viewport
 *   state are projected onto body data attributes for the stylesheet
 *
 * The Cordis effect disposer restores every body attribute, body style
 * property, inserted node, tree hook, theme-color meta, favicon and title
 * written here.
 */
import type { Context } from '@deepseek-ai/cordis'
import { LINPIANPIAN_ART } from './art.generated'
import { LINPIANPIAN_CSS } from './skin'
import { installLppComposerCapsule } from './composer-capsule'
import { installLppComposerScroll } from './composer-scroll'
import { installLppCustomization } from './customization'
import { installLppTableCards } from './table-card'
import { createLppSettingsNavigation } from './settings-navigation'
import { installLppBootError } from './boot-error'
import { DomLease, isLayoutNoise, touches } from './dom-changes'
import { installLppComposerDismiss } from './composer-dismiss'
import { installLppTerminalPerformance } from './terminal-performance'

const SKIN_OWNER = 'linpianpian'
const SKIN_BODY_ATTRIBUTE = 'data-dsh-linpianpian'
const SKIN_TITLE = '林翩翩 · DeepSeek Harness'
const SKIN_MOUNT_KEY = '__dshLinPianpianSkinMount' as const
const SKIN_SYSTEM_CHROME_COLOR = '#1b3328'
const INCOMPATIBLE_SKIN_ATTRIBUTE = 'data-dsh-maid-atelier'

const SIDEBAR_COLUMN_SELECTOR = ":is([data-pane='sidebar'], [class*='sidebarCol'])"
const CONVERSATION_PANE_SELECTOR = ":is([data-pane='conversation'], [class*='centerCol'])"
const ACTIVE_PHASE_SELECTOR = "[data-phase='active']"
const CHAT_FLOW_SELECTOR = '[data-chat-flow]'
const DARK_THEME_ATTRIBUTE = 'data-ds-dark-theme'
const SETTINGS_OPEN_SELECTOR =
  "[data-slot='sidebar.settings'] [role='dialog'], " +
  "[data-slot='sidebar.settings'] > :is(button, [role='button'])[aria-expanded='true']"

const PROJECTED_STATE_ATTRIBUTES = {
  chatActive: 'data-lpp-chat-active',
  darkTheme: 'data-lpp-dark-theme',
  sidebarSize: 'data-lpp-sidebar-size',
  sidebarCompact: 'data-lpp-sidebar-compact',
  sceneSize: 'data-lpp-scene-size',
  settingsOpen: 'data-lpp-settings-open',
  composerMotion: 'data-lpp-composer-motion',
  viewportResizing: 'data-lpp-viewport-resizing',
  lowPower: 'data-lpp-low-power',
} as const

const COMPOSER_RAIL_ART = {
  '--lpp-art-composer-corner-tl': 'composerCornerTl',
  '--lpp-art-composer-corner-tr': 'composerCornerTr',
  '--lpp-art-composer-corner-bl': 'composerCornerBl',
  '--lpp-art-composer-corner-br': 'composerCornerBr',
  '--lpp-art-composer-top-start': 'composerTopStart',
  '--lpp-art-composer-top-end': 'composerTopEnd',
  '--lpp-art-composer-bottom-start': 'composerBottomStart',
  '--lpp-art-composer-bottom-end': 'composerBottomEnd',
  '--lpp-art-composer-left-start': 'composerLeftStart',
  '--lpp-art-composer-left-end': 'composerLeftEnd',
  '--lpp-art-composer-right-start': 'composerRightStart',
  '--lpp-art-composer-right-end': 'composerRightEnd',
} as const

const TREE_HOOKS = [
  'lppWorkspaceGroup',
  'lppWorkspaceRow',
  'lppWorkspaceActive',
  'lppSessionRow',
  'lppSessionFlat',
  'lppSessionFirst',
  'lppSessionLast',
] as const

const VIEWPORT_RESIZE_SETTLE_MS = 120
const COMPOSER_MOTION_MS = 560

interface NavigatorWithWindowControlsOverlay extends Navigator {
  readonly windowControlsOverlay?: EventTarget
}

interface SkinMountState {
  disposed: boolean
  dispose: () => void
  refs: number
}

type WindowWithSkinMount = Window & {
  [SKIN_MOUNT_KEY]?: SkinMountState
}

function releaseSkinMount(owner: WindowWithSkinMount, mount: SkinMountState): void {
  if (mount.disposed || mount.refs === 0) return
  mount.refs -= 1
  if (mount.refs > 0) return
  mount.disposed = true
  try {
    mount.dispose()
  } finally {
    if (owner[SKIN_MOUNT_KEY] === mount) delete owner[SKIN_MOUNT_KEY]
  }
}

/** Software-rendered WebGL means large filtered character layers stutter. */
function hasAcceleratedWebGL(): boolean {
  if (typeof WebGLRenderingContext === 'undefined') return false
  const canvas = document.createElement('canvas')
  const options: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true }
  for (const kind of ['webgl2', 'webgl'] as const) {
    try {
      const context = canvas.getContext(kind, options) as WebGLRenderingContext | null
      if (context === null) continue
      context.getExtension('WEBGL_lose_context')?.loseContext()
      return true
    } catch {
      // A blocked or software-only context uses the CPU-safe CSS path.
    }
  }
  return false
}

/** The study backdrop: day and night scenes cross-fade in CSS. */
function createThemeBackground(): HTMLElement {
  const background = document.createElement('div')
  background.dataset.skinOwner = SKIN_OWNER
  background.dataset.skinChrome = 'theme-background'
  background.dataset.lppBackgroundStage = ''
  background.setAttribute('aria-hidden', 'true')

  for (const [key, source] of [
    ['day', LINPIANPIAN_ART.backgroundDay],
    ['night', LINPIANPIAN_ART.backgroundNight],
  ] as const) {
    const image = document.createElement('img')
    image.dataset.lppBackground = key
    image.src = source
    image.alt = ''
    image.draggable = false
    image.decoding = 'async'
    image.setAttribute('aria-hidden', 'true')
    background.append(image)
  }
  return background
}

/**
 * Both heroines live on ONE stage above the background: always mounted, and
 * phase changes only slide/resize them. The left one peeks from behind the
 * sidebar seam — the sidebar itself is her door frame. The right one stands
 * by the bookshelves at the free right edge.
 */
function createCharacterStage(): HTMLElement {
  const stage = document.createElement('div')
  stage.dataset.skinOwner = SKIN_OWNER
  stage.dataset.skinChrome = 'character-stage'
  stage.dataset.linpianpianStage = ''
  stage.setAttribute('aria-hidden', 'true')

  const createCharacter = (side: 'left' | 'right', source: string): HTMLImageElement => {
    const image = document.createElement('img')
    image.dataset.skinOwner = SKIN_OWNER
    image.dataset.lppCharacter = side
    image.src = source
    image.alt = ''
    image.draggable = false
    image.decoding = 'async'
    image.setAttribute('aria-hidden', 'true')
    return image
  }

  stage.append(
    createCharacter('left', LINPIANPIAN_ART.charLeft),
    createCharacter('right', LINPIANPIAN_ART.charRight),
  )
  return stage
}

function createThemeFrame(): HTMLElement {
  const frame = document.createElement('div')
  frame.dataset.skinOwner = SKIN_OWNER
  frame.dataset.skinChrome = 'theme-frame'
  frame.setAttribute('aria-hidden', 'true')
  return frame
}

/** The hero lintel: a lacquer band with a gilt fret and the celadon crest. */
function createTopTrim(): HTMLElement {
  const trim = document.createElement('div')
  trim.dataset.skinOwner = SKIN_OWNER
  trim.dataset.skinChrome = 'top-trim'
  trim.setAttribute('aria-hidden', 'true')
  return trim
}

/** The bottom eave band, dismissed while a conversation is active. */
function createBottomTrim(): HTMLElement {
  const trim = document.createElement('div')
  trim.dataset.skinOwner = SKIN_OWNER
  trim.dataset.skinChrome = 'bottom-trim'
  trim.setAttribute('aria-hidden', 'true')
  return trim
}

/** Fixed-size osmanthus corners joined by responsive gilt hairlines. */
function createSidebarFrame(): HTMLElement {
  const frame = document.createElement('div')
  frame.dataset.skinOwner = SKIN_OWNER
  frame.dataset.skinChrome = 'sidebar-frame'
  frame.setAttribute('aria-hidden', 'true')
  return frame
}

/** The chibi mascot: absolute at the sidebar foot, BELOW the content layer. */
function createSidebarMascot(): HTMLElement {
  const mascot = document.createElement('div')
  mascot.dataset.skinOwner = SKIN_OWNER
  mascot.dataset.skinChrome = 'sidebar-mascot'
  mascot.setAttribute('aria-hidden', 'true')
  const image = document.createElement('img')
  image.dataset.skinOwner = SKIN_OWNER
  image.dataset.lppMascot = ''
  image.src = LINPIANPIAN_ART.chibi
  image.alt = ''
  image.draggable = false
  image.decoding = 'async'
  image.setAttribute('aria-hidden', 'true')
  mascot.append(image)
  return mascot
}

/**
 * Apply the skin. Every write below is paired with a cleanup path in the
 * disposer returned through `ctx.effect`.
 */
export function apply(ctx: Context): void {
  const owner = window as WindowWithSkinMount
  const existingMount = owner[SKIN_MOUNT_KEY]
  if (existingMount !== undefined && !existingMount.disposed) {
    existingMount.refs += 1
    let released = false
    try {
      ctx.effect(
        () => () => { if (!released) { released = true; releaseSkinMount(owner, existingMount) } },
        'ui-skin-linpianpian: shared portrait mount',
      )
    } catch (error) {
      if (!released) releaseSkinMount(owner, existingMount)
      throw error
    }
    return
  }

  const body = document.body
  const originalTitle = document.title
  const lease = new DomLease()
  const treeLease = new DomLease()
  const setBody = (name: string, value: string | null): void => lease.attr(body, name, value)
  const flag = (name: string, value: boolean): void => setBody(name, value ? '' : null)
  const ownedNodes = new Set<Element>()
  const decoratedElements = new Set<HTMLElement>()
  const composerRails = new Map<HTMLElement, HTMLElement>()
  // Like maid-atelier's lace rail, this purely decorative layer follows host
  // card replacements. No resize JS: CSS clips fixed-density textures.
  const ensureComposerRails = (): void => {
    const cards = new Set(document.querySelectorAll<HTMLElement>('[data-composer-card]'))
    for (const [card, frame] of composerRails) {
      if (cards.has(card)) continue
      frame.remove()
      ownedNodes.delete(frame)
      composerRails.delete(card)
    }
    for (const card of cards) {
      let frame = composerRails.get(card)
      if (frame === undefined) {
        frame = document.createElement('div')
        frame.dataset.skinOwner = SKIN_OWNER
        frame.dataset.skinChrome = 'composer-rails'
        frame.setAttribute('aria-hidden', 'true')
        for (const side of ['top', 'bottom', 'left', 'right']) {
          const rail = document.createElement('span')
          rail.dataset.skinOwner = SKIN_OWNER
          rail.dataset.lppComposerRail = side
          frame.append(rail)
        }
        composerRails.set(card, frame)
        ownedNodes.add(frame)
      }
      if (frame.parentElement !== card) card.prepend(frame)
    }
  }

  let resizeObserver: ResizeObserver | undefined
  let observedSidebar: HTMLElement | undefined
  let observedSidebarFoot: HTMLElement | undefined
  let observedConversation: HTMLElement | undefined
  let mutationObserver: MutationObserver | undefined
  let themeColorObserver: MutationObserver | undefined
  let handleViewportResize: (() => void) | undefined
  let windowControlsOverlay: EventTarget | undefined
  let viewportResizeTimer: ReturnType<typeof setTimeout> | undefined
  let composerMotionTimer: ReturnType<typeof setTimeout> | undefined
  let composerPhase: string | undefined
  let disposeCustomization: (() => void) | undefined
  let disposeComposerCapsule: (() => void) | undefined
  let disposeComposerScroll: (() => void) | undefined
  let tableCards: { dispose(): void } | undefined
  let settingsNavigation: { synchronize(): void, dispose(): void } | undefined
  let disposeBootError: (() => void) | undefined
  let disposeComposerDismiss: (() => void) | undefined
  let disposeTerminalPerformance: (() => void) | undefined
  let reconcileFrame: number | undefined
  const pending = new Set<'state' | 'sidebar' | 'tree' | 'scene' | 'composer' | 'geometry'>()

  const mount: SkinMountState = {
    disposed: false,
    dispose: () => {},
    refs: 1,
  }
  owner[SKIN_MOUNT_KEY] = mount
  mount.dispose = () => {
    if (reconcileFrame !== undefined) cancelAnimationFrame(reconcileFrame)
    pending.clear()
    mutationObserver?.disconnect()
    themeColorObserver?.disconnect()
    resizeObserver?.disconnect()
    disposeComposerDismiss?.()
    disposeTerminalPerformance?.()
    disposeCustomization?.()
    disposeComposerCapsule?.()
    disposeComposerScroll?.()
    tableCards?.dispose()
    settingsNavigation?.dispose()
    disposeBootError?.()
    if (viewportResizeTimer !== undefined) clearTimeout(viewportResizeTimer)
    if (composerMotionTimer !== undefined) clearTimeout(composerMotionTimer)
    window.removeEventListener('resize', handleViewportResize as EventListener)
    if (windowControlsOverlay !== undefined && handleViewportResize !== undefined) {
      windowControlsOverlay.removeEventListener('geometrychange', handleViewportResize)
    }
    treeLease.release()
    lease.release()
    ownedNodes.forEach(element => element.remove())
    composerRails.clear()
    if (document.title === SKIN_TITLE) document.title = originalTitle
  }
  let released = false
  try {
    ctx.effect(
      () => () => { if (!released) { released = true; releaseSkinMount(owner, mount) } },
      'ui-skin-linpianpian: study scene and presentation',
    )
    const style = document.createElement('style')
    style.dataset.skinOwner = SKIN_OWNER
    style.dataset.skinChrome = 'skin-style'
    style.textContent = LINPIANPIAN_CSS
    ownedNodes.add(style)
    document.head.append(style)

    // Sidebar-coupled geometry goes into our own <style> rule instead of
    // body.style: CSSOM mutations do not fire attribute mutations, so the
    // host MutationObservers (and Chrome autofill's) stay quiet while the
    // sidebar width is dragged frame by frame.
    const widthSheet = document.createElement('style')
    widthSheet.dataset.skinOwner = SKIN_OWNER
    widthSheet.dataset.skinChrome = 'sidebar-width-rule'
    ownedNodes.add(widthSheet)
    document.head.append(widthSheet)
    widthSheet.sheet!.insertRule(
      'body[data-dsh-linpianpian] { --lpp-sidebar-width: 280px; --lpp-mascot-width: 230px; --lpp-mascot-bottom: 62px; }',
    )
    const widthRule = widthSheet.sheet!.cssRules[0] as CSSStyleRule
    const setGeometryVar = (name: string, value: string): void => {
      if (widthRule.style.getPropertyValue(name) !== value) widthRule.style.setProperty(name, value)
    }

    const favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.type = 'image/png'
    favicon.href = LINPIANPIAN_ART.favicon
    favicon.dataset.skinOwner = SKIN_OWNER
    favicon.dataset.skinChrome = 'favicon'
    ownedNodes.add(favicon)
    document.head.append(favicon)

    const background = createThemeBackground()
    ownedNodes.add(background)


    const stage = createCharacterStage()
    ownedNodes.add(stage)


    const themeFrame = createThemeFrame()
    ownedNodes.add(themeFrame)
    body.append(themeFrame)

    const topTrim = createTopTrim()
    ownedNodes.add(topTrim)


    const bottomTrim = createBottomTrim()
    ownedNodes.add(bottomTrim)


    const sidebarFrame = createSidebarFrame()
    ownedNodes.add(sidebarFrame)
    body.append(sidebarFrame)

    const scene = document.createElement('div')
    scene.dataset.skinOwner = SKIN_OWNER
    scene.dataset.lppScene = ''
    scene.setAttribute('aria-hidden', 'true')
    scene.append(background, stage, topTrim, bottomTrim)
    ownedNodes.add(scene)
    const ensureScene = (): void => {
      const pane = document.querySelector<HTMLElement>(CONVERSATION_PANE_SELECTOR)
      if (pane === null) { scene.remove(); return }
      if (scene.parentElement !== pane) pane.prepend(scene)
    }

    // The mascot rides INSIDE the sidebar column (beneath its content layer,
    // maid-atelier style); re-seat it whenever the host remounts the pane.
    const mascot = createSidebarMascot()
    ownedNodes.add(mascot)
    const garland = document.createElement('div')
    garland.dataset.skinOwner = SKIN_OWNER
    garland.dataset.skinChrome = 'sidebar-garland'
    garland.setAttribute('aria-hidden', 'true')
    ownedNodes.add(garland)
    const ensureSidebarMascot = (): void => {
      const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
      if (sidebar !== null && mascot.parentElement !== sidebar) {
        sidebar.prepend(mascot)
      }
      const foot = sidebar?.querySelector("[data-slot='sidebar.settings']")?.closest("[class*='footArea']")
      // Host replacements can clone the old subtree, including its decoration.
      sidebar?.querySelectorAll("[data-skin-owner='linpianpian'][data-skin-chrome='sidebar-garland']").forEach(node => {
        if (node !== garland) node.remove()
      })
      if (foot && garland.parentElement !== foot) foot.prepend(garland)
      else if (!foot) garland.remove()
    }

    body.removeAttribute(INCOMPATIBLE_SKIN_ATTRIBUTE)
    setBody(SKIN_BODY_ATTRIBUTE, '')
    lease.style(body, '--lpp-paper-texture', `url("${LINPIANPIAN_ART.paperTexture}")`)
    lease.style(body, '--lpp-art-composer-emblem', `url("${LINPIANPIAN_ART.composerEmblem}")`)
    for (const [property, key] of Object.entries(COMPOSER_RAIL_ART)) {
      lease.style(body, property, `url("${LINPIANPIAN_ART[key]}")`)
    }
    lease.style(body, '--lpp-art-crest', `url("${LINPIANPIAN_ART.crest}")`)
    lease.style(body, '--lpp-art-plaque', `url("${LINPIANPIAN_ART.plaque}")`)
    lease.style(body, '--lpp-art-token', `url("${LINPIANPIAN_ART.waistToken}")`)
    lease.style(body, '--lpp-art-workspace-osmanthus', `url("${LINPIANPIAN_ART.workspaceOsmanthus}")`)
    for (const [key, source] of Object.entries(LINPIANPIAN_ART)) {
      if (key.startsWith('sidebar_')) lease.style(body, `--lpp-art-${key.replaceAll('_', '-')}`, `url("${source}")`)
    }
    lease.style(body, '--lpp-art-corner-tl', `url("${LINPIANPIAN_ART.cornerTl}")`)
    lease.style(body, '--lpp-art-corner-tr', `url("${LINPIANPIAN_ART.cornerTr}")`)
    lease.style(body, '--lpp-art-corner-bl', `url("${LINPIANPIAN_ART.cornerBl}")`)
    lease.style(body, '--lpp-art-corner-br', `url("${LINPIANPIAN_ART.cornerBr}")`)
    lease.style(body, '--lpp-art-brocade', `url("${LINPIANPIAN_ART.brocade}")`)
    lease.style(body, '--lpp-art-char-left', `url("${LINPIANPIAN_ART.charLeft}")`)
    lease.style(body, '--lpp-art-char-right', `url("${LINPIANPIAN_ART.charRight}")`)
    lease.style(body, '--lpp-art-trim-top', `url("${LINPIANPIAN_ART.trimTop}")`)
    lease.style(body, '--lpp-art-trim-bottom', `url("${LINPIANPIAN_ART.trimBottom}")`)

    // 皮肤设置项（皮肤中心）与输入卡空态胶囊/滚动显隐三个自含模块
    disposeCustomization = installLppCustomization()
    disposeComposerCapsule = installLppComposerCapsule(body)
    disposeComposerScroll = installLppComposerScroll(body)
    disposeComposerDismiss = installLppComposerDismiss(body)
    disposeTerminalPerformance = installLppTerminalPerformance(body)
    tableCards = installLppTableCards(ctx)
    settingsNavigation = createLppSettingsNavigation(body)
    disposeBootError = installLppBootError()
    document.title = SKIN_TITLE

    const syncSystemChrome = (): void => {
      let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      if (meta === null) {
        meta = document.createElement('meta')
        meta.name = 'theme-color'
        meta.dataset.skinOwner = SKIN_OWNER
        ownedNodes.add(meta)
        document.head.append(meta)
      }
      lease.attr(meta, 'content', SKIN_SYSTEM_CHROME_COLOR)
    }
    themeColorObserver = new MutationObserver(syncSystemChrome)
    themeColorObserver.observe(document.head, {
      attributes: true,
      attributeFilter: ['content'],
      childList: true,
      subtree: true,
    })

    const syncProjectedState = (): void => {
      if (body.hasAttribute(INCOMPATIBLE_SKIN_ATTRIBUTE)) {
        body.removeAttribute(INCOMPATIBLE_SKIN_ATTRIBUTE)
      }
      const pane = document.querySelector(CONVERSATION_PANE_SELECTOR)
      const chatActive = pane !== null && (pane.matches(ACTIVE_PHASE_SELECTOR) || pane.querySelector(ACTIVE_PHASE_SELECTOR) !== null) && pane.querySelector(CHAT_FLOW_SELECTOR) !== null
      flag(PROJECTED_STATE_ATTRIBUTES.chatActive, chatActive)
      flag(
        PROJECTED_STATE_ATTRIBUTES.darkTheme,
        body.hasAttribute(DARK_THEME_ATTRIBUTE),
      )
      flag(
        PROJECTED_STATE_ATTRIBUTES.settingsOpen,
        document.querySelector(SETTINGS_OPEN_SELECTOR) !== null,
      )
      settingsNavigation?.synchronize()
    }

    /** One-shot dock/rise marker while the composer switches hero/active. */
    const syncComposerMotion = (): void => {
      const phaseRoot = document.querySelector<HTMLElement>(
        "[data-phase='hero'], [data-phase='active']",
      )
      const next = phaseRoot?.dataset.phase
      if (next !== 'hero' && next !== 'active') return
      if (composerPhase !== undefined && composerPhase !== next) {
        setBody(
          PROJECTED_STATE_ATTRIBUTES.composerMotion,
          next === 'active' ? 'dock' : 'rise',
        )
        if (composerMotionTimer !== undefined) clearTimeout(composerMotionTimer)
        composerMotionTimer = setTimeout(() => {
          setBody(PROJECTED_STATE_ATTRIBUTES.composerMotion, null)
          composerMotionTimer = undefined
        }, COMPOSER_MOTION_MS)
      }
      composerPhase = next
    }

    /**
     * Tag workspace tree rows with stable semantic hooks so the stylesheet can
     * draw the gilt connection lines, the selected-session plaque and the
     * active-workspace ribbon without depending on generated class names.
     */
    const decorateWorkspaceTree = (): void => {
      const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
      if (sidebar === null) { treeLease.release(); decoratedElements.clear(); return }

      const desired = new Map<HTMLElement, Set<string>>()
      const mark = (element: HTMLElement, hook: string): void => {
        let hooks = desired.get(element)
        if (!hooks) desired.set(element, hooks = new Set())
        hooks.add(hook)
      }
      sidebar.querySelectorAll<HTMLElement>("[role='tree']").forEach((tree) => {
        const rows = [...tree.querySelectorAll<HTMLElement>("[role='treeitem']")]
        if (tree.matches("[class*='flatList']") && !rows.some(row => row.hasAttribute('aria-expanded'))) {
          rows.filter(row => row.hasAttribute('aria-selected')).forEach((sessionRow) => {
            mark(sessionRow, 'lppSessionRow')
            mark(sessionRow, 'lppSessionFlat')
          })
          return
        }

        let workspaceRow: HTMLElement | undefined
        let sessionRows: HTMLElement[] = []
        const decorateGroup = (): void => {
          if (workspaceRow === undefined) return
          mark(workspaceRow, 'lppWorkspaceRow')
          if (workspaceRow.parentElement !== null) {
            mark(workspaceRow.parentElement, 'lppWorkspaceGroup')
          }
          sessionRows.forEach((sessionRow) => {
            mark(sessionRow, 'lppSessionRow')
          })
          const first = sessionRows[0]
          const last = sessionRows.at(-1)
          if (first !== undefined) mark(first, 'lppSessionFirst')
          if (last !== undefined) mark(last, 'lppSessionLast')

          const containsCurrent = workspaceRow.getAttribute('aria-expanded') === 'true'
            && sessionRows.some(row => row.getAttribute('aria-selected') === 'true')
          if (containsCurrent) mark(workspaceRow, 'lppWorkspaceActive')
        }

        rows.forEach((row) => {
          if (row.hasAttribute('aria-expanded')) {
            decorateGroup()
            workspaceRow = row
            sessionRows = []
          } else if (workspaceRow !== undefined && row.hasAttribute('aria-selected')) {
            sessionRows.push(row)
          }
        })
        decorateGroup()
      })
      const attribute = (hook: string): string => `data-${hook.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`
      for (const element of decoratedElements) {
        if (!desired.has(element)) { treeLease.release(element); decoratedElements.delete(element) }
      }
      for (const [element, hooks] of desired) {
        for (const hook of TREE_HOOKS) treeLease.attr(element, attribute(hook), hooks.has(hook) ? '' : null)
        decoratedElements.add(element)
      }
    }

    const syncSidebarWidth = (width: number): void => {
      let size: 'rail' | 'narrow' | 'wide'
      if (width <= 120) {
        size = 'rail'
      } else if (width <= 200) {
        size = 'narrow'
      } else {
        size = 'wide'
      }
      const roundPx = (value: number): string => `${Math.round(value * 100) / 100}px`
      setGeometryVar('--lpp-sidebar-width', roundPx(Math.max(0, width)))
      setGeometryVar('--lpp-mascot-width', roundPx(Math.min(300, Math.max(0, width * 0.82))))
      setBody(PROJECTED_STATE_ATTRIBUTES.sidebarSize, size)
      flag(PROJECTED_STATE_ATTRIBUTES.sidebarCompact, width > 0 && width <= 104)
    }

    const ensureSidebarObserved = (): void => {
      if (resizeObserver === undefined) return
      const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
      if (sidebar === observedSidebar) return
      if (observedSidebar !== undefined) resizeObserver.unobserve(observedSidebar)
      observedSidebar = sidebar ?? undefined
      if (observedSidebar !== undefined) resizeObserver.observe(observedSidebar)
    }

    const ensureConversationObserved = (): void => {
      if (resizeObserver === undefined) return
      const pane = document.querySelector<HTMLElement>(CONVERSATION_PANE_SELECTOR)
      if (pane === observedConversation) return
      if (observedConversation !== undefined) resizeObserver.unobserve(observedConversation)
      observedConversation = pane ?? undefined
      if (observedConversation !== undefined) resizeObserver.observe(observedConversation)
    }

    // Keep the hem 4px behind the settings bar, even when its height changes.
    // Measure the entire foot, not the settings slot (which also hosts dialogs).
    const syncGeometry = (): void => {
      const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
      const foot = sidebar?.querySelector<HTMLElement>("[data-slot='sidebar.settings']")?.closest<HTMLElement>("[class*='footArea']") ?? undefined
      if (foot !== observedSidebarFoot) {
        if (observedSidebarFoot) resizeObserver?.unobserve(observedSidebarFoot)
        observedSidebarFoot = foot
        if (foot) resizeObserver?.observe(foot)
      }
      // Read all geometry before mutating attributes or CSSOM.
      const sidebarRect = sidebar?.getBoundingClientRect()
      const footRect = foot?.getBoundingClientRect()
      const border = sidebar ? parseFloat(getComputedStyle(sidebar).borderBottomWidth) || 0 : 0
      const pane = document.querySelector<HTMLElement>(CONVERSATION_PANE_SELECTOR)
      const chatRect = pane?.getBoundingClientRect()
      const bottom = sidebarRect && footRect && sidebarRect.height > 0 && footRect.height > 0
        ? sidebarRect.bottom - border - footRect.top - 4 : 62
      syncSidebarWidth(sidebarRect?.width ?? 0)
      setGeometryVar('--lpp-mascot-bottom', `${Math.round(bottom * 100) / 100}px`)
      setBody(PROJECTED_STATE_ATTRIBUTES.sceneSize, !chatRect || chatRect.width <= 0 ? null : chatRect.width <= 520 ? 'small' : chatRect.width <= 900 ? 'medium' : 'wide')
    }

    const markResizing = (): void => {
      setBody(PROJECTED_STATE_ATTRIBUTES.viewportResizing, '')
      if (viewportResizeTimer !== undefined) clearTimeout(viewportResizeTimer)
      viewportResizeTimer = setTimeout(() => {
        setBody(PROJECTED_STATE_ATTRIBUTES.viewportResizing, null)
        viewportResizeTimer = undefined
      }, VIEWPORT_RESIZE_SETTLE_MS)
    }
    const reconcile = (): void => {
      reconcileFrame = undefined
      if (mount.disposed) return
      const work = new Set(pending)
      pending.clear()
      if (work.has('sidebar')) { ensureSidebarObserved(); ensureSidebarMascot() }
      if (work.has('scene')) { ensureScene(); ensureConversationObserved() }
      if (work.has('geometry') || work.has('sidebar') || work.has('scene')) syncGeometry()
      if (work.has('state') || work.has('scene')) syncProjectedState()
      if (work.has('composer') || work.has('scene')) { ensureComposerRails(); syncComposerMotion() }
      if (work.has('tree') || work.has('sidebar')) decorateWorkspaceTree()
    }
    const schedule = (...tasks: Array<'state' | 'sidebar' | 'tree' | 'scene' | 'composer' | 'geometry'>): void => {
      if (mount.disposed) return
      tasks.forEach(task => pending.add(task))
      if (reconcileFrame === undefined) reconcileFrame = requestAnimationFrame(reconcile)
    }
    handleViewportResize = (): void => { markResizing(); schedule('geometry') }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => { markResizing(); schedule('geometry') })
    }
    // First mount is synchronous; subsequent host mutations are coalesced by frame.
    for (const task of ['state', 'sidebar', 'tree', 'scene', 'composer', 'geometry'] as const) pending.add(task)
    reconcile()
    syncSystemChrome()
    if (!hasAcceleratedWebGL()) setBody(PROJECTED_STATE_ATTRIBUTES.lowPower, '')
    window.addEventListener('resize', handleViewportResize)
    windowControlsOverlay = (navigator as NavigatorWithWindowControlsOverlay).windowControlsOverlay
    windowControlsOverlay?.addEventListener('geometrychange', handleViewportResize)

    const settings = "[data-slot='sidebar.settings']"
    const composer = '[data-composer-card], [data-composer-seat]'
    const phase = '[data-phase], [data-chat-flow]'
    mutationObserver = new MutationObserver(records => {
      for (const record of records) {
        if (isLayoutNoise(record)) continue
        const target = record.target instanceof Element ? record.target : record.target.parentElement
        if (!target) continue
        if (record.type === 'attributes') {
          if (record.attributeName === DARK_THEME_ATTRIBUTE || record.attributeName === INCOMPATIBLE_SKIN_ATTRIBUTE) schedule('state')
          if (record.attributeName === 'data-phase' || record.attributeName === 'data-chat-flow') schedule('state', 'composer')
          if (target.closest(settings)) schedule('state')
          else if (target.closest(SIDEBAR_COLUMN_SELECTOR) && (record.attributeName === 'aria-selected' || record.attributeName === 'aria-expanded')) schedule('tree')
          if (record.attributeName === 'data-slot' || record.attributeName === 'role') {
            if (target.closest(SIDEBAR_COLUMN_SELECTOR)) schedule('sidebar', 'state')
          }
          continue
        }
        const nodes = [...record.addedNodes, ...record.removedNodes].filter(node => !(node instanceof Element && node.matches('[data-skin-owner="linpianpian"]')))
        if (touches(nodes, SIDEBAR_COLUMN_SELECTOR)) schedule('sidebar', 'tree', 'state')
        else if (target.closest(settings)) schedule('state', 'geometry')
        else if (target.closest(SIDEBAR_COLUMN_SELECTOR)) schedule('sidebar', 'tree')
        if (touches(nodes, CONVERSATION_PANE_SELECTOR)) schedule('scene')
        if (touches(nodes, composer)) schedule('composer')
        if (touches(nodes, phase)) schedule('state', 'composer')
      }
    })
    mutationObserver.observe(body, {
      attributes: true,
      attributeFilter: ['aria-expanded', 'aria-selected', 'data-chat-flow', DARK_THEME_ATTRIBUTE, INCOMPATIBLE_SKIN_ATTRIBUTE, 'data-phase', 'data-slot', 'role'],
      childList: true,
      subtree: true,
    })
  } catch (error) {
    // Cordis may never receive a disposer when apply fails: roll back here too.
    releaseSkinMount(owner, mount)
    throw error
  }
}
