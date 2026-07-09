# V68 P1 — Service Catalog

Declarative service catalog foundation for platform governance. **Read-only layer** — no runtime service registry, no UI, no V48–V67 mutations.

## Scope (P1 only)

| Artifact | Purpose |
|----------|---------|
| Service definitions | 8 services (`SVC-DEF-*`) with tier, lifecycle, monitoring ref |
| Service metadata | 8 metadata entries (`SVC-META-*`) — tags, repo, docs, deps |
| Service status | 8 status entries (`SVC-STS-*`) — operational/degraded/maintenance/unknown |
| Service owners | 8 owner entries (`SVC-OWN-*`) — role, team, on-call ref |
| Catalog report | Integrates V67 monitoring sign-off readiness |

## Upstream (read-only)

- **V67 P6**: `SERVICE_HEALTH_CATALOG` (`SH-*` refs)
- **V67 P1**: `ONCALL_ROTATION_CATALOG` (`OC-*` refs)
- **V67 P8**: monitoring sign-off / freeze versions
- **Frozen**: V48–V67 untouched

## Module layout

```
lib/platform/v68/service-catalog/
  catalog.types.ts
  catalog.constants.ts
  catalog.surface.ts
  service.definition.catalog.ts
  service.metadata.catalog.ts
  service.status.catalog.ts
  service.owner.catalog.ts
  alignment.catalog.ts
  catalog.builder.ts
  catalog.entry.ts
  catalog.ts
```

## Service tiers

`critical` | `standard` | `internal` | `best-effort`

## Unified entry

```ts
import { runServiceCatalog, formatServiceCatalogSummary } from "@/lib/platform/v68";

const report = runServiceCatalog({ deploymentId: "prod" });
console.log(formatServiceCatalogSummary(report));
```

## Verify

```bash
npm run verify:v68-p1-service-catalog
npm run verify:v68-platform          # P1 only (current)
```

## Freeze point (P1)

After P1 PASS:

- `lib/platform/v68/service-catalog/` — P1 module tree
- `V68_SERVICE_CATALOG_VERSION` = `v68-service-catalog-1`
- `npm run verify:v68-p1-service-catalog`
- `docs/platform/V68-SERVICE-CATALOG.md`

## Rollback

Delete `lib/platform/v68/` + verify script + docs; remove `verify:v68-*` from `package.json`. V48–V67 unaffected.

## Boundaries

- `declarativeState` is not evaluated at runtime
- Does not register services in a live catalog or service mesh
- Does not modify V67 monitoring modules
