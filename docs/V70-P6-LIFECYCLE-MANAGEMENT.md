# V70 P6 — Lifecycle Management

Declarative release lifecycle management. **Read-only** — no runtime, API, database, or UI changes. V48–V70 P1/P5 untouched.

## Scope (P6 only)

| Concept | Purpose |
|---------|---------|
| LifecycleState | Per-release lifecycle record (`DLV-LCS-*`) |
| Active | Active lifecycle flag |
| Deprecated | Deprecated lifecycle flag |
| Maintenance | Maintenance lifecycle flag |
| Archived | Archived lifecycle flag |
| Transition | State transition with trigger (`DLV-LCS-TRN-*`) |
| Trigger | Event that initiates transition |
| Retention | Data/support retention period |
| EndOfLife | End-of-life date or `n/a` |
| SupportPolicy | Support policy per release (`DLV-LCS-SUP-*`) |

## Module layout

```
lib/delivery/v70/
  lifecycle.management.ts
  lifecycle.states.ts
  lifecycle.builder.ts
  lifecycle.entry.ts
```

## Entry

```ts
import { buildLifecycleManagement, runLifecycleManagement } from "@/lib/delivery/v70/lifecycle.entry";

const report = runLifecycleManagement({ deploymentId: "prod" });
```

## Exports

- `V70_LIFECYCLE_MANAGEMENT_VERSION` = `v70-lifecycle-management-1`
- `V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION` = `v70-lifecycle-management-freeze-1`
- `buildLifecycleManagement()`
- `runLifecycleManagement()`

## Upstream (read-only)

- **P5**: `buildUpgradeGovernance()`
- **P1**: via P5 chain (`DLV-REL-*`)

## Verify

```bash
npx tsx scripts/verify-v70-p6-lifecycle-management.ts
```

## Freeze point (P6)

- `v70-lifecycle-management-freeze-1`

## Boundaries

- Declarative lifecycle modeling only — no lifecycle enforcement at runtime
