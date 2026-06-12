---
name: tdd
description: "Red-green-refactor loop with design-for-testability. One failing test at a time. Run in a fresh context window per task. Read the task definition and CONTEXT.md before starting. Enforces the deep modules doctrine: simple interfaces, complex implementations."
---


# TDD

Implement this task using test-driven development.

## Context Load

Read before starting:

1. The task definition (from `.velocity/artifacts/tasks/{feature-id}.md`, the specific task)
2. `.velocity/project-context/testing.md` — testing standards
3. CONTEXT.md for the relevant bounded context

**This skill runs in a fresh context window.** Do not carry context from previous tasks.

---

## Tracer Bullet Prompt

When building features, build a tiny end-to-end slice of the feature first, seek feedback, then expand.

Do not build all API endpoints, all UI components, or all persistence layers before testing whether the critical path works. Build one thin vertical slice end-to-end: one UI location, one API endpoint, one DB operation — validate it — then expand.

Start a fresh context window for each new slice.

---

## Pre-Implementation: Design the Interface

Before writing any test:

1. **Confirm the behavior** to implement from the task definition.
2. **Design the interface** for testability:
   - What is the minimal public surface?
   - What are the inputs and outputs?
   - What are the dependencies? How will they be injected for testing?
3. **Confirm with the developer** before writing the first test: "Here is the interface I will implement: [interface]. Is this correct?"

A thin, clear interface is the most important output of this step. Do not proceed until the interface is agreed.

---

## Deep Modules Doctrine

> A module should have a simple interface but complex implementation. Wide interfaces with thin implementations spread complexity to callers.

When designing the implementation:

- Prefer one module that encapsulates complexity over many small modules that expose it.
- Avoid extraction for the sake of testability — design for testability through dependency injection, not decomposition.
- If you find yourself creating a helper module with one caller, ask: should this be inside the calling module?
- Check: does this interface hide the complexity, or expose it?

---

## TDD Loop

Repeat until the task is complete:

### Red — Write one failing test

Write the **first** and **most important** failing test. One test. Not five.

The test must:

- Test a **behavior**, not an implementation detail
- Read as a specification: `it('should charge the payment when card is valid', ...)`
- Be in the test framework configured for this stack
- Fail for the right reason (not a compile error — a real assertion failure)

Run the test. Confirm it fails. Show the failure output.

### Green — Write minimum implementation

Write the **minimum** code that makes the test pass.

Rules:

- No gold-plating. If the test passes with a hardcoded value, do that first.
- No implementation of behavior not yet tested.
- No additional functions, classes, or methods not required to pass this test.

Run the test. Confirm it passes.

### Refactor — Look for deep module opportunities

With the test green, ask:

1. Is the interface as thin as it could be?
2. Is there complexity in the caller that belongs in the module?
3. Are there multiple small functions that should be collapsed?
4. Does the code use CONTEXT.md terms consistently?
5. Is there duplication that signals a missing abstraction?

Refactor. Run the test again. Confirm still green.

### Feedback Loop

After every red-green-refactor cycle:

- Run **typecheck** if applicable
- Run the full **test suite** (not just the new test)
- Run **lint** if this is a commit boundary

Do not proceed to the next test if any check fails.

---

## Repeat

Write the next failing test. The second test should test the next most important behavior — usually a boundary condition, an error case, or a second happy path variant.

Continue until all behaviors in the task definition are tested and implemented.

---

## Completion

When all task behaviors are implemented and all tests pass:

1. Run the full test suite one final time.
2. Run typecheck and lint.
3. Confirm test coverage meets the minimum threshold from `.velocity/guardrails/default.md`.
4. Confirm all names (variables, functions, classes, files) use CONTEXT.md terms.

Say: "Task complete. All tests pass. Coverage at [X]%. Run /handoff to create the slice handoff artifact, or move to the next task."

---

## Stack-Specific Notes

> Velocity /init configures this skill with stack-specific test framework patterns.
> The patterns below are filled in by Skill Factory based on detected stack.

**Test framework:** {configured by Skill Factory — e.g., Jest, JUnit 5, pytest, RSpec, Go testing}

**Mocking approach:** {configured by Skill Factory — e.g., vi.mock, Mockito, unittest.mock, RSpec doubles}

**Integration test setup:** {configured by Skill Factory — e.g., testcontainers, @SpringBootTest, pytest fixtures}

**Run command:** {configured by Skill Factory — e.g., `npm test`, `./gradlew test`, `pytest`, `go test ./...`}
