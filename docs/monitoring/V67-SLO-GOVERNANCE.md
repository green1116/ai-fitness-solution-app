# V67 P4 — SLO/SLI Governance

Declarative SLI types, SLO objectives, error budget contracts, and objective catalog. **Read-only layer** — no metrics collection, no external platforms, no V48–V66 mutations.

## Scope (P4 only)

| Artifact | Purpose |
|----------|---------|
| SLI type catalog | 8 SLI types across 6 kinds (aligned with P1 `SLI-*`) |
| SLO type catalog | 8 SLO types across 3 tiers |
| Objective catalog | Derived objectives with owners |
| Budget contract | 8 error budget / burn-rate rules |
| Governance report | Integrates P3 alert taxonomy readiness |

## Upstream

- **P1**: `slo.contract.ts` foundation SLI/SLO refs (read-only)
- **P3**: alert taxonomy (builder dependency; `alertRuleRef` links)
- **Frozen**: V48–V66 untouched

## Module layout

```
lib/monitoring/v67/slo/
  governance.types.ts       # Types
  governance.surface.ts       # Artifact paths
  sli.types.catalog.ts        # SLI type definitions
  slo.types.catalog.ts        # SLO type definitions
  objective.catalog.ts        # Objective catalog
  budget.contract.ts          # Error budget rules
  governance.builder.ts         # Report builder
  governance.entry.ts           # Unified entry
  slo.ts
```

## SLI kinds

`availability` | `latency` | `correctness` | `throughput` | `freshness` | `operational`

## SLO tiers

| Tier | Examples |
|------|----------|
| critical | availability 99.9%, latency P95, error rate |
| standard | health probe, verify chain |
| best-effort | MTTR, throughput stability |

## Error budget window kinds

`rolling` | `calendar` | `fixed`

## Unified entry

```ts
import { runSloGovernance, formatSloGovernanceSummary } from "@/lib/monitoring/v67";

const report = runSloGovernance({ deploymentId: "prod" });
console.log(formatSloGovernanceSummary(report));
```

## Verify

```bash
npm run verify:v67-p4-slo-governance
npm run verify:v67-monitoring          # P1 + P2 + P3 + P4
```

## Freeze point (P4)

After P4 PASS:

- `lib/monitoring/v67/slo/` — P4 module tree
- `V67_SLO_GOVERNANCE_VERSION`
- `npm run verify:v67-p4-slo-governance`
- `docs/monitoring/V67-SLO-GOVERNANCE.md`

P1–P3 independently rollback-safe.

## Rollback

Delete P4 artifacts and revert `verify:v67-monitoring` to P1–P3. V48–V66 unaffected.

## Boundaries

- `goodEvent` / `validEvent` are declarative — not evaluated at runtime
- `computeDeclarativeErrorBudget` is formula helper only, no live metrics
- Does not modify P1 `SLI_CATALOG` / `SLO_CATALOG`
