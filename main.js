const { app, BrowserWindow, ipcMain, session, shell, Menu, nativeTheme } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;

// Configure default native theme to follow macOS system setting
nativeTheme.themeSource = 'system';

// Performance, GPU acceleration & low RAM footprint optimizations
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
// Enforce lean memory limit per process to eliminate lag and RAM hoarding
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');

// Standard modern Chrome User Agent (Chrome 133) without Electron token
// Eliminates "Update to Chrome 100+" errors on WhatsApp Web, Netflix, Google Docs, etc.
function getModernChromeUserAgent() {
  if (process.platform === 'darwin') {
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
  } else if (process.platform === 'win32') {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
  } else {
    return 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
  }
}

app.userAgentFallback = getModernChromeUserAgent();

// Centralized keyboard shortcut dispatcher across both main window and guest webviews
function handleShortcutInput(input, event) {
  if (input.type !== 'keyDown') return false;
  const isMac = process.platform === 'darwin';
  const modifier = isMac ? input.meta : input.control;

  // CmdOrCtrl+T: New Tab
  if (modifier && !input.alt && !input.shift && input.key.toLowerCase() === 't') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:new-tab');
    return true;
  }
  // CmdOrCtrl+W: Close Tab
  if (modifier && !input.alt && !input.shift && input.key.toLowerCase() === 'w') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:close-tab');
    return true;
  }
  // CmdOrCtrl+R: Reload active tab (webview, not entire app!)
  if ((modifier && !input.alt && !input.shift && input.key.toLowerCase() === 'r') || input.key === 'F5') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:reload-tab', { force: false });
    return true;
  }
  // CmdOrCtrl+Shift+R: Force reload active tab
  if (modifier && input.shift && input.key.toLowerCase() === 'r') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:reload-tab', { force: true });
    return true;
  }
  // CmdOrCtrl+L: Focus address bar
  if (modifier && !input.alt && !input.shift && input.key.toLowerCase() === 'l') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:focus-url');
    return true;
  }
  // History Navigation: Back (Cmd+[ or Alt+Left)
  if ((isMac && input.meta && input.key === '[') || (input.alt && input.key === 'ArrowLeft')) {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:go-back');
    return true;
  }
  // History Navigation: Forward (Cmd+] or Alt+Right)
  if ((isMac && input.meta && input.key === ']') || (input.alt && input.key === 'ArrowRight')) {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:go-forward');
    return true;
  }
  // Switch to Tab 1-8
  if (modifier && !input.alt && !input.shift && input.key >= '1' && input.key <= '8') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:switch-tab', parseInt(input.key, 10) - 1);
    return true;
  }
  // Switch to Last Tab (CmdOrCtrl+9)
  if (modifier && !input.alt && !input.shift && input.key === '9') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:switch-tab', -1);
    return true;
  }
  // Next Tab: Ctrl+Tab
  if (input.control && !input.shift && input.key === 'Tab') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:navigate-tab', 1);
    return true;
  }
  // Previous Tab: Ctrl+Shift+Tab
  if (input.control && input.shift && input.key === 'Tab') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:navigate-tab', -1);
    return true;
  }
  // Toggle Side-by-Side Split View: CmdOrCtrl+Shift+S or CmdOrCtrl+\
  if ((modifier && input.shift && input.key.toLowerCase() === 's') || (modifier && input.key === '\\')) {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:toggle-split');
    return true;
  }
  // Toggle Phone Viewport (Mobile Emulation): CmdOrCtrl+Shift+M
  if (modifier && input.shift && input.key.toLowerCase() === 'm') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:toggle-phone');
    return true;
  }
  // Toggle Theme: CmdOrCtrl+Shift+T
  if (modifier && input.shift && input.key.toLowerCase() === 't') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:toggle-theme');
    return true;
  }
  // DevTools for active tab: CmdOrCtrl+Shift+I or F12
  if ((modifier && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:inspect-tab');
    return true;
  }
  // Inspect Cookies: CmdOrCtrl+Shift+C
  if (modifier && input.shift && input.key.toLowerCase() === 'c') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:inspect-cookies');
    return true;
  }
  // Go Home: CmdOrCtrl+H
  if (modifier && !input.alt && !input.shift && input.key.toLowerCase() === 'h') {
    event?.preventDefault();
    mainWindow?.webContents.send('shortcut:go-home');
    return true;
  }

  return false;
}

function createWindow() {
  const isMac = process.platform === 'darwin';
  const isWin = process.platform === 'win32';

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 400,
    minHeight: 500,
    title: 'Rays OmniDeck',
    backgroundColor: '#090d16',
    icon: path.join(__dirname, 'assets', isMac ? 'icon.icns' : (isWin ? 'icon.ico' : 'icon.png')),
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    titleBarOverlay: isMac ? false : {
      color: '#0e1626',
      symbolColor: '#94a3b8',
      height: 42
    },
    autoHideMenuBar: true,
    trafficLightPosition: isMac ? { x: 14, y: 13 } : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true,
      webSecurity: true,
      sandbox: true,
      safeDialogs: true,
      backgroundThrottling: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Global shortcut capture in main window renderer
  mainWindow.webContents.on('before-input-event', (event, input) => {
    handleShortcutInput(input, event);
  });

  // Cybersecurity: Harden webview attachment to prevent privilege escalation
  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, _params) => {
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.webSecurity = true;
    webPreferences.sandbox = true;
    webPreferences.backgroundThrottling = true;
    delete webPreferences.preload;
  });

  // Cybersecurity: Prevent top-level window navigation away from local index.html
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!navigationUrl.startsWith('file://')) {
      event.preventDefault();
      console.warn(`[Security Guard] Blocked unauthorized main window navigation to: ${navigationUrl}`);
    }
  });

  // Cybersecurity: Validate and sanitize all external link openings
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        shell.openExternal(url);
      } else {
        console.warn(`[Security Guard] Blocked external URL with unauthorized protocol: ${url}`);
      }
    } catch (_err) {
      console.warn(`[Security Guard] Malformed external URL blocked: ${url}`);
    }
    return { action: 'deny' };
  });

  // Cybersecurity: Permission Request Gate
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = [
      'clipboard-read',
      'clipboard-sanitized-write',
      'notifications',
      'media',
      'camera',
      'microphone'
    ];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      console.warn(`[Security Guard] Denied sensitive permission: ${permission}`);
      callback(false);
    }
  });

  buildAppMenu();

  // Forward console messages to terminal in test/debug mode
  mainWindow.webContents.on('console-message', (_event, _level, message) => {
    if (process.env.TEST_MODE === 'true' || process.env.DEBUG === 'true') {
      console.log(`[Renderer] ${message}`);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (process.env.TEST_MODE === 'true') {
      console.log('TEST_MODE: Main window finished loading index.html successfully');
      setTimeout(() => {
        app.quit();
      }, 800);
    }
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('window:fullscreen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('window:fullscreen-changed', false);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Global hook for all webContents created (including guest webviews)
app.on('web-contents-created', (_event, contents) => {
  // Enforce clean modern Chrome user agent (Chrome 133) without Electron token
  // Fixes WhatsApp Web "Update to Chrome 100+" and similar restrictive web apps
  const modernUA = getModernChromeUserAgent();
  contents.setUserAgent(modernUA);
  if (contents.session) {
    contents.session.setUserAgent(modernUA);
  }

  // Capture keyboard shortcuts even when a webview has active input focus
  contents.on('before-input-event', (e, input) => {
    handleShortcutInput(input, e);
  });

  // Cybersecurity: Disallow guest webview navigation to local system files
  contents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsed = new URL(navigationUrl);
      if (parsed.protocol === 'file:') {
        if (!navigationUrl.endsWith('newtab.html') && !navigationUrl.endsWith('index.html')) {
          event.preventDefault();
          console.warn(`[Security Guard] Blocked unauthorized local file navigation: ${navigationUrl}`);
        }
      } else if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        event.preventDefault();
        console.warn(`[Security Guard] Blocked dangerous protocol navigation: ${navigationUrl}`);
      }
    } catch (_err) {
      event.preventDefault();
    }
  });

  // Cybersecurity: Intercept window open requests from webviews
  contents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        mainWindow?.webContents.send('shortcut:open-url-tab', url);
      }
    } catch (_err) {}
    return { action: 'deny' };
  });

  // Cybersecurity: Protect partition sessions from unauthorized permission grabs
  if (contents.session && contents.session !== session.defaultSession) {
    contents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
      const allowed = ['clipboard-read', 'clipboard-sanitized-write', 'notifications', 'media', 'camera', 'microphone'];
      callback(allowed.includes(permission));
    });
  }
});

function buildAppMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: 'Rays OmniDeck',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow?.webContents.send('shortcut:new-tab')
        },
        {
          label: 'Close Active Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow?.webContents.send('shortcut:close-tab')
        },
        {
          label: 'Focus Address Bar',
          accelerator: 'CmdOrCtrl+L',
          click: () => mainWindow?.webContents.send('shortcut:focus-url')
        },
        {
          label: 'Go to Home (rays.foundation)',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow?.webContents.send('shortcut:go-home')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload Active Tab',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.webContents.send('shortcut:reload-tab', { force: false })
        },
        {
          label: 'Force Reload Active Tab',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => mainWindow?.webContents.send('shortcut:reload-tab', { force: true })
        },
        { type: 'separator' },
        {
          label: 'History: Back',
          accelerator: isMac ? 'Cmd+[' : 'Alt+Left',
          click: () => mainWindow?.webContents.send('shortcut:go-back')
        },
        {
          label: 'History: Forward',
          accelerator: isMac ? 'Cmd+]' : 'Alt+Right',
          click: () => mainWindow?.webContents.send('shortcut:go-forward')
        },
        { type: 'separator' },
        {
          label: 'Toggle Phone Viewport (Mobile Emulation)',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => mainWindow?.webContents.send('shortcut:toggle-phone')
        },
        {
          label: 'Toggle Side-by-Side Split View',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('shortcut:toggle-split')
        },
        {
          label: 'Toggle Theme (Auto / Light / Dark)',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => mainWindow?.webContents.send('shortcut:toggle-theme')
        },
        { type: 'separator' },
        {
          label: 'Inspect Tab DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => mainWindow?.webContents.send('shortcut:inspect-tab')
        },
        {
          label: 'Inspect Partition Cookies',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => mainWindow?.webContents.send('shortcut:inspect-cookies')
        },
        { type: 'separator' },
        {
          label: 'Toggle App Window DevTools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: () => mainWindow?.webContents.toggleDevTools()
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tabs',
      submenu: [
        {
          label: 'Switch to Tab 1',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 0)
        },
        {
          label: 'Switch to Tab 2',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 1)
        },
        {
          label: 'Switch to Tab 3',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 2)
        },
        {
          label: 'Switch to Tab 4',
          accelerator: 'CmdOrCtrl+4',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 3)
        },
        {
          label: 'Switch to Tab 5',
          accelerator: 'CmdOrCtrl+5',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 4)
        },
        {
          label: 'Switch to Tab 6',
          accelerator: 'CmdOrCtrl+6',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 5)
        },
        {
          label: 'Switch to Tab 7',
          accelerator: 'CmdOrCtrl+7',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 6)
        },
        {
          label: 'Switch to Tab 8',
          accelerator: 'CmdOrCtrl+8',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', 7)
        },
        {
          label: 'Switch to Last Tab',
          accelerator: 'CmdOrCtrl+9',
          click: () => mainWindow?.webContents.send('shortcut:switch-tab', -1)
        },
        { type: 'separator' },
        {
          label: 'Next Tab',
          accelerator: 'Ctrl+Tab',
          click: () => mainWindow?.webContents.send('shortcut:navigate-tab', 1)
        },
        {
          label: 'Previous Tab',
          accelerator: 'Ctrl+Shift+Tab',
          click: () => mainWindow?.webContents.send('shortcut:navigate-tab', -1)
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('session:clear-partition', async (_event, partition) => {
  try {
    if (!partition) {
      return { success: false, error: 'No partition specified' };
    }
    const sess = session.fromPartition(partition);
    await sess.clearStorageData({
      storages: [
        'cookies',
        'localstorage',
        'caches',
        'indexdb',
        'websql',
        'serviceworkers',
        'cachestorage'
      ]
    });
    return { success: true, partition };
  } catch (err) {
    console.error(`Failed to clear partition ${partition}:`, err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('session:get-partition-cookies', async (_event, partition) => {
  try {
    if (!partition) return [];
    const sess = session.fromPartition(partition);
    const cookies = await sess.cookies.get({});
    return cookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      expirationDate: c.expirationDate
    }));
  } catch (err) {
    console.error(`Failed to get cookies for ${partition}:`, err);
    return [];
  }
});

ipcMain.handle('app:open-external', async (_event, targetUrl) => {
  if (targetUrl) {
    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        await shell.openExternal(targetUrl);
        return true;
      }
    } catch (_err) {
      return false;
    }
  }
  return false;
});

ipcMain.handle('theme:set-source', async (_event, source) => {
  if (['system', 'light', 'dark'].includes(source)) {
    nativeTheme.themeSource = source;
  }
  return {
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    themeSource: nativeTheme.themeSource
  };
});

ipcMain.handle('theme:get-info', async () => {
  return {
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    themeSource: nativeTheme.themeSource
  };
});

ipcMain.handle('window:get-info', () => {
  return {
    platform: process.platform,
    isFullScreen: mainWindow ? mainWindow.isFullScreen() : false
  };
});

ipcMain.handle('system:get-user-agent', () => {
  return getModernChromeUserAgent();
});

// Broadcast theme changes to renderer when macOS/Windows theme changes
nativeTheme.on('updated', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (process.platform === 'win32') {
      try {
        mainWindow.setTitleBarOverlay({
          color: nativeTheme.shouldUseDarkColors ? '#090d16' : '#f8fafc',
          symbolColor: nativeTheme.shouldUseDarkColors ? '#94a3b8' : '#0f172a',
          height: 42
        });
      } catch (_e) {}
    }

    mainWindow.webContents.send('system:theme-changed', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      themeSource: nativeTheme.themeSource
    });
  }
});

// Local dev certificate bypass for https://localhost
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// ==========================================================================
// Auto-Updater Integration (electron-updater -> GitHub Releases)
// ==========================================================================
function initAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates...');
    mainWindow?.webContents.send('updater:status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    console.log(`[AutoUpdater] Update available: v${info.version}`);
    mainWindow?.webContents.send('updater:status', {
      status: 'available',
      version: info.version
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Current version is up to date.');
    mainWindow?.webContents.send('updater:status', {
      status: 'up-to-date',
      version: info?.version || app.getVersion()
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('updater:progress', {
      percent: Math.round(progressObj.percent),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[AutoUpdater] Update downloaded: v${info.version}. Ready to install.`);
    mainWindow?.webContents.send('updater:status', {
      status: 'downloaded',
      version: info.version
    });
  });

  autoUpdater.on('error', (err) => {
    console.warn(`[AutoUpdater] Error encountered: ${err.message}`);
    mainWindow?.webContents.send('updater:status', {
      status: 'error',
      error: err.message
    });
  });
}

// IPC Handlers for Auto-Updater
ipcMain.handle('updater:check-for-updates', async () => {
  try {
    if (!app.isPackaged && process.env.TEST_UPDATER !== 'true') {
      // In local dev environment before first release is published
      return { status: 'dev-mode', version: app.getVersion() };
    }
    const result = await autoUpdater.checkForUpdates();
    return { status: 'checking', updateInfo: result?.updateInfo };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
});

ipcMain.handle('updater:restart-and-install', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('updater:get-app-version', () => {
  return app.getVersion();
});

// Lifecycle events
app.whenReady().then(() => {
  createWindow();
  initAutoUpdater();

  // Automatically check for updates 3 seconds after startup if packaged
  if (app.isPackaged || process.env.TEST_UPDATER === 'true') {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        console.warn('[AutoUpdater] Initial check error:', err.message);
      });
    }, 3000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
