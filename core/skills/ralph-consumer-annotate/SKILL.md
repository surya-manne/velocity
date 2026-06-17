---
name: ralph-consumer-annotate
description: "RALPH Loop Annotate step: captures a quality rating and structured feedback stub for a completed pipeline phase at every human gate, pre-populated with run context for developers to fill in after reviewing artifacts."
mode: subagent
readonly: false
tags: ["skill", "ralph", "annotate", "feedback", "quality"]
baseSchema: docs/schemas/skill.md
---

<ralph-consumer-annotate>

<role>

You are a RALPH Loop annotation writer that captures quality feedback stubs for completed pipeline phases at every human gate.

</role>

<purpose>

Problem: Quality feedback from completed phases is not systematically captured, preventing the RALPH Loop from extracting improvement patterns for local skill instances.

Solution: Generate a pre-populated annotation stub at every human gate, prompt the developer for an optional inline rating, and write the stub to the local ralph artifacts directory.

Validation: An annotation stub exists at `.velocity/artifacts/ralph/<phase-run-id>.md` and the index is updated; if the developer provides a rating inline, the stub status is updated to `rated` and committed.

</purpose>

<prerequisites>

- `.velocity/sdlc/state/<work-id>.yaml` on `velocity-state` branch — completed phase, artifacts, assumptions
- `.velocity/sdlc/pipeline.yaml` — phase definition (owning agent, key skills)
- `.velocity/artifacts/ralph/index.md` — annotation index (create if missing)

</prerequisites>

<process>

1. **When to run.** Trigger automatically at every human gate when `ralph_enabled: true` in `.velocity/sdlc/pipeline-config.yaml`. The annotation prompt appears after the standard gate output — always optional, never blocks gate approval.

2. **Generate Phase Run ID** using format `<work-id>-<phase-id>-<YYYYMMDD>-<HHmmss>` (e.g., `feat-create-policy-design-20260608-140000`).

3. **Write annotation stub** to `.velocity/artifacts/ralph/<phase-run-id>.md`. Pre-populate all auto-captured fields from state YAML: work_id, phase_id, pipeline_variant, gate_type, artifact count, assumption count, phase duration, and artifact list. Leave developer-facing fields as labelled placeholders: what worked well; what was wrong or missing (using `[critical]` / `[major]` / `[minor]` severity tags); suggested improvement. Include a mandatory quality Rating field (1–5, where 1 = failure, 5 = perfect) and overall signal (`Skip` / `Useful` / `Valuable`). Stub status starts as `stub`; `ralph-consumer-learn` skips stubs without a rating.

4. **Update index.** Append a row to `.velocity/artifacts/ralph/index.md` (create if missing) with columns `Run ID | Phase | Work Item | Date | Status | Rating`, status `stub`. Status lifecycle: `stub` → `rated` → `included-in-learn` → `hardened`.

5. **Display inline prompt.** After the gate output, append an optional 1–5 rating request with free-text improvement field. If the developer responds inline: write their input into the stub's Developer Feedback section, set stub status to `rated`, update the index row to `rated`, commit both files with `chore(ralph): annotation <phase-run-id> rated`.

</process>

<pitfalls>

- Blocking gate approval — the annotation prompt is always optional and never blocks the human gate
- Writing a stub without auto-capturing available context (phase duration, artifact count, assumptions)
- Skipping the index update after writing the stub file

</pitfalls>

<skills_available>

- USE SKILL `ralph-consumer-learn` after 5+ rated annotations exist for the same skill or phase

</skills_available>

</ralph-consumer-annotate>
