# Contributing to Velocity

Thank you for your interest in contributing to Velocity.

## Getting Started

1. Fork and clone the repository
2. Run `npm install` at the root to set up all workspaces
3. Make your changes
4. Submit a pull request

## Repository Structure

```
velocity/
├── core/               # Product content (skills, agents, templates, schemas)
├── packages/
│   ├── plugin-builder/  # Build tool that generates plugin bundles
│   └── vscode-extension/ # VS Code Marketplace extension
├── docs-site/           # VitePress documentation site
├── plugins/             # Plugin authoring config
└── schemas/             # JSON schemas (inside core/)
```

## Development Workflow

### Branch Strategy

- `main` — stable, release-ready
- `feature/<name>` — feature branches off main
- `fix/<name>` — bugfix branches off main

### Building

```bash
# Build plugin bundles for all 3 targets
npm run build:plugins

# Build the VS Code extension
npm run build:extension

# Build the documentation site
npm run build:docs

# Typecheck the plugin builder
npm run typecheck
```

### Pull Requests

- One logical change per PR
- Include a clear description of what changed and why
- Update documentation if behavior changes
- Ensure `npm run check:plugins` passes before submitting

## Code Standards

- Skills are authored in Markdown with YAML frontmatter
- JSON schemas validate all configuration files
- Plugin bundles are generated — never hand-edit `plugins/dist/`
- All domain terms must align with `.velocity/artifacts/context/CONTEXT.md`

## Reporting Issues

Use GitHub Issues. Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- AI assistant and version (Copilot, Cursor, Claude Code)
