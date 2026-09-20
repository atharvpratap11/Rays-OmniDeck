// Default Built-in Roles: Role A, Role B, Role C, Role D, etc. (All fully editable)
const DEFAULT_ROLE_CONFIGS = {
  RoleA: {
    color: '#10b981',
    label: 'Role A',
    desc: 'Primary persona (Doctor, Admin, etc.)',
    icon: '👤'
  },
  RoleB: {
    color: '#3b82f6',
    label: 'Role B',
    desc: 'Secondary persona (Patient, User, etc.)',
    icon: '🧑‍🦱'
  },
  RoleC: {
    color: '#8b5cf6',
    label: 'Role C',
    desc: 'Tertiary persona (Pharmacy, Agent, etc.)',
    icon: '💊'
  },
  RoleD: {
    color: '#f59e0b',
    label: 'Role D',
    desc: 'Pathology, Analyst, Inspector, etc.',
    icon: '🔬'
  },
  RoleE: {
    color: '#ec4899',
    label: 'Role E',
    desc: 'Nurse, Staff, Operator, etc.',
    icon: '👩‍⚕️'
  },
  RoleF: {
    color: '#06b6d4',
    label: 'Role F',
    desc: 'Receptionist, Billing, Support, etc.',
    icon: '📋'
  },
  Custom: {
    color: '#94a3b8',
    label: 'Custom',
    desc: 'Isolated Blank Partition',
    icon: '➕'
  }
};

// Load saved custom roles or initialize with defaults
function loadRoleConfigs() {
  try {
    const saved = localStorage.getItem('rays_roles');
    if (saved) {
      return { ...DEFAULT_ROLE_CONFIGS, ...JSON.parse(saved) };
    }
  } catch (_e) {}
  return { ...DEFAULT_ROLE_CONFIGS };
}

let ROLE_CONFIGS = loadRoleConfigs();

const MAX_TABS = 12;
// Default to minimal rays.foundation search page
const DEFAULT_URL = new URL('newtab.html', window.location.href).href;

// Helper to check if URL is the minimal new tab page
function isNewTabPage(url) {
  if (!url) return true;
  return url === DEFAULT_URL || url.endsWith('newtab.html') || (url.startsWith('file://') && url.includes('newtab.html'));
}

// Get the next role key in sequence
function getNextRole() {
  const roleKeys = Object.keys(ROLE_CONFIGS).filter(k => k !== '__NEW_ROLE__');
  if (roleKeys.length === 0) return 'RoleA';
  return roleKeys[state.tabs.length % roleKeys.length];
}

// Application State
const state = {
  tabs: [],
  activeTabId: null,
  splitSecondaryTabId: null,
  isSplitMode: false,
  isPhoneMode: false,
  deviceWidth: 393,
  deviceHeight: 852,
  isGeminiOpen: false,
  tabCounter: 0,
  draggedTabId: null,
  editingRoleKey: null,
  selectedModalColor: '#10b981',
  themeMode: 'system' // 'system' | 'light' | 'dark'
};

// Device Portview Presets
const DEVICE_PRESETS = {
  'iphone-16-pro-max': { width: 430, height: 932 },
  'iphone-16': { width: 393, height: 852 },
  'iphone-13-mini': { width: 375, height: 812 },
  'iphone-se': { width: 375, height: 667 },
  'samsung-s24-ultra': { width: 412, height: 915 },
  'samsung-s24': { width: 360, height: 780 },
  'samsung-fold-cover': { width: 344, height: 882 },
  'samsung-fold-inner': { width: 829, height: 700 },
  'ipad-pro-11-v': { width: 834, height: 1194 },
  'ipad-pro-11-h': { width: 1194, height: 834 },
  'ipad-mini-v': { width: 744, height: 1133 },
  'ipad-mini-h': { width: 1133, height: 744 },
  'galaxy-tab-v': { width: 800, height: 1280 },
  'galaxy-tab-h': { width: 1280, height: 800 }
};

// DOM Elements
const tabListEl = document.getElementById('tab-list');
const webviewContainerEl = document.getElementById('webview-container');
const addTabBtn = document.getElementById('add-tab-btn');

// Toolbar Elements
const navBackBtn = document.getElementById('nav-back-btn');
const navForwardBtn = document.getElementById('nav-forward-btn');
const navReloadBtn = document.getElementById('nav-reload-btn');
const reloadIcon = document.getElementById('reload-icon');
const stopIcon = document.getElementById('stop-icon');
const navHomeBtn = document.getElementById('nav-home-btn');
const addressForm = document.getElementById('address-form');
const addressInput = document.getElementById('address-input');
const roleSelector = document.getElementById('role-selector');
const roleSelectDot = document.getElementById('role-select-dot');
const loadingBar = document.getElementById('loading-bar');

// Action Group Buttons
const geminiBtn = document.getElementById('gemini-btn');
const phoneModeBtn = document.getElementById('phone-mode-btn');
const splitViewBtn = document.getElementById('split-view-btn');
const extensionsBtn = document.getElementById('extensions-btn');
const inspectCookiesBtn = document.getElementById('inspect-cookies-btn');
const devtoolsBtn = document.getElementById('devtools-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeAutoIcon = document.getElementById('theme-auto-icon');
const themeSunIcon = document.getElementById('theme-sun-icon');
const themeMoonIcon = document.getElementById('theme-moon-icon');
const checkUpdatesBtn = document.getElementById('check-updates-btn');
const updateBadgeDot = document.getElementById('update-badge-dot');

// Auto-Update Banner Elements
const updateBanner = document.getElementById('update-banner');
const updateBannerTitle = document.getElementById('update-banner-title');
const updateBannerDesc = document.getElementById('update-banner-desc');
const updateProgressBarWrap = document.getElementById('update-progress-bar-wrap');
const updateProgressBarFill = document.getElementById('update-progress-bar-fill');
const updateRestartBtn = document.getElementById('update-restart-btn');
const updateDismissBtn = document.getElementById('update-dismiss-btn');

// Gemini AI Copilot Elements
const geminiDrawer = document.getElementById('gemini-drawer');
const geminiDrawerClose = document.getElementById('gemini-drawer-close');
const geminiChatOutput = document.getElementById('gemini-chat-output');
const geminiChatForm = document.getElementById('gemini-chat-form');
const geminiChatInput = document.getElementById('gemini-chat-input');
const openGeminiTabBtn = document.getElementById('open-gemini-tab-btn');

// Device Toolbar & Resizer Elements
const deviceToolbar = document.getElementById('device-toolbar');
const devicePresetSelect = document.getElementById('device-preset-select');
const deviceRotateBtn = document.getElementById('device-rotate-btn');
const deviceResetBtn = document.getElementById('device-reset-btn');
const deviceDimensionBadge = document.getElementById('device-dimension-badge');
const deviceFitBtn = document.getElementById('device-fit-btn');
const deviceCloseBtn = document.getElementById('device-close-btn');
const deviceResizerLeft = document.getElementById('device-resizer-left');
const deviceResizerRight = document.getElementById('device-resizer-right');

// Modals
const extensionsModal = document.getElementById('extensions-modal');
const cookieModal = document.getElementById('cookie-modal');
const cookieListEl = document.getElementById('cookie-list');
const cookiePartitionLabel = document.getElementById('cookie-partition-label');
const cookieCountLabel = document.getElementById('cookie-count-label');
const modalClearCookieBtn = document.getElementById('modal-clear-cookie-btn');
const toastContainer = document.getElementById('toast-container');

// Role Editor Modal Elements
const roleModal = document.getElementById('role-modal');
const roleNameInput = document.getElementById('role-name-input');
const roleDescInput = document.getElementById('role-desc-input');
const saveRoleBtn = document.getElementById('save-role-btn');
const editRoleBtn = document.getElementById('edit-role-btn');
const dropdownAddCustomRoleBtn = document.getElementById('dropdown-add-custom-role');

/**
 * Initialize application with default isolated tabs and theme
 */
function init() {
  const platform = window.abhiSandbox?.platform || (navigator.platform.toLowerCase().includes('win') ? 'win32' : 'darwin');
  document.body.classList.add(`platform-${platform}`);

  if (window.abhiSandbox?.getWindowInfo) {
    window.abhiSandbox.getWindowInfo().then(info => {
      if (info?.isFullScreen) {
        document.body.classList.add('is-fullscreen');
      }
    }).catch(() => {});
  }

  initTheme();
  populateRoleSelectorOptions();
  bindGlobalEvents();
  bindIpcListeners();
  initGeminiCopilot();
  initDevicePortview();
  initAutoUpdater();

  // Create default set of 4 isolated role tabs starting with rays.foundation
  createTab({ role: 'RoleA', url: DEFAULT_URL });
  createTab({ role: 'RoleB', url: DEFAULT_URL });
  createTab({ role: 'RoleC', url: DEFAULT_URL });
  createTab({ role: 'RoleD', url: DEFAULT_URL });

  // Activate the first tab
  if (state.tabs.length > 0) {
    activateTab(state.tabs[0].id);
  }

  console.log(`[Rays OmniDeck] Initialized successfully with ${state.tabs.length} tabs.`);
}

/**
 * Populate role-selector options dynamically based on ROLE_CONFIGS
 */
function populateRoleSelectorOptions(selectedKey = null) {
  roleSelector.innerHTML = '';
  Object.keys(ROLE_CONFIGS).forEach(key => {
    const role = ROLE_CONFIGS[key];
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `Role: ${role.label}`;
    roleSelector.appendChild(opt);
  });

  const customOpt = document.createElement('option');
  customOpt.value = '__NEW_ROLE__';
  customOpt.textContent = '+ New Custom Role...';
  roleSelector.appendChild(customOpt);

  if (selectedKey && ROLE_CONFIGS[selectedKey]) {
    roleSelector.value = selectedKey;
  }
}

/**
 * Theme initialization, macOS synchronization and manual toggling
 * Smart 2-mode: Dark and Light, auto-detected from system and user-toggleable
 */
async function initTheme() {
  const savedMode = localStorage.getItem('rays_theme_mode') || 'auto';
  await applyThemeMode(savedMode, false);
}

async function applyThemeMode(mode, showNotification = true) {
  state.themeMode = mode;
  localStorage.setItem('rays_theme_mode', mode);

  let isDark = false;
  let systemIsDark = false;

  if (window.abhiSandbox?.setThemeSource) {
    const info = await window.abhiSandbox.setThemeSource(mode === 'auto' ? 'system' : mode);
    systemIsDark = info.shouldUseDarkColors;
    isDark = mode === 'auto' ? systemIsDark : (mode === 'dark');
  } else {
    systemIsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark = mode === 'auto' ? systemIsDark : (mode === 'dark');
  }

  if (isDark) {
    if (themeSunIcon) themeSunIcon.style.display = 'block';
    if (themeMoonIcon) themeMoonIcon.style.display = 'none';
    if (themeAutoIcon) themeAutoIcon.style.display = 'none';
    themeToggleBtn.title = 'Current: Dark — Click to switch to Light [Cmd+Shift+T]';
    if (showNotification) showToast('Theme: Dark', 'info');
  } else {
    if (themeSunIcon) themeSunIcon.style.display = 'none';
    if (themeMoonIcon) themeMoonIcon.style.display = 'block';
    if (themeAutoIcon) themeAutoIcon.style.display = 'none';
    themeToggleBtn.title = 'Current: Light — Click to switch to Dark [Cmd+Shift+T]';
    if (showNotification) showToast('Theme: Light', 'info');
  }

  const themeAttr = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', themeAttr);

  // Sync theme and auto-shift wallpapers across all active webviews
  state.tabs.forEach(tab => {
    if (tab.webview && typeof tab.webview.executeJavaScript === 'function') {
      try {
        tab.webview.executeJavaScript(`
          if (typeof syncThemeToPage === 'function') {
            syncThemeToPage('${themeAttr}');
          } else {
            document.documentElement.setAttribute('data-theme', '${themeAttr}');
          }
        `).catch(() => {});
      } catch (_e) {}
    }
  });
}

function cycleTheme() {
  const currentAttr = document.documentElement.getAttribute('data-theme') || 'dark';
  const nextMode = currentAttr === 'dark' ? 'light' : 'dark';
  applyThemeMode(nextMode, true);
}

/**
 * Bind global UI buttons, forms and modals
 */
function bindGlobalEvents() {
  // Theme Toggle Button (cycles system -> light -> dark -> system)
  themeToggleBtn.addEventListener('click', () => {
    cycleTheme();
  });

  // Instant New Tab '+' Button: Immediately opens next isolated role tab
  addTabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.tabs.length >= MAX_TABS) {
      showToast(`Maximum ${MAX_TABS} tabs limit reached.`, 'warning');
      return;
    }
    const nextRole = getNextRole();
    createTab({ role: nextRole, url: DEFAULT_URL, activate: true });
  });

  // Address Bar navigation (fully dynamic URL parsing)
  addressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const activeTab = getActiveTab();
    if (!activeTab) return;

    let targetUrl = addressInput.value.trim();
    if (!targetUrl) return;

    targetUrl = resolveUrl(targetUrl);
    activeTab.webview.loadURL(targetUrl);
  });

  // Navigation buttons
  navBackBtn.addEventListener('click', () => {
    const activeTab = getActiveTab();
    if (activeTab && activeTab.webview.canGoBack()) {
      activeTab.webview.goBack();
    }
  });

  navForwardBtn.addEventListener('click', () => {
    const activeTab = getActiveTab();
    if (activeTab && activeTab.webview.canGoForward()) {
      activeTab.webview.goForward();
    }
  });

  navReloadBtn.addEventListener('click', () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    if (activeTab.isLoading) {
      activeTab.webview.stop();
    } else {
      activeTab.webview.reload();
    }
  });

  navHomeBtn.addEventListener('click', () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      activeTab.webview.loadURL(DEFAULT_URL);
    }
  });

  // Role selector change in toolbar
  roleSelector.addEventListener('change', (e) => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    if (e.target.value === '__NEW_ROLE__') {
      openRoleEditorModal(null); // Open in create mode
      // Reset select to current active tab role
      roleSelector.value = activeTab.role;
      return;
    }

    setTabRole(activeTab.id, e.target.value);
  });

  // Edit Role Pencil Button
  editRoleBtn.addEventListener('click', () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      openRoleEditorModal(activeTab.role);
    }
  });

  // Dropdown Add Custom Role Button
  if (dropdownAddCustomRoleBtn) {
    dropdownAddCustomRoleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      presetDropdown.classList.remove('show');
      openRoleEditorModal(null);
    });
  }

  // Color picker choice clicks in role modal
  document.querySelectorAll('.color-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedModalColor = btn.getAttribute('data-color') || '#10b981';
    });
  });

  // Save Role Button
  saveRoleBtn.addEventListener('click', () => {
    saveCustomRole();
  });

  // Cookies Inspector Button
  inspectCookiesBtn.addEventListener('click', () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      openCookiesModal(activeTab);
    }
  });

  modalClearCookieBtn.addEventListener('click', async () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      await clearTabSession(activeTab);
      closeModal(cookieModal);
    }
  });

  // DevTools Button
  devtoolsBtn.addEventListener('click', () => {
    const activeTab = getActiveTab();
    if (activeTab?.webview) {
      activeTab.webview.openDevTools();
    }
  });

  // Phone Mode (Mobile Viewport Emulation) Button
  if (phoneModeBtn) {
    phoneModeBtn.addEventListener('click', () => {
      togglePhoneMode();
    });
  }

  // Split View Button
  splitViewBtn.addEventListener('click', () => {
    toggleSplitView();
  });

  // Extensions Button
  extensionsBtn.addEventListener('click', () => openModal(extensionsModal));

  // Modal Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const targetModal = document.getElementById(modalId);
      if (targetModal) closeModal(targetModal);
    });
  });

  // Close modals on overlay backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Window-level keyboard shortcuts for instant responsiveness when renderer has focus
  window.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // CmdOrCtrl+T: New Tab
    if (modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      addTabBtn.click();
    }
    // CmdOrCtrl+W: Close Tab
    else if (modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      if (state.activeTabId) closeTab(state.activeTabId);
    }
    // CmdOrCtrl+R / F5: Reload active tab
    else if ((modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'r') || e.key === 'F5') {
      e.preventDefault();
      reloadActiveTab(false);
    }
    // CmdOrCtrl+Shift+R: Force Reload
    else if (modifier && e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      reloadActiveTab(true);
    }
    // CmdOrCtrl+L: Focus address bar
    else if (modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      focusAddressBar();
    }
    // CmdOrCtrl+1..8: Switch tab
    else if (modifier && !e.altKey && !e.shiftKey && e.key >= '1' && e.key <= '8') {
      e.preventDefault();
      switchToTabIndex(parseInt(e.key, 10) - 1);
    }
    // CmdOrCtrl+9: Last tab
    else if (modifier && !e.altKey && !e.shiftKey && e.key === '9') {
      e.preventDefault();
      switchToTabIndex(-1);
    }
    // Toggle Phone Mode: CmdOrCtrl+Shift+M
    else if (modifier && e.shiftKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      togglePhoneMode();
    }
    // Toggle Split: CmdOrCtrl+Shift+S or CmdOrCtrl+\
    else if ((modifier && e.shiftKey && e.key.toLowerCase() === 's') || (modifier && e.key === '\\')) {
      e.preventDefault();
      toggleSplitView();
    }
    // Toggle Theme: CmdOrCtrl+Shift+T
    else if (modifier && e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      cycleTheme();
    }
    // Cookies: CmdOrCtrl+Shift+C
    else if (modifier && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      inspectCookiesBtn.click();
    }
    // DevTools: CmdOrCtrl+Shift+I / F12
    else if ((modifier && e.shiftKey && e.key.toLowerCase() === 'i') || e.key === 'F12') {
      e.preventDefault();
      devtoolsBtn.click();
    }
    // Home: CmdOrCtrl+H
    else if (modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      goHome();
    }
  });
}

/**
 * Dynamic URL resolver: Handles localhost, IP, domains, and searches smoothly
 */
function resolveUrl(input) {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  // Localhost or IP with or without port
  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(trimmed)) {
    return 'http://' + trimmed;
  }
  // Host with port e.g. dev.local:3000
  if (/^[a-z0-9.-]+:\d+(\/.*)?$/i.test(trimmed)) {
    return 'http://' + trimmed;
  }
  // Valid domain (e.g. abhi.health, google.com, subdomain.example.org/path)
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  // Default to Google search
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

/**
 * Browser Navigation and Tab Management Action Helpers
 */
function reloadActiveTab(force = false) {
  const activeTab = getActiveTab();
  if (!activeTab?.webview) return;
  if (force) {
    activeTab.webview.reloadIgnoringCache();
    showToast('Forced reload completed', 'info');
  } else {
    activeTab.webview.reload();
  }
}

function focusAddressBar() {
  if (addressInput) {
    addressInput.focus();
    addressInput.select();
  }
}

function goBack() {
  const activeTab = getActiveTab();
  if (activeTab?.webview?.canGoBack()) {
    activeTab.webview.goBack();
  }
}

function goForward() {
  const activeTab = getActiveTab();
  if (activeTab?.webview?.canGoForward()) {
    activeTab.webview.goForward();
  }
}

function goHome() {
  const activeTab = getActiveTab();
  if (activeTab?.webview) {
    activeTab.webview.loadURL(DEFAULT_URL);
  }
}

function switchToTabIndex(targetIndex) {
  if (state.tabs.length === 0) return;
  let targetTab = null;
  if (targetIndex === -1 || targetIndex >= state.tabs.length) {
    targetTab = state.tabs[state.tabs.length - 1];
  } else if (targetIndex >= 0 && targetIndex < state.tabs.length) {
    targetTab = state.tabs[targetIndex];
  }
  if (targetTab) {
    activateTab(targetTab.id);
  }
}

function cycleActiveTab(direction) {
  if (state.tabs.length <= 1) return;
  const currentIndex = state.tabs.findIndex(t => t.id === state.activeTabId);
  if (currentIndex === -1) return;
  const newIndex = (currentIndex + direction + state.tabs.length) % state.tabs.length;
  activateTab(state.tabs[newIndex].id);
}

function togglePhoneMode() {
  state.isPhoneMode = !state.isPhoneMode;
  if (phoneModeBtn) {
    phoneModeBtn.classList.toggle('active', state.isPhoneMode);
  }
  webviewContainerEl.classList.toggle('phone-mode', state.isPhoneMode);

  if (deviceToolbar) {
    deviceToolbar.style.display = state.isPhoneMode ? 'flex' : 'none';
  }
  if (deviceResizerLeft) {
    deviceResizerLeft.style.display = state.isPhoneMode ? 'flex' : 'none';
  }
  if (deviceResizerRight) {
    deviceResizerRight.style.display = state.isPhoneMode ? 'flex' : 'none';
  }

  if (state.isPhoneMode) {
    setDeviceDimensions(state.deviceWidth || 393, state.deviceHeight || 852);
  }
  // NOTE: Toast notification intentionally disabled per user specification
}

/**
 * Listen for native Electron application menu events forwarded by preload.js
 */
function bindIpcListeners() {
  if (!window.abhiSandbox) return;

  window.abhiSandbox.onNewTab(() => {
    if (state.tabs.length < MAX_TABS) {
      const nextRole = getNextRole();
      createTab({ role: nextRole, url: DEFAULT_URL, activate: true });
    }
  });

  window.abhiSandbox.onCloseTab(() => {
    if (state.activeTabId) {
      closeTab(state.activeTabId);
    }
  });

  window.abhiSandbox.onReloadTab((data) => {
    reloadActiveTab(data?.force);
  });

  window.abhiSandbox.onFocusUrl(() => {
    focusAddressBar();
  });

  window.abhiSandbox.onGoBack(() => {
    goBack();
  });

  window.abhiSandbox.onGoForward(() => {
    goForward();
  });

  window.abhiSandbox.onSwitchTab((index) => {
    switchToTabIndex(index);
  });

  window.abhiSandbox.onNavigateTab((dir) => {
    cycleActiveTab(dir);
  });

  window.abhiSandbox.onToggleSplit(() => {
    toggleSplitView();
  });

  window.abhiSandbox.onTogglePhone(() => {
    togglePhoneMode();
  });

  window.abhiSandbox.onToggleTheme(() => {
    cycleTheme();
  });

  window.abhiSandbox.onInspectTab(() => {
    const activeTab = getActiveTab();
    if (activeTab?.webview) {
      activeTab.webview.openDevTools();
    }
  });

  window.abhiSandbox.onInspectCookies(() => {
    const activeTab = getActiveTab();
    if (activeTab) {
      openCookiesModal(activeTab);
    }
  });

  window.abhiSandbox.onGoHome(() => {
    goHome();
  });

  window.abhiSandbox.onOpenUrlTab((url) => {
    if (state.tabs.length < MAX_TABS) {
      createTab({ role: getNextRole(), url, activate: true });
    }
  });

  if (window.abhiSandbox.onFullscreenChanged) {
    window.abhiSandbox.onFullscreenChanged((isFullScreen) => {
      document.body.classList.toggle('is-fullscreen', isFullScreen);
    });
  }

  if (window.abhiSandbox.onSystemThemeChanged) {
    window.abhiSandbox.onSystemThemeChanged((info) => {
      // If in automatic system matching mode, adapt immediately to OS appearance
      if (state.themeMode === 'auto') {
        const isDark = info.shouldUseDarkColors;
        const themeAttr = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', themeAttr);
        if (themeSunIcon) themeSunIcon.style.display = isDark ? 'block' : 'none';
        if (themeMoonIcon) themeMoonIcon.style.display = isDark ? 'none' : 'block';
        themeToggleBtn.title = `Current: ${isDark ? 'Dark' : 'Light'} (Auto) — Click to switch [Cmd+Shift+T]`;

        state.tabs.forEach(tab => {
          if (tab.webview && typeof tab.webview.executeJavaScript === 'function') {
            try {
              tab.webview.executeJavaScript(`
                if (typeof syncThemeToPage === 'function') {
                  syncThemeToPage('${themeAttr}');
                } else {
                  document.documentElement.setAttribute('data-theme', '${themeAttr}');
                }
              `).catch(() => {});
            } catch (_e) {}
          }
        });
      }
    });
  }
}

/**
 * Create a new tab with strict session partition isolation and drag-and-drop
 */
function createTab({ role = 'RoleA', url = DEFAULT_URL, activate = true } = {}) {
  if (state.tabs.length >= MAX_TABS) {
    showToast(`Maximum tab limit (${MAX_TABS}) reached.`, 'warning');
    return null;
  }

  state.tabCounter++;
  const tabId = `tab_${state.tabCounter}`;
  // Isolated persistent partition ensures zero cookie/storage bleed!
  const partition = `persist:${tabId}`;
  const roleConfig = ROLE_CONFIGS[role] || ROLE_CONFIGS.Custom;

  // 1. Create Webview Element
  const webview = document.createElement('webview');
  webview.id = `webview-${tabId}`;
  webview.setAttribute('partition', partition);
  webview.setAttribute('src', url);
  webview.setAttribute('allowpopups', 'true');
  webview.setAttribute('webpreferences', 'contextIsolation=yes, backgroundThrottling=yes, nodeIntegration=no');

  // Enforce modern genuine Chrome User Agent without Electron token
  // Fixes WhatsApp Web "Update to Chrome 100+" and compatibility check gates
  const cleanUA = (window.abhiSandbox?.platform === 'win32')
    ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
  webview.setAttribute('useragent', cleanUA);

  // 2. Create Tab Strip Item with Drag & Drop
  const tabEl = document.createElement('div');
  tabEl.id = `tab-item-${tabId}`;
  tabEl.className = 'tab-item';
  tabEl.setAttribute('draggable', 'true');
  tabEl.setAttribute('data-tab-id', tabId);
  tabEl.style.setProperty('--role-color', roleConfig.color);
  tabEl.style.setProperty('--active-role-color', roleConfig.color);

  tabEl.innerHTML = `
    <span class="tab-role-dot"></span>
    <span class="tab-title">${isNewTabPage(url) ? 'rays.foundation' : 'Loading...'}</span>
    <span class="tab-role-pill">${roleConfig.label}</span>
    <button class="tab-close-btn" title="Close Tab">&times;</button>
  `;

  // Attach Tab Click handler
  tabEl.addEventListener('click', (e) => {
    if (e.target.closest('.tab-close-btn')) {
      e.stopPropagation();
      closeTab(tabId);
    } else {
      activateTab(tabId);
    }
  });

  // Attach Tab Drag & Drop Reordering Listeners
  attachDragAndDropListeners(tabEl, tabId);

  // Tab Data Object
  const tabData = {
    id: tabId,
    role,
    partition,
    url,
    title: isNewTabPage(url) ? 'rays.foundation' : 'Loading...',
    isLoading: false,
    tabEl,
    webview
  };

  state.tabs.push(tabData);

  // Attach Webview Lifecycle Listeners
  attachWebviewListeners(tabData);

  // Add to DOM
  tabListEl.appendChild(tabEl);
  webviewContainerEl.appendChild(webview);

  if (activate) {
    activateTab(tabId);
  }

  return tabData;
}

/**
 * HTML5 Drag-and-Drop Handlers for Tab Reordering
 */
function attachDragAndDropListeners(tabEl, tabId) {
  tabEl.addEventListener('dragstart', (e) => {
    state.draggedTabId = tabId;
    tabEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  });

  tabEl.addEventListener('dragend', () => {
    tabEl.classList.remove('dragging');
    clearDragClasses();
    state.draggedTabId = null;
  });

  tabEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!state.draggedTabId || state.draggedTabId === tabId) return;

    const rect = tabEl.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    clearDragClasses();
    if (e.clientX < midpoint) {
      tabEl.classList.add('drag-over-left');
    } else {
      tabEl.classList.add('drag-over-right');
    }
  });

  tabEl.addEventListener('dragleave', () => {
    tabEl.classList.remove('drag-over-left', 'drag-over-right');
  });

  tabEl.addEventListener('drop', (e) => {
    e.preventDefault();
    clearDragClasses();
    const sourceId = state.draggedTabId;
    if (!sourceId || sourceId === tabId) return;

    const rect = tabEl.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const dropBefore = e.clientX < midpoint;

    reorderTabs(sourceId, tabId, dropBefore);
  });
}

function clearDragClasses() {
  document.querySelectorAll('.tab-item').forEach(el => {
    el.classList.remove('drag-over-left', 'drag-over-right');
  });
}

/**
 * Reorder tabs in state and DOM
 */
function reorderTabs(sourceId, targetId, insertBeforeTarget) {
  const sourceIndex = state.tabs.findIndex(t => t.id === sourceId);
  const targetIndex = state.tabs.findIndex(t => t.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return;

  const [movedTab] = state.tabs.splice(sourceIndex, 1);
  let newTargetIndex = state.tabs.findIndex(t => t.id === targetId);
  if (!insertBeforeTarget) {
    newTargetIndex++;
  }
  state.tabs.splice(newTargetIndex, 0, movedTab);

  // Reorder in DOM
  const targetEl = document.getElementById(`tab-item-${targetId}`);
  const sourceEl = movedTab.tabEl;
  if (insertBeforeTarget) {
    tabListEl.insertBefore(sourceEl, targetEl);
  } else {
    tabListEl.insertBefore(sourceEl, targetEl.nextSibling);
  }
}

/**
 * Attach lifecycle & navigation events to webview instance
 */
function attachWebviewListeners(tab) {
  const { webview, tabEl } = tab;

  // Loading states
  webview.addEventListener('did-start-loading', () => {
    tab.isLoading = true;
    if (state.activeTabId === tab.id) {
      loadingBar.classList.add('active');
      reloadIcon.style.display = 'none';
      stopIcon.style.display = 'block';
    }
  });

  webview.addEventListener('did-stop-loading', () => {
    tab.isLoading = false;
    if (state.activeTabId === tab.id) {
      loadingBar.classList.remove('active');
      reloadIcon.style.display = 'block';
      stopIcon.style.display = 'none';
      updateNavButtons(tab);
    }
  });

  // URL Navigation & Dynamic Title Updates
  webview.addEventListener('did-navigate', (e) => {
    tab.url = e.url;
    if (state.activeTabId === tab.id) {
      if (isNewTabPage(e.url)) {
        addressInput.value = '';
        addressInput.placeholder = 'rays.foundation — Search or enter URL...';
      } else {
        addressInput.value = e.url;
        addressInput.placeholder = 'Enter URL (e.g. localhost:3000 or abhi.health)...';
      }
      updateNavButtons(tab);
    }
    updateTabTitle(tab, webview.getTitle() || e.url);
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    tab.url = e.url;
    if (state.activeTabId === tab.id) {
      if (isNewTabPage(e.url)) {
        addressInput.value = '';
        addressInput.placeholder = 'rays.foundation — Search or enter URL...';
      } else {
        addressInput.value = e.url;
      }
      updateNavButtons(tab);
    }
  });

  // Page Title Update
  webview.addEventListener('page-title-updated', (e) => {
    if (e.title) {
      updateTabTitle(tab, e.title);
    }
  });

  // Handle links requesting new windows in isolated partition
  webview.addEventListener('new-window', (e) => {
    e.preventDefault();
    if (e.url && (e.url.startsWith('http://') || e.url.startsWith('https://'))) {
      createTab({ role: tab.role, url: e.url, activate: true });
    }
  });

  webview.addEventListener('did-fail-load', (e) => {
    if (e.errorCode !== -3) { // Ignore aborted
      console.warn(`Tab ${tab.id} load error: ${e.errorDescription} (${e.errorCode})`);
    }
  });
}

/**
 * Update tab title text and tooltip
 */
function updateTabTitle(tab, rawTitle) {
  let displayTitle = rawTitle;
  if (isNewTabPage(tab.url) || rawTitle?.includes('rays.foundation')) {
    displayTitle = 'rays.foundation';
  } else {
    try {
      if (rawTitle.startsWith('http://') || rawTitle.startsWith('https://')) {
        const parsed = new URL(rawTitle);
        displayTitle = parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
      }
    } catch (_e) {
      displayTitle = rawTitle;
    }
  }

  tab.title = displayTitle || tab.role;
  const titleEl = tab.tabEl.querySelector('.tab-title');
  if (titleEl) {
    titleEl.textContent = tab.title;
    titleEl.title = tab.title;
  }
}

/**
 * Switch active tab and synchronize dedicated toolbar
 */
function activateTab(tabId) {
  const targetTab = state.tabs.find(t => t.id === tabId);
  if (!targetTab) return;

  state.activeTabId = tabId;

  // Synchronize Tab bar classes
  state.tabs.forEach(t => {
    const isActive = t.id === tabId;
    t.tabEl.classList.toggle('active', isActive);
    t.webview.classList.toggle('active', isActive);
  });

  if (state.isSplitMode) {
    syncSplitView();
  }

  syncToolbar(targetTab);
  targetTab.tabEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
}

/**
 * Synchronize the dedicated toolbar to reflect the selected tab
 */
function syncToolbar(tab) {
  const roleConfig = ROLE_CONFIGS[tab.role] || ROLE_CONFIGS.Custom;

  // Address input shows current tab's active URL or clean placeholder for rays.foundation
  if (isNewTabPage(tab.url)) {
    addressInput.value = '';
    addressInput.placeholder = 'rays.foundation — Search or enter URL...';
  } else {
    addressInput.value = tab.url || tab.webview.getURL() || '';
    addressInput.placeholder = 'Enter URL (e.g. localhost:3000 or abhi.health)...';
  }

  // Role Selector
  roleSelector.value = tab.role;
  toolbar.style.setProperty('--current-role-color', roleConfig.color);
  roleSelectDot.style.backgroundColor = roleConfig.color;
  roleSelectDot.style.boxShadow = `0 0 6px ${roleConfig.color}`;

  // Reload / Stop button state
  if (tab.isLoading) {
    reloadIcon.style.display = 'none';
    stopIcon.style.display = 'block';
    loadingBar.classList.add('active');
  } else {
    reloadIcon.style.display = 'block';
    stopIcon.style.display = 'none';
    loadingBar.classList.remove('active');
  }

  updateNavButtons(tab);
}

/**
 * Update back/forward button enabled states
 */
function updateNavButtons(tab) {
  if (!tab || !tab.webview) return;
  try {
    navBackBtn.disabled = !tab.webview.canGoBack();
    navForwardBtn.disabled = !tab.webview.canGoForward();
  } catch (_e) {
    navBackBtn.disabled = true;
    navForwardBtn.disabled = true;
  }
}

/**
 * Change the persona role of a tab
 */
function setTabRole(tabId, newRole) {
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab) return;

  tab.role = newRole;
  const roleConfig = ROLE_CONFIGS[newRole] || ROLE_CONFIGS.Custom;

  tab.tabEl.style.setProperty('--role-color', roleConfig.color);
  tab.tabEl.style.setProperty('--active-role-color', roleConfig.color);
  const pill = tab.tabEl.querySelector('.tab-role-pill');
  if (pill) {
    pill.textContent = roleConfig.label;
  }

  if (state.activeTabId === tabId) {
    syncToolbar(tab);
  }

  showToast(`Role: ${roleConfig.label}`, 'info');
}

/**
 * Open Custom Role Editor Modal
 */
function openRoleEditorModal(roleKey = null) {
  state.editingRoleKey = roleKey;
  const existingRole = roleKey ? ROLE_CONFIGS[roleKey] : null;

  if (existingRole) {
    roleNameInput.value = existingRole.label;
    roleDescInput.value = existingRole.desc || '';
    state.selectedModalColor = existingRole.color || '#10b981';
  } else {
    roleNameInput.value = '';
    roleDescInput.value = '';
    state.selectedModalColor = '#0ea5e9';
  }

  // Highlight color in palette
  document.querySelectorAll('.color-choice').forEach(btn => {
    const btnColor = btn.getAttribute('data-color');
    btn.classList.toggle('active', btnColor === state.selectedModalColor);
  });

  openModal(roleModal);
  roleNameInput.focus();
}

/**
 * Save or update custom role persona
 */
function saveCustomRole() {
  const name = roleNameInput.value.trim();
  if (!name) {
    showToast('Please enter a role name', 'warning');
    return;
  }

  const roleKey = state.editingRoleKey || name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const roleDesc = roleDescInput.value.trim() || 'Custom Persona';

  ROLE_CONFIGS[roleKey] = {
    color: state.selectedModalColor,
    label: name,
    desc: roleDesc,
    icon: '🎭'
  };

  // Persist custom roles to localStorage
  try {
    localStorage.setItem('rays_roles', JSON.stringify(ROLE_CONFIGS));
  } catch (_e) {}

  // Update role selector dropdown options
  populateRoleSelectorOptions(roleKey);

  // If there is an active tab, update its role to this role
  const activeTab = getActiveTab();
  if (activeTab) {
    setTabRole(activeTab.id, roleKey);
  }

  closeModal(roleModal);
  showToast(`Saved Role: ${name}`, 'success');
}

/**
 * Close a tab
 */
function closeTab(tabId) {
  const index = state.tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;

  const tabToRemove = state.tabs[index];

  if (state.tabs.length === 1) {
    showToast('Cannot close the last remaining tab.', 'warning');
    return;
  }

  tabToRemove.tabEl.remove();
  tabToRemove.webview.remove();

  state.tabs.splice(index, 1);

  if (state.activeTabId === tabId) {
    const nextTab = state.tabs[index] || state.tabs[index - 1] || state.tabs[0];
    if (nextTab) {
      activateTab(nextTab.id);
    }
  }

  if (state.isSplitMode) {
    syncSplitView();
  }
}

/**
 * Clear session partition data (cookies, localStorage, cache)
 */
async function clearTabSession(tab) {
  if (!tab) return;
  try {
    if (window.abhiSandbox) {
      const result = await window.abhiSandbox.clearPartition(tab.partition);
      if (result.success) {
        showToast(`Partition cleared (${tab.role})`, 'success');
        tab.webview.reload();
      } else {
        showToast(`Error: ${result.error}`, 'warning');
      }
    }
  } catch (err) {
    console.error('Failed to clear partition:', err);
  }
}

/**
 * Open Cookie Inspector Modal for active tab
 */
async function openCookiesModal(tab) {
  cookiePartitionLabel.textContent = `Partition: ${tab.partition} (${tab.role})`;
  cookieListEl.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">Reading partition cookies...</div>';
  cookieCountLabel.textContent = '';
  openModal(cookieModal);

  if (window.abhiSandbox) {
    const cookies = await window.abhiSandbox.getPartitionCookies(tab.partition);
    renderCookies(cookies);
  }
}

function renderCookies(cookies) {
  cookieCountLabel.textContent = `${cookies.length} Cookies`;
  if (!cookies || cookies.length === 0) {
    cookieListEl.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted);">
        <p>No cookies stored yet in this partition.</p>
      </div>
    `;
    return;
  }

  cookieListEl.innerHTML = cookies.map(c => `
    <div class="cookie-item">
      <div>
        <span class="cookie-name">${escapeHtml(c.name)}</span>
        <span class="cookie-domain" style="margin-left: 8px;">${escapeHtml(c.domain)}</span>
      </div>
      <div style="color: var(--text-muted); font-size: 10px;">
        ${c.secure ? '<span style="color: #10b981;">SECURE</span>' : ''}
        ${c.httpOnly ? '<span style="color: #38bdf8; margin-left: 4px;">HTTP_ONLY</span>' : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Toggle Split View
 */
function toggleSplitView() {
  state.isSplitMode = !state.isSplitMode;
  splitViewBtn.classList.toggle('active', state.isSplitMode);
  webviewContainerEl.classList.toggle('split-mode', state.isSplitMode);

  syncSplitView();

  if (state.isSplitMode) {
    showToast('Dual Role view active', 'info');
  }
}

function syncSplitView() {
  if (!state.isSplitMode) {
    state.tabs.forEach(t => {
      t.tabEl.classList.remove('split-secondary');
      t.webview.classList.remove('split-secondary');
    });
    return;
  }

  const secondaryTab = state.tabs.find(t => t.id !== state.activeTabId) || state.tabs[0];
  state.splitSecondaryTabId = secondaryTab ? secondaryTab.id : null;

  state.tabs.forEach(t => {
    const isSecondary = secondaryTab && t.id === secondaryTab.id;
    t.tabEl.classList.toggle('split-secondary', isSecondary);
    t.webview.classList.toggle('split-secondary', isSecondary);
  });
}

function openModal(modal) {
  if (modal) modal.classList.add('show');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('show');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getActiveTab() {
  return state.tabs.find(t => t.id === state.activeTabId);
}

/**
 * Device Portview Controller & Horizontal Stretch Resizer
 */
function initDevicePortview() {
  if (devicePresetSelect) {
    devicePresetSelect.addEventListener('change', () => {
      const selected = devicePresetSelect.value;
      if (selected === 'custom') return;
      const preset = DEVICE_PRESETS[selected];
      if (preset) {
        setDeviceDimensions(preset.width, preset.height);
      }
    });
  }

  if (deviceRotateBtn) {
    deviceRotateBtn.addEventListener('click', () => {
      const currentW = state.deviceWidth;
      const currentH = state.deviceHeight;
      setDeviceDimensions(currentH, currentW);

      if (devicePresetSelect) {
        let matched = false;
        for (const [key, preset] of Object.entries(DEVICE_PRESETS)) {
          if (preset.width === currentH && preset.height === currentW) {
            devicePresetSelect.value = key;
            matched = true;
            break;
          }
        }
        if (!matched) devicePresetSelect.value = 'custom';
      }
    });
  }

  if (deviceResetBtn) {
    deviceResetBtn.addEventListener('click', () => {
      setDeviceDimensions(393, 852);
      if (devicePresetSelect) {
        devicePresetSelect.value = 'iphone-16';
      }
    });
  }

  if (deviceFitBtn) {
    deviceFitBtn.addEventListener('click', () => {
      const maxW = Math.min(Math.round(webviewContainerEl.clientWidth - 80), 480);
      const maxH = Math.min(Math.round(webviewContainerEl.clientHeight - 80), 880);
      setDeviceDimensions(maxW, maxH);
      if (devicePresetSelect) devicePresetSelect.value = 'custom';
    });
  }

  if (deviceCloseBtn) {
    deviceCloseBtn.addEventListener('click', () => {
      if (state.isPhoneMode) {
        togglePhoneMode();
      }
    });
  }

  setupDeviceResizers();
}

function setDeviceDimensions(width, height) {
  state.deviceWidth = width;
  state.deviceHeight = height;
  webviewContainerEl.style.setProperty('--device-width', `${width}px`);
  webviewContainerEl.style.setProperty('--device-height', `${height}px`);
  if (deviceDimensionBadge) {
    deviceDimensionBadge.textContent = `${width} × ${height} px`;
  }
}

function setupDeviceResizers() {
  const handles = [deviceResizerLeft, deviceResizerRight].filter(Boolean);
  handles.forEach(handle => {
    let isDragging = false;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      document.body.classList.add('resizing-device');

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        window.requestAnimationFrame(() => {
          const containerRect = webviewContainerEl.getBoundingClientRect();
          const centerX = containerRect.left + containerRect.width / 2;
          const distFromCenter = Math.abs(moveEvent.clientX - centerX);
          const newWidth = Math.round(Math.max(280, Math.min(containerRect.width - 60, distFromCenter * 2)));

          state.deviceWidth = newWidth;
          webviewContainerEl.style.setProperty('--device-width', `${newWidth}px`);
          if (deviceDimensionBadge) {
            deviceDimensionBadge.textContent = `${newWidth} × ${state.deviceHeight} px`;
          }
          if (devicePresetSelect) {
            devicePresetSelect.value = 'custom';
          }
        });
      };

      const onMouseUp = () => {
        isDragging = false;
        document.body.classList.remove('resizing-device');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  });
}

/**
 * Gemini AI Button: Direct Redirection to gemini.google.com in an isolated tab
 */
function initGeminiCopilot() {
  if (geminiBtn) {
    geminiBtn.addEventListener('click', () => {
      // Direct redirection to Google Gemini in an isolated tab session
      if (state.tabs.length < MAX_TABS) {
        createTab({ role: 'RoleA', url: 'https://gemini.google.com', activate: true });
      } else {
        const activeTab = getActiveTab();
        if (activeTab?.webview) {
          activeTab.webview.loadURL('https://gemini.google.com');
        } else {
          showToast(`Maximum tab limit (${MAX_TABS}) reached.`, 'warning');
        }
      }
    });
  }

  if (geminiDrawerClose) {
    geminiDrawerClose.addEventListener('click', () => {
      closeGeminiDrawer();
    });
  }

  if (openGeminiTabBtn) {
    openGeminiTabBtn.addEventListener('click', () => {
      if (state.tabs.length < MAX_TABS) {
        createTab({ role: 'Admin', url: 'https://gemini.google.com', activate: true });
        closeGeminiDrawer();
      } else {
        showToast(`Maximum tab limit (${MAX_TABS}) reached.`, 'warning');
      }
    });
  }

  // Quick Prompt Chips
  document.querySelectorAll('.gemini-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      handleGeminiPrompt(prompt);
    });
  });

  // Chat form submit
  if (geminiChatForm) {
    geminiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = geminiChatInput.value.trim();
      if (!query) return;
      geminiChatInput.value = '';
      handleGeminiPrompt(query);
    });
  }
}

function toggleGeminiDrawer() {
  state.isGeminiOpen = !state.isGeminiOpen;
  if (geminiDrawer) {
    geminiDrawer.classList.toggle('open', state.isGeminiOpen);
  }
  if (geminiBtn) {
    geminiBtn.classList.toggle('active', state.isGeminiOpen);
  }
}

function closeGeminiDrawer() {
  state.isGeminiOpen = false;
  if (geminiDrawer) {
    geminiDrawer.classList.remove('open');
  }
  if (geminiBtn) {
    geminiBtn.classList.remove('active');
  }
}

function handleGeminiPrompt(prompt) {
  if (!geminiChatOutput) return;

  // Append User message
  const userMsg = document.createElement('div');
  userMsg.className = 'gemini-msg user';
  userMsg.textContent = prompt;
  geminiChatOutput.appendChild(userMsg);

  // Generate response
  const lower = prompt.toLowerCase();
  let responseHtml = '';

  if (lower.includes('patient') || lower.includes('profile')) {
    const patients = [
      {
        patient_id: 'PT-94021',
        name: 'Aarav Sharma',
        age: 42,
        gender: 'Male',
        blood_group: 'B+',
        vitals: { bp: '128/82 mmHg', heart_rate: '74 bpm', spo2: '98%', temp_f: 98.4 },
        chief_complaint: 'Acute lower back pain radiating to left thigh for 3 days',
        allergies: ['Penicillin', 'Sulfa drugs'],
        current_medications: ['Atorvastatin 20mg OD']
      },
      {
        patient_id: 'PT-94022',
        name: 'Meera Nambiar',
        age: 31,
        gender: 'Female',
        blood_group: 'O+',
        vitals: { bp: '110/70 mmHg', heart_rate: '68 bpm', spo2: '99%', temp_f: 98.6 },
        chief_complaint: 'Persistent dry cough and mild dyspnea on exertion for 1 week',
        allergies: ['Aspirin'],
        current_medications: ['Montelukast 10mg HS']
      },
      {
        patient_id: 'PT-94023',
        name: 'Vikramaditya Rao',
        age: 58,
        gender: 'Male',
        blood_group: 'A+',
        vitals: { bp: '142/90 mmHg', heart_rate: '82 bpm', spo2: '96%', temp_f: 99.1 },
        chief_complaint: 'Type 2 Diabetes routine quarterly evaluation; polyuria and fatigue',
        allergies: ['None known'],
        current_medications: ['Metformin 500mg BD', 'Telmisartan 40mg OD']
      },
      {
        patient_id: 'PT-94024',
        name: 'Pooja Deshmukh',
        age: 26,
        gender: 'Female',
        blood_group: 'AB-',
        vitals: { bp: '116/74 mmHg', heart_rate: '78 bpm', spo2: '99%', temp_f: 98.2 },
        chief_complaint: 'Right ankle sprain following badminton session yesterday evening',
        allergies: ['Ibuprofen'],
        current_medications: ['Paracetamol 650mg SOS']
      },
      {
        patient_id: 'PT-94025',
        name: 'Zameer Khan',
        age: 67,
        gender: 'Male',
        blood_group: 'O-',
        vitals: { bp: '136/84 mmHg', heart_rate: '71 bpm', spo2: '97%', temp_f: 97.9 },
        chief_complaint: 'Bilateral knee osteoarthritis pain aggravating during morning walks',
        allergies: ['Codeine', 'Ciprofloxacin'],
        current_medications: ['Glucosamine 1500mg OD', 'Calcium + Vit D3']
      }
    ];
    responseHtml = `<strong>Generated 5 Synthetic Patient Profiles:</strong><br><pre><code>${escapeHtml(JSON.stringify(patients, null, 2))}</code></pre>`;
  } else if (lower.includes('prescription') || lower.includes('pharmacy') || lower.includes('payload')) {
    const prescriptions = [
      {
        rx_id: 'RX-88401',
        patient_id: 'PT-94021',
        doctor_id: 'DOC-1092',
        timestamp: new Date().toISOString(),
        items: [
          { drug: 'Amoxicillin + Clavulanic Acid', dose: '625mg', frequency: 'TDS (3x/day)', duration_days: 5, instructions: 'After meals' },
          { drug: 'Paracetamol', dose: '650mg', frequency: 'SOS (as needed)', duration_days: 3, instructions: 'Max 3 tablets/day' }
        ],
        contraindication_warnings: ['Patient has documented Penicillin allergy flag! Confirm override before dispense.'],
        refills: 0
      },
      {
        rx_id: 'RX-88402',
        patient_id: 'PT-94023',
        doctor_id: 'DOC-1044',
        timestamp: new Date().toISOString(),
        items: [
          { drug: 'Metformin Hydrochloride (SR)', dose: '1000mg', frequency: 'BD (Morning & Night)', duration_days: 90, instructions: 'With meals' },
          { drug: 'Glimepiride', dose: '1mg', frequency: 'OD (Before breakfast)', duration_days: 90, instructions: 'Monitor for hypoglycemia' }
        ],
        contraindication_warnings: [],
        refills: 2
      },
      {
        rx_id: 'RX-88403',
        patient_id: 'PT-94024',
        doctor_id: 'DOC-1105',
        timestamp: new Date().toISOString(),
        items: [
          { drug: 'Aceclofenac + Serratiopeptidase', dose: '100mg/15mg', frequency: 'BD', duration_days: 5, instructions: 'Post meals' },
          { drug: 'Pantoprazole', dose: '40mg', frequency: 'OD', duration_days: 5, instructions: 'Empty stomach 30m before breakfast' }
        ],
        contraindication_warnings: [],
        refills: 0
      }
    ];
    responseHtml = `<strong>Generated Prescription Test Payloads:</strong><br><pre><code>${escapeHtml(JSON.stringify(prescriptions, null, 2))}</code></pre>`;
  } else if (lower.includes('scenario') || lower.includes('multi-role') || lower.includes('concurrent')) {
    responseHtml = `<strong>8 Concurrent Multi-Role Test Scenarios:</strong>
    <ol style="margin-left: 16px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
      <li><strong>Doctor Consultation & E-Prescription:</strong> Doctor issues prescription in Tab A; Pharmacy immediately verifies realtime inventory sync in Tab B without cookie overlap.</li>
      <li><strong>Patient Booking to Receptionist Check-in:</strong> Patient books slot in Tab C; Receptionist confirms payment and check-in token in Tab D.</li>
      <li><strong>Diagnostic Pathology Lifecycle:</strong> Doctor requests lipid profile; Pathology tab logs specimen barcode, publishes verified PDF, alerting Doctor tab.</li>
      <li><strong>Cross-Partition RBAC Lockdown:</strong> Verify Patient token cannot invoke <code>/api/v1/doctor/records</code> or inspect unauthorized doctor partition headers.</li>
      <li><strong>Concurrent Session Isolation:</strong> Doctor logs out in Tab A; verify Tab B (Patient) and Tab C (Pharmacy) remain completely authenticated with active sessions.</li>
      <li><strong>Dual-Role Split View Race Condition:</strong> Two doctors concurrently modifying patient EHR medical summary; verify optimistic concurrency control (HTTP 409 conflict handling).</li>
      <li><strong>Mobile Responsive Layout Audit:</strong> Switch Tab A to iPhone 16 Pro Max viewport while keeping Tab B in Desktop mode to test responsive breakpoints side-by-side.</li>
      <li><strong>Network Interruption & Token Refresh:</strong> Simulate network offline/online reconnect during concurrent telemetry streaming.</li>
    </ol>`;
  } else if (lower.includes('bug') || lower.includes('report') || lower.includes('bleeding')) {
    responseHtml = `<strong>QA Bug Report Template (Session Bleeding & State Leakage):</strong><br>
    <pre><code>**Issue Title**: [BUG-AUTH] Cross-Partition Session Leakage Between Concurrent Roles
**Severity**: Critical (CVSS 8.8)
**Environment**: Rays OmniDeck v1.0.0 (Chromium sandbox)
**Affected Roles**: Doctor (Partition tab_1) & Patient (Partition tab_2)

**Steps to Reproduce**:
1. Open Tab 1 under Doctor role; authenticate with doctor credentials.
2. Open Tab 2 under Patient role; navigate to patient portal.
3. Refresh Tab 2 and inspect document.cookie / Authorization headers.

**Expected Behavior**:
Tab 1 and Tab 2 must maintain strictly disjoint cookies (Zero partition bleeding via session.fromPartition).

**Actual Behavior**:
[Describe whether state or headers leaked]

**Security Impact**:
High privilege escalation vulnerability if patient acquires doctor bearer tokens.</code></pre>`;
  } else {
    responseHtml = `<strong>Gemini QA Copilot:</strong><br>
    Processed testing query: <em>"${escapeHtml(prompt)}"</em>.<br>
    <div style="margin-top: 6px;">Recommended next step: Use the quick prompt chips above for synthetic EHR data, or click <strong>"Open Full Google Gemini in Isolated Role Tab"</strong> to run unrestricted deep reasoning in a dedicated tab session.</div>`;
  }

  // Append Assistant message
  const assistantMsg = document.createElement('div');
  assistantMsg.className = 'gemini-msg assistant';
  assistantMsg.innerHTML = `
    <span class="gemini-msg-sparkle">✨</span>
    <div class="gemini-msg-text">
      ${responseHtml}
      <div style="margin-top: 8px;">
        <button class="modal-btn" style="padding: 3px 8px; font-size: 10.5px;" onclick="navigator.clipboard.writeText(this.closest('.gemini-msg-text').querySelector('pre')?.innerText || this.closest('.gemini-msg-text').innerText); this.textContent = '✓ Copied!'; setTimeout(() => this.textContent = '📋 Copy Payload', 1500);">📋 Copy Payload</button>
      </div>
    </div>
  `;
  geminiChatOutput.appendChild(assistantMsg);
  geminiChatOutput.scrollTop = geminiChatOutput.scrollHeight;
}

/**
 * Auto-Updater Controller & Notification Banner
 */
function initAutoUpdater() {
  if (!window.abhiSandbox) return;

  // Manual check for updates button in toolbar
  if (checkUpdatesBtn) {
    checkUpdatesBtn.addEventListener('click', async () => {
      checkUpdatesBtn.classList.add('loading');
      showToast('Checking GitHub repository for updates...', 'info');

      try {
        const res = await window.abhiSandbox.checkForUpdates();
        checkUpdatesBtn.classList.remove('loading');

        if (res?.status === 'dev-mode') {
          showToast(`Development Mode: Running v${res.version || '1.0.0'}. Updates check GitHub Releases in packaged builds.`, 'info');
        } else if (res?.status === 'error') {
          showToast(`Update Check: ${res.error || 'Unable to connect to GitHub'}`, 'warning');
        }
      } catch (err) {
        checkUpdatesBtn.classList.remove('loading');
        showToast(`Update Check Error: ${err.message}`, 'warning');
      }
    });
  }

  // Dismiss button on banner
  if (updateDismissBtn) {
    updateDismissBtn.addEventListener('click', () => {
      if (updateBanner) updateBanner.style.display = 'none';
    });
  }

  // Restart & Install button
  if (updateRestartBtn) {
    updateRestartBtn.addEventListener('click', () => {
      updateRestartBtn.disabled = true;
      updateRestartBtn.textContent = 'Restarting...';
      window.abhiSandbox.restartAndInstallUpdate();
    });
  }

  // Status events forwarded from main process autoUpdater
  window.abhiSandbox.onUpdaterStatus((data) => {
    console.log('[Updater Event]', data);

    if (data.status === 'checking') {
      if (checkUpdatesBtn) checkUpdatesBtn.classList.add('loading');
    } else if (data.status === 'available') {
      if (checkUpdatesBtn) checkUpdatesBtn.classList.remove('loading');
      if (updateBadgeDot) updateBadgeDot.style.display = 'block';

      if (updateBanner) {
        updateBannerTitle.textContent = `Downloading Update v${data.version || ''}...`;
        updateBannerDesc.textContent = 'Downloading the latest version in the background...';
        if (updateProgressBarWrap) updateProgressBarWrap.style.display = 'block';
        if (updateRestartBtn) updateRestartBtn.style.display = 'none';
        updateBanner.style.display = 'flex';
      }
    } else if (data.status === 'up-to-date') {
      if (checkUpdatesBtn) checkUpdatesBtn.classList.remove('loading');
      showToast(`Rays OmniDeck is up to date (v${data.version || '1.0.0'}).`, 'success');
    } else if (data.status === 'downloaded') {
      if (checkUpdatesBtn) checkUpdatesBtn.classList.remove('loading');
      if (updateBadgeDot) updateBadgeDot.style.display = 'block';

      if (updateBanner) {
        updateBannerTitle.textContent = `🚀 Update Ready (v${data.version})!`;
        updateBannerDesc.textContent = 'A new version has been downloaded. Restart the browser to apply it.';
        if (updateProgressBarWrap) updateProgressBarWrap.style.display = 'none';
        if (updateRestartBtn) {
          updateRestartBtn.style.display = 'inline-flex';
          updateRestartBtn.textContent = 'Restart to Update';
          updateRestartBtn.disabled = false;
        }
        updateBanner.style.display = 'flex';
      }

      showToast(`Update v${data.version} ready! Click Restart to Update.`, 'success');
    } else if (data.status === 'error') {
      if (checkUpdatesBtn) checkUpdatesBtn.classList.remove('loading');
      console.warn('[AutoUpdater] Remote check:', data.error);
    }
  });

  // Progress events during download
  window.abhiSandbox.onUpdaterProgress((data) => {
    if (updateProgressBarFill && data.percent !== undefined) {
      updateProgressBarFill.style.width = `${data.percent}%`;
    }
    if (updateBannerDesc && data.percent !== undefined) {
      updateBannerDesc.textContent = `Downloading update: ${data.percent}% complete...`;
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
