# /sync — Delta Refresh

`/sync` performs a delta refresh of your Velocity workspace. Unlike `/init` which bootstraps everything from scratch, `/sync` detects what has changed and updates only the affected components.

::: tip When to Use
Run `/sync` when:

- The tech stack changes (new dependency, new service, new database)
- CONTEXT.md is updated and adapter assets need regenerating
- Guardrail configuration changes
- New agent roles are added
- Velocity itself is upgraded to a newer version
  :::

## Delta Detection

`/sync` compares the current repository state against the last recorded state in `.velocity/project-intelligence/stack.md`:

```
Current repo → Re-run project intelligence → stack-delta.md
                                               ↓
                               Only changed dimensions are updated
```

If nothing has changed in a component, it is skipped entirely. A sync run on a stable project may only regenerate adapter assets (if `.velocity/` was manually edited).

## Sync Flow

```
1. Re-run project intelligence → stack-delta.md (changed fields only)
2. If stack changed:
   → Re-run Agent Factory (only affected agents)
   → Re-run Skill Factory (only affected skills)
   → Re-run Guardrail Factory (if stack changes affect guardrails)
3. Re-run all adapters with updated .velocity/ state
4. If workspace connected:
   → Pull latest workspace intelligence
5. Report: what changed, what was skipped
```

## Preserving Customizations

`/sync` is designed to preserve manual customizations:

- **Manually edited skills** — If a skill file differs from its template by >20%, it is flagged for review rather than overwritten
- **Custom guardrails** — Additions to `default.md` beyond the generated set are preserved
- **CONTEXT.md** — Never regenerated; always preserved
- **ADRs and knowledge base** — Never touched by `/sync`

A report at the end shows which files were updated, which were preserved, and which need manual review.

## Usage

```
/velocity-sync
```

## After Major Stack Changes

If you've added a major new component (e.g., migrating from REST to GraphQL, adding Kafka):

```
/velocity-sync
```

The sync will:

1. Detect the new technology in project intelligence
2. Generate new guardrails appropriate for it (e.g., Kafka topic guard)
3. Update agent factory to add relevant subagents
4. Regenerate all adapter assets

## Sync Report Example

```markdown
# Sync Report — 2024-01-15

## Changes Detected

### Stack Changes

- Added: Apache Kafka (from package.json: kafkajs@2.2.4)
- Added: Redis cache (from docker-compose.yml)

### Components Updated

**Project Intelligence**

- stack.md updated: messaging.broker = "Apache Kafka"
- stack.md updated: cache.provider = "Redis"

**Guardrail Factory**

- Added: kafka-topic-guard (3 new rules)
- Added: redis-key-naming (1 new rule)
- Generated: updated hooks.json

**Agent Factory**

- Added: messaging-engineer subagent (under Engineer)
- Updated: engineer.md with Kafka skills

**Adapters**

- .cursor/rules/velocity.mdc regenerated (20ms)
- CLAUDE.md regenerated (15ms)
- .github/copilot-instructions.md regenerated (12ms)
- GEMINI.md regenerated (18ms)

## Preserved (manual customizations detected)

- .cursor/skills/tdd.md — 35% diff from template, preserved

## Action Required

- Review: .velocity/guardrails/default.md — new Kafka rules added at bottom
- Commit all changes
```
