# Velocity Platform — Claude Code Context

Acceleration layer for AI coding assistants. Purely prompt-driven — no CLI, daemon, or server. Every capability is a generated file.

## Domain language

Read first: `.velocity/artifacts/context/CONTEXT.md`
All names must match CONTEXT.md glossary. Run `/velocity-context-engine` when drift is suspected.

## Standards

- Engineering: `.velocity/project-context/engineering.md`
- Testing: `.velocity/project-context/testing.md`
- Security: `.velocity/project-context/security.md`

## Before designing

Read `.velocity/knowledge-base/adrs/index.md` — all architectural decisions are recorded here.

## Skill chain

```
/velocity-grill-with-docs → /velocity-to-prd → /velocity-to-features → /velocity-to-tasks → /velocity-tdd → /velocity-handoff
```

## Agents

- `Engineer` — implement skills, agents, templates; run TDD; create PRs
- `Architect` — skill chain design, adapter architecture, ADRs
- `Researcher` — knowledge base, context map, prior slices
- `Reviewer` — PR review, ADR review, skill quality check

## RALPH (internal self-improvement)

After every skill evaluation: `/velocity-ralph-annotate`
After 5+ annotations for a skill: `/velocity-ralph-learn`
RALPH artifacts live in `.velocity/artifacts/ralph/` — never ship to consumer repos.

## Guardrails

- Vertical slices only — no horizontal layer PRs
- No secrets in skill files — blocked by PreToolUse hook
- Schema version bumps require approval
- Tracer bullet required before expanding any new capability
- Force push blocked — use `--force-with-lease`

## Stack

Markdown + YAML frontmatter · JSON Schema (schemas/) · prompt-driven architecture
Skills: `skills/**/SKILL.md` · Agents: `agents/*.md` · Templates: `templates/`
Schemas: `schemas/*.json` · Dogfooding: `.velocity/`

## Session start

Check `.velocity/project-intelligence/stack.md` `detected_at`.
If over 7 days old: run `/velocity-sync` before any feature work.
