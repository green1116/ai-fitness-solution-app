# V80 DEPLOY P1 — Production Launch Setup

Launch readiness for V80 CODE + PRODUCT stack. No architecture changes.

## Verify

```bash
npx tsx scripts/verify-v80-deploy-p1-launch.ts
npx tsc --noEmit
```

## Deploy

| Step | Command |
|------|---------|
| Env | Copy `.env.v80.example` → production secrets |
| DB | Apply `prisma/patches/v80_scaffold_runtime_idempotent.sql` |
| Build | `npx prisma generate && npm run build` |
| Health | `GET /api/v80/ops/health` |
| Worker | `V80_WORKER_ENABLED=1 npm run v80:worker` |

## Structure

- **Edge/Compute:** `app/api/v80/**` + `withProductionHandler`
- **Worker:** `scripts/v80-worker-start.ts`
- **Queue:** in-process lock (no external broker at launch)
- **Data:** V80Scaffold* + memory fallback

## Go-live gates

See `lib/deploy/v80/deploy.checklist.ts` — 10 gates (upstream → env → DB → runtime → verify).
