# PD-6.5 — Integration Reliability

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Integration Reliability

## Version

`product-delivery-pd-6.5-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-5.6 | Backend reliability / observability |
| PD-6.1 / PD-6.2 / PD-6.3 / PD-6.4 | Pipeline, contracts, workflows, security |
| PD-4.5 / PD-4.7 | FE data flow / performance consumption |
| PD-2.4 | Existing APIs / job surfaces |

## Purpose

Define **end-to-end integration reliability**: retry, timeout, idempotency, async coordination, and failure recovery across the frozen UI → API → Service → Domain chain.

**Reuse only.** Backend owns reliability policy. Frontend consumes outcomes and re-issues the same Command/Query. No new Domains or API families.

---

# 1. Reliability Model

## 1.1 Reliability layers

| Layer | Reliability role |
|-------|------------------|
| Frontend | Present META-LOADING / ERROR; re-issue same intent; no Domain invention |
| Adapter | Map envelopes; bounded client retry where allowed |
| API Edge | Hard request budget; auth fail-closed |
| Service | Bounded outbound calls; mapped degrade |
| Domain | Authoritative accept/reject; job state |
| Persistence | DUR-CRITICAL SoT; fail closed on write timeout |

## 1.2 Criticality (integration view)

| Class | Must not silently lie |
|-------|------------------------|
| REL-AUTH | Session resolve / protected routes |
| REL-SYNC-CMD | Mutating Commands |
| REL-ASYNC-JOB | Generation / processing jobs |
| REL-READ | List/result Queries |
| REL-NAV | Client navigation after success only |

## 1.3 Principles

1. **Fail closed on writes** when auth or store is unsafe.  
2. **Domain SoT** — FE cache is disposable.  
3. **Same Command retry** — no remapping to alternate Domains.  
4. **Async is visible** via existing job/status APIs — no fake sync completion.  
5. **Bounded** retries and timeouts everywhere.  
6. **Reuse only** — existing ops/job surfaces for signals.

---

# 2. Retry Policy

## 2.1 Who may retry

| Actor | May retry | Must not |
|-------|-----------|----------|
| Frontend (user) | Re-issue **same** Command/Query after message | Invent new Command/Domain |
| Adapter (automatic) | Transient `UNAVAILABLE` only, bounded | Retry FORBIDDEN / DOMAIN_REJECT / VALIDATION |
| Service (internal) | Transient infra only, bounded | Override Domain reject |
| Domain | Per existing idempotency / job contracts | — |

## 2.2 Retryability matrix

| Error class | Auto-retry? | User retry? |
|-------------|-------------|-------------|
| `UNAUTH` / `EXPIRED` | No (re-auth first) | Same Command after SignIn |
| `FORBIDDEN` | No | No (without permission change) |
| `VALIDATION` | No | After fixing ST-LOCAL |
| `DOMAIN_REJECT` | No | Only if Domain marks retryable |
| `CONFLICT` | Conditional per contract | Per contract |
| `UNAVAILABLE` | Yes, bounded backoff | Yes |
| `NOT_FOUND` | No | No |

## 2.3 Retry rules

| Rule | Statement |
|------|-----------|
| RY-01 | Budget is finite; then surface UNAVAILABLE / stop |
| RY-02 | Never auto-retry non-idempotent side effects without contract |
| RY-03 | Backoff must not storm job/run endpoints |
| RY-04 | Supporting Domain failure follows mapped fail/degrade — not infinite loops |
| RY-05 | Retry does not widen tenant scope or skip authz |

---

# 3. Timeout Policy

## 3.1 Timeout classes (end-to-end)

| Class | Scope | On expiry |
|-------|-------|-----------|
| TO-FE-UX | User-perceived wait / disable window | Keep META state; allow cancel/back where Screen allows |
| TO-ADAPTER | Outbound HTTP to API | Map to UNAVAILABLE; stop auto-retry budget |
| TO-EDGE | API request budget | Cancel/stop work per contract; safe error |
| TO-SERVICE | Domain/runtime call budget | Fail or degrade mapped Command only |
| TO-DOMAIN-SYNC | Sync Domain op | Fail within budget |
| TO-JOB | Async overall | Job state expiry per existing autopilot contract |
| TO-STORE | Persistence call | Fail closed on write |

Exact numbers are ops/config — architecture requires **bounds**.

## 3.2 Timeout rules

| Rule | Statement |
|------|-----------|
| TO-01 | No unbounded wait on sync Commands |
| TO-02 | Timeout must not leave unknown partial writes without Domain conflict/idempotency handling |
| TO-03 | FE skeleton/loading is not a substitute for backend timeout |
| TO-04 | Job timeout leaves observable failed/expired job state — not invented success Objects |
| TO-05 | Auth-down protected routes fail closed within Edge budget |

---

# 4. Idempotency

## 4.1 Idempotency model

| Kind | Expectation |
|------|-------------|
| Query | Naturally safe to repeat |
| Idempotent Command | Re-issue yields same authoritative outcome per existing contract |
| Non-idempotent Command | Re-issue only with user intent; may require existing idempotency key if contract has one |
| Job start | Follow existing job idempotency — no duplicate silent Domain corruption |

## 4.2 Integration rules

| Rule | Statement |
|------|-----------|
| ID-01 | FE double-submit guard (disable primary) is UX — not Domain idempotency |
| ID-02 | Use existing idempotency keys only when the route already supports them |
| ID-03 | Do not invent a new idempotency API family |
| ID-04 | Download/share token re-issue uses existing share/download Commands |
| ID-05 | After timeout with unknown outcome: prefer status Query / job reconcile before blind mutate |

## 4.3 Safe re-issue patterns

| Pattern | Allowed |
|---------|---------|
| Re-read list/result after error | Yes (Query) |
| Re-auth then same Command | Yes (user-initiated) |
| Auto re-POST upload without contract | No |
| Re-click Generate while job running | Prefer status read; follow existing job contract |

---

# 5. Async Coordination

## 5.1 Coordination pattern

```
WF-COMMAND (accept job)
  → ack: queued|running (not final product Objects)
  → FE: processing presentation
  → WF-READ status/job/workspace (existing APIs only)
  → loop until terminal state or user leaves
  → succeeded → WF-READ results/artifacts
  → failed → WF-FAIL → recovery
```

## 5.2 Surfaces (reuse)

| Concern | Existing surface |
|---------|------------------|
| Job run | `/api/v80/autopilot/job/run` |
| Tender/process status | Existing tender intake/gate status |
| Workspace progress | Workspace summary / NEAREST bindings |
| Durable job state | STF-JOB (M12) |

## 5.3 Coordination rules

| Rule | Statement |
|------|-----------|
| AC-01 | Sync response must not claim async completion early |
| AC-02 | Status polling uses Queries only — no mutate-as-poll |
| AC-03 | Poll interval bounded; stop on leave Screen / terminal state |
| AC-04 | No new progress/websocket Domain or API family required by this architecture |
| AC-05 | Multi-tab: Domain/job SoT wins over local FE races |
| AC-06 | After deploy/rollback: reconcile from job state, not FE guess (PD-5.7) |

---

# 6. Failure Recovery

## 6.1 Recovery catalogue (reliability)

| ID | Trigger | Integration action |
|----|---------|-------------------|
| RC-REAUTH | UNAUTH/EXPIRED | SignIn → refresh SES → user retries **same** Command/Query |
| RC-RETRY | Transient UNAVAILABLE | Bounded backoff; same intent |
| RC-FIXINPUT | VALIDATION | Edit ST-LOCAL → re-issue |
| RC-REFETCH | Stale/unknown after timeout | WF-READ / job status before mutate |
| RC-JOB-WAIT | Async running | Continue status reads |
| RC-JOB-RECONCILE | Job fail / env recover | Trust Domain/job; then optional user retry same Generate |
| RC-SAFE-NAV | Soft context / hard stop | Allowed FE edges only |
| RC-DEGRADE | Supporting dependency down | Mapped Command fail/degrade only — no fake Objects |

## 6.2 Recovery sequence

```
Classify failure (PD-6.2 / PD-6.4)
  → Select RC-*
  → Precondition (re-auth / fix / wait / refetch)
  → Re-enter WF-READ | WF-COMMAND | WF-ASYNC status
  → Exhausted → stop; safe message / /unavailable / safe NAV
```

## 6.3 Recovery rules

| Rule | Statement |
|------|-----------|
| FR-01 | Never remap Command to another Domain “that might work” |
| FR-02 | Do not auto-fire mutating Commands after re-auth without user intent |
| FR-03 | Prefer refetch SoT over inventing values |
| FR-04 | Partial multi-area ops stay per-area |
| FR-05 | Incident/deploy recovery is ops-owned; user recovery stays RC-* above |

---

# 7. End-to-End Reliability Scenarios

| Scenario | Policy |
|----------|--------|
| Sync Command times out mid-flight | TO-ADAPTER/EDGE → UNAVAILABLE; RC-REFETCH status if applicable; user may retry if idempotent |
| Generate job accepted then worker down | Job state failed/stuck observable; RC-JOB-RECONCILE; no FE “done” |
| Auth service blip | Protected routes fail closed; RC-REAUTH |
| Read dependency down | Error or disposable BE cache if contracted non-SoT; never invent rows |
| Double-click Submit | FE disable + server idempotency if present |

---

# 8. Release Gate

## Gate ID

`product-integration-reliability-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| IREL-MODEL | Reliability model | Layers + criticality + principles |
| IREL-RETRY | Retry policy | Matrix + RY rules |
| IREL-TO | Timeout policy | TO-* classes + rules |
| IREL-IDEM | Idempotency | Model + ID rules |
| IREL-ASYNC | Async coordination | Pattern + existing surfaces + AC rules |
| IREL-REC | Failure recovery | RC-* + FR rules |
| IREL-SCOPE | Reuse only / upstream intact | No new Domains/APIs; PD-1…PD-6.4 / M11–M15 unmodified; single new file |

## Verdict

```
PD-6.5 Gate = PASS
  iff IREL-MODEL ∧ IREL-RETRY ∧ IREL-TO ∧ IREL-IDEM
    ∧ IREL-ASYNC ∧ IREL-REC ∧ IREL-SCOPE all PASS
```

---

# 9. Freeze Summary

```
INTEGRATION_RELIABILITY_ID = product-integration-reliability-v1
BE_RELIABILITY_REF         = product-backend-reliability-observability-v1
RETRY                      = bounded; same Command/Query; class-gated
TIMEOUTS                   = TO-FE|ADAPTER|EDGE|SERVICE|DOMAIN|JOB|STORE
IDEMPOTENCY                = existing contracts; FE guard ≠ Domain
ASYNC                      = existing job/status; no fake sync success
RECOVERY                   = REAUTH|RETRY|FIXINPUT|REFETCH|JOB-WAIT|JOB-RECONCILE|SAFE-NAV|DEGRADE
FAIL_CLOSED_WRITES         = true
REUSE_ONLY                 = true
NO_NEW_DOMAIN              = true
NO_NEW_API_FAMILY          = true
```

## Immutable statements

1. Retries re-issue the same Command/Query only.  
2. Timeouts are bounded; writes fail closed when unsafe.  
3. Idempotency follows existing contracts — no new family.  
4. Async completion is Domain/job-authoritative.  
5. Recovery never invents Domains or alternate Golden Paths.  
6. Upstream PD-1…PD-6.4 and M11–M15 unmodified by this task.

---

# 10. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-IREL-01 | Reliability model defined | ✓ |
| AC-IREL-02 | Retry + timeout + idempotency defined | ✓ |
| AC-IREL-03 | Async coordination + failure recovery defined | ✓ |
| AC-IREL-04 | Release Gate + Freeze summary present | ✓ |
| AC-IREL-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.5 document PASS iff AC-IREL-01 … AC-IREL-05 PASS
```

---

# Document Statement

PD-6.5 Integration Reliability locks resilient behavior across the frozen FE ↔ BE seam.

```
Bounded retry/timeout · Idempotent where contracted
Async via existing jobs · Recover with same Command
Fail closed on writes · Reuse only
```
