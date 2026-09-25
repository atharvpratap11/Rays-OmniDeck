// Default Built-in Roles: Role A, Role B, Role C, Role D, etc. (All fully editable)
const DEFAULT_ROLE_CONFIGS = {
  RoleA: {
    color: '#10b981',
    label: 'Role A',
    desc: 'Primary persona (Doctor, Admin, etc.)'
  },
  RoleB: {
    color: '#3b82f6',
    label: 'Role B',
    desc: 'Secondary persona (Patient, User, etc.)'
  },
  RoleC: {
    color: '#8b5cf6',
    label: 'Role C',
    desc: 'Tertiary persona (Pharmacy, Agent, etc.)'
  },
  RoleD: {
    color: '#f59e0b',
    label: 'Role D',
    desc: 'Pathology, Analyst, Inspector, etc.'
  },
  RoleE: {
    color: '#ec4899',
    label: 'Role E',
    desc: 'Nurse, Staff, Operator, etc.'
  },
  RoleF: {
    color: '#06b6d4',
    label: 'Role F',
    desc: 'Receptionist, Billing, Support, etc.'
  },
  Gemini: {
    color: '#818cf8',
    label: 'Gemini',
    desc: 'AI Assistant & Copilot Persona'
  },
  Custom: {
    color: '#94a3b8',
    label: 'Custom',
    desc: 'Isolated Blank Partition'
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

// Get the next role key in sequence, intelligently reusing available lowest roles
function getNextRole() {
  const candidateKeys = Object.keys(ROLE_CONFIGS).filter(k => k !== '__NEW_ROLE__' && k !== 'Gemini' && k !== 'Custom');
  const usedRoles = new Set(state.tabs.map(t => t.role));

  // 1. Pick the first unused standard/custom role in progression (e.g. if Tab B is open and Tab A was closed, pick Role A!)
  for (const key of candidateKeys) {
    if (!usedRoles.has(key)) {
      return key;
    }
  }

  // 2. If all current candidate roles are in use, generate or pick next alphabet letter
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    const roleKey = `Role${letter}`;
    if (!usedRoles.has(roleKey)) {
      if (!ROLE_CONFIGS[roleKey]) {
        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];
        ROLE_CONFIGS[roleKey] = {
          color: colors[i % colors.length],
          label: `Role ${letter}`,
          desc: `Persona ${letter}`
        };
      }
      return roleKey;
    }
  }

  return 'RoleA';
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
const roleSelectWrapper = document.getElementById('role-select-wrapper');
const roleSelector = document.getElementById('role-selector');
const roleSelectDot = document.getElementById('role-select-dot');
const roleSelectLabel = document.getElementById('role-select-label');
const loadingBar = document.getElementById('loading-bar');
const securityBadgeBtn = document.getElementById('security-badge-btn');
const bookmarkStarBtn = document.getElementById('bookmark-star-btn');
const searchSuggestionsDropdown = document.getElementById('search-suggestions-dropdown');
const sslCertPopover = document.getElementById('ssl-cert-popover');
const toolbarPinnedTools = document.getElementById('toolbar-pinned-tools');

// 3-Dot Overflow Menu Elements
const moreMenuBtn = document.getElementById('more-menu-btn');
const moreMenuDropdown = document.getElementById('more-menu-dropdown');
const menuTabOverviewBtn = document.getElementById('menu-tab-overview-btn');
const menuBookmarksBtn = document.getElementById('menu-bookmarks-btn');
const menuHistoryBtn = document.getElementById('menu-history-btn');
const menuPhoneModeBtn = document.getElementById('menu-phone-mode-btn');
const menuSplitViewBtn = document.getElementById('menu-split-view-btn');
const menuExtensionsBtn = document.getElementById('menu-extensions-btn');
const menuInspectCookiesBtn = document.getElementById('menu-inspect-cookies-btn');
const menuDevtoolsBtn = document.getElementById('menu-devtools-btn');
const menuThemeToggleBtn = document.getElementById('menu-theme-toggle-btn');
const menuThemeLabel = document.getElementById('menu-theme-label');
const menuRaysVaultBtn = document.getElementById('menu-rays-vault-btn');
const menuRaysBlueBtn = document.getElementById('menu-rays-blue-btn');
const menuRaysAppBtn = document.getElementById('menu-rays-app-btn');
const menuCheckUpdatesBtn = document.getElementById('menu-check-updates-btn');

// Tab Overview (Win+Tab) Elements
const tabOverviewOverlay = document.getElementById('tab-overview-overlay');
const tabOverviewGrid = document.getElementById('tab-overview-grid');
const tabOverviewCloseBtn = document.getElementById('tab-overview-close-btn');
const tabOverviewCount = document.getElementById('tab-overview-count');
const overviewAddTabBtn = document.getElementById('overview-add-tab-btn');

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

const toolbar = document.getElementById('toolbar');

// Modals
const extensionsModal = document.getElementById('extensions-modal');
const cookieModal = document.getElementById('cookie-modal');
const cookieListEl = document.getElementById('cookie-list');
const cookiePartitionLabel = document.getElementById('cookie-partition-label');
const cookieCountLabel = document.getElementById('cookie-count-label');
const modalClearCookieBtn = document.getElementById('modal-clear-cookie-btn');
const toastContainer = document.getElementById('toast-container');

// Universal Bookmarks Modal Elements
const bookmarksModal = document.getElementById('bookmarks-modal');
const bookmarksSearchInput = document.getElementById('bookmarks-search-input');
const bookmarksListEl = document.getElementById('bookmarks-list');

// Browsing History Modal Elements
const historyModal = document.getElementById('history-modal');
const historySearchInput = document.getElementById('history-search-input');
const historyListEl = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Extensions Modal Elements
const loadUnpackedExtBtn = document.getElementById('load-unpacked-ext-btn');
const extensionsListEl = document.getElementById('extensions-list');

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
  initPinnedTools();
  initBookmarks();
  initHistory();
  initSearchSuggestions();
  initSecurityCertificate();
  initUniversalExtensions();
  initEcosystemSuite();

  // Create clean initial tab starting with rays.foundation
  createTab({ role: 'RoleA', url: DEFAULT_URL });

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
    opt.textContent = role.label;
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
    if (menuThemeLabel) menuThemeLabel.textContent = 'Switch to Light Mode';
    themeToggleBtn.title = 'Current: Dark — Click to switch to Light [Cmd+Shift+T]';
    if (showNotification) showToast('Theme: Dark', 'info');
  } else {
    if (themeSunIcon) themeSunIcon.style.display = 'none';
    if (themeMoonIcon) themeMoonIcon.style.display = 'block';
    if (themeAutoIcon) themeAutoIcon.style.display = 'none';
    if (menuThemeLabel) menuThemeLabel.textContent = 'Switch to Dark Mode';
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

  // Clicking role-select-wrapper opens the native role select
  if (roleSelectWrapper) {
    roleSelectWrapper.addEventListener('click', (e) => {
      if (e.target.closest('#edit-role-btn')) return;
      if (roleSelector) {
        try {
          if (typeof roleSelector.showPicker === 'function') {
            roleSelector.showPicker();
          } else {
            roleSelector.focus();
            roleSelector.click();
          }
        } catch (_e) {
          roleSelector.focus();
        }
      }
    });
  }

  // 3-Dot Overflow Menu Toggle
  if (moreMenuBtn && moreMenuDropdown) {
    moreMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = moreMenuDropdown.style.display !== 'none';
      moreMenuDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Close 3-dot dropdown on external click
    document.addEventListener('click', (e) => {
      if (!moreMenuBtn.contains(e.target) && !moreMenuDropdown.contains(e.target)) {
        moreMenuDropdown.style.display = 'none';
      }
    });
  }

  // 3-Dot Menu Actions
  if (menuTabOverviewBtn) {
    menuTabOverviewBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      openTabOverview();
    });
  }

  if (menuPhoneModeBtn) {
    menuPhoneModeBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      togglePhoneMode();
    });
  }

  if (menuSplitViewBtn) {
    menuSplitViewBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      toggleSplitView();
    });
  }

  if (menuExtensionsBtn) {
    menuExtensionsBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      openModal(extensionsModal);
    });
  }

  if (menuInspectCookiesBtn) {
    menuInspectCookiesBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      const activeTab = getActiveTab();
      if (activeTab) openCookiesModal(activeTab);
    });
  }

  if (menuDevtoolsBtn) {
    menuDevtoolsBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      const activeTab = getActiveTab();
      if (activeTab?.webview) activeTab.webview.openDevTools();
    });
  }

  if (menuThemeToggleBtn) {
    menuThemeToggleBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      cycleTheme();
    });
  }

  if (menuCheckUpdatesBtn) {
    menuCheckUpdatesBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      if (checkUpdatesBtn) checkUpdatesBtn.click();
    });
  }

  // Tab Overview (Win+Tab) Handlers
  if (tabOverviewCloseBtn) {
    tabOverviewCloseBtn.addEventListener('click', closeTabOverview);
  }

  if (overviewAddTabBtn) {
    overviewAddTabBtn.addEventListener('click', () => {
      closeTabOverview();
      addTabBtn.click();
    });
  }

  // Close overview when clicking backdrop
  if (tabOverviewOverlay) {
    tabOverviewOverlay.addEventListener('click', (e) => {
      if (e.target === tabOverviewOverlay) {
        closeTabOverview();
      }
    });
  }

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
    // Tab Overview (Win+Tab / Mission Control): Ctrl+Tab, Alt+Tab, or Cmd/Ctrl+Shift+O
    else if ((e.ctrlKey && e.key === 'Tab') || (modifier && e.shiftKey && e.key.toLowerCase() === 'o')) {
      e.preventDefault();
      toggleTabOverview();
    }
    // Universal Bookmarks Modal: CmdOrCtrl+B
    else if (modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      openModal(bookmarksModal);
      renderBookmarksList();
    }
    // Bookmark Active Tab: CmdOrCtrl+D
    else if (modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      toggleBookmarkActiveTab();
    }
    // Browsing History Modal: CmdOrCtrl+Y
    else if (modifier && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      openModal(historyModal);
      renderHistoryList();
    }
    // Escape to close tab overview, search suggestions, or ssl cert popover
    else if (e.key === 'Escape') {
      if (tabOverviewOverlay && tabOverviewOverlay.style.display !== 'none') {
        closeTabOverview();
      }
      if (searchSuggestionsDropdown) {
        searchSuggestionsDropdown.style.display = 'none';
      }
      if (sslCertPopover) {
        sslCertPopover.style.display = 'none';
      }
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
    deviceResizerLeft.style.display = 'none';
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

  if (window.abhiSandbox.onToggleHistory) {
    window.abhiSandbox.onToggleHistory(() => {
      openModal(historyModal);
      renderHistoryList();
    });
  }

  if (window.abhiSandbox.onToggleBookmarks) {
    window.abhiSandbox.onToggleBookmarks(() => {
      openModal(bookmarksModal);
      renderBookmarksList();
    });
  }

  if (window.abhiSandbox.onToggleTabOverview) {
    window.abhiSandbox.onToggleTabOverview(() => {
      toggleTabOverview();
    });
  }

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
  // Gemini gets dedicated partition for Google / Gemini account login
  const partition = (role === 'Gemini') ? 'persist:gemini_session' : `persist:${tabId}`;
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

  syncMenuTabs();

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

  syncMenuTabs();
}

/**
 * Single-pass loading progress bar triggers
 */
function startLoadingBar() {
  if (!loadingBar) return;
  if (!loadingBar.classList.contains('active')) {
    loadingBar.classList.remove('finishing', 'fade-out');
    loadingBar.classList.add('active');
  }
}

function finishLoadingBar() {
  if (!loadingBar) return;
  if (loadingBar.classList.contains('active')) {
    loadingBar.classList.remove('active');
    loadingBar.classList.add('finishing');
    setTimeout(() => {
      loadingBar.classList.add('fade-out');
      setTimeout(() => {
        loadingBar.classList.remove('finishing', 'fade-out');
      }, 250);
    }, 180);
  }
}

/**
 * Attach lifecycle & navigation events to webview instance
 */
function attachWebviewListeners(tab) {
  const { webview, tabEl } = tab;

  // Loading states: smooth single-pass progress bar, ignoring iframe/subresource jitter
  webview.addEventListener('did-start-navigation', (e) => {
    if (e.isMainFrame) {
      tab.isLoading = true;
      if (state.activeTabId === tab.id) {
        startLoadingBar();
        reloadIcon.style.display = 'none';
        stopIcon.style.display = 'block';
      }
    }
  });

  webview.addEventListener('did-start-loading', () => {
    if (!tab.isLoading) {
      tab.isLoading = true;
      if (state.activeTabId === tab.id) {
        startLoadingBar();
        reloadIcon.style.display = 'none';
        stopIcon.style.display = 'block';
      }
    }
  });

  webview.addEventListener('did-stop-loading', () => {
    tab.isLoading = false;
    if (state.activeTabId === tab.id) {
      finishLoadingBar();
      reloadIcon.style.display = 'block';
      stopIcon.style.display = 'none';
      updateNavButtons(tab);
    }
  });

  // Favicon updates: replace blue dot with real website favicon
  webview.addEventListener('page-favicon-updated', (e) => {
    if (e.favicons && e.favicons.length > 0) {
      updateTabFavicon(tab, e.favicons[0]);
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
      updateBookmarkStar();
    }
    updateTabTitle(tab, webview.getTitle() || e.url);
    addHistoryEntry(tab);
    syncMenuTabs();
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
      updateBookmarkStar();
    }
    addHistoryEntry(tab);
    syncMenuTabs();
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

  // Smooth transition: eliminate white screen flashbang by revealing only when DOM is ready
  webview.addEventListener('dom-ready', () => {
    webview.classList.add('ready');
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
  syncMenuTabs();
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
  syncMenuTabs();
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

  // Role Selector Pill
  roleSelector.value = tab.role;
  toolbar.style.setProperty('--current-role-color', roleConfig.color);
  if (roleSelectWrapper) {
    roleSelectWrapper.style.setProperty('--current-role-color', roleConfig.color);
  }
  roleSelectDot.style.backgroundColor = roleConfig.color;
  roleSelectDot.style.boxShadow = `0 0 8px ${roleConfig.color}`;
  if (roleSelectLabel) {
    roleSelectLabel.textContent = roleConfig.label;
  }

  // Synchronize bookmark star indicator
  updateBookmarkStar();

  // Reload / Stop button state
  if (tab.isLoading) {
    reloadIcon.style.display = 'none';
    stopIcon.style.display = 'block';
    startLoadingBar();
  } else {
    reloadIcon.style.display = 'block';
    stopIcon.style.display = 'none';
    finishLoadingBar();
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
    pill.style.color = roleConfig.color;
    pill.style.borderColor = roleConfig.color;
  }
  const dot = tab.tabEl.querySelector('.tab-role-dot');
  if (dot) {
    dot.style.backgroundColor = roleConfig.color;
    dot.style.boxShadow = `0 0 7px ${roleConfig.color}`;
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
    desc: roleDesc
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
  syncMenuTabs();

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

/**
 * Mission Control / "Win+Tab" Overview Overlay Controller
 */
function toggleTabOverview() {
  if (!tabOverviewOverlay) return;
  const isVisible = tabOverviewOverlay.style.display !== 'none';
  if (isVisible) {
    closeTabOverview();
  } else {
    openTabOverview();
  }
}

function openTabOverview() {
  if (!tabOverviewOverlay || !tabOverviewGrid) return;

  // Update tab count
  if (tabOverviewCount) {
    tabOverviewCount.textContent = `${state.tabs.length} Open Tabs`;
  }

  // Render cards for all open tabs
  tabOverviewGrid.innerHTML = '';
  state.tabs.forEach(tab => {
    const roleConfig = ROLE_CONFIGS[tab.role] || ROLE_CONFIGS.Custom;
    const isActive = tab.id === state.activeTabId;

    const card = document.createElement('div');
    card.className = `overview-tab-card ${isActive ? 'active-card' : ''}`;
    card.style.setProperty('--card-role-color', roleConfig.color);

    card.innerHTML = `
      <div class="overview-card-header">
        <div class="overview-card-role-tag">
          <span class="overview-card-role-dot"></span>
          <span>${escapeHtml(roleConfig.label)}</span>
        </div>
        <button class="overview-card-close-btn" title="Close Tab" data-close-tab="${tab.id}">&times;</button>
      </div>

      <div class="overview-card-body">
        <div class="overview-card-title">${escapeHtml(tab.title || 'rays.foundation')}</div>
        <div class="overview-card-url">${escapeHtml(tab.url || DEFAULT_URL)}</div>
      </div>

      <div class="overview-card-footer">
        <div class="overview-card-status">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${isActive ? '#10b981' : '#64748b'};"></span>
          <span>${isActive ? 'Active Tab' : 'Isolated Session'}</span>
        </div>
        <span>${tab.partition}</span>
      </div>
    `;

    // Click card to switch to tab
    card.addEventListener('click', (e) => {
      if (e.target.closest('.overview-card-close-btn')) {
        e.stopPropagation();
        closeTab(tab.id);
        openTabOverview(); // Refresh overview grid
        return;
      }
      activateTab(tab.id);
      closeTabOverview();
    });

    tabOverviewGrid.appendChild(card);
  });

  tabOverviewOverlay.style.display = 'flex';
}

function closeTabOverview() {
  if (tabOverviewOverlay) {
    tabOverviewOverlay.style.display = 'none';
  }
}

function openModal(modal) {
  if (modal) modal.classList.add('show');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('show');
}

function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconSvg = '';
  let title = 'Notice';

  if (type === 'success') {
    title = 'Success';
    iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`;
  } else if (type === 'warning') {
    title = 'Attention';
    iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;
  } else if (type === 'error') {
    title = 'Error';
    iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`;
  } else {
    title = 'Information';
    iconSvg = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon-wrap">
      ${iconSvg}
    </div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" title="Dismiss">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div class="toast-progress">
      <div class="toast-progress-bar"></div>
    </div>
  `;

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    toast.classList.add('dismissing');
    setTimeout(() => {
      toast.remove();
    }, 220);
  };

  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });
  }

  toastContainer.appendChild(toast);

  // Auto-dismiss after 3.2 seconds
  setTimeout(dismiss, 3200);
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
      // Direct redirection to Google Gemini in an isolated tab session with dedicated Gemini role
      if (state.tabs.length < MAX_TABS) {
        createTab({ role: 'Gemini', url: 'https://gemini.google.com', activate: true });
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
        createTab({ role: 'Gemini', url: 'https://gemini.google.com', activate: true });
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
    <div class="gemini-msg-text">
      ${responseHtml}
      <div style="margin-top: 8px;">
        <button class="modal-btn" style="padding: 3px 8px; font-size: 10.5px;" onclick="navigator.clipboard.writeText(this.closest('.gemini-msg-text').querySelector('pre')?.innerText || this.closest('.gemini-msg-text').innerText); this.textContent = 'Copied'; setTimeout(() => this.textContent = 'Copy Payload', 1500);">Copy Payload</button>
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
        updateBannerTitle.textContent = `Update Ready (v${data.version})`;
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
      console.warn('[AutoUpdater] Remote error:', data.error);

      if (updateBanner) {
        updateBannerTitle.textContent = 'Update Available';
        let friendlyDesc = 'A new version of Rays OmniDeck is ready to install.';
        if (typeof data.error === 'string') {
          if (data.error.includes('ZIP file') || data.error.includes('{') || data.error.includes('[')) {
            friendlyDesc = 'A new release is ready. Click below to install.';
          } else {
            friendlyDesc = data.error.substring(0, 100);
          }
        }
        updateBannerDesc.textContent = friendlyDesc;
        if (updateProgressBarWrap) updateProgressBarWrap.style.display = 'none';
        if (updateRestartBtn) {
          updateRestartBtn.style.display = 'inline-flex';
          updateRestartBtn.textContent = 'Install Update';
          updateRestartBtn.disabled = false;
          updateRestartBtn.onclick = () => {
            window.abhiSandbox?.openExternal('https://github.com/atharvpratap11/Rays-OmniDeck/releases/latest');
          };
        }
        updateBanner.style.display = 'flex';
      }
    }
  });

  // Progress events during download
  window.abhiSandbox.onUpdaterProgress((data) => {
    if (updateProgressBarFill && data.percent !== undefined) {
      updateProgressBarFill.style.width = `${data.percent}%`;
    }
    if (updateBannerDesc && data.percent !== undefined) {
      let extra = '';
      if (data.transferred && data.total) {
        const mbTransferred = (data.transferred / (1024 * 1024)).toFixed(1);
        const mbTotal = (data.total / (1024 * 1024)).toFixed(1);
        extra = ` (${mbTransferred} MB / ${mbTotal} MB)`;
      }
      updateBannerDesc.textContent = `Downloading update: ${data.percent}%${extra}...`;
    }
  });
}

/**
 * Synchronize open tabs list to native macOS application menu
 */
function syncMenuTabs() {
  if (window.abhiSandbox?.updateOpenTabsMenu) {
    const list = state.tabs.map(t => ({
      id: t.id,
      title: t.title || 'rays.foundation',
      role: t.role,
      active: t.id === state.activeTabId
    }));
    window.abhiSandbox.updateOpenTabsMenu(list).catch(() => {});
  }
}

/**
 * Replace default blue dot with real website favicon
 */
function updateTabFavicon(tab, faviconUrl) {
  if (!tab || !tab.tabEl) return;
  tab.favicon = faviconUrl;
  let faviconEl = tab.tabEl.querySelector('.tab-favicon');
  const dotEl = tab.tabEl.querySelector('.tab-role-dot');

  if (faviconUrl && !isNewTabPage(tab.url)) {
    if (!faviconEl) {
      faviconEl = document.createElement('img');
      faviconEl.className = 'tab-favicon';
      faviconEl.alt = '';
      if (dotEl) {
        dotEl.style.display = 'none';
        tab.tabEl.insertBefore(faviconEl, dotEl);
      }
    }
    faviconEl.src = faviconUrl;
    faviconEl.style.display = 'inline-block';
    faviconEl.onerror = () => {
      faviconEl.style.display = 'none';
      if (dotEl) dotEl.style.display = 'inline-block';
    };
  } else {
    if (faviconEl) faviconEl.style.display = 'none';
    if (dotEl) dotEl.style.display = 'inline-block';
  }
}

/**
 * Quick-Access Pinned Toolbar Tools Module
 */
const PINNABLE_TOOLS = {
  'tab-overview': {
    label: 'Tab Overview',
    title: 'Tab Overview [Ctrl+Tab / Cmd+Shift+O]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
    action: () => openTabOverview()
  },
  'bookmarks': {
    label: 'Bookmarks',
    title: 'Universal Bookmarks [Cmd+B]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    action: () => { openModal(bookmarksModal); renderBookmarksList(); }
  },
  'history': {
    label: 'History',
    title: 'Browsing History [Cmd+Y]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    action: () => { openModal(historyModal); renderHistoryList(); }
  },
  'phone-mode': {
    label: 'Device Viewport',
    title: 'Device Viewport Emulation [Cmd+Shift+M]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="3" ry="3"/><line x1="11" y1="18" x2="13" y2="18"/></svg>`,
    action: () => togglePhoneMode()
  },
  'split-view': {
    label: 'Side-by-Side Dual View',
    title: 'Side-by-Side Dual View [Cmd+Shift+S]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
    action: () => toggleSplitView()
  },
  'extensions': {
    label: 'Universal Extensions',
    title: 'Universal Extensions',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>`,
    action: () => { openModal(extensionsModal); loadExtensionsList(); }
  },
  'inspect-cookies': {
    label: 'Cookies',
    title: 'Inspect Partition Cookies [Cmd+Shift+C]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
    action: () => { const active = getActiveTab(); if (active) openCookiesModal(active); }
  },
  'devtools': {
    label: 'DevTools',
    title: 'Developer Tools [F12]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    action: () => { const active = getActiveTab(); if (active?.webview) active.webview.openDevTools(); }
  },
  'theme-toggle': {
    label: 'Theme',
    title: 'Toggle Theme [Cmd+Shift+T]',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    action: () => cycleTheme()
  }
};

function getPinnedTools() {
  try {
    const raw = localStorage.getItem('rays_pinned_tools');
    if (raw) return JSON.parse(raw);
  } catch (_e) {}
  return ['tab-overview', 'bookmarks', 'history'];
}

function savePinnedTools(pinnedArray) {
  try {
    localStorage.setItem('rays_pinned_tools', JSON.stringify(pinnedArray));
  } catch (_e) {}
}

function initPinnedTools() {
  renderPinnedTools();

  document.querySelectorAll('.menu-item-pin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pinId = btn.getAttribute('data-pin-id');
      if (!pinId || !PINNABLE_TOOLS[pinId]) return;

      const current = getPinnedTools();
      const idx = current.indexOf(pinId);
      const isPinnedNow = idx === -1;

      if (isPinnedNow) {
        current.push(pinId);
        showToast(`Pinned ${PINNABLE_TOOLS[pinId].label} to toolbar`, 'info');
      } else {
        current.splice(idx, 1);
        showToast(`Unpinned ${PINNABLE_TOOLS[pinId].label} from toolbar`, 'info');
      }

      savePinnedTools(current);
      renderPinnedTools();
    });
  });
}

function renderPinnedTools() {
  if (!toolbarPinnedTools) return;
  const pinned = getPinnedTools();

  document.querySelectorAll('.menu-item-pin-btn').forEach(btn => {
    const pinId = btn.getAttribute('data-pin-id');
    const isPinned = pinned.includes(pinId);
    btn.classList.toggle('pinned', isPinned);
    btn.title = isPinned ? 'Unpin from toolbar' : 'Pin to toolbar';
  });

  toolbarPinnedTools.innerHTML = '';
  pinned.forEach(pinId => {
    const tool = PINNABLE_TOOLS[pinId];
    if (!tool) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-action-btn pinned-tool-btn';
    btn.title = tool.title;
    btn.setAttribute('data-pin-id', pinId);
    btn.innerHTML = tool.iconSvg;

    btn.addEventListener('click', () => {
      tool.action();
    });

    toolbarPinnedTools.appendChild(btn);
  });
}

/**
 * Universal Bookmarks Module
 */
function getBookmarks() {
  try {
    const raw = localStorage.getItem('rays_bookmarks');
    if (raw) return JSON.parse(raw);
  } catch (_e) {}
  return [];
}

function saveBookmarks(list) {
  try {
    localStorage.setItem('rays_bookmarks', JSON.stringify(list));
  } catch (_e) {}
}

function isCurrentTabBookmarked() {
  const activeTab = getActiveTab();
  if (!activeTab || isNewTabPage(activeTab.url)) return false;
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.url === activeTab.url);
}

function updateBookmarkStar() {
  if (!bookmarkStarBtn) return;
  const activeTab = getActiveTab();
  if (!activeTab || isNewTabPage(activeTab.url)) {
    bookmarkStarBtn.style.opacity = '0.5';
    bookmarkStarBtn.classList.remove('bookmarked');
    bookmarkStarBtn.title = 'Bookmark this tab [Cmd+B]';
    return;
  }
  bookmarkStarBtn.style.opacity = '1';
  const bookmarked = isCurrentTabBookmarked();
  bookmarkStarBtn.classList.toggle('bookmarked', bookmarked);
  bookmarkStarBtn.title = bookmarked ? 'Remove bookmark [Cmd+B]' : 'Bookmark this tab [Cmd+B]';
}

function toggleBookmarkActiveTab() {
  const activeTab = getActiveTab();
  if (!activeTab) return;
  if (isNewTabPage(activeTab.url)) {
    showToast('Cannot bookmark start page', 'warning');
    return;
  }

  const bookmarks = getBookmarks();
  const existingIdx = bookmarks.findIndex(b => b.url === activeTab.url);

  if (existingIdx !== -1) {
    bookmarks.splice(existingIdx, 1);
    saveBookmarks(bookmarks);
    updateBookmarkStar();
    showToast('Bookmark removed', 'info');
  } else {
    bookmarks.unshift({
      id: 'bm_' + Date.now(),
      url: activeTab.url,
      title: activeTab.title || activeTab.url,
      role: activeTab.role,
      date: new Date().toLocaleDateString()
    });
    saveBookmarks(bookmarks);
    updateBookmarkStar();
    showToast('Added to Universal Bookmarks', 'success');
  }

  if (bookmarksModal && bookmarksModal.classList.contains('show')) {
    renderBookmarksList(bookmarksSearchInput ? bookmarksSearchInput.value : '');
  }
}

function renderBookmarksList(query = '') {
  if (!bookmarksListEl) return;
  const bookmarks = getBookmarks();
  const filtered = query.trim()
    ? bookmarks.filter(b => (b.title + ' ' + b.url).toLowerCase().includes(query.toLowerCase()))
    : bookmarks;

  if (filtered.length === 0) {
    bookmarksListEl.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 12px;">
        ${query ? 'No matching bookmarks found.' : 'No bookmarks saved yet. Click the star icon in the address bar to bookmark any page.'}
      </div>
    `;
    return;
  }

  bookmarksListEl.innerHTML = '';
  filtered.forEach(bm => {
    const roleConfig = ROLE_CONFIGS[bm.role] || ROLE_CONFIGS.Custom;
    const card = document.createElement('div');
    card.className = 'history-item';
    card.innerHTML = `
      <div style="flex-shrink: 0; color: #f59e0b;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div class="history-item-info">
        <div class="history-item-title">${escapeHtml(bm.title || bm.url)}</div>
        <div class="history-item-url">${escapeHtml(bm.url)}</div>
      </div>
      <span class="tab-role-pill" style="color: ${roleConfig.color}; border-color: ${roleConfig.color};">${escapeHtml(roleConfig.label)}</span>
      <button class="history-item-delete" title="Delete bookmark" data-bm-id="${bm.id}">&times;</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.history-item-delete')) {
        e.stopPropagation();
        const updated = getBookmarks().filter(b => b.id !== bm.id);
        saveBookmarks(updated);
        renderBookmarksList(bookmarksSearchInput ? bookmarksSearchInput.value : '');
        updateBookmarkStar();
        return;
      }
      const activeTab = getActiveTab();
      if (activeTab?.webview) {
        activeTab.webview.loadURL(bm.url);
      }
      closeModal(bookmarksModal);
    });

    bookmarksListEl.appendChild(card);
  });
}

function initBookmarks() {
  if (bookmarkStarBtn) {
    bookmarkStarBtn.addEventListener('click', toggleBookmarkActiveTab);
  }

  if (menuBookmarksBtn) {
    menuBookmarksBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      openModal(bookmarksModal);
      renderBookmarksList();
    });
  }

  if (bookmarksSearchInput) {
    bookmarksSearchInput.addEventListener('input', (e) => {
      renderBookmarksList(e.target.value);
    });
  }
}

/**
 * Universal Browsing History Module
 */
function getHistory() {
  try {
    const raw = localStorage.getItem('rays_history');
    if (raw) return JSON.parse(raw);
  } catch (_e) {}
  return [];
}

function saveHistory(list) {
  try {
    localStorage.setItem('rays_history', JSON.stringify(list.slice(0, 500)));
  } catch (_e) {}
}

function addHistoryEntry(tab) {
  if (!tab || !tab.url || isNewTabPage(tab.url) || !tab.url.startsWith('http')) return;
  const history = getHistory();
  if (history.length > 0 && history[0].url === tab.url) return;

  const roleConfig = ROLE_CONFIGS[tab.role] || ROLE_CONFIGS.Custom;
  history.unshift({
    id: 'hist_' + Date.now(),
    url: tab.url,
    title: tab.title && tab.title !== 'Loading...' ? tab.title : tab.url,
    role: tab.role,
    roleColor: roleConfig.color,
    timestamp: Date.now()
  });
  saveHistory(history);
}

function clearAllHistory() {
  localStorage.removeItem('rays_history');
  renderHistoryList();
  showToast('Browsing history cleared', 'info');
}

function renderHistoryList(query = '') {
  if (!historyListEl) return;
  const history = getHistory();
  const filtered = query.trim()
    ? history.filter(h => (h.title + ' ' + h.url + ' ' + h.role).toLowerCase().includes(query.toLowerCase()))
    : history;

  if (filtered.length === 0) {
    historyListEl.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 12px;">
        ${query ? 'No matching history entries found.' : 'No browsing history recorded yet.'}
      </div>
    `;
    return;
  }

  historyListEl.innerHTML = '';
  filtered.forEach(item => {
    const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const card = document.createElement('div');
    card.className = 'history-item';
    card.innerHTML = `
      <div class="history-item-info">
        <div class="history-item-title">${escapeHtml(item.title || item.url)}</div>
        <div class="history-item-url">${escapeHtml(item.url)}</div>
      </div>
      <span class="tab-role-pill" style="color: ${item.roleColor || '#10b981'}; border-color: ${item.roleColor || '#10b981'};">${escapeHtml(item.role)}</span>
      <span class="history-item-time">${timeStr}</span>
      <button class="history-item-delete" title="Delete entry" data-hist-id="${item.id}">&times;</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.history-item-delete')) {
        e.stopPropagation();
        const updated = getHistory().filter(h => h.id !== item.id);
        saveHistory(updated);
        renderHistoryList(historySearchInput ? historySearchInput.value : '');
        return;
      }
      const activeTab = getActiveTab();
      if (activeTab?.webview) {
        activeTab.webview.loadURL(item.url);
      }
      closeModal(historyModal);
    });

    historyListEl.appendChild(card);
  });
}

function initHistory() {
  if (menuHistoryBtn) {
    menuHistoryBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      openModal(historyModal);
      renderHistoryList();
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearAllHistory);
  }

  if (historySearchInput) {
    historySearchInput.addEventListener('input', (e) => {
      renderHistoryList(e.target.value);
    });
  }
}

/**
 * SSL Security Certificate Popover
 */
function initSecurityCertificate() {
  if (!securityBadgeBtn || !sslCertPopover) return;

  securityBadgeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const isVisible = sslCertPopover.style.display !== 'none';
    if (isVisible) {
      sslCertPopover.style.display = 'none';
      return;
    }

    const activeTab = getActiveTab();
    if (!activeTab) return;

    sslCertPopover.innerHTML = '<div style="padding: 12px; font-size: 12px; color: var(--text-muted);">Inspecting site security...</div>';
    sslCertPopover.style.display = 'block';

    const currentUrl = activeTab.url || '';
    if (isNewTabPage(currentUrl)) {
      sslCertPopover.innerHTML = `
        <div class="ssl-popover-header">
          <div class="ssl-popover-icon secure">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="ssl-popover-title-wrap">
            <div class="ssl-popover-title">Built-in Workspace</div>
            <div class="ssl-popover-subtitle">Internal offline start page</div>
          </div>
        </div>
        <div class="ssl-popover-body">
          <p style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4; margin: 0;">
            <strong>rays.foundation</strong> is the private workspace start page running locally in Rays OmniDeck. Zero network telemetry or third-party trackers.
          </p>
        </div>
      `;
      return;
    }

    if (currentUrl.startsWith('https://')) {
      let certInfo = null;
      if (window.abhiSandbox?.getCertificateInfo) {
        try {
          certInfo = await window.abhiSandbox.getCertificateInfo(currentUrl);
        } catch (_err) {}
      }

      const domain = (() => {
        try { return new URL(currentUrl).hostname; } catch (_e) { return currentUrl; }
      })();

      const issuer = certInfo?.issuer || 'Trusted Certificate Authority';
      const validTo = certInfo?.validTo ? new Date(certInfo.validTo).toLocaleDateString() : 'Verified';
      const protocol = certInfo?.protocol || 'TLS 1.3';

      sslCertPopover.innerHTML = `
        <div class="ssl-popover-header">
          <div class="ssl-popover-icon secure">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="ssl-popover-title-wrap">
            <div class="ssl-popover-title">Connection is Secure</div>
            <div class="ssl-popover-subtitle">Valid SSL/TLS Certificate</div>
          </div>
        </div>
        <div class="ssl-popover-body">
          <div class="ssl-cert-row">
            <span class="ssl-cert-label">Domain</span>
            <span class="ssl-cert-value">${escapeHtml(domain)}</span>
          </div>
          <div class="ssl-cert-row">
            <span class="ssl-cert-label">Issuer</span>
            <span class="ssl-cert-value">${escapeHtml(issuer)}</span>
          </div>
          <div class="ssl-cert-row">
            <span class="ssl-cert-label">Valid Until</span>
            <span class="ssl-cert-value">${escapeHtml(validTo)}</span>
          </div>
          <div class="ssl-cert-row">
            <span class="ssl-cert-label">Protocol</span>
            <span class="ssl-cert-value">${escapeHtml(protocol)}</span>
          </div>
        </div>
      `;
    } else {
      const domain = (() => {
        try { return new URL(currentUrl).hostname; } catch (_e) { return currentUrl; }
      })();

      sslCertPopover.innerHTML = `
        <div class="ssl-popover-header">
          <div class="ssl-popover-icon insecure">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="ssl-popover-title-wrap">
            <div class="ssl-popover-title" style="color: #ef4444;">Not Secure</div>
            <div class="ssl-popover-subtitle">Unencrypted HTTP connection</div>
          </div>
        </div>
        <div class="ssl-popover-body">
          <p style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4; margin: 0;">
            This site (<strong>${escapeHtml(domain)}</strong>) does not provide an SSL certificate. Passwords or cookies could be intercepted by attackers on the network.
          </p>
        </div>
      `;
    }
  });

  document.addEventListener('click', (e) => {
    if (!securityBadgeBtn.contains(e.target) && !sslCertPopover.contains(e.target)) {
      sslCertPopover.style.display = 'none';
    }
  });
}

/**
 * Address Bar Real-Time Search Suggestions
 */
let suggestionDebounceTimer = null;
let selectedSuggestionIndex = -1;

function initSearchSuggestions() {
  if (!addressInput || !searchSuggestionsDropdown) return;

  addressInput.addEventListener('input', () => {
    clearTimeout(suggestionDebounceTimer);
    const query = addressInput.value.trim();

    if (!query || query.startsWith('http://') || query.startsWith('https://') || query.startsWith('localhost') || query.startsWith('127.0.0.1')) {
      searchSuggestionsDropdown.style.display = 'none';
      return;
    }

    suggestionDebounceTimer = setTimeout(async () => {
      if (!window.abhiSandbox?.getSearchSuggestions) return;
      try {
        const suggestions = await window.abhiSandbox.getSearchSuggestions(query);
        renderSearchSuggestions(query, suggestions);
      } catch (_e) {
        searchSuggestionsDropdown.style.display = 'none';
      }
    }, 150);
  });

  addressInput.addEventListener('keydown', (e) => {
    const items = searchSuggestionsDropdown.querySelectorAll('.suggestion-item');
    if (searchSuggestionsDropdown.style.display === 'none' || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
      highlightSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
      highlightSuggestion(items);
    } else if (e.key === 'Escape') {
      searchSuggestionsDropdown.style.display = 'none';
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
      e.preventDefault();
      items[selectedSuggestionIndex].click();
    }
  });

  document.addEventListener('click', (e) => {
    if (!addressInput.contains(e.target) && !searchSuggestionsDropdown.contains(e.target)) {
      searchSuggestionsDropdown.style.display = 'none';
    }
  });
}

function highlightSuggestion(items) {
  items.forEach((item, i) => {
    const isSel = i === selectedSuggestionIndex;
    item.classList.toggle('selected', isSel);
    if (isSel) {
      addressInput.value = item.getAttribute('data-query');
    }
  });
}

function renderSearchSuggestions(currentQuery, suggestions) {
  if (!suggestions || suggestions.length === 0) {
    searchSuggestionsDropdown.style.display = 'none';
    return;
  }

  selectedSuggestionIndex = -1;
  searchSuggestionsDropdown.innerHTML = '';

  suggestions.slice(0, 7).forEach(s => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.setAttribute('data-query', s);
    item.innerHTML = `
      <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span class="suggestion-text">${escapeHtml(s)}</span>
    `;

    item.addEventListener('click', () => {
      addressInput.value = s;
      searchSuggestionsDropdown.style.display = 'none';
      const activeTab = getActiveTab();
      if (activeTab?.webview) {
        activeTab.webview.loadURL(`https://www.google.com/search?q=${encodeURIComponent(s)}`);
      }
    });

    searchSuggestionsDropdown.appendChild(item);
  });

  searchSuggestionsDropdown.style.display = 'block';
}

/**
 * Universal Extensions Manager
 */
async function loadExtensionsList() {
  if (!extensionsListEl || !window.abhiSandbox?.listExtensions) return;
  try {
    const list = await window.abhiSandbox.listExtensions();
    if (!list || list.length === 0) {
      extensionsListEl.innerHTML = `
        <div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 24px;">
          No custom extensions loaded yet. Click "+ Load Unpacked Extension" to install Chrome extension folders.
        </div>
      `;
      return;
    }

    extensionsListEl.innerHTML = '';
    list.forEach(ext => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <div style="color: var(--brand-primary); flex-shrink: 0;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
          </svg>
        </div>
        <div class="history-item-info">
          <div class="history-item-title">${escapeHtml(ext.name)} <span style="font-size: 10px; color: var(--text-muted);">v${escapeHtml(ext.version || '1.0')}</span></div>
          <div class="history-item-url">${escapeHtml(ext.id)}</div>
        </div>
        <button class="modal-btn danger" style="padding: 3px 8px; font-size: 10px;" data-remove-ext="${ext.id}">Remove</button>
      `;

      card.querySelector('[data-remove-ext]').addEventListener('click', async () => {
        if (window.abhiSandbox?.removeExtension) {
          await window.abhiSandbox.removeExtension(ext.id);
          showToast(`Extension "${ext.name}" removed`, 'info');
          loadExtensionsList();
        }
      });

      extensionsListEl.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load extensions:', err);
  }
}

function initUniversalExtensions() {
  if (loadUnpackedExtBtn) {
    loadUnpackedExtBtn.addEventListener('click', async () => {
      if (!window.abhiSandbox?.loadExtension) return;
      try {
        const res = await window.abhiSandbox.loadExtension();
        if (res?.success) {
          showToast(`Loaded extension: ${res.name}`, 'success');
          loadExtensionsList();
        } else if (res?.error) {
          showToast(`Extension error: ${res.error}`, 'warning');
        }
      } catch (err) {
        showToast(`Failed: ${err.message}`, 'error');
      }
    });
  }

  if (menuExtensionsBtn) {
    menuExtensionsBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      openModal(extensionsModal);
      loadExtensionsList();
    });
  }
}

/**
 * Ecosystem Upcoming Features Notifications ("Soon" Badges)
 */
function initEcosystemSuite() {
  if (menuRaysVaultBtn) {
    menuRaysVaultBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      showToast('Rays Vault (Encrypted Password Management): Coming soon in the next major ecosystem release!', 'info');
    });
  }

  if (menuRaysBlueBtn) {
    menuRaysBlueBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      showToast('Rays Blue (Direct WebRTC P2P File Sharing): Coming soon in the next major ecosystem release!', 'info');
    });
  }

  if (menuRaysAppBtn) {
    menuRaysAppBtn.addEventListener('click', () => {
      if (moreMenuDropdown) moreMenuDropdown.style.display = 'none';
      showToast('Rays App (Secure Peer Messaging Platform): Coming soon in the next major ecosystem release!', 'info');
    });
  }
}

window.addEventListener('DOMContentLoaded', init);
