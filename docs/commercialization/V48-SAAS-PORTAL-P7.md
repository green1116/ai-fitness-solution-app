# V48 SaaS Portal — Phase 7

**Tag:** `v48-saas-portal-p7`

## Goal

Establish a SaaS Portal Runtime skeleton for four portal types with registry, navigation, guards, and context resolution.

## Principles

- No P1 schema or migration changes
- No V47 or business runtime changes
- Portal layer only (registry, navigation, guard, context)

## Components

| Layer | Module |
|-------|--------|
| Registry | `resolvePortal()` — enterprise / contractor / supplier / manufacturer |
| Navigation | `buildNavigation(ctx)` — menu from `portalType` + `roleSystemCode` |
| Guard | `guardPortalAccess(ctx, portalType)` |
| Context | `resolvePortalContext(ctx)` — `{ portalType, portal, navigation }` |

## Portal Definitions

| Portal | Roles | Navigation |
|--------|-------|------------|
| Enterprise | enterprise_owner, enterprise_admin, enterprise_sales | dashboard, workspace, commercial, delivery, performance, billing |
| Contractor | contractor_owner, contractor_pm, contractor_estimator | dashboard, commercial, delivery, projects |
| Supplier | supplier_admin, supplier_rep | dashboard, catalog, products, orders |
| Manufacturer | manufacturer_admin, manufacturer_sku_manager | dashboard, brands, sku, catalog |

## Guard Pipeline

```txt
resolvePortal(portalType)
  → ctx.portalType match
  → P6 resolveEntitlements (trial → enterprise only)
  → P5 requireRole(portal.roles)
  → buildNavigation(ctx)
```

## Errors

- `PORTAL_NOT_FOUND`
- `PORTAL_ACCESS_DENIED`
- `PORTAL_NAVIGATION_DENIED`

## Commands

```bash
npm run verify:saas-portal-p7
```

## Next Phase

- **P8:** Production SaaS Freeze
