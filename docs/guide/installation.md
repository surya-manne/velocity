# Installation

Velocity installs directly into your repository as version-controlled files. There are four methods, ordered by simplicity.

## System Requirements

- VS Code 1.90 or later, or Cursor
- GitHub Copilot Chat, Cursor AI Chat, Claude Code, or Gemini
- A git repository (any language or framework)

::: tip Recommended Models
Use **Claude Sonnet 4.6**, **GPT-5.4**, or **Gemini 3.1 Pro** (or better). Velocity's skills are designed for frontier models. Avoid Auto model selection during `/init`.
:::

---

## Method 1: VS Code Extension (Recommended)

Install the **Velocity AI** extension from the VS Code Marketplace:

1. Open the Extensions panel (`⌘⇧X` / `Ctrl⇧X`)
2. Search for **Velocity AI** or enter the extension ID `SuryaManne.velocity-ai`
3. Click **Install**

Then open the Command Palette (`⌘⇧P` / `Ctrl⇧P`) and run **Velocity: Initialize workspace**.

The extension copies the entry skill files into your repo and opens AI Chat. In AI Chat, run the init command for your IDE:

| IDE | Command |
| --- | ------- |
| GitHub Copilot | `#velocity-init` |
| Cursor | `/velocity-init` |
| Claude Code | `/velocity-init` |
| Gemini | `@velocity-init` |

Velocity detects your tech stack and creates `.velocity/` with agent definitions, skill adapters, and guardrail hooks.

| AI Tool | Context File Created |
| ------- | -------------------- |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/velocity.mdc` |
| Claude Code | `CLAUDE.md` |
| Gemini | `GEMINI.md` |

---

## Method 2: Plugin Installer Skill

Use the `plugin-installer` skill when your assistant supports a Velocity plugin but you are not using the VS Code extension.

| Target | Plugin writes | Invoke |
| ------ | ------------- | ------ |
| VS Code / GitHub Copilot | `.github/prompts/velocity-init.prompt.md` | `#velocity-init` |
| Cursor | `.cursor/skills/velocity-init.md` | `/velocity-init` |
| Claude Code | `commands/velocity-init.md` | `/velocity-init` |

The plugin does not install a runtime — it only places the prompt file that starts the normal Velocity bootstrap.

---

## Method 3: Local Installation

Use the `local-installer` skill when plugin installation is unavailable or your team wants a reviewable source bundle.

The skill generates:

```text
velocity-local-install/
├── README.md
├── manifest.yml
├── velocity-init.md
├── velocity-sync.md
└── velocity-validate.md
```

Copy the target-specific files from `velocity-local-install/README.md` into the client repository, then run the listed native command.

---

## Method 4: Manual Init Skill Copy

Copy the init skill directly to the location your assistant reads skills from:

<details open>
<summary><strong>Cursor</strong></summary>

```bash
cp /path/to/velocity/skills/init/SKILL.md .cursor/skills/velocity-init.md
```

</details>

<details>
<summary><strong>Claude Code</strong></summary>

```bash
mkdir -p commands
cp /path/to/velocity/skills/init/SKILL.md commands/velocity-init.md
```

</details>

<details>
<summary><strong>GitHub Copilot (VS Code)</strong></summary>

```bash
mkdir -p .github/prompts
cp /path/to/velocity/skills/init/SKILL.md .github/prompts/velocity-init.prompt.md
```

</details>

<details>
<summary><strong>Gemini</strong></summary>

```bash
mkdir -p .gemini
cp /path/to/velocity/skills/init/SKILL.md .gemini/velocity-init.md
```

</details>

---

## Run /init

Open a new chat in your assistant and invoke the skill:

| Assistant | Command |
| --------- | ------- |
| Cursor | `/velocity-init` |
| Claude Code | `/velocity-init` |
| GitHub Copilot | `#velocity-init` |
| Gemini | `@velocity-init` |

The `/init` skill will:

1. **Detect your stack** — Languages, frameworks, databases, messaging, CI/CD
2. **Create `.velocity/`** — Full directory structure with appropriate templates
3. **Scaffold CONTEXT.md** — Glossary per detected bounded context
4. **Run factories** — Agent Factory, Skill Factory, Guardrail Factory
5. **Generate adapters** — Native assets for all four assistants
6. **Report results** — Summary of everything generated with next steps

::: warning Duration
`/init` is a comprehensive bootstrapping operation. Expect **10–20 minutes** in the assistant session. Do not interrupt it — the skill is designed to be resumable if it stops.
:::

---

## Commit

After `/init` completes, commit the generated files:

```bash
git add .velocity/ .cursor/ CLAUDE.md subagents/ commands/ hooks/ \
        AGENTS.md .github/ GEMINI.md .gemini/
git commit -m "chore: initialize velocity workspace"
```

All generated files are plain text — safe to commit, review, and modify.

---

## Updating

Use `/velocity-sync` when the repo changes significantly or when Velocity releases improvements. It performs delta regeneration and only updates what has changed.

---

## Verifying the Install

After `/init`, ask your assistant:

```
What stack does this project use?
What guardrails are active?
What skills are available?
```

A properly initialized workspace answers these from `.velocity/` without rescanning the codebase.

---

## Directory After Init

```text
your-project/
├── .velocity/                    ← Velocity's canonical config
│   ├── project-intelligence/
│   ├── project-context/
│   ├── context/
│   ├── guardrails/
│   └── knowledge-base/
├── .cursor/                      ← Cursor adapter output
│   ├── rules/velocity.mdc
│   ├── agents/
│   └── skills/
├── CLAUDE.md                     ← Claude Code entry doc
├── subagents/                    ← Claude Code subagents
├── commands/                     ← Claude Code skills
├── hooks/                        ← Claude Code hooks
├── AGENTS.md                     ← GitHub Copilot entry doc
├── .github/
│   ├── copilot-instructions.md
│   └── prompts/
├── GEMINI.md                     ← Gemini entry doc
└── .gemini/
    ├── agents/
    └── tools/
```
