# V15 Revenue Operations Platform

**Version:** `v15.0-revenue-operations-1`  
**Status:** Revenue operations layer (`readiness-stub`)  
**Predecessor:** V14 Commercial Delivery Platform (`v14-commercial-delivery`)  
**Successor:** V16 Customer Success Platform

## Goal

建立 Revenue Operations Runtime，具备客户管理、试用管理、转化分析、续费分析、流失分析、收入分析能力。不接真实 CRM，不接真实支付网关。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Lead | `runLeadRuntime` | `GET /api/revenue-operations/lead/run` | `npm run verify:lead-runtime` |
| Opportunity | `runOpportunityRuntime` | `GET /api/revenue-operations/opportunity/run` | `npm run verify:opportunity-runtime` |
| Customer | `runCustomerRuntime` | `GET /api/revenue-operations/customer/run` | `npm run verify:customer-runtime` |
| Trial | `runTrialOperationsRuntime` | `GET /api/revenue-operations/trial/run` | `npm run verify:trial-operations` |
| Conversion | `runConversionRuntime` | `GET /api/revenue-operations/conversion/run` | `npm run verify:conversion-runtime` |
| Renewal | `runRenewalRuntime` | `GET /api/revenue-operations/renewal/run` | `npm run verify:renewal-runtime` |
| Churn | `runChurnRuntime` | `GET /api/revenue-operations/churn/run` | `npm run verify:churn-runtime` |
| Revenue Analytics | `runRevenueAnalyticsRuntime` | `GET /api/revenue-operations/revenue-analytics/run` | `npm run verify:revenue-analytics` |
| Revenue Dashboard | `runRevenueOpsDashboardRuntime` | `GET /api/revenue-operations/dashboard/run` | `npm run verify:revenue-ops-dashboard` |

> Note: `verify:revenue-dashboard` 保留给 V10 `revenue-foundation`；V15 Dashboard 使用 `verify:revenue-ops-dashboard`。

## Module Layout

```
lib/revenue-operations/
  shared/
  lead/                 # Lead Id / Source / Status / Score
  opportunity/          # Pipeline / Value / Probability
  customer/             # Profile / Tier / Lifecycle
  trial/                # Trial Start/End / Usage / Outcome
  conversion/           # Lead / Trial / Customer conversion rates
  renewal/              # Upcoming / Completed / Renewal rate
  churn/                # Churn rate / Retention / Reasons
  revenue-analytics/    # MRR / ARR / Growth / ARPC
  dashboard/            # Pipeline / Conversion / Renewal / Retention / Revenue health
  evidence.ts
  index.ts
```

## Boundaries

- **不接** 真实 CRM 或支付网关
- **不修改** Proposal/Plan/Budget/ZIP、Commercial Delivery 生产层
- **独立于** `lib/commercial-delivery/`、`lib/revenue-foundation/`

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:lead-runtime
npm run verify:opportunity-runtime
npm run verify:customer-runtime
npm run verify:trial-operations
npm run verify:conversion-runtime
npm run verify:renewal-runtime
npm run verify:churn-runtime
npm run verify:revenue-analytics
npm run verify:revenue-ops-dashboard
```

Evidence：`buildRevenueOperationsEvidence()` — 由 `verify:revenue-ops-dashboard` 覆盖。

## Next: V16 Customer Success Platform

- 客户成功运营层
- 与 Revenue Operations 深度桥接
