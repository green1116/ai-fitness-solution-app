# V70 P2 — Release Dependency

Declarative release dependency graph. **Read-only** — no runtime, API, database, or UI changes. V48–V70 P1 untouched.

## Scope (P2 only)

| Concept | Purpose |
|---------|---------|
| ReleaseNode | Graph node linked to `DLV-REL-*` from P1 catalog |
| Dependency | Directed edge with upstream / downstream |
| Required | Hard dependency edge |
| Optional | Soft dependency edge |
| Order | Topological ordering hint |
| CycleCheck | Declarative acyclic validation |
| Impact | low / medium / high / critical |

## Module layout

```
lib/delivery/v70/
  release.dependency.ts
  dependency.graph.ts
  dependency.builder.ts
  dependency.entry.ts
```

## Entry

```ts
import { buildReleaseDependency, runReleaseDependency } from "@/lib/delivery/v70/dependency.entry";

const report = runReleaseDependency({ deploymentId: "prod" });
```

## Exports

- `V70_RELEASE_DEPENDENCY_VERSION` = `v70-release-dependency-1`
- `V70_RELEASE_DEPENDENCY_FREEZE_VERSION` = `v70-release-dependency-freeze-1`
- `buildReleaseDependency()`
- `runReleaseDependency()`

## Upstream (read-only)

- **P1**: `buildReleaseCatalog()`

## Verify

```bash
npx tsx scripts/verify-v70-p2-release-dependency.ts
```

## Freeze point (P2)

- `v70-release-dependency-freeze-1`
- `lib/delivery/v70/dependency.*`

## Boundaries

- Declarative graph only — no deployment orchestration
