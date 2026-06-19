# SaaS Commercial Adapter

Phase 1 keeps this package **type-only**.

## Rules

- Do **not** import `lib/commercial-products/**` in Phase 1.
- Phase 4 (`Commercial Adapter`) is the only layer allowed to call V47 frozen runtime functions.
- SaaS persistence lives outside V47; V47 remains an in-process engine hydrated per request.

## Future bridge flow (P4)

```txt
SaaS DB (SaasQuoteRecord)
  -> saas-commercial-adapter/hydrator
  -> V47 registerQuoteSnapshot() / createQuote()
  -> result persisted back to SaaS DB
```

## Phase 1 files

- `boundary-types.ts` — bridge contracts only
