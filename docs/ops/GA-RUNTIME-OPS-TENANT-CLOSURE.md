# GA Runtime Ops — Tenant Ops Closure

## Status

**GA = FROZEN / CONDITIONAL SINGLE-ORG**

Recorded: 2026-09-07  
Closure ref (gate-failure audit): `0e9d7147`  
Branch baseline: `release/ga-production`

## Freeze posture

| Field | Value |
| --- | --- |
| GA status | **FROZEN / CONDITIONAL SINGLE-ORG** |
| Allowed mutate roles | **OWNER / ADMIN** only (`manage_members` / role gate) |
| Org binding | Single-org assumption for GA; Workspace still resolves via `orgs[0]` |
| Multi-org | **Org selector required before multi-org launch** |

## In scope (frozen)

Tenant Runtime Ops sidecar over CRM Customer + Opportunity:

- Backlog read (ATTENTION / AVAILABLE / DEFERRED)
- REVIEW / RECOVER / EXECUTE (conditional write + idempotency)
- OPEN DEAL / CLOSE WON / CLOSE LOST (NEGOTIATION gates + terminal idempotency)
- Org + role gates; Customer/Opportunity ownership
- Deal close concurrency (advisory lock + OPEN conditional write)
- Failure classification + Retry UX
- `tenant_ops.*` audit + history read/UI
- Gate-failure audit for REVIEW / RECOVER / EXECUTE submits

Frozen commercial packs (EADS / EAC / EWAS / EWI / EWEB / EWER) remain untouched.

## Conditional constraints

1. **Single-org only** for this GA freeze. Do not treat multi-membership as supported.
2. **OWNER/ADMIN only** for mutate actions. MEMBER → `role-forbidden`.
3. Before any multi-org production launch: ship an explicit **organization selector** (replace Workspace `orgs[0]` binding).

## Post-GA P2 (not blockers)

| Item | Note |
| --- | --- |
| Terminal action UX | NEGOTIATION currently surfaces both CLOSE WON and CLOSE LOST |
| History auto-refresh | History panel does not auto-reload after mutations |
| Operational count observability | Multi-click terminal actions can look like one backlog count delta |

## Explicit non-goals (this freeze)

- Schema / migration
- Multi-org selector implementation (pre-requisite for multi-org launch, not in this freeze)
- Changes to frozen EADS/EAC/EWAS/EWI/EWEB/EWER layers
