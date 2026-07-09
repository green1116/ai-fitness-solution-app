# V71 P3 — Workflow Policy

Declarative workflow policy rules. **Read-only** — no runtime, API, database, or UI changes. V48–V71 P1/P2 untouched.

## Scope (P3 only)

| Concept | Purpose |
|---------|---------|
| PolicyRule | Scoped rule with constraint, allowed/blocked sets |
| PolicyScope | global / workflow / trigger / action |
| PolicyConstraint | dependency-acyclic, catalog-complete, timeout-defined, etc. |
| Allowed | Permitted values or states |
| Blocked | Denied values or states |
| RequiredCheck | Pass condition per rule (`ORC-CHK-*`) |
| Exception | Waiver record per rule (`ORC-EXC-*`) |
| Enforcement | declarative / gate / audit-only |
| AuditTrail | Audit event per rule (`ORC-AUD-*`) |

## Module layout

```
lib/orchestration/v71/
  workflow.policy.ts
  policy.rules.ts
  policy.builder.ts
  policy.entry.ts
```

## Entry

```ts
import { buildWorkflowPolicy, runWorkflowPolicy } from "@/lib/orchestration/v71/policy.entry";

const report = runWorkflowPolicy({ deploymentId: "prod" });
```

## Exports

- `V71_WORKFLOW_POLICY_VERSION` = `v71-workflow-policy-1`
- `V71_WORKFLOW_POLICY_FREEZE_VERSION` = `v71-workflow-policy-freeze-1`
- `buildWorkflowPolicy()`
- `runWorkflowPolicy()`

## Upstream (read-only)

- **P2**: `buildWorkflowDependency()`
- **P1**: via P2 chain

## Verify

```bash
npx tsx scripts/verify-v71-p3-workflow-policy.ts
```

## Freeze point (P3)

- `v71-workflow-policy-freeze-1`

## Boundaries

- Declarative policy only — not enforced at runtime
