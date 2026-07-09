# V68 P7 — Observability Policy

Declarative metric, log, trace catalogs and alert mappings. **Read-only layer** — no runtime collection, no UI, no V48–V67 mutations.

## Scope (P7 only)

| Artifact | Purpose |
|----------|---------|
| Metric catalog | 8 metrics (`OBS-MET-*`) — counter/gauge/histogram aligned with V67 `SH-*` / `SLOT-*` / `MV-*` |
| Log catalog | 8 log streams (`OBS-LOG-*`) — level/retention per service |
| Trace catalog | 8 trace spans (`OBS-TRC-*`) — span kind & sampling rate |
| Alert mappings | 8 mappings (`OBS-ALM-*`) — metric/log/trace → `REL-FAIL-*` / P0–P4 |
| Policy report | Integrates P6 reliability policy readiness |

## Upstream (read-only)

- **P1**: `SERVICE_DEFINITION_CATALOG` (`SVC-DEF-*`)
- **P6**: reliability policy + `FAILURE_SEVERITY_CATALOG` (`REL-FAIL-*`)
- **Frozen V67**: `SERVICE_HEALTH_CATALOG`, `SLO_TYPE_CATALOG`, `METRIC_VIEW_CATALOG` (string ref validation only)
- **Frozen**: V48–V67 untouched; P1–P6 not modified

## Module layout

```
lib/platform/v68/observability-policy/
  governance.types.ts
  governance.constants.ts
  governance.surface.ts
  metric.catalog.ts
  log.catalog.ts
  trace.catalog.ts
  alert.mapping.catalog.ts
  alignment.catalog.ts
  governance.builder.ts
  governance.entry.ts
  observability-policy.ts
```

## Unified entry

```ts
import { runObservabilityPolicy, formatObservabilityPolicySummary } from "@/lib/platform/v68";

const report = runObservabilityPolicy({ deploymentId: "prod" });
console.log(formatObservabilityPolicySummary(report));
```

## Verify

```bash
npm run verify:v68-p7-observability-policy
npm run verify:v68-platform          # P1 + … + P7
```

## Freeze point (P7)

After P7 PASS:

- `lib/platform/v68/observability-policy/` — P7 module tree
- `V68_OBSERVABILITY_POLICY_VERSION` = `v68-observability-policy-1`
- `npm run verify:v68-p7-observability-policy`
- `docs/platform/V68-OBSERVABILITY-POLICY.md`

P1–P6 independently rollback-safe.

## Rollback

Delete `lib/platform/v68/observability-policy/` + verify script + doc; revert `index.ts` and `verify:v68-platform` to P1–P6. V48–V67 and P1–P6 unaffected.

## Boundaries

- Catalog entries are declarative — no log/metric/trace collection at runtime
- `computeDeclarativeSamplingBudget` is lookup helper only
- Does not modify V67 monitoring modules or emit alerts
