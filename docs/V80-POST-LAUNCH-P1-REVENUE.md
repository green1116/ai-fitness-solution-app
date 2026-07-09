# V80 POST-LAUNCH P1 — Revenue Activation Layer

Spec-only revenue optimization aligned with PRODUCT / API / BILLING. No runtime changes.

## Verify

```bash
npm run verify:v80-postlaunch-p1-revenue
npx tsc --noEmit
```

## 1. Revenue Activation Loop

| ID | Phase | Route | Charge |
|----|-------|-------|--------|
| REV-ACT-001 | usage | `/api/v80/tender/intake` | QUOTE ¢0 |
| REV-ACT-002 | usage | `/api/v80/budget/calculate` | BUDGET ¢50 → PRO gate |
| REV-ACT-003 | usage | `/api/v80/autopilot/job/run` | TENDER ¢200 → PRO gate |
| REV-ACT-004 | value | `/api/v80/pdf?type=plan` | PDF ¢25 |
| REV-ACT-005 | value | `/api/v80/proposal-pdf/render` | PDF ¢25 → PRO gate |
| REV-ACT-006 | billing | mapUsageToCharge on BUDGET | ¢50 recorded |
| REV-ACT-007 | billing | `/api/v80/ops/governance/audit` | entitlement trail |
| REV-ACT-008 | upgrade | FEATURE_GATE → FitScale ($299/mo) | PRD-CNV-001 |
| REV-ACT-009 | upgrade | USAGE_LIMIT on tender | PRD-CNV-004 |
| REV-ACT-010 | upgrade | Enterprise bundle | PRD-CNV-006 |

## 2. High-Conversion Entry Points

| Rank | Channel | Route | Hook |
|------|---------|-------|------|
| 1 | api | `/api/v80/budget/calculate` | budget_gate |
| 2 | pdf | `/api/v80/proposal-pdf/render` | proposal_gate |
| 3 | workflow | `/api/v80/autopilot/job/run` | tender_pack_complete |
| 4 | api | `/api/v80/autopilot/job/run` | autopilot_gate |
| 5 | pdf | `/api/v80/pdf?type=budget` | budget_pdf_preview |
| 6 | pdf | `/api/v80/pdf?artifactId` | bundle_download |
| 7 | api | `/api/v80/production/integrity` | integrity_gate |

## 3. First Customer Path (tender → PDF → paid)

Maps `DEP-TNT-001..008` → revenue checkpoints:

1. PRO tenant provision (skip BASIC friction)
2. Entitlements unlock full loop
3. Tender intake (PQL)
4. Budget calculate — first billable event
5. Autopilot — highest unit charge
6. Plan PDF — value proof
7. Proposal PDF — paid conversion CTA
8. Governance audit — renewal defense

## 4. Pricing Pressure (natural paywalls)

**BASIC → PRO**
- FEATURE_GATE: budget, autopilot, proposal PDF
- USAGE_LIMIT: 8/10 quotes (PRD-EXP-002)

**PRO → ENTERPRISE**
- USAGE_LIMIT: 45/50 tenders, 50/mo budget cap
- Enterprise triggers: bundle download, integrity dashboard

## Builder Chain

```
buildCutover() + buildGrowth() → buildRevenueActivation()
```

## Module

`lib/postlaunch/v80/revenue.*`
