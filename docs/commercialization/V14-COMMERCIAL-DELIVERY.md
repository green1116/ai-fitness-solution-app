# V14 Commercial Delivery Platform

**Version:** `v14.0-commercial-delivery-1`  
**Status:** Customer delivery platform (`readiness-stub`)  
**Predecessor:** V13.5 AI Proposal Autopilot (`v13.5-autopilot`)  
**Successor:** V15 Revenue Operations Platform

## Goal

建立客户交付平台，让系统从 AI Proposal Generator 升级为 Commercial Delivery Platform。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Delivery Workspace | `runDeliveryWorkspaceRuntime` | `GET /api/commercial-delivery/workspace/run` | `npm run verify:delivery-workspace` |
| Customer Portal | `runCustomerPortalRuntime` | `GET /api/commercial-delivery/customer-portal/run` | `npm run verify:customer-portal` |
| Delivery Ledger | `runDeliveryLedgerRuntime` | `GET /api/commercial-delivery/ledger/run` | `npm run verify:delivery-ledger` |
| Version | `runVersionRuntime` | `GET /api/commercial-delivery/version/run` | `npm run verify:version-runtime` |
| Approval | `runApprovalRuntime` | `GET /api/commercial-delivery/approval/run` | `npm run verify:approval-runtime` |
| Download | `runDownloadRuntime` | `GET /api/commercial-delivery/download/run` | `npm run verify:download-runtime` |
| Commercial Dashboard | `runCommercialDashboardRuntime` | `GET /api/commercial-delivery/dashboard/run` | `npm run verify:commercial-dashboard` |

## Module Layout

```
lib/commercial-delivery/
  shared/              # runtime harness
  workspace/           # Project / Job / Deliverable / Delivery Status
  customer-portal/     # Customer / Project / Delivery / Download views
  ledger/              # created / approved / delivered / downloaded
  version/             # version history / current / previous
  approval/            # draft / review / approved / delivered
  download/            # downloads / latest / delivery package
  dashboard/           # active / completed / deliveries / downloads / approvals
  evidence.ts
  index.ts
```

## Boundaries

- **不修改** Autopilot、Proposal PDF、Plan PDF、Budget PDF、Enterprise ZIP 生产引擎
- **编排层** 通过引用字符串与独立 stub 数据桥接，不侵入下游模块
- **独立于** `lib/autopilot/`、`lib/proposal-pdf/`

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:delivery-workspace
npm run verify:customer-portal
npm run verify:delivery-ledger
npm run verify:version-runtime
npm run verify:approval-runtime
npm run verify:download-runtime
npm run verify:commercial-dashboard
```

Evidence：`buildCommercialDeliveryEvidence()` — 由 `verify:commercial-dashboard` 覆盖。

## Next: V15 Revenue Operations Platform

- 收入运营平台
- 与 Revenue Foundation / Enterprise SaaS 深度集成
