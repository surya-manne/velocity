# /tdd — Test-Driven Development

`/tdd` runs a strict TDD loop for a single task: write failing tests first, make them pass with minimal implementation, then refactor. Always runs in a **fresh context window** per task.

## The TDD Protocol

```
1. Load context (stack.md + CONTEXT.md + task definition + handoff from previous task)
2. Write failing tests that describe the expected behavior
3. Confirm: tests fail for the right reason
4. Write minimal implementation to pass the tests
5. Confirm: all tests pass
6. Refactor: clean up without breaking tests
7. Run feedback gates (typecheck + lint + full test suite)
8. Produce handoff artifact
```

## Why Fresh Context Windows?

Each `/tdd` invocation starts in a new assistant session. This is intentional:

- **Prevents context contamination** — Struggles and abandoned approaches from the previous task don't pollute the current one
- **Forces explicit context loading** — The agent can only know what's in the handoff artifact and `.velocity/` files
- **Models good engineering** — A developer picking up a task should be able to work from documented artifacts, not memory
- **Improves quality** — Models perform better at the start of a session than after thousands of tokens of context

## Usage

```
/tdd TASK-001
```

Or with explicit context:

```
/tdd
[paste task description]
```

## Step 1: Context Load

The skill reads (in this order):

1. `stack.md` — what test runner, what commands
2. Relevant `CONTEXT.md` sections — terminology
3. Task definition from `.velocity/artifacts/tasks/`
4. Most recent handoff artifact (if this is not the first task)
5. Referenced files (domain models, interfaces to implement against)

## Step 2: Write Tests First

The agent writes tests in your project's testing framework **before writing any implementation**.

Example (TypeScript/Vitest):

```typescript
// src/payments/domain/__tests__/refund-request.test.ts

import { RefundRequest } from "../refund-request";
import { RefundWindow } from "../refund-window";
import { PaymentIntent } from "../payment-intent";

describe("RefundRequest", () => {
  const validPaymentIntent = PaymentIntent.create({
    id: "pi_123",
    amount: 10000,
    status: "succeeded",
    succeededAt: new Date("2024-01-01"),
  });

  describe("create", () => {
    it("creates a valid RefundRequest within RefundWindow", () => {
      const result = RefundRequest.create({
        paymentIntent: validPaymentIntent,
        amount: 5000,
        requestedAt: new Date("2024-01-15"),
      });
      expect(result.isOk()).toBe(true);
      expect(result.value.amount).toBe(5000);
      expect(result.value.status).toBe("pending");
    });

    it("fails when amount exceeds original PaymentIntent amount", () => {
      const result = RefundRequest.create({
        paymentIntent: validPaymentIntent,
        amount: 15000, // > 10000
        requestedAt: new Date("2024-01-15"),
      });
      expect(result.isErr()).toBe(true);
      expect(result.error.code).toBe("REFUND_AMOUNT_EXCEEDED");
    });

    it("fails when RefundWindow has expired", () => {
      const result = RefundRequest.create({
        paymentIntent: validPaymentIntent,
        amount: 5000,
        requestedAt: new Date("2024-02-15"), // > 30 days
      });
      expect(result.isErr()).toBe(true);
      expect(result.error.code).toBe("REFUND_WINDOW_EXPIRED");
    });
  });
});
```

## Step 3: Implement

With tests failing for the right reasons, implement the minimal code to pass:

```typescript
// src/payments/domain/refund-request.ts

export class RefundRequest {
  private constructor(
    readonly id: string,
    readonly paymentIntentId: string,
    readonly amount: number,
    readonly status: RefundStatus,
    readonly createdAt: Date,
  ) {}

  static create(params: {
    paymentIntent: PaymentIntent;
    amount: number;
    requestedAt: Date;
  }): Result<RefundRequest, RefundError> {
    const window = RefundWindow.fromPaymentIntent(params.paymentIntent);

    if (!window.contains(params.requestedAt)) {
      return err({ code: "REFUND_WINDOW_EXPIRED" });
    }

    if (params.amount > params.paymentIntent.amount) {
      return err({ code: "REFUND_AMOUNT_EXCEEDED" });
    }

    return ok(
      new RefundRequest(
        generateId(),
        params.paymentIntent.id,
        params.amount,
        "pending",
        params.requestedAt,
      ),
    );
  }
}
```

## Step 4: Feedback Gates

After all tests pass, the skill runs:

```bash
# Typecheck
npx tsc --noEmit

# Lint
npx eslint src/

# Full test suite (not just the new tests)
npx vitest run
```

**All gates must pass before the task is considered complete.** If any gate fails, the agent fixes the issue — it does not declare victory and move on.

## Step 5: Handoff Artifact

The final output is a handoff document for the next task:

```markdown
# Handoff: TASK-001 — RefundRequest domain model

## Status: Complete ✓

## What Was Built

- RefundRequest value object with result-based error handling
- RefundWindow value object (30-day window calculation)
- RefundStatus type: pending | processing | succeeded | failed | cancelled

## Key Decisions

- Used Result<T, E> pattern (not exceptions) for validation errors
- RefundWindow is a value object, not stored in DB (computed from PaymentIntent.succeeded_at)
- Minimum refund amount: $0.50 (50 cents) — not in original task, confirmed with architect

## Open Questions for Next Task

- TASK-002 will add the DB migration — the domain model is pure and has no DB dependencies yet

## Test Coverage

- 8 unit tests, all passing
- Coverage: 94% (statements)

## Files Created

- src/payments/domain/refund-request.ts
- src/payments/domain/refund-window.ts
- src/payments/domain/**tests**/refund-request.test.ts
```

## Configuring TDD for Your Stack

After `/init`, the `/tdd` skill is configured with your actual test commands:

```yaml
# .velocity/skills/tdd.md (generated)
test_command: "npx vitest run"
typecheck_command: "npx tsc --noEmit"
lint_command: "npx eslint src/"
coverage_threshold: 85
test_pattern: "**/__tests__/**/*.test.ts"
```

Change these in `.velocity/skills/tdd.md` and run `/sync` to propagate.
