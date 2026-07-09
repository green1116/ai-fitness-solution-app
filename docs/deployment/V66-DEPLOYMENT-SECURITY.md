# V66 P5 — Deployment Security & Compliance

Minimal deployment security baseline: policy catalog, compliance checklist, security gates, artifact integrity inventory. **Declarative read-only layer** — no auth changes, no runtime enforcement, no API/UI/Prisma mutations.

## Scope (P5 only)

| Artifact | Purpose |
|----------|---------|
| Security policy catalog | 12 declarative security policies (secrets, auth, integrity, compliance) |
| Compliance checklist | 10 SOC2-aligned checklist items |
| Security gates | 8 deployment security gates (closed/blocked/open) |
| Artifact integrity inventory | 10 tracked deployment artifacts |
| Verify entrypoint | `npm run verify:v66-p5-deployment-security` |

## Upstream

- **P1–P4**: baseline through release orchestration
- **Frozen**: V48–V65 referenced only; no mutations

## Module layout

```
lib/deployment/v66/
  security.types.ts                 # Types
  security.artifacts.ts               # Artifact paths
  security.policy.catalog.ts          # Security policy inventory
  compliance.checklist.ts             # Compliance checklist
  security.gates.ts                   # Deployment security gates
  artifact.integrity.inventory.ts     # Artifact integrity catalog
  security.builder.ts                   # Report builder
  security.entry.ts                     # Unified entry
  security.ts
```

## Unified entry

```ts
import {
  runDeploymentSecurity,
  formatDeploymentSecuritySummary,
} from "@/lib/deployment/v66";

const report = runDeploymentSecurity({ deploymentId: "prod" });
console.log(formatDeploymentSecuritySummary(report));
```

## Security policies (summary)

| ID | Policy | Severity |
|----|--------|----------|
| SP-001 | Secrets not in repository | critical |
| SP-003 | Forbidden dev auth flags in production | critical |
| SP-007 | V48–V65 frozen unmodified | critical |
| SP-008 | V66 declarative only — no Prisma mutation | critical |
| SP-011 | Verify chain before rollout | critical |

## Compliance checklist (summary)

10 items mapped to SOC2-CC4/CC6/CC7/CC8/CC9 controls covering env contract, audit logs, rollback, release manifest, security gates.

## Security gates (summary)

| ID | Gate | Blocker |
|----|------|---------|
| SG-001 | P4 orchestration ready | yes |
| SG-002 | Policy catalog complete | yes |
| SG-003 | Compliance checklist pass | yes |
| SG-004 | Artifact integrity complete | yes |
| SG-007 | P5 security verify | no |

## Artifact integrity (summary)

Tracks `package-lock.json`, `prisma/schema.prisma` (frozen reference), V66 modules, verify scripts, and docs.

## Verify

```bash
npm run verify:v66-p5-deployment-security
npm run verify:v66-deployment          # P1 + P2 + P3 + P4 + P5
```

## Rollback

Delete P5-only artifacts:

1. `security*.ts`, `compliance.checklist.ts`, `artifact.integrity.inventory.ts`
2. `docs/deployment/V66-DEPLOYMENT-SECURITY.md`
3. `scripts/verify-v66-p5-deployment-security.ts`
4. Revert `package.json` `verify:v66-deployment` to P1–P4
5. Revert `lib/deployment/v66/index.ts` to export through release only

P1–P4 and all frozen layers remain intact.

## Boundaries

- Policies are declarative catalogs — **no runtime security enforcement**
- No auth middleware, session, or API route changes
- Live secret/flag checks remain in `v92:env-audit` (referenced, not replaced)
- SOC2 framework tags are mapping labels only, not certification claims
