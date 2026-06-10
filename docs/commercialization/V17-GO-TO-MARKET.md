# V17 Go-To-Market Platform

**Version:** `v17.0-go-to-market-1`  
**Status:** Go-to-market operations layer (`readiness-stub`)  
**Predecessor:** V16 Customer Success Platform (`v16-customer-success`)  
**Successor:** V17.5 Growth Intelligence Platform

## Goal

建立 Go-To-Market Runtime，具备产品发布管理、市场活动管理、线索获取管理、渠道触达管理、活动转化分析、商业推进分析能力。不接真实广告平台、营销自动化或 CRM。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Product Launch | `runProductLaunchRuntime` | `GET /api/go-to-market/product-launch/run` | `npm run verify:product-launch` |
| Campaign | `runCampaignRuntime` | `GET /api/go-to-market/campaign/run` | `npm run verify:campaign-runtime` |
| Lead Acquisition | `runLeadAcquisitionRuntime` | `GET /api/go-to-market/lead-acquisition/run` | `npm run verify:lead-acquisition` |
| Outreach | `runOutreachRuntime` | `GET /api/go-to-market/outreach/run` | `npm run verify:outreach-runtime` |
| Market Segment | `runMarketSegmentRuntime` | `GET /api/go-to-market/market-segment/run` | `npm run verify:market-segment` |
| GTM Analytics | `runGtmAnalyticsRuntime` | `GET /api/go-to-market/gtm-analytics/run` | `npm run verify:gtm-analytics` |
| GTM Dashboard | `runGtmDashboardRuntime` | `GET /api/go-to-market/dashboard/run` | `npm run verify:gtm-dashboard` |

## Module Layout

```
lib/go-to-market/
  shared/
  product-launch/     # launch version / status / channel / lifecycle
  campaign/           # campaign performance / conversion / trend
  lead-acquisition/   # lead pipeline / quality / conversion trend
  outreach/           # email / demo / follow-up / proposal-sharing
  market-segment/     # enterprise / government / campus / industrial / hotel
  gtm-analytics/      # GTM / pipeline / conversion / launch health
  dashboard/          # readiness / activation / lead / conversion momentum
  evidence.ts
  index.ts
```

## Boundaries

- **不接** 真实广告平台、营销自动化、CRM
- **不修改** Revenue Operations、Customer Success、Commercial Delivery、AI Integration、Proposal Engine
- **只读桥接** `lib/revenue-operations/lead/builders`（线索数据）

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:product-launch
npm run verify:campaign-runtime
npm run verify:lead-acquisition
npm run verify:outreach-runtime
npm run verify:market-segment
npm run verify:gtm-analytics
npm run verify:gtm-dashboard
```

Evidence：`buildGtmEvidence()` — 由 `verify:gtm-dashboard` 覆盖。

## Next: V17.5 Growth Intelligence Platform

- 增长智能分析层
- 与 GTM 深度桥接
