# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Restructured repository as enterprise monorepo
  - Core product files (skills, agents, templates, schemas) moved to `core/`
  - Build packages (plugin-builder, vscode-extension) moved to `packages/`
  - Documentation site renamed from `docs/` to `docs-site/`
  - Plugin bundles (`plugins/dist/`) are now CI-generated, not committed
- Added npm workspaces for monorepo package management
- Added enterprise governance files (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
- Added GitHub issue and PR templates

## [1.0.0] - 2024-01-01

### Added

- Initial release with support for VS Code Copilot, Cursor, and Claude Code
- 46 skills covering the full SDLC pipeline
- 13 agent roles with 22 specialized subagents
- Plugin builder generating bundles for all 3 AI assistants
- VS Code extension for workspace initialization
- VitePress documentation site
