# V19 Bidder Intelligence Foundation

**Version:** `v19.0-bidder-intelligence-1`  
**Status:** Bidder intelligence layer (`readiness-stub`)  
**Predecessor:** V18 Commercial Platform Freeze (`v18-commercial-platform-freeze`)  
**Successor:** V19.5 Bid Strategy Engine

## Goal

建立投标方智能层（Bidder Intelligence），将系统从 `Tender → Proposal` 升级为：

```
Tender + Bidder Profile + Brand Library + Equipment Catalog + Knowledge Base + AI → Proposal
```

不接真实 CRM、供应商 ERP 或品牌授权系统。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Bidder Profile | `runBidderProfileRuntime` | `GET /api/bidder-intelligence/bidder-profile/run` | `npm run verify:bidder-profile` |
| Brand Library | `runBrandLibraryRuntime` | `GET /api/bidder-intelligence/brand-library/run` | `npm run verify:brand-library` |
| Equipment Catalog | `runEquipmentCatalogRuntime` | `GET /api/bidder-intelligence/equipment-catalog/run` | `npm run verify:equipment-catalog` |
| Supplier Capability | `runSupplierCapabilityRuntime` | `GET /api/bidder-intelligence/supplier-capability/run` | `npm run verify:supplier-capability` |
| Proposal Personalization | `runProposalPersonalizationRuntime` | `GET /api/bidder-intelligence/proposal-personalization/run` | `npm run verify:proposal-personalization` |
| Bidder Dashboard | `runBidderDashboardRuntime` | `GET /api/bidder-intelligence/dashboard/run` | `npm run verify:bidder-dashboard` |

## Module Layout

```
lib/bidder-intelligence/
  shared/
  bidder-profile/           # company profile / positioning / scale / certs / delivery
  brand-library/            # brand profile / price tier / strengths / weaknesses / segment
  equipment-catalog/        # category / model / brand mapping / price / maintenance
  supplier-capability/      # service / delivery / installation / support coverage
  proposal-personalization/ # differentiation / brand / value proposition strategy
  dashboard/                # bidder / brand / catalog / differentiation readiness
  evidence.ts
  index.ts
```

## Domain Capabilities

### Bidder Profile

- Company Profile
- Company Positioning
- Company Scale
- Certifications
- Delivery Capability

### Brand Library

- Brand Profile
- Price Tier
- Strengths / Weaknesses
- Target Segment

### Equipment Catalog

- Equipment Category
- Equipment Model
- Brand Mapping
- Price Range
- Maintenance Profile

### Supplier Capability

- Service Coverage
- Delivery Coverage
- Installation Capability
- Support Capability

### Proposal Personalization

根据 Tender + Bidder Profile + Brand Library 生成：

- Differentiation Strategy
- Brand Strategy
- Value Proposition

### Bidder Intelligence Dashboard

- bidder readiness
- brand readiness
- catalog readiness
- proposal differentiation readiness

## Boundaries

- **不修改** Proposal Engine、Proposal PDF、Knowledge Base、AI Integration、Commercial Delivery
- **只读桥接** bidder-profile / brand-library builders（proposal-personalization 内部引用）
- **不接** 真实 CRM、供应商 ERP、品牌授权系统

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:bidder-profile
npm run verify:brand-library
npm run verify:equipment-catalog
npm run verify:supplier-capability
npm run verify:proposal-personalization
npm run verify:bidder-dashboard
```

Evidence：`buildBidderIntelligenceEvidence()` — 由 `verify:bidder-dashboard` 覆盖。

## Next: V19.5 Bid Strategy Engine

- 投标策略引擎
- 与 Tender Intelligence 深度桥接
