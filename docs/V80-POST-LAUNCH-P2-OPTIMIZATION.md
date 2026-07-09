# V80 POST-LAUNCH P2 — Revenue Optimization Layer

Spec-only performance tuning on P1 revenue loop. No runtime changes.

## Verify

```bash
npm run verify:v80-postlaunch-p2-optimization
npx tsc --noEmit
```

## 1. Conversion Rate Optimization

| ID | Route | Tuning | Lift |
|----|-------|--------|------|
| REV-OPT-CNV-001 | `budget/calculate` | Partial totals before gate | +12–18% |
| REV-OPT-CNV-002 | `proposal-pdf/render` | Watermark preview on BASIC | +20–25% |
| REV-OPT-CNV-003 | `autopilot/job/run` | Post-completion upsell at 8/8 | +15% |
| REV-OPT-CNV-004 | `autopilot/job/run` | Step-1 progress, gate at step 3 | +10% |
| REV-OPT-CNV-005 | `pdf?type=budget` | Thumbnail on intake success | +8% |
| REV-OPT-CNV-006 | `pdf?type=plan` | Plan PDF → budget CTA | +14% |
| REV-OPT-CNV-007 | `tender/intake` | Deep link to budget calc | +9% |

## 2. Enterprise Sales Acceleration

| Stage | Route | Baseline→Target | Tactic |
|-------|-------|-----------------|--------|
| rfp | `tender/intake` | 14d→3d | Same-session intake→autopilot |
| response | `autopilot/job/run` | 7d→1d | Pre-packaged tender-pack demo |
| compliance | `ops/governance/audit` | 21d→5d | Audit export in proposal pack |
| compliance | `budget/calculate` | 10d→2d | CFO budget PDF bundled |
| close | `tenant/run` | 45d→14d | ENTERPRISE on bundle gate |
| close | `production/integrity` | 30d→7d | Integrity score in exec deck |
| response | `pdf?artifactId` | 5d→1d | Sales-assist on bundle download |

## 3. Pricing Yield Optimization

| Metric | Signal | Optimization |
|--------|--------|--------------|
| ARPA | PRO $299 + metered | Cumulative usage in entitlements |
| ARPA | TENDER ¢200 | Cross-sell after 3rd budget |
| upgrade_timing | 7/10 quotes | Proactive warning vs hard limit |
| upgrade_timing | budget gate | Price anchor + annual save |
| usage_pressure | 40/50 tenders | Soft nudge at 80% cap |
| usage_pressure | budget cap | ENTERPRISE bridge vs silent block |
| ARPA | ENTERPRISE bundle | Usage-inclusive annual packaging |
| upgrade_timing | proposal render | Annual offer at peak WTP |

## 4. Revenue Leak Detection

| Stage | Drop Signal | Fix Surface |
|-------|-------------|-------------|
| org | No intake 72h | API redirect post-provision |
| intake | No budget 48h | Deep link + estimate |
| pdf | Plan PDF skipped | Workflow artifact list |
| pdf | 403 abandon on proposal | Watermark preview (CNV-002) |
| budget | No autopilot started | Budget→workflow suggestion |
| paid | Gate no checkout 7d | Persistent upgrade URL |
| paid | 429 churn | Capacity add-on + discount |
| paid | Enterprise no follow-up | 24h sales-assist SLA |

## Builder Chain

```
buildRevenueActivation() → buildRevenueOptimization()
```

## Module

`lib/postlaunch/v80/optimization.*`
