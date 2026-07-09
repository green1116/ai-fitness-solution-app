# V71 P2 — Workflow Dependency

Declarative workflow dependency graph. **Read-only** — no runtime, API, database, or UI changes. V48–V71 P1 untouched.

## Scope (P2 only)

| Concept | Purpose |
|---------|---------|
| WorkflowNode | Graph node linked to `ORC-*` from P1 orchestration catalog |
| Dependency | Directed edge with upstream / downstream |
| Required | Hard dependency edge |
| Optional | Soft dependency edge |
| Order | Topological ordering hint |
| CycleCheck | Declarative acyclic validation |
| Impact | low / medium / high / critical |

## Module layout

```
lib/orchestration/v71/
  workflow.dependency.ts
  dependency.graph.ts
  dependency.builder.ts
  dependency.entry.ts
```

## Entry

```ts
import { buildWorkflowDependency, runWorkflowDependency } from "@/lib/orchestration/v71/dependency.entry";

const report = runWorkflowDependency({ deploymentId: "prod" });
```

## Exports

- `V71_WORKFLOW_DEPENDENCY_VERSION` = `v71-workflow-dependency-1`
- `V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION` = `v71-workflow-dependency-freeze-1`
- `buildWorkflowDependency()`
- `runWorkflowDependency()`

## Upstream (read-only)

- **P1**: `buildOrchestrationCatalog()`

## Verify

```bash
npx tsx scripts/verify-v71-p2-workflow-dependency.ts
```

## Freeze point (P2)

- `v71-workflow-dependency-freeze-1`
- `lib/orchestration/v71/dependency.*`

## Boundaries

- Declarative graph only — no workflow execution
