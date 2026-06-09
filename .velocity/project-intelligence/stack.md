---
$schema: "../../../schemas/project-intelligence.schema.json"
version: "2.0"
detected_at: "2026-06-08T00:00:00Z"

languages:
  - name: Markdown
    confidence: 1.0
    primary: true
    notes: "Agent and config files use YAML frontmatter inside .md files"
  - name: JSON
    confidence: 0.9
    primary: false

stack:
  architecture_patterns:
    - prompt-driven
    - skill-chain
    - adapter-pattern

repo_type: single-repo

bounded_contexts:
  - id: velocity-platform
    name: Velocity Platform
    paths:
      - skills/
      - agents/
      - templates/
      - schemas/
    evidence: "directory structure: skills/, agents/, templates/ — each represents a distinct concern in the platform"

signals_used:
  - README.md
  - plan-v2.md
  - skills/
  - agents/
  - schemas/
  - templates/

confidence: 0.95
---
