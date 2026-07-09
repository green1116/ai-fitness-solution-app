# V80 CODE P2 — Minimal Runtime Core

Runnable MVP on `/api/v80/*`. In-memory store — no DB migration.

## Verify

```bash
npx tsx scripts/verify-v80-code-p2-runtime.ts
npx tsx scripts/verify-v80-code-p1-scaffold.ts
npx tsc --noEmit
```

## E2E (curl)

```bash
# 1. Provision tenant
curl -X POST http://localhost:3000/api/v80/tenant/run -H "Content-Type: application/json" -d "{\"organizationName\":\"Demo Gym\",\"plan\":\"PRO\",\"adminEmail\":\"a@demo.com\"}"

# 2. Workflow (use workspaceId from step 1)
curl -X POST http://localhost:3000/api/v80/autopilot/job/run -H "Content-Type: application/json" -d "{\"projectId\":\"WORKSPACE_ID\",\"workflowKey\":\"tender-pack-complete\"}"
```
