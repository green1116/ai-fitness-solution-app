# SaaS Commercial Adapter

Phase 4 connects SaaS Runtime to the frozen V47 Commercial Engine.

## Rules

- **Do not modify** `lib/commercial-products/**`
- Only **read-only calls** into V47 quote runtime + snapshot registry
- SaaS quote state lives in `lib/saas-commercial-adapter/quote/` (in-memory in P4)

## Bridge flow

```txt
TenantContext
  -> mapTenantToV47Context
SaasQuote (adapter repository)
  -> hydrateQuote
  -> registerQuoteSnapshot() [V47]
  -> executeCommercialQuote
  -> createQuote() [V47]
```

## Phase 4 exports

- `hydrateQuote`
- `executeCommercialQuote`
- `mapTenantToV47Context`

