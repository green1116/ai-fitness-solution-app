# V80 DEPLOY P2 — Production Go-Live Cutover

Cutover procedures on DEPLOY P1. Execute smoke before announcing live.

## Verify

```bash
npx tsx scripts/verify-v80-deploy-p2-cutover.ts
npm run v80:smoke-live
```

## Cutover sequence

1. Preflight — P1 launch + DB patch  
2. Freeze — tag `v80-code-release-1`  
3. Switch — prod env + deploy + enable `/api/v80/*`  
4. Validate — `npm run v80:smoke-live` + ops probes  
5. Announce — close DEP-GL checklist  

## Kill switches

| Env | Effect |
|-----|--------|
| `V80_ROUTES_DISABLED=1` | Block all v80 routes |
| `V80_WORKFLOW_PAUSED=1` | Stop autopilot enqueue |
| `V80_COMMERCIAL_STRICT=1` | Block mutating routes |
| `V80_WORKER_ENABLED=0` | Disable background worker |

Rollback RTO: 5–60 min per `deploy.rollback.spec.ts`.
