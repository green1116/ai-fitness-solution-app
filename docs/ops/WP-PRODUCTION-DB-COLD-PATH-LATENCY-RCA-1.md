# WP-PRODUCTION-DB-COLD-PATH-LATENCY-RCA-1

## Status

**PASS / CLOSED / NO CODE CHANGE**

Closed: 2026-09-05

## Result

| Item | Value |
| --- | --- |
| Verdict | **PRODUCTION INFRA PERFORMANCE PASS** |
| Root cause | Vercel Function ↔ Supabase DB **cross-region** cold-path latency |
| Vercel Function Region (after) | **`sin1`** |
| Supabase | **`ap-southeast-1`** |
| Before (DB-heavy wait) | commonly **5–18s** |
| After (observed server waits) | **~0.46–1.33s** |

## Topology (verified)

| Layer | Before | After |
| --- | --- | --- |
| Vercel | `iad1` / `sfo1` | **`sin1`** |
| Supabase pooler | `ap-southeast-1` | `ap-southeast-1` (unchanged) |
| Runtime `DATABASE_URL` mode | Transaction pooler (`6543`, `pgbouncer=true`, `connection_limit=1`) | same |

Warm path (~50–300ms) vs cold path (multi-second) differential was dominated by cross-region first-connect + sequential auth DB RTTs, not by application SQL shape alone. Usage aggregate `Promise.all` (Subscription Usage Latency P0) reduced parallel depth but did not explain the cold/warm order-of-magnitude gap.

## Deferred (non-blocking)

- Prisma production `globalThis` singleton hardening
- Further auth/session query-chain compression

These remain optional follow-ups; **not** required to close this WP.

## Scope lock

- Docs / status closeout only
- No runtime, schema, migration, entitlement, or Product Context changes in this closeout
