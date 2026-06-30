# V64 P5 — Commercial Product Catalog Layer

Read-only product catalog aggregation on top of [V64 P1–P4](./V64-COMMERCIAL-FOUNDATION.md). No runtime gate, API, DB, or UI changes.

## Scope

| Capability | Module |
|------------|--------|
| Product catalog builder | `catalog.builder.ts` |
| Product / plan lookup | `catalog.lookup.ts` |
| Tier catalog snapshot | `catalog.snapshot.ts` |
| Unified catalog export | `catalog.export.ts` |
| Validation | `catalog.validate.ts` |

## Tier catalog entry

Each `TierCatalogEntry` aggregates:

- Product definition (catalog)
- Plan registry entry
- Normalized price (P2)
- Capability aggregate (P4)
- Packaging profile (V8.1)

## Usage

```ts
import {
  buildUnifiedCatalogExport,
  lookupTierCatalogBySaasPlan,
  validateCommercialCatalog,
} from "@/lib/commercial/v64";

const entry = lookupTierCatalogBySaasPlan("PRO");
const exp = buildUnifiedCatalogExport();
// exp.legacyCatalogResponse — backward-compatible V8.1 API shape
```

## Verify

```bash
npm run verify:v64-p5-commercial-catalog
npm run verify:v64-commercial   # P1–P5
npm run verify
```

## Backward compatibility

- `buildProductCatalogResponse` unchanged as legacy export
- `PRODUCT_PACKAGING_VERSION` remains authoritative for V8.1
- No changes to `/api/productization/catalog` route
