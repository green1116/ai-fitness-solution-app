# V11 AI Proposal Generation Foundation

**Version:** `v11.0-proposal-generation-1`  
**Status:** Tender Parse → Proposal description layer (no AI model calls)  
**Predecessor:** V10.5 Enterprise SaaS Foundation (`v10.5-enterprise-saas`)  
**Successor:** V11.5 AI Model Integration Readiness

## Goal

建立 AI Proposal Generation Runtime，将 Tender Parse 结果转化为完整提案描述层。不调用真实 AI 模型，不接入 OpenAI。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Executive Summary | `runExecutiveSummaryRuntime` | `GET /api/proposal-generation/executive-summary/run` | `npm run verify:executive-summary` |
| Technical Proposal | `runTechnicalProposalRuntime` | `GET /api/proposal-generation/technical-proposal/run` | `npm run verify:technical-proposal` |
| Implementation Plan | `runImplementationPlanRuntime` | `GET /api/proposal-generation/implementation-plan/run` | `npm run verify:implementation-plan` |
| Risk Analysis | `runRiskAnalysisRuntime` | `GET /api/proposal-generation/risk-analysis/run` | `npm run verify:risk-analysis` |
| Delivery Schedule | `runDeliveryScheduleRuntime` | `GET /api/proposal-generation/delivery-schedule/run` | `npm run verify:delivery-schedule` |
| Compliance Matrix | `runComplianceMatrixRuntime` | `GET /api/proposal-generation/compliance-matrix/run` | `npm run verify:compliance-matrix` |
| Proposal Assembly | `runProposalAssemblyRuntime` | `GET /api/proposal-generation/assembly/run` | `npm run verify:proposal-assembly` |
| Proposal Dashboard | `runProposalDashboardRuntime` | `GET /api/proposal-generation/dashboard/run` | `npm run verify:proposal-dashboard` |

## Module Layout

```
lib/proposal-generation/
  shared/               # runtime harness + tender parse snapshot stub
  executive-summary/    # Overview / Objectives / Benefits / Metrics
  technical-proposal/   # Scope / Architecture / Equipment / Deployment
  implementation-plan/  # Milestones / Phases / Timeline / Responsibilities
  risk-analysis/        # Risk Register / Mitigation / Escalation
  delivery-schedule/    # Delivery / Acceptance / Support Plan
  compliance-matrix/    # Requirement Mapping / Status / Evidence
  assembly/             # Proposal Package aggregation
  dashboard/            # Completeness / Readiness / Coverage metrics
  evidence.ts
  index.ts
```

## Proposal Flow

```
Tender Parse Snapshot → 6 Section Runtimes → Proposal Assembly → Proposal Package → Dashboard
```

## Boundaries

- **不调用** 真实 AI / OpenAI
- **不修改** Plan Engine、Budget Engine、Tender Runtime、Enterprise ZIP
- **不导入** `lib/tender/` 运行时（使用独立 `TenderParseSnapshot` 描述层）
- **独立于** Revenue / Payment / Enterprise SaaS 层

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:executive-summary
npm run verify:technical-proposal
npm run verify:implementation-plan
npm run verify:risk-analysis
npm run verify:delivery-schedule
npm run verify:compliance-matrix
npm run verify:proposal-assembly
npm run verify:proposal-dashboard
```

Evidence 聚合：`buildProposalGenerationEvidence()` — 由 `verify:proposal-dashboard` 覆盖。

## Next: V11.5 AI Model Integration Readiness

- LLM 适配器抽象层
- Prompt 模板与输出 schema
- 与 Proposal Generation Runtime 桥接
