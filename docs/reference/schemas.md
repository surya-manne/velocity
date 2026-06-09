# Schemas Reference

Velocity validates its generated artifacts against JSON schemas. All schemas are located in `schemas/` in the Velocity repository.

## Available Schemas

| Schema               | File                               | Validates                      |
| -------------------- | ---------------------------------- | ------------------------------ |
| Agent                | `agent.schema.json`                | Agent definition files         |
| Skill                | `skill.schema.json`                | Skill SKILL.md metadata blocks |
| Context Map          | `context-map.schema.json`          | `context-map.md` structure     |
| Guardrails           | `guardrails.schema.json`           | `guardrails/default.md`        |
| Project Intelligence | `project-intelligence.schema.json` | `stack.md`                     |
| Rule Pack            | `rule-pack.schema.json`            | Rule pack manifest entries     |
| Marketplace Pack     | `marketplace-pack.schema.json`     | Marketplace pack definitions   |
| Velocity Config      | `velocity-config.schema.json`      | Workspace-level config         |
| Workspace            | `workspace.schema.json`            | Multi-repo workspace config    |

## Project Intelligence Schema

The most frequently referenced schema. `stack.md` must conform to `project-intelligence.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["version", "project", "language"],
  "properties": {
    "version": { "type": "string" },
    "generated": { "type": "string", "format": "date-time" },
    "project": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": { "type": "string" },
        "type": { "enum": ["single-repo", "monorepo", "multi-repo"] }
      }
    },
    "language": {
      "type": "object",
      "required": ["primary"],
      "properties": {
        "primary": { "type": "string" },
        "secondary": { "type": "array", "items": { "type": "string" } }
      }
    },
    "frontend": {
      "type": "object",
      "properties": {
        "framework": { "type": "string" },
        "version": { "type": "string" },
        "css": { "type": "string" }
      }
    },
    "backend": {
      "type": "object",
      "properties": {
        "framework": { "type": "string" },
        "auth": { "type": "array" }
      }
    }
  }
}
```

## Skill Schema

Velocity skills have a YAML metadata block validated against `skill.schema.json`:

```yaml
---
name: tdd
version: 2.1.0
description: TDD loop for a single task
context:
  - .velocity/project-intelligence/stack.md
  - .velocity/project-context/engineering.md
outputs:
  - .velocity/artifacts/handoffs/{task-id}.md
triggers:
  - /tdd
  - /velocity-tdd
---
```

## Guardrails Schema

```json
{
  "type": "object",
  "required": ["guardrails"],
  "properties": {
    "guardrails": {
      "type": "object",
      "properties": {
        "git_safety": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "enforcement": { "enum": ["strict", "warn", "off"] },
            "main_branches": { "type": "array" }
          }
        },
        "high_risk_pause": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "threshold": { "type": "number", "minimum": 0, "maximum": 100 }
          }
        }
      }
    }
  }
}
```

## Validating Against Schemas

Velocity skills validate their outputs against schemas automatically. To validate manually:

```bash
# Using ajv-cli
npx ajv validate \
  -s schemas/project-intelligence.schema.json \
  -d .velocity/project-intelligence/stack.md

# Using jsonschema (Python)
python -m jsonschema \
  -i .velocity/project-intelligence/stack.md \
  schemas/project-intelligence.schema.json
```

## Schema Evolution

Schemas are versioned. When Velocity updates a schema:

1. The new schema is added with a higher version
2. Old schemas remain for backwards compatibility
3. `/sync` validates existing files and reports schema drift

Breaking schema changes require explicit migration via:

```
/sync --migrate-schemas
```
