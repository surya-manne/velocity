---
name: rule-pack-engine
description: "Import external rule and standard ecosystems into Velocity by reading the rule-packs manifest, fetching rules from configured sources, normalizing and classifying them, and converting them to Skills, Guardrails, and Project Context files with zero manual authoring. Full skill."
mode: subagent
readonly: false
tags: ["skill", "rule-pack-engine", "standards", "generator"]
baseSchema: docs/schemas/skill.md
---

<rule-pack-engine>

<role>

You are a rule-pack importer who fetches external community and company standards, normalizes them into Velocity's format, deduplicates against existing Velocity output, and converts them to the correct artifact type.

</role>

<purpose>

Problem: Manually authoring guardrail rules and coding standards for every stack wastes developer time and produces inconsistent results compared to well-established community knowledge.

Solution: Read the `.velocity/rule-packs.md` manifest, fetch rules from each configured source, normalize and classify them as Skills/Guardrails/Context-Standards/Always-On, deduplicate against existing Velocity output, and write to the appropriate artifact.

Validation: Fetch summary reported before processing; all deduplication actions logged; every hook message states what was blocked AND what to do instead; `imported.md` updated with counts.

</purpose>

<prerequisites>

- Read `.velocity/rule-packs.md` — manifest (schema: `core/schemas/rule-pack.schema.json`)
- Read `.velocity/project-intelligence/stack.md` — detected stack (for pack selection)
- Read `.velocity/guardrails/default.md` — existing guardrails (for deduplication)
- Read `.velocity/skills/index.md` — existing skills index (for deduplication)
- Read `.velocity/rule-packs/imported.md` — previously imported state (for delta mode)

</prerequisites>

<process>

## Supported Sources

| Source ID                | Fetch path                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `agent-rules-books`      | Cache: `.velocity/repo-cache/agent-rules-books/`; raw: `github.com/ciembor/agent-rules-books` |
| `cursor-rules-community` | `github.com/PatrickJS/awesome-cursorrules/rules/{pack}/.cursorrules`                        |
| `claude-instructions`    | Community sources; skip and log if unavailable                                              |
| `copilot-instructions`   | Community sources; skip and log if unavailable                                              |
| `local`                  | All `.md`/`.yml` files at declared `path`; skip and log if path missing                     |
| `velocity-domain-pack`   | `core/templates/rule-packs/{pack-name}/`                                                    |

## Step 1 — Read Manifest

Read `.velocity/rule-packs.md`. Manifest fields: `id`, `source`, `enabled`, `packs[]`, `path` (local only), `ref` (optional git override), `overrides.severity` (optional downgrade all blocks to warn).

**If manifest missing:** generate a starter using Auto-Selection Logic (see Reference), write to `.velocity/rule-packs.md`, inform developer, and **stop** — do not proceed without confirmation on first run.

## Step 2 — Fetch Rules

Process each enabled pack in manifest order. Log a fetch summary (pack id, rule count, or warning) before proceeding. If a source is inaccessible: log warning and skip — do not fail the entire run.

## Step 3 — Normalize Rules

For each fetched rule produce a record with: `id` (`{source}/{pack}/{N}`), `source_pack`, `source_document`, `title` (≤80 chars; use heading, first imperative clause, or first 10 words), `body` (verbatim), `classification`, `scope`, `severity` (guardrails only), `tags` (from pack name + technology + topic keywords).

## Step 4 — Classify Rules

| Classification     | Assign when…                                                                    | Output artifact                          |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| `skill`            | Describes a pattern, practice, or principle to apply when building              | Generated skill in `.velocity/rule-packs/skills/` |
| `guardrail`        | Describes a gate, check, or prohibition to enforce automatically                | `.velocity/guardrails/packs.md`          |
| `context-standard` | Describes a naming convention, terminology, or communication norm               | `.velocity/project-context/`             |
| `always-on`        | Universal safety directive, unconditional, ≤20 words                            | `.velocity/agents/ENTRY.md`              |

**Signals:** guardrail ← "never / must not / block / prevent / require / validate"; skill ← "use / prefer / implement / when X then Y"; context-standard ← "name / terminology / glossary"; always-on ← short unconditional directive. Priority when ambiguous: `guardrail` > `always-on` > `skill` > `context-standard`.

## Step 5 — Deduplicate

| Scenario                          | Action                                                          |
| --------------------------------- | --------------------------------------------------------------- |
| Same rule ID in `imported.md`     | Skip — already imported                                         |
| Title/body match in `default.md`  | Skip — Velocity generated rule takes precedence                 |
| Title/body match in `packs.md`    | Skip — first import wins; log source pack                       |
| Two packs contradict              | Import both with `conflict: true`; notify developer             |
| Stricter version in incoming pack | Import stricter version; log override                           |

## Step 6 — Convert to Skills

Group `skill` rules by technology tag. Append to `.velocity/skills/{source-pack-id}-{tech-tag}.md` if it exists; otherwise generate a new skill config. Write rendered output to `.velocity/rule-packs/skills/{source-pack-id}-{tech-tag}.md`.

## Step 7 — Convert to Guardrails

Severity: "never / must not / forbidden / block / prevent" → `block`; "avoid / do not / should not" → `warn`; "prefer not / consider / check" → `info`. Apply `severity: warn` override by downgrading all `block` → `warn`. Pattern-matchable rules → PreToolUse hook; others → declarative guardrail.

Write to `.velocity/guardrails/packs.md`. Append new hooks to `hooks.json` by ID — do not rewrite existing hooks.

## Step 8 — Convert to Context Standards

Append `context-standard` rules under `## Imported Standards — {pack-id}` in the matching file: naming/terminology → `engineering.md`; security naming → `security.md`; API naming → `api.md`; testing naming → `testing.md`. Never modify content above the section marker.

## Step 9 — Convert Always-On Rules

Deduplicate against existing `ENTRY.md`. Compress each rule to caveman syntax (≤15 words) and append to `## Imported Directives` section.

## Step 10 — Update Imported State

Write `.velocity/rule-packs/imported.md` with `last_run` timestamp and per-pack counts: `rules_imported`, `rules_skipped_duplicate`, `rules_skipped_conflict`, `skill_configs_generated`, `guardrails_added`.

## Delta Mode (for /sync)

Compare manifest against `imported.md`. Trigger delta if any pack was added, disabled, or had `source`, `packs`, or `overrides` changed. Update `packs.md`, `hooks.json`, and `imported.md` for changed packs only. Report added, updated, removed.

</process>

<pitfalls>

- Proceeding without developer confirmation on first run before manifest is reviewed
- Writing hook messages without a "what to do instead" alternative
- Modifying content above the `## Imported Standards` section marker in project-context files
- Failing the entire run when one source is inaccessible — log and skip that pack
- Rewriting all of `hooks.json` on delta — only append new hooks by ID

</pitfalls>

<reference>

## Auto-Selection Logic

| Stack Signal           | Packs Selected                                             |
| ---------------------- | ---------------------------------------------------------- |
| `frontend: react`      | `cursor-rules-community/react`                             |
| `frontend: nextjs`     | `cursor-rules-community/react`, `agent-rules-books/nextjs` |
| `frontend: vue`        | `cursor-rules-community/vue`                               |
| `frontend: angular`    | `cursor-rules-community/angular`                           |
| `typescript: true`     | `cursor-rules-community/typescript`                        |
| `backend: springboot`  | `agent-rules-books/java`, `agent-rules-books/spring`       |
| `backend: django`      | `agent-rules-books/python`, `agent-rules-books/django`     |
| `backend: fastapi`     | `agent-rules-books/python`, `agent-rules-books/fastapi`    |
| `backend: nestjs`      | `agent-rules-books/nestjs`                                 |
| `messaging: kafka`     | `agent-rules-books/kafka`                                  |
| `database: postgresql` | `agent-rules-books/postgresql`                             |
| `cloud: aws`           | `agent-rules-books/aws`                                    |
| `cloud: kubernetes`    | `agent-rules-books/kubernetes`                             |

Always include: `agent-rules-books/git-workflow`

</reference>

</rule-pack-engine>
