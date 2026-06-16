# Runbook: {Title}

## System: {affected system or service name}

## Purpose

{1–2 sentences: what problem does this runbook solve? When should an engineer reach for it?}

## Last Run: {YYYY-MM-DD | Never}

## Last Updated: {YYYY-MM-DD}

## Owner: {team or person responsible for keeping this runbook current}

---

## When to Use This Runbook

Use this runbook when:

- {condition — e.g., "The payments service is returning 503s and the circuit breaker is open"}
- {condition — e.g., "The dead-letter queue depth exceeds 1000 messages"}

Do **not** use this runbook for:

- {exclusion — e.g., "Normal deployments — use the deployment runbook instead"}

---

## Prerequisites

Before starting:

- [ ] {prerequisite — e.g., "Confirm you have write access to the production Kubernetes cluster"}
- [ ] {prerequisite — e.g., "Alert the on-call lead that you are starting this procedure"}
- [ ] {prerequisite — e.g., "Read ADR-{id} if this is your first time running this procedure"}

---

## Steps

### Step 1 — {Diagnose / Assess}

{Brief description of what this step does.}

```bash
{command or action}
```

Expected output:

```
{expected output or state}
```

If you see `{unexpected output}` instead: {what to do — escalate, skip to step N, etc.}

---

### Step 2 — {Isolate / Mitigate}

{Brief description.}

```bash
{command or action}
```

⚠️ **Warning:** {any destructive or irreversible action that requires confirmation}

---

### Step 3 — {Resolve / Restore}

{Brief description.}

```bash
{command or action}
```

---

### Step 4 — {Verify}

Confirm the system is healthy:

- [ ] {health check — e.g., "Error rate is below 0.1% for 5 consecutive minutes"}
- [ ] {health check — e.g., "Dead-letter queue depth is 0"}
- [ ] {health check — e.g., "All upstream services report healthy"}

---

## Rollback

If the steps above do not resolve the issue or cause additional problems:

```bash
{rollback command or procedure}
```

---

## Post-Resolution

After the incident is resolved:

1. Update the incident record at `.velocity/knowledge-base/incidents/{incident-file}.md`
2. Record the date in `## Last Run` above
3. Note any step that was unclear or incorrect — open a PR to improve this runbook

---

## Related

- ADR-{id}: {Title} — {why this runbook exists / what decision backs it}
- Runbook: {related runbook title and path}
- Incident: INC-{id} — {incident that triggered this runbook's creation}
