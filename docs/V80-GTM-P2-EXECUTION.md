# V80 GTM P2 — First Revenue Execution System

Concrete first-paid-transaction path. No runtime changes.

## Verify

```bash
npm run verify:v80-gtm-p2-execution
npx tsc --noEmit
```

## 1. First Deal Execution Flow

```
tender → budget → pdf → payment → upgrade
```

| # | Phase | Route | Outcome |
|---|-------|-------|---------|
| 1–2 | tender | `tenant/run` · `entitlements` | PRO provision |
| 3 | tender | `tender/intake` | quoteId |
| 4 | budget | `budget/calculate` | BUDGET ¢50 |
| 5–7 | pdf | `pdf` · `autopilot` · `proposal-pdf/render` | deliverables |
| 8–9 | payment | close + `governance/audit` | $3,588/yr PRO |
| 10 | upgrade | `autopilot` | capacity / ENTERPRISE |

## 2. Offer Pack (first transaction)

| SKU | Price | Surface |
|-----|-------|---------|
| FITSCALE-PRO-ANNUAL | $3,588/yr | `tenant/run` |
| TENDER-RESPONSE-PACK | ¢200/use | `autopilot` |
| BUDGET-CALC-UNIT | ¢50/use | `budget/calculate` |
| PROPOSAL-PDF-UNIT | ¢25/use | `proposal-pdf/render` |
| PLAN-PDF-INCLUDED | $0 | `pdf?type=plan` |
| GOVERNANCE-AUDIT | $0 | `governance/audit` |

## 3. Sales Execution Script

| Beat | Stage | Trigger |
|------|-------|---------|
| 1 | open | RFP hook → `tender/intake` |
| 2–3 | demo | provision + intake |
| 4–6 | value | budget → autopilot → proposal |
| 7 | close | $299/mo annual prepay |
| 8 | handoff | audit trail |

## 4. Revenue Capture

| Trigger | Method | Amount |
|---------|--------|--------|
| PRO annual close | subscription | $3,588 |
| budget calculate | metered | ¢50 |
| autopilot complete | metered | ¢200 |
| proposal PDF | metered | ¢25 |
| USAGE_LIMIT | annual-contract | ENTERPRISE bridge |

## Builder Chain

```
buildCustomerActivation() → buildFirstRevenueExecution()
```

## Module

`lib/gtm/v80/execution.*`
