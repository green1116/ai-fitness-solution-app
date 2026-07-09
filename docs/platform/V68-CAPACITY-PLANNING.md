# V68 P5 — Capacity Planning

Declarative capacity baselines, thresholds, resource limits, and stress risk markers. **Read-only layer** — no live metrics, no autoscaling, no V48–V67 mutations.

## Scope (P5 only)

| Artifact | Purpose |
|----------|---------|
| Capacity baselines | 8 baselines (`CAP-BASE-*`) per `SVC-DEF-*` service |
| Threshold definitions | 8 thresholds (`CAP-THR-*`) — warning/critical/saturated |
| Resource limits | 8 limits (`CAP-LIM-*`) — hard/soft caps |
| Stress risk markers | 8 risks (`CAP-RISK-*`) — low/medium/high/critical |
| Planning report | Integrates P4 feature flag governance readiness |

## Upstream (read-only)

- **P1**: `SERVICE_DEFINITION_CATALOG` (`SVC-DEF-*`)
- **P4**: feature flag governance (builder dependency)
- **Frozen**: V48–V67 untouched; P1–P4 not modified

## Module layout

```
lib/platform/v68/capacity-planning/
  governance.types.ts
  governance.constants.ts
  governance.surface.ts
  capacity.baseline.catalog.ts
  threshold.definition.catalog.ts
  resource.limit.catalog.ts
  stress.risk.catalog.ts
  alignment.catalog.ts
  governance.builder.ts
  governance.entry.ts
  capacity-planning.ts
```

## Resource kinds

`cpu` | `memory` | `requests` | `connections` | `storage`

## Unified entry

```ts
import { runCapacityPlanning, formatCapacityPlanningSummary } from "@/lib/platform/v68";

const report = runCapacityPlanning({ deploymentId: "prod" });
console.log(formatCapacityPlanningSummary(report));
```

## Verify

```bash
npm run verify:v68-p5-capacity-planning
npm run verify:v68-platform          # P1 + … + P5
```

## Freeze point (P5)

After P5 PASS:

- `lib/platform/v68/capacity-planning/` — P5 module tree
- `V68_CAPACITY_PLANNING_VERSION` = `v68-capacity-planning-1`
- `npm run verify:v68-p5-capacity-planning`
- `docs/platform/V68-CAPACITY-PLANNING.md`

P1–P4 independently rollback-safe.

## Rollback

Delete `lib/platform/v68/capacity-planning/` + verify script + doc; revert `index.ts` and `verify:v68-platform` to P1–P4. V48–V67 and P1–P4 unaffected.

## Boundaries

- `triggerCondition` / threshold values are declarative — not evaluated at runtime
- `computeDeclarativeCapacityHeadroom` is formula helper only
- Does not trigger autoscaling or modify infrastructure
