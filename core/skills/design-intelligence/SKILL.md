---
name: design-intelligence
description: >-
  Produce user flows, screen specifications, design system documentation, and
  design tool integration contracts (Figma component map, Storybook story
  index). Invoked by the UX Agent or directly by the developer when a feature
  requires UI design before implementation. Uses CONTEXT.md domain terms in
  all screen and flow descriptions. Stores output under
  .velocity/artifacts/design/. Produces machine-readable contracts that the
  Engineer can implement without further clarification.
metadata:
  surfaces:
    - agent
---

# Design Intelligence

Produce the design artifacts for this feature.

## Context Load

Read before starting:

1. CONTEXT.md at the path from `.velocity/context-map.md` for the relevant bounded context
2. `.velocity/artifacts/prds/` — relevant PRD for functional requirements and user stories
3. `.velocity/artifacts/features/` — relevant feature definition (if it exists)
4. `.velocity/project-context/engineering.md` — stack constraints (frontend framework, component library)
5. `.velocity/knowledge-base/adrs/index.md` — any ADRs relevant to UI architecture or design system

---

## Step 1 — Identify Design Scope

Ask the developer (or extract from PRD):

1. What user-facing outcome does this feature deliver?
2. How many distinct screens or views does this feature introduce or modify?
3. Does a design system exist? (Material UI, Tailwind, custom, none)
4. Does a Figma file exist for this project? (yes/no — provide link if yes)
5. Are Storybook stories required for generated components?
6. What is the frontend stack? (React, Vue, Angular, Svelte, native)

---

## Step 2 — User Flow

Map every path a user takes through this feature from entry to completion.

Produce the flow using the template from `templates/artifacts/user-flow.md`.

Format:

```
[Entry Point] → [Screen A] → [Decision: X?]
                                  ↓ Yes        ↓ No
                            [Screen B]     [Screen C]
                                  ↓
                            [Success State]

[Error path]: [Screen A] → [Validation Error] → [Screen A with inline error]
```

Rules:

- Every flow must have a happy path from entry to completion
- Every flow must have at least one error path
- Every decision node must have all branches mapped
- Use CONTEXT.md terms for all domain objects in the flow

---

## Step 3 — Screen Specifications

For each screen in the user flow, produce a specification:

```markdown
## Screen: {Name using CONTEXT.md terms}

**Route / location:** {url path, modal, drawer, or inline section}

**User goal:** {What the user is trying to accomplish — one sentence}

**Entry points:**

- {How the user arrives here}

**Primary action:** {The one thing the user must be able to do}

**Layout (ASCII):**

+----------------------------------+
| [Header] |
+----------------------------------+
| [Primary content area] |
| {key element} |
| {key element} |
+----------------------------------+
| [Primary action button] |
+----------------------------------+

**Components:**

| Component | Purpose                | State-sensitive? |
| --------- | ---------------------- | ---------------- |
| {name}    | {what it shows / does} | {yes/no}         |

**States:**

- **Default:** {What the user sees on load}
- **Loading:** {What appears while data loads}
- **Empty:** {What appears when there is no data}
- **Error:** {Error state — what message, what recovery action}
- **Success:** {Confirmation state after primary action}

**Interactions:**

| Trigger       | Response          |
| ------------- | ----------------- |
| {user action} | {system response} |

**Validation rules:**

| Field                         | Rule   | Error message         |
| ----------------------------- | ------ | --------------------- |
| {field using CONTEXT.md term} | {rule} | {user-facing message} |

**Accessibility:**

- Keyboard navigation path
- Screen reader announcements for dynamic state changes
- Focus management after primary action

**Exit points:**

- {Where the user goes from here}
```

---

## Step 4 — Design System Documentation

If a design system exists or is being defined for this project:

### Component Catalogue Entry

For each new or modified component introduced by this feature:

```markdown
## Component: {ComponentName}

**Purpose:** {Single-sentence description}

**Variants:**

- {variant name}: {when to use it}

**Props / API:**

| Prop   | Type   | Required | Default   | Description   |
| ------ | ------ | -------- | --------- | ------------- |
| {name} | {type} | {yes/no} | {default} | {description} |

**Usage:**

{When to use this component. When NOT to use it.}

**Storybook story:** {ComponentName/Default, ComponentName/Error, ComponentName/Loading}

**Figma node:** {Frame or component name in Figma — for sync with Figma integration}
```

---

## Step 5 — Figma Integration Contract

If a Figma file exists for this project:

Produce a mapping between screen specifications and Figma frames:

| Screen        | Figma frame name         | Figma page  | Status                    |
| ------------- | ------------------------ | ----------- | ------------------------- |
| {screen name} | {exact Figma frame name} | {page name} | {Exists / Needs creation} |

Rules for Figma naming (to enable design-to-code tooling):

- Frame names match the screen name exactly
- Component names in Figma match the component catalogue names exactly
- Layer names use CONTEXT.md terms for domain objects
- Variants are named with `/` separator: `Button/Primary`, `Button/Secondary`, `Button/Destructive`

---

## Step 6 — Storybook Story Index

If Storybook is present in the stack:

Produce a story index for this feature:

```markdown
## Storybook Stories — {Feature Name}

| Story                   | Component       | State   | Args                      |
| ----------------------- | --------------- | ------- | ------------------------- |
| {ComponentName/Default} | {ComponentName} | Default | {key props}               |
| {ComponentName/Loading} | {ComponentName} | Loading | `isLoading: true`         |
| {ComponentName/Empty}   | {ComponentName} | Empty   | `items: []`               |
| {ComponentName/Error}   | {ComponentName} | Error   | `error: 'Failed to load'` |
```

Story naming convention: `{ComponentName}/{State}` — matches Figma variant naming.

---

## Step 7 — Write the Design Artifacts

When the developer approves the design:

1. User flow: `.velocity/artifacts/design/{feature-slug}/user-flow.md`
2. Screen specifications: `.velocity/artifacts/design/{feature-slug}/screens.md`
3. Component catalogue: `.velocity/artifacts/design/{feature-slug}/components.md`
4. Figma integration contract: `.velocity/artifacts/design/{feature-slug}/figma-contract.md` (if applicable)
5. Storybook story index: `.velocity/artifacts/design/{feature-slug}/storybook-index.md` (if applicable)

Update `.velocity/knowledge-base/index.md`:

- Add: `| design | {title} | .velocity/artifacts/design/{feature-slug}/ | {date} |`

Say: "Design artifacts written to `.velocity/artifacts/design/{feature-slug}/`."

---

## Step 8 — Handoff to Engineer

After writing, produce a concise handoff summary:

```markdown
## Design Handoff — {feature name}

Screens: {count}
User flows: {count}
New components: {count}
Modified components: {count}

### Implementation order (suggested)

1. {Component name} — {why first}
2. {Screen name} — depends on {component}
3. {Screen name} — depends on {screen}

### Open questions for Engineer

- {Any unclear interactions or constraints}
```

---

## Design Intelligence Quality Rules

A design that fails any rule should be revised before writing:

- Every screen has a primary action — no ambiguous "what do I do here?" layouts
- Empty state and error state defined for every data-dependent screen
- All domain objects in flows and screens use CONTEXT.md terms
- Every new component has usage rules (when to use / when NOT to use)
- Figma frame names match screen names exactly (if Figma is present)
- Storybook story names match Figma variant names exactly (if both are present)
- Accessibility requirements stated per screen, not as a vague afterthought
