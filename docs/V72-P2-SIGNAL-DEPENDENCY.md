# V72 P2 — Signal Dependency

Declarative signal dependency graph. **Read-only** — no runtime, API, database, or UI changes. V48–V72 P1 untouched.

## Scope (P2 only)

| Concept | Purpose |
|---------|---------|
| SignalNode | Graph node linked to `INT-*` from P1 intelligence catalog |
| Dependency | Directed edge with upstream / downstream |
| Required | Hard dependency edge |
| Optional | Soft dependency edge |
| Order | Topological ordering hint |
| CycleCheck | Declarative acyclic validation |
| Impact | low / medium / high / critical |

## Module layout

```
lib/intelligence/v72/
  signal.dependency.ts
  dependency.graph.ts
  dependency.builder.ts
  dependency.entry.ts
```

## Entry

```ts
import { buildSignalDependency, runSignalDependency } from "@/lib/intelligence/v72/dependency.entry";

const report = runSignalDependency({ deploymentId: "prod" });
```

## Exports

- `V72_SIGNAL_DEPENDENCY_VERSION` = `v72-signal-dependency-1`
- `V72_SIGNAL_DEPENDENCY_FREEZE_VERSION` = `v72-signal-dependency-freeze-1`
- `buildSignalDependency()`
- `runSignalDependency()`

## Upstream (read-only)

- **P1**: `buildIntelligenceCatalog()`

## Verify

```bash
npx tsx scripts/verify-v72-p2-signal-dependency.ts
```

## Freeze point (P2)

- `v72-signal-dependency-freeze-1`
- `lib/intelligence/v72/dependency.*`

## Boundaries

- Declarative graph only — no signal execution
