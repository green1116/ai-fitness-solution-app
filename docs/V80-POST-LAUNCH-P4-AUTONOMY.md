# V80 POST-LAUNCH P4 — Autonomous Growth System

Spec-only autonomy layer on P1–P3. No runtime changes. Zero human initiation after bootstrap.

## Verify

```bash
npm run verify:v80-postlaunch-p4-autonomy
npx tsc --noEmit
```

## 1. Autonomous Lead Generation

```
signal → intake → tenant creation (no human)
```

| Signal | Route | Action |
|--------|-------|--------|
| PDF share opened | `pdf?type=plan` | Auto tenant/run |
| Partner referral | `tenant/run` | Partner workspace |
| Marketplace RFP | `tender/intake` | Auto intake |
| Usage spike / sibling org | `entitlements` | Subsidiary tenant |
| Audit new domain | `governance/audit` | Nurture invite |
| Budget preview done | `pdf?type=budget` | Auto intake |
| SEO template download | `tenant/run` | PLG provision |
| Reinvest surplus | `tenant/run` | Fund PLG slots |

## 2. Self-Generating Sales Motion

| Motion | Route | Trigger |
|--------|-------|---------|
| pdf | `pdf?type=plan` | Post-intake auto-render |
| pdf | `budget/calculate` | Auto budget PDF |
| proposal | `autopilot/job/run` | Step 8/8 → render |
| proposal | `proposal-pdf/render` | Auto deliver |
| followup | `entitlements` | 48h idle nurture |
| followup | `budget/calculate` | 7d gate retry |
| close | `governance/audit` | Renewal quote |
| close | `pdf?artifactId` | Contract template |

## 3. Autonomous Expansion Engine

| Signal | Target | Route |
|--------|--------|-------|
| FEATURE_GATE budget | PRO | `budget/calculate` |
| 7/10 quotes | PRO | `tender/intake` |
| USAGE_LIMIT 429 | PRO | `autopilot/job/run` |
| Proposal success | PRO | `proposal-pdf/render` |
| Budget cap | ENTERPRISE | `budget/calculate` |
| Bundle gate | ENTERPRISE | `pdf?artifactId` |
| Workspace limit | multi-org | `tenant/run` |
| Regional threshold | multi-org | `production/integrity` |

## 4. Closed-Loop Growth Flywheel

```
data → pdf → revenue → reinvest → leads → (loop)
```

| Phase | Route | Closure |
|-------|-------|---------|
| data | `entitlements` · `governance/audit` | → expansion + leads |
| pdf | `pdf` · `proposal-pdf/render` | → virality + expansion |
| revenue | `budget/calculate` · `autopilot` | → ARPA + upgrades |
| reinvest | `tenant/run` | → lower CAC |
| leads | `tender/intake` | → restart data phase |

## Builder Chain

```
buildRevenueActivation() → buildRevenueOptimization() → buildRevenueScaling() → buildAutonomousGrowth()
```

## Module

`lib/postlaunch/v80/autonomy.*`
