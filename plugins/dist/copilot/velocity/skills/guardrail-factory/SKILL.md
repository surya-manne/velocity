---
name: guardrail-factory
description: "Generate guardrail configuration and PreToolUse hooks tailored to the detected project stack and workspace standards. Produces .velocity/guardrails/default.md and hooks.json from Project Intelligence and Workspace Intelligence. Runs at setup time and on every /sync. No developer configuration required."
---


# Guardrail Factory

Generate guardrail configuration and PreToolUse hooks from project signals. Zero manual authoring.

## Context Load

Read before starting:

1. `.velocity/project-intelligence/stack.md` — detected stack, frameworks, patterns
2. `.velocity/project-context/` — all standards files (engineering, testing, security, api)
3. `.velocity/workspace-intelligence/` — workspace-level guardrail overrides (if exists)
4. `.velocity/guardrails/default.md` — existing config (to preserve manual overrides, if any)

---

## Purpose

Guardrails and hooks are derived from what is in the codebase — not authored by hand. A project that uses TypeScript gets typecheck gates. A project with Kafka gets Kafka-specific hooks. A project with SQL databases gets database safety hooks. The developer never writes a guardrail rule.

This skill runs as part of `/init` and `/sync`. It produces two files:

1. `.velocity/guardrails/default.md` — declarative guardrail config
2. `hooks.json` — Cursor PreToolUse/PostToolUse enforcement hooks

---

## Step 1 — Classify the Project

From `stack.md`, extract and classify:

### Stack Classification

| Signal                    | Classification                |
| ------------------------- | ----------------------------- |
| `frontend` field present  | Has UI layer                  |
| `backend` field present   | Has API/service layer         |
| `database` field present  | Has persistence layer         |
| `messaging` field present | Has event/message layer       |
| `test_framework` field    | Test runner identified        |
| `typecheck_command` field | Static typing enforced        |
| `cloud` field             | Cloud deployment present      |
| `api_style` field         | API contract style identified |

### Risk Classification

Assign one of three risk profiles based on stack signals:

**High risk** (any of):

- Cloud deployment detected (`cloud: aws|gcp|azure`)
- Database with production signals (`database` + no `local_only: true`)
- Payment or PII domain signals in bounded context names or package names
- `api_style: grpc` or external API exposure

**Standard risk** (default):

- Standard web application stack
- Internal tooling

**Low risk**:

- No database
- No external API
- Development-only or tooling repository

---

## Step 2 — Generate Guardrail Config

Write `.velocity/guardrails/default.md` using the following logic.

### Base Config (all projects)

```yaml
version: "2.0"

quality:
  test_coverage_minimum: { COVERAGE_THRESHOLD }
  tdd_loop_required: true
  documentation_required: true

architecture:
  vertical_slice_required: true
  horizontal_layer_pr_blocked: true
  slice_has_tests_at_all_layers: { HAS_LAYERS }
  slice_acceptance_criteria_required: true
  tracer_bullet_first_required: true
  context_window_reset_between_slices: true
  handoff_artifact_required_per_slice: true

domain_language:
  context_md_term_consistency: true
  language_drift_detection: true
```

### Coverage Threshold Rules

| Condition                                   | `test_coverage_minimum`   |
| ------------------------------------------- | ------------------------- |
| Test framework detected + high risk profile | `80`                      |
| Test framework detected + standard risk     | `80`                      |
| Test framework detected + low risk          | `70`                      |
| No test framework detected                  | `0` (skip coverage check) |

### Architecture Layer Rules

`slice_has_tests_at_all_layers`:

- `true` if project has at least 2 distinct layers (UI + API, or API + persistence)
- `false` if single-layer project (e.g., CLI tool, library only)

### Security Config

If risk profile is **high**:

```yaml
security:
  security_review_required: true
  secrets_scan_required: true
  dependency_vulnerability_scan: true
```

If risk profile is **standard**:

```yaml
security:
  security_review_required: false
  secrets_scan_required: true
  dependency_vulnerability_scan: true
```

If risk profile is **low**:

```yaml
security:
  security_review_required: false
  secrets_scan_required: true
  dependency_vulnerability_scan: false
```

### API Config

If `api_style` is detected in `stack.md`:

```yaml
api:
  api_versioning_required: true
  breaking_change_approval_required: true
```

If no API layer detected:

```yaml
api:
  api_versioning_required: false
  breaking_change_approval_required: false
```

### Feedback Loop Config

If `typecheck_command` present in `stack.md`:

```yaml
feedback_loops:
  typecheck_on_every_generated_file: true
  test_after_every_red_green_cycle: true
  lint_before_commit: true
```

If no typecheck command detected:

```yaml
feedback_loops:
  typecheck_on_every_generated_file: false
  test_after_every_red_green_cycle: true
  lint_before_commit: true
```

### Module Architecture Config

Always include:

```yaml
module_architecture:
  deep_module_enforcement: true
  shallow_module_detection: true
  context_md_term_consistency: true
```

### Workspace Overrides

If `.velocity/workspace-intelligence/` exists:

Read the workspace guardrail config (if present) and merge it into the generated config. Workspace settings always override project-level defaults. Log which values were overridden.

---

## Step 3 — Generate PreToolUse Hooks

Produce the `pre_tool_use_hooks` section of `default.md` and the full `hooks.json`.

### Base Safety Hooks (all projects)

Always include these hooks:

```yaml
pre_tool_use_hooks:
  - event: PreToolUse
    tool: Bash
    pattern: "git push --force(?! *--force-with-lease)"
    action: block
    message: "Force push blocked by Velocity guardrail. Use --force-with-lease instead to protect against overwriting others' work."

  - event: PreToolUse
    tool: Bash
    pattern: "git reset --hard"
    action: block
    message: "Hard reset blocked. Stash your changes or commit them first. Hard reset cannot be undone."

  - event: PreToolUse
    tool: Bash
    pattern: "git commit.*--(no-verify|no-gpg-sign)"
    action: warn
    message: "Commit hook bypass detected. Only bypass pre-commit hooks when explicitly authorized."

  - event: PreToolUse
    tool: Bash
    pattern: "curl.*\\|.*(sh|bash)|wget.*\\|.*(sh|bash)"
    action: block
    message: "Pipe-to-shell blocked. Never execute untrusted remote scripts. Download and inspect first."

  - event: PreToolUse
    tool: Bash
    pattern: "rm -rf (?!.*(node_modules|dist|build|\\.next|__pycache__|target|\\.gradle|vendor|\\.cache|coverage))"
    action: warn
    message: "Destructive rm -rf outside of build artifact directories. Confirm this is intentional."
```

### Stack-Conditional Hooks

Add the following hooks based on detected stack signals:

#### SQL Database Detected (`database: postgresql|mysql|sqlite|mariadb`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "(?i)(drop\\s+table|drop\\s+database|drop\\s+schema)"
  action: block
  message: "DROP TABLE/DATABASE/SCHEMA blocked. Use a reversible migration with an explicit down step."

- event: PreToolUse
  tool: Bash
  pattern: "(?i)delete\\s+from\\s+\\w+\\s*(?:;|$)(?!.*where)"
  action: warn
  message: "DELETE FROM without WHERE clause detected. This will delete ALL rows. Add a WHERE clause or confirm this is intentional."

- event: PreToolUse
  tool: Bash
  pattern: "(?i)truncate\\s+(table\\s+)?\\w+"
  action: warn
  message: "TRUNCATE TABLE detected. This deletes all rows without WHERE filtering. Confirm this is intentional."

- event: PreToolUse
  tool: Bash
  pattern: "(?i)alter\\s+table.*drop\\s+column"
  action: warn
  message: "DROP COLUMN detected. Ensure a down migration exists and no application code still references this column."
```

#### Kafka/Messaging Detected (`messaging: kafka`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "kafka-topics.*--delete|kafka-topics\\.sh.*--delete"
  action: block
  message: "Kafka topic deletion blocked in agent session. Topic deletion is irreversible and loses all unconsumed messages."

- event: PreToolUse
  tool: Bash
  pattern: "kafka-consumer-groups.*--reset-offsets"
  action: warn
  message: "Consumer group offset reset detected. This will reprocess or skip messages. Confirm this is intentional."
```

#### Cloud — AWS (`cloud: aws`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "aws.*delete|aws.*remove|aws.*terminate"
  action: warn
  message: "AWS destructive operation detected. Confirm the target resource and region before proceeding."

- event: PreToolUse
  tool: Bash
  pattern: "aws s3 rm.*--recursive"
  action: block
  message: "Recursive S3 delete blocked. This operation is irreversible. Confirm bucket and prefix before executing manually."

- event: PreToolUse
  tool: Bash
  pattern: "aws ec2 terminate-instances"
  action: block
  message: "EC2 instance termination blocked in agent session. Terminate instances manually after confirmation."
```

#### Cloud — GCP (`cloud: gcp`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "gcloud.*delete|gsutil rm -r"
  action: warn
  message: "GCP destructive operation detected. Confirm the target resource before proceeding."
```

#### Cloud — Azure (`cloud: azure`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "az.*delete|az group delete"
  action: warn
  message: "Azure destructive operation detected. Confirm the target resource and resource group before proceeding."
```

#### Node.js / npm (`frontend: react|nextjs|vue|angular` or `backend: nodejs|nestjs|express`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "npm publish|yarn publish|pnpm publish"
  action: warn
  message: "Package publish detected. Confirm version, changelog, and release notes before publishing to the registry."

- event: PreToolUse
  tool: Bash
  pattern: "npm deprecate|yarn deprecate"
  action: warn
  message: "Package deprecation detected. This affects all users of the package. Confirm this is intentional."
```

#### Java / Maven (`backend: springboot|quarkus|java`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "mvn deploy|mvn release"
  action: warn
  message: "Maven deploy/release detected. Confirm artifact version and target repository before proceeding."

- event: PreToolUse
  tool: Bash
  pattern: "mvn.*clean.*install.*-DskipTests"
  action: warn
  message: "Maven build with skipped tests detected. Do not skip tests in CI or pre-release builds."
```

#### Python (`backend: django|fastapi|flask`)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "pip install.*--user|pip install(?!.*requirements)"
  action: warn
  message: "Global pip install detected. Install into a virtual environment instead."

- event: PreToolUse
  tool: Bash
  pattern: "python.*manage\\.py.*flush|python.*manage\\.py.*reset"
  action: block
  message: "Django database flush/reset blocked. This destroys all data. Run manually with explicit confirmation."
```

#### Docker (`docker` detected in stack signals)

```yaml
- event: PreToolUse
  tool: Bash
  pattern: "docker system prune|docker volume prune|docker image prune -a"
  action: warn
  message: "Docker prune detected. This will remove all unused containers/volumes/images. Confirm this won't affect running services."

- event: PreToolUse
  tool: Bash
  pattern: "docker.*--privileged"
  action: warn
  message: "Docker privileged mode detected. This grants full host access. Confirm this is required and intentional."
```

#### Secrets-Sensitive Domains (high risk profile)

```yaml
- event: PreToolUse
  tool: Write
  pattern: "(?i)(api_key|secret_key|password|token|credentials|private_key)\\s*[:=]\\s*['\"][^'\"]{8,}"
  action: warn
  message: "Potential secret being written to a file. Ensure secrets are stored in environment variables or a secrets manager, not in source files."
```

---

## Step 4 — Write hooks.json

Translate `pre_tool_use_hooks` from `default.md` into Cursor's `hooks.json` format.

The `hooks.json` format wraps each hook in a `hooks` array:

```json
{
  "hooks": [
    {
      "event": "<event>",
      "tool": "<tool>",
      "matcher": {
        "pattern": "<regex-pattern>"
      },
      "action": "<block|warn>",
      "message": "<message>"
    }
  ]
}
```

Write to: `hooks.json` in the repository root.

Always write the full set — do not append. This file is regenerated completely on each run to prevent stale hooks accumulating.

---

## Step 5 — Preserve Manual Overrides

Before writing `default.md`, check if a `default.md` already exists.

If it exists:

1. Read the existing file
2. Identify any values that differ from the generated values
3. For each difference, check if the existing value appears to be a manual override (i.e., it was not set by a previous Guardrail Factory run)
4. Preserve manual overrides — do not revert them
5. Log which values were preserved vs. regenerated

Signals that a value is a manual override:

- It is stricter than the generated default (e.g., `test_coverage_minimum: 90` when generated default is `80`)
- It has a comment in the YAML noting it as intentional

Do not preserve:

- Values from a previous Guardrail Factory run that are now outdated due to stack changes
- Values that are less strict than the generated default without a comment

---

## Step 6 — Validate Output

After writing both files, run a self-check:

| Check                                                           | Pass condition                      |
| --------------------------------------------------------------- | ----------------------------------- |
| `default.md` validates against `schemas/guardrails.schema.json` | No schema violations                |
| All `pre_tool_use_hooks` patterns are valid regex               | Each pattern compiles without error |
| `hooks.json` contains all hooks from `pre_tool_use_hooks`       | Count matches                       |
| No duplicate hook patterns                                      | Each regex is unique                |

If any check fails: report the failure with the specific issue and do not write the file.

---

## Output

```
Velocity Guardrail Factory — {project-name}

Stack signals read:
  Frontend:   {detected or none}
  Backend:    {detected or none}
  Database:   {detected or none}
  Messaging:  {detected or none}
  Test:       {detected or none}
  Cloud:      {detected or none}

Risk profile: {high | standard | low}

Generated .velocity/guardrails/default.md
  Coverage threshold: {N}%
  Feedback loops: {enabled/disabled}
  Security review: {required/not required}
  API versioning: {required/not required}
  Pre-tool-use hooks: {N} rules

Generated hooks.json
  Base safety hooks: {N}
  Stack-specific hooks: {N}
  Total: {N} hooks

{If manual overrides preserved:}
Preserved manual overrides:
  - test_coverage_minimum: 90 (stricter than generated default of 80)

All guardrails are now active. No manual configuration required.
```
