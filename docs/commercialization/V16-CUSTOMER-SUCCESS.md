# V16 Customer Success Platform

**Version:** `v16.0-customer-success-1`  
**Status:** Customer success operations layer (`readiness-stub`)  
**Predecessor:** V15 Revenue Operations Platform (`v15-revenue-operations`)  
**Successor:** V17 Go-To-Market Platform

## Goal

建立 Customer Success Runtime，支持客户健康度分析、续费风险分析、升级机会分析、客户成功运营。不接真实 CRM。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Customer Health | `runCustomerHealthRuntime` | `GET /api/customer-success/health/run` | `npm run verify:customer-health` |
| Adoption | `runAdoptionRuntime` | `GET /api/customer-success/adoption/run` | `npm run verify:adoption-runtime` |
| Expansion | `runExpansionRuntime` | `GET /api/customer-success/expansion/run` | `npm run verify:expansion-runtime` |
| Renewal Risk | `runRenewalRiskRuntime` | `GET /api/customer-success/renewal-risk/run` | `npm run verify:renewal-risk` |
| Success Playbook | `runSuccessPlaybookRuntime` | `GET /api/customer-success/playbook/run` | `npm run verify:success-playbook` |
| Success Audit | `runSuccessAuditRuntime` | `GET /api/customer-success/audit/run` | `npm run verify:success-audit` |
| Customer Success Dashboard | `runCustomerSuccessDashboardRuntime` | `GET /api/customer-success/dashboard/run` | `npm run verify:customer-success-dashboard` |

## Module Layout

```
lib/customer-success/
  shared/
  health/           # usage / engagement / delivery / renewal scores → healthy/warning/critical
  adoption/         # feature / proposal / delivery adoption
  expansion/        # upgrade / cross-sell / enterprise opportunities
  renewal-risk/     # low / medium / high renewal risk
  playbook/         # onboarding / adoption / renewal / expansion playbooks
  audit/            # customer actions / success actions / outcomes
  dashboard/        # health / adoption / renewal / expansion health
  evidence.ts
  index.ts
```

## Boundaries

- **不接** 真实 CRM
- **不修改** Revenue Operations、Commercial Delivery、Autopilot、AI Integration
- **只读桥接** `lib/revenue-operations/` 公开 builders（customer / renewal 数据）

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:customer-health
npm run verify:adoption-runtime
npm run verify:expansion-runtime
npm run verify:renewal-risk
npm run verify:success-playbook
npm run verify:success-audit
npm run verify:customer-success-dashboard
```

Evidence：`buildCustomerSuccessEvidence()` — 由 `verify:customer-success-dashboard` 覆盖。

## Next: V17 Go-To-Market Platform

- 市场进入与 GTM 运营层
- 与 Customer Success 深度桥接
