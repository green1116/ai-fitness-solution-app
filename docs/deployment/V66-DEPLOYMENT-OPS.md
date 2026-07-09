# V66 P7 — Deployment Automation & Operations Runbook

Minimal ops automation foundation: automation catalog, runbook checklist, operator actions matrix, escalation map. **Declarative read-only layer** — no deployment execution, no cron/scheduling, no runtime changes.

## Scope (P7 only)

| Artifact | Purpose |
|----------|---------|
| Automation catalog | 12 declarative automation references (verify, build, prisma, env-audit) |
| Runbook checklist | 10-item ops runbook (pre-deploy → rollback) |
| Operator actions matrix | 12 manual operator actions by role |
| Escalation map | 10 incident escalation entries (L1–L4) |
| Verify entrypoint | `npm run verify:v66-p7-deployment-ops` |

## Upstream

- **P1–P6**: deployment baseline through disaster recovery
- **Frozen**: V48–V65 referenced only; no mutations

## Module layout

```
lib/deployment/v66/
  ops.types.ts                      # Types
  ops.artifacts.ts                    # Artifact paths
  automation.catalog.ts               # Automation inventory
  runbook.checklist.ts                # Runbook checklist
  operator.actions.matrix.ts          # Operator actions by role
  escalation.map.ts                   # Incident escalation map
  ops.builder.ts                        # Report builder
  ops.entry.ts                          # Unified entry
  ops.ts
```

## Unified entry

```ts
import { runDeploymentOps, formatDeploymentOpsSummary } from "@/lib/deployment/v66";

const report = runDeploymentOps({ deploymentId: "prod" });
console.log(formatDeploymentOpsSummary(report));
```

## Automation catalog (summary)

| ID | Command | Phase |
|----|---------|-------|
| DA-001 | `npm run verify:v66-deployment` | pre-deploy |
| DA-002 | `npm run prisma:preflight` | pre-deploy |
| DA-003 | `npm run build` | deploy |
| DA-007 | `npm run verify:v66-p7-deployment-ops` | post-deploy |

All entries are **references only** — P7 does not execute them.

## Operator roles

`deployer` | `operator` | `oncall` | `security` | `platform`

All actions have `automated: false` — manual operator steps only.

## Escalation levels

| Level | Example trigger |
|-------|-----------------|
| L1 | Health check warn, verify failure |
| L2 | Prisma preflight fail, security gate blocked |
| L3 | Production outage, secrets exposure |
| L4 | Extended outage, frozen layer compromise |

## Verify

```bash
npm run verify:v66-p7-deployment-ops
npm run verify:v66-deployment          # P1 + P2 + P3 + P4 + P5 + P6 + P7
```

## Rollback

Delete P7-only artifacts:

1. `ops*.ts`, `automation.catalog.ts`, `runbook.checklist.ts`, `operator.actions.matrix.ts`, `escalation.map.ts`
2. `docs/deployment/V66-DEPLOYMENT-OPS.md`
3. `scripts/verify-v66-p7-deployment-ops.ts`
4. Revert `package.json` `verify:v66-deployment` to P1–P6
5. Revert `lib/deployment/v66/index.ts` to export through dr only

P1–P6 and all frozen layers remain intact.

## Boundaries

- **No deployment execution** — catalog and runbook only
- **No cron/scheduling** — no background jobs or timers
- RB-004/RB-005 deploy steps are `na` (manual operator placeholders)
- Commands reference existing npm scripts without invoking them from P7 layer
