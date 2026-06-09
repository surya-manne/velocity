---
name: plugin-installer
description: >-
  Bootstrap Velocity through an assistant plugin instead of manual copy-paste.
  Current phase supports VS Code/GitHub Copilot, Cursor, and Claude Code by
  installing the native Velocity entry file and then running the existing
  init/sync/adapter pipeline.
metadata:
  surfaces:
    - agent
---

# Plugin Installer

Install Velocity from an assistant plugin without changing the core prompt-driven architecture.

## Context Load

Read before starting:

1. `.velocity/project-intelligence/stack.md` if it exists
2. `README.md`
3. `docs/guide/installation.md`
4. `skills/init/SKILL.md`
5. `skills/sync/SKILL.md`
6. Target assistant adapter:
   - VS Code/GitHub Copilot: `skills/copilot-adapter/SKILL.md`
   - Cursor: `skills/cursor-adapter/SKILL.md`
   - Claude Code: `skills/claude-code-adapter/SKILL.md`
7. Target plugin manifest template:
  - VS Code/GitHub Copilot: `templates/plugins/vscode/manifest.yml`
  - Cursor: `templates/plugins/cursor/manifest.yml`
  - Claude Code: `templates/plugins/claude-code/manifest.yml`

## Supported Plugin Targets

| Target | Plugin installs | Developer invokes | Adapter output |
| ------ | --------------- | ----------------- | -------------- |
| VS Code / GitHub Copilot | `.github/prompts/velocity-init.prompt.md` | `#velocity-init` | `.github/copilot-instructions.md`, `AGENTS.md`, `.github/prompts/` |
| Cursor | `.cursor/skills/velocity-init.md` | `/velocity-init` | `.cursor/rules/velocity.mdc`, `.cursor/agents/`, `.cursor/skills/`, `hooks.json` |
| Claude Code | `commands/velocity-init.md` | `/velocity-init` | `CLAUDE.md`, `subagents/`, `commands/`, `hooks/` |

Gemini plugin packaging is out of scope for this phase. The Gemini adapter remains available through `/init` and `/sync`.

## Step 1 — Detect Plugin Target

Determine the active target from explicit user selection or assistant context.

If multiple targets are possible, ask the developer to choose exactly one:

```text
Which Velocity plugin target should I install now?
1. VS Code / GitHub Copilot
2. Cursor
3. Claude Code
```

Do not guess when target-specific file locations differ.

## Step 2 — Preflight

Check the repository root for existing Velocity state.

If `.velocity/` exists:

- Do not reinitialize.
- Tell the developer: `Velocity already exists. I will install the plugin entry file and run /velocity-sync after you invoke it.`
- Continue to Step 3.

If `.velocity/` does not exist:

- Continue to Step 3.
- The installed entry file will run the normal init pipeline.

## Step 3 — Install Entry Files

Create the target directory if missing and write the entry files.

| Target | Init entry | Sync entry |
| ------ | ---------- | ---------- |
| VS Code / GitHub Copilot | `.github/prompts/velocity-init.prompt.md` | `.github/prompts/velocity-sync.prompt.md` |
| Cursor | `.cursor/skills/velocity-init.md` | `.cursor/skills/velocity-sync.md` |
| Claude Code | `commands/velocity-init.md` | `commands/velocity-sync.md` |

Rules:

- Write init entries from `skills/init/SKILL.md`.
- Write sync entries from `skills/sync/SKILL.md`.
- Preserve an existing customized entry file unless the developer approves overwrite.
- If the existing file matches the Velocity source exactly or differs only in whitespace, replace it.
- Do not install global binaries, background services, package dependencies, or editor daemons.

## Step 4 — Generate Plugin Manifest

Generate a target manifest from the matching template under `templates/plugins/`.

Output path: `.velocity/install/plugin-manifest.yml` if `.velocity/` exists. If `.velocity/` does not exist yet, write `velocity-plugin-manifest.yml` beside the installed entry file and move it into `.velocity/install/` after init completes.

Substitute placeholders:

- `{{VELOCITY_VERSION}}` from schema/config version, default `2.0`
- `{{PLUGIN_TARGET}}` as `vscode_copilot`, `cursor`, or `claude_code`
- `{{ENTRY_FILE}}` as the init entry path
- `{{SYNC_FILE}}` as the sync entry path
- `{{GENERATED_AT}}` as ISO-8601 timestamp

## Step 5 — Register Plugin Metadata

Write a small local marker for auditability:

```yaml
version: "2.0"
install_method: plugin
target: "{vscode_copilot|cursor|claude_code}"
entry_file: "{path written in Step 3}"
sync_file: "{sync path written in Step 3}"
installed_at: "{ISO-8601 timestamp}"
```

Output path: `.velocity/install/plugin.yml` if `.velocity/` exists. If `.velocity/` does not exist yet, defer this marker until `/velocity-init` creates `.velocity/`.

## Step 6 — Run Native Bootstrap

Tell the developer the exact command for the target:

| Target | New repository | Existing Velocity repository |
| ------ | -------------- | ---------------------------- |
| VS Code / GitHub Copilot | `#velocity-init` | `#velocity-sync` |
| Cursor | `/velocity-init` | `/velocity-sync` |
| Claude Code | `/velocity-init` | `/velocity-sync` |

For new repositories, the existing init pipeline owns the rest:

1. Project Intelligence
2. `.velocity/` structure
3. Agent Factory
4. Skill Factory
5. Guardrail Factory
6. Adapters for the enabled assistants

For repositories where `.velocity/` already exists, sync owns regeneration and preserves customized files according to the normal threshold rules.

## Step 7 — Verification

Verify the target-specific files exist after init or sync:

- VS Code / GitHub Copilot: `.github/copilot-instructions.md`, `AGENTS.md`, `.github/prompts/velocity-init.prompt.md`
- Cursor: `.cursor/rules/velocity.mdc`, `.cursor/skills/velocity-init.md`
- Claude Code: `CLAUDE.md`, `commands/velocity-init.md`

Report missing files as install failures with the exact path and next action.

## Completion Report

Print:

```text
Velocity plugin installation prepared

Target: {target}
Entry file: {path}
Sync file: {path}
Next command: {native invocation based on new vs existing Velocity state}

After that command completes, run the verification checklist above.
```

## Guardrails

- Velocity remains prompt-driven: no CLI, no daemon, no server.
- Plugin installation only automates placement of native prompt files.
- Plugin output must be plain text and reviewable in git.
- Never overwrite customized assistant files without explicit approval.