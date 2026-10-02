# Pre-Pilot F5 / F5.1 Production Acceptance Freeze

## Status

| Item | Status |
| --- | --- |
| F5 Guided Solution Workflow | **PRODUCTION PASS / CLOSED** |
| F5.1 Workflow Progress Persistence | **PRODUCTION PASS / CLOSED** |
| Production service / public HTTP | **PASS** |

Recorded: 2026-10-02

## Baseline

| Field | Value |
| --- | --- |
| Branch | `post-ga/production-operability-v1` |
| Production commit | `0dbdf7211338ecfdc52bfe3df0cd8706c26e68b0` |
| Production BUILD_ID | `V0wz2vbT-wPNhBvdsmpyx` |
| F5 commit | `f07fdd3bba7c97ea9ea046c1692e3eb00c81e275` — `feat(product): add guided solution workflow` |
| F5.1 commit | `0dbdf7211338ecfdc52bfe3df0cd8706c26e68b0` — `fix(product): preserve quote workflow progress` |
| F5.1 surface | `app/(product)/quote/page.tsx`, `app/(product)/quote/quote-workflow.ts`, `scripts/verify-prepilot-f5-workflow.ts` |

## Deployment evidence

| Field | Value |
| --- | --- |
| Artifact | `ai-fitness-0dbdf721-deploy.tar.gz` |
| Size | `19024372` bytes |
| SHA256 | `EF7CA10299C9B40F065DF5E7A29FA6E9ED83399DC5C2BF94D34E093C1A7F40B6` |
| Candidate BUILD_ID | Matched expected (`V0wz2vbT-wPNhBvdsmpyx`) |
| Rollback snapshot BUILD_ID | `ED6_wCX0FEudwVgHy3Y0o` |
| Final production BUILD_ID | `V0wz2vbT-wPNhBvdsmpyx` |
| `ai-fitness.service` | **active** |
| localhost HTTP | **200** |
| public HTTP | **200** |

Deployment evidence (artifact, rollback snapshot) is retained; not deleted by this record.

## Production acceptance (manual)

| # | Criterion | Result |
| --- | --- | --- |
| 1 | Step 2 AI requirement acknowledgement -> Step 3 | **PASS** |
| 2 | Refresh after Step 2 acknowledgement preserves progress | **PASS** |
| 3 | Step 3 strategy acknowledgement -> Step 4 | **PASS** |
| 4 | Refresh at Step 4 stays at Step 4 | **PASS** |
| 5 | Before product configuration confirmation, Step 5 remains locked | **PASS** |
| 6 | Step 4 product configuration confirmation unlocks Step 5 | **PASS** |
| 7 | Refresh after product confirmation keeps Step 5 unlocked | **PASS** |
| 8 | New revision returns to Step 2 | **PASS** |
| 9 | New revision does not inherit prior quote Step2/Step3 acknowledgement | **PASS** |
| 10 | New revision requires product configuration to be confirmed again before Step 5 unlocks | **PASS** |
| 11 | Reference catalog candidates may recur across revisions; this is not selection-state inheritance | **PASS** |

## Frozen state semantics

| State | Persistence | Scope |
| --- | --- | --- |
| Step 2 requirement acknowledgement | Browser `sessionStorage` (dedicated key `product-quote-workflow-ack`) | `userId` + `projectId` + `quoteId` |
| Step 3 strategy acknowledgement | Browser `sessionStorage` (same dedicated key) | `userId` + `projectId` + `quoteId` |
| Step 4 product configuration confirmation | Persisted Quote state (server) | Current Quote |
| Step 5 Budget unlock | Derived from persisted current-Quote product selections only | Current Quote |

Binding rules:

- Step2/Step3 acknowledgement persistence is **browser-session scoped** and keyed by **userId + projectId + quoteId**. It is navigation state, not a server-side business fact; no server-side workflow-state persistence exists.
- Acknowledgement is restored only after Product Intelligence has loaded successfully for the same current `quoteId` (server-side tenant + project ownership already enforced); never from another user, project or quote.
- Acknowledgement is never written to `product-commercial-context`; storage holds only `requirementsAck`, `strategyAck` and a timestamp, bounded to 50 records.
- Step4/product confirmation **remains persisted Quote state**.
- Budget unlock **remains based on persisted current-Quote product selections**; acknowledgement never counts as product configuration.
- A new revision / new `quoteId` **must not inherit** acknowledgement state and must not inherit product selections.

## Verification at freeze baseline

| Check | Result |
| --- | --- |
| `scripts/verify-prepilot-f5-workflow.ts` | **PASS** |
| `scripts/verify-prepilot-f3-f4.ts` | **PASS** |
| `scripts/verify-product-context-handoff.ts` | **PASS** |
| `npm run build` (placeholder env) | **PASS** |

## Scope lock

Documentation closeout only — no application code, Prisma schema / migrations, payment, auth, Tender or Enterprise entitlement changes in this record.

## Decision

F5 and F5.1 are **PRODUCTION PASS / CLOSED**. Further workflow changes require a new work package against this baseline.
