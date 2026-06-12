---
mode: agent
description: "Pull latest workspace intelligence and regenerate Velocity assets. Checks workspace connection, pulls shared context, then runs delta Project Intelligence, Agent Factory, Skill Factory, Cursor Adapter, and Claude Code Adapter. Use after dependency changes, architectural shifts, or when Velocity detects stale assets at session start. Also available as /velocity-sync in Claude Code."
---


<!-- velocity-plugin: resource resolution -->
> **Plugin resources.** This skill references files under `templates/...` and
> `schemas/...`. These are bundled with the Velocity plugin at .github/velocity-resources.
> When this skill says to read or copy a `templates/...` or `schemas/...` file,
> resolve it from there. If a file cannot be found locally, fetch it from the
> Velocity repository: https://github.com/surya-manne/velocity.

---

# Sync

Regenerate Velocity assets to reflect the current state of this repository.

## What Sync Does

1. Checks workspace connection and pulls latest workspace intelligence (if connected)
2. Re-runs Project Intelligence in delta mode (detect changes since last run)
3. If changes detected: re-runs Agent Factory delta (update affected agents)
4. If changes detected: re-runs Skill Factory delta (update affected skills)
5. Re-runs Cursor Adapter delta (regenerate only changed .cursor/ assets)
6. Re-runs Claude Code Adapter delta (regenerate only changed CLAUDE.md, subagents/, commands/, hooks/ assets)
7. Reports what changed and what the developer should review

**Sync is delta-only.** It does not regenerate assets that have not changed. Custom edits to `.cursor/` files are preserved if they exceed the customization threshold.

---

## Step 0 — Pull Workspace Intelligence

Check `.velocity/project-intelligence/stack.md` for a `workspace` field.

If a workspace connection is configured (e.g. `workspace.source: github.com/org/velocity-workspace`):

### 0a — Check Workspace Freshness

Read `.velocity/workspace-intelligence/graph.md` (if it exists).

Check `generated_at` timestamp:

- Under 24 hours old: "Workspace intelligence is current ({N} hours ago). Skipping workspace pull."
- 1–7 days old: "Workspace intelligence is {N} days old. Refreshing..."
- Over 7 days old: "Workspace intelligence is over 7 days old. Running full workspace refresh..."
- Missing: "No workspace intelligence found. Running workspace pull..."

### 0b — Pull Shared Workspace Context

If workspace needs refresh:

1. Read the workspace repository's `.velocity/workspace.md` (from local clone at `.velocity/repo-cache/workspace/` or via workspace-context-propagation)
2. Read `.velocity/workspace-intelligence/graph.md` from the workspace repository
3. Copy to this repository's `.velocity/workspace-intelligence/`
4. Pull updated shared assets:
   - `.velocity/project-context/` files overridden by workspace-level standards
   - `.velocity/guardrails/workspace.md` (workspace-shared guardrails)
   - Updated CONTEXT.md files for bounded contexts declared in this repository's scope
5. Update `.velocity/context-map.md` with any new workspace-level context entries that affect this repo

If workspace repository is not locally accessible:

```
ℹ Workspace repository not accessible locally.
  To enable workspace intelligence pull: ensure the workspace repo is cloned or add it to your workspace config.
  Continuing with local project intelligence only.
```

### 0c — Detect Workspace-Driven Changes

Compare pulled workspace assets against existing ones. Record any changes as workspace-driven signals for Agent Factory and Skill Factory delta runs.

---

## Step 1 — Check Staleness

Read `.velocity/project-intelligence/stack.md`.

Check `detected_at` timestamp. Report how old the fingerprint is:

- Under 7 days: "Stack fingerprint is current (detected {N} days ago)"
- 7–30 days: "Stack fingerprint is {N} days old. Checking for changes..."
- Over 30 days: "Stack fingerprint is over 30 days old. Running full re-scan..."

---

## Step 2 — Run Project Intelligence (Delta)

Re-read all source files that are in `signals_used` from the existing `stack.md`.

Also check for new files that could indicate a stack change:

- New `package.json`, `pom.xml`, `go.mod` at a new directory level
- New service directories added to a monorepo
- New CI/CD config files
- Modified `context-map.md`

Detect and classify changes:

| Change type                    | Classification | Action                                         |
| ------------------------------ | -------------- | ---------------------------------------------- |
| Dependency version change      | Tier 1         | Flag; check if framework major version changed |
| New service/module added       | Tier 1         | Add to bounded context list                    |
| New `CONTEXT.md` created       | Tier 1         | Update context-map.md                          |
| New ADR added                  | Tier 1         | Update knowledge base index                    |
| New messaging pattern detected | Tier 2         | Flag for developer review                      |
| New API style adopted          | Tier 2         | Flag for developer review                      |
| New architectural pattern      | Tier 2         | Flag for developer review                      |

**Tier 1 changes:** automatically processed in this sync.

**Tier 2 changes:** surface to the developer with a specific question:
"I detected [change]. This may require updating your agents and skills. Confirm to proceed with the update, or skip to defer."

Write updated `stack.md` (preserve `detected_at` of original; add `last_synced_at`).
Write `stack-delta.md` with only changed fields.

---

## Step 3 — Agent Factory Delta

If `stack-delta.md` has changes:

Run Agent Factory with `--delta`:

- Re-configure only the agents affected by the changed signals
- Update `.velocity/agents/<id>.md` for affected agents
- Always regenerate `.velocity/agents/ENTRY.md`

Report which agents were updated.

---

## Step 4 — Skill Factory Delta

If `stack-delta.md` has changes:

Run Skill Factory with `--delta`:

- For new stack signals: generate new stack-specific skills
- For removed signals: remove the corresponding stack-specific skill configs
- Update `.velocity/skills/index.md`

Report which skills were added, updated, or removed.

---

## Step 5 — Guardrail Factory Delta

If `stack-delta.md` has changes OR workspace guardrails were updated in Step 0:

Run Guardrail Factory:

- Re-classify the project's risk profile based on the updated stack
- Regenerate `.velocity/guardrails/default.md` (preserve manual overrides)
- Regenerate `hooks.json` with any new stack-specific hooks

Report which guardrail values changed and which hooks were added or removed.

If no changes detected: skip this step and report "Guardrails unchanged."

---

## Step 6 — Rule Pack Engine Delta

Check whether rule packs need re-importing:

1. Read `.velocity/rule-packs.md` (manifest)
2. Read `.velocity/rule-packs/imported.md` (previous import state)
3. Compare manifests. Trigger a Rule Pack Engine delta run if any of the following are true:
   - A pack was added to the manifest since the last import
   - A pack was disabled since the last import
   - A pack's `source`, `packs`, or `overrides` changed
   - The manifest file is newer than `imported.md`
   - `imported.md` does not exist

If a delta run is needed:

Run Rule Pack Engine with `--delta`:

- Process only changed/new packs (see §Delta Mode in `skills/rule-pack-engine/SKILL.md`)
- Update `.velocity/guardrails/packs.md` and `hooks.json` with any new guardrails and hooks
- Update `.velocity/rule-packs/imported.md`

Report which packs were added, updated, or removed.

If no changes detected: skip this step and report "Rule packs unchanged."

---

## Step 7 — Cursor Adapter Delta

Run Cursor Adapter with `--delta`:

- Compare generated output against current `.cursor/` files
- Update only changed files
- **Customization threshold:** A file is considered "customized" if it differs from the freshly generated template by more than `customization.threshold` (default: 20% of lines, configurable in `.velocity/velocity-config.yml`). Customized files are preserved with a warning; files below the threshold are overwritten.
- Files matching `customization.always_preserve[]` glob patterns are **never** overwritten regardless of threshold.
- Files matching `customization.always_regenerate[]` glob patterns (default: `.cursor/rules/velocity.mdc`) are **always** regenerated regardless of manual edits.

Report which `.cursor/` files were updated, which were skipped (unchanged), which were skipped (customized above threshold), and which were force-regenerated (always_regenerate list).

---

## Step 8 — Claude Code Adapter Delta

Run Claude Code Adapter with `--delta`:

- Compare generated output against current `CLAUDE.md`, `subagents/`, `commands/`, and `hooks/` files
- Update only changed files
- **Customization threshold:** same rules as Step 7. `CLAUDE.md` is in `customization.always_regenerate[]` by default — it is always regenerated.
- Preserve customized `commands/` files (customization threshold: differs from template by >20%)
- Regenerate `CLAUDE.md` if stack, context map, or workspace intelligence changed
- Regenerate affected `subagents/` if agent configs, standards, or CONTEXT.md changed
- Regenerate affected `commands/` if skill configs or context load paths changed
- Regenerate `hooks/pre-tool-use.json` and `hooks/post-tool-use.json` if guardrails changed

Report which Claude Code files were updated, which were skipped (unchanged), and which were skipped (customized).

---

## Step 9 — GitHub Copilot Adapter Delta

Run GitHub Copilot Adapter with `--delta`:

- Compare generated output against current `.github/copilot-instructions.md`, `AGENTS.md`, and `.github/prompts/` files
- Update only changed files
- Preserve customized `.github/prompts/` files (customization threshold: differs from template by >20%)
- Regenerate `.github/copilot-instructions.md` if stack, context map, or workspace intelligence changed
- Regenerate `AGENTS.md` if agent configs, standards, or CONTEXT.md changed
- Regenerate affected `.github/prompts/` files if skill configs or context load paths changed

Report which Copilot files were updated, which were skipped (unchanged), and which were skipped (customized).

---

## Step 10 — Gemini Code Assist Adapter Delta

Run Gemini Code Assist Adapter with `--delta`:

- Compare generated output against current `GEMINI.md`, `.gemini/agents/`, `.gemini/tools/`, and `.gemini/styleguide.md` files
- Update only changed files
- Preserve customized `.gemini/agents/` files (customization threshold: differs from template by >20%)
- Regenerate `GEMINI.md` if stack, context map, or workspace intelligence changed
- Regenerate affected `.gemini/agents/` files if agent configs, standards, or CONTEXT.md changed
- Regenerate `.gemini/tools/velocity-tools.json` if skill configs changed
- Regenerate `.gemini/styleguide.md` if engineering standards changed

Report which Gemini files were updated, which were skipped (unchanged), and which were skipped (customized).

---

## Step 11 — Context Map Check

Check `.velocity/context-map.md`:

- If new CONTEXT.md files were created since last sync: add them to the context map
- If a listed CONTEXT.md path no longer exists: flag it (do not auto-remove)

---

## Step 12 — Sync Report

```
✅ Sync complete

Workspace intelligence:
  [Connected: {workspace-name} | Refreshed / Current / Not connected]
  [Shared standards pulled: yes/no]
  [Shared guardrails pulled: yes/no]
  [CONTEXT.md updates pulled: {N} files | none]

Stack changes detected:
  [List of changes, or "No changes detected"]

Tier 2 changes requiring review:
  [List of flagged architectural shifts, or "None"]

Updated:
  .velocity/workspace-intelligence/ — [refreshed | unchanged | not connected]
  .velocity/project-intelligence/stack.md
  .velocity/agents/ — [N] agents updated
  .velocity/skills/ — [N] skills updated, [N] added, [N] removed
  .velocity/guardrails/ — [updated | unchanged]
  .velocity/rule-packs/ — [N] packs imported, [N] guardrails added, [N] hooks added | unchanged]

  Cursor:
    hooks.json — [updated | unchanged]
    .cursor/ — [N] files updated, [N] files preserved (customized)

  Claude Code:
    CLAUDE.md — [updated | unchanged]
    subagents/ — [N] files updated, [N] files unchanged
    commands/ — [N] files updated, [N] files preserved (customized)
    hooks/ — [updated | unchanged]

  GitHub Copilot:
    .github/copilot-instructions.md — [updated | unchanged]
    AGENTS.md — [updated | unchanged]
    .github/prompts/ — [N] files updated, [N] files preserved (customized)

  Gemini Code Assist:
    GEMINI.md — [updated | unchanged]
    .gemini/agents/ — [N] files updated, [N] files unchanged
    .gemini/tools/velocity-tools.json — [updated | unchanged]
    .gemini/styleguide.md — [updated | unchanged]

No action needed:
  [List of unchanged assets]

Recommended next steps:
  [Based on what changed — e.g., "New Kafka service detected. Review messaging-engineer subagent config."]
  [If workspace CONTEXT.md changed: "Domain language updated. Review .velocity/context-map.md for new terms."]
```

---

## Tier 2 Staleness Notification

When session starts and `.velocity/` is stale (no explicit check needed — the always-on entry documents handle this):

The `.cursor/rules/velocity.mdc` and `CLAUDE.md` contain this instruction (generated by the respective adapters):

```
On session start: check .velocity/project-intelligence/stack.md detected_at.
If over 7 days old: notify developer "Velocity stack fingerprint is {N} days old. Run /sync to check for updates."
```

---

## Manual /sync Workflow

The developer runs `/sync` when:

- A major dependency upgrade has landed
- A new service or module has been added to the monorepo
- A new architectural pattern has been adopted
- The automated CI sync has been blocked for any reason
- The developer feels the agent is not behaving with current project context
