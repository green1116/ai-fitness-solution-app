# V48 SaaS Subscription — Phase 6

**Tag:** `v48-saas-subscription-p6`

## Goal

Upgrade P1 `SaasPlan` / `SaasSubscription` / `SaasEntitlementGrant` concepts into a runtime layer for feature gates and quota enforcement.

## Principles

- No P1 schema or migration changes
- Plan definitions read from `lib/saas-foundation/subscription/plan-catalog` only
- Quota usage is in-memory for P6 (no DB writes)

## Components

| Layer | Module |
|-------|--------|
| Plan source | `lib/saas-foundation/subscription/plan-catalog` (read-only) |
| Entitlements | `resolveEntitlements()` / `buildEntitlementsFromPlan()` |
| Features | `hasFeature()` / `requireFeature()` |
| Quotas | `resolveQuota()` / `requireQuota()` / `consumeQuota()` |
| Cache | in-memory tenant → entitlements |
| Errors | `FEATURE_NOT_ENABLED`, `QUOTA_EXCEEDED`, `SUBSCRIPTION_NOT_FOUND`, `ENTITLEMENT_NOT_FOUND` |

## Runtime Types

```ts
TenantEntitlements {
  tenantId, planCode, features, quotas, source: "plan" | "grant"
}

QuotaCheckResult {
  allowed, remaining?, reason?
}
```

## Plan Runtime Policy

- Default tenant plan: `trial` (when no in-memory plan binding exists)
- `enterprise` quotas normalized to `-1` (unlimited) at runtime via `applyRuntimeQuotaPolicy`
- Grant overrides merge on top of plan features/quotas (`source: "grant"`)

## Integration

`executeCommercialQuote()` in `lib/saas-commercial-adapter/bridge/commercial-executor.ts`:

```txt
TenantContext
  → RBAC (quote:create, delivery:execute)
  → requireFeature(commercial.quote)
  → requireQuota(commercial.quote)
  → consumeQuota(commercial.quote)
  → Commercial Adapter
  → V47 Engine
```

## Commands

```bash
npm run verify:saas-subscription-p6
```

## Next Phase

- **P7:** Portal Skeleton (Enterprise / Contractor / Supplier / Manufacturer)
