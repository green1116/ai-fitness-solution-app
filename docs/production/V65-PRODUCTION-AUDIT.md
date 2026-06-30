# V65 P1 — Production Readiness Audit

Read-only audit of repository production readiness after [V64 Commercial Freeze](./V64-COMMERCIAL-FREEZE.md). No business, API, DB, UI, or runtime behavior changes.

## Scope

| Capability | Module |
|------------|--------|
| Repository audit | `audit.builder.ts` |
| Legacy issue inventory | `audit.inventory.ts` |
| Build blockers | `audit.blockers.ts` |
| Runtime blockers | `audit.runtime.ts` |
| Dependency audit | `audit.dependencies.ts` |
| Release checklist | `audit.checklist.ts` |
| Unified entry | `audit.entry.ts` |

## Unified entry

```ts
import { runProductionReadinessAudit } from "@/lib/production/v65";

const report = runProductionReadinessAudit({
  deploymentId: "prod",
  signals: {
    verifyChainPass: true,
    typeScriptClean: false,  // from CI
    buildPass: false,
    prismaPreflightPass: false,
  },
});
```

## Release readiness summary

| Gate | Status | Notes |
|------|--------|-------|
| V64 commercial freeze | **PASS** | P1–P8 frozen and verified |
| `npm run verify` | **PASS** | V64 commercial chain |
| `npx tsc --noEmit` | **FAIL** | 14 errors in 5 files |
| `npm run build` | **FAIL** | Blocked at `prisma:preflight` |
| **Production ready** | **NO** | Schema drift + type errors |

**Readiness score:** ~40/100 (required checklist items)

## Categorized issue list

### TypeScript (5 files, 14 errors)

| ID | File | Severity | Summary |
|----|------|----------|---------|
| TS-001 | `app/(documents)/documents/quotes/[quoteId]/page.tsx` | medium | `data.latest` possibly undefined |
| TS-002 | `lib/feature-flags/feature-gate.ts` | high | `subscription.plan` string vs `SaasPlan` (5 errors) |
| TS-003 | `lib/organization/organization.service.ts` | critical | `Organization.slug` not in schema |
| TS-004 | `lib/portal/v57/experience/workspace-summary.service.ts` | high | slug + nullable name |
| TS-005 | `scripts/verify-v64-p6-commercial-transition.ts` | low | strict null checks in verify script |

### Prisma schema drift (build blocker)

| ID | Severity | Summary |
|----|----------|---------|
| PRISMA-001 | critical | 23 breaking changes vs baseline — Risk CRITICAL |
| PRISMA-002 | critical | 19 blocked migration operations |
| PRISMA-003 | high | Runtime `as SaasPlan` cast masks String plan field |

**Blocked migrations (19):** Organization.slug, Organization.invoices/crmCustomers, Subscription.plan/status enums, SaasInvoice relations and table map — see `PRISMA_BLOCKED_OPERATIONS` in `audit.blockers.ts`.

### Runtime blockers

| ID | Area | Impact |
|----|------|--------|
| RT-001 | organization-onboarding | `createOrganization` writes `slug` — field missing |
| RT-002 | feature-gating | Plan enum drift |
| RT-003 | portal-workspace | Workspace summary expects slug |
| RT-004 | saas-billing | SaasInvoice/Subscription model mismatch |
| RT-005 | documents-quotes | Unguarded `data.latest` access |

### Dependency audit

- **Production deps:** 24 (Next 16, React 19, Prisma 6.19, Stripe, etc.)
- **Dev deps:** 11
- **Lockfile:** `package-lock.json` present
- **Node engines:** not declared in `package.json`
- **Pinning:** all deps use caret (`^`) ranges

## Release checklist

| ID | Item | Required | Status |
|----|------|----------|--------|
| CHK-001 | V64 commercial frozen | yes | pass |
| CHK-002 | npm run verify | yes | pass |
| CHK-003 | TypeScript clean | yes | **fail** |
| CHK-004 | Prisma preflight | yes | **fail** |
| CHK-005 | Production build | yes | **fail** |
| CHK-006 | Organization schema aligned | yes | **fail** |
| CHK-007 | SaaS subscription model aligned | yes | **fail** |
| CHK-008 | Feature gate type safety | yes | **fail** |
| CHK-009 | Lockfile present | yes | pass |
| CHK-010 | Node engine declared | no | warn |

## Recommended remediation order

1. **Prisma schema** — reconcile `Organization.slug`, `Subscription` enums, `SaasInvoice` with baseline or apply `prisma/patches/v59_saas_tables_idempotent.sql` path
2. **Organization service** — align with restored schema
3. **Feature gate** — fix `SaasPlan` typing at subscription boundary
4. **Portal workspace** — sync types with Organization model
5. **Quotes page** — guard `data.latest`
6. **Verify script** — optional strict-null fixes in P6 script

## Verify

```bash
npm run verify:v65-p1-production-audit
npm run verify                    # V64 commercial (passes)
npx tsc --noEmit                  # fails — documented above
npm run build                     # fails — prisma preflight
```

## Boundaries

- Audit layer only — does not fix blockers
- V64 commercial outputs unchanged
- V63 backward compatibility preserved
