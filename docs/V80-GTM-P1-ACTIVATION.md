# V80 GTM P1 — Real Customer Activation Layer

Real-world execution strategy on POST P1–P4. No runtime changes.

## Verify

```bash
npm run verify:v80-gtm-p1-activation
npx tsc --noEmit
```

## 1. First Customer Acquisition (who pays first + why now)

| Rank | Segment | Plan | Why Now |
|------|---------|------|---------|
| 1 | Mid-size equipment integrator | PRO | Active RFP deadline <14d |
| 2 | Regional gym chain (3–10 sites) | PRO | Multi-site standardized pack |
| 3 | Government procurement contractor | ENTERPRISE | Audit + budget PDF for DD |
| 4 | Fitness OEM distributor | PRO | White-label co-sell |
| 5 | Independent gym consultant | PRO | Autopilot saves 2d/bid |
| 6 | National franchise HQ | ENTERPRISE | Multi-region integrity |

## 2. Initial Sales Motion (priority)

| Rank | Channel | Route |
|------|---------|-------|
| 1–2 | **tender** | `tender/intake` · `budget/calculate` |
| 3–4 | outbound | `autopilot` · `production/integrity` |
| 5–6 | inbound | `tenant/run` · `budget/calculate` |

## 3. Revenue Validation Loop

```
first_deal → pdf → expansion → case_study
```

| Step | Milestone | Proof |
|------|-----------|-------|
| 1–2 | first_deal | intake + BUDGET ¢50 |
| 3–4 | pdf | plan PDF + proposal PDF |
| 5–6 | expansion | autopilot + audit trail |
| 7–8 | case_study | integrity deck → inbound attribution |

## 4. GTM Entry Point (highest probability)

**#1 tender-marketplace** → `/api/v80/tender/intake`

Runners-up: outbound ABM autopilot · budget-gate PLG · partner co-sell

## Builder Chain

```
buildAutonomousGrowth() → buildCustomerActivation()
```

## Module

`lib/gtm/v80/activation.*`
