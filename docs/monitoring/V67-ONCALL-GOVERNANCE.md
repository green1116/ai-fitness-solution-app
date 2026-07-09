# V67 P5 — On-call & Escalation Governance

Declarative on-call roster, escalation policies, response targets, and handoff contracts. **Read-only layer** — no real rotation, no notifications, no external platforms, no V48–V66 mutations.

## Scope (P5 only)

| Artifact | Purpose |
|----------|---------|
| On-call roster | 8 roster entries aligned with P1 `OC-*` foundation refs |
| Escalation policy | 8 policies across 5 trigger kinds |
| Response targets | 8 SLA targets (ack / mitigate / resolve / page) |
| Handoff contract | 8 handoff rules across 4 kinds |
| Governance report | Integrates P4 SLO governance readiness |

## Upstream

- **P1**: `oncall.contract.ts` foundation rotation catalog (read-only)
- **P2**: incident lifecycle escalation stages (`l1`–`executive`)
- **P3**: alert severity tiers (`P0`–`P4`)
- **P4**: SLO governance (builder dependency; `sloRef` links)
- **Frozen**: V48–V66 untouched

## Module layout

```
lib/monitoring/v67/oncall/
  governance.types.ts           # Types
  governance.surface.ts           # Artifact paths
  roster.catalog.ts               # On-call roster
  escalation.policy.catalog.ts    # Escalation policies
  response.target.catalog.ts      # Response SLA targets
  handoff.contract.ts             # Handoff rules
  governance.builder.ts             # Report builder
  governance.entry.ts               # Unified entry
  oncall.ts
```

## Escalation trigger kinds

`timeout` | `severity` | `manual` | `slo-breach` | `lifecycle`

## Handoff kinds

`shift-end` | `escalation` | `incident-transfer` | `role-delegation`

## Response target kinds

`acknowledge` | `mitigate` | `resolve` | `page`

## Unified entry

```ts
import { runOncallGovernance, formatOncallGovernanceSummary } from "@/lib/monitoring/v67";

const report = runOncallGovernance({ deploymentId: "prod" });
console.log(formatOncallGovernanceSummary(report));
```

## Verify

```bash
npm run verify:v67-p5-oncall-governance
npm run verify:v67-monitoring          # P1 + P2 + P3 + P4 + P5
```

## Freeze point (P5)

After P5 PASS:

- `lib/monitoring/v67/oncall/` — P5 module tree
- `V67_ONCALL_GOVERNANCE_VERSION`
- `npm run verify:v67-p5-oncall-governance`
- `docs/monitoring/V67-ONCALL-GOVERNANCE.md`

P1–P4 independently rollback-safe.

## Rollback

Delete P5 artifacts and revert `verify:v67-monitoring` to P1–P4. V48–V66 unaffected.

## Boundaries

- `triggerCondition` / `requiredArtifacts` are declarative — not evaluated at runtime
- `computeDeclarativeResponseWindow` is lookup helper only, no live paging
- Does not modify P1 `ONCALL_ROTATION_CATALOG`
