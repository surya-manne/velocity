# Plugin Installer

Bootstrap Velocity through an assistant plugin for the current phase targets: VS Code/GitHub Copilot, Cursor, and Claude Code.

## What It Does

- Detects or asks for the plugin target.
- Writes the native init and sync entry files for that assistant.
- Generates a small plugin manifest from `templates/plugins/`.
- Uses `/velocity-init` for new repositories and `/velocity-sync` when `.velocity/` already exists.

## Outputs

| Target | Init entry | Sync entry |
| ------ | ---------- | ---------- |
| VS Code / GitHub Copilot | `.github/prompts/velocity-init.prompt.md` | `.github/prompts/velocity-sync.prompt.md` |
| Cursor | `.cursor/skills/velocity-init.md` | `.cursor/skills/velocity-sync.md` |
| Claude Code | `commands/velocity-init.md` | `commands/velocity-sync.md` |

The plugin only places prompt files. Velocity still has no CLI, daemon, server, or binary runtime.

## Verification

After the native command completes, verify the target adapter output exists:

- VS Code / GitHub Copilot: `.github/copilot-instructions.md`, `AGENTS.md`, `.github/prompts/`
- Cursor: `.cursor/rules/velocity.mdc`, `.cursor/skills/`
- Claude Code: `CLAUDE.md`, `commands/`, `subagents/`, `hooks/`