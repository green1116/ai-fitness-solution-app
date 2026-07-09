# V67 P3 — Alert Taxonomy & Governance

Declarative alert classification, severity tiers, governance rules, and suppression/aggregation/dedup contracts. **Read-only layer** — no notifications, no external platforms, no V48–V66 mutations.

## Scope (P3 only)

| Artifact | Purpose |
|----------|---------|
| Alert type catalog | 12 types across 7 categories |
| Severity tiers | P0–P4 with response SLA mapping |
| Governance rule catalog | 12 rules with trigger conditions |
| Suppression contract | 10 dedup/aggregation/silence/maintenance rules |
| Taxonomy report | Integrates P2 lifecycle readiness |

## Upstream

- **P1**: foundation alert contract (read-only reference)
- **P2**: incident lifecycle (builder dependency)
- **Frozen**: V48–V66 untouched

## Module layout

```
lib/monitoring/v67/alerting/
  taxonomy.types.ts           # Types
  taxonomy.surface.ts         # Artifact paths
  alert.types.catalog.ts        # Alert type taxonomy
  severity.tiers.ts             # P0–P4 tier definitions
  rule.catalog.ts               # Governance rules + triggers
  suppression.contract.ts       # Dedup/aggregation/silence
  taxonomy.builder.ts             # Report builder
  taxonomy.entry.ts               # Unified entry
  alerting.ts
```

## Severity tiers

| Tier | Foundation | Response | Page |
|------|------------|----------|------|
| P0 | critical | 5m | yes |
| P1 | high | 15m | yes |
| P2 | medium | 60m | no |
| P3 | low | 240m | no |
| P4 | info | — | no |

## Suppression kinds

`dedup` | `aggregation` | `silence` | `maintenance-window`

## Unified entry

```ts
import { runAlertTaxonomy, formatAlertTaxonomySummary } from "@/lib/monitoring/v67";

const report = runAlertTaxonomy({ deploymentId: "prod" });
console.log(formatAlertTaxonomySummary(report));
```

## Verify

```bash
npm run verify:v67-p3-alert-taxonomy
npm run verify:v67-monitoring          # P1 + P2 + P3
```

## Freeze point (P3)

After P3 PASS:

- `lib/monitoring/v67/alerting/` — P3 module tree
- `V67_ALERT_TAXONOMY_VERSION`
- `npm run verify:v67-p3-alert-taxonomy`
- `docs/monitoring/V67-ALERT-TAXONOMY.md`

P1/P2 independently rollback-safe.

## Rollback

Delete P3 artifacts and revert `verify:v67-monitoring` to P1+P2. V48–V66 unaffected.

## Boundaries

- Trigger `condition` fields are declarative strings — not evaluated at runtime
- No alert routing, paging, or external integration
- Maps to P1 `AlertSeverity` via `foundationSeverity` — does not modify P1
