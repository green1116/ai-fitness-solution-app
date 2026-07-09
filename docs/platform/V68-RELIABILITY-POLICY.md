# V68 P6 — Reliability Policy

Declarative reliability objectives, failure severities, degradation strategies, and recovery strategies. **Read-only layer** — no runtime enforcement, no UI, no V48–V67 mutations.

## Scope (P6 only)

| Artifact | Purpose |
|----------|---------|
| Reliability objectives | 8 objectives (`REL-OBJ-*`) — availability/latency/mttr/error-budget |
| Failure severities | 8 tiers (`REL-FAIL-*`) — sev-0..sev-4 aligned with V67 P0–P4 |
| Degradation strategies | 8 strategies (`REL-DEG-*`) — circuit-break/throttle/fallback/etc. |
| Recovery strategies | 8 strategies (`REL-REC-*`) — rollback/retry/failover/runbook |
| Policy report | Integrates P5 capacity planning readiness |

## Upstream (read-only)

- **P1**: `SERVICE_DEFINITION_CATALOG` (`SVC-DEF-*`)
- **P4**: `FLAG_DEFINITION_CATALOG` (`FF-DEF-*` optional refs)
- **P5**: capacity planning (builder dependency)
- **Frozen**: V48–V67 untouched; P1–P5 not modified

## Module layout

```
lib/platform/v68/reliability-policy/
  governance.types.ts
  governance.constants.ts
  governance.surface.ts
  reliability.objective.catalog.ts
  failure.severity.catalog.ts
  degradation.strategy.catalog.ts
  recovery.strategy.catalog.ts
  alignment.catalog.ts
  governance.builder.ts
  governance.entry.ts
  reliability-policy.ts
```

## Unified entry

```ts
import { runReliabilityPolicy, formatReliabilityPolicySummary } from "@/lib/platform/v68";

const report = runReliabilityPolicy({ deploymentId: "prod" });
console.log(formatReliabilityPolicySummary(report));
```

## Verify

```bash
npm run verify:v68-p6-reliability-policy
npm run verify:v68-platform          # P1 + … + P6
```

## Freeze point (P6)

After P6 PASS:

- `lib/platform/v68/reliability-policy/` — P6 module tree
- `V68_RELIABILITY_POLICY_VERSION` = `v68-reliability-policy-1`
- `npm run verify:v68-p6-reliability-policy`
- `docs/platform/V68-RELIABILITY-POLICY.md`

P1–P5 independently rollback-safe.

## Rollback

Delete `lib/platform/v68/reliability-policy/` + verify script + doc; revert `index.ts` and `verify:v68-platform` to P1–P5. V48–V67 and P1–P5 unaffected.

## Boundaries

- `triggerCondition` / RTO values are declarative — not enforced at runtime
- `computeDeclarativeRtoBudget` is lookup helper only
- Does not modify V67 monitoring modules or execute rollbacks
