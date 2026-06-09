# Developer Onboarding — Velocity VS Code Extension

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Node.js | 20.x | https://nodejs.org |
| npm | 9.x (ships with Node 20) | — |
| TypeScript | 5.x (dev-dep, installed locally) | — |
| `@vscode/vsce` | 3.x (dev-dep, installed locally) | — |
| VS Code | 1.90.0+ | https://code.visualstudio.com |

---

## Repository layout

```
vscode-extension/
├── src/
│   ├── extension.ts      # Activation entry point, command registration
│   └── installer.ts      # IDE detection, file copy helpers
├── skills/               # Bundled Velocity skill files (copied by package.sh)
├── templates/            # Bundled templates (copied by package.sh)
├── assets/               # Icon and other static assets
├── dist/                 # Compiled output (git-ignored)
├── scripts/
│   └── package.sh        # End-to-end build + VSIX script (run from repo root)
├── package.json
└── tsconfig.json
```

Source lives in `src/`. The build compiles TypeScript → `dist/extension.js` via **esbuild** (single bundled file, CommonJS, minified).

---

## First-time setup

```bash
# From the repo root
cd vscode-extension
npm install
```

---

## Development workflow

### Compile (type-check only)

```bash
npm run compile
```

### Watch mode (incremental, no bundle)

```bash
npm run watch
```

### Bundle for distribution

```bash
npm run build
```

This runs `esbuild` and writes `dist/extension.js`. This is what gets packaged into the `.vsix`.

### Run the extension locally (F5)

1. Open the `vscode-extension/` folder in VS Code.
2. Press **F5** — VS Code launches an Extension Development Host with the extension loaded.
3. Use the **Command Palette** (`Cmd+Shift+P`) and search for `Velocity` to invoke commands.

---

## Building the VSIX

### Option A — automated script (recommended)

Run from the **repo root** (not `vscode-extension/`):

```bash
bash vscode-extension/scripts/package.sh
```

This script:
1. Copies the latest skill files (`init`, `sync`, `validate`) from the repo into `vscode-extension/skills/`.
2. Copies the `templates/local-install/` files into `vscode-extension/templates/`.
3. Runs `npm install`.
4. Runs `npm run build` (esbuild bundle).
5. Runs `npx vsce package` → produces `velocity-ai-<version>.vsix` in `vscode-extension/`.

### Option B — manual steps

```bash
cd vscode-extension

# 1. Sync bundled assets from repo root (adjust paths if needed)
cp ../skills/init/SKILL.md     skills/init/SKILL.md
cp ../skills/sync/SKILL.md     skills/sync/SKILL.md
cp ../skills/validate/SKILL.md skills/validate/SKILL.md
cp ../templates/local-install/README.md    templates/local-install/README.md
cp ../templates/local-install/manifest.yml templates/local-install/manifest.yml

# 2. Install deps
npm install

# 3. Bundle
npm run build

# 4. Package
npx vsce package
```

The output file is `velocity-ai-<version>.vsix`.

---

## Installing the VSIX locally

```bash
# VS Code
code --install-extension vscode-extension/velocity-ai-<version>.vsix

# Cursor
cursor --install-extension vscode-extension/velocity-ai-<version>.vsix
```

Or via the VS Code UI: **Extensions** sidebar → `...` menu → **Install from VSIX…**

---

## Bumping the version

Edit the `version` field in `vscode-extension/package.json`:

```json
"version": "1.0.2"
```

Then re-run `package.sh` (or the manual steps) to produce the new `.vsix`.

---

## Publishing to the VS Code Marketplace

1. Ensure you have a Personal Access Token (PAT) for the `SuryaManne` publisher.
2. Log in:
   ```bash
   npx vsce login SuryaManne
   ```
3. Publish:
   ```bash
   cd vscode-extension
   npm run publish
   # or: npx vsce publish
   ```

> `vscode:prepublish` in `package.json` automatically runs `npm run build` before publishing.

---

## Commands registered by the extension

| Command ID | Palette label | Description |
|---|---|---|
| `velocity.init` | Velocity: Initialize workspace | Auto-detects IDE, installs entry files, prompts to open chat |
| `velocity.installPlugin` | Velocity: Install plugin entry files | Same as init with explicit IDE picker |
| `velocity.generateBundle` | Velocity: Generate local install bundle | Writes a self-contained install bundle to the workspace |
| `velocity.openDocs` | Velocity: Open documentation | Opens the Velocity docs URL in the browser |

---

## Source file overview

### `src/extension.ts`
- `activate()` — registers all four commands.
- `cmdInit()` — detects IDE via `detectIde()`, calls `installPluginFiles()`, shows the correct invocation command (`/velocity-init` for Cursor, `#velocity-init` for Copilot), and opens the AI chat panel.
- `cmdInstallPlugin()` — same flow but prompts the user to pick the IDE.
- `cmdGenerateBundle()` — calls `generateLocalBundle()` to write a self-contained bundle.
- `cmdOpenDocs()` — opens the docs URL.

### `src/installer.ts`
- `detectIde()` — heuristic based on running process / env to return `'cursor' | 'copilot'`.
- `installPluginFiles()` — copies bundled skill/template files from the extension path into the open workspace.
- `generateLocalBundle()` — assembles a local install bundle directory in the workspace.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `vsce: command not found` | `@vscode/vsce` not installed | `npm install` inside `vscode-extension/` |
| `dist/extension.js` missing at package time | Build not run | `npm run build` before `vsce package` |
| Skills missing inside VSIX | Script not run from repo root | Run `bash vscode-extension/scripts/package.sh` from repo root |
| Extension not activating in host | Compile error | Check Output → Extension Host for TypeScript errors |
