const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('abhiSandbox', {
  // Session & partition management
  clearPartition: (partition) => ipcRenderer.invoke('session:clear-partition', partition),
  getPartitionCookies: (partition) => ipcRenderer.invoke('session:get-partition-cookies', partition),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),

  // Comprehensive Shortcut & Menu Action Listeners
  onNewTab: (callback) => ipcRenderer.on('shortcut:new-tab', () => callback()),
  onCloseTab: (callback) => ipcRenderer.on('shortcut:close-tab', () => callback()),
  onReloadTab: (callback) => ipcRenderer.on('shortcut:reload-tab', (_e, data) => callback(data)),
  onFocusUrl: (callback) => ipcRenderer.on('shortcut:focus-url', () => callback()),
  onGoBack: (callback) => ipcRenderer.on('shortcut:go-back', () => callback()),
  onGoForward: (callback) => ipcRenderer.on('shortcut:go-forward', () => callback()),
  onSwitchTab: (callback) => ipcRenderer.on('shortcut:switch-tab', (_e, index) => callback(index)),
  onNavigateTab: (callback) => ipcRenderer.on('shortcut:navigate-tab', (_e, dir) => callback(dir)),
  onToggleSplit: (callback) => ipcRenderer.on('shortcut:toggle-split', () => callback()),
  onTogglePhone: (callback) => ipcRenderer.on('shortcut:toggle-phone', () => callback()),
  onToggleTheme: (callback) => ipcRenderer.on('shortcut:toggle-theme', () => callback()),
  onInspectTab: (callback) => ipcRenderer.on('shortcut:inspect-tab', () => callback()),
  onInspectCookies: (callback) => ipcRenderer.on('shortcut:inspect-cookies', () => callback()),
  onGoHome: (callback) => ipcRenderer.on('shortcut:go-home', () => callback()),
  onToggleHistory: (callback) => ipcRenderer.on('shortcut:toggle-history', () => callback()),
  onToggleBookmarks: (callback) => ipcRenderer.on('shortcut:toggle-bookmarks', () => callback()),
  onToggleTabOverview: (callback) => ipcRenderer.on('shortcut:toggle-tab-overview', () => callback()),
  onOpenUrlTab: (callback) => ipcRenderer.on('shortcut:open-url-tab', (_e, url) => callback(url)),

  // Certificate, Extensions, Search & Dynamic Menu IPC
  getCertificateInfo: (url) => ipcRenderer.invoke('security:get-cert-info', url),
  loadExtension: () => ipcRenderer.invoke('extensions:load-unpacked'),
  listExtensions: () => ipcRenderer.invoke('extensions:list'),
  removeExtension: (id) => ipcRenderer.invoke('extensions:remove', id),
  getSearchSuggestions: (query) => ipcRenderer.invoke('search:suggestions', query),
  updateOpenTabsMenu: (tabs) => ipcRenderer.invoke('menu:update-tabs', tabs),

  // Backward compatibility aliases
  onMenuNewTab: (callback) => ipcRenderer.on('shortcut:new-tab', () => callback()),
  onMenuCloseTab: (callback) => ipcRenderer.on('shortcut:close-tab', () => callback()),
  onMenuQuickLaunch: (callback) => ipcRenderer.on('menu:quick-launch', (_event, role) => callback(role)),
  onMenuToggleSplit: (callback) => ipcRenderer.on('shortcut:toggle-split', () => callback()),
  onMenuToggleTheme: (callback) => ipcRenderer.on('shortcut:toggle-theme', () => callback()),
  onMenuInspectTab: (callback) => ipcRenderer.on('shortcut:inspect-tab', () => callback()),

  // System Theme Synchronization
  setThemeSource: (source) => ipcRenderer.invoke('theme:set-source', source),
  getThemeInfo: () => ipcRenderer.invoke('theme:get-info'),
  onSystemThemeChanged: (callback) => ipcRenderer.on('system:theme-changed', (_event, data) => callback(data)),

  // Window and Platform Info
  platform: process.platform,
  getWindowInfo: () => ipcRenderer.invoke('window:get-info'),
  getUserAgent: () => ipcRenderer.invoke('system:get-user-agent'),
  onFullscreenChanged: (callback) => ipcRenderer.on('window:fullscreen-changed', (_event, isFullScreen) => callback(isFullScreen)),

  // Auto-Updater
  checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
  restartAndInstallUpdate: () => ipcRenderer.invoke('updater:restart-and-install'),
  getAppVersion: () => ipcRenderer.invoke('updater:get-app-version'),
  onUpdaterStatus: (callback) => ipcRenderer.on('updater:status', (_event, data) => callback(data)),
  onUpdaterProgress: (callback) => ipcRenderer.on('updater:progress', (_event, data) => callback(data))
});
