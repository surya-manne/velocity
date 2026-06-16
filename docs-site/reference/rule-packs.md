# Rule Packs Reference

Rule packs are bundles of external standards imported into your Velocity workspace. They are managed in `.velocity/rule-packs.md` and applied by the `/rule-pack-engine` skill.

## Pack Sources

| Source                   | Description                            | Type      |
| ------------------------ | -------------------------------------- | --------- |
| `agent-rules-books`      | Community engineering rule collections | Community |
| `cursor-rules-community` | Popular Cursor .mdc rule files         | Community |
| `claude-instructions`    | Claude Code instruction templates      | Community |
| `copilot-instructions`   | Copilot instruction examples           | Community |
| `velocity-domain-pack`   | Velocity's domain/compliance bundles   | Official  |
| `local`                  | Your organization's internal standards | Local     |
| `url`                    | Any accessible URL                     | External  |

## Available Packs

### Community Packs (agent-rules-books)

| Pack ID               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `git-workflow`        | Git branching, commit messages, PR standards      |
| `typescript-strict`   | TypeScript strict mode best practices             |
| `react-patterns`      | React component patterns and hooks best practices |
| `vue-patterns`        | Vue 3 Composition API patterns                    |
| `angular-patterns`    | Angular best practices                            |
| `next-js`             | Next.js App Router patterns                       |
| `fastify-patterns`    | Fastify plugin and route patterns                 |
| `spring-boot`         | Spring Boot best practices                        |
| `django-patterns`     | Django model and view best practices              |
| `express-patterns`    | Express.js middleware and route patterns          |
| `postgresql-patterns` | PostgreSQL query and schema patterns              |
| `kafka-patterns`      | Kafka producer/consumer patterns                  |
| `docker-patterns`     | Dockerfile and compose best practices             |

### Velocity Domain Packs

| Pack ID              | Standards Covered                  |
| -------------------- | ---------------------------------- |
| `fintech-compliance` | Multi-framework FinTech compliance |
| `pci-dss`            | PCI DSS v4.0                       |
| `hipaa`              | HIPAA Security Rule                |
| `soc2`               | SOC 2 Type II                      |
| `iso-27001`          | ISO/IEC 27001:2022                 |
| `gdpr`               | GDPR (EU)                          |
| `ecommerce`          | E-commerce patterns and guardrails |
| `healthtech`         | Healthcare technology patterns     |

## Manifest Format

```yaml
# .velocity/rule-packs.md
version: "2.0"

packs:
  # Git workflow — enabled by default
  - id: git-workflow
    source: agent-rules-books
    version: "1.2.0"
    enabled: true

  # Stack-specific (uncomment for your stack)
  # - id: typescript-strict
  #   source: cursor-rules-community
  #   version: latest
  #   enabled: false

  # - id: react-patterns
  #   source: agent-rules-books
  #   enabled: false

  # Domain compliance (for regulated industries)
  # - id: pci-dss
  #   source: velocity-domain-pack
  #   enabled: false

  # Local company standards
  # - id: our-security-policy
  #   source: local
  #   path: ./standards/security-policy.md
  #   enabled: false

  # External URL
  # - id: external-standards
  #   source: url
  #   url: https://standards.example.com/engineering.md
  #   enabled: false
```

## Rule Classification

Each imported rule is classified and routed to the appropriate Velocity layer:

| Classification     | Destination                                    | Effect                               |
| ------------------ | ---------------------------------------------- | ------------------------------------ |
| `skill`            | `.velocity/rule-packs/skills/`                 | New skill invokable as `/skill-name` |
| `guardrail`        | `.velocity/guardrails/packs.md` + `hooks.json` | Enforced on every tool call          |
| `context-standard` | `.velocity/project-context/*.md`               | Read by agents before acting         |
| `always-on`        | Entry document (CLAUDE.md, velocity.mdc, etc.) | Active on every message              |

## Viewing Imported Rules

After running `/rule-pack-engine`:

```
.velocity/rule-packs/
├── imported.md                 # Index of all imported packs
├── skills/                     # Skills from packs
│   ├── repository-pattern.md
│   └── typescript-strict.md
└── guardrails/
    └── packs.md                # Guardrails from packs
```

## Managing Packs

### Install a Pack

```
# 1. Add to manifest
# 2. Run:
/rule-pack-engine
```

### Update a Pack

```yaml
# Bump version in manifest
- id: git-workflow
  version: "1.3.0" # bumped from 1.2.0

# Then run:
# /rule-pack-engine
```

### Remove a Pack

```yaml
# Disable in manifest (don't delete — preserves history)
- id: git-workflow
  enabled: false
```

Then run `/rule-pack-engine` — the engine removes the imported rules for disabled packs from `packs.md` and `hooks.json`.

## Creating a Local Pack

Create a standards file and reference it in the manifest:

```markdown
<!-- standards/our-api-standards.md -->

# Our API Standards

## Always Use RFC 7807 Error Format

type: always-on
severity: high
All API errors must use application/problem+json format.

## Repository Pattern for Data Access

type: skill
severity: medium
All data access must go through a Repository interface.
Direct database queries in controllers are not permitted.

## No Sensitive Fields in Log Output

type: guardrail
severity: critical
API responses and log statements must not include: password, ssn,
credit_card, api_key, secret, token, private_key
```

```yaml
# In .velocity/rule-packs.md
- id: our-api-standards
  source: local
  path: ./standards/our-api-standards.md
  enabled: true
```
