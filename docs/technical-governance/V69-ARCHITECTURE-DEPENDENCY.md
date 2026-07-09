# V69 P2 — Architecture Dependency

Declarative architecture dependency governance between `ARC-DEF-*` objects. **Read-only layer** — no runtime connections, no UI, no database changes. V48–V69 P1 untouched.

## Scope (P2 only)

| Artifact | Purpose |
|----------|---------|
| Dependency kinds | 5 kinds (`ADEP-KND-*`) — sync/async/data/control/observability |
| Dependency strengths | 4 levels (`ADEP-STR-*`) — weak/moderate/strong/critical |
| Allowed boundaries | 6 rules (`ADEP-BND-*`) — layer-adjacent, cross-layer, security, etc. |
| Dependency edges | 8 edges (`ADEP-EDGE-*`) — direction + kind + strength + boundary |
| Dependency graph | Adjacency list over `ARC-DEF-*` nodes |
| Registry | Unified index of all dependency catalog IDs |
| Freeze lock | `V69_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK` |
| Rollback index | Per-layer rollback paths (`ADR-*`) |

## Upstream (read-only)

- **P1**: `buildArchitectureCatalogReport()` + `ARCHITECTURE_DEFINITION_CATALOG`
- **Frozen**: V48–V69 P1 not modified

## Module layout

```
lib/technical-governance/v69/architecture-dependency/
  dependency.types.ts
  dependency.constants.ts
  dependency.surface.ts
  dependency.kind.catalog.ts
  dependency.strength.catalog.ts
  dependency.boundary.catalog.ts
  dependency.edge.catalog.ts
  alignment.catalog.ts
  dependency.registry.ts
  freeze.lock.ts
  rollback.index.ts
  dependency.builder.ts
  dependency.entry.ts
  architecture-dependency.ts
```

## Unified entry

```ts
import { runArchitectureDependency, formatArchitectureDependencySummary } from "@/lib/technical-governance/v69";

const report = runArchitectureDependency({ deploymentId: "prod" });
console.log(formatArchitectureDependencySummary(report));
```

## Verify

```bash
npm run verify:v69-p2-architecture-dependency
```

## Freeze point (P2)

- `V69_ARCHITECTURE_DEPENDENCY_VERSION` = `v69-architecture-dependency-1`
- `V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION` = `v69-architecture-dependency-freeze-1`
- `lib/technical-governance/v69/architecture-dependency/`
- `npm run verify:v69-p2-architecture-dependency`

## Rollback

See `rollback.index.ts` (`ADR-P2` … `ADR-UP`). P1 `architecture-catalog/` must not be modified.

## Boundaries

- Edges model governance only — no runtime dependency resolution
- `computeDeclarativeCouplingAllowed` is lookup helper only
