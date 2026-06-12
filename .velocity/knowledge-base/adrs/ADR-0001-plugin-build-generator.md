# ADR-0001: Publish-time plugin build generator

## Date: 2026-06-12

## Status: Accepted

## Bounded Context: velocity-platform

---

## Context

> What forced this decision — the problem, constraint, or pressure that made a choice necessary.

Velocity ships as version-controlled Markdown/YAML/JSON and is, at use time, purely
prompt-driven — no CLI, daemon, or server runs during a developer's coding session.

We now need to distribute Velocity as installable native plugins for three assistants
(Claude Code, Cursor, VS Code Copilot). Each assistant has a different native plugin
layout and manifest:

- Claude Code: `.claude-plugin/plugin.json` + `commands/ agents/ skills/ hooks/`, distributed via a repo `marketplace.json`.
- Cursor: `.cursor-plugin/plugin.json` + `rules/ skills/ agents/ commands/ hooks/`, distributed via `.cursor-plugin/marketplace.json`.
- Copilot: a `.github/` customization bundle (no plugin manager exists), distributed via git/template.

The canonical assets (`skills/`, `agents/`, `templates/`, `schemas/`, `hooks.json`)
must remain the single source of truth. Hand-maintaining three divergent copies would
guarantee drift and violate the "single source" principle. A skill's path references
(`templates/...`, `schemas/...`) also break once the skill is installed into an arbitrary
consumer repository, so the distributed artifact must be self-contained and have its paths
rewritten per target.

A decision was required on whether introducing build tooling is compatible with the
platform's "no CLI / prompt-driven" guardrail.

---

## Decision

> What was decided. Active voice. One or two sentences.

We introduce a publish-time build generator (`tools/plugin-builder/`) that transforms the
canonical assets plus a single authoring manifest (`plugins/velocity/plugin.config.yml`)
into three self-contained native plugin bundles under `plugins/dist/`, and regenerates the
root marketplace manifests. The generator runs only at publish/CI time; it is never part of
the runtime a developer experiences, so the platform remains prompt-driven at use time.

---

## Alternatives Considered

> What was rejected and why. At least one rejected alternative required.

**Keep it purely prompt-driven (extend the adapter skills to emit plugin packages)**
Rejected: producing three correct, validated manifests and rewriting every path reference
by hand in a chat session is error-prone, non-reproducible, and not verifiable in CI.
Adapter skills remain the right tool for per-consumer-repo generation at `init` time, but
they are a poor fit for producing distributable, versioned release artifacts.

**Hand-author three separate plugin directories**
Rejected: guarantees drift across ~57 skills and 12+ agents, and duplicates the canonical
source the platform is built to keep singular.

---

## Consequences

### What becomes easier

- One edit to a canonical skill/agent propagates to all three plugins on the next build.
- Release artifacts are reproducible and verifiable (`--check` mode in CI).
- Each plugin is self-contained, so `init` works inside any consumer repository.

### What becomes harder

- A Node/TypeScript build step now exists in the repo and must be maintained.
- Path-reference rewriting must stay correct as new skills are added.

### Constraints this imposes

> Downstream rules that must be followed as a result of this decision.

- The build generator is publish-time only. No build or server may run during a developer's
  coding session — the use-time experience stays prompt-driven.
- `plugins/dist/` is generated output. Never hand-edit it; edit canonical sources and rebuild.
- CI must run the builder in `--check` mode and fail if `plugins/dist/` is stale.

---

## References

- Related: ADR-{{related-id}} — none yet
- Plan: Multi-Platform Velocity Plugins
