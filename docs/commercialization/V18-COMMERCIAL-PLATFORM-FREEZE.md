# V18 Commercial Platform Freeze

**Version:** `v18.0-commercial-platform-freeze-1`  
**Status:** Commercial platform freeze baseline (`readiness-stub`)  
**Tag:** `v18-commercial-platform-freeze`  
**Predecessor:** V17 Go-To-Market Platform (`v17-go-to-market`)

## Goal

建立商业化冻结基线。不新增业务能力，不新增生产 Runtime。审计 V10–V17 全部商业化层并输出统一清单与 Dashboard。

## Audited Layers

| Layer | Modules | Domains |
|-------|---------|---------|
| Revenue | `revenue-foundation`, `payment-readiness`, `revenue-operations` | 22 |
| Enterprise | `enterprise-saas` | 8 |
| Proposal | `proposal-generation`, `proposal-pdf` | 13 |
| AI | `ai-readiness`, `ai-integration`, `autopilot` | 24 |
| Knowledge | `tender-intelligence`, `knowledge-base` | 17 |
| Delivery | `commercial-delivery` | 7 |
| Customer Success | `customer-success` | 7 |
| Go-To-Market | `go-to-market` | 7 |

**Total:** 8 layers · 14 modules · 104 domains

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Commercial Platform Report | `buildCommercialPlatformReport` | `GET /api/commercial-platform-freeze/report/run` | `npm run verify:commercial-platform` |
| Commercial Platform Dashboard | `runCommercialPlatformDashboardRuntime` | `GET /api/commercial-platform-freeze/dashboard/run` | `npm run verify:commercial-platform` |

## Module Layout

```
lib/commercial-platform-freeze/
  shared/              # version contract + runtime harness
  registry/            # layer/module registry + 6 inventories
  report/              # buildCommercialPlatformReport()
  dashboard/           # completeness / stability / readiness metrics
  evidence.ts          # buildCommercialPlatformEvidence()
  index.ts
```

## Inventories

`buildCommercialPlatformReport()` 输出六类清单：

1. **capability inventory** — 104 项业务能力（按 layer/module/domain）
2. **dependency inventory** — 跨模块只读桥接依赖
3. **runtime inventory** — 全部冻结 Runtime 函数
4. **api inventory** — 全部 `GET /api/*/run` 端点
5. **verify inventory** — 全部 `npm run verify:*` 脚本
6. **documentation inventory** — V10–V18 商业化文档

## Dashboard Metrics

`runCommercialPlatformDashboardRuntime()` 输出：

- **platformCompleteness** — 各层 domain 覆盖率
- **platformStability** — 各模块 evidence 全 success 比例
- **platformReadiness** — completeness + stability 综合
- **commercializationReadiness** — 三层指标均值

## Boundaries

- **不新增** 业务能力或生产 Runtime
- **不修改** V10–V17 已冻结模块行为
- **只读聚合** 现有 evidence、registry、文档与 verify 矩阵

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:commercial-platform
```

Evidence：`buildCommercialPlatformEvidence()` — 由 `verify:commercial-platform` 覆盖。

## Baseline Report

详见 [V18 Commercial Platform Baseline Report](./V18-COMMERCIAL-PLATFORM-BASELINE-REPORT.md)。
