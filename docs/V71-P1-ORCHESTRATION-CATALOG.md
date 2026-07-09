# V71 P1 — Orchestration Catalog

Declarative delivery orchestration catalog. **Read-only** — no runtime, API, database, or UI changes.

## Scope (P1 only)

| Field | Purpose |
|-------|---------|
| Orchestration | Orchestration track name |
| Workflow | Bound workflow identifier |
| Trigger | manual / schedule / event / webhook / gate-pass |
| Action | catalog-build / dependency-resolve / policy-check / … |
| Step | Step identifier within the workflow |
| Owner | Owning team |
| Status | draft / active / paused / archived |
| Input | Input artifact or version token |
| Output | Output artifact or version token |
| Retry | maxAttempts, backoff, interval |
| Timeout | Step or workflow timeout policy |

## Module layout

```
lib/orchestration/v71/
  orchestration.types.ts
  orchestration.catalog.ts
  orchestration.builder.ts
  orchestration.entry.ts
```

## Entry

```ts
import { buildOrchestrationCatalog, runOrchestrationCatalog } from "@/lib/orchestration/v71/orchestration.entry";

const report = runOrchestrationCatalog({ deploymentId: "prod" });
```

## Exports

- `V71_ORCHESTRATION_VERSION` = `v71-orchestration-catalog-1`
- `buildOrchestrationCatalog()`
- `runOrchestrationCatalog()`

## Verify

```bash
tsx scripts/verify-v71-p1-orchestration-catalog.ts
```

## Freeze point (P1)

- `v71-orchestration-catalog-freeze-1`
- `lib/orchestration/v71/`

## Boundaries

- V48–V70 untouched
- Declarative catalog only — no orchestration execution
