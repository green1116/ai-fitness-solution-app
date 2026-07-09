# V80 CODE P4 — Production Release & Operations

Release/ops layer on P3 hardened runtime: deploy binding, observability, governance, commercial enforcement.

## Verify

```bash
npx tsx scripts/verify-v80-code-p4-release.ts
npx tsx scripts/verify-v80-code-p3-hardening.ts
npx tsc --noEmit
```

## Ops endpoints

- `GET /api/v80/ops/health` — deployment + integrity
- `GET /api/v80/ops/metrics` — p50/p95/p99 latency
- `GET /api/v80/ops/governance/audit` — audit trail
