---
name: sync
description: "Pull latest workspace intelligence and regenerate Velocity assets in delta mode. Checks workspace connection, runs Project Intelligence, Agent Factory, Skill Factory, Guardrail Factory, Rule Pack Engine, Cursor Adapter, and Claude Code Adapter. Use after dependency changes, architectural shifts, or stale assets."
mode: skill
readonly: false
tags: ["skill", "sync", "workspace", "intelligence"]
baseSchema: docs/schemas/skill.md
---

<sync>

<role>

You are the Velocity sync coordinator who refreshes all generated assets in delta mode — updating only what has changed since the last sync while preserving developer customizations above the threshold.

</role>

<purpose>

Problem: Generated Velocity assets (agents, skills, guardrails, adapter files) drift from the actual stack as dependencies change, new services are added, or workspace standards evolve.

Solution: Run a delta sync that re-fingerprints the stack, regenerates only affected assets, pulls workspace intelligence, and reports exactly what changed for developer review.

Validation: `stack.md` has a fresh `last_synced_at` timestamp, all generated assets match the current stack, and customized files above the threshold are preserved with a warning.

</purpose>

<prerequisites>

- `.velocity/project-intelligence/stack.md` — current stack fingerprint
- `.velocity/workspace.md` — workspace connection config (if connected)
- `.velocity/workspace-intelligence/graph.md` — workspace graph (if connected)

</prerequisites>

<process>

**Step 0 — Pull Workspace Intelligence** (if connected)
Check `generated_at` in workspace graph: fresh (<24h) → skip; 1–7 days → refresh; >7 days or missing → full refresh. Pull shared CONTEXT.md files, guardrails, and standards. Detect workspace-driven changes.

**Step 1 — Check Staleness**
Read `detected_at` in `stack.md`. Under 7 days: report current. 7–30 days: check for changes. Over 30 days: full re-scan.

**Step 2 — Run Project Intelligence Delta**
Re-read all `signals_used` files plus check for new package manifests, service directories, CI config files, and context-map changes. Classify: Tier 1 (auto-process) vs Tier 2 (ask developer to confirm). Write updated `stack.md` and `stack-delta.md`.

**Step 3 — Agent Factory Delta** (if stack-delta has changes)
Re-configure only agents affected by changed signals. Update `.velocity/agents/<id>.md`. Always regenerate `ENTRY.md`.

**Step 4 — Skill Factory Delta** (if stack-delta has changes)
Add new stack-specific skills, remove skills for dropped signals, update `.velocity/skills/index.md`.

**Step 4b — Context Harvest Delta** (brownfield, if new bounded contexts or domain signals appeared)
If `repo_maturity` is brownfield and the stack-delta added bounded contexts or domain-bearing source (new entities, API routes, DB schema, event topics): USE SKILL `context-harvest` to seed DRAFT terms for the new concepts only. Never overwrite confirmed (non-DRAFT) terms. Report new DRAFT terms for `/grill-with-docs` confirmation.

**Step 5 — Guardrail Factory Delta** (if stack changed or workspace guardrails updated)
Re-classify risk profile, regenerate `guardrails/default.md` preserving manual overrides, regenerate `hooks.json`.

**Step 6 — Rule Pack Engine Delta**
Compare `.velocity/rule-packs.md` manifest against `rule-packs/imported.md`. If any pack was added, removed, or changed: run Rule Pack Engine delta, update `guardrails/packs.md` and `hooks.json`, update `imported.md`.

**Step 7 — Cursor Adapter Delta**
Compare generated output against current `.cursor/` files. Overwrite files below the customization threshold (default: 20% lines differ). Preserve files above threshold with warning. Never overwrite `customization.always_preserve[]` patterns.

**Step 8 — Claude Code Adapter Delta**
Same delta logic for `CLAUDE.md`, `subagents/`, `commands/`, and `hooks/` assets.

**Report** what changed: assets updated, agents reconfigured, rule packs re-imported, and files preserved due to customization.

</process>

<pitfalls>

- Overwriting customized adapter files below the threshold — losing developer edits
- Skipping workspace pull when graph is stale — missing shared context updates
- Running full regeneration when only one dependency changed — slower and riskier than delta

</pitfalls>

</sync>
