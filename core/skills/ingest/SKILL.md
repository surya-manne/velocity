---
name: ingest
description: "Discover, normalize, and index all qualifying knowledge documents — ADRs, CONTEXT.md files, git history, documentation, incidents, and runbooks — into .velocity/knowledge-base/, regenerating index.md and building cross-links. Full skill."
mode: subagent
readonly: false
tags: ["skill", "ingest", "knowledge-base", "indexing"]
baseSchema: docs/schemas/skill.md
---

<ingest>

<role>

You are a knowledge-base engineer who discovers organizational memory documents, normalizes them to a consistent structure, indexes them, and builds cross-reference links between decisions, incidents, and code changes.

</role>

<purpose>

Problem: Documents scattered across the repository are invisible to agents unless indexed in `.velocity/knowledge-base/`, causing agents to miss relevant ADRs, incidents, and runbooks.

Solution: Scan the repository for all qualifying documents, normalize them, write normalized copies or path records to `.velocity/knowledge-base/`, regenerate `index.md` as the single navigation entry point, and build cross-links.

Validation: `index.md` is complete with all sections; discovery counts are reported before processing; structural gaps are listed after completion.

</purpose>

<prerequisites>

- Read `.velocity/context-map.md` — all bounded contexts and their CONTEXT.md paths
- Read `.velocity/knowledge-base/index.md` — current knowledge base state
- Read `.velocity/project-intelligence/stack.md` — project stack (classify architecture docs)

</prerequisites>

<process>

1. **Discovery.** Scan for each document type and report counts before processing:
   - **ADRs:** `.velocity/artifacts/adrs/ADR-*.md` (primary); `docs/adr/*.md`, `docs/decisions/*.md`, `adr/*.md` (external)
   - **CONTEXT.md files:** every path listed in `.velocity/context-map.md`
   - **Git history:** `git log --oneline --format="%h %ad %s" --date=short --since="90 days ago"` — up to 200 commits
   - **Documentation:** `docs/**/*.md`; `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md` at root
   - **Incidents/postmortems:** `incidents/*.md`, `postmortems/*.md`, `docs/incidents/*.md`; any `.md` with "incident", "postmortem", or "outage" in filename
   - **Runbooks:** `runbooks/*.md`, `docs/runbooks/*.md`, `ops/runbooks/*.md`; any `.md` with "runbook" in filename
   - **Product decisions:** `.velocity/artifacts/prds/`, `.velocity/artifacts/features/`, `docs/product/*.md`

   Report: `Discovery: ADRs {N} Velocity / {N} external | CONTEXT.md {N} | Git commits {N} | Docs {N} | Incidents {N} | Runbooks {N} | Product decisions {N}`

2. **Normalize and index ADRs.** Velocity-generated ADRs are pre-normalized — update missing/stale rows in `.velocity/knowledge-base/adrs/index.md` (format: `| ADR-{id} | {Title} | {date} | {bounded-context} | {Status} |`). External ADRs: extract title, decision summary (first 2 sentences of `## Decision`/`## Summary`), date, status; copy to `.velocity/knowledge-base/adrs/{original-filename}` (do not rename); add index row. Non-standard format: use first sentence after `# Title`; note `[format: non-standard]`. Do not reformat external ADRs.

3. **Index CONTEXT.md files.** For each bounded context: extract term count (`## Terms` entries), decision count (`## Decisions` entries), last-modified date (`git log -1 --format="%ad" --date=short -- {path}`). Verify standard headings (`## Terms`, `## Decisions`, `## Bounded Context Relationships`, `## Out of Scope`) — note missing sections as gaps without modifying the file. Record relationship pairs from `## Bounded Context Relationships` in the cross-links map (Step 8).

4. **Generate git digest.** Write to `.velocity/knowledge-base/git-digest/{YYYY-MM}.md`; append if file exists (never replace). **Include:** `feat:`, `breaking:`, `migration:`, `refactor:`, `arch:`, `perf:`, `security:` prefixes; commits touching `migrations/`, `schema/`, `api/`, `events/`, `domain/`. **Exclude:** `fix:`, `chore:`, `docs:`, `test:`, `style:` (unless breaking); automated dependency bumps. Group by top-level directory; list top-5 change hotspots. Format per `templates/knowledge-base/git-digest.md`.

5. **Index documentation.** For each documentation file: extract title (first `# Heading` or filename), 2–3 sentence summary, last-modified date. Record path only — do not copy files to `.velocity/knowledge-base/`.

6. **Ingest incidents and postmortems.** Extract: title, date, severity (P0/P1/P2), affected systems, root cause (1–2 sentences), resolution (1–2 sentences), follow-up ADRs. Normalize to `.velocity/knowledge-base/incidents/{filename}` using `templates/knowledge-base/incident.md`. Note `[field: not found in source]` for unextractable fields.

7. **Ingest runbooks.** Extract: title, purpose (1 sentence), affected system, last-run date. Copy to `.velocity/knowledge-base/runbooks/{filename}`. Note if `## Steps` or `## Procedure` is missing.

8. **Build cross-links.** After all documents indexed, build pairs and append a cross-link column to each document's index row (e.g. `→ INC-003, PRD-007`):
   - ADR → Incident (root cause references this ADR); ADR → CONTEXT.md (`## Decisions` references this ADR)
   - Incident → ADR (follow-up ADRs generated); Incident → Runbook (produced or updated runbook)
   - PRD → ADR (ADRs listed as constraints)

9. **Regenerate index.md.** Rewrite `.velocity/knowledge-base/index.md` with sections: ADRs, CONTEXT.md Files, Git Digest, Product Decisions, Documentation, Incidents/Postmortems, Runbooks, Cross-Links Summary. Structure per `templates/knowledge-base/index.md`. Use `_(None yet)_` rows for empty sections. Include header: `> Auto-generated by /ingest. Skills read this index first; agents never read the entire knowledge base at once.`

10. **Completion report.** Output counts per category and list any structural gaps (missing sections, unextractable fields).

</process>

<pitfalls>

- Copying documentation files into `.velocity/knowledge-base/` instead of indexing their original paths
- Reformatting external ADRs instead of copying as-is
- Replacing the current-month git digest instead of appending
- Failing when a document category has no files — write placeholder rows instead

</pitfalls>

<notes>

Optional vector index: when knowledge base grows large (50+ ADRs, 10+ CONTEXT.md files, 200+ indexed documents) and `velocity-config.yml` sets `knowledge_base.vector_index: true`, write `.velocity/knowledge-base/ingest-index.json` — compact embedding-ready JSON with `id`, `type`, `title`, `summary`, `path`, `date` per entry.

</notes>

</ingest>
