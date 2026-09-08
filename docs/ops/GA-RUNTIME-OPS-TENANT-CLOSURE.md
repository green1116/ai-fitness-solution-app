# GA Runtime Ops — Tenant Ops Closure

## Status

**GA = FROZEN / CONDITIONAL SINGLE-ORG**

**Production GO (PRV Phase 1) = CONDITIONAL SINGLE-ORG** — see `docs/ops/PRV-PHASE-1-PRODUCTION-RUNTIME-VALIDATION.md`

Recorded: 2026-09-07
PRV Phase 1 closed: 2026-09-08
Closure ref (gate-failure audit): `0e9d7147`
PRV baseline commit: `72b62ce9e498d29daf7ef2e0f31745d59a426454`
PRV tag: `post-ga-tenant-ops-history-refresh-v1`
Branch baseline: `release/ga-production`

## Freeze posture

| Field | Value |
| --- | --- |
| GA status | **FROZEN / CONDITIONAL SINGLE-ORG** |
| Production decision | **GO — CONDITIONAL SINGLE-ORG** (PRV Phase 1 PASS) |
| Allowed mutate roles | **OWNER / ADMIN** only (`manage_members` / role gate) |
| Org binding | Exact single-org via `resolveExactSingleOrganizationIdForUser` (0 / >1 fail-closed) |
| Multi-org | **Org selector required before multi-org launch** |

## In scope (frozen)

Tenant Runtime Ops sidecar over CRM Customer + Opportunity:

- Backlog read (ATTENTION / AVAILABLE / DEFERRED)
- REVIEW / RECOVER / EXECUTE (conditional write + idempotency)
- OPEN DEAL / CLOSE WON / CLOSE LOST (NEGOTIATION gates + terminal idempotency)
- Org + role gates; Customer/Opportunity ownership
- Deal close concurrency (advisory lock + OPEN conditional write)
- Failure classification + Retry UX
- `tenant_ops.*` audit + history read/UI (+ history refresh after mutation SUCCESS)
- Gate-failure audit for REVIEW / RECOVER / EXECUTE / OPEN DEAL / CLOSE WON / CLOSE LOST submits
- Post-GA operability projection (OWNER/ADMIN Workspace summary)

Frozen commercial packs (EADS / EAC / EWAS / EWI / EWEB / EWER) remain untouched.

## Conditional constraints

1. **Single-org only** for this GA freeze. Do not treat multi-membership as supported.
2. **OWNER/ADMIN only** for mutate actions. MEMBER → `role-forbidden`.
3. Before any multi-org production launch: ship an explicit **organization selector** (Workspace remains fail-closed for 0 / >1 memberships).

## Remaining after PRV Phase 1

### NON-BLOCKER

| Item | Note |
| --- | --- |
| Terminal action UX | NEGOTIATION currently surfaces both CLOSE WON and CLOSE LOST |
| Count presentation / reconciliation | Multi-click terminal actions can look like one backlog count delta |
| Terminal label semantics | Operability **Terminal** counts failure-class TERMINAL, not pipeline WON/LOST |
| Residual `existing[0]` | Non-Workspace paths (e.g. `/api/auth/me`) may still pick first org |
| RESEND `result.error` handling | OTP request path correctness debt; not a PRV Phase 1 blocker |

### LAUNCH-GATE

| Item | Note |
| --- | --- |
| Multi-org selector | Pre-requisite for multi-org launch; not required for CONDITIONAL SINGLE-ORG GO |

## Explicit non-goals (this freeze)

- Schema / migration
- Multi-org selector implementation (pre-requisite for multi-org launch, not in this freeze)
- Changes to frozen EADS/EAC/EWAS/EWI/EWEB/EWER layers
