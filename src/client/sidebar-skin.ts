/** Sidebar-only craft layers. Never style the settings dialog through its slot. */
export const SIDEBAR_CSS = String.raw`
body[data-dsh-linpianpian] [data-skin-chrome='sidebar-frame'] {
  inset: 0 auto 0 0;
  background:
    var(--lpp-art-sidebar-corner-tl) 8px 8px / 72px 72px no-repeat,
    var(--lpp-art-sidebar-corner-tr) right 8px top 8px / 72px 72px no-repeat,
    var(--lpp-art-sidebar-corner-bl) left 8px bottom 8px / 72px 72px no-repeat,
    var(--lpp-art-sidebar-corner-br) right 8px bottom 8px / 72px 72px no-repeat;
}
body[data-dsh-linpianpian] [data-skin-chrome='sidebar-frame']::before {
  content: '';
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(228,203,144,.78);
  box-shadow: 0 0 0 3px rgba(9,23,16,.7), 0 0 0 4px rgba(201,162,74,.48);
  pointer-events: none;
}
body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) {
  background: linear-gradient(100deg,#142b20,#203d2e 50%,#152c21);
}
body[data-dsh-linpianpian][data-lpp-dark-theme] :is([data-pane='sidebar'], [class*='sidebarCol']) {
  background: linear-gradient(100deg,#0e1e16,#192e23 50%,#101f17);
}
body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) > div:not([data-skin-chrome='sidebar-mascot']) {
  background:
    linear-gradient(90deg,transparent,rgba(18,38,27,.86) 14%,rgba(18,38,27,.86) 86%,transparent),
    var(--lpp-art-brocade) 0 0 / 72px 72px repeat;
}
body[data-dsh-linpianpian] [data-lpp-mascot] { opacity: .28; }
body[data-dsh-linpianpian] [data-skin-chrome='sidebar-mascot'] {
  mask-image: linear-gradient(to bottom,transparent,#000 22%,#000 88%,transparent);
}
body[data-dsh-linpianpian]:not([data-lpp-sidebar-size='rail']) [class*='logoRow'] {
  margin: 17px 20px 5px;
  padding: 10px 6px;
  min-height: 52px;
  border: 1px solid rgba(228,203,144,.42);
  border-radius: 5px 5px 12px 12px;
  background: linear-gradient(180deg,#294937,#162e22);
  box-shadow: inset 0 0 0 3px rgba(9,23,16,.5),inset 0 0 0 4px rgba(228,203,144,.14),0 4px 8px #08170d44;
}
/* Three independent layers: fixed caps, cropped repeating center, live label. */
body[data-dsh-linpianpian]:not([data-lpp-sidebar-size='rail']) :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button,[role='button']):is([class*='newSession'],[class*='newChat']) {
  position: relative;
  isolation: isolate;
  height: 54px;
  min-height: 54px;
  margin: 6px 14px 12px;
  padding: 0 40px;
  border: 0;
  color: #1f3a2d !important;
  background: none;
  box-shadow: none;
  filter: drop-shadow(0 3px 4px #07170f66);
}
body[data-dsh-linpianpian]:not([data-lpp-sidebar-size='rail']) :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button,[role='button']):is([class*='newSession'],[class*='newChat']) * { color: #1f3a2d !important; }
body[data-dsh-linpianpian]:not([data-lpp-sidebar-size='rail']) :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button,[role='button']):is([class*='newSession'],[class*='newChat'])::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--lpp-art-sidebar-new-left) left center / auto 54px no-repeat,
    var(--lpp-art-sidebar-new-right) right center / auto 54px no-repeat;
  pointer-events: none;
}
body[data-dsh-linpianpian]:not([data-lpp-sidebar-size='rail']) :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button,[role='button']):is([class*='newSession'],[class*='newChat'])::after {
  content: '';
  position: absolute;
  inset: 0 56px;
  z-index: -2;
  background: var(--lpp-art-sidebar-new-tile) left center / auto 54px repeat-x;
  pointer-events: none;
}
body[data-dsh-linpianpian]:not([data-lpp-sidebar-size='rail']) :is([data-pane='sidebar'], [class*='sidebarCol'])
  :is(button,[role='button']):is([class*='newSession'],[class*='newChat']):hover { filter: brightness(1.06) drop-shadow(0 3px 4px #07170f66); }

body[data-dsh-linpianpian] [data-lpp-workspace-row] {
  position: relative;
  isolation: isolate;
}
body[data-dsh-linpianpian] [data-lpp-workspace-row] > * { position: relative; z-index: 1; }
body[data-dsh-linpianpian] [data-lpp-workspace-row][aria-expanded='true']:not([data-lpp-workspace-active]) {
  background: linear-gradient(90deg,#e4cb9014,transparent);
  box-shadow: inset 1px 0 #e4cb9055;
}
body[data-dsh-linpianpian] [data-lpp-workspace-active],
body[data-dsh-linpianpian] [data-lpp-workspace-active]:hover { background: transparent; box-shadow: none; }
body[data-dsh-linpianpian] [data-lpp-workspace-active]::before {
  inset: -4px 0 -4px -6px;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: var(--lpp-art-sidebar-ribbon-left) left center / auto 44px no-repeat,
    var(--lpp-art-sidebar-ribbon-right) right center / auto 44px no-repeat;
  filter: drop-shadow(0 3px 3px #05150e70);
}
body[data-dsh-linpianpian] [data-lpp-workspace-active]::after {
  inset: -4px 54px -4px 48px;
  width: auto;
  height: auto;
  z-index: -1;
  transform: none;
  filter: none;
  background: var(--lpp-art-sidebar-ribbon-tile) left center / auto 44px repeat-x;
  animation: lppWorkspaceRibbonEnter 420ms cubic-bezier(.2,.74,.22,1) both;
}
body[data-dsh-linpianpian] [data-lpp-workspace-active] [class*='projectText'] {
  color: #fff5d9 !important;
  text-shadow: 0 1px 2px #06180e;
}
/* The tree connector owns ::before; selection owns ::after, including flat view. */
body[data-dsh-linpianpian] [data-lpp-session-row][aria-selected='true'] {
  background: transparent;
  box-shadow: none;
}
body[data-dsh-linpianpian] [data-lpp-session-row][aria-selected='true']::after {
  content: '';
  position: absolute;
  inset: 1px 0 1px 18px;
  width: auto;
  height: auto;
  z-index: 0;
  border: 1px solid rgba(228,203,144,.76);
  border-radius: 6px;
  background:
    var(--lpp-art-workspace-osmanthus) 5px center / 12px 12px no-repeat,
    linear-gradient(100deg,#385b43f5,#294735f5);
  box-shadow: inset 0 1px #fff8da18,0 2px 4px #08170c25;
  pointer-events: none;
}
body[data-dsh-linpianpian] [data-lpp-session-row][aria-selected='true'] > * { position: relative; z-index: 1; }
body[data-dsh-linpianpian] [data-lpp-session-row][aria-selected='true'] > [class*='title'] { padding-left: 17px; }
body[data-dsh-linpianpian] [data-lpp-session-flat]::before { display: none; }
body[data-dsh-linpianpian] [data-lpp-session-flat][aria-selected='true']::after { left: 0; }

/* A real, non-interactive first child reserves only the garland's own height. */
body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='footArea'] {
  position: relative;
  padding: 0 20px 22px;
  background: transparent;
  border: 0;
  gap: 6px;
}
body[data-dsh-linpianpian] [data-skin-chrome='sidebar-garland'] {
  display: block;
  flex: 0 0 auto;
  width: calc(100% + 40px);
  aspect-ratio: 4 / 1;
  margin: 0 -20px 3px;
  background: var(--lpp-art-sidebar-garland) center / contain no-repeat;
  pointer-events: none;
}
body[data-dsh-linpianpian] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='settingsArea'],
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [class*='triggerRow'] {
  background: transparent;
  padding: 0;
  border: 0;
}
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button,
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > button,
body[data-dsh-linpianpian] [data-slot='sidebar.footer.action'] > button {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 44px;
  justify-content: center;
  padding: 10px 30px;
  border: 0;
  color: #f3eedd !important;
  background: transparent;
  box-shadow: none;
}
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button *,
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > button *,
body[data-dsh-linpianpian] [data-slot='sidebar.footer.action'] > button * { color: inherit !important; }
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button::before,
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > button::before,
body[data-dsh-linpianpian] [data-slot='sidebar.footer.action'] > button::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--lpp-art-sidebar-settings-left) left center / auto 44px no-repeat,
    var(--lpp-art-sidebar-settings-right) right center / auto 44px no-repeat;
  pointer-events: none;
}
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button::after,
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > button::after,
body[data-dsh-linpianpian] [data-slot='sidebar.footer.action'] > button::after {
  content: '';
  position: absolute;
  inset: 0 50px;
  z-index: -2;
  background: var(--lpp-art-sidebar-settings-tile) left center / auto 44px repeat-x;
  pointer-events: none;
}
body[data-dsh-linpianpian] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button:hover { filter: brightness(1.15); }
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-skin-chrome='sidebar-garland'],
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button::before,
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button::after,
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-slot='sidebar.settings'] > button::before,
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-slot='sidebar.settings'] > button::after { display: none; }
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] :is([data-pane='sidebar'], [class*='sidebarCol']) [class*='footArea'] { padding: 6px; }
body[data-dsh-linpianpian][data-lpp-sidebar-size='rail'] [data-slot='sidebar.settings'] > [class*='triggerRow'] > button {
  width: 36px;
  min-height: 36px;
  padding: 0;
  border: 1px solid #e4cb9066;
  border-radius: 50%;
  background: #142b20;
}
body[data-dsh-linpianpian][data-lpp-viewport-resizing] [data-lpp-workspace-active]::after { animation: none; }
@media (prefers-reduced-motion: reduce) {
  body[data-dsh-linpianpian] [data-lpp-workspace-active]::after { animation: none; }
}
`
