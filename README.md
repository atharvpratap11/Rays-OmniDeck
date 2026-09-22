# Rays OmniDeck 

**Rays OmniDeck** is a specialized Electron/Chromium-based desktop testing browser engineered to test and validate concurrent multi-user workflows simultaneously in a single window with **zero session bleeding or cookie leakage**.

---

## Key Features

1. **Strict Tab-Level Session Isolation:**
   - Every tab operates in an isolated Chromium session partition (`persist:tab_<id>`).
   - Cookies, `localStorage`, `sessionStorage`, `IndexedDB`, and cache instances are completely partitioned and persist across restarts.
2. **Auto-Updater Integration (`electron-updater`):**
   - Direct integration with GitHub repository: [`atharvpratap11/omnideck`](https://github.com/atharvpratap11/omnideck).
   - Silent background downloading with real-time download progress.
   - Non-intrusive floating **" Update Ready — Restart to Update"** notification banner.
   - Manual **"Check for Updates"** button in the navigation toolbar.
3. **Gemini AI Sandbox Copilot:**
   - Slide-out testing copilot drawer to generate synthetic patient profiles, prescription payloads, multi-role test scenarios, and bug reports.
   - One-click button to launch Google Gemini in an isolated tab session.
4. **Device Portview Viewport Emulation:**
   - Presets for Apple iPhones (16 Pro Max, 16/15/14, 13 mini, SE), Samsung Flagships (S24 Ultra, S24, Z Fold), and Tablets (iPad Pro, iPad Mini, Galaxy Tab S9) in both portrait and landscape.
   - Drag-to-stretch horizontal handles for custom viewport sizing.
5. **Multi-Role Customization & Split View:**
   - Configurable roles (Role A, Role B, Role C, or custom personas).
   - Dual-tab split view mode (`Cmd/Ctrl + Shift + S`).
