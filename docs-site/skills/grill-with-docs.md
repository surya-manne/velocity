# /grill-with-docs — Brownfield Discovery

`/grill-with-docs` is Velocity's brownfield discovery skill. It reads your existing codebase and documentation first, extracts the domain language already in use, then interviews you to fill gaps and resolve ambiguities.

::: tip For Existing Codebases
Use `/grill-with-docs` when code already exists. For new projects, use [`/grill-me`](/skills/grill-me) instead.
:::

## The Key Difference from /grill-me

`/grill-me` starts from zero and asks foundational questions. `/grill-with-docs` starts by reading what exists:

```
/grill-me:
  Ask → Answer → Build vocabulary from scratch

/grill-with-docs:
  Read code → Extract vocabulary → Fill gaps → Resolve conflicts
```

This matters because every existing codebase already has implicit domain language — in class names, database columns, API endpoint paths, and variable names. `/grill-with-docs` surfaces this vocabulary before deciding what the canonical terms should be.

## What It Reads

In the discovery phase, the skill reads:

1. **Class and type names** across the codebase
2. **Database schema** (table names, column names)
3. **API endpoint paths and payload field names**
4. **Existing documentation** (README, ADRs, any .md files)
5. **CONTEXT.md** if it already exists (to avoid duplicating work)

From these, it builds a raw vocabulary list — every significant domain term it found, with where it appears.

## The Interview

After reading, the skill asks targeted questions about what it found:

### Gap Questions

"I see `order_transaction` in the database, `Purchase` in the frontend, and `Order` in the API — which is the canonical term?"

### Ambiguity Questions

"The `Customer` model appears in three contexts with slightly different fields. Are these the same concept or different?"

### Missing Concept Questions

"I see refund processing code but no `Refund` domain model. Is this intentional?"

### Boundary Questions

"The `payments` and `billing` directories share several models. Are these the same bounded context or separate?"

## Context Proposals

Rather than directly modifying CONTEXT.md, `/grill-with-docs` produces **context proposals** — a structured diff of proposed additions and changes:

```markdown
# CONTEXT.md Proposals — Session 2024-01-15

## Proposed Additions

### PaymentIntent (NEW)

Discovered in: `src/payments/models.py`, `api/v1/payments/`
Canonical term for the intent to collect payment.
Code: `PaymentIntent`, `payment_intent_id`
NOT: `PaymentOrder` (found in legacy code — should be migrated)

## Proposed Resolutions

### Order vs Purchase vs Transaction

Found all three in codebase. Recommend: `Order` as canonical.

- `Purchase` appears only in frontend — migrate to `Order`
- `Transaction` appears in database — represents completed payment, not order
  Proposed separation: `Order` (orders context) vs `Transaction` (payments context)

## Proposed Removals

### CustomerPaymentProfile

Found in: `legacy/billing/` only
This term is not used in current service layer.
Recommend: Archive, do not add to CONTEXT.md
```

Proposals are stored in `.velocity/artifacts/context-proposals/`. They are not applied until you run [`/context-merge`](/guide/context).

## Integration with /context-merge

If multiple sessions have run `/grill-with-docs` (common in large codebases where different engineers explore different modules), `/context-merge` reconciles the proposals:

```
/context-merge
```

The skill reads all pending proposals, identifies conflicts, surfaces them for resolution, and merges non-conflicting additions into CONTEXT.md automatically.

## Output

1. **Vocabulary extraction report** — All domain terms found in code, with source locations
2. **Gap analysis** — Missing concepts, naming conflicts, boundary ambiguities
3. **Context proposals** — Ready to review and merge
4. **Updated context-map.md** — If new bounded contexts were discovered

## Usage

```
/grill-with-docs
```

The skill will ask if there's a specific module or feature area to focus on, or whether to scan the entire codebase. For large codebases, focus on one bounded context at a time.
