# Velocity Local Install Bundle

Template placeholders: `{{VELOCITY_VERSION}}`, `{{GENERATED_AT}}`, `{{TARGET_ASSISTANTS}}`.

Version: `{{VELOCITY_VERSION}}`
Generated: `{{GENERATED_AT}}`
Targets: `{{TARGET_ASSISTANTS}}`

This folder contains the minimal Velocity files needed to bootstrap a client repository without a plugin, package manager, CLI, daemon, or server.

## Copy Map

| Assistant | Copy from this bundle | Copy to client repo | Invoke |
| --------- | --------------------- | ------------------- | ------ |
| VS Code / GitHub Copilot | `velocity-init.md` | `.github/prompts/velocity-init.prompt.md` | `#velocity-init` |
| Cursor | `velocity-init.md` | `.cursor/skills/velocity-init.md` | `/velocity-init` |
| Claude Code | `velocity-init.md` | `commands/velocity-init.md` | `/velocity-init` |

## Optional Maintenance Files

| Assistant | Copy from this bundle | Copy to client repo |
| --------- | --------------------- | ------------------- |
| VS Code / GitHub Copilot | `velocity-sync.md` | `.github/prompts/velocity-sync.prompt.md` |
| VS Code / GitHub Copilot | `velocity-validate.md` | `.github/prompts/velocity-validate.prompt.md` |
| Cursor | `velocity-sync.md` | `.cursor/skills/velocity-sync.md` |
| Cursor | `velocity-validate.md` | `.cursor/skills/velocity-validate.md` |
| Claude Code | `velocity-sync.md` | `commands/velocity-sync.md` |
| Claude Code | `velocity-validate.md` | `commands/velocity-validate.md` |

## After Copying

Run the native init command in the client repository. Velocity will generate `.velocity/` plus the assistant-native adapter files for the enabled assistants.

Commit the generated files after review.