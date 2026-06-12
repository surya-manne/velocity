# Installation

Velocity installs directly into your project. Pick a method below, then run `/init`.

## System Requirements

- VS Code 1.90+, Cursor, or Claude Code
- GitHub Copilot Chat, Cursor AI Chat, or Claude Code Chat
- A git repository (any language or framework)

::: tip Recommended Models
Use **Claude Sonnet 4.6**, **GPT-5.4**, or **Gemini 3.1 Pro** (or better). Avoid Auto model selection during `/init`.
:::

---

## Method 1: Plugin (Recommended)

### VS Code Copilot

1. Open the **Agent Customizations** panel in the Chat sidebar
2. Go to **Plugins** → click **Install Plugin from Source**
3. Enter: `https://github.com/surya-manne/velocity`

### Cursor

1. Open the **Agent Customizations** panel in the Chat sidebar
2. Go to **Plugins** → click **Install Plugin from Source**
3. Enter: `https://github.com/surya-manne/velocity`

### Claude Code

```text
/plugin marketplace add https://github.com/surya-manne/velocity
/plugin install velocity
```

---

## Method 2: VS Code Extension

1. Open Extensions (`⌘⇧X` / `Ctrl⇧X`), search **Velocity AI** (`SuryaManne.velocity-ai`), click **Install**
2. Open Command Palette (`⌘⇧P` / `Ctrl⇧P`) and run **Velocity: Initialize workspace**

The extension works in VS Code and Cursor.

---

## Method 3: Offline Installation

Copy the full bundle for your assistant into your repository:

<details open>
<summary><strong>VS Code Copilot</strong></summary>

```bash
npx degit surya-manne/velocity/plugins/dist/copilot/velocity /tmp/velocity-copilot \
  && cp -R /tmp/velocity-copilot/.github/. .github/ \
  && cp /tmp/velocity-copilot/AGENTS.md ./AGENTS.md \
  && rm -rf /tmp/velocity-copilot
```

Or run `./install.sh` from a local clone of the bundle.

</details>

<details>
<summary><strong>Cursor</strong></summary>

```bash
npx degit surya-manne/velocity/plugins/dist/cursor/velocity ~/.cursor/plugins/local/velocity
```

Restart Cursor, then run `/velocity-init`.

</details>

<details>
<summary><strong>Claude Code</strong></summary>

```bash
/plugin marketplace add https://github.com/surya-manne/velocity
/plugin install velocity
```

</details>

---

## Run /init

Open a new AI chat and run:

| Assistant      | Command          |
| -------------- | ---------------- |
| VS Code Copilot | `#velocity:init` |
| Cursor         | `/velocity-init` |
| Claude Code    | `/velocity-init` |

`/init` detects your stack, creates `.velocity/`, scaffolds context files, and generates adapters for your assistant.

::: info Duration
Depending on project size this typically takes a few minutes. The skill is resumable — if it stops, just run it again.
:::

---

## Commit

After `/init` completes, commit the generated files:

```bash
git add .velocity/ .cursor/ AGENTS.md .github/ CLAUDE.md commands/ subagents/ hooks/
git commit -m "chore: initialize velocity workspace"
```

---

## Updating

Run `/velocity-sync` when your project changes significantly or when Velocity releases improvements.

