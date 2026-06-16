---
name: local-installer
description: >-
  Generate a small, plain-text Velocity local install bundle that can be copied
  into client repositories when plugin installation is unavailable or a team
  wants fully reviewable repo-local integration files.
metadata:
  surfaces:
    - agent
---

# Local Installer

Generate copy-pasteable Velocity integration files for a client repository.

## Context Load

Read before starting:

1. `README.md`
2. `docs/guide/installation.md`
3. `skills/init/SKILL.md`
4. `skills/sync/SKILL.md`
5. `skills/validate/SKILL.md`
6. `templates/local-install/README.md`
7. `templates/local-install/manifest.yml`

## Output

Write the bundle to `velocity-local-install/` in the current workspace unless the developer provides another output folder.

The bundle contains only plain text files:

```text
velocity-local-install/
├── README.md
├── manifest.yml
├── velocity-init.md
├── velocity-sync.md
└── velocity-validate.md
```

These files are copied into a client repository manually. No binary archive, package manager, daemon, CLI, or remote fetch is required.

## Step 1 — Choose Target Assistants

Ask which client assistants should be supported by the local bundle.

Default for this phase:

- VS Code / GitHub Copilot
- Cursor
- Claude Code

Gemini can still be generated after `/velocity-init`, but it is not part of the local install default bundle for this phase.

## Step 2 — Generate Bundle Folder

Create `velocity-local-install/` with these files:

| Bundle file | Source |
| ----------- | ------ |
| `README.md` | `templates/local-install/README.md` with placeholders substituted |
| `manifest.yml` | `templates/local-install/manifest.yml` with placeholders substituted |
| `velocity-init.md` | `skills/init/SKILL.md` |
| `velocity-sync.md` | `skills/sync/SKILL.md` |
| `velocity-validate.md` | `skills/validate/SKILL.md` |

Substitute placeholders:

- `{{VELOCITY_VERSION}}` from schema/config version, default `2.0`
- `{{GENERATED_AT}}` as ISO-8601 timestamp
- `{{TARGET_ASSISTANTS}}` as comma-separated selected assistants

## Step 3 — Include Copy Map

The generated `README.md` must include this copy map:

| Assistant | Copy from bundle | Copy to client repo | Invoke |
| --------- | ---------------- | ------------------- | ------ |
| VS Code / GitHub Copilot | `velocity-init.md` | `.github/prompts/velocity-init.prompt.md` | `#velocity-init` |
| Cursor | `velocity-init.md` | `.cursor/skills/velocity-init.md` | `/velocity-init` |
| Claude Code | `velocity-init.md` | `commands/velocity-init.md` | `/velocity-init` |

Optional maintenance files:

| Assistant | Copy from bundle | Copy to client repo |
| --------- | ---------------- | ------------------- |
| VS Code / GitHub Copilot | `velocity-sync.md` | `.github/prompts/velocity-sync.prompt.md` |
| VS Code / GitHub Copilot | `velocity-validate.md` | `.github/prompts/velocity-validate.prompt.md` |
| Cursor | `velocity-sync.md` | `.cursor/skills/velocity-sync.md` |
| Cursor | `velocity-validate.md` | `.cursor/skills/velocity-validate.md` |
| Claude Code | `velocity-sync.md` | `commands/velocity-sync.md` |
| Claude Code | `velocity-validate.md` | `commands/velocity-validate.md` |

## Step 4 — Client Repository Integration

Tell the developer to copy only the files for their assistant into the client repository, then invoke the native command.

After `/velocity-init` or `#velocity-init` completes, the existing init pipeline generates:

- `.velocity/`
- assistant-native always-on files
- agents/subagents
- skills/prompts/commands
- guardrails and hooks where supported

## Step 5 — Verification

Before reporting success, check the bundle folder contains all required files and that each Markdown file has non-empty content.

Report:

```text
Velocity local install bundle generated

Folder: velocity-local-install/
Targets: {target assistants}
Required files: README.md, manifest.yml, velocity-init.md, velocity-sync.md, velocity-validate.md

Copy the target-specific files from README.md into the client repository and run the listed command.
```

## Guardrails

- The local bundle is a source bundle, not an executable installer.
- Keep the file count small enough for review and copy-paste.
- Do not include `.velocity/artifacts/`, RALPH data, handoffs, or client-specific project intelligence.
- Do not include secrets, tokens, local absolute paths, or generated logs.
- Preserve Velocity's prompt-driven model: all behavior remains in Markdown/YAML prompt files.