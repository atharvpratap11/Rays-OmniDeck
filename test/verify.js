// Automated verification script for Rays OmniDeck
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Running Rays OmniDeck Verification Tests...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Verify Core Files
console.log('1. Checking File Structure...');
const requiredFiles = [
  'package.json',
  'main.js',
  'preload.js',
  'index.html',
  'newtab.html',
  'renderer.js',
  'styles.css',
  'assets/icon.icns',
  'assets/icon.png',
  'assets/icon.ico',
  'README.md'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  assert(fs.existsSync(filePath), `File exists: ${file}`);
});

// 2. Verify Package Configuration (.dmg and .exe targets)
console.log('\n2. Checking package.json...');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
assert(pkg.name === 'rays-omnideck', 'Package name is rays-omnideck');
assert(pkg.productName === 'Rays OmniDeck', 'Product name is Rays OmniDeck');
assert(pkg.main === 'main.js', 'Entry point is main.js');
assert(pkg.scripts && pkg.scripts.start === 'electron .', 'npm start script configured');
assert(pkg.scripts && pkg.scripts['dist:dmg'], 'npm run dist:dmg script configured');
assert(pkg.scripts && pkg.scripts['dist:exe'], 'npm run dist:exe script configured');
assert(pkg.build?.mac?.target?.some(t => t.target === 'dmg'), 'macOS target includes DMG');
assert(pkg.build?.win?.target?.some(t => t.target === 'nsis' || t.target === 'portable'), 'Windows target includes NSIS / Portable EXE');

// 3. Verify JavaScript Syntax
console.log('\n3. Validating JavaScript Syntax...');
['main.js', 'preload.js', 'renderer.js'].forEach(file => {
  try {
    execSync(`node --check "${path.join(__dirname, '..', file)}"`);
    assert(true, `Syntax check passed: ${file}`);
  } catch (err) {
    assert(false, `Syntax error in ${file}: ${err.message}`);
  }
});

// 4. Verify Index.html Components & Phone Mode
console.log('\n4. Inspecting index.html Elements...');
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
assert(htmlContent.includes('<title>Rays OmniDeck</title>'), 'Title is Rays OmniDeck');
assert(!htmlContent.includes('class="top-header"'), 'Top branding header removed for minimal UI');
assert(htmlContent.includes('id="tab-list"'), 'Tab list container present');
assert(htmlContent.includes('id="webview-container"'), 'Webview host container present');
assert(htmlContent.includes('id="address-form"'), 'Address bar form present');
assert(htmlContent.includes('id="role-selector"'), 'Role dropdown present');
assert(htmlContent.includes('id="phone-mode-btn"'), 'Phone mode viewport emulation button present');
assert(htmlContent.includes('id="split-view-btn"'), 'Split view button present');
assert(htmlContent.includes('id="extensions-btn"'), 'Extensions button present');
assert(htmlContent.includes('id="inspect-cookies-btn"'), 'Cookies button present');
assert(htmlContent.includes('id="devtools-btn"'), 'DevTools button present');
assert(htmlContent.includes('id="theme-toggle-btn"'), 'Theme toggle button present');

// 5. Verify newtab.html Minimal Search Engine Page
console.log('\n5. Inspecting newtab.html Search Homepage...');
const newtabContent = fs.readFileSync(path.join(__dirname, '..', 'newtab.html'), 'utf-8');
assert(newtabContent.includes('rays.foundation'), 'Search homepage title is rays.foundation');
assert(newtabContent.includes('data-engine="google"'), 'Google engine option present');
assert(newtabContent.includes('data-engine="duckduckgo"'), 'DuckDuckGo engine option present');
assert(newtabContent.includes('data-engine="yahoo"'), 'Yahoo engine option present');
assert(newtabContent.includes('prefers-color-scheme'), 'CSS supports system light/dark theme preference');

// 6. Verify Renderer Features: Shortcuts, Phone Mode, Roles A/B/C/D
console.log('\n6. Inspecting renderer.js Features...');
const rendererContent = fs.readFileSync(path.join(__dirname, '..', 'renderer.js'), 'utf-8');
assert(rendererContent.includes('RoleA') && rendererContent.includes('RoleB'), 'Default roles defined as Role A, Role B, Role C, etc.');
assert(rendererContent.includes('newtab.html'), 'Default URL set to minimal newtab.html page');
assert(rendererContent.includes('draggable'), 'Drag and drop attribute enabled for tabs');
assert(rendererContent.includes('togglePhoneMode'), 'Phone mode mobile viewport emulation implemented');
assert(rendererContent.includes('reloadActiveTab'), 'Active tab reload logic implemented');
assert(rendererContent.includes('focusAddressBar'), 'Address bar focus logic implemented');
assert(rendererContent.includes('switchToTabIndex'), 'Tab switching by index (Cmd+1..9) implemented');
assert(rendererContent.includes('cycleTheme'), 'Theme toggle logic implemented');
assert(rendererContent.includes('persist:${tabId}') || rendererContent.includes('persist:tab_'), 'Strict tab session partitioning implemented');

// 7. Verify Main & Preload Shortcuts & Cybersecurity Guards
console.log('\n7. Inspecting main.js & preload.js Shortcuts and Security...');
const mainContent = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf-8');
const preloadContent = fs.readFileSync(path.join(__dirname, '..', 'preload.js'), 'utf-8');
assert(mainContent.includes('handleShortcutInput'), 'main.js has centralized keyboard shortcut dispatcher');
assert(mainContent.includes('before-input-event'), 'main.js captures shortcuts inside guest webviews');
assert(mainContent.includes('will-attach-webview'), 'Cybersecurity: main.js hardens webview attachment');
assert(mainContent.includes('setPermissionRequestHandler'), 'Cybersecurity: main.js gates sensitive permissions');
assert(preloadContent.includes('onNewTab') && preloadContent.includes('onReloadTab'), 'preload.js exposes standard browser shortcuts');
assert(preloadContent.includes('onTogglePhone'), 'preload.js exposes phone mode toggle');

// 8. Verify Gemini AI Copilot & Device Portview Toolbar
console.log('\n8. Inspecting Gemini AI Copilot & Device Portview Elements...');
assert(htmlContent.includes('id="gemini-btn"'), 'Gemini AI action button present in toolbar');
assert(htmlContent.includes('id="gemini-drawer"'), 'Gemini AI drawer flyout present');
assert(htmlContent.includes('gemini-prompt-chip'), 'Synthetic prompt chips present in Gemini drawer');
assert(htmlContent.includes('id="open-gemini-tab-btn"'), 'Open full Gemini in isolated tab button present');
assert(htmlContent.includes('id="device-toolbar"'), 'Device portview toolbar present');
assert(htmlContent.includes('id="device-preset-select"'), 'Device preset select dropdown present');
assert(htmlContent.includes('samsung-s24-ultra'), 'Galaxy S24 Ultra preset present');
assert(htmlContent.includes('ipad-pro-11-h'), 'iPad Pro Horizontal preset present');
assert(htmlContent.includes('id="device-rotate-btn"'), 'Device rotate button present');
assert(htmlContent.includes('id="device-resizer-left"'), 'Device left stretch resizer handle present');
assert(htmlContent.includes('id="device-resizer-right"'), 'Device right stretch resizer handle present');

// 9. Inspect Stylesheet for Gemini & Device Resizer
console.log('\n9. Inspecting styles.css for Animations & Responsive Layouts...');
const stylesContent = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf-8');
assert(stylesContent.includes('[data-theme="light"]'), 'Light theme styles defined');
assert(stylesContent.includes('[data-theme="dark"]'), 'Dark theme styles defined');
assert(stylesContent.includes('phone-mode'), 'Phone mode mobile viewport styles defined');
assert(stylesContent.includes('.device-toolbar'), 'Device toolbar CSS defined');
assert(stylesContent.includes('.device-resizer'), 'Device draggable resizers CSS defined');
assert(stylesContent.includes('.gemini-drawer'), 'Gemini AI drawer CSS defined');
assert(stylesContent.includes('--device-width'), 'Dynamic --device-width CSS variable defined');
assert(stylesContent.includes('@media (max-width:'), 'Responsive optimizations for mobile/narrow screens defined');

// 10. Verify RAM Optimization & Hardware Acceleration Flags
console.log('\n10. Inspecting RAM & Hardware Acceleration Optimization Flags...');
assert(mainContent.includes('--max-old-space-size=512'), 'RAM capped at 512MB for lean footprint');
assert(mainContent.includes('enable-gpu-rasterization'), 'GPU rasterization flag enabled for 60fps rendering');
assert(mainContent.includes('backgroundThrottling: true'), 'Background tab throttling enabled to minimize RAM/CPU usage');

// 11. Verify Auto-Updater Integration (GitHub Releases)
console.log('\n11. Inspecting Auto-Updater Pipeline & GitHub Configuration...');
assert(pkg.dependencies && pkg.dependencies['electron-updater'], 'electron-updater package installed in dependencies');
assert(pkg.build?.publish?.provider === 'github', 'Auto-updater publish provider set to github');
assert(pkg.build?.publish?.owner === 'atharvpratap11', 'GitHub owner set to atharvpratap11');
assert(pkg.build?.publish?.repo === 'omnideck' || pkg.build?.publish?.repo === 'Rays-OmniDeck', 'GitHub repo configured');
assert(htmlContent.includes('id="check-updates-btn"'), 'Check for updates button present in UI');
assert(htmlContent.includes('id="update-banner"'), 'In-browser floating update banner present');
assert(htmlContent.includes('id="update-restart-btn"'), 'Restart to update button present');
assert(stylesContent.includes('.update-banner'), 'Update banner styles defined');
assert(mainContent.includes('autoUpdater.checkForUpdates'), 'main.js wires autoUpdater.checkForUpdates');
assert(mainContent.includes('autoUpdater.quitAndInstall'), 'main.js wires autoUpdater.quitAndInstall');
assert(preloadContent.includes('checkForUpdates') && preloadContent.includes('restartAndInstallUpdate'), 'preload.js exposes updater IPC methods');
// 12. Verify Modern UI Upgrades, Windows Overlay & WhatsApp Web UserAgent
console.log('\n12. Inspecting Modern UI Upgrades & Windows/WhatsApp Fixes...');
assert(mainContent.includes('getModernChromeUserAgent'), 'Clean Chrome 133 user agent generator present in main.js');
assert(rendererContent.includes('useragent'), 'Webviews configured with clean modern Chrome userAgent in renderer.js');
assert(mainContent.includes('titleBarOverlay'), 'Windows native window controls overlay configured in main.js');
assert(mainContent.includes('autoHideMenuBar: true'), 'Legacy Win32 menu bar hidden in main.js');
assert(stylesContent.includes('border-radius: 9999px'), 'Address bar and role selector have complete rounded pill corners');
assert(!stylesContent.includes('box-shadow: 0 -2px 0 0'), 'Tab top accent line removed for clean floating tab design');
assert(stylesContent.includes('body.is-fullscreen .tab-strip-container'), 'Tab strip shifts left when fullscreen');
assert(newtabContent.includes('id="wallpaper-upload-btn"') && newtabContent.includes('polyline points="17 8 12 3 7 8"'), 'Wallpaper upload button uses modern SVG upload icon');
assert(newtabContent.includes('engine-dropdown-container') && newtabContent.includes('engine-arrow-icon'), 'Search engine custom dropdown with aligned down-arrow present');

// 13. Verify Notification Blocking, 3-Dot Menu, Tab Overview & Role Color Fidelity
console.log('\n13. Inspecting Notification Security, 3-Dot Menu, Tab Overview & Role Colors...');
assert(mainContent.includes("permission === 'notifications'") && mainContent.includes('callback(false)'), 'Notifications explicitly denied in main.js');
assert(htmlContent.includes('id="more-menu-btn"') && htmlContent.includes('id="more-menu-dropdown"'), 'Chrome-style 3-dot overflow menu present');
assert(htmlContent.includes('id="tab-overview-overlay"') && htmlContent.includes('id="tab-overview-grid"'), 'Win+Tab Mission Control Tab Overview present');
assert(stylesContent.includes('.tab-overview-overlay') && stylesContent.includes('.overview-tab-card'), 'Tab Overview styles defined in styles.css');
assert(stylesContent.includes('var(--role-color) !important'), 'Tab dot and pill strictly match role color');
assert(stylesContent.includes('opacity: 0') && stylesContent.includes('.ready'), 'Webview prevents white screen flashbang with opacity fade-in');
assert(rendererContent.includes('toggleTabOverview') && rendererContent.includes('openTabOverview'), 'Tab Overview controller functions implemented in renderer.js');
assert(rendererContent.includes("createTab({ role: 'Gemini'"), 'Gemini opens in dedicated Gemini role');

console.log(`\n========================================`);
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All verification checks passed successfully!');
}
