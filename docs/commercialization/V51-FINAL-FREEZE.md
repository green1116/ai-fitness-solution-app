# V51 API Exposure Layer — Final Freeze

**P8 Tag:** `v51-api-exposure-p8`  
**Final Tag:** `v51-api-exposure-final`  
**Dependency:** `v50-production-persistence-final`

## Architecture Goal

Expose V50 `PersistenceRuntime` as a tenant-isolated REST API layer for V52 Portal UI consumption.

```txt
Route (thin) → withApiContext → Handler → Adapter/Runtime → V50 Persistence
```

## Phase Stack (Frozen)

| Phase | Name | Tag |
|-------|------|-----|
| P1 | API Shell Foundation | `v51-api-exposure-p1` |
| P2 | Tenant & Adapter Wiring | `v51-api-exposure-p2` |
| P3 | Workspace API | `v51-api-exposure-p3` |
| P4 | Quote API | `v51-api-exposure-p4` |
| P5 | Workflow API | `v51-api-exposure-p5` |
| P6 | Audit Read API | `v51-api-exposure-p6` |
| P7 | Audit Sweep | `v51-api-exposure-p7` |
| P8 | API Exposure Final Freeze | `v51-api-exposure-final` |

## Route Map

| Path | Methods | Phase | Tenant |
|------|---------|-------|--------|
| `/api/saas-product/health` | GET | P1 | optional |
| `/api/saas-product/me` | GET | P2 | required |
| `/api/saas-product/workspaces` | GET, POST | P3 | required |
| `/api/saas-product/workspaces/:workspaceId` | GET, PATCH | P3 | required |
| `/api/saas-product/workspaces/:workspaceId/quotes` | GET, POST | P4 | required |
| `/api/saas-product/quotes/:quoteId` | GET, PATCH | P4 | required |
| `/api/saas-product/quotes/:quoteId/workflow` | GET | P5 | required |
| `/api/saas-product/workflows?workspaceId=` | GET | P5 | required |
| `/api/saas-product/workflows/:workflowId/transition` | POST | P5 | required |
| `/api/saas-product/workflows/:workflowId/history` | GET | P6 | required |
| `/api/saas-product/workflows/:workflowId/events` | GET | P6 | required |

**Stats:** 11 routes · 15 endpoints · 14 tenant-protected endpoints

## Tenant Boundary

- Tenant source: V48 `resolveTenantContext` via `resolveApiTenant`
- `body.query.path tenantId` is **untrusted** and ignored
- All protected routes use `requireTenant: true`
- Cross-tenant access returns **404** (not 403)

## Runtime Mapping

| API Domain | V50 Call Path |
|------------|---------------|
| Workspace CRUD | `ctx.runtime.workspace.*` |
| Quote CRUD | `getQuotePersistenceAccess` → `persistenceRepositories.quote` |
| Workflow create/list/transition | `ctx.runtime.quoteWorkflow.*` |
| Workflow by quote | `getWorkflowPersistenceAccess` → `workflow.findByQuoteId` |
| History / Events read | `getAuditPersistenceAccess` → `workflowHistory` / `workflowEvent` |

## Audit Report (P7)

```json
{
  "routeCount": 11,
  "endpointCount": 15,
  "tenantProtectedCount": 14,
  "auditStatus": "pass",
  "findings": []
}
```

**Checks:** ROUTE_BOUNDARY_PASS · THIN_ROUTE_PASS · TENANT_ENFORCEMENT_PASS · READ_ONLY_PASS · ENDPOINT_COVERAGE_PASS · TENANT_ISOLATION_PASS · REGRESSION_PASS

## Layer Boundaries (Immutable after P8)

| Layer | Status |
|-------|--------|
| V38~V48 | frozen — read-only tenant context |
| V49 | frozen — no imports in routes/handlers |
| V50 | frozen — adapter/runtime only |
| V51 API | frozen — P1~P7 implementation + P8 meta lock |
| V52+ | Portal UI |

## Freeze Conclusion

V51 API Exposure Layer transitions from **development state** to **frozen operating state**.

- No new business APIs after P8
- No modifications to V50 / V49 frozen layers
- All P1~P7 verify scripts must remain PASS for regression

## Commands

```bash
npm run verify:v51-p1
npm run verify:v51-p2
npm run verify:v51-p3
npm run verify:v51-p4
npm run verify:v51-p5
npm run verify:v51-p6
npm run verify:v51-p7
npm run verify:v51-p8
npx tsc --noEmit
npm run build
git tag v51-api-exposure-final
```

## V52 Portal UI — Interface Checklist

Portal UI should consume these frozen endpoints (all tenant-authenticated except health):

1. `GET /api/saas-product/me` — session/tenant probe
2. `GET /api/saas-product/workspaces` — list workspaces
3. `POST /api/saas-product/workspaces` — create workspace
4. `GET /api/saas-product/workspaces/:id` — workspace detail
5. `PATCH /api/saas-product/workspaces/:id` — archive/update status
6. `GET /api/saas-product/workspaces/:id/quotes` — list quotes
7. `POST /api/saas-product/workspaces/:id/quotes` — create quote + workflow
8. `GET /api/saas-product/quotes/:id` — quote detail
9. `PATCH /api/saas-product/quotes/:id` — update quote status
10. `GET /api/saas-product/quotes/:id/workflow` — quote workflow
11. `GET /api/saas-product/workflows?workspaceId=` — list workflows
12. `POST /api/saas-product/workflows/:id/transition` — approve/reject
13. `GET /api/saas-product/workflows/:id/history` — audit history
14. `GET /api/saas-product/workflows/:id/events` — audit events
15. `GET /api/saas-product/health` — ops health (no tenant)

## Next Horizon

**V52 — Portal UI**
