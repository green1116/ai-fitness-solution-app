# V71 P4 — Workflow Compatibility

Declarative workflow compatibility matrix. **Read-only** — no runtime, API, database, or UI changes. V48–V71 P1/P3 untouched.

## Scope (P4 only)

| Concept | Purpose |
|---------|---------|
| WorkflowVersionPair | Source/target orchestration version pairing (`ORC-WPX-*`) |
| Compatible | Pair marked compatible |
| Incompatible | Pair marked incompatible |
| Deprecated | Pair marked deprecated |
| Supported | Pair marked supported |
| Minimum | Lower bound version or range |
| Maximum | Upper bound version or range |
| Matrix | Aggregated compatibility matrix |
| Constraint | Range rule (`ORC-CMP-CST-*`) |
| Fallback | Rollback/fallback target on mismatch |

## Module layout

```
lib/orchestration/v71/
  workflow.compatibility.ts
  compatibility.matrix.ts
  compatibility.builder.ts
  compatibility.entry.ts
```

## Entry

```ts
import { buildWorkflowCompatibility, runWorkflowCompatibility } from "@/lib/orchestration/v71/compatibility.entry";

const report = runWorkflowCompatibility({ deploymentId: "prod" });
```

## Exports

- `V71_WORKFLOW_COMPATIBILITY_VERSION` = `v71-workflow-compatibility-1`
- `V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION` = `v71-workflow-compatibility-freeze-1`
- `buildWorkflowCompatibility()`
- `runWorkflowCompatibility()`

## Upstream (read-only)

- **P3**: `buildWorkflowPolicy()`
- **P1**: via P3 chain (`ORC-*` refs)

## Verify

```bash
npx tsx scripts/verify-v71-p4-workflow-compatibility.ts
```

## Freeze point (P4)

- `v71-workflow-compatibility-freeze-1`

## Boundaries

- Declarative matrix only — no workflow version enforcement at runtime
