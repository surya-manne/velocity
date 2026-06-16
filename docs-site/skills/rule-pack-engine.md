# /rule-pack-engine — Standards Import

`/rule-pack-engine` imports external standards collections (community books, local company rules, domain packs) and integrates them into your Velocity workspace as skills, guardrails, context standards, or always-on rules.

## Why Rule Packs?

Your team doesn't write every engineering standard from scratch. You follow community best practices for React, TypeScript, Spring Boot, or Kafka. You follow your company's internal security policy. You comply with domain-specific standards for FinTech or Healthcare.

Rule packs import these standards into the correct Velocity layer — automatically classified and integrated.

## The 10-Step Import Pipeline

```
1. Read manifest (.velocity/rule-packs.md)
2. Fetch from sources
3. Normalize rules
4. Classify each rule
5. Deduplicate against existing config
6. Convert skills
7. Convert guardrails
8. Convert context standards
9. Convert always-on rules
10. Update imported.md index
```

## Sources

| Source Type              | Description                    | Examples                                                        |
| ------------------------ | ------------------------------ | --------------------------------------------------------------- |
| `agent-rules-books`      | Community rule books           | react-rules, typescript-rules, spring-boot-rules                |
| `cursor-rules-community` | Cursor community rules         | Popular .mdc rule collections                                   |
| `local`                  | Your team's internal standards | `./standards/security-policy.md`                                |
| `velocity-domain-pack`   | Domain-specific packs          | `velocity/fintech`, `velocity/healthtech`, `velocity/ecommerce` |

## The Manifest

Packs are managed in `.velocity/rule-packs.md`:

```yaml
# .velocity/rule-packs.md
version: "2.0"

packs:
  # Git workflow — enabled by default after /init
  - id: git-workflow
    source: agent-rules-books
    version: "1.2.0"
    enabled: true

  # Stack-specific (uncomment when ready)
  # - id: typescript-strict
  #   source: cursor-rules-community
  #   enabled: false

  # - id: react-patterns
  #   source: agent-rules-books
  #   enabled: false

  # Domain packs (uncomment for your domain)
  # - id: fintech-compliance
  #   source: velocity-domain-pack
  #   enabled: false

  # Local standards
  # - id: company-security-policy
  #   source: local
  #   path: ./standards/security-policy.md
  #   enabled: false
```

## Rule Classification

Each imported rule is classified into one of four types:

### `skill`

Standards that describe _how to do something_ — best practices, patterns, approaches.

```
Example: "Use Repository pattern for data access"
→ Becomes a skill in .velocity/rule-packs/skills/repository-pattern.md
→ Invokable as /repository-pattern
```

### `guardrail`

Standards that _prevent_ dangerous or incorrect actions — things that should be blocked.

```
Example: "Never expose PII in API responses"
→ Merges into .velocity/guardrails/packs.md
→ Added to hooks.json as a PreToolUse check
```

### `context-standard`

Standards about _naming, terminology, and domain language_.

```
Example: "Use ISO 8601 for all date/time fields"
→ Appended to .velocity/project-context/api.md
→ Agents read this before writing API contracts
```

### `always-on`

Standards that must be _continuously active_ — core principles that apply to everything.

```
Example: "All functions must have a single responsibility"
→ Compressed and appended to entry document (velocity.mdc, CLAUDE.md, etc.)
→ Active on every message
```

## Deduplication

Before importing, the engine checks for conflicts:

- Rules that overlap with existing guardrails are merged (not duplicated)
- Rules that contradict existing standards are flagged for manual resolution
- Identical rules from multiple sources are deduplicated to the highest authority version

## Domain Packs

Velocity ships domain-specific packs for regulated industries:

### FinTech Pack

- PCI DSS compliance guardrails
- Financial calculation precision rules (no floating point for money)
- Idempotency requirements for payment operations
- Audit trail requirements
- Regulatory reporting standards

### HealthTech Pack

- HIPAA PHI handling guardrails
- Minimum necessary access principle
- De-identification standards
- Audit logging requirements
- Consent management patterns

### E-commerce Pack

- Cart abandonment handling patterns
- Inventory reservation guardrails
- Order state machine standards
- Tax calculation patterns

## Delta Mode

When `/sync` runs, the rule pack engine operates in delta mode:

- Only newly added or updated packs are processed
- Existing imported rules are not re-imported
- `imported.md` tracks what was imported in which version

## Usage

```
/rule-pack-engine
```

The skill reads the manifest, processes enabled packs, and reports what was imported.

To add a new pack:

1. Add it to `.velocity/rule-packs.md` with `enabled: true`
2. Run `/rule-pack-engine`
3. Review generated guardrails and skills
4. Commit

## Output

```
.velocity/rule-packs/
├── imported.md                    # Index of imported packs
├── skills/                        # Rules converted to skills
│   ├── repository-pattern.md
│   └── typescript-strict.md
└── guardrails/
    └── packs.md                   # Rules converted to guardrails
```
