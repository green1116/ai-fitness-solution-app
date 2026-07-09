# V66 P6 — Backup & Disaster Recovery

Minimal DR foundation: backup policy catalog, restore checklist, retention matrix, recovery point inventory. **Declarative read-only layer** — no backup/restore execution, no DB or storage behavior changes.

## Scope (P6 only)

| Artifact | Purpose |
|----------|---------|
| Backup policy catalog | 10 declarative backup policies across 6 target kinds |
| Restore checklist | 10-item restore runbook (prepare → restore → validate → cutover) |
| Retention matrix | 8 retention entries with RPO/RTO tiers |
| Recovery point inventory | 10 recovery point definitions |
| Verify entrypoint | `npm run verify:v66-p6-disaster-recovery` |

## Upstream

- **P1–P5**: deployment baseline through security & compliance
- **Frozen**: V48–V65 and prisma-stability referenced only

## Module layout

```
lib/deployment/v66/
  dr.types.ts                       # Types
  dr.artifacts.ts                     # Artifact paths
  backup.policy.catalog.ts            # Backup policy inventory
  restore.checklist.ts                # Restore checklist
  retention.matrix.ts                 # Retention tiers (RPO/RTO)
  recovery.point.inventory.ts         # Recovery point catalog
  dr.builder.ts                         # Report builder
  dr.entry.ts                           # Unified entry
  dr.ts
```

## Unified entry

```ts
import { runDeploymentDr, formatDeploymentDrSummary } from "@/lib/deployment/v66";

const report = runDeploymentDr({ deploymentId: "prod" });
console.log(formatDeploymentDrSummary(report));
```

## Backup policies (summary)

| ID | Target | Frequency |
|----|--------|-----------|
| BP-001 | PostgreSQL database | daily |
| BP-002 | Prisma schema snapshot | on-change |
| BP-004 | Env config template | on-change |
| BP-005 | package-lock.json | on-change |
| BP-009 | Rollback guard policy | per-release |

## Retention matrix (summary)

| Tier | Example assets | RPO |
|------|----------------|-----|
| hot | Database, lockfile | 24h / on-change |
| warm | Schema snapshots, V66 artifacts | on-change / per-release |
| cold | Deployment logs, verify outputs | continuous / per-deploy |
| archive | Migration rollback plans | per-migration |

## Recovery points (summary)

Database provider backup, Prisma baseline snapshot, migration history, env contract, release manifest, rollback guard, security policies, lockfile, recovery instructions, DR module.

## Verify

```bash
npm run verify:v66-p6-disaster-recovery
npm run verify:v66-deployment          # P1 + P2 + P3 + P4 + P5 + P6
```

## Rollback

Delete P6-only artifacts:

1. `dr*.ts`, `backup.policy.catalog.ts`, `restore.checklist.ts`, `retention.matrix.ts`, `recovery.point.inventory.ts`
2. `docs/deployment/V66-DISASTER-RECOVERY.md`
3. `scripts/verify-v66-p6-disaster-recovery.ts`
4. Revert `package.json` `verify:v66-deployment` to P1–P5
5. Revert `lib/deployment/v66/index.ts` to export through security only

P1–P5 and all frozen layers remain intact.

## Boundaries

- **No backup/restore execution** — operator runbook and catalog only
- RC-005 database restore is `na` status (declarative placeholder)
- References prisma-stability recovery modules without invoking them
- RPO/RTO values are policy targets, not SLA guarantees
