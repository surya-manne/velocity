---
name: roadmap
description: "Generate a prioritized roadmap from a feature board. Sequences features by user value, dependency order, and delivery risk. Produces a phased delivery plan where each phase ends with demonstrable, shippable software. Run after to-features, before engineering begins."
---


# Roadmap

Generate a phased delivery roadmap from the feature board.

## Context Load

Read before starting:

1. `.velocity/artifacts/features/{feature-board}.md` — the feature board to sequence
2. `.velocity/artifacts/prds/{prd-id}.md` — the originating PRD (goals and priorities)
3. CONTEXT.md from `.velocity/context-map.md`

---

## Roadmap Principles

### Phase discipline

Each phase must end with **shippable software** — a set of features a user can interact with.

No phase is "infrastructure only". No phase produces code that cannot be demonstrated.

A phase is the right size when:

- It contains 2–5 features
- It delivers a coherent user capability (not a collection of unrelated features)
- It can be completed in a sprint or iteration
- It can be released independently of future phases

### Sequencing rules

1. **Tracer bullets first** — the first phase always contains the tracer feature(s) for each new capability
2. **Respect blocking dependencies** — a feature blocked by another cannot be in an earlier phase
3. **Parallelize where possible** — features with no shared blocking dependency can be in the same phase
4. **Risk front-loading** — features that validate critical technical or product assumptions come early
5. **Value delivery** — phases should be ordered by user impact, not technical convenience

### Anti-patterns to reject

❌ Phase 1: All database schema  
❌ Phase 2: All API endpoints  
❌ Phase 3: All UI

✅ Phase 1: User can create and view a {core entity} (tracer)  
✅ Phase 2: User can {extend core capability} + {parallel independent capability}  
✅ Phase 3: User can {complete the full workflow}

---

## Protocol

### Step 1 — Extract and validate features

From the feature board:

1. List all features with their blocking relationships
2. Identify tracer features (labeled "Tracer" in the feature board)
3. Validate the dependency graph is acyclic — if not, flag the cycle before proceeding
4. Note parallel execution candidates from the feature board's dependency map

### Step 2 — Score each feature

For each feature, assign a score on three dimensions:

| Dimension        | Score | Criteria                                                             |
| ---------------- | ----- | -------------------------------------------------------------------- |
| User value       | 1–5   | 5 = core to the product's value proposition; 1 = nice-to-have        |
| Dependency depth | 1–5   | 5 = nothing blocks it (can start immediately); 1 = deep in the chain |
| Delivery risk    | 1–5   | 5 = well-understood; 1 = high technical or product uncertainty       |

Calculate priority score: `(user_value × 2) + dependency_depth + delivery_risk`

Use scores to guide sequencing, not override dependency order.

### Step 3 — Assign phases

Group features into phases respecting:

1. Dependency order (hard constraint)
2. Priority scores (soft guidance)
3. Phase coherence (features in a phase should form a coherent user capability)

Each phase must include at least one user-facing feature that can be demonstrated.

### Step 4 — Write the roadmap

---

## Output Format

Write to `.velocity/artifacts/roadmaps/{prd-id}-v1.md`:

```markdown
# Roadmap: {PRD Name}

## Version: 1

## Date: {date}

## Source PRD: .velocity/artifacts/prds/{prd-id}.md

## Source feature board: .velocity/artifacts/features/{feature-id}.md

---

## Summary

{2–3 sentences: what this roadmap delivers and why it is sequenced this way.}

**Total features:** {N}
**Phases:** {N}
**Estimated duration:** {N} sprints / iterations

---

## Phase 1: {Phase name — user-facing outcome}

**Goal:** {What a user can do at the end of this phase that they could not do before}

**Features:**

| Feature     | Type   | Layers                 | Blocked by |
| ----------- | ------ | ---------------------- | ---------- |
| {Feature 1} | Tracer | UI · API · Persistence | —          |
| {Feature 2} | Tracer | API · Persistence      | —          |

**Why this phase:** {One sentence explaining the sequencing rationale}

**Shippable?** Yes — {describe what can be released at the end of this phase}

---

## Phase 2: {Phase name — user-facing outcome}

**Goal:** {What a user can do at the end of this phase}

**Features:**

| Feature     | Type      | Layers                 | Blocked by       |
| ----------- | --------- | ---------------------- | ---------------- |
| {Feature 3} | Expansion | UI · API · Persistence | Phase 1 complete |
| {Feature 4} | Expansion | UI · API               | Phase 1 complete |

**Parallel candidates:** Feature 3 and Feature 4 can be worked simultaneously.

**Why this phase:** {Sequencing rationale}

**Shippable?** Yes — {describe the release}

---

[Repeat for all phases]

---

## Full Dependency Map

{ASCII or list representation spanning all phases}

Feature 1 (Tracer) → Feature 3, Feature 4
Feature 2 (Tracer) → Feature 5
Feature 3, Feature 5 → Feature 6

---

## Risks and Mitigations

| Risk             | Likelihood          | Phase affected | Mitigation            |
| ---------------- | ------------------- | -------------- | --------------------- |
| {Technical risk} | High / Medium / Low | Phase {N}      | {Mitigation approach} |

---

## Next Step

Run /to-tasks on each feature in Phase 1 to generate the task board for immediate execution.
```

---

## Versioning

When a roadmap is revised (features added, phases re-sequenced, scope changed):

1. Archive the existing roadmap: rename to `{prd-id}-v{N}-archived-{date}.md`
2. Write the new version as `{prd-id}-v{N+1}.md`
3. Add a change summary at the top of the new version:

```markdown
## Change from v{N}: {one sentence describing what changed and why}
```

Never delete previous roadmap versions. The history is the audit trail.

---

## Quality Checks

Before finalizing:

1. Every phase ends with demonstrable, shippable software — no infrastructure-only phases.
2. No dependency violations — no feature appears in a phase before its blockers.
3. Every tracer feature is in Phase 1 (or as early as possible for its dependency chain).
4. Risks are listed with mitigations — not just acknowledged.
5. The full dependency map is acyclic.
6. All terms match CONTEXT.md.
