# V27 Supplier Portal Foundation — Phase 1 Report

**Version:** `v27-supplier-portal-1`  
**Tag:** `v27-supplier-portal`  
**Status:** Phase 1 Complete  
**Predecessor:** V26 Brand Portal Foundation (`v26-brand-portal-4`)  
**Route:** Industry Tender Platform — Supplier Portal Track  
**Generated:** 2026-06-13

## Executive Summary

V27 Phase 1 在 V20–V26 冻结层之上，正式建立 **Supplier Portal 数据层**（`lib/supplier-portal/`）。提供供应商、库存、定价、服务与覆盖档案，兼容 V21 Supplier Network、V22 Procurement Intelligence 与 `data/suppliers/` 资产。**未修改** V20–V26，**未新增** Runtime/Dashboard/登录系统。

---

## Created Files

| Path | Purpose |
|------|---------|
| `lib/supplier-portal/shared/types.ts` | 五类 Profile 类型、Validation/Report 类型、版本常量 |
| `lib/supplier-portal/supplier-profile/data.ts` | 10 条供应商档案（对齐 `data/suppliers/`） |
| `lib/supplier-portal/supplier-profile/index.ts` | Supplier profile barrel export |
| `lib/supplier-portal/inventory-profile/data.ts` | 16 条库存档案（含 V21 inventory 与 V22 SKU 扩展） |
| `lib/supplier-portal/inventory-profile/index.ts` | Inventory profile barrel export |
| `lib/supplier-portal/pricing-profile/data.ts` | 10 条定价档案（覆盖 V22 channel pricing SKU） |
| `lib/supplier-portal/pricing-profile/index.ts` | Pricing profile barrel export |
| `lib/supplier-portal/service-profile/data.ts` | 10 条服务档案（10 城市响应/驻场能力） |
| `lib/supplier-portal/service-profile/index.ts` | Service profile barrel export |
| `lib/supplier-portal/coverage-profile/data.ts` | 10 条覆盖档案（tier-1/2/3 交付与 SLA） |
| `lib/supplier-portal/coverage-profile/index.ts` | Coverage profile barrel export |
| `lib/supplier-portal/validation/validators.ts` | `validateSupplierPortal()` |
| `lib/supplier-portal/validation/index.ts` | Validation barrel export |
| `lib/supplier-portal/report/builders.ts` | `buildSupplierPortalReport()` |
| `lib/supplier-portal/report/index.ts` | Report barrel export |
| `lib/supplier-portal/index.ts` | 统一公共 API |

---

## Data Models

### `SupplierProfile`

| Field | Type | Description |
|-------|------|-------------|
| `supplierId` | string | 唯一供应商 ID（对齐 V21 / data/suppliers） |
| `supplierName` | string | 供应商名称 |
| `city` | string | 总部/主运营城市 |
| `region` | string | 区域（East China / South China 等） |
| `contact` | string | 联系邮箱 |
| `serviceLevel` | `premium` · `standard` · `basic` | 服务等级（复用 V21 ServiceLevel） |
| `status` | `active` · `inactive` · `draft` | 门户状态 |
| `mode` | `"supplier-portal"` | 数据层标识 |

### `InventoryProfile`

| Field | Type | Description |
|-------|------|-------------|
| `inventoryId` | string | 唯一库存记录 ID |
| `sku` | string | 产品 SKU |
| `warehouse` | string | 仓库名称 |
| `quantity` | number | 当前库存数量 |
| `safetyStock` | number | 安全库存 |
| `status` | `active` · `inactive` · `draft` | 库存状态 |
| `mode` | `"supplier-portal"` | 数据层标识 |

### `PricingProfile`

| Field | Type | Description |
|-------|------|-------------|
| `pricingId` | string | 唯一定价 ID |
| `sku` | string | 产品 SKU |
| `listPrice` | number | 标价 |
| `dealerPrice` | number | 经销商价 |
| `projectPrice` | number | 项目价 |
| `bulkPrice` | number | 批量价 |
| `currency` | `"CNY"` | 币种 |
| `status` | `active` · `inactive` · `draft` | 定价状态 |
| `mode` | `"supplier-portal"` | 数据层标识 |

### `ServiceProfile`

| Field | Type | Description |
|-------|------|-------------|
| `serviceId` | string | 唯一服务 ID |
| `city` | string | 服务城市 |
| `responseTime` | string | 响应时间（如 `4h`） |
| `onsiteTime` | string | 驻场时间（如 `24h`） |
| `engineerCount` | number | 工程师数量 |
| `sparePartsAvailable` | boolean | 是否有备件 |
| `status` | `active` · `inactive` · `draft` | 服务状态 |
| `mode` | `"supplier-portal"` | 数据层标识 |

### `CoverageProfile`

| Field | Type | Description |
|-------|------|-------------|
| `coverageId` | string | 唯一覆盖 ID |
| `city` | string | 覆盖城市 |
| `coverageLevel` | `tier-1` · `tier-2` · `tier-3` | 覆盖等级 |
| `leadTime` | string | 交付周期 |
| `sla` | string | 服务 SLA |
| `status` | `active` · `inactive` · `draft` | 覆盖状态 |
| `mode` | `"supplier-portal"` | 数据层标识 |

---

## Compatibility

| Layer | Check | Result |
|-------|-------|--------|
| V21 Supplier Network | V21 冻结 catalog 4 条 supplier ID 均为 portal 子集 | ✅ |
| V22 Procurement Intelligence | V22 channel pricing 全部 SKU 在 portal pricing 中存在 | ✅ |
| `data/suppliers/` | 10 条 data asset supplier ID 均在 portal 中存在 | ✅ |

**Canonical Query:** `supplier-life-fitness-cn`

---

## Validation Results

`validateSupplierPortal()` 执行结果：

| Check | Result |
|-------|--------|
| `supplierExists` | ✅ true（10 条，含 canonical + data/suppliers 对齐） |
| `inventoryExists` | ✅ true（16 条，quantity ≥ 0） |
| `pricingExists` | ✅ true（10 条，bulk ≤ project ≤ dealer ≤ list） |
| `serviceExists` | ✅ true（10 条，engineerCount > 0） |
| `coverageExists` | ✅ true（10 条，leadTime + sla 非空） |
| `v21NetworkCompatible` | ✅ true |
| `v22ProcurementCompatible` | ✅ true |
| **`valid`** | **✅ true** |

---

## Report Results

`buildSupplierPortalReport()` 输出：

| Metric | Value |
|--------|-------|
| `supplierCount` | 10 |
| `inventoryCount` | 16 |
| `pricingCount` | 10 |
| `serviceCount` | 10 |
| `coverageCount` | 10 |
| `validation.valid` | true |
| `version` | `v27-supplier-portal-1` |

**Summary:**  
`supplier-portal-report suppliers=10 inventory=16 pricing=10 services=10 coverage=10 valid=true v21Compatible=true v22Compatible=true canonical=supplier-life-fitness-cn`

---

## Build Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ PASS |
| `npm run build` | ✅ PASS |

---

## Phase 2 Preview — Supplier Self-Service Onboarding

Phase 2 将在 Phase 1 数据层之上，参照 V26 Brand Portal `onboarding/` 模式，实现 **Supplier Self-Service Onboarding**，使供应商自行维护库存、价格、交付与服务能力。

### 目标能力

供应商可提交并维护：

- **Inventory** — 各仓库 SKU 数量、安全库存
- **Pricing** — list / dealer / project / bulk 价格
- **Coverage** — 城市覆盖、交付周期、SLA
- **Service** — 响应时间、工程师配置、备件可用性

### 建议目录结构

```
lib/supplier-portal/onboarding/
  intake/          # 供应商提交表单 schema（inventory / pricing / coverage / service）
  workflow/        # 状态机：draft → submitted → review → approved → published
  approval/        # 审核规则与角色（无需登录系统，沿用 data-layer 模拟）
  validation/      # 提交校验（supplier 归属、SKU 存在、价格单调性）
  report/          # onboarding 统计与 SLA 报告
  submissions/     # 示例提交与完整 workflow 验证
```

### 状态机（对齐 V26）

```
draft → submitted → review → approved → published
                  ↘ rejected → draft
```

### 与现有层集成

| 层 | Phase 2 集成点 |
|----|----------------|
| V21 | 已发布 supplier/inventory/service/coverage 同步为 network 可读视图 |
| V22 | 已发布 pricing 作为 procurement channel 输入候选 |
| Phase 1 profiles | `published` 状态覆盖静态 `data.ts` 默认值 |
| Validation | 扩展 `validateSupplierPortal()` 含 onboarding pipeline 检查 |
| Report | 扩展 report 含 submission count、approval rate、pending review |

### 验证场景（Phase 2 完成标准）

- `supplier-life-fitness-cn` 完整 workflow：提交库存/定价/覆盖/服务 → 审核通过 → published
- `supplier-technogym-cn` / `supplier-shuhua` 至少各 1 条 rejected → draft 重提路径
- Phase 1 validation + Phase 2 onboarding validation 联合 `valid: true`
- `npx tsc --noEmit` + `npm run build` PASS

### 约束（延续 Phase 1）

- 不修改 V20–V26 冻结层
- 不新增 Runtime / Dashboard / 登录系统
- 仅扩展 `lib/supplier-portal/` 数据与 onboarding 层

---

## Public API

```typescript
import {
  validateSupplierPortal,
  buildSupplierPortalReport,
  getAllSupplierProfiles,
  getAllInventoryProfiles,
  getAllPricingProfiles,
  getAllServiceProfiles,
  getAllCoverageProfiles,
  CANONICAL_SUPPLIER_PORTAL_QUERY,
  SUPPLIER_PORTAL_VERSION,
} from "@/lib/supplier-portal";
```

---

**Next Step:** V27 Phase 2 — Supplier Self-Service Onboarding
