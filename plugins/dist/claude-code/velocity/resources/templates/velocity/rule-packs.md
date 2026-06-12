---
# .velocity/rule-packs.md
#
# Declares which external rule packs and standards to import into Velocity.
# Generated at /init time based on detected stack. Extend manually as needed.
#
# Docs: see skills/rule-pack-engine/SKILL.md
# Schema: schemas/rule-pack.schema.json
#
# Run /init or /sync to apply changes to this file.

version: "2.0"

packs:
  # ─── Git Workflow (all projects) ────────────────────────────────────────────
  - id: git-workflow
    source: agent-rules-books
    enabled: true
    packs:
      - git-workflow

  # ─── Stack-specific packs ────────────────────────────────────────────────────
  # These are auto-populated by /init based on the detected stack.
  # Add, remove, or disable as needed.
  #
  # Examples:
  #
  # - id: react-patterns
  #   source: cursor-rules-community
  #   enabled: true
  #   packs:
  #     - react
  #     - typescript
  #
  # - id: typescript-strictness
  #   source: agent-rules-books
  #   enabled: true
  #   packs:
  #     - typescript
  #
  # - id: spring-boot-patterns
  #   source: agent-rules-books
  #   enabled: true
  #   packs:
  #     - java
  #     - spring
  #
  # - id: nextjs-patterns
  #   source: agent-rules-books
  #   enabled: true
  #   packs:
  #     - nextjs
  #
  # - id: kafka-design
  #   source: agent-rules-books
  #   enabled: true
  #   packs:
  #     - kafka

  # ─── Domain packs ────────────────────────────────────────────────────────────
  # Velocity built-in domain packs for industry verticals.
  #
  # - id: fintech-domain
  #   source: velocity-domain-pack
  #   enabled: true
  #   packs:
  #     - fintech
  #
  # - id: healthtech-domain
  #   source: velocity-domain-pack
  #   enabled: true
  #   packs:
  #     - healthtech

  # ─── Internal company standards ──────────────────────────────────────────────
  # Point to your organization's internal standards directory.
  # Rules in .md files will be imported and classified automatically.
  #
  # - id: company-standards
  #   source: local
  #   enabled: true
  #   path: .company/standards/
  #
  # - id: platform-standards
  #   source: local
  #   enabled: true
  #   path: docs/engineering-standards/
---
