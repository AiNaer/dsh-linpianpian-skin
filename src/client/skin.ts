/**
 * Lin Pianpian study-room skin — the whole theme as one CSS string.
 *
 * Visual identity: 松烟鎏金 (pine-soot & gilt, ADR-0003) + 宣纸受光面 +
 * 海棠器形. Light theme is the day study (白昼书斋), dark theme is the night
 * study (灯下夜读); the two backdrops are two real <img> layers cross-faded here.
 *
 * Layering contract:
 * - skin body isolates the scene so negative layers stay above its background
 * - background stage   z-index 0 inside the chat scene
 * - character stage    z-index 1 inside the chat scene (below host UI)
 * - sidebar frame      z-index 4 (above the sidebar column z 3)
 * - sidebar mascot     inside the sidebar column, z 0 below the content z 1
 * - bottom-trim 19 / top-trim 20 / theme-frame 30
 * - every decorative layer is pointer-events: none
 */
import { SIDEBAR_CSS } from './sidebar-skin'

export const LINPIANPIAN_CSS = String.raw`
/* ============ 1. 色板与设计 token ============ */

body[data-dsh-linpianpian] {
  /* 松烟鎏金自有变量（亮）：绿为体量、金为工艺、宣纸受光 */
  --lpp-lacquer-1: #2a4a3a;
  --lpp-lacquer-2: #1e3729;
  --lpp-lacquer-3: #16281e;
  --lpp-pine: #6f9a7d;
  --lpp-pine-deep: #22603f;
  --lpp-pine-bright: #a8c8b2;
  --lpp-porcelain: #f7f3e8;
  --lpp-paper: #f0ead8;
  --lpp-paper-strong: rgba(248, 245, 236, 0.96);
  --lpp-gold: #c9a24a;
  --lpp-gold-hi: #e4cb90;
  --lpp-gold-deep: #9a7830;
  --lpp-gold-line: rgba(201, 162, 74, 0.55);
  --lpp-ink: #1f3a2d;
  --lpp-ink-soft: #57705f;
  --lpp-ivory: #f3eedd;
  --lpp-ivory-dim: #b3c4b4;
  --lpp-seal: #a6442f;
  --lpp-shadow: rgba(20, 40, 30, 0.16);
  --lpp-shadow-card: 0 12px 36px rgba(20, 40, 30, 0.16), 0 2px 8px rgba(20, 40, 30, 0.08);
  --lpp-settings-text: #1f3a2d;
  --lpp-settings-muted: #57705f;

  /* 宿主 token 全局重绑：亮 */
  --dsw-alias-bg-base: transparent;
  --dsw-alias-bg-layer-1: rgba(247, 243, 232, 0.72);
  --dsw-alias-bg-layer-2: rgba(248, 245, 236, 0.9);
  --dsw-alias-bg-layer-3: rgba(240, 234, 216, 0.94);
  --dsw-alias-bg-overlay: rgba(31, 58, 45, 0.4);
  --dsw-alias-border-l1: rgba(201, 162, 74, 0.26);
  --dsw-alias-border-l2: rgba(201, 162, 74, 0.4);
  --dsw-alias-border-l2-darkmode-thin: rgba(201, 162, 74, 0.3);
  --dsw-alias-border-l3: rgba(31, 58, 45, 0.14);
  --dsw-alias-brand-primary: #22603f;
  --dsw-alias-brand-text: #22603f;
  --dsw-alias-button-elevated-fill: rgba(255, 252, 242, 0.8);
  --dsw-alias-button-floating-fill: rgba(248, 245, 236, 0.85);
  --dsw-alias-button-floating-hover: #ffffff;
  --dsw-alias-button-info-fill: #e3e8d6;
  --dsw-alias-button-info-hover: #d8dfc6;
  --dsw-alias-interactive-bg-active: rgba(201, 162, 74, 0.16);
  --dsw-alias-interactive-bg-hover: rgba(201, 162, 74, 0.1);
  --dsw-alias-interactive-bg-hover-solid: #f2ecda;
  --dsw-alias-label-primary: #1f3a2d;
  --dsw-alias-label-primary-bluish: #2f4f3e;
  --dsw-alias-label-secondary: #4c6353;
  --dsw-alias-label-tertiary: #6d7f6d;
  --dsw-alias-label-caption: #87977f;
  --dsw-alias-state-business-primary: #22603f;
  --dsw-alias-state-business-tertiary: rgba(34, 96, 63, 0.12);
  --dsw-alias-markdown-code-block: #eae6d2;
  --dsw-shadow-lv2: 0 8px 28px rgba(20, 40, 30, 0.16);
  --dsw-specific-input-major: rgba(248, 245, 236, 0.8);
  --dsw-specific-selector: rgba(248, 245, 236, 0.9);
  --dsw-specific-sidebar-fill: #23402f;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] {
  /* 松烟鎏金自有变量（暗）：同族降明度 + 暖金灯火 */
  --lpp-lacquer-1: #1d3528;
  --lpp-lacquer-2: #122419;
  --lpp-lacquer-3: #0b1710;
  --lpp-pine: #7da88a;
  --lpp-pine-deep: #8fbf9e;
  --lpp-pine-bright: #3d5c47;
  --lpp-porcelain: #22382c;
  --lpp-paper: #1a2b21;
  --lpp-paper-strong: rgba(26, 43, 33, 0.95);
  --lpp-gold: #cfa856;
  --lpp-gold-hi: #e8cf8e;
  --lpp-gold-deep: #a07c34;
  --lpp-gold-line: rgba(207, 168, 86, 0.5);
  --lpp-ink: #ede6cf;
  --lpp-ink-soft: #a9b8a6;
  --lpp-ivory: #ede6cf;
  --lpp-ivory-dim: #96ab97;
  --lpp-seal: #c0563c;
  --lpp-shadow: rgba(3, 10, 6, 0.4);
  --lpp-shadow-card: 0 12px 36px rgba(3, 10, 6, 0.4), 0 2px 8px rgba(3, 10, 6, 0.22);
  --lpp-settings-text: #ede6cf;
  --lpp-settings-muted: #a9b8a6;

  /* 宿主 token 全局重绑：暗 */
  --dsw-alias-bg-layer-1: rgba(26, 43, 33, 0.78);
  --dsw-alias-bg-layer-2: rgba(28, 45, 35, 0.92);
  --dsw-alias-bg-layer-3: rgba(20, 33, 26, 0.95);
  --dsw-alias-bg-overlay: rgba(4, 10, 7, 0.55);
  --dsw-alias-border-l1: rgba(207, 168, 86, 0.22);
  --dsw-alias-border-l2: rgba(207, 168, 86, 0.34);
  --dsw-alias-border-l2-darkmode-thin: rgba(207, 168, 86, 0.28);
  --dsw-alias-border-l3: rgba(237, 230, 207, 0.12);
  --dsw-alias-brand-primary: #8fbf9e;
  --dsw-alias-brand-text: #9cc9aa;
  --dsw-alias-button-elevated-fill: rgba(255, 248, 224, 0.08);
  --dsw-alias-button-floating-fill: rgba(26, 43, 33, 0.85);
  --dsw-alias-button-floating-hover: #2a4534;
  --dsw-alias-button-info-fill: #1f3a2a;
  --dsw-alias-button-info-hover: #274631;
  --dsw-alias-interactive-bg-active: rgba(207, 168, 86, 0.2);
  --dsw-alias-interactive-bg-hover: rgba(207, 168, 86, 0.12);
  --dsw-alias-interactive-bg-hover-solid: #223829;
  --dsw-alias-label-primary: #ede6cf;
  --dsw-alias-label-primary-bluish: #dae2d0;
  --dsw-alias-label-secondary: #c5d1c0;
  --dsw-alias-label-tertiary: #96ab97;
  --dsw-alias-label-caption: #7e937f;
  --dsw-alias-state-business-primary: #8fbf9e;
  --dsw-alias-state-business-tertiary: rgba(143, 191, 158, 0.14);
  --dsw-alias-markdown-code-block: #18291e;
  --dsw-specific-input-major: rgba(26, 43, 33, 0.85);
  --dsw-specific-selector: rgba(26, 43, 33, 0.9);
  --dsw-specific-sidebar-fill: #132419;
}

/* ============ 2. 基础：透明骨架、滚动条、selection、focus ============ */

/* 背景与人物留在 body 背景之上，宿主内容始终绘制在人物前方。 */
body[data-dsh-linpianpian] {
  isolation: isolate;
}

body[data-dsh-linpianpian] [id='root'],
body[data-dsh-linpianpian] body > [data-slot='root'],
body[data-dsh-linpianpian] [class*='frame'],
body[data-dsh-linpianpian] :is([data-slot='conversation'], [data-phase='hero']) {
  background: transparent !important;
}

body[data-dsh-linpianpian] [class*='frame'] {
  isolation: isolate;
}

/* 活跃对话：一层极薄的瓷雾压平背景，保住消息可读性 */
body[data-dsh-linpianpian] [data-phase='active'] {
  background: rgba(247, 243, 232, 0.5);
  backdrop-filter: blur(2px);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-phase='active'] {
  background: rgba(8, 18, 12, 0.52);
}

body[data-dsh-linpianpian] * {
  scrollbar-width: thin;
  scrollbar-color: var(--lpp-gold-line) transparent;
}

body[data-dsh-linpianpian] ::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

body[data-dsh-linpianpian] ::-webkit-scrollbar-track {
  background: transparent;
}

body[data-dsh-linpianpian] ::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 8px;
  background: var(--lpp-gold-line) padding-box;
}

body[data-dsh-linpianpian] ::-webkit-scrollbar-thumb:hover {
  background: var(--lpp-gold) padding-box;
}

body[data-dsh-linpianpian] ::selection {
  background: rgba(201, 162, 74, 0.32);
  color: inherit;
}

body[data-dsh-linpianpian] :focus-visible {
  outline: 1px solid var(--lpp-gold);
  outline-offset: 2px;
}

/* ============ 3. 背景舞台：昼夜双场景 ============ */

body[data-dsh-linpianpian] [data-lpp-background-stage] {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-lpp-background] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 680ms ease;
}

body[data-dsh-linpianpian] [data-lpp-background='night'] {
  opacity: 0;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-background='night'] {
  opacity: 1;
}

/* 水墨晕影：四缘轻轻压暗，把视线收进画面 */
body[data-dsh-linpianpian] [data-lpp-background-stage]::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(130% 96% at 50% 38%, transparent 62%, rgba(24, 46, 42, 0.08) 100%),
    linear-gradient(180deg, rgba(24, 46, 42, 0.05), transparent 18%);
  pointer-events: none;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-background-stage]::after {
  background:
    radial-gradient(130% 96% at 50% 38%, transparent 58%, rgba(3, 10, 6, 0.18) 100%),
    linear-gradient(180deg, rgba(3, 10, 6, 0.10), transparent 22%);
}

/* ============ 4. 整窗描金内框 ============ */

body[data-dsh-linpianpian] [data-skin-chrome='theme-frame'] {
  position: fixed;
  inset: 6px;
  z-index: 30;
  border: 1px solid var(--lpp-gold-line);
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(255, 248, 226, 0.14);
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-skin-chrome='theme-frame']::before,
body[data-dsh-linpianpian] [data-skin-chrome='theme-frame']::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid var(--lpp-gold);
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-skin-chrome='theme-frame']::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

body[data-dsh-linpianpian] [data-skin-chrome='theme-frame']::after {
  right: -2px;
  bottom: -2px;
  border-left: none;
  border-top: none;
}

/* ============ 5. 人物舞台：探身 + 捧花 ============ */

body[data-dsh-linpianpian] [data-linpianpian-stage] {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  contain: strict;
  transition: opacity 420ms ease, visibility 420ms;
}

body[data-dsh-linpianpian][data-lpp-settings-open] [data-linpianpian-stage] {
  opacity: 0;
  visibility: hidden;
}

body[data-dsh-linpianpian] [data-lpp-character] {
  position: absolute;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  transition:
    transform 620ms cubic-bezier(0.22, 0.78, 0.24, 1),
    opacity 620ms ease,
    filter 600ms ease;
  filter: drop-shadow(0 18px 26px rgba(20, 40, 30, 0.22));
}

/* 落地接触阴影：让人物站在地板上，而不是浮在画面里 */
body[data-dsh-linpianpian] [data-linpianpian-stage]::before,
body[data-dsh-linpianpian] [data-linpianpian-stage]::after {
  content: '';
  position: absolute;
  bottom: 4px;
  height: 42px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(18, 38, 34, 0.32), rgba(18, 38, 34, 0.1) 56%, transparent 72%);
  filter: blur(2px);
  pointer-events: none;
  transition: opacity 500ms ease;
}

body[data-dsh-linpianpian] [data-linpianpian-stage]::before {
  left: 26px;
  width: min(34%, 330px);
}

body[data-dsh-linpianpian] [data-linpianpian-stage]::after {
  right: 20px;
  width: min(38%, 390px);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-linpianpian-stage]::before,
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-linpianpian-stage]::after {
  background: radial-gradient(ellipse at center, rgba(2, 8, 7, 0.5), rgba(2, 8, 7, 0.18) 56%, transparent 72%);
}

body[data-dsh-linpianpian][data-lpp-chat-active] [data-linpianpian-stage]::before,
body[data-dsh-linpianpian][data-lpp-chat-active] [data-linpianpian-stage]::after {
  opacity: 0;
}

/* 左侧：扶侧栏缝线探身的林翩翩，侧栏即她的门框。
   新素材扶边线在 x=384 / 1024（37.5%）：按百分比探出，缩放时仍贴缝 */
body[data-dsh-linpianpian] [data-lpp-character='left'] {
  left: 0;
  height: min(88%, 1320px);
  transform: translateX(-37.5%);
  transform-origin: bottom left;
}

/* 右侧：桂下捧花立于书架前的林翩翩（半身，底缘锚定）。
   右偏 22%：抬手在素材左上方，多让出一段距离，避免被输入卡右缘挡住。
   transform-origin 必须与活跃态一致（bottom right），否则回程在缩小状态下
   换锚点会瞬移（去程 scale=1 换锚点不可见，回程 scale<1 换锚点立跳） */
body[data-dsh-linpianpian] [data-lpp-character='right'] {
  right: 0;
  height: min(62%, 920px);
  transform: translateX(22%);
  transform-origin: bottom right;
}

/* 活跃对话：缩小退到门后，偏移随缩放补偿（37.5%×0.85），手始终扶着缝线。
   transform-origin 保持 bottom left 与首页一致，回程不瞬移 */
body[data-dsh-linpianpian][data-lpp-chat-active] [data-lpp-character='left'] {
  transform: translateX(-31.875%) scale(0.85);
  transform-origin: bottom left;
  opacity: 0.92;
}

/* 活跃对话右侧：缩小后仍贴近对话区右缘，略向右缘收 */
body[data-dsh-linpianpian][data-lpp-chat-active] [data-lpp-character='right'] {
  transform: translateX(20%) scale(0.82);
  transform-origin: bottom right;
  opacity: 0.9;
}

/* 侧栏收成 rail：门框消失，左侧人物离场 */
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-lpp-character='left'] {
  transform: translateX(-130%);
  opacity: 0;
}

/* 夜色：人物降明度融入灯下 */
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-character] {
  filter:
    brightness(0.84)
    saturate(0.94)
    drop-shadow(0 18px 26px rgba(3, 10, 6, 0.4));
}

/* 拖拽视口与低机能：人物回到廉价渲染路径 */
body[data-dsh-linpianpian][data-lpp-viewport-resizing] [data-lpp-character] {
  transition: none;
  filter: none;
}

body[data-dsh-linpianpian][data-lpp-low-power] [data-lpp-character] {
  filter: none;
  transition: opacity 180ms ease;
}

/* ============ 6. 上下檐口饰条 ============ */

body[data-dsh-linpianpian] [data-skin-chrome='top-trim'],
body[data-dsh-linpianpian] [data-skin-chrome='bottom-trim'] {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 20;
  pointer-events: none;
  contain: paint;
  transition: transform 560ms cubic-bezier(0.4, 0, 0.2, 1);
}

body[data-dsh-linpianpian] [data-skin-chrome='top-trim'] {
  top: 0;
  height: 56px;
  background: var(--lpp-art-trim-top) left top / auto 56px repeat-x;
  box-shadow: 0 6px 18px rgba(20, 40, 30, 0.22);
}

/* 梁中央：鎏金缠枝桂白玉章（以内容区中轴为准：扣除侧栏与工作台宽度） */
body[data-dsh-linpianpian] [data-skin-chrome='top-trim']::after {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  width: 42px;
  height: 42px;
  transform: translateX(-50%);
  background: var(--lpp-art-crest) center / contain no-repeat;
  filter: drop-shadow(0 2px 5px rgba(8, 18, 12, 0.45));
}

body[data-dsh-linpianpian] [data-skin-chrome='bottom-trim'] {
  bottom: 0;
  z-index: 19;
  height: 36px;
  background: var(--lpp-art-trim-bottom) left bottom / auto 36px repeat-x;
  box-shadow: 0 -6px 18px rgba(20, 40, 30, 0.18);
}

/* 首页在场；活跃对话与设置打开时，檐口收起飞出画面 */
body[data-dsh-linpianpian][data-lpp-chat-active] [data-skin-chrome='top-trim'],
body[data-dsh-linpianpian][data-lpp-settings-open] [data-skin-chrome='top-trim'] {
  transform: translateY(-102%);
}

body[data-dsh-linpianpian][data-lpp-chat-active] [data-skin-chrome='bottom-trim'],
body[data-dsh-linpianpian][data-lpp-settings-open] [data-skin-chrome='bottom-trim'] {
  transform: translateY(102%);
}

body[data-dsh-linpianpian][data-lpp-composer-motion] [data-skin-chrome='top-trim'],
body[data-dsh-linpianpian][data-lpp-composer-motion] [data-skin-chrome='bottom-trim'] {
  will-change: transform;
}

/* ============ 7. 侧栏金丝线框与吉祥物 ============ */

body[data-dsh-linpianpian] [data-skin-chrome='sidebar-frame'] {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 4;
  width: var(--lpp-sidebar-width, 0px);
  height: 100vh;
  pointer-events: none;
  background:
    linear-gradient(90deg, var(--lpp-gold-hi), var(--lpp-gold), var(--lpp-gold-hi))
      left 9px top 9px / calc(100% - 18px) 1.2px no-repeat,
    linear-gradient(90deg, var(--lpp-gold-hi), var(--lpp-gold), var(--lpp-gold-hi))
      left 9px bottom 9px / calc(100% - 18px) 1.2px no-repeat,
    linear-gradient(180deg, var(--lpp-gold-hi), var(--lpp-gold), var(--lpp-gold-hi))
      left 9px top 9px / 1.2px calc(100% - 18px) no-repeat,
    linear-gradient(180deg, var(--lpp-gold-hi), var(--lpp-gold), var(--lpp-gold-hi))
      right 9px top 9px / 1.2px calc(100% - 18px) no-repeat;
}

/* rail 态：门框既无，线框与吉祥物一同离场 */
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-skin-chrome='sidebar-frame'],
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-skin-chrome='sidebar-mascot'] {
  display: none;
}

body[data-dsh-linpianpian] [data-skin-chrome='sidebar-mascot'] {
  position: absolute;
  bottom: var(--lpp-mascot-bottom, 62px);
  left: 50%;
  z-index: 0;
  width: var(--lpp-mascot-width, 0px);
  transform: translateX(-50%);
  background: none;
  pointer-events: none;
  transition: opacity 420ms ease;
}

body[data-dsh-linpianpian] [data-lpp-mascot] {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0.6;
  filter: drop-shadow(0 8px 14px rgba(8, 18, 12, 0.35));
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-mascot] {
  filter: brightness(0.88) drop-shadow(0 8px 14px rgba(3, 10, 6, 0.5));
}

body[data-dsh-linpianpian][data-lpp-settings-open] [data-skin-chrome='sidebar-mascot'] {
  opacity: 0;
}

/* ============ 8. 侧栏：黛青漆面瓷器 ============ */

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) {
  --dsw-alias-label-primary: var(--lpp-ivory);
  --dsw-alias-label-secondary: #d5decb;
  --dsw-alias-label-tertiary: var(--lpp-ivory-dim);
  --dsw-alias-label-caption: #94a894;
  --dsw-alias-border-l1: rgba(228, 203, 144, 0.2);
  --dsw-alias-border-l2: rgba(228, 203, 144, 0.32);
  --dsw-alias-button-elevated-fill: rgba(255, 252, 240, 0.12);
  --dsw-alias-button-floating-hover: rgba(255, 252, 240, 0.16);
  --dsw-alias-interactive-bg-hover: rgba(255, 252, 240, 0.08);
  --dsw-alias-interactive-bg-active: rgba(228, 203, 144, 0.26);
  position: relative;
  z-index: 3;
  color: var(--lpp-ivory) !important;
  border-right: 0;
  background: linear-gradient(180deg, var(--lpp-lacquer-1), var(--lpp-lacquer-2));
  box-shadow:
    8px 0 34px rgba(14, 32, 22, 0.22),
    inset -1px 0 rgba(228, 203, 144, 0.75),
    inset -3px 0 rgba(201, 162, 74, 0.65);
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  > div:not([data-skin-chrome='sidebar-mascot']) {
  background:
    radial-gradient(120% 30% at 50% 0%, rgba(168, 200, 178, 0.13), transparent 58%),
    var(--lpp-art-brocade) left top / 96px repeat,
    var(--lpp-paper-texture);
  background-blend-mode: normal, normal, soft-light;
}

/* 内容层压在吉祥物之上：吉祥物自身不参与抬层，也不接底纹 */
body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  > :not([data-skin-chrome='sidebar-mascot']) {
  position: relative;
  z-index: 1;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  > :not(div):not([data-skin-chrome='sidebar-mascot']) {
  background: transparent;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is([data-slot='sidebar'], [data-slot='sidebar'] > div) {
  color: var(--lpp-ivory) !important;
  background: transparent;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) * {
  color: inherit !important;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) input {
  color: #fbf6e2 !important;
  caret-color: var(--lpp-gold-hi);
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) input::placeholder {
  color: rgba(238, 240, 224, 0.52);
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='fade'] {
  background: linear-gradient(180deg, transparent, var(--lpp-lacquer-2)) !important;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='sectionHeader'] {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  color: var(--lpp-gold-hi) !important;
  letter-spacing: 0.14em;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='sectionLabel'] {
  color: var(--lpp-ivory-dim) !important;
  letter-spacing: 0.1em;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='sectionLabel']::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  vertical-align: 1px;
  background: linear-gradient(135deg, var(--lpp-gold-hi), var(--lpp-gold-deep));
  transform: rotate(45deg);
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button, a, [role='button'], [role='treeitem']) {
  color: var(--lpp-ivory);
  border-radius: 6px;
  transition: background-color 140ms ease, box-shadow 140ms ease;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button, a, [role='button'], [role='treeitem']):hover {
  background: linear-gradient(90deg, rgba(228, 203, 144, 0.16), rgba(228, 203, 144, 0.05));
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is([aria-current='page'], [aria-selected='true']) {
  background: linear-gradient(90deg, rgba(228, 203, 144, 0.18), rgba(228, 203, 144, 0.04));
  box-shadow: inset 2px 0 var(--lpp-gold-hi);
}

/* 新会话：装饰仅命中按钮本体；悬停只提亮底色，不给内部 label 再套一块匾。 */
body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button, [role='button']):is([class*='newSession'], [class*='newChat']) {
  --lpp-new-session-hover: transparent;
  box-sizing: border-box;
  min-height: 48px;
  margin-block: 4px 10px;
  overflow: visible;
  color: var(--lpp-ink) !important;
  border: 1px solid var(--lpp-gold);
  border-radius: 8px;
  background:
    var(--lpp-art-corner-tl) left 1px top 1px / 40px auto no-repeat,
    var(--lpp-art-corner-tr) right 1px top 1px / 40px auto no-repeat,
    var(--lpp-art-corner-bl) left 1px bottom 1px / 40px auto no-repeat,
    var(--lpp-art-corner-br) right 1px bottom 1px / 40px auto no-repeat,
    linear-gradient(var(--lpp-new-session-hover), var(--lpp-new-session-hover)),
    linear-gradient(180deg, #fcf9ef, var(--lpp-porcelain) 55%, #efe7d0);
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.65),
    0 4px 12px rgba(8, 18, 12, 0.28);
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button, [role='button']):is([class*='newSession'], [class*='newChat']) * {
  color: var(--lpp-ink) !important;
  font-family: inherit;
  letter-spacing: inherit;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button, [role='button']):is([class*='newSession'], [class*='newChat']):hover {
  --lpp-new-session-hover: rgba(255, 252, 240, 0.08);
}

/* 设置触发：幽灵描金匾 + 四角缠枝桂（其子元素独立着色，防设置页规则回流） */
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > :is(button, [role='button']) {
  box-sizing: border-box;
  min-height: 44px;
  color: var(--lpp-ivory) !important;
  border: 1px solid rgba(228, 203, 144, 0.45);
  border-radius: 8px;
  background:
    var(--lpp-art-corner-tl) left 1px top 1px / 30px auto no-repeat,
    var(--lpp-art-corner-tr) right 1px top 1px / 30px auto no-repeat,
    var(--lpp-art-corner-bl) left 1px bottom 1px / 30px auto no-repeat,
    var(--lpp-art-corner-br) right 1px bottom 1px / 30px auto no-repeat,
    linear-gradient(180deg, rgba(14, 26, 18, 0.34), rgba(8, 18, 12, 0.18));
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  letter-spacing: 0.1em;
  transition: background-color 140ms ease, box-shadow 140ms ease;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > :is(button, [role='button']) * {
  color: inherit !important;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > :is(button, [role='button']):hover {
  background: rgba(228, 203, 144, 0.14);
  box-shadow: inset 0 0 0 1px rgba(228, 203, 144, 0.3);
}

body[data-dsh-linpianpian] [data-slot='sidebar.footer.action'],
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] {
  color: var(--lpp-ivory);
}

/* 搜索胶囊 */
body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='search']:has(input) {
  border: 1px solid rgba(228, 203, 144, 0.32);
  border-radius: 999px;
  background: rgba(8, 18, 12, 0.2);
  transition: box-shadow 150ms ease, border-color 150ms ease;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='search']:has(input):focus-within {
  border-color: var(--lpp-gold-hi);
  box-shadow: 0 0 0 3px rgba(228, 203, 144, 0.18);
}

/* 品牌行：金缝分隔；HARNESS 徽章字母走 inverted token，改深黛配月白底 */
body[data-dsh-linpianpian] [class*='logoRow'] {
  --dsw-alias-label-primary-inverted: #1f3a2d;
  border-bottom: 1px solid rgba(228, 203, 144, 0.22);
}

body[data-dsh-linpianpian] [class*='logoRow'] [class*='brand'] {
  border-radius: 8px;
  transition: background-color 150ms ease;
}

body[data-dsh-linpianpian] [class*='logoRow'] [class*='brand']:hover {
  background: rgba(228, 203, 144, 0.12);
}

body[data-dsh-linpianpian] [class*='logoRow'] [class*='brand'] svg {
  filter: drop-shadow(0 1px 2px rgba(8, 18, 12, 0.5));
}

body[data-dsh-linpianpian] [class*='logoRow'] button:not([class*='brand']) {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(228, 203, 144, 0.35);
  border-radius: 50%;
  background: rgba(8, 18, 12, 0.18);
}

body[data-dsh-linpianpian] [class*='logoRow'] button:not([class*='brand']):hover {
  background: rgba(228, 203, 144, 0.16);
}

/* ============ 9. 工作区树：金线连接与描金匾牌 ============ */

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='projectRow'] {
  border-radius: 6px;
}

body[data-dsh-linpianpian] [class*='projectRow'] [class*='folder'] {
  color: var(--lpp-gold-hi) !important;
  filter: drop-shadow(0 1px 1px rgba(8, 18, 12, 0.4));
}

/* 金桂团花仅替换工作区行的文件夹；保留宿主 hover 展开箭头及行事件。
   两个互换的 slot 同宽，避免 hover 时标题横跳。 */
body[data-dsh-linpianpian] [data-lpp-workspace-row] > :is([class*='folder'], [class*='chevron']) {
  width: 28.8px;
  height: 28.8px;
  flex: 0 0 28.8px;
}

body[data-dsh-linpianpian] [data-lpp-workspace-row] > [class*='folder'] {
  background: var(--lpp-art-workspace-osmanthus) center / contain no-repeat;
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-lpp-workspace-row] > [class*='folder'] > svg {
  visibility: hidden;
}

body[data-dsh-linpianpian] [class*='projectRow'] [class*='title'],
body[data-dsh-linpianpian] [class*='projectRow'] [class*='projectText'] {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  font-size: 15px;
  letter-spacing: 0.04em;
}

body[data-dsh-linpianpian] [class*='projectRow'] [class*='meta'] {
  color: var(--lpp-ivory-dim) !important;
}

body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [role='treeitem'] {
  position: relative;
}

/* 会话行金线：竖虚线 + 横向搭接线 */
body[data-dsh-linpianpian] [data-lpp-session-row]::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 8px;
  z-index: 1;
  width: 10px;
  background:
    repeating-linear-gradient(to right, rgba(228, 203, 144, 0.7) 0 3px, transparent 3px 5px)
      0 50% / 100% 1px no-repeat,
    repeating-linear-gradient(to bottom, rgba(228, 203, 144, 0.72) 0 3px, transparent 3px 7px)
      0 0 / 1px 100% no-repeat;
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-lpp-session-last]::before {
  background:
    repeating-linear-gradient(to right, rgba(228, 203, 144, 0.7) 0 3px, transparent 3px 5px)
      0 50% / 100% 1px no-repeat,
    repeating-linear-gradient(to bottom, rgba(228, 203, 144, 0.72) 0 3px, transparent 3px 7px)
      0 0 / 1px 50% no-repeat;
}

body[data-dsh-linpianpian] [data-lpp-session-row]:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 28px;
  height: 1px;
  background: rgba(168, 200, 178, 0.16);
  pointer-events: none;
}

/* 会话时间戳：描金小字 */
body[data-dsh-linpianpian] [data-lpp-session-row] [class*='time'],
body[data-dsh-linpianpian] [data-lpp-session-flat] [class*='time'] {
  color: rgba(228, 203, 144, 0.85) !important;
  letter-spacing: 0.02em;
}

/* Workspace selection artwork is defined in sidebar-skin.ts. */
body[data-dsh-linpianpian] [data-lpp-workspace-active]::before,
body[data-dsh-linpianpian] [data-lpp-workspace-active]::after {
  content: '';
  position: absolute;
  pointer-events: none;
}
body[data-dsh-linpianpian] [data-lpp-workspace-active]::before {
  z-index: 0;
  animation: lppWorkspaceRibbonEnter 420ms cubic-bezier(.2,.74,.22,1) both;
}

body[data-dsh-linpianpian] [data-lpp-workspace-active] > [class*='folder'],
body[data-dsh-linpianpian] [data-lpp-workspace-active] [class*='projectText'] {
  animation: lppWorkspaceRibbonContentEnter 260ms 90ms cubic-bezier(0.2, 0.74, 0.22, 1) both;
}

@keyframes lppWorkspaceRibbonEnter {
  0% {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
    transform: translateX(-8px);
  }
  60% { opacity: 1; }
  70% {
    clip-path: inset(0 12% 0 0);
    transform: translateX(0);
  }
  92% {
    clip-path: inset(0);
    transform: translateX(2px);
  }
  100% {
    opacity: 1;
    clip-path: inset(0);
    transform: translateX(0);
  }
}

@keyframes lppWorkspaceRibbonContentEnter {
  from {
    opacity: 0.32;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* rail 态：五个控件统一为描金圆钮 */
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail']
  :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is([class*='iconButton'], [class*='searchButton']):not([role='dialog'] *) {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(228, 203, 144, 0.4);
  border-radius: 50%;
  background: rgba(8, 18, 12, 0.2);
}

body[data-dsh-linpianpian][data-lpp-sidebar-size='rail']
  :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button, [role='button']):is([class*='newSession'], [class*='newChat']) {
  width: 38px;
  height: 38px;
  min-height: 38px;
  padding: 0;
  border: 1px solid var(--lpp-gold);
  border-radius: 50%;
  background:
    linear-gradient(var(--lpp-new-session-hover), var(--lpp-new-session-hover)),
    radial-gradient(circle at 35% 30%, var(--lpp-porcelain), var(--lpp-pine-bright));
  font-size: 0;
}

body[data-dsh-linpianpian][data-lpp-sidebar-size='rail']
  :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button, [role='button']):is([class*='newSession'], [class*='newChat']) svg {
  font-size: 18px;
}

body[data-dsh-linpianpian][data-lpp-sidebar-size='rail']
  [data-slot='sidebar.settings'] > :is(button, [role='button']) {
  width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  border-radius: 50%;
  font-size: 0;
}

body[data-dsh-linpianpian][data-lpp-sidebar-size='rail']
  [data-slot='sidebar.settings'] > :is(button, [role='button']) svg {
  font-size: 16px;
}

/* ============ 10. hero 首页：松烟晨光中的序 ============ */

body[data-dsh-linpianpian] [data-phase='hero'] {
  --dsh-chat-content-width: clamp(520px, 40vw, 660px);
  --dsh-composer-card-max-width: calc(var(--dsh-chat-content-width) + 32px);
}

body[data-dsh-linpianpian] [data-phase='hero'] [class*='headline'] {
  align-items: center;
}

body[data-dsh-linpianpian] [data-phase='hero'] [class*='headlineText'] {
  position: relative;
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  font-size: 46px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--lpp-ink);
  white-space: nowrap;
  text-shadow:
    0 1px 0 rgba(255, 255, 250, 0.65),
    0 6px 28px rgba(255, 255, 250, 0.55);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-phase='hero'] [class*='headlineText'] {
  color: var(--lpp-ivory);
  -webkit-text-stroke: 0.35px rgba(237, 230, 207, 0.4);
  text-shadow:
    0 2px 10px rgba(3, 10, 6, 0.65),
    0 0 34px rgba(228, 203, 144, 0.22);
}

/* 标题上规线：描金横线 + 两端珠点 + 中央菱花 */
body[data-dsh-linpianpian] [data-phase='hero'] [class*='headlineText']::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -30px;
  width: 320px;
  height: 7px;
  transform: translateX(-50%);
  background:
    radial-gradient(circle 3px at 6px 50%, var(--lpp-gold-hi) 97%, transparent),
    radial-gradient(circle 3px at calc(100% - 6px) 50%, var(--lpp-gold-hi) 97%, transparent),
    linear-gradient(90deg, transparent, var(--lpp-gold-line) 18%, var(--lpp-gold-line) 82%, transparent)
      0 50% / 100% 1px no-repeat;
}

/* 标题下规线：双线 + 中央菱花 */
body[data-dsh-linpianpian] [data-phase='hero'] [class*='headlineText']::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -30px;
  width: 260px;
  height: 12px;
  transform: translateX(-50%);
  background:
    linear-gradient(45deg, transparent 44%, var(--lpp-gold) 46% 54%, transparent 56%)
      50% 50% / 11px 11px no-repeat,
    linear-gradient(90deg, transparent, var(--lpp-gold-line) 22%, var(--lpp-gold-line) 78%, transparent)
      0 4px / 100% 1px no-repeat,
    linear-gradient(90deg, transparent, var(--lpp-gold-line) 30%, var(--lpp-gold-line) 70%, transparent)
      0 8px / 100% 1px no-repeat;
}

/* 官方徽标：松烟双圈描金章（只能装饰 hitbox 容器，svg 保持定尺） */
body[data-dsh-linpianpian] [class*='headline'] [class*='fishHitbox'] {
  width: 40px;
  height: 40px;
  margin-left: -6px;
  border: 2px solid var(--lpp-gold);
  border-radius: 50%;
  outline: 1px solid var(--lpp-gold-line);
  outline-offset: 3px;
  background: radial-gradient(circle at 34% 28%, #fdfefa, var(--lpp-pine-bright) 58%, var(--lpp-pine));
  box-shadow:
    0 4px 14px rgba(20, 40, 30, 0.28),
    0 0 0 7px rgba(228, 203, 144, 0.12);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [class*='headline'] [class*='fishHitbox'] {
  background: radial-gradient(circle at 34% 28%, #33584a, #1e3a2a 62%, #132419);
}

body[data-dsh-linpianpian] [class*='headline'] [class*='fishHitbox'] svg {
  width: 22px;
  height: 22px;
}

/* 预览徽标：朱砂印章 */
body[data-dsh-linpianpian] [data-phase='hero'] [class*='previewBadge'] {
  border: 1px solid rgba(246, 240, 220, 0.5);
  border-radius: 4px;
  background: linear-gradient(160deg, #b64c34, var(--lpp-seal) 70%);
  color: #f8ecd8 !important;
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  letter-spacing: 0.2em;
  box-shadow: 0 2px 8px rgba(120, 42, 24, 0.35);
}

body[data-dsh-linpianpian] [data-phase='hero'] [class*='heroWorkspaceRow'] {
  flex-wrap: wrap;
  min-width: 0;
  max-width: 100%;
}

/* Extension slots are display:contents; constrain the actual flex wrapper
   so a long agent-preset label cannot escape the narrow composer column. */
body[data-dsh-linpianpian] [data-slot='conversation.hero.agentPreset'] > * {
  min-width: 0;
  max-width: 100%;
}

body[data-dsh-linpianpian] [data-phase='hero'] [class*='heroWorkspaceRow'] :is(button, [role='button']) {
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
  border: 1px solid var(--lpp-gold-line);
  border-radius: 10px;
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(6px);
  color: var(--lpp-ink);
  box-shadow: 0 4px 14px rgba(20, 40, 30, 0.12);
  transition: transform 150ms ease, box-shadow 150ms ease;
}

body[data-dsh-linpianpian] [data-phase='hero'] [class*='heroWorkspaceRow'] :is(button, [role='button']):hover {
  transform: translateY(-1px);
  box-shadow: var(--lpp-shadow-card);
}

/* 工作区/模式 chips 留在宿主流中，弹出菜单位于框饰上方。 */
body[data-dsh-linpianpian] [data-phase='hero'] :is(button[class*='workspace'], button[class*='seat'], [class*='modes'] button) {
  position: relative;
  z-index: 6;
}

body[data-dsh-linpianpian] button[class*='workspace'][aria-expanded],
body[data-dsh-linpianpian] button[class*='workspace']:hover,
body[data-dsh-linpianpian] button[class*='seat'][aria-expanded],
body[data-dsh-linpianpian] button[class*='seat']:hover {
  background: var(--lpp-paper);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] button[class*='workspace'][aria-expanded],
body[data-dsh-linpianpian][data-lpp-dark-theme] button[class*='workspace']:hover,
body[data-dsh-linpianpian][data-lpp-dark-theme] button[class*='seat'][aria-expanded],
body[data-dsh-linpianpian][data-lpp-dark-theme] button[class*='seat']:hover {
  background: rgba(28, 45, 35, 0.9);
}

/* ============ 11. 输入卡：薄绢面刺绣框 + 独立桂花白玉章 ============ */

body[data-dsh-linpianpian] [data-composer-seat] {
  z-index: 5;
}

/* The native card's immediate sizing wrapper also contains the stats dock.
   Query it instead of the viewport; keep the card free of containment so
   fixed attachment drag masks retain their viewport coordinate system. */
body[data-dsh-linpianpian] :has(> [data-composer-card]) {
  container: lpp-composer / inline-size;
}

body[data-dsh-linpianpian] [data-composer-card] {
  position: relative;
  isolation: isolate;
  overflow: visible;
  min-height: 0;
  padding-top: 36px;
  border: 0;
  border-radius: 10px;
  --lpp-composer-surface:
    linear-gradient(180deg, rgba(251, 248, 238, 0.9), rgba(243, 238, 224, 0.84)),
    var(--dsw-specific-input-major);
  background: var(--lpp-composer-surface);
  box-shadow: var(--lpp-shadow-card);
}

/* Retire the nine-slice frame: its silk folds stretched with the middle. */
body[data-dsh-linpianpian] [data-composer-card]::before {
  content: none;
}

/* maid-atelier-style clipped rails (MIT, Small-tailqwq): fixed corner art,
   two opposing, fixed-density periodic strips per edge, independent jade.
   Resizing changes only the clip windows. No percentage background sizes,
   border-image stretch/round, or element scale may resize these textures. */
body[data-dsh-linpianpian] [data-composer-card] > [data-skin-chrome='composer-rails'] {
  --lpp-rail-side: 36.4px;
  --lpp-rail-top: 28px;
  --lpp-rail-bottom: 19.6px;
  position: absolute;
  box-sizing: border-box;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  border-radius: inherit;
  background-image: var(--lpp-art-composer-corner-tl), var(--lpp-art-composer-corner-tr),
    var(--lpp-art-composer-corner-bl), var(--lpp-art-composer-corner-br);
  background-size: var(--lpp-rail-side) var(--lpp-rail-top), var(--lpp-rail-side) var(--lpp-rail-top),
    var(--lpp-rail-side) var(--lpp-rail-bottom), var(--lpp-rail-side) var(--lpp-rail-bottom);
  background-position: left top, right top, left bottom, right bottom;
  background-repeat: no-repeat;
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-lpp-composer-rail] {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-lpp-composer-rail]::before,
body[data-dsh-linpianpian] [data-lpp-composer-rail]::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-lpp-composer-rail='top'],
body[data-dsh-linpianpian] [data-lpp-composer-rail='bottom'] {
  left: var(--lpp-rail-side);
  right: var(--lpp-rail-side);
}
body[data-dsh-linpianpian] [data-lpp-composer-rail='top'] {
  top: 0;
  height: var(--lpp-rail-top);
  --lpp-rail-height: var(--lpp-rail-top);
  --lpp-rail-start: var(--lpp-art-composer-top-start);
  --lpp-rail-end: var(--lpp-art-composer-top-end);
}
body[data-dsh-linpianpian] [data-lpp-composer-rail='bottom'] {
  bottom: 0;
  height: var(--lpp-rail-bottom);
  --lpp-rail-height: var(--lpp-rail-bottom);
  --lpp-rail-start: var(--lpp-art-composer-bottom-start);
  --lpp-rail-end: var(--lpp-art-composer-bottom-end);
}
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='top'], [data-lpp-composer-rail='bottom'])::before,
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='top'], [data-lpp-composer-rail='bottom'])::after {
  top: 0;
  bottom: 0;
  width: calc(50% + 4px);
  background-size: auto var(--lpp-rail-height);
  background-repeat: repeat-x;
}
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='top'], [data-lpp-composer-rail='bottom'])::before {
  left: 0;
  background-image: var(--lpp-rail-start);
  background-position: left top;
}
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='top'], [data-lpp-composer-rail='bottom'])::after {
  right: 0;
  background-image: var(--lpp-rail-end);
  background-position: right top;
  /* Fixed overlap blends unmatched phases; the top join also sits under jade. */
  mask-image: linear-gradient(to right, transparent, #000 8px);
}

body[data-dsh-linpianpian] [data-lpp-composer-rail='left'],
body[data-dsh-linpianpian] [data-lpp-composer-rail='right'] {
  top: var(--lpp-rail-top);
  bottom: var(--lpp-rail-bottom);
  width: var(--lpp-rail-side);
}
body[data-dsh-linpianpian] [data-lpp-composer-rail='left'] {
  left: 0;
  --lpp-rail-start: var(--lpp-art-composer-left-start);
  --lpp-rail-end: var(--lpp-art-composer-left-end);
}
body[data-dsh-linpianpian] [data-lpp-composer-rail='right'] {
  right: 0;
  --lpp-rail-start: var(--lpp-art-composer-right-start);
  --lpp-rail-end: var(--lpp-art-composer-right-end);
}
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='left'], [data-lpp-composer-rail='right'])::before,
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='left'], [data-lpp-composer-rail='right'])::after {
  left: 0;
  right: 0;
  height: calc(50% + 4px);
  background-size: var(--lpp-rail-side) auto;
  background-repeat: repeat-y;
}
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='left'], [data-lpp-composer-rail='right'])::before {
  top: 0;
  background-image: var(--lpp-rail-start);
  background-position: left top;
}
body[data-dsh-linpianpian] :is([data-lpp-composer-rail='left'], [data-lpp-composer-rail='right'])::after {
  bottom: 0;
  background-image: var(--lpp-rail-end);
  background-position: left bottom;
  mask-image: linear-gradient(to bottom, transparent, #000 8px);
}

body[data-dsh-linpianpian] [data-skin-chrome='composer-rails'] * {
  pointer-events: none;
}

/* The jade is above the silk, not baked into a stretching border slice.
   Never filter the card: fixed attachment masks and menus keep their layout. */
body[data-dsh-linpianpian] [data-composer-card]::after {
  content: '';
  position: absolute;
  inset: 2px 0 auto;
  height: 28px;
  z-index: 1;
  background: var(--lpp-art-composer-emblem) center / auto 100% no-repeat;
  -webkit-mask: none;
  mask: none;
  pointer-events: none;
}

/* 灯下夜读：仅饰件轻降明度，输入内容不参与滤镜 */
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-skin-chrome='composer-rails'],
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-composer-card]::after {
  filter: brightness(0.88) saturate(0.94);
}

body[data-dsh-linpianpian] [data-composer-card] > * {
  position: relative;
  z-index: 2;
}

body[data-dsh-linpianpian] [data-composer-card]
  > [data-slot='conversation.input.attachments'] > :not([class*='mask']) {
  position: relative;
  z-index: 2;
}

body[data-dsh-linpianpian] [data-composer-card]:focus-within {
  box-shadow:
    0 0 0 3px rgba(228, 203, 144, 0.2),
    var(--lpp-shadow-card);
}

body[data-dsh-linpianpian] [data-phase='hero'] [data-composer-card] {
  --lpp-composer-surface:
    linear-gradient(180deg, rgba(253, 250, 242, 0.94), rgba(245, 240, 226, 0.88)),
    var(--dsw-specific-input-major);
}

/* Keep the native Lexical/mirror auto-grow contract (maid-atelier). */
body[data-dsh-linpianpian] [data-composer-card] [data-composer-input] {
  min-height: 0;
}

body[data-dsh-linpianpian] [data-phase='hero'] [data-composer-card] [data-composer-input] {
  min-height: 72px;
}

@container lpp-composer (max-width: 420px) {
  body[data-dsh-linpianpian] [data-composer-card] {
    padding-top: 32px;
  }
  body[data-dsh-linpianpian] [data-composer-card] > [data-skin-chrome='composer-rails'] {
    /* Same corner proportions, uniform 0.12 scale. */
    --lpp-rail-side: 31.2px;
    --lpp-rail-top: 24px;
    --lpp-rail-bottom: 16.8px;
  }
  body[data-dsh-linpianpian] [data-composer-card]::after {
    height: 24px;
  }
  body[data-dsh-linpianpian] [data-phase='hero'] [data-composer-card] [data-composer-input] {
    min-height: 52px;
  }
}

body[data-dsh-linpianpian] [data-composer-card] :is(textarea, [data-composer-input]) {
  color: var(--lpp-ink);
  caret-color: var(--lpp-gold);
  font-size: 15px;
  line-height: 1.65;
}

/* 灯下夜读：卡面换松烟瓷釉（trailing 象牙字与浅色光标本就按深卡设计） */
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-composer-card] {
  --lpp-composer-surface:
    linear-gradient(180deg, rgba(34, 58, 42, 0.94), rgba(20, 38, 27, 0.9)),
    var(--dsw-specific-input-major);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-composer-card] :is(textarea, [data-composer-input]) {
  color: var(--lpp-ivory);
  caret-color: #dcebd8;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-composer-card] textarea::placeholder,
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-composer-card] [data-composer-placeholder] {
  color: var(--lpp-ivory-dim);
  opacity: 0.9;
}

body[data-dsh-linpianpian] [data-composer-card] textarea::placeholder,
body[data-dsh-linpianpian] [data-composer-card] [data-composer-placeholder] {
  color: var(--lpp-ink-soft);
  opacity: 0.7;
}

body[data-dsh-linpianpian] [data-composer-card] :is(button, [role='button']) {
  color: inherit;
}

body[data-dsh-linpianpian] [data-composer-card] button:hover:not(:disabled) {
  background: rgba(201, 162, 74, 0.12);
}

/* 发送：松烟圆章描金 */
body[data-dsh-linpianpian] [data-composer-card] button[class*='primary'] {
  border: 1px solid var(--lpp-gold);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #3a8560, var(--lpp-pine-deep) 68%);
  color: #f6f3e4 !important;
  box-shadow: 0 3px 10px rgba(20, 40, 30, 0.3);
}

body[data-dsh-linpianpian] [data-composer-card] button[class*='primary']:hover:not(:disabled) {
  background: radial-gradient(circle at 35% 30%, #459468, #2a7248 70%);
}

body[data-dsh-linpianpian] [data-composer-card] button[class*='primary']:disabled {
  opacity: 0.55;
}

body[data-dsh-linpianpian] [data-phase='hero'] [data-composer-card] button[class*='add'] {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--lpp-gold);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fdfefa, var(--lpp-pine-bright));
  color: var(--lpp-ink) !important;
  box-shadow: 0 3px 9px rgba(20, 40, 30, 0.2);
}

body[data-dsh-linpianpian] [data-phase='hero'] [data-composer-card] [class*='modes'] button[class*='trigger'] {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 999px;
  background: rgba(255, 253, 246, 0.6);
  color: var(--lpp-ink) !important;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-phase='hero'] [data-composer-card] [class*='modes'] button[class*='trigger'] {
  background: rgba(28, 45, 35, 0.6);
  color: var(--lpp-ivory) !important;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-composer-card] [class*='trailing'] :is(span, div, button) {
  color: var(--lpp-ivory);
}

/* 只装饰触发按钮本身；下拉面板是 div，绝不能吃到圆角（会变巨椭圆裁内容） */
body[data-dsh-linpianpian] [data-composer-card] [class*='trailing'] :is(button, [role='button'])[class*='model'],
body[data-dsh-linpianpian] [data-composer-card] [class*='trailing'] :is(button, [role='button'])[class*='selector'] {
  border: 1px solid transparent;
  border-radius: 8px;
  transition: border-color 140ms ease, background-color 140ms ease;
}

body[data-dsh-linpianpian] [data-composer-card] [class*='trailing'] :is(button, [role='button'])[class*='model']:hover,
body[data-dsh-linpianpian] [data-composer-card] [class*='trailing'] :is(button, [role='button'])[class*='selector']:hover {
  border-color: var(--lpp-gold-line);
  background: rgba(201, 162, 74, 0.1);
}

/* 相位切换：dock / rise 一次性滑动编排 */
body[data-dsh-linpianpian][data-lpp-composer-motion='dock'] [data-phase='active'] [data-composer-card] {
  animation: lppComposerDock 520ms cubic-bezier(0.22, 0.78, 0.2, 1) both;
}

body[data-dsh-linpianpian][data-lpp-composer-motion='rise'] [data-phase='hero'] [data-composer-card] {
  animation: lppComposerRise 520ms cubic-bezier(0.22, 0.78, 0.2, 1) both;
}

body[data-dsh-linpianpian][data-lpp-composer-motion] [data-composer-card] {
  will-change: transform, opacity;
}

@keyframes lppComposerDock {
  from {
    opacity: 0.94;
    transform: translateY(clamp(-240px, -26vh, -150px));
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes lppComposerRise {
  from {
    opacity: 0.94;
    transform: translateY(clamp(150px, 26vh, 240px));
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ============ 12. 会话区与消息流 ============ */

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']),
body[data-dsh-linpianpian] [class*='ConversationRoot'] {
  background: transparent;
  z-index: 1;
}

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header[class*='header'] {
  background: rgba(248, 245, 236, 0.68);
  backdrop-filter: blur(10px) saturate(0.95);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] :is([data-pane='conversation'], [class*='centerCol']) header[class*='header'] {
  background: rgba(24, 40, 36, 0.72);
}

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header[class*='header']::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--lpp-gold-line) 20%, var(--lpp-gold-line) 80%, transparent);
  pointer-events: none;
}

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header[class*='header'] * {
  color: inherit !important;
}

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header[class*='header'] [class*='title'] {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  letter-spacing: 0.06em;
  color: var(--lpp-ink);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] :is([data-pane='conversation'], [class*='centerCol']) header[class*='header'] [class*='title'] {
  color: var(--lpp-ivory);
}

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header[class*='header'] [class*='title']::after {
  content: '';
  display: block;
  width: 34px;
  height: 2px;
  margin-top: 3px;
  background: linear-gradient(90deg, var(--lpp-gold), transparent);
  border-radius: 1px;
}

body[data-dsh-linpianpian] [data-chat-flow] {
  --dsw-alias-label-tertiary: #4c6353;
  --dsw-alias-label-caption: #57705f;
  z-index: 2;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-chat-flow] {
  --dsw-alias-label-tertiary: #a9b8a6;
  --dsw-alias-label-caption: #96ab97;
}

/* 消息 footer（时间/耗时/操作钮）：压实在瓷面上，不发白 */
body[data-dsh-linpianpian] [data-chat-flow] [class*='flowItem'] [class*='actions'] button {
  border: 1px solid var(--lpp-gold-line);
  background: rgba(248, 245, 236, 0.88);
}

/* 统计文字常驻显示（宿主默认悬浮才显现，浅色画底上等效于看不见） */
body[data-dsh-linpianpian] [data-chat-flow] [class*='timeEnd'],
body[data-dsh-linpianpian] [data-chat-flow] [class*='timeStart'] {
  opacity: 1 !important;
}

body[data-dsh-linpianpian] [data-chat-flow] :is([data-slot='conversation.chat.node'], [data-question-key]) {
  color: var(--lpp-ink);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-chat-flow] :is([data-slot='conversation.chat.node'], [data-question-key]) {
  color: var(--lpp-ivory);
}

/* 用户气泡：折角便签 */
body[data-dsh-linpianpian] [class*='userRow'] [class*='bubble'] {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 10px 10px 4px 10px;
  background: var(--lpp-paper-strong);
  color: var(--lpp-ink);
  box-shadow: 0 3px 10px rgba(20, 40, 30, 0.1);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [class*='userRow'] [class*='bubble'] {
  color: var(--lpp-ivory);
}

/* 助手信笺卡：与 dock 输入卡同宽（内容列 +32px，再加绢框外扩的 20px） */
body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] > * > * > * > div[class*='markdown'] {
  box-sizing: border-box;
  width: calc(100% + 52px);
  max-width: none;
  margin-inline: -26px;
  padding: 14px 24px;
  border: 1px solid var(--lpp-gold-line);
  border-radius: 4px 12px 12px 12px;
  background: var(--lpp-paper-strong);
  box-shadow: 0 4px 16px rgba(20, 40, 30, 0.1);
}

/* 会话页签 */
body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header [role='tab'] {
  position: relative;
  color: var(--lpp-ink-soft);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] :is([data-pane='conversation'], [class*='centerCol']) header [role='tab'] {
  color: var(--lpp-ivory-dim);
}

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header [role='tab'][aria-selected='true'] {
  color: var(--lpp-ink);
  font-weight: 600;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] :is([data-pane='conversation'], [class*='centerCol']) header [role='tab'][aria-selected='true'] {
  color: var(--lpp-ivory);
}

body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) header [role='tab'][aria-selected='true']::after {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 2px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--lpp-gold), transparent);
  border-radius: 1px;
}

/* 底部统计 / 状态条：漆面描金条 */
body[data-dsh-linpianpian] [data-phase='active'] [class*='stats'],
body[data-dsh-linpianpian] [class*='statusBar'],
body[data-dsh-linpianpian] [class*='dock'][class*='bar'] {
  background: linear-gradient(180deg, var(--lpp-lacquer-1), var(--lpp-lacquer-2));
  box-shadow: inset 0 1px rgba(228, 203, 144, 0.5);
  color: var(--lpp-ivory);
}

/* ============ 13. 终端 / 工具 / 思考 ============ */

body[data-dsh-linpianpian] [data-terminal] {
  --dsw-alias-markdown-code-block: #16281e;
  --dsw-alias-label-primary: #e9ecdc;
  --dsw-alias-label-secondary: #bccbb8;
  --dsw-alias-label-tertiary: #94a894;
}

/* 折叠/展开的工具与思考行：单层 blur 原则 */
body[data-dsh-linpianpian] :is([data-variant], [data-chat-flow-kind='context']) {
  --dsw-alias-label-secondary: var(--lpp-ink-soft);
  --dsw-alias-label-tertiary: var(--lpp-ink-soft);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] :is([data-variant], [data-chat-flow-kind='context']) {
  --dsw-alias-label-secondary: var(--lpp-ivory-dim);
  --dsw-alias-label-tertiary: var(--lpp-ivory-dim);
}

body[data-dsh-linpianpian]
  :is(
    [data-variant]:not([data-variant='think']) > [data-open='true'],
    [data-chat-flow-kind='context'] > [data-slot='conversation.chat.node'] > [data-open='true']
  ) {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 10px;
  background: rgba(248, 245, 236, 0.66);
  backdrop-filter: blur(12px) saturate(0.95);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 250, 0.3);
}

body[data-dsh-linpianpian][data-lpp-dark-theme]
  :is(
    [data-variant]:not([data-variant='think']) > [data-open='true'],
    [data-chat-flow-kind='context'] > [data-slot='conversation.chat.node'] > [data-open='true']
  ) {
  background: rgba(24, 40, 36, 0.7);
}

/* 展开容器内的行头退出自身 blur，防双重采样 */
body[data-dsh-linpianpian]
  :is(
    [data-variant]:not([data-variant='think']) > [data-open='true'],
    [data-chat-flow-kind='context'] > [data-slot='conversation.chat.node'] > [data-open='true']
  ) > [data-disclosure-row='true'] {
  background: transparent;
  backdrop-filter: none;
}

/* 折叠态行：各自压一条毛玻璃瓷条 */
body[data-dsh-linpianpian]
  :is(
    [data-variant] > :not([data-open='true']),
    [data-chat-flow-kind='context'] > [data-slot='conversation.chat.node'] > :not([data-open='true'])
  ) > [data-disclosure-row='true'] {
  width: max-content;
  max-width: 100%;
  align-self: flex-start;
  border: 1px solid rgba(201, 162, 74, 0.24);
  border-radius: 8px;
  background: rgba(248, 245, 236, 0.6);
  backdrop-filter: blur(8px) saturate(0.95);
}

body[data-dsh-linpianpian][data-lpp-dark-theme]
  :is(
    [data-variant] > :not([data-open='true']),
    [data-chat-flow-kind='context'] > [data-slot='conversation.chat.node'] > :not([data-open='true'])
  ) > [data-disclosure-row='true'] {
  background: rgba(24, 40, 36, 0.62);
}

body[data-dsh-linpianpian] [data-variant='bash'] > [data-open='true'],
body[data-dsh-linpianpian] [data-variant='bash'] > :not([data-open='true']) > [data-disclosure-row='true'] {
  border-radius: 8px;
}

body[data-dsh-linpianpian] [data-variant='think'] > [data-open='true'] > [data-disclosure-row='true'] {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  border: 1px solid rgba(201, 162, 74, 0.24);
  border-radius: 8px;
  background: rgba(248, 245, 236, 0.6);
  backdrop-filter: blur(8px) saturate(0.95);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-variant='think'] > [data-open='true'] > [data-disclosure-row='true'] {
  background: rgba(24, 40, 36, 0.62);
}

/* 思考进行中：金色扫光 */
body[data-dsh-linpianpian] [data-variant='think'][data-state='running'] [class*='row']::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(105deg, transparent 30%, rgba(228, 203, 144, 0.28) 50%, transparent 70%);
  background-size: 240px 100%;
  background-repeat: no-repeat;
  animation: lppReasoningSweep 1.9s ease-in-out infinite;
  pointer-events: none;
}

@keyframes lppReasoningSweep {
  from { background-position: -240px 0; }
  to { background-position: calc(100% + 240px) 0; }
}

body[data-dsh-linpianpian] [data-state='running'] :is([class*='runState'], [class*='stateDot']) {
  filter: drop-shadow(0 0 6px rgba(228, 203, 144, 0.75));
}

/* ============ 14. markdown 信笺排版 ============ */

body[data-dsh-linpianpian] [class*='markdown'] {
  line-height: 1.72;
}

body[data-dsh-linpianpian] [class*='markdown'] :is(h1, h2, h3, h4) {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  color: var(--lpp-ink);
  letter-spacing: 0.04em;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [class*='markdown'] :is(h1, h2, h3, h4) {
  color: var(--lpp-ivory);
}

body[data-dsh-linpianpian] [class*='markdown'] h2 {
  padding-bottom: 4px;
  border-bottom: 1px solid var(--lpp-gold-line);
}

body[data-dsh-linpianpian] [class*='markdown'] a {
  color: var(--lpp-pine-deep);
  text-decoration: none;
  border-bottom: 1px solid var(--lpp-gold-line);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [class*='markdown'] a {
  color: #a8c8b2;
}

body[data-dsh-linpianpian] [class*='markdown'] li::marker {
  color: var(--lpp-gold);
}

body[data-dsh-linpianpian] [class*='markdown'] blockquote {
  border-left: 3px solid var(--lpp-gold-line);
  background: linear-gradient(90deg, rgba(228, 203, 144, 0.08), transparent 70%);
  border-radius: 0 6px 6px 0;
}

body[data-dsh-linpianpian] [class*='markdown'] :not(pre) > code {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 4px;
  background: var(--lpp-paper);
  color: var(--lpp-ink);
  padding: 0 5px;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [class*='markdown'] :not(pre) > code {
  color: var(--lpp-ivory);
}

body[data-dsh-linpianpian] [class*='markdown'] pre {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 10px;
  box-shadow: inset 0 1px rgba(255, 255, 250, 0.2);
}

body[data-dsh-linpianpian] [class*='markdown'] hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--lpp-gold-line), transparent);
}

body[data-dsh-linpianpian] [class*='markdown'] table {
  border-color: var(--lpp-gold-line);
}

body[data-dsh-linpianpian] [class*='markdown'] th {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  background: rgba(228, 203, 144, 0.12);
  border-color: var(--lpp-gold-line);
}

body[data-dsh-linpianpian] [class*='markdown'] td {
  border-color: rgba(201, 162, 74, 0.22);
}

/* ============ 15. 设置页：近不透明瓷面，文字必须清晰 ============ */

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] {
  --lpp-settings-text: #1f3a2d;
  --lpp-settings-muted: #57705f;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-slot='sidebar.settings'] {
  --lpp-settings-text: #ede6cf;
  --lpp-settings-muted: #a9b8a6;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > :not(button) {
  background: var(--lpp-paper-strong);
}

/* 设置视图挂在侧栏 DOM 内：浅色继承到此为止 */
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] * {
  color: var(--lpp-settings-text) !important;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] [class*='_desc'],
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] [class*='description'] {
  color: var(--lpp-settings-muted) !important;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] ::placeholder {
  color: var(--lpp-settings-muted);
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] :is(button, [role='button']):hover {
  background: rgba(20, 40, 30, 0.06);
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] :is([aria-current='page'], [aria-selected='true']) {
  background: linear-gradient(90deg, rgba(228, 203, 144, 0.16), rgba(228, 203, 144, 0.04));
  box-shadow: inset 2px 0 var(--lpp-gold);
}

/* 设置对话框本体 */
body[data-dsh-linpianpian]
  [data-slot='sidebar.settings'] [role='presentation'] > [role='dialog'][aria-modal='true'] {
  --dsw-alias-bg-layer-2: var(--lpp-paper-strong);
  backdrop-filter: blur(6px);
  box-shadow: var(--lpp-shadow-card);
}

body[data-dsh-linpianpian] [class*='navTitle'] {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  font-size: 22px;
  letter-spacing: 0.1em;
}

body[data-dsh-linpianpian] [class*='navTitle']::after {
  content: '';
  display: block;
  width: 40px;
  height: 2px;
  margin-top: 6px;
  background: linear-gradient(90deg, var(--lpp-gold), transparent);
  border-radius: 1px;
}

body[data-dsh-linpianpian] [class*='navCell'] {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  letter-spacing: 0.05em;
  border-radius: 6px;
}

body[data-dsh-linpianpian] [class*='navCell']:hover {
  background: rgba(20, 40, 30, 0.05);
}

body[data-dsh-linpianpian] [class*='navCell'][class*='_active'],
body[data-dsh-linpianpian] [class*='navCell'][aria-current='true'] {
  background: linear-gradient(90deg, rgba(228, 203, 144, 0.18), rgba(228, 203, 144, 0.05));
  box-shadow: inset 2px 0 var(--lpp-gold);
}

/* 下拉选择器：描金瓷白胶囊（只限设置页内的触发按钮） */
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] [class*='_selector'],
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] :is(button, [role='button'])[aria-haspopup='menu'] {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 999px;
  background: var(--lpp-porcelain);
  transition: box-shadow 150ms ease, border-color 150ms ease;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-slot='sidebar.settings'] [class*='_selector'],
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-slot='sidebar.settings'] :is(button, [role='button'])[aria-haspopup='menu'] {
  background: rgba(24, 40, 36, 0.7);
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] [class*='_selector']:hover,
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] :is(button, [role='button'])[aria-haspopup='menu']:hover {
  border-color: var(--lpp-gold);
  box-shadow: 0 0 0 3px rgba(228, 203, 144, 0.16);
}

/* 主题选择砖 */
body[data-dsh-linpianpian] [class*='themeCube'] {
  border: 1px solid rgba(201, 162, 74, 0.24);
  border-radius: 10px;
  transition: box-shadow 150ms ease, border-color 150ms ease, transform 150ms ease;
}

body[data-dsh-linpianpian] [class*='themeCube']:hover {
  transform: translateY(-1px);
  border-color: var(--lpp-gold-line);
}

body[data-dsh-linpianpian] [class*='themeCube'][aria-pressed='true'],
body[data-dsh-linpianpian] [class*='themeCube'][class*='_selected'] {
  border-color: var(--lpp-gold);
  box-shadow:
    0 0 0 3px rgba(228, 203, 144, 0.18),
    0 4px 12px rgba(20, 40, 30, 0.14);
}

/* 开关：漆轨瓷钮 */
body[data-dsh-linpianpian] [role='switch'] {
  background: linear-gradient(180deg, var(--lpp-lacquer-1), var(--lpp-lacquer-2));
  box-shadow: inset 0 0 0 1px rgba(228, 203, 144, 0.35);
}

body[data-dsh-linpianpian] [role='switch'][aria-checked='true'] {
  background: linear-gradient(180deg, #3a8560, var(--lpp-pine-deep));
}

body[data-dsh-linpianpian] [role='switch'] [class*='knob'],
body[data-dsh-linpianpian] [role='switch'] > span {
  background: var(--lpp-porcelain);
  box-shadow: 0 1px 4px rgba(8, 18, 12, 0.35);
}

body[data-dsh-linpianpian] [role='dialog'] [class*='_row']:not([class*='_rowText']) {
  border-bottom: 1px solid rgba(201, 162, 74, 0.16);
}

body[data-dsh-linpianpian] [role='dialog'] [class*='_title'] {
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  font-size: 16px;
  letter-spacing: 0.04em;
}

body[data-dsh-linpianpian] [class*='_actions'] button,
body[data-dsh-linpianpian] [data-slot='settings.action'] button {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 999px;
  background: rgba(255, 253, 246, 0.6);
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  letter-spacing: 0.06em;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [class*='_actions'] button,
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-slot='settings.action'] button {
  background: rgba(24, 40, 36, 0.6);
}

body[data-dsh-linpianpian] [class*='_actions'] button:hover,
body[data-dsh-linpianpian] [data-slot='settings.action'] button:hover {
  border-color: var(--lpp-gold);
  box-shadow: 0 0 0 3px rgba(228, 203, 144, 0.16);
}

/* ============ 16. portal 浮层：弹窗/菜单/tooltip 整套瓷面重绑 ============ */

body[data-dsh-linpianpian] :is([role='dialog'], [role='menu'], [role='tooltip'], [data-radix-popper-content-wrapper] > *) {
  --dsw-alias-label-primary: #1f3a2d;
  --dsw-alias-label-primary-bluish: #2f4f3e;
  --dsw-alias-label-secondary: #4c6353;
  --dsw-alias-label-tertiary: #6d7f6d;
  --dsw-alias-label-caption: #87977f;
  --dsw-alias-border-l1: rgba(201, 162, 74, 0.26);
  --dsw-alias-border-l2: rgba(201, 162, 74, 0.4);
  --dsw-alias-border-l3: rgba(31, 58, 45, 0.14);
  --dsw-alias-button-elevated-fill: rgba(255, 253, 244, 0.8);
  --dsw-alias-button-floating-fill: rgba(248, 245, 236, 0.9);
  --dsw-alias-button-floating-hover: #ffffff;
  --dsw-alias-button-info-fill: #e3e8d6;
  --dsw-alias-button-info-hover: #d8dfc6;
  --dsw-alias-interactive-bg-hover: rgba(201, 162, 74, 0.1);
  --dsw-alias-interactive-bg-active: rgba(201, 162, 74, 0.16);
  --dsw-specific-input-major: rgba(248, 245, 236, 0.9);
}

body[data-dsh-linpianpian] :is([role='dialog'], [role='menu'], [data-radix-popper-content-wrapper] > *) {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 12px;
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(18px);
  box-shadow: var(--lpp-shadow-card);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] :is([role='dialog'], [role='menu'], [role='tooltip'], [data-radix-popper-content-wrapper] > *) {
  --dsw-alias-label-primary: #ede6cf;
  --dsw-alias-label-primary-bluish: #dae2d0;
  --dsw-alias-label-secondary: #c5d1c0;
  --dsw-alias-label-tertiary: #96ab97;
  --dsw-alias-label-caption: #7e937f;
  --dsw-alias-border-l1: rgba(207, 168, 86, 0.22);
  --dsw-alias-border-l2: rgba(207, 168, 86, 0.34);
  --dsw-alias-border-l3: rgba(237, 230, 207, 0.12);
  --dsw-alias-button-elevated-fill: rgba(255, 248, 224, 0.08);
  --dsw-alias-button-floating-fill: rgba(28, 45, 35, 0.9);
  --dsw-alias-button-floating-hover: #2a4534;
  --dsw-alias-button-info-fill: #1f3a2a;
  --dsw-alias-button-info-hover: #274631;
  --dsw-alias-interactive-bg-hover: rgba(207, 168, 86, 0.12);
  --dsw-alias-interactive-bg-active: rgba(207, 168, 86, 0.2);
  --dsw-specific-input-major: rgba(28, 45, 35, 0.9);
}

/* ============ 17. better-sidebar 工作台 / cordis 面板 ============ */

body[data-dsh-linpianpian] [data-dsh-better-sidebar],
body[data-dsh-linpianpian] [data-cordis-panel] {
  --dsw-alias-bg-base: transparent;
  --dsw-alias-bg-layer-1: rgba(247, 243, 232, 0.78);
  --dsw-alias-bg-layer-2: rgba(248, 245, 236, 0.92);
  --dsw-alias-bg-layer-3: rgba(240, 234, 216, 0.94);
  --dsw-alias-bg-overlay: rgba(31, 58, 45, 0.4);
  --dsw-alias-border-l1: rgba(201, 162, 74, 0.26);
  --dsw-alias-border-l2: rgba(201, 162, 74, 0.4);
  --dsw-alias-border-l2-darkmode-thin: rgba(201, 162, 74, 0.3);
  --dsw-alias-border-l3: rgba(31, 58, 45, 0.14);
  --dsw-alias-brand-primary: #22603f;
  --dsw-alias-brand-text: #22603f;
  --dsw-alias-button-elevated-fill: rgba(255, 253, 244, 0.8);
  --dsw-alias-button-floating-fill: rgba(248, 245, 236, 0.9);
  --dsw-alias-button-floating-hover: #ffffff;
  --dsw-alias-button-info-fill: #e3e8d6;
  --dsw-alias-button-info-hover: #d8dfc6;
  --dsw-alias-interactive-bg-active: rgba(201, 162, 74, 0.16);
  --dsw-alias-interactive-bg-hover: rgba(201, 162, 74, 0.1);
  --dsw-alias-interactive-bg-hover-solid: #f2ecda;
  --dsw-alias-label-primary: #1f3a2d;
  --dsw-alias-label-primary-bluish: #2f4f3e;
  --dsw-alias-label-secondary: #4c6353;
  --dsw-alias-label-tertiary: #6d7f6d;
  --dsw-alias-label-caption: #87977f;
  --dsw-alias-state-business-primary: #22603f;
  --dsw-alias-state-business-tertiary: rgba(47, 106, 94, 0.12);
  --dsw-alias-state-warn-tertiary: rgba(166, 68, 47, 0.12);
  --dsw-alias-state-warn-label: #a6442f;
  --dsw-alias-markdown-code-block: #e7ebda;
  --dsw-specific-input-major: rgba(248, 245, 236, 0.9);
  --dsw-specific-selector: rgba(248, 245, 236, 0.95);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-dsh-better-sidebar],
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-cordis-panel] {
  --dsw-alias-bg-layer-1: rgba(26, 43, 33, 0.82);
  --dsw-alias-bg-layer-2: rgba(28, 45, 35, 0.93);
  --dsw-alias-bg-layer-3: rgba(20, 33, 26, 0.95);
  --dsw-alias-bg-overlay: rgba(4, 10, 7, 0.55);
  --dsw-alias-border-l1: rgba(207, 168, 86, 0.22);
  --dsw-alias-border-l2: rgba(207, 168, 86, 0.34);
  --dsw-alias-border-l2-darkmode-thin: rgba(207, 168, 86, 0.28);
  --dsw-alias-border-l3: rgba(237, 230, 207, 0.12);
  --dsw-alias-brand-primary: #8fbf9e;
  --dsw-alias-brand-text: #9cc9aa;
  --dsw-alias-button-elevated-fill: rgba(255, 248, 224, 0.08);
  --dsw-alias-button-floating-fill: rgba(28, 45, 35, 0.9);
  --dsw-alias-button-floating-hover: #2a4534;
  --dsw-alias-button-info-fill: #1f3a2a;
  --dsw-alias-button-info-hover: #274631;
  --dsw-alias-interactive-bg-active: rgba(207, 168, 86, 0.2);
  --dsw-alias-interactive-bg-hover: rgba(207, 168, 86, 0.12);
  --dsw-alias-interactive-bg-hover-solid: #223829;
  --dsw-alias-label-primary: #ede6cf;
  --dsw-alias-label-primary-bluish: #dae2d0;
  --dsw-alias-label-secondary: #c5d1c0;
  --dsw-alias-label-tertiary: #96ab97;
  --dsw-alias-label-caption: #7e937f;
  --dsw-alias-state-business-primary: #8fbf9e;
  --dsw-alias-state-business-tertiary: rgba(127, 179, 168, 0.14);
  --dsw-alias-state-warn-tertiary: rgba(192, 86, 60, 0.16);
  --dsw-alias-state-warn-label: #d06b4f;
  --dsw-alias-markdown-code-block: #18291e;
  --dsw-specific-input-major: rgba(28, 45, 35, 0.9);
  --dsw-specific-selector: rgba(28, 45, 35, 0.95);
}

body[data-dsh-linpianpian] [data-cordis-panel] {
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(16px) saturate(0.95);
}

body[data-dsh-linpianpian] [data-dsh-better-sidebar] [class*='_panel'],
body[data-dsh-linpianpian] [data-dsh-better-sidebar] [class*='_pane'] {
  border-left: 1px solid var(--lpp-gold-line);
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(14px) saturate(0.95);
}

body[data-dsh-linpianpian] [data-dsh-better-sidebar] [class*='_tabBar'] {
  background: linear-gradient(180deg, var(--lpp-lacquer-1), var(--lpp-lacquer-2));
  box-shadow: inset 0 -1px rgba(228, 203, 144, 0.5);
}

body[data-dsh-linpianpian] [data-dsh-better-sidebar] [class*='_tabBar'] * {
  color: var(--lpp-ivory) !important;
}

body[data-dsh-linpianpian] [data-dsh-better-sidebar] [class*='_tabActive'] {
  background: rgba(228, 203, 144, 0.16);
  box-shadow: inset 0 -2px var(--lpp-gold-hi);
}

/* ============ 18. 会话内嵌浮面：subagent 树 / 提问卡 / todo 面板 / 详情抽屉 ============ */

body[data-dsh-linpianpian] [data-slot='conversation.session.header.actions'] [role='tree'] {
  --dsw-alias-label-dimmed: var(--lpp-ink-soft);
  --dsw-alias-border-l2: var(--lpp-gold-line);
  --dsw-alias-interactive-bg-hover: rgba(201, 162, 74, 0.1);
  border: 1px solid var(--lpp-gold-line);
  border-radius: 10px;
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(12px);
}

body[data-dsh-linpianpian] [data-slot='conversation.session.header.actions'] [role='tree'] [role='treeitem']:hover {
  background: rgba(201, 162, 74, 0.08);
}

body[data-dsh-linpianpian] [data-slot='conversation.session.header.actions'] [role='tree'] [class*='summary'],
body[data-dsh-linpianpian] [data-slot='conversation.session.header.actions'] [role='tree'] [class*='metrics'],
body[data-dsh-linpianpian] [data-slot='conversation.session.header.actions'] [role='tree'] [class*='notice'] {
  color: var(--lpp-ink-soft);
}

body[data-dsh-linpianpian] [data-question-key] {
  --dsw-alias-label-primary: var(--lpp-ink);
  --dsw-alias-label-primary-foreground: #f7f3e8;
  --dsw-alias-label-secondary: #4c6353;
  --dsw-alias-label-tertiary: #6d7f6d;
  --dsw-alias-label-caption: #87977f;
  --dsw-alias-label-dimmed: var(--lpp-ink-soft);
  --dsw-alias-border-l1: rgba(201, 162, 74, 0.26);
  --dsw-alias-border-l2: rgba(201, 162, 74, 0.4);
  --dsw-alias-border-l3: rgba(31, 58, 45, 0.14);
  --dsw-alias-bg-overlay: rgba(31, 58, 45, 0.4);
  --dsw-alias-bg-module-platform: rgba(248, 245, 236, 0.9);
  --dsw-alias-interactive-bg-hover: rgba(201, 162, 74, 0.1);
  --dsw-alias-state-business-primary: #22603f;
  --dsw-specific-sidebar-nav-item-active-accent: #c9a24a;
  --dsw-alias-button-info-fill: #e3e8d6;
  --dsw-specific-input-major: rgba(248, 245, 236, 0.9);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-question-key] {
  --dsw-alias-label-primary: #ede6cf;
  --dsw-alias-label-primary-foreground: #1e3a2a;
  --dsw-alias-label-secondary: #c5d1c0;
  --dsw-alias-label-tertiary: #96ab97;
  --dsw-alias-label-caption: #7e937f;
  --dsw-alias-label-dimmed: var(--lpp-ivory-dim);
  --dsw-alias-border-l1: rgba(207, 168, 86, 0.22);
  --dsw-alias-border-l2: rgba(207, 168, 86, 0.34);
  --dsw-alias-border-l3: rgba(237, 230, 207, 0.12);
  --dsw-alias-bg-overlay: rgba(4, 10, 7, 0.55);
  --dsw-alias-bg-module-platform: rgba(28, 45, 35, 0.92);
  --dsw-alias-interactive-bg-hover: rgba(207, 168, 86, 0.12);
  --dsw-alias-state-business-primary: #8fbf9e;
  --dsw-alias-button-info-fill: #1f3a2a;
  --dsw-specific-input-major: rgba(28, 45, 35, 0.9);
}

body[data-dsh-linpianpian] [data-question-key] > section {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 12px;
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(10px);
  box-shadow: var(--lpp-shadow-card);
}

body[data-dsh-linpianpian] [data-question-key] [class*='eyebrow'] {
  color: var(--lpp-gold);
  letter-spacing: 0.12em;
}

body[data-dsh-linpianpian] [data-question-key] :is([role='radio'], [role='checkbox'])[aria-checked='true'] {
  border-color: var(--lpp-gold);
  background: rgba(228, 203, 144, 0.14);
}

body[data-dsh-linpianpian] [data-question-key] [class*='footer'] button:last-child {
  border: 1px solid var(--lpp-gold);
  border-radius: 999px;
  background: linear-gradient(180deg, #3a8560, var(--lpp-pine-deep));
  color: #f6f3e4 !important;
}

body[data-dsh-linpianpian] [data-question-key] [class*='footer'] button:first-child {
  border: 1px solid var(--lpp-gold-line);
  border-radius: 999px;
  background: var(--lpp-porcelain);
}

body[data-dsh-linpianpian] [data-testid='todo-panel'] {
  --dsw-alias-label-primary: var(--lpp-ink);
  --dsw-alias-label-secondary: #4c6353;
  --dsw-alias-label-tertiary: #6d7f6d;
  --dsw-alias-label-caption: #87977f;
  border: 1px solid var(--lpp-gold-line);
  border-radius: 12px;
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(14px);
  box-shadow: var(--lpp-shadow-card);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-testid='todo-panel'] {
  --dsw-alias-label-primary: #ede6cf;
  --dsw-alias-label-secondary: #c5d1c0;
  --dsw-alias-label-tertiary: #96ab97;
  --dsw-alias-label-caption: #7e937f;
}

body[data-dsh-linpianpian] [data-testid='todo-panel'] button:hover {
  background: rgba(201, 162, 74, 0.1);
}

body[data-dsh-linpianpian] :is([data-pane='details'], [class*='detailsCol']) {
  border-left: 1px solid var(--lpp-gold-line);
  background: var(--lpp-paper-strong);
  backdrop-filter: blur(12px);
  box-shadow: -8px 0 24px rgba(20, 40, 30, 0.12);
}

/* ============ 19. 标题栏（桌面壳；web 无此元素，属预期） ============ */

body[data-dsh-linpianpian] [class*='titlebar'] {
  position: relative;
  background: linear-gradient(180deg, var(--lpp-lacquer-1), var(--lpp-lacquer-2));
  box-shadow:
    inset 0 -1px rgba(228, 203, 144, 0.6),
    inset 0 -3px rgba(201, 162, 74, 0.4),
    0 2px 10px rgba(14, 32, 22, 0.25);
}

body[data-dsh-linpianpian] [class*='titlebar'] :is(button, span, div) {
  color: var(--lpp-ivory) !important;
}

body[data-dsh-linpianpian] [class*='titlebar'] button:hover {
  background: rgba(228, 203, 144, 0.16);
}

body[data-dsh-linpianpian] [class*='titlebar']::after {
  content: '林翩翩';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 0 18px;
  border-left: 1px solid rgba(228, 203, 144, 0.5);
  border-right: 1px solid rgba(228, 203, 144, 0.5);
  color: var(--lpp-gold-hi);
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  font-size: 14px;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  pointer-events: none;
}

/* ============ 20. 响应式与降级 ============ */

@media (max-width: 1180px) {
  body[data-dsh-linpianpian] [data-lpp-character='left'] {
    display: none;
  }
}

@media (max-width: 760px) {
  body[data-dsh-linpianpian] [data-lpp-character='right'] {
    display: none;
  }

  body[data-dsh-linpianpian] [data-skin-chrome='top-trim'],
  body[data-dsh-linpianpian] [data-skin-chrome='bottom-trim'] {
    display: none;
  }
}

@media (max-width: 600px) {
  body[data-dsh-linpianpian] [data-skin-chrome='theme-frame'] {
    inset: 3px;
  }

  body[data-dsh-linpianpian] [class*='titlebar']::after {
    content: none;
  }

  body[data-dsh-linpianpian] [data-phase='hero'] [class*='headlineText'] {
    font-size: 30px;
  }

}

/* 拖拽视口：饰条与瓷框跟随不设过渡 */
body[data-dsh-linpianpian][data-lpp-viewport-resizing] [data-skin-chrome='top-trim'],
body[data-dsh-linpianpian][data-lpp-viewport-resizing] [data-skin-chrome='bottom-trim'],
body[data-dsh-linpianpian][data-lpp-viewport-resizing] [data-lpp-background] {
  transition: none;
}

/* 低机能：关掉大透明层的滤镜与扫光 */
body[data-dsh-linpianpian][data-lpp-low-power] [data-lpp-mascot] {
  filter: none;
}

body[data-dsh-linpianpian][data-lpp-low-power] [data-variant='think'][data-state='running'] [class*='row']::after {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  body[data-dsh-linpianpian] [data-lpp-background],
  body[data-dsh-linpianpian] [data-lpp-character],
  body[data-dsh-linpianpian] [data-skin-chrome='top-trim'],
  body[data-dsh-linpianpian] [data-skin-chrome='bottom-trim'],
  body[data-dsh-linpianpian] [data-input-mirror] {
    transition: none !important;
  }

  body[data-dsh-linpianpian] [data-variant='think'][data-state='running'] [class*='row']::after,
  body[data-dsh-linpianpian] [data-lpp-workspace-active]::before,
  body[data-dsh-linpianpian] [data-lpp-workspace-active] > [class*='folder'],
  body[data-dsh-linpianpian] [data-lpp-workspace-active] [class*='projectText'],
  body[data-dsh-linpianpian] [data-composer-seat][data-lpp-composer-capsule] [data-composer-card],
  body[data-dsh-linpianpian] [data-composer-seat][data-lpp-composer-expanding] [data-composer-card],
  body[data-dsh-linpianpian][data-lpp-composer-motion] [data-composer-card] {
    animation: none !important;
  }

  body[data-dsh-linpianpian] [data-phase='active'] [data-composer-seat] {
    transition: none !important;
  }
}

/* ============ 21. 空态胶囊与滚动显隐（皮肤中心「输入框显示方式」） ============ */

/* 座：滚动显隐（composerMode=scroll）时整卡平滑淡出/淡入 */
body[data-dsh-linpianpian] [data-phase='active'] [data-composer-seat] {
  --dsw-alias-bg-base: transparent;
  background: none;
  transition:
    opacity 260ms cubic-bezier(0.22, 0.78, 0.2, 1),
    transform 260ms cubic-bezier(0.22, 0.78, 0.2, 1);
}

body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-hidden] {
  opacity: 0;
  transform: translateY(26px);
  pointer-events: none;
}

/* 空态胶囊（composerMode=capsule）：输入为空且未聚焦、无弹出菜单时，
   整卡收成一枚白玉描金胶囊；点击或输入后恢复。状态由 composer-capsule.ts 维护 */
body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-composer-card] {
  max-width: 340px;
  min-height: 38px;
  gap: 0;
  padding: 0;
  border: 1px solid rgba(201, 162, 74, 0.55);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(252, 250, 242, 0.94), rgba(243, 238, 224, 0.88)),
    var(--dsw-specific-input-major);
  box-shadow:
    0 4px 14px rgba(20, 40, 30, 0.16),
    inset 0 1px rgba(255, 255, 255, 0.6);
  overflow: hidden;
  /* 布局项瞬时切换，仅 transform/opacity 走合成器 */
  transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
  animation: lppCapsuleIn 220ms cubic-bezier(0.22, 0.78, 0.2, 1) both;
}

body[data-dsh-linpianpian][data-lpp-dark-theme]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-composer-card] {
  background:
    linear-gradient(180deg, rgba(34, 56, 44, 0.94), rgba(26, 43, 33, 0.9)),
    var(--dsw-specific-input-major);
  box-shadow:
    0 4px 14px rgba(3, 10, 6, 0.42),
    inset 0 1px rgba(255, 255, 255, 0.07);
}

body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  :is([data-input-scroll], [data-composer-card] > [class*='row']) {
  display: none !important;
}

/* 统计行（stats / Session log）随卡片一起收起 */
body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-slot='conversation.composer.dock'] {
  display: none;
}

/* 胶囊态撤下绣框与白玉章；::after 复用为胶囊文案。 */
body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-composer-card]::before,
body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-composer-card] > [data-skin-chrome='composer-rails'] {
  content: none;
  display: none;
  border-image-source: none;
  filter: none;
}

body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-composer-card]::after {
  content: '✎ 研墨候君';
  height: auto;
  filter: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  background: transparent;
  background-image: none;
  box-shadow: none;
  backdrop-filter: none;
  color: var(--lpp-ink-soft);
  font-family: KaiTi, STKaiti, 'Kaiti SC', serif;
  font-size: 14px;
  letter-spacing: 0.14em;
  cursor: text;
  pointer-events: none;
}

body[data-dsh-linpianpian][data-lpp-dark-theme]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-composer-card]::after {
  color: var(--lpp-ivory-dim);
}

body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-capsule]
  [data-composer-card]:hover {
  border-color: rgba(228, 203, 144, 0.85);
  box-shadow:
    0 6px 18px rgba(20, 40, 30, 0.2),
    inset 0 1px rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
}

/* 展开衔接：布局宽高瞬时恢复，仅 transform/opacity 走合成器，
   避免折叠/展开反复触发长会话的整块重排 */
body[data-dsh-linpianpian]
  [data-phase='active']
  [data-composer-seat][data-lpp-composer-expanding]
  [data-composer-card] {
  animation: lppCapsuleOut 260ms cubic-bezier(0.22, 0.78, 0.2, 1) both;
}

@keyframes lppCapsuleIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes lppCapsuleOut {
  from {
    opacity: 0.35;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ============ 22. 立绘开关与素书模式（皮肤中心「显示双人物立绘」/时段） ============ */

html[data-lpp-art='hidden'] body[data-dsh-linpianpian] [data-linpianpian-stage],
html[data-lpp-art='hidden'] body[data-dsh-linpianpian] [data-skin-chrome='sidebar-mascot'] {
  display: none;
}

/* ============ 23. 宽表格册页：溢出表格原地成册，点击展卷为册页灯箱 ============ */

/* 未启用框架的宽表格：宿主的破列含非对称前导内边距，居中会把合身表格也顶出气泡 */
body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] .md-table-wide:not([data-lpp-table-frame]) {
  width: 100%;
  max-width: 100%;
  margin-inline: 0;
  padding-inline: 0;
  padding-bottom: var(--dsh-scrollbar-width, 8px);
}

/* 册页：宣纸面 + 鎏金细边，表格居中成页 */
body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] {
  position: relative;
  box-sizing: border-box;
  width: max-content;
  max-width: 100%;
  margin-inline: auto;
  margin-block: 10px 14px;
  padding: 3px 4px 4px 8px;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid rgba(201, 162, 74, 0.32);
  border-radius: 8px;
  background: rgba(252, 250, 242, 0.62);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.58);
  scrollbar-color: rgba(201, 162, 74, 0.4) transparent;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame]:not([data-lpp-table-scroll-suppressed]):hover,
body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame]:has(> [data-lpp-table-expand]:focus-visible) {
  border-color: rgba(201, 162, 74, 0.55);
  box-shadow:
    0 0 0 1px rgba(201, 162, 74, 0.2),
    0 8px 26px rgba(20, 40, 30, 0.1),
    inset 0 1px rgba(255, 255, 255, 0.74);
}

body[data-dsh-linpianpian][data-lpp-dark-theme]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] {
  border-color: rgba(207, 168, 86, 0.3);
  background: rgba(16, 29, 22, 0.68);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.08);
}

body[data-dsh-linpianpian][data-lpp-dark-theme]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame]:not([data-lpp-table-scroll-suppressed]):hover,
body[data-dsh-linpianpian][data-lpp-dark-theme]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame]:has(> [data-lpp-table-expand]:focus-visible) {
  border-color: rgba(207, 168, 86, 0.56);
  box-shadow:
    0 0 0 1px rgba(207, 168, 86, 0.18),
    0 8px 28px rgba(3, 10, 6, 0.24),
    inset 0 1px rgba(255, 255, 255, 0.1);
}

body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] > table {
  margin-inline: auto;
}

/* 展卷钮：右上角白玉小章，悬停浮现 */
body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] > [data-lpp-table-expand] {
  position: absolute;
  z-index: 3;
  top: 8px;
  right: 8px;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(201, 162, 74, 0.62);
  border-radius: 8px;
  color: var(--lpp-ink);
  background: rgba(252, 250, 242, 0.96);
  box-shadow:
    0 0 0 1px rgba(201, 162, 74, 0.16),
    0 8px 22px rgba(20, 40, 30, 0.16),
    inset 0 1px rgba(255, 255, 255, 0.82);
  font-size: 19px;
  line-height: 1;
  cursor: zoom-in;
  opacity: 0;
  transform: translateY(-3px) scale(0.92);
  transition:
    opacity 150ms ease,
    transform 220ms cubic-bezier(0.22, 0.78, 0.2, 1),
    background 150ms ease,
    border-color 150ms ease;
}

body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] > [data-lpp-table-expand]::before {
  content: '⤢';
}

body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] > [data-lpp-table-expand][hidden] {
  display: none;
}

body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame][data-lpp-table-expandable]:not([data-lpp-table-scroll-suppressed]):hover > [data-lpp-table-expand],
body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame][data-lpp-table-expandable]:has(> [data-lpp-table-expand]:focus-visible) > [data-lpp-table-expand] {
  opacity: 1;
  transform: none;
}

@media (hover: none) {
  body[data-dsh-linpianpian]
    [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame][data-lpp-table-expandable] > [data-lpp-table-expand] {
    opacity: 1;
    transform: none;
  }
}

body[data-dsh-linpianpian]
  [data-chat-flow-kind='assistant-step'] .md-table-wide table {
  margin-inline: auto;
}

body[data-dsh-linpianpian][data-lpp-dark-theme]
  [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] > [data-lpp-table-expand] {
  color: var(--lpp-ivory);
  border-color: rgba(207, 168, 86, 0.54);
  background: rgba(16, 29, 22, 0.92);
  box-shadow: 0 10px 24px rgba(3, 10, 6, 0.28), inset 0 1px rgba(255, 255, 255, 0.1);
}

/* 册页灯箱：松烟纱罩 + 宣纸册页 + 四角缠枝桂 */
body[data-dsh-linpianpian] [data-lpp-table-lightbox] {
  position: fixed;
  z-index: 940;
  inset: 0 0 0 var(--lpp-sidebar-width, 0px);
  display: grid;
  place-items: center;
  padding: clamp(14px, 3vw, 28px);
  animation: lppTableOverlayIn 170ms ease both;
}

body[data-dsh-linpianpian] [data-lpp-table-lightbox][data-lpp-table-closing] {
  pointer-events: none;
  animation: lppTableOverlayOut 160ms ease both;
}

body[data-dsh-linpianpian] [data-lpp-table-backdrop] {
  position: absolute;
  inset: 0;
  background: rgba(16, 29, 22, 0.28);
  backdrop-filter: blur(8px) saturate(0.94);
}

body[data-dsh-linpianpian] [data-lpp-table-panel] {
  position: relative;
  box-sizing: border-box;
  width: min(var(--lpp-table-expanded-width, 1180px), 100%);
  max-height: calc(100dvh - 28px);
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid rgba(201, 162, 74, 0.55);
  border-radius: 12px;
  background:
    var(--lpp-art-corner-tl) left 6px top 6px / 48px auto no-repeat,
    var(--lpp-art-corner-tr) right 6px top 6px / 48px auto no-repeat,
    var(--lpp-art-corner-bl) left 6px bottom 6px / 48px auto no-repeat,
    var(--lpp-art-corner-br) right 6px bottom 6px / 48px auto no-repeat,
    rgba(250, 247, 238, 0.97);
  box-shadow:
    0 24px 80px rgba(10, 24, 16, 0.34),
    inset 0 1px rgba(255, 255, 255, 0.76);
  transform-origin: center;
  animation: lppTablePanelIn 260ms cubic-bezier(0.22, 0.78, 0.2, 1) both;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-table-panel] {
  border-color: rgba(207, 168, 86, 0.55);
  background:
    var(--lpp-art-corner-tl) left 6px top 6px / 48px auto no-repeat,
    var(--lpp-art-corner-tr) right 6px top 6px / 48px auto no-repeat,
    var(--lpp-art-corner-bl) left 6px bottom 6px / 48px auto no-repeat,
    var(--lpp-art-corner-br) right 6px bottom 6px / 48px auto no-repeat,
    rgba(22, 37, 28, 0.97);
  box-shadow:
    0 28px 88px rgba(0, 0, 0, 0.58),
    inset 0 1px rgba(255, 255, 255, 0.1);
}

body[data-dsh-linpianpian] [data-lpp-table-expanded-scroller] {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 18px 20px;
  scrollbar-color: rgba(201, 162, 74, 0.45) transparent;
}

body[data-dsh-linpianpian] [data-lpp-table-expanded] {
  width: 100%;
  min-width: 0;
  max-width: none;
  margin: 0;
  padding: 0;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

body[data-dsh-linpianpian] [data-lpp-table-expanded]::after {
  display: none;
}

body[data-dsh-linpianpian] [data-lpp-table-expanded] table {
  width: 100%;
  min-width: 0;
}

body[data-dsh-linpianpian] [data-lpp-table-expanded] :is(th, td) {
  white-space: normal;
}

/* 收起钮：白玉圆章描金 */
body[data-dsh-linpianpian] [data-lpp-table-close] {
  position: absolute;
  z-index: 3;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(201, 162, 74, 0.5);
  border-radius: 999px;
  background: rgba(252, 250, 245, 0.94);
  box-shadow: 0 8px 20px rgba(20, 40, 30, 0.14);
  cursor: pointer;
}

body[data-dsh-linpianpian] [data-lpp-table-close]::before,
body[data-dsh-linpianpian] [data-lpp-table-close]::after {
  content: '';
  position: absolute;
  top: 14px;
  left: 8px;
  width: 14px;
  border-top: 2px solid var(--lpp-ink);
}

body[data-dsh-linpianpian] [data-lpp-table-close]::before {
  transform: rotate(45deg);
}

body[data-dsh-linpianpian] [data-lpp-table-close]::after {
  transform: rotate(-45deg);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-table-close] {
  border-color: rgba(207, 168, 86, 0.54);
  background: rgba(16, 29, 22, 0.94);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-table-close]::before,
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-table-close]::after {
  border-top-color: var(--lpp-ivory);
}

@keyframes lppTableOverlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes lppTableOverlayOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes lppTablePanelIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ============ 24. 设置页响应式壳：窄视口全工作区化，手机类目轨上移 ============ */

/* 低于桌面阈值的视口：设置面板占满工作区，不做挤扁的中间态弹窗 */
@media (max-width: 1099px), (max-height: 680px) {
  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] {
    width: 100vw;
    max-width: none;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
}

/* 只有类目列表滚动；标题与底部提示区留在滚动口之外 */
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav {
  position: relative;
  min-height: 0;
  padding-bottom: 28px;
  overflow: hidden;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav > :first-child {
  flex-shrink: 0;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav > :last-child {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav > :last-child::-webkit-scrollbar {
  display: none;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav > :last-child > button {
  flex-shrink: 0;
}

/* 类目可续滚时，底部一枚描金下滑提示 */
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav[data-lpp-settings-more]::before {
  content: '';
  position: absolute;
  bottom: 4px;
  left: calc(50% - 17px);
  width: 34px;
  height: 20px;
  box-sizing: border-box;
  border: 1px solid rgba(201, 162, 74, 0.5);
  border-radius: 10px;
  background: rgba(250, 247, 238, 0.62);
  box-shadow: 0 2px 6px rgba(20, 40, 30, 0.12), inset 0 1px rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
}

body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav[data-lpp-settings-more]::after {
  content: '';
  position: absolute;
  bottom: 12px;
  left: calc(50% - 4px);
  width: 8px;
  height: 8px;
  box-sizing: border-box;
  border: solid var(--lpp-pine-deep);
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
  pointer-events: none;
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav[data-lpp-settings-more]::before {
  border-color: rgba(207, 168, 86, 0.5);
  background: rgba(22, 37, 28, 0.66);
  box-shadow: 0 2px 6px rgba(3, 10, 6, 0.24), inset 0 1px rgba(255, 255, 255, 0.08);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav[data-lpp-settings-more]::after {
  border-color: var(--lpp-gold-hi);
}

/* 手机与窄窗格：类目轨移到内容之上 */
@media (max-width: 640px) {
  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] {
    flex-direction: column;
  }

  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav {
    box-sizing: border-box;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    max-height: 40%;
    gap: 8px;
    padding: 10px 12px 28px;
    border-bottom: 1px solid rgba(201, 162, 74, 0.42);
  }

  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav > :last-child {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-content: start;
    gap: 4px;
    flex: 1;
    width: auto;
  }

  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav > :first-child {
    padding: 0 4px;
    align-self: flex-start;
  }

  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav button {
    min-width: 0;
    height: 36px;
    padding: 7px 8px;
  }

  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div {
    min-height: 0;
  }

  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :first-child {
    min-height: 46px;
    height: auto;
    padding: 8px 10px;
  }

  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child {
    padding: 0 14px 16px;
  }
}

@media (max-width: 420px) {
  body[data-dsh-linpianpian][data-lpp-settings-open]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav > :last-child {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 手机尺寸的内容区：设置行的文案与控件上下堆叠，说明文字保持正常句子 */
@media (max-width: 520px) {
  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    [class$='_row']:has(> [class$='_rowText']) {
    align-items: stretch;
    flex-direction: column;
  }

  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    [class$='_rowText'] {
    width: 100%;
    padding-right: 0;
  }

  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    [class$='_row']:has(> [class$='_rowText']) > :last-child,
  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    [class$='_selector'] {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
  }

  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    [class$='_selector'] {
    justify-content: space-between;
  }

  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    :is([class$='_toggleRow'], [class$='_selectRow']) {
    align-items: stretch;
    flex-direction: column;
    gap: 6px;
  }

  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    :is([class$='_toggleRow'], [class$='_selectRow']) > span {
    width: 100%;
  }

  body[data-dsh-linpianpian]
    [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > nav + div > :last-child
    [class$='_selectRow'] select {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  body[data-dsh-linpianpian] [data-lpp-table-lightbox],
  body[data-dsh-linpianpian] [data-lpp-table-panel],
  body[data-dsh-linpianpian] [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame],
  body[data-dsh-linpianpian] [data-chat-flow-kind='assistant-step'] [data-lpp-table-frame] > [data-lpp-table-expand] {
    animation: none !important;
    transition: none !important;
  }
}

/* ============ 25. 启动错误页：报告卡册页化，两侧立人物 ============ */

body[data-dsh-linpianpian] [data-dsh-boot][data-lpp-boot-error] {
  box-sizing: border-box;
  display: grid;
  grid-template-areas: 'report';
  grid-template-columns: minmax(0, 480px);
  justify-content: center;
  align-content: center;
  align-items: center;
  gap: 24px;
  padding: clamp(20px, 3vw, 48px);
  overflow: auto;
  background: radial-gradient(ellipse at center, #f7f3e8, #e7dfc8);
}

body[data-dsh-linpianpian][data-lpp-dark-theme] [data-dsh-boot][data-lpp-boot-error] {
  background: radial-gradient(ellipse at center, #1a2b21, #0b1710);
}

body[data-dsh-linpianpian] [data-lpp-boot-error] > div {
  grid-area: report;
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  max-height: calc(100dvh - 96px);
  overflow: auto;
  padding: clamp(20px, 3vw, 36px);
  border: 1px solid var(--lpp-gold);
  border-radius: 12px;
  background: var(--lpp-paper-strong);
  box-shadow: var(--lpp-shadow-card);
  overflow-wrap: anywhere;
  color: var(--lpp-ink);
}

body[data-dsh-linpianpian] [data-lpp-boot-error] > div > div {
  min-width: 0;
  max-width: 100%;
}

html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error] {
  --lpp-boot-figure-height: min(76dvh, 700px, calc((100vw - 580px) * 1.4));
  grid-template-areas: 'left report right';
  grid-template-columns: calc(var(--lpp-boot-figure-height) * .29) minmax(280px, 480px) calc(var(--lpp-boot-figure-height) * .33);
  align-items: start;
  gap: 0;
}

html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error] > div {
  z-index: 1;
  margin-top: calc(var(--lpp-boot-figure-height) * .4);
  max-height: calc(100dvh - 96px - var(--lpp-boot-figure-height) * .4);
}

html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error]::before,
html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error]::after {
  content: '';
  display: block;
  justify-self: start;
  width: calc(var(--lpp-boot-figure-height) * .5);
  height: var(--lpp-boot-figure-height);
  background: center / contain no-repeat;
  pointer-events: none;
}

html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error]::before {
  grid-area: left;
  background-image: var(--lpp-art-char-left);
}

html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error]::after {
  grid-area: right;
  margin-left: calc(var(--lpp-boot-figure-height) * -.175);
  background-image: var(--lpp-art-char-right);
}

@media (max-width: 860px) {
  html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error] {
    --lpp-boot-figure-height: min(34dvh, 260px);
    grid-template-areas: 'left right' 'report report';
    grid-template-columns: repeat(2, minmax(0, 240px));
    align-content: start;
    column-gap: 24px;
    row-gap: 12px;
  }

  html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error]::before,
  html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error]::after {
    width: 100%;
    margin-left: 0;
  }

  html:not([data-lpp-art='hidden']) body[data-dsh-linpianpian] [data-lpp-boot-error] > div {
    margin-top: 0;
    max-height: none;
  }
}

/* Chat owns the scene box; the content remains in the page overlay stack. */
body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) {
  position: relative;
}
body[data-dsh-linpianpian] [data-lpp-scene] {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  contain: strict;
  pointer-events: none;
  background: #f7f3e8;
}
body[data-dsh-linpianpian][data-lpp-dark-theme] [data-lpp-scene] { background: #101d16; }
body[data-dsh-linpianpian] :is([data-pane='conversation'], [class*='centerCol']) > :not([data-skin-owner]) {
  position: relative;
}
body[data-dsh-linpianpian][data-lpp-scene-size='medium'] [data-lpp-character='left'],
body[data-dsh-linpianpian][data-lpp-scene-size='small'] :is([data-lpp-character], [data-skin-chrome='top-trim'], [data-skin-chrome='bottom-trim']) {
  display: none;
}
html[data-lpp-background='hidden'] body[data-dsh-linpianpian] [data-lpp-background-stage] { display: none; }
html[data-lpp-font='serif'] body[data-dsh-linpianpian] [class*='markdown'] :is(p, li, blockquote, td, th) {
  font-family: 'Noto Serif SC', 'Noto Serif CJK SC', 'Source Han Serif SC', 'Songti SC', SimSun, serif;
}
body[data-dsh-linpianpian] [data-lpp-width-locked] {
  width: var(--lpp-locked-width) !important;
  min-width: var(--lpp-locked-width) !important;
  max-width: var(--lpp-locked-width) !important;
}
/* Release only sidebar contexts while a native modal owns the page. */
body[data-dsh-linpianpian][data-lpp-settings-open] :is([data-pane='sidebar'], [class*='sidebarCol']),
body[data-dsh-linpianpian][data-lpp-settings-open] :is([data-pane='sidebar'], [class*='sidebarCol']) > :not([data-skin-owner]) {
  z-index: auto !important;
  isolation: auto;
}
/* The host's rail fade holds a temporary opacity stacking context on the
   footer. A settings modal must not disappear behind the conversation while
   responsive sidebar animation is still running. */
body[data-dsh-linpianpian][data-lpp-settings-open] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='footArea'] {
  animation: none !important;
}
@media (min-width: 1024px) {
  html[data-lpp-settings-layout='centered'] body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] {
    justify-content: center;
    align-items: center;
    padding: 24px;
  }
  html[data-lpp-settings-layout='centered'] body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] {
    box-sizing: border-box;
    width: min(800px, calc(100vw - 48px));
    height: min(760px, calc(100dvh - 48px));
    max-height: calc(100dvh - 48px);
    transform-origin: center;
  }
  html[data-lpp-settings-layout='centered'] body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [role='presentation'] > [role='dialog'] > :not(nav) {
    min-height: 0;
    overflow-y: auto;
  }
}
/* Content-width grips reuse the host pointer-y and dragging state. Their hit
   areas and event handling remain entirely host-owned. */
body[data-dsh-linpianpian] [data-phase='active'] > :has(> [data-conversation-scroll])
  > :is([data-width-handle='left'][data-side='left'], [data-width-handle='right'][data-side='right'])::after {
  width: 3px;
  background: linear-gradient(to bottom,
    transparent calc(var(--dsh-width-handle-pointer-y, 50%) - 58px),
    #1b332855 calc(var(--dsh-width-handle-pointer-y, 50%) - 44px),
    #315d40 calc(var(--dsh-width-handle-pointer-y, 50%) - 30px),
    #c9a24a calc(var(--dsh-width-handle-pointer-y, 50%) - 12px),
    #f4d675 var(--dsh-width-handle-pointer-y, 50%),
    #c9a24a calc(var(--dsh-width-handle-pointer-y, 50%) + 12px),
    #315d40 calc(var(--dsh-width-handle-pointer-y, 50%) + 30px),
    #1b332855 calc(var(--dsh-width-handle-pointer-y, 50%) + 44px),
    transparent calc(var(--dsh-width-handle-pointer-y, 50%) + 58px));
  filter: drop-shadow(0 0 2px #163422) drop-shadow(0 0 5px #c9a24a99);
  pointer-events: none;
}
body[data-dsh-linpianpian] [data-phase='active'] > :has(> [data-conversation-scroll])
  > :is([data-width-handle='left'][data-side='left'], [data-width-handle='right'][data-side='right'])::before {
  content: '';
  position: absolute;
  top: calc(var(--dsh-width-handle-pointer-y, 50%) - 12px);
  left: calc(50% + 1px);
  width: 3px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(transparent,#ffdf79,transparent);
  box-shadow: 0 0 7px #e4cb9055;
  opacity: 0;
  z-index: 1;
  pointer-events: none;
  transition: opacity 180ms ease;
}
body[data-dsh-linpianpian] [data-phase='active'] > :has(> [data-conversation-scroll])
  > [data-width-handle='right'][data-side='right']::before { left: calc(50% - 4px); }
body[data-dsh-linpianpian] [data-phase='active'] > :has(> [data-conversation-scroll])
  > :is([data-width-handle='left'][data-side='left'], [data-width-handle='right'][data-side='right']):is(:hover,[data-dragging])::before {
  opacity: 1;
  animation: lppWidthHandleFlow 1400ms ease-in-out infinite alternate;
}
@keyframes lppWidthHandleFlow {
  from { transform: translateY(-38px); }
  to { transform: translateY(38px); }
}
@media (prefers-reduced-motion: reduce) {
  body[data-dsh-linpianpian] [data-phase='active'] > :has(> [data-conversation-scroll])
    > [data-width-handle]::before { animation: none !important; }
}
${SIDEBAR_CSS}
`
