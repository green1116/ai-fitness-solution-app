# V66 P2 — Deployment Execution & Health Checks

Minimal deployment execution support: health checks, startup verification, readiness probe surface. **Declarative read-only layer** — no API, UI, Prisma, or business runtime changes.

## Scope (P2 only)

| Artifact | Purpose |
|----------|---------|
| Health checks | 10 declarative checks (upstream, config, build, process, probe) |
| Startup verification | 8 ordered startup gates |
| Readiness probe surface | Catalog of HTTP/script/module probes for deployment |
| Verify entrypoint | `npm run verify:v66-p2-deployment-execution` |

## Upstream

- **P1**: `lib/deployment/v66/baseline.*` — env contract & deployment checklist
- **Frozen**: V48–V65 untouched; probes reference existing routes/scripts only

## Module layout

```
lib/deployment/v66/
  execution.types.ts        # Report & signal types
  execution.surface.ts        # Artifact paths
  health.inventory.ts         # Health check catalog
  health.checks.ts            # Deterministic evaluation
  startup.verification.ts     # Ordered startup sequence
  probe.surface.ts            # Readiness probe catalog
  execution.builder.ts          # Report builder
  execution.entry.ts            # Unified entry
  execution.ts
```

## Unified entry

```ts
import {
  runDeploymentExecution,
  formatDeploymentExecutionSummary,
} from "@/lib/deployment/v66";

const report = runDeploymentExecution({
  deploymentId: "prod",
  signals: { databaseReachable: true },
});
console.log(formatDeploymentExecutionSummary(report));
```

## Health checks (summary)

| ID | Check | Required |
|----|-------|----------|
| HC-001 | V66 P1 baseline ready | yes |
| HC-002 | Production secrets configured | yes |
| HC-003 | Forbidden dev flags clear | yes |
| HC-004 | package-lock.json present | yes |
| HC-005 | Node engine declared | no |
| HC-006 | Prisma client generated | yes |
| HC-007 | Database reachable | no (optional live probe) |
| HC-008 | Build artifacts present | no |
| HC-009 | Readiness probe surface declared | yes |
| HC-010 | Startup sequence complete | yes |

## Readiness probe surface

| ID | Kind | Target |
|----|------|--------|
| RP-001 | http | `/api/production/health` (existing, frozen) |
| RP-002 | script | `npm run prisma:preflight` |
| RP-003 | script | `npm run verify:v66-p1-deployment-baseline` |
| RP-004 | script | `npm run verify:v66-p2-deployment-execution` |
| RP-005 | script | `npm run verify:v65-production` |
| RP-006 | module | `lib/deployment/v66/execution.ts` |
| RP-007 | module | `lib/deployment/v66/baseline.ts` |
| RP-008 | script | `npm run v92:env-audit` (optional) |

## Verify

```bash
npm run verify:v66-p2-deployment-execution
npm run verify:v66-deployment          # P1 + P2
npm run verify:v66-p1-deployment-baseline
npm run verify:v65-production
```

## Rollback

Delete P2-only artifacts:

1. `lib/deployment/v66/execution*.ts`, `health.*`, `startup.verification.ts`, `probe.surface.ts`
2. `docs/deployment/V66-DEPLOYMENT-EXECUTION.md`
3. `scripts/verify-v66-p2-deployment-execution.ts`
4. Revert `package.json` `verify:v66-*` to P1-only
5. Revert `lib/deployment/v66/index.ts` to export baseline only

P1 and all frozen layers remain intact.

## Boundaries

- Does not invoke HTTP probes or DB connections at build time (except verify script FS checks)
- Does not add new API routes — references existing `/api/production/health`
- Signals are deterministic; optional live probes (HC-007, RP-008) are non-blocking by default
