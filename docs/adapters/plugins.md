# Installable Plugins

Velocity ships as native, installable plugins for Claude Code, Cursor, and VS Code Copilot. All three are generated from one unified source by a publish-time build step, so they never drift.

- One source: the canonical `skills/`, `agents/`, `templates/`, `schemas/`, and `hooks.json`.
- One manifest: `plugins/velocity/plugin.config.yml`.
- One generator: `tools/plugin-builder/` emits `plugins/dist/{claude-code,cursor,copilot}/velocity`.

After installing, run the `init` command in any repository to set up project context and intelligence — it detects your stack, scaffolds `.velocity/`, wires agents and skills, and generates guardrail hooks.

## Claude Code

Claude Code has a native plugin manager and marketplace.

```text
/plugin marketplace add https://github.com/surya-manne/velocity
/plugin install velocity
```

Then:

```text
/velocity-init
```

The bundle contains `.claude-plugin/plugin.json`, `commands/`, `agents/` (sub-agents), `skills/`, `hooks/`, and bundled `resources/` (templates + schemas) so `init` is self-contained.

## Cursor

Cursor has a native plugin manager.

1. Open the Agent Customizations panel in the Chat sidebar.
2. Go to Plugins -> Install Plugin from Source.
3. Enter `https://github.com/surya-manne/velocity`.

Then invoke skills as slash commands:

```text
/velocity-init
```

The bundle contains `.cursor-plugin/plugin.json`, `rules/velocity.mdc` (always-on), `skills/`, `agents/`, `hooks/`, and bundled `resources/`.

## VS Code Copilot

VS Code Copilot has a native plugin manager.

1. Open the Agent Customizations panel in the Chat sidebar.
2. Go to Plugins -> Install Plugin from Source.
3. Enter `https://github.com/surya-manne/velocity`.

Invoke skills as prompts in Copilot Chat:

```text
#velocity-init
```

The bundle contains `.github/copilot-instructions.md`, `.github/instructions/`, `.github/prompts/`, `.github/agents/`, `.github/skills/`, and `.github/velocity-resources/` (templates + schemas).

## Plugins vs adapters

|        | Plugins                                | [Adapters](/adapters/)                       |
| ------ | -------------------------------------- | -------------------------------------------- |
| What   | Distributable, versioned install units | Per-repo generation of tool-native files     |
| When   | Install once, reuse across repos       | Run during `/init` and `/sync` inside a repo |
| Source | `plugins/dist/` (generated)            | `.velocity/` in the consumer repo            |

Use a plugin to get Velocity into a new repo quickly; adapters then keep the in-repo tool-native files in sync as `.velocity/` evolves.

## Rebuilding (maintainers)

```bash
cd tools/plugin-builder
npm install
npm run build:plugins   # regenerate plugins/dist + marketplace manifests
npm run check           # CI-style staleness check
```

Never hand-edit `plugins/dist/`. Edit the canonical sources or `plugin.config.yml` and rebuild. See [ADR-0001](https://github.com/surya-manne/velocity/blob/main/.velocity/knowledge-base/adrs/ADR-0001-plugin-build-generator.md).

The complete build, test, verify, and publish workflow (including how to push to each marketplace) is documented in [RELEASING.md](https://github.com/surya-manne/velocity/blob/main/RELEASING.md).
