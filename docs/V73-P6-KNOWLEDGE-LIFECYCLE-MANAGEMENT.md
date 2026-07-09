# V73 P6 — Knowledge Lifecycle Management

Declarative knowledge lifecycle management. **Read-only** — no runtime, API, database, or UI changes. V48–V73 P1/P5 untouched.

## Scope (P6 only)

| Concept | Purpose |
|---------|---------|
| LifecycleState | Per-knowledge lifecycle record (`KNW-LCS-*`) |
| Active | Active lifecycle flag |
| Deprecated | Deprecated lifecycle flag |
| Maintenance | Maintenance lifecycle flag |
| Archived | Archived lifecycle flag |
| Transition | State transition with trigger (`KNW-LCS-TRN-*`) |
| Trigger | Event that initiates transition |
| Retention | Data/support retention period |
| EndOfLife | End-of-life date or `n/a` |
| SupportPolicy | Support policy per knowledge item (`KNW-LCS-SUP-*`) |

## Module layout

```
lib/knowledge/v73/
  lifecycle.management.ts
  lifecycle.states.ts
  lifecycle.builder.ts
  lifecycle.entry.ts
```

## Entry

```ts
import { buildKnowledgeLifecycle, runKnowledgeLifecycle } from "@/lib/knowledge/v73/lifecycle.entry";

const report = runKnowledgeLifecycle({ deploymentId: "prod" });
```

## Exports

- `V73_KNOWLEDGE_LIFECYCLE_VERSION` = `v73-knowledge-lifecycle-1`
- `V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION` = `v73-knowledge-lifecycle-freeze-1`
- `buildKnowledgeLifecycle()`
- `runKnowledgeLifecycle()`

## Upstream (read-only)

- **P5**: `buildKnowledgeGovernance()`
- **P1**: via P5 chain (`KNW-*`)

## Verify

```bash
npx tsx scripts/verify-v73-p6-knowledge-lifecycle.ts
```

## Freeze point (P6)

- `v73-knowledge-lifecycle-freeze-1`

## Boundaries

- Declarative lifecycle modeling only — no lifecycle enforcement at runtime
