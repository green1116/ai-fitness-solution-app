# V64 P7 — Commercial Verification Layer

Read-only cross-layer verification for [V64 P1–P6](./V64-COMMERCIAL-FOUNDATION.md). No runtime, API, DB, or UI changes.

## Scope

| Capability | Module |
|------------|--------|
| Verification builder | `verify.builder.ts` |
| Version consistency | `verify.versions.ts` |
| Cross-layer invariants | `verify.invariants.ts` |
| Snapshot verification | `verify.snapshots.ts` |
| Unified entry | `verify.entry.ts` |

## Unified entry

```ts
import { runCommercialVerification, assertCommercialVerificationPass } from "@/lib/commercial/v64";

const report = runCommercialVerification({ deploymentId: "prod" });
assertCommercialVerificationPass(); // throws if any P1–P6 layer fails
```

## What is checked

- P1–P6 per-layer `validate*` functions
- All snapshots reference `V64_COMMERCIAL_FOUNDATION_VERSION`
- `PRODUCT_PACKAGING_VERSION` in catalog snapshot
- Tier count (3) consistent across pricing, capability, catalog
- SaasPlan mapping aligned across catalog and capability
- Transition path counts (3 upgrades + 3 downgrades)

## Verify

```bash
npm run verify:v64-p7-commercial-verification
npm run verify:v64-p8-commercial-freeze
npm run verify:v64-commercial   # P1–P8
npm run verify
```

## Backward compatibility

- Does not modify P1–P6 builders or validators
- Runtime authority sources unchanged
