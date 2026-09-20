/**
 * Vendored from dsh-deep-whale/skin-manager (MIT, Small-tailqwq):
 * src/protocol.ts — the stable browser seam between the built-in skin
 * manager (dshmarket skin center) and independently bundled skins.
 * Copied verbatim so this skin carries no runtime dependency on the manager.
 */

export const LEGACY_SKIN_CUSTOMIZATION_PROTOCOL = 1 as const
export const SKIN_CUSTOMIZATION_PROTOCOL = 2 as const
export type SkinCustomizationProtocol = typeof LEGACY_SKIN_CUSTOMIZATION_PROTOCOL | typeof SKIN_CUSTOMIZATION_PROTOCOL

export const SKIN_CUSTOMIZATION_EVENTS = {
  [LEGACY_SKIN_CUSTOMIZATION_PROTOCOL]: {
    register: 'dsh:skin-customization-register-v1',
    unregister: 'dsh:skin-customization-unregister-v1',
    ready: 'dsh:skin-customization-ready-v1',
  },
  [SKIN_CUSTOMIZATION_PROTOCOL]: {
    register: 'dsh:skin-customization-register-v2',
    unregister: 'dsh:skin-customization-unregister-v2',
    ready: 'dsh:skin-customization-ready-v2',
  },
} as const

export interface TimeRange {
  start: string
  end: string
}

export interface VisibilitySchedule {
  enabled: boolean
  /** Visibility outside the configured ranges; ranges always use the inverse. */
  outside: 'visible' | 'hidden'
  ranges: TimeRange[]
}

export type SkinConditionValue = boolean | string | number

export interface SkinSettingCondition {
  key: string
  values: SkinConditionValue[]
}

interface SettingBase<T> {
  key: string
  label: string
  labelEn?: string
  description?: string
  descriptionEn?: string
  defaultValue: T
  disabledWhen?: string
  visibleWhen?: SkinSettingCondition
}

export interface BooleanSetting extends SettingBase<boolean> {
  type: 'boolean'
}

export interface SelectOption {
  value: string
  label: string
  labelEn?: string
}

export interface SelectSetting extends SettingBase<string> {
  type: 'select'
  options: SelectOption[]
}

export interface RangeSetting extends SettingBase<number> {
  type: 'range'
  min: number
  max: number
  step?: number
  unit?: string
}

export interface ColorSetting extends SettingBase<string> {
  type: 'color'
}

export interface CheckboxGroupSetting extends SettingBase<string[]> {
  type: 'checkbox-group'
  options: SelectOption[]
}

export interface VisibilityScheduleSetting extends SettingBase<VisibilitySchedule> {
  type: 'visibility-schedule'
}

export type SkinSetting = BooleanSetting | SelectSetting | RangeSetting | ColorSetting | CheckboxGroupSetting | VisibilityScheduleSetting
export type SkinSettingValue = boolean | string | number | string[] | VisibilitySchedule
export type SkinValues = Record<string, SkinSettingValue>

export interface SkinCustomizationState {
  values: SkinValues
  /** Effective visibility for every visibility-schedule setting. */
  visibility: Record<string, boolean>
}

export interface SkinCustomizationDefinition {
  protocol: typeof SKIN_CUSTOMIZATION_PROTOCOL
  skinId: string
  title: string
  titleEn?: string
  settings: SkinSetting[]
  /** null means release all customization-owned state. Must be idempotent. */
  apply(state: SkinCustomizationState | null): void
}

export interface SkinCustomizationRegistration {
  token: object
  definition: SkinCustomizationDefinition
}

/**
 * Expose one skin definition without a runtime dependency on the manager.
 * The ready handshake makes load order and manager hot reload irrelevant.
 */
export function exposeSkinCustomization(
  definition: SkinCustomizationDefinition,
  target: Window = window,
): () => void {
  const token = {}
  const events = SKIN_CUSTOMIZATION_EVENTS[definition.protocol]
  const register = (): void => {
    target.dispatchEvent(new CustomEvent<SkinCustomizationRegistration>(
      events.register,
      { detail: { token, definition } },
    ))
  }
  target.addEventListener(events.ready, register)
  register()
  return () => {
    target.removeEventListener(events.ready, register)
    target.dispatchEvent(new CustomEvent<SkinCustomizationRegistration>(
      events.unregister,
      { detail: { token, definition } },
    ))
    definition.apply(null)
  }
}

/** Attribute projection helper; it restores only values it still owns. */
export class SkinAttributeProjector {
  private readonly originals = new Map<string, string | null>()
  private readonly owned = new Map<string, string | null>()

  constructor(private readonly root: HTMLElement = document.documentElement) {}

  set(attribute: string, value: string): void {
    if (!this.originals.has(attribute)) this.originals.set(attribute, this.root.getAttribute(attribute))
    this.root.setAttribute(attribute, value)
    this.owned.set(attribute, value)
  }

  unset(attribute: string): void {
    if (!this.originals.has(attribute)) this.originals.set(attribute, this.root.getAttribute(attribute))
    this.root.removeAttribute(attribute)
    this.owned.set(attribute, null)
  }

  release(attribute?: string): void {
    const attributes = attribute === undefined ? [...this.originals.keys()] : [attribute]
    for (const name of attributes) {
      if (!this.originals.has(name)) continue
      const original = this.originals.get(name) ?? null
      if (this.root.getAttribute(name) === this.owned.get(name)) {
        if (original === null) this.root.removeAttribute(name)
        else this.root.setAttribute(name, original)
      }
      this.originals.delete(name)
      this.owned.delete(name)
    }
  }
}
