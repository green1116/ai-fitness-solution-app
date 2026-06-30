# V64 P1 — Commercial Productization Foundation

Post V63 production freeze. Read-only commercial foundation layer; no runtime gate or API behavior changes.

## Scope

| Artifact | Module | Source |
|----------|--------|--------|
| Product config | `lib/commercial/v64/product.config.ts` | `lib/productization/catalog` |
| Pricing config | `lib/commercial/v64/pricing.config.ts` | Catalog + display reference (`pricing.strategy`) |
| Feature matrix | `lib/commercial/v64/feature.matrix.ts` | Catalog `buildFeatureMatrix` |
| Plan registry | `lib/commercial/v64/plan.registry.ts` | Catalog plans + billing subscription plans |
| Capability mapping | `lib/commercial/v64/capability.map.ts` | ProductTier ↔ SaasPlan ↔ UserTier ↔ FeatureKey |
| Commercial metadata | `lib/commercial/v64/commercial.metadata.ts` | Foundation readiness + V8.1 compat |

## Entry point

```ts
import { buildCommercialFoundation } from "@/lib/commercial/v64";

const foundation = buildCommercialFoundation({ deploymentId: "my-deploy" });
```

## Backward compatibility

- Does not modify `PLAN_FEATURE_MATRIX` or feature gates
- Does not change existing catalog API (`/api/productization/catalog`)
- `PRODUCT_PACKAGING_VERSION` remains authoritative for V8.1 packaging

## Verify

```bash
npm run verify:v64-p1-commercial-foundation
npm run verify:v64-commercial   # P1 + P2
```

## Tier mapping

| ProductTier | SaasPlan | UserTier |
|-------------|----------|----------|
| starter | BASIC | free |
| professional | PRO | pro |
| enterprise | ENTERPRISE | enterprise |
