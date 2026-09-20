# Rays OmniDeck ⚡

> **Minimal Multi-Role Desktop Testing Browser with Strict Partition Isolation & In-Browser Auto-Updates**

**Rays OmniDeck** is a specialized Electron/Chromium-based desktop testing browser engineered to test and validate concurrent multi-user workflows (e.g. Doctor, Patient, Pharmacy, Pathology, Admin) simultaneously in a single window with **zero session bleeding or cookie leakage**.

---

## 🚀 Key Features

1. **Strict Tab-Level Session Isolation:**
   - Every tab operates in an isolated Chromium session partition (`persist:tab_<id>`).
   - Cookies, `localStorage`, `sessionStorage`, `IndexedDB`, and cache instances are completely partitioned and persist across restarts.
2. **Auto-Updater Integration (`electron-updater`):**
   - Direct integration with GitHub repository: [`atharvpratap11/omnideck`](https://github.com/atharvpratap11/omnideck).
   - Silent background downloading with real-time download progress.
   - Non-intrusive floating **"🚀 Update Ready — Restart to Update"** notification banner.
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

---

## 🔄 How to Push New Updates to Users

When you make changes to the app and want users to receive updates automatically:

1. **Bump Version in `package.json`:**
   Change `"version": "1.0.0"` to `"version": "1.0.1"` (or `1.1.0`).

2. **Generate GitHub Personal Access Token (Classic):**
   - Go to GitHub -> Settings -> Developer settings -> Personal access tokens (classic).
   - Create a token with `repo` scope.

3. **Build & Publish Release:**
   ```bash
   export GH_TOKEN="your_github_token_here"
   npm run dist:dmg -- -p always
   npm run dist:exe -- -p always
   ```
   `electron-builder` will compile the binaries, generate `latest-mac.yml` / `latest.yml`, and automatically publish the release draft on [`https://github.com/atharvpratap11/omnideck/releases`](https://github.com/atharvpratap11/omnideck/releases).

4. **Publish the Release on GitHub:**
   - Review and hit **Publish release** on GitHub.
   - Any user currently running Rays OmniDeck will detect the update within seconds, download it silently in the background, and see:
     **"🚀 Update Ready (v1.0.1)! [Restart to Update]"**.

---

## 🛠️ Development & Testing

```bash
# Install dependencies
npm install

# Run automated test suite (87 tests)
npm test

# Run app locally in dev mode
npm start
```
