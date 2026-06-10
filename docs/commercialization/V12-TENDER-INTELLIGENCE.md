# V12 Tender Intelligence Foundation

**Version:** `v12.0-tender-intelligence-1`  
**Status:** Structured tender project understanding (`readiness-stub`)  
**Predecessor:** V11.5 AI Model Integration Readiness (`v11.5-ai-readiness`)  
**Successor:** V12.5 Knowledge Base Foundation

## Goal

建立 Tender Intelligence Runtime，让系统具备对招标项目的结构化理解能力。不接真实 AI，不接外部知识库。

## Domains

| Domain | Runtime | API | Verify |
|--------|---------|-----|--------|
| Project Classification | `runProjectClassificationRuntime` | `GET /api/tender-intelligence/classification/run` | `npm run verify:project-classification` |
| Project Scale | `runProjectScaleRuntime` | `GET /api/tender-intelligence/scale/run` | `npm run verify:project-scale` |
| Risk Intelligence | `runRiskIntelligenceRuntime` | `GET /api/tender-intelligence/risk/run` | `npm run verify:risk-intelligence` |
| Equipment Intelligence | `runEquipmentIntelligenceRuntime` | `GET /api/tender-intelligence/equipment/run` | `npm run verify:equipment-intelligence` |
| Budget Intelligence | `runBudgetIntelligenceRuntime` | `GET /api/tender-intelligence/budget/run` | `npm run verify:budget-intelligence` |
| Compliance Intelligence | `runComplianceIntelligenceRuntime` | `GET /api/tender-intelligence/compliance/run` | `npm run verify:compliance-intelligence` |
| Tender Intelligence Assembly | `runTenderIntelligenceAssemblyRuntime` | `GET /api/tender-intelligence/assembly/run` | `npm run verify:tender-intelligence` |
| Tender Dashboard | `runTenderDashboardRuntime` | `GET /api/tender-intelligence/dashboard/run` | `npm run verify:tender-dashboard` |

## Module Layout

```
lib/tender-intelligence/
  shared/              # runtime harness + tender project snapshot stub
  classification/      # Office / Industrial / Campus / Hotel / Government Gym
  scale/               # Small / Medium / Large / Enterprise
  risk/                # Risk Level / Drivers / Summary
  equipment/           # Complexity / Density / Recommendation
  budget/              # Budget Tier / Pressure / Cost Sensitivity
  compliance/          # Coverage / Missing / Attention Areas
  assembly/            # Tender Intelligence Profile
  dashboard/           # Completeness / Understanding metrics
  evidence.ts
  index.ts
```

## Intelligence Profile

```
Classification + Scale + Risk + Equipment + Budget + Compliance → Tender Intelligence Profile
```

## Boundaries

- **不接** 真实 AI 或外部知识库
- **不修改** `lib/tender/` 生产 Tender Runtime、Proposal Engine、Proposal PDF、Plan/Budget/ZIP
- **独立于** `lib/proposal-generation/`、`lib/ai-readiness/`

## Verification

```bash
npx tsc --noEmit
npm run build
npm run verify:project-classification
npm run verify:project-scale
npm run verify:risk-intelligence
npm run verify:equipment-intelligence
npm run verify:budget-intelligence
npm run verify:compliance-intelligence
npm run verify:tender-intelligence
npm run verify:tender-dashboard
```

Evidence：`buildTenderIntelligenceEvidence()` — 由 `verify:tender-dashboard` 覆盖。

## Next: V12.5 Knowledge Base Foundation

- 知识库描述层
- 与 Tender Intelligence Profile 桥接
