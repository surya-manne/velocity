---
$schema: "../../schemas/guardrails.schema.json"
version: "2.0"

# Velocity platform repository guardrails
# These govern how we develop Velocity itself

quality:
  test_coverage_minimum: 0 # Not applicable — Velocity artifacts are tested via RALPH runs
  tdd_loop_required: false # Not applicable — we produce prompts, not code
  documentation_required: true

architecture:
  vertical_slice_required: true
  horizontal_layer_pr_blocked: true
  slice_has_tests_at_all_layers: false # Not applicable
  slice_acceptance_criteria_required: true
  tracer_bullet_first_required: true
  context_window_reset_between_slices: true
  handoff_artifact_required_per_slice: true

domain_language:
  context_md_term_consistency: true
  language_drift_detection: true

security:
  security_review_required: false # No production infrastructure
  secrets_scan_required: true # No secrets ever in skill files
  dependency_vulnerability_scan: false

api:
  api_versioning_required: false
  breaking_change_approval_required: true # Schema version bumps require review

feedback_loops:
  typecheck_on_every_generated_file: false
  test_after_every_red_green_cycle: false
  lint_before_commit: false

module_architecture:
  deep_module_enforcement: true # skills must have simple interfaces + complex implementations
  shallow_module_detection: true # flag skills that expose too much in their frontmatter/structure
  context_md_term_consistency: true # skill/agent names must match CONTEXT.md glossary

loop:
  max_attempts: 3
  require_approval_for_all: false
  pause_on_validation_failure: false
  auto_remediate_term_drift: true
  auto_remediate_missing_tests: false # Not applicable — Velocity artifacts are prompts, not executable code
  pr_per_task: true

governance:
  audit:
    enabled: true
    retention_days: 365
    archive_after_days: 30
    required_events:
      - guardrail.override
      - guardrail.block
      - approval.requested
      - approval.granted
      - approval.rejected
      - validate.result
      - loop.task.complete
      - loop.task.paused

  approval:
    timeout_hours: 8
    require_comment: true
    pr_review_mode: false

  risk_scoring:
    enabled: true
    approval_threshold: 50
    compliance_review_threshold: 75
    medium_warn_threshold: 25

  compliance_packs:
    active: [] # Velocity platform repo has no active compliance packs

pre_tool_use_hooks:
  - event: PreToolUse
    tool: Bash
    pattern: "git push --force(?! *--force-with-lease)"
    action: block
    message: "Force push blocked. Use --force-with-lease."

  - event: PreToolUse
    tool: Bash
    pattern: "git reset --hard"
    action: block
    message: "Hard reset blocked. Stash or commit first."
---
