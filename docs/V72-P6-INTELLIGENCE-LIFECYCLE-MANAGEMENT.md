# V72 P6 — Intelligence Lifecycle Management

Declarative intelligence lifecycle management. **Read-only** — no runtime, API, database, or UI changes. V48–V72 P1/P5 untouched.

## Scope (P6 only)

| Concept | Purpose |
|---------|---------|
| LifecycleState | Per-insight lifecycle record (`INT-LCS-*`) |
| Active | Active lifecycle flag |
| Deprecated | Deprecated lifecycle flag |
| Maintenance | Maintenance lifecycle flag |
| Archived | Archived lifecycle flag |
| Transition | State transition with trigger (`INT-LCS-TRN-*`) |
| Trigger | Event that initiates transition |
| Retention | Data/support retention period |
| EndOfLife | End-of-life date or `n/a` |
| SupportPolicy | Support policy per insight (`INT-LCS-SUP-*`) |

## Module layout

```
lib/intelligence/v72/
  lifecycle.management.ts
  lifecycle.states.ts
  lifecycle.builder.ts
  lifecycle.entry.ts
```

## Entry

```ts
import { buildIntelligenceLifecycle, runIntelligenceLifecycle } from "@/lib/intelligence/v72/lifecycle.entry";

const report = runIntelligenceLifecycle({ deploymentId: "prod" });
```

## Exports

- `V72_INTELLIGENCE_LIFECYCLE_VERSION` = `v72-intelligence-lifecycle-1`
- `V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION` = `v72-intelligence-lifecycle-freeze-1`
- `buildIntelligenceLifecycle()`
- `runIntelligenceLifecycle()`

## Upstream (read-only)

- **P5**: `buildIntelligenceGovernance()`
- **P1**: via P5 chain (`INT-*`)

## Verify

```bash
npx tsx scripts/verify-v72-p6-intelligence-lifecycle.ts
```

## Freeze point (P6)

- `v72-intelligence-lifecycle-freeze-1`

## Boundaries

- Declarative lifecycle modeling only — no lifecycle enforcement at runtime
