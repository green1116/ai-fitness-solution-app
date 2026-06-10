# V10 Revenue Foundation Layer

**Version:** `v10.0-revenue-foundation-1`  
**Status:** Revenue Loop Description Layer (no payment gateway)  
**Predecessor:** V9.2 Production Ready (`v9.2-production-ready`)  
**Successor:** V10.1 Payment Integration Readiness

## Goal

建立完整收入模型描述层（Revenue Loop），不接真实支付网关，不影响 V9.2 生产系统。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Trial | `runTrialRuntime` | `GET /api/revenue-foundation/trial/run` | `npm run verify:trial` |
| Order | `runOrderRuntime` | `GET /api/revenue-foundation/order/run` | `npm run verify:order` |
| Subscription | `runSubscriptionRuntime` | `GET /api/revenue-foundation/subscription/run` | `npm run verify:subscription` |
| Invoice | `runInvoiceRuntime` | `GET /api/revenue-foundation/invoice/run` | `npm run verify:invoice` |
| Billing | `runBillingRuntime` | `GET /api/revenue-foundation/billing/run` | `npm run verify:billing` |
| Revenue Dashboard | `runRevenueDashboardRuntime` | `GET /api/revenue-foundation/dashboard/run` | `npm run verify:revenue-dashboard` |

## Module Layout

```
lib/revenue-foundation/
  shared/          # runtime harness + version contract
  trial/           # Trial Plan / Limits / Expiration / Conversion
  order/           # Order Model / Status / Lifecycle / Summary
  subscription/    # Monthly / Annual / Enterprise / Renewal
  invoice/         # Invoice Model / Summary / Status
  billing/         # Snapshot / History / Summary
  dashboard/       # MRR / ARR / Active Customers / Trial Conversion / Growth
  evidence.ts      # buildRevenueFoundationEvidence()
  index.ts
```

## Revenue Loop

```
Trial → Order → Subscription → Invoice → Billing → Revenue Dashboard
```

1. **Trial** — 14 天 Pro 预览试用，限额与到期/转化路径
2. **Order** — 订单模型与生命周期（pending → fulfilled → closed）
3. **Subscription** — 月付 / 年付 / 企业订阅 + 续费排期
4. **Invoice** — 发票状态机（draft / issued / paid / overdue）
5. **Billing** — 账单快照 + 历史事件 + 汇总
6. **Revenue Dashboard** — MRR、ARR、活跃客户、试用转化率、收入增长

## Boundaries

- **不接入** Stripe / 微信 / 支付宝等真实支付
- **不修改** `app/api/pay/`、Prisma 支付表、Plan/Budget/ZIP 下载授权
- **独立于** V8.x `lib/productization/`（可并存，V10 为收入闭环专用层）

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:trial
npm run verify:order
npm run verify:subscription
npm run verify:invoice
npm run verify:billing
npm run verify:revenue-dashboard
```

Evidence 聚合：`buildRevenueFoundationEvidence()` — 由 `verify:revenue-dashboard` 覆盖。

## Next: V10.1 Payment Integration Readiness

- 将 Order/Subscription/Invoice 描述层与 `app/api/pay/` 桥接
- 支付网关适配器占位
- Webhook 状态同步契约
