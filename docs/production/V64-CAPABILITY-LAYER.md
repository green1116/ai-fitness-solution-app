# V64 P4 — Commercial Capability Layer

Read-only capability aggregation on top of [V64 P1](./V64-COMMERCIAL-FOUNDATION.md), [P2](./V64-PRICING-LAYER.md), and [P3](./V64-FEATURE-MATRIX.md). No runtime gate, API, DB, or UI changes.

## Scope

| Capability | Module |
|------------|--------|
| Capability builder | `capability.builder.ts` |
| Tier aggregation | `capability.aggregate.ts` |
| Unified lookup | `capability.lookup.ts` |
| Capability snapshot | `capability.snapshot.ts` |
| Validation | `capability.validate.ts` |

## Authority sources (unchanged)

| Layer | Source |
|-------|--------|
| Tier mapping | `capability.map.ts` (P1) |
| Feature exposure | `feature.exposure.ts` (P3) |
| Runtime flags | `PLAN_FEATURE_MATRIX` |
| Usage limits | `PLAN_USAGE_LIMITS` |

## Usage

```ts
import {
  buildCommercialCapabilitySnapshot,
  lookupCommercialCapabilityBySaasPlan,
  validateCommercialCapability,
} from "@/lib/commercial/v64";

const enterprise = lookupCommercialCapabilityBySaasPlan("ENTERPRISE");
// enterprise.featureFlags, usageLimits, enabledCapabilities
```

## Verify

```bash
npm run verify:v64-p4-commercial-capability
npm run verify:v64-commercial   # P1–P4
npm run verify
```

## Backward compatibility

- P1 `capability.map.ts` unchanged
- V63 growth services untouched
- No changes to feature gate enforcement
