# V67 P6 — Observability Dashboard Contracts

Declarative dashboard catalog, service health definitions, metric views, and status summary contracts. **Read-only layer** — no data sources, no UI, no Grafana/Datadog/Prometheus, no V48–V66 mutations.

## Scope (P6 only)

| Artifact | Purpose |
|----------|---------|
| Dashboard catalog | 8 dashboards across 6 kinds |
| Service health | 8 service health definitions with probe/SLO/alert refs |
| Metric views | 8 metric view templates across 5 kinds |
| Status summary | 8 rollup rules across 5 scopes |
| Dashboard report | Integrates P5 on-call governance readiness |

## Upstream

- **P1**: foundation SLI/SLO refs (read-only via P4 catalogs)
- **P3**: alert type taxonomy (`ATY-*` refs)
- **P4**: SLI/SLO type catalogs (`SLIT-*`, `SLOT-*`)
- **P5**: on-call governance (builder dependency)
- **Frozen**: V48–V66 untouched

## Module layout

```
lib/monitoring/v67/observability/
  governance.types.ts           # Types
  governance.surface.ts           # Artifact paths
  dashboard.catalog.ts            # Dashboard definitions
  service.health.catalog.ts       # Service health models
  metric.view.catalog.ts          # Metric view templates
  status.summary.contract.ts      # Status rollup rules
  governance.builder.ts             # Report builder
  governance.entry.ts               # Unified entry
  observability.ts
```

## Dashboard kinds

`overview` | `service` | `slo` | `incident` | `oncall` | `deployment`

## Metric view kinds

`gauge` | `counter` | `histogram` | `table` | `timeline`

## Status summary scopes

`global` | `service` | `slo` | `incident` | `oncall`

## Unified entry

```ts
import { runObservabilityDashboard, formatObservabilityDashboardSummary } from "@/lib/monitoring/v67";

const report = runObservabilityDashboard({ deploymentId: "prod" });
console.log(formatObservabilityDashboardSummary(report));
```

## Verify

```bash
npm run verify:v67-p6-observability-dashboard
npm run verify:v67-monitoring          # P1 + P2 + P3 + P4 + P5 + P6
```

## Freeze point (P6)

After P6 PASS:

- `lib/monitoring/v67/observability/` — P6 module tree
- `V67_OBSERVABILITY_DASHBOARD_VERSION`
- `npm run verify:v67-p6-observability-dashboard`
- `docs/monitoring/V67-OBSERVABILITY-DASHBOARD.md`

P1–P5 independently rollback-safe.

## Rollback

Delete P6 artifacts and revert `verify:v67-monitoring` to P1–P5. V48–V66 unaffected.

## Boundaries

- `queryTemplate` / `rollupRule` / `healthMapping` are declarative — not executed at runtime
- `computeDeclarativeHealthScore` is formula helper only, no live metrics
- Does not render UI or connect to external observability platforms
