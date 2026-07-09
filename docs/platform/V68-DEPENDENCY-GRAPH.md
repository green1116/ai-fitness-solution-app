# V68 P2 — Dependency Graph

Declarative service dependency graph for platform governance. **Read-only layer** — no live topology discovery, no UI, no V48–V67 mutations.

## Scope (P2 only)

| Artifact | Purpose |
|----------|---------|
| Dependency types | 5 kinds (`DEP-TYP-*`) — sync, async, data, control, observability |
| Dependency edges | 8 directed edges (`DEP-EDGE-*`) between `SVC-DEF-*` services |
| Directions | `outbound` \| `inbound` \| `bidirectional` |
| Adjacency builder | Declarative graph from edge catalog |
| Graph report | Integrates P1 service catalog readiness |

## Upstream (read-only)

- **P1**: `SERVICE_DEFINITION_CATALOG` (`SVC-DEF-*` refs)
- **Frozen**: V48–V67 untouched; P1 not modified

## Module layout

```
lib/platform/v68/dependency-graph/
  graph.types.ts
  graph.constants.ts
  graph.surface.ts
  dependency.type.catalog.ts
  dependency.edge.catalog.ts
  alignment.catalog.ts
  graph.builder.ts
  graph.entry.ts
  graph.ts
```

## Unified entry

```ts
import { runDependencyGraph, formatDependencyGraphSummary } from "@/lib/platform/v68";

const report = runDependencyGraph({ deploymentId: "prod" });
console.log(formatDependencyGraphSummary(report));
```

## Verify

```bash
npm run verify:v68-p2-dependency-graph
npm run verify:v68-platform          # P1 + P2
```

## Freeze point (P2)

After P2 PASS:

- `lib/platform/v68/dependency-graph/` — P2 module tree
- `V68_DEPENDENCY_GRAPH_VERSION` = `v68-dependency-graph-1`
- `npm run verify:v68-p2-dependency-graph`
- `docs/platform/V68-DEPENDENCY-GRAPH.md`

P1 independently rollback-safe.

## Rollback

Delete `lib/platform/v68/dependency-graph/` + verify script + doc; revert `index.ts` export and `verify:v68-platform` to P1-only. V48–V67 and P1 unaffected.

## Boundaries

- Adjacency list is declarative — not computed from runtime traffic
- Does not perform cycle detection or impact analysis at runtime
- Does not modify P1 service catalog
