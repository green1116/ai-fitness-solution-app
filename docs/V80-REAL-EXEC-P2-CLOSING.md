# V80 REAL EXEC P2 — First Deal Closing System

Repeatable closing playbook on GTM P2 execution path. No runtime changes.

## Verify

```bash
npm run verify:v80-realexec-p2-closing
npx tsc --noEmit
```

## 1. First Contact Script

| Phase | Channel | Hook |
|-------|---------|------|
| outreach | email / linkedin | RFP deadline + 30min response |
| opening | call | Qualify deadline + current tool |
| hook | call | Budget PDF in 10min + full proposal pack |

## 2. Demo Flow (30 min)

| Min | Show | API |
|-----|------|-----|
| 0–2 | PRO workspace | `tenant/run` |
| 2–5 | Tender intake | `tender/intake` |
| 5–10 | Budget calc | `budget/calculate` |
| 10–12 | Plan PDF | `pdf?type=plan` |
| 12–20 | Autopilot pack | `autopilot/job/run` |
| 20–24 | Proposal PDF | `proposal-pdf/render` |
| 24–27 | Audit trail | `governance/audit` |
| 27–30 | Close transition | `entitlements` |

## 3. Objection Handling

| Category | Proof API |
|----------|-----------|
| price | `autopilot` · `budget/calculate` |
| trust | `governance/audit` · `production/integrity` |
| timing | `tender/intake` · `pdf?type=budget` |
| competition | `autopilot` · `pdf?artifactId` |

## 4. Closing Script

| Moment | Ask | Plan |
|--------|-----|------|
| trial_close | "Does this meet procurement needs?" | PRO |
| offer | $299/mo · $3,588/yr annual | PRO |
| payment_ask | Send invoice · activate entitlements | PRO |
| enterprise_bridge | Multi-site → FitEnterprise | ENTERPRISE |

## Builder Chain

```
buildFirstRevenueExecution() → buildFirstDealClosing()
```

## Module

`lib/realexec/v80/closing.*`
