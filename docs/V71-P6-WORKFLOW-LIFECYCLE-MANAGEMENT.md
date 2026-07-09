# V71 P6 — Workflow Lifecycle Management

Declarative workflow lifecycle management. **Read-only** — no runtime, API, database, or UI changes. V48–V71 P1/P5 untouched.

## Scope (P6 only)

| Concept | Purpose |
|---------|---------|
| LifecycleState | Per-orchestration lifecycle record (`ORC-LCS-*`) |
| Active | Active lifecycle flag |
| Deprecated | Deprecated lifecycle flag |
| Maintenance | Maintenance lifecycle flag |
| Archived | Archived lifecycle flag |
| Transition | State transition with trigger (`ORC-LCS-TRN-*`) |
| Trigger | Event that initiates transition |
| Retention | Data/support retention period |
| EndOfLife | End-of-life date or `n/a` |
| SupportPolicy | Support policy per orchestration (`ORC-LCS-SUP-*`) |

## Module layout

```
lib/orchestration/v71/
  lifecycle.management.ts
  lifecycle.states.ts
  lifecycle.builder.ts
  lifecycle.entry.ts
```

## Entry

```ts
import { buildWorkflowLifecycle, runWorkflowLifecycle } from "@/lib/orchestration/v71/lifecycle.entry";

const report = runWorkflowLifecycle({ deploymentId: "prod" });
```

## Exports

- `V71_WORKFLOW_LIFECYCLE_VERSION` = `v71-workflow-lifecycle-1`
- `V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION` = `v71-workflow-lifecycle-freeze-1`
- `buildWorkflowLifecycle()`
- `runWorkflowLifecycle()`

## Upstream (read-only)

- **P5**: `buildWorkflowGovernance()`
- **P1**: via P5 chain (`ORC-*`)

## Verify

```bash
npx tsx scripts/verify-v71-p6-workflow-lifecycle.ts
```

## Freeze point (P6)

- `v71-workflow-lifecycle-freeze-1`

## Boundaries

- Declarative lifecycle modeling only — no lifecycle enforcement at runtime
