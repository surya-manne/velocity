# Engineering Standards — Velocity Platform

## What We Build

Velocity is a prompt-driven platform. Our outputs are SKILL.md files, agent YAML definitions, schema files, and template files. We do not write production software with runtime dependencies.

## Quality Standards for Velocity Artifacts

### Skill Files (SKILL.md)

- Imperative only. No preamble. No justification for why a rule exists.
- Context load steps must be the first section.
- Every skill must have a defined output path (or "none" if the output is ephemeral).
- Token discipline: skills should be completable by an AI agent without requiring additional explanation.
- Test each skill against at least three stack configurations (greenfield, Spring Boot + React, Go + Next.js) to verify it produces useful output without stack-specific hardcoding.

### Agent Definitions (YAML)

- Role names are fixed and must match the plan-v2.md roster exactly.
- Stack-conditional skills and subagents must be indexed by the exact signal strings used in project-intelligence.schema.json.
- System prompt templates must stay under 1500 token budget.
- Context injection settings must match the agent's actual domain needs — do not over-inject.

### Schemas (JSON/YAML Schema)

- All schemas must include `$schema`, `$id`, `title`, and `description`.
- All required fields must be in the `required` array.
- Enum values must be exhaustive and documented.
- No `additionalProperties: true` in root schemas.

### Templates

- Templates must use `{{PLACEHOLDER}}` syntax for substitution tokens.
- All substitution tokens must be documented in the template's header comment.
- Templates must be valid in their target format (valid YAML, valid Markdown) even before substitution.

## RALPH Loop Integration

Every significant change to a Velocity skill must be validated against a test scenario before merging. Use the RALPH loop to capture feedback from test runs.

## Versioning

Velocity uses semantic versioning for the platform schema (`version: "2.0"` in all config files). Breaking schema changes require a version increment.
