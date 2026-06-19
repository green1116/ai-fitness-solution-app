# V52 Portal UI — P2 Session & Tenant Wiring Freeze

**P2 Tag:** `v52-portal-ui-p2`  
**Status:** `freeze-ready`  
**P1 Dependency:** `v52-portal-ui-p1`  
**API Dependency:** `v51-api-exposure-final`

## Scope (Frozen at P2)

Session and tenant wiring for Enterprise Portal. No Workspace UI. No P3 surfaces.

## Session Flow

```txt
HttpOnly session cookie
  → resolveSessionUserFromCookieOrHeaders
  → V48 resolveTenantContext (membership + role)
  → V51 GET /api/saas-product/me (tenantId + userId)
  → requirePortalSession / PortalShell / Settings
```

## Portal Routes (P1 + P2)

| Path | Purpose |
|------|---------|
| `/saas-product` | Dashboard placeholder (mock KPI) |
| `/saas-product/settings` | Session probe: User / Tenant / Role / Membership / Session Source |

## Guard Rules

| Condition | Action |
|-----------|--------|
| No session cookie / headers | `redirect("/login")` |
| No membership or tenant | `forbidden()` (403) |
| `/me` mismatch with tenant context | 403 |

## Layer Boundaries (Immutable after P2 freeze)

| Rule | Status |
|------|--------|
| V48~V51 | frozen — no modifications |
| Portal API consumption | `/api/saas-product/*` only |
| No prisma in portal layer | enforced |
| No V49 / V50 runtime imports | enforced |
| No UI `tenantId` param | enforced |
| Tenant source | session → resolveTenantContext → `/me` |

## P2 Deliverables

- `lib/saas-product-portal/session/*` — cookie resolver, requirePortalSession, usePortalSession
- `lib/saas-product-portal/validation/validate-session.ts`
- `app/saas-product/layout.tsx` — requirePortalSession + PortalShell
- `app/saas-product/settings/page.tsx`
- `scripts/verify-v52-p2.ts`

## Verify Checks

`SESSION_NO_TENANT_PARAM` · `COOKIE_RESOLUTION` · `ME_ENDPOINT_USAGE` · `NO_DIRECT_TENANT_ACCESS` · `NO_PRISMA` · `NO_V49_V50`

Run: `npm run verify:v52-p2`

## Next Horizon

**V52 P3 Workspace UI — not started.** Do not implement until explicitly requested.

V52 final portal freeze remains **P8** (`v52-portal-ui-final`).
