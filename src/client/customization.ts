import {
  exposeSkinCustomization,
  SKIN_CUSTOMIZATION_PROTOCOL,
  SkinAttributeProjector,
  type SkinCustomizationState,
} from './skin-customization'

const ATTR_ART = 'data-lpp-art'
const ATTR_COMPOSER_MODE = 'data-lpp-composer-mode'

/** 注册皮肤设置项，并把由此产生的一切 DOM 变更收归皮肤所有（含卸载还原）。 */
export function installLppCustomization(root: HTMLElement = document.documentElement): () => void {
  const projector = new SkinAttributeProjector(root)

  const apply = (state: SkinCustomizationState | null): void => {
    if (state === null) {
      projector.release()
      return
    }
    const artwork = state.values.artwork !== false
    const scheduleVisible = state.visibility.sfwMode !== false
    projector.set(ATTR_ART, artwork && scheduleVisible ? 'visible' : 'hidden')
    projector.set(ATTR_COMPOSER_MODE, typeof state.values.composerMode === 'string' ? state.values.composerMode : 'persistent')
    projector.set('data-lpp-font', state.values.font === 'serif' ? 'serif' : 'system')
    projector.set('data-lpp-background', state.values.background === false ? 'hidden' : 'visible')
    projector.set('data-lpp-settings-layout', state.values.centerSettings === true ? 'centered' : 'docked')
  }

  return exposeSkinCustomization({
    protocol: SKIN_CUSTOMIZATION_PROTOCOL,
    skinId: 'linpianpian',
    title: '林翩翩 · 松烟鎏金书斋',
    titleEn: 'Lin Pianpian Pine-soot Study',
    settings: [
      {
        key: 'font', type: 'select', label: '消息正文字体', labelEn: 'Message prose font', defaultValue: 'system',
        options: [
          { value: 'system', label: '系统默认', labelEn: 'System default' },
          { value: 'serif', label: '宋体正文', labelEn: 'Serif prose' },
        ],
      },
      {
        key: 'background', type: 'boolean', label: '显示书斋背景', labelEn: 'Show the study background', defaultValue: true,
        description: '关闭后使用素色底面；人物显示仍由立绘开关与时段控制。',
      },
      {
        key: 'centerSettings', type: 'boolean', label: '宽屏设置面板居中', labelEn: 'Center settings on wide screens', defaultValue: false,
      },
      {
        key: 'artwork',
        type: 'boolean',
        label: '显示双人物立绘',
        labelEn: 'Show the twin character artwork',
        defaultValue: true,
      },
      {
        key: 'sfwMode',
        type: 'visibility-schedule',
        label: '素书模式',
        labelEn: 'Plain-study mode',
        description: '按本机时间控制双人物立绘；可设置工作时段隐藏、其他时间显示，也可反向设置。',
        descriptionEn: 'Control the twin artwork by local time; hide it during work hours and show it otherwise, or the reverse.',
        defaultValue: { enabled: false, outside: 'visible', ranges: [] },
      },
      {
        key: 'composerMode',
        type: 'select',
        label: '输入框显示方式',
        labelEn: 'Composer visibility mode',
        description: '始终显示；空态胶囊在输入框为空且未聚焦时收起为简约胶囊；滚动显隐在上滚回顾时隐去、下滚渐现。',
        descriptionEn: 'Always visible; the idle capsule collapses to a slim capsule while the composer is empty and unfocused; scroll mode hides it when scrolling up to review and reveals it when scrolling down.',
        defaultValue: 'persistent',
        options: [
          { value: 'persistent', label: '始终显示', labelEn: 'Always visible' },
          { value: 'capsule', label: '空态胶囊（点击展开）', labelEn: 'Idle capsule (click to expand)' },
          { value: 'scroll', label: '上滚隐去 · 下滚渐现', labelEn: 'Hide on scroll up · show on scroll down' },
        ],
      },
    ],
    apply,
  })
}
