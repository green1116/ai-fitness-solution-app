# V64 P8 — Commercial Freeze

Final freeze for the V64 commercial productization layer (P1–P7). Read-only; no runtime, API, DB, or UI changes.

## Layer map

| Phase | Layer | Doc |
|-------|-------|-----|
| P1 | Foundation | [V64-COMMERCIAL-FOUNDATION.md](./V64-COMMERCIAL-FOUNDATION.md) |
| P2 | Pricing | [V64-PRICING-LAYER.md](./V64-PRICING-LAYER.md) |
| P3 | Feature matrix | [V64-FEATURE-MATRIX.md](./V64-FEATURE-MATRIX.md) |
| P4 | Capability | [V64-CAPABILITY-LAYER.md](./V64-CAPABILITY-LAYER.md) |
| P5 | Catalog | [V64-CATALOG-LAYER.md](./V64-CATALOG-LAYER.md) |
| P6 | Transition | [V64-TRANSITION-LAYER.md](./V64-TRANSITION-LAYER.md) |
| P7 | Verification | [V64-VERIFY-LAYER.md](./V64-VERIFY-LAYER.md) |
| P8 | Freeze | this document |

## Locked versions

| Key | Constant |
|-----|----------|
| Foundation | `v64-commercial-foundation-1` |
| Pricing | `v64-pricing-layer-1` |
| Feature matrix | `v64-feature-matrix-layer-1` |
| Capability | `v64-capability-layer-1` |
| Catalog | `v64-catalog-layer-1` |
| Transition | `v64-transition-layer-1` |
| Verification | `v64-verify-layer-1` |
| Freeze | `v64-commercial-freeze-1` |
| Packaging (V8.1) | `PRODUCT_PACKAGING_VERSION` |

## Unified entry

```ts
import {
  runCommercialFreeze,
  assertCommercialFreezePass,
  V64_COMMERCIAL_LAYER_VERSION_LOCK,
} from "@/lib/commercial/v64";

const manifest = runCommercialFreeze({ deploymentId: "prod" });
assertCommercialFreezePass(); // throws if P1–P7 verification or version lock fails
```

## What freeze asserts

- P7 `verificationOk` across P1–P6
- `V64_COMMERCIAL_LAYER_VERSION_LOCK` matches `EXPECTED_LAYER_VERSIONS`
- V63 backward compatibility (`backwardCompatible` from P7)
- No mutation of runtime authority sources

## Verify

```bash
npm run verify:v64-p8-commercial-freeze
npm run verify:v64-commercial   # P1–P8
npm run verify
```

## Boundaries

- Does not modify `PLAN_FEATURE_MATRIX` / `PLAN_USAGE_LIMITS`
- Does not change API contracts or DB schema
- P1–P7 builders and snapshots remain authoritative outputs
