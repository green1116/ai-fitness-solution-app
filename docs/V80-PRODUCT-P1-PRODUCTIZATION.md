# V80 PRODUCT P1 — Productization Mapping

User-facing SaaS product layer on frozen V80 CODE + APP. **Spec only — no runtime changes.**

## Verify

```bash
npx tsx scripts/verify-v80-product-p1-productization.ts
npx tsc --noEmit
```

## Layer

| Spec | Path |
|------|------|
| Packaging | `lib/product/v80/product.packaging.spec.ts` |
| Journeys | `lib/product/v80/product.journey.spec.ts` |
| Pricing | `lib/product/v80/product.pricing.spec.ts` |
| Onboarding | `lib/product/v80/product.onboarding.spec.ts` |

Builder consumes read-only `buildCodeRelease()` + APP P1 maps.
