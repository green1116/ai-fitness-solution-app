# V64 P2 — Commercial Pricing Layer

Read-only pricing computation and plan display layer on top of [V64 P1](./V64-COMMERCIAL-FOUNDATION.md). No runtime checkout, API, DB, or UI changes.

## Scope

| Capability | Module |
|------------|--------|
| Currency metadata | `pricing.currency.ts` |
| Plan price normalization | `pricing.normalize.ts` |
| Pricing lookup | `pricing.lookup.ts` |
| Pricing snapshot | `pricing.snapshot.ts` |
| Pricing validation | `pricing.validate.ts` |

## Authority sources (unchanged)

| Price type | Source |
|------------|--------|
| Monthly display (CNY) | `lib/growth/conversion/pricing.strategy` → `PRICING_TIERS` |
| One-time unlock (cents) | `lib/commercial/pricing` → `commercialTierAmountCents` |
| Catalog reference label | `lib/productization/catalog` → `getPricingForTier` |

## Usage

```ts
import {
  buildCommercialPricingSnapshot,
  lookupPlanPriceBySaasPlan,
  validateCommercialPricing,
} from "@/lib/commercial/v64";

const snapshot = buildCommercialPricingSnapshot();
const pro = lookupPlanPriceBySaasPlan("PRO");
// pro.displayPriceLabel → "¥499/月"
// pro.referencePriceLabel → "¥99"
```

## Verify

```bash
npm run verify:v64-p2-commercial-pricing
npm run verify:v64-commercial
```

## Backward compatibility

- V64 P1 `pricing.config.ts` unchanged
- `PLAN_FEATURE_MATRIX` and feature gates untouched
- V63 growth services unchanged
