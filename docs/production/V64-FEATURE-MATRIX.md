# V64 P3 — Commercial Feature Matrix Layer

Read-only commercial gating metadata on top of [V64 P1](./V64-COMMERCIAL-FOUNDATION.md) and [V64 P2](./V64-PRICING-LAYER.md). No runtime gate, API, DB, or UI changes.

## Scope

| Capability | Module |
|------------|--------|
| Feature matrix builder | `feature.builder.ts` |
| Plan → feature mapping | `feature.plan-map.ts` |
| Tier → entitlement mapping | `feature.entitlement-map.ts` |
| Capability exposure | `feature.exposure.ts` |
| Matrix snapshot | `feature.snapshot.ts` |
| Validation | `feature.validate.ts` |

## Authority sources (unchanged)

| Layer | Source |
|-------|--------|
| Catalog features | `lib/productization/catalog/features.ts` |
| Billing entitlements | `lib/productization/billing/entitlements.ts` |
| Runtime feature flags | `PLAN_FEATURE_MATRIX` in `feature.service.ts` |
| Usage limits | `PLAN_USAGE_LIMITS` in `feature.service.ts` |

`PLAN_FEATURE_MATRIX` remains the **runtime** authority; V64 P3 only exposes aligned metadata.

## Usage

```ts
import {
  buildCommercialFeatureMatrixSnapshot,
  lookupPlanFeatureMappingBySaasPlan,
  validateCommercialFeatureMatrix,
} from "@/lib/commercial/v64";

const snapshot = buildCommercialFeatureMatrixSnapshot();
const pro = lookupPlanFeatureMappingBySaasPlan("PRO");
// pro.runtimeFeatureFlags → canGenerateQuote, canGenerateBudget, canExportPDF
```

## Verify

```bash
npm run verify:v64-p3-commercial-feature-matrix
npm run verify:v64-commercial   # P1 + P2 + P3
npm run verify
```

## Backward compatibility

- V64 P1 `feature.matrix.ts` unchanged
- V63 growth services untouched
- No changes to feature gate enforcement
