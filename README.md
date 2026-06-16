# Velocity

**The Acceleration Layer for AI Coding Assistants**

Velocity gives your AI coding assistant shared project intelligence — agents, skills, workflows, guardrails, and domain knowledge — all generated directly into your repository.

Works with **VS Code Copilot**, **Cursor**, and **Claude Code**.

---

## Install

### Plugin (recommended)

**VS Code Copilot / Cursor** — Open the Agent Customizations panel in the Chat sidebar → Plugins → Install Plugin from Source → enter:

```
https://github.com/surya-manne/velocity
```

**Claude Code** — run in chat:

```
/plugin marketplace add https://github.com/surya-manne/velocity
/plugin install velocity
```

### VS Code Extension

Install **Velocity AI** from the VS Code or Cursor Marketplace. It sets up the right context files automatically.

### Offline

Copy the plugin folder for your assistant into your repo:

| Assistant | Folder |
| --- | --- |
| VS Code Copilot | `plugins/dist/copilot/velocity` → `.github/` |
| Cursor | `plugins/dist/cursor/velocity` → `.cursor/` |
| Claude Code | `plugins/dist/claude-code/velocity` → project root |

---

## Get Started

After installing, run `/velocity-init` (or `#velocity:init` in Copilot) in your AI assistant's chat. This sets up `.velocity/` with project intelligence, agents, skills, and adapter files for your assistant.

---

## Docs

Full documentation: **<https://surya-manne.github.io/velocity/>**

---

## Repository Structure

```
velocity/
├── core/                # Product content: skills, agents, templates, schemas
├── packages/
│   ├── plugin-builder/  # Generates plugin bundles for all 3 assistants
│   └── vscode-extension/ # VS Code Marketplace extension
├── docs-site/           # VitePress documentation site
├── plugins/             # Plugin authoring configuration
└── schemas/             # JSON schemas (inside core/)
```

## Development

```bash
npm install                # Install all workspace dependencies
npm run build:plugins      # Build plugin bundles
npm run build:extension    # Build VS Code extension
npm run build:docs         # Build documentation site
npm run typecheck          # Typecheck plugin builder
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
