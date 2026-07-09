# V80 PRODUCT P2 — Growth & Sales System

Growth + sales spec on P1 productization. **No runtime changes.**

## Verify

```bash
npx tsx scripts/verify-v80-product-p2-growth.ts
npx tsx scripts/verify-v80-product-p1-productization.ts
npx tsc --noEmit
```

## Specs

| Area | File |
|------|------|
| Sales funnel | `growth.funnel.spec.ts` |
| Conversion triggers | `growth.conversion.spec.ts` |
| Enterprise GTM | `growth.gtm.spec.ts` |
| Expansion engine | `growth.expansion.spec.ts` |

Builder consumes read-only `buildProductization()`.
