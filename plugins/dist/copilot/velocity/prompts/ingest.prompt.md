---
mode: agent
description: "Knowledge Engine ingestion: normalize and index ADRs, CONTEXT.md files, git history, documentation, incidents, and runbooks into .velocity/knowledge-base/. Regenerates index.md and builds cross-links between decisions, incidents, and code changes. Run automatically as part of /init and /sync, or directly after adding new knowledge documents."
---


# Ingest

Ingest organizational memory into the knowledge base.

## Context Load

Read before starting:

1. `.velocity/context-map.md` — all bounded contexts and their CONTEXT.md paths
2. `.velocity/knowledge-base/index.md` — current knowledge base state (what is already indexed)
3. `.velocity/project-intelligence/stack.md` — project stack (used to classify architecture docs)

---

## Purpose

The knowledge base is the organizational memory agents read on demand. Documents scattered across the repository are invisible to agents unless they are indexed in `.velocity/knowledge-base/`. This skill:

1. Discovers all qualifying documents across the repository
2. Normalizes them to consistent markdown structure
3. Writes normalized copies to `.velocity/knowledge-base/` (or records paths for large docs)
4. Regenerates `index.md` — the single entry point all agents navigate from
5. Builds cross-links between decisions, incidents, and code changes

Run after `/init`, after `/sync`, or whenever new knowledge documents are added.

---

## Step 1 — Discovery

Scan for each document type. Report what is found before processing:

### ADRs

- `.velocity/artifacts/adrs/ADR-*.md` — Velocity-generated ADRs (primary)
- `docs/adr/*.md`, `docs/decisions/*.md`, `adr/*.md` — conventional ADR locations (external)

### CONTEXT.md Files

- Read `.velocity/context-map.md`
- Collect every CONTEXT.md path listed under each bounded context entry

### Git History

- Run: `git log --oneline --format="%h %ad %s" --date=short --since="90 days ago"`
- Capture up to 200 commits; group by directory prefix from the commit body if available

### Documentation

- `docs/**/*.md` — project documentation directory
- `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md` at project root

### Incidents and Postmortems

- `incidents/*.md`, `postmortems/*.md`
- `docs/incidents/*.md`, `docs/postmortems/*.md`
- Any `.md` file with "incident", "postmortem", or "outage" in the filename

### Runbooks

- `runbooks/*.md`, `docs/runbooks/*.md`, `ops/runbooks/*.md`
- Any `.md` file with "runbook" in the filename

### Product Decisions

- `.velocity/artifacts/prds/` — PRDs
- `.velocity/artifacts/features/` — feature boards
- `docs/product/*.md`

Report discovery results before proceeding:

```
Discovery:
- ADRs: {N} Velocity-generated, {N} external
- CONTEXT.md files: {N} ({bounded-context names})
- Git commits to digest: {N} (last 90 days)
- Documentation files: {N}
- Incidents/postmortems: {N}
- Runbooks: {N}
- Product decisions: {N}
```

---

## Step 2 — Normalize and Index ADRs

### Velocity-generated ADRs (`.velocity/artifacts/adrs/`)

These are already normalized. Read `.velocity/knowledge-base/adrs/index.md` and update any rows that are missing or stale:

Row format: `| ADR-{id} | {Title} | {date} | {bounded-context} | {Status} |`

### External ADRs

For each external ADR file:

1. Read the file
2. Extract: title (from `# Heading`), decision summary (from `## Decision` or `## Summary` section — first 2 sentences), date, status
3. Copy to `.velocity/knowledge-base/adrs/{original-filename}` (do not rename)
4. Add a row to `.velocity/knowledge-base/adrs/index.md`

If the external ADR uses a non-standard format (no `## Decision` section, freeform prose):

- Extract the first sentence after the `# Title` as the decision summary
- Note the format inconsistency in the index row: `{Title} [format: non-standard]`

Do not reformat external ADRs. Copy as-is; note inconsistencies for the developer to review.

---

## Step 3 — Index CONTEXT.md Files

For each bounded context in `.velocity/context-map.md`:

1. Read CONTEXT.md at the path specified
2. Extract:
   - Context name
   - Term count (count entries in `## Terms`)
   - Decision count (count entries in `## Decisions`)
   - Last-modified date (from git: `git log -1 --format="%ad" --date=short -- {path}`)
3. Verify the standard heading structure exists: `## Terms`, `## Decisions`, `## Bounded Context Relationships`, `## Out of Scope`
   - If a section is missing, note it as a gap (do not modify the file)

Cross-link related contexts: for each `## Bounded Context Relationships` entry in a CONTEXT.md, record the relationship pair in the cross-links map (Step 8).

---

## Step 4 — Generate Git Digest

Produce a compact digest. Write to `.velocity/knowledge-base/git-digest/{YYYY-MM}.md`.

If a file for the current month already exists, append new commits to it rather than replacing.

### Significance Filter

Include in the digest:

- Commits with `feat:`, `breaking:`, `migration:`, `refactor:`, `arch:`, `perf:`, `security:` prefixes
- Commits touching `migrations/`, `schema/`, `api/`, `events/`, `domain/` directories

Exclude from the digest:

- `fix:`, `chore:`, `docs:`, `test:`, `style:` commits (unless they are breaking)
- Automated commits (dependency bumps, CI-only changes)

### Change Hotspots

Group all commits (including excluded ones) by top-level directory. Count commits per directory. List the top 5 most-changed areas.

### Digest Format

```markdown
# Git Digest — {Month YYYY}

## Period: {start-date} to {end-date}

## Volume

- Total commits: {N}
- Significant commits included below: {N}

## Change Hotspots

| Area         | Commits | Notes                             |
| ------------ | ------- | --------------------------------- |
| {dir/module} | {N}     | {1-line note on notable activity} |
| {dir/module} | {N}     |                                   |

## Significant Changes

| Hash   | Date   | Summary          |
| ------ | ------ | ---------------- |
| {hash} | {date} | {commit subject} |

## Patterns

{1–3 sentences on observed patterns — e.g., "Heavy activity in the payments service this month. Two schema migrations suggest active data model iteration. No changes to the auth module."}
```

---

## Step 5 — Index Documentation

For each documentation file found:

1. Extract title (first `# Heading` or filename without extension)
2. Extract a 2–3 sentence summary (first non-heading paragraph)
3. Record: title, path, last-modified date (from git or filesystem)

Do not copy documentation files to `.velocity/knowledge-base/`. Agents navigate to them from the index using their original paths.

---

## Step 6 — Ingest Incidents and Postmortems

For each incident/postmortem file found:

1. Extract:
   - Title
   - Date
   - Severity (P0/P1/P2 or equivalent, if present)
   - Affected systems (1–3 words per system)
   - Root cause (1–2 sentences)
   - Resolution (1–2 sentences)
   - Follow-up ADRs generated (if referenced)
2. Normalize to the standard structure (see `templates/knowledge-base/incident.md`) and write to `.velocity/knowledge-base/incidents/{filename}`
3. If the source file already uses the standard structure, normalize section headings only

If the file is freeform prose, extract the above fields as best as possible. Note any fields that could not be extracted: `[field: not found in source]`.

---

## Step 7 — Ingest Runbooks

For each runbook file found:

1. Extract:
   - Title
   - Purpose (1 sentence — what problem does this runbook solve?)
   - Affected system
   - Last-run date (if recorded in the file)
2. Copy to `.velocity/knowledge-base/runbooks/{filename}`
3. Check for a `## Steps` or `## Procedure` section; note if missing (runbook is incomplete)

---

## Step 8 — Build Knowledge Graph Cross-Links

After all documents are indexed, build cross-reference links between them.

### Cross-Link Rules

**ADR → Incident:**
Does any incident's root cause section reference this ADR? Does any incident's "Actions Taken" section mention this ADR as a follow-up?

**ADR → CONTEXT.md:**
Does any CONTEXT.md `## Decisions` section reference this ADR ID?

**Incident → ADR:**
Did this incident produce follow-up ADRs? (Check "Actions Taken" section)

**Incident → Runbook:**
Did this incident produce or update a runbook? (Check "Actions Taken" section)

**PRD → ADR:**
Does any PRD reference existing ADRs as constraints or dependencies?

### Cross-Link Annotation

Append cross-link metadata to each document's index row:

```
| ADR-012 | Use idempotency keys on payments | 2024-03-15 | payments | Accepted | → INC-003, PRD-007 |
| INC-003 | Payment double-charge incident   | 2024-03-10 | P0       |          | → ADR-012, RB-005  |
```

Add a `## Cross-Links Summary` section to the regenerated `index.md`.

---

## Step 9 — Regenerate index.md

Rewrite `.velocity/knowledge-base/index.md` with the complete current state.

Use this format exactly:

```markdown
# Knowledge Base Index

> Auto-generated by /ingest. Last updated: {date}
> Skills read this index first, then navigate to documents by path.
> Agents never read the entire knowledge base at once.

## Architecture Decision Records

| ID       | Title   | Date   | Context   | Status   | Cross-Links |
| -------- | ------- | ------ | --------- | -------- | ----------- |
| ADR-{id} | {title} | {date} | {context} | Accepted |             |

_(No ADRs yet)_ — use this placeholder row if the section is empty.

## CONTEXT.md Files

| Context   | Path   | Terms | Decisions | Last Updated |
| --------- | ------ | ----- | --------- | ------------ |
| {context} | {path} | {N}   | {N}       | {date}       |

## Git Digest

| Period       | Path                                             | Commits |
| ------------ | ------------------------------------------------ | ------- |
| {Month YYYY} | .velocity/knowledge-base/git-digest/{YYYY-MM}.md | {N}     |

## Product Decisions

| Title   | Path   | Date   |
| ------- | ------ | ------ |
| {title} | {path} | {date} |

## Documentation

| Title   | Path   | Date   |
| ------- | ------ | ------ |
| {title} | {path} | {date} |

## Incidents and Postmortems

| ID      | Title   | Date   | Severity | Cross-Links |
| ------- | ------- | ------ | -------- | ----------- |
| INC-{N} | {title} | {date} | {sev}    |             |

## Runbooks

| Title   | Path                                         | System   |
| ------- | -------------------------------------------- | -------- |
| {title} | .velocity/knowledge-base/runbooks/{filename} | {system} |

## Cross-Links Summary

| Document | Linked To             |
| -------- | --------------------- |
| ADR-{id} | {INC-id, PRD-id, ...} |

---

_Skills read this index first, then navigate to specific documents by path._
_Agents never read the entire knowledge base at once._
```

Use `_(None yet)_` rows for any section with no documents.

---

## Completion

Report the ingest results:

```
Knowledge base updated ({date}):
- ADRs indexed: {N} ({N} Velocity-generated, {N} external)
- CONTEXT.md files indexed: {N}
- Git digest generated: {period} ({N} significant commits)
- Documentation indexed: {N}
- Incidents indexed: {N}
- Runbooks indexed: {N}
- Cross-links built: {N}

.velocity/knowledge-base/index.md regenerated.
```

If structural gaps were detected, list them:

```
Gaps detected (review recommended):
- {path}: missing {section name}
- {path}: {field} could not be extracted — freeform format
```

If nothing was found in one or more categories, note it:

```
No documents found in: {incidents, runbooks, ...}
Placeholder rows written to index.md for these sections.
```

---

## Optional: Vector Index Sidecar

> **Not required for core operation.** Enable this step only when the knowledge base has grown large (50+ ADRs, 10+ CONTEXT.md files, or 200+ indexed documents) and agents are struggling to find relevant entries manually via `index.md`.

If the developer requests vector indexing (or `velocity-config.yml` sets `knowledge_base.vector_index: true`):

### What it generates

Write `.velocity/knowledge-base/ingest-index.json` — a compact embedding-ready JSON document.

Each entry is a flat object with:

```json
{
  "id": "{type}-{id}",
  "type": "adr | context | incident | runbook | doc | git-digest | product",
  "title": "{document title}",
  "summary": "{2–3 sentence summary}",
  "path": "{path relative to repo root}",
  "date": "{ISO date}",
  "tags": ["{tag1}", "{tag2}"],
  "cross_links": ["{linked-doc-id}", ...]
}
```

### Rules

- Entries are summaries only — never embed full document content.
- `summary` must be a deterministic 2–3 sentence extract (first non-heading paragraph, or `## Summary` / `## Decision` section).
- Maximum 5,000 entries per index file. If the index exceeds this, partition by type: `ingest-index-adrs.json`, `ingest-index-incidents.json`, etc.
- The sidecar is **additive** — existing entries are preserved and updated; never rebuild from scratch (preserves human-added tags or summaries).
- Do not embed raw git commit messages — use the git-digest entries already in the index.

### Using the index

Agents load `ingest-index.json` as a lookup table:

1. Read `ingest-index.json` (title-only scan — fast)
2. Find matching entries by title, tag, or type
3. Navigate to the full document at `entry.path`

This replaces manual `index.md` navigation for repos where the index has grown too large to scan in a single prompt.
