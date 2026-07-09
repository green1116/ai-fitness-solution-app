# V67 P7 — Incident Report & Postmortem Foundation

Declarative incident report types, RCA catalog, action item contracts, and archive index. **Read-only layer** — no ticket workflow, no notifications, no external platforms, no V48–V66 mutations.

## Scope (P7 only)

| Artifact | Purpose |
|----------|---------|
| Report types | 8 incident report templates across 6 kinds |
| RCA catalog | 8 root cause analysis methods across 5 techniques |
| Action items | 8 improvement item rules across 4 kinds |
| Archive index | 8 archival entries across 4 statuses |
| Foundation report | Integrates P6 observability dashboard readiness |

## Upstream

- **P1**: incident event catalog (`EVT-*` refs)
- **P2**: lifecycle transitions & postmortem status
- **P3**: alert severity tiers
- **P4**: SLO refs (`SLOT-*`)
- **P6**: dashboard refs (`DBD-*`) + builder dependency
- **Frozen**: V48–V66 untouched

## Module layout

```
lib/monitoring/v67/postmortem/
  governance.types.ts           # Types
  governance.surface.ts           # Artifact paths
  report.types.catalog.ts         # Incident report types
  rca.catalog.ts                  # RCA methods
  action.item.contract.ts         # Improvement items
  archive.index.ts                # Archive index
  alignment.catalog.ts            # Cross-ref validation
  governance.builder.ts             # Report builder
  governance.entry.ts               # Unified entry
  postmortem.ts
```

## Report kinds

`incident_summary` | `timeline` | `impact` | `mitigation` | `postmortem_draft` | `postmortem_final`

## RCA methods

`five_whys` | `fishbone` | `timeline` | `contributing_factors` | `declarative`

## Action item kinds

`preventive` | `corrective` | `detective` | `process`

## Archive statuses

`draft` | `indexed` | `published` | `archived`

## Unified entry

```ts
import { runPostmortemFoundation, formatPostmortemFoundationSummary } from "@/lib/monitoring/v67";

const report = runPostmortemFoundation({ deploymentId: "prod" });
console.log(formatPostmortemFoundationSummary(report));
```

## Verify

```bash
npm run verify:v67-p7-postmortem-foundation
npm run verify:v67-monitoring          # P1 + … + P7
```

## Freeze point (P7)

After P7 PASS:

- `lib/monitoring/v67/postmortem/` — P7 module tree
- `V67_POSTMORTEM_FOUNDATION_VERSION`
- `npm run verify:v67-p7-postmortem-foundation`
- `docs/monitoring/V67-POSTMORTEM-FOUNDATION.md`

P1–P6 independently rollback-safe.

## Rollback

Delete P7 artifacts and revert `verify:v67-monitoring` to P1–P6. V48–V66 unaffected.

## Boundaries

- `requiredSections` / `investigationSteps` / `verificationCriteria` are declarative — not executed at runtime
- Does not create tickets or send notifications
- Does not modify P2 lifecycle state machine
