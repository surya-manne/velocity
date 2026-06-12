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

After installing, run `/velocity-init` (or `#velocity-init` in Copilot) in your AI assistant's chat. This sets up `.velocity/` with project intelligence, agents, skills, and adapter files for your assistant.

---

## Docs

Full documentation: **<https://surya-manne.github.io/velocity/>**
