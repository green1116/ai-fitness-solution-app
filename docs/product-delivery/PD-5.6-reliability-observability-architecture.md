# PD-5.6 — Reliability & Observability Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Reliability & Observability Architecture

## Version

`product-delivery-pd-5.6-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.4 / PD-2.5 | Existing ops health/metrics/audit/integrity; job run APIs; M13/M12 ownership |
| PD-4.5 / PD-4.6 / PD-4.7 | Frontend consumes outcomes; retry same Command; `/unavailable` |
| PD-5.1 … PD-5.5 | Services, API errors, jobs, security (no secrets in logs) |
| M11–M15 | Existing Domains only |

## Purpose

Define **backend reliability**, **observability**, **monitoring**, **alerting**, and **failure-handling** architecture.

**Backend owns reliability and observability behavior.**  
**Frontend only consumes outcomes** (safe errors, status Objects, ops views).  
Reuse **M11–M15** and **existing API families** only — no new Domains, no new API families.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Reliability boundaries | What must stay up / degrade |
| Health / readiness / liveness | Probe semantics via existing ops |
| Logging / trace / metric strategy | Telemetry classes + ownership |
| Error and retry behavior | Backend + client re-issue rules |
| Timeout / fallback policy | Deadlines and safe degrade |
| Queue / job visibility | Autopilot / agent run observability |
| Operational signals | Metrics / usage / integrity |
| Incident / recovery boundary | Who remediates what |
| Observability freeze summary | Lock points |
| Release Gate | Readiness |

## Out of scope

| Item | Reason |
|------|--------|
| Vendor APM product selection as a Domain | Implementation choice |
| New monitoring API families | Forbidden |
| Frontend performance budgets redesign | PD-4.7 |
| New Domains | Forbidden |
| Modification of PD-1…PD-5.5 or M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Reliability Principles

1. **Domain SoT survives process restarts** for DUR-CRITICAL data (PD-5.4).  
2. **Fail closed on auth; fail safe on dependency loss** — protected routes do not write when unsafe.  
3. **Prefer existing ops surfaces** — `/api/v80/ops/health`, `metrics`, `governance/audit`, `production/integrity`.  
4. **Jobs are first-class** — long-running work uses existing `/api/v80/autopilot/job/run` visibility — no fake sync Domain.  
5. **Retries are idempotent where contracted** — re-issue same Command/Query.  
6. **Observability must be tenant-safe and secret-safe** (PD-5.5).  
7. **Frontend does not own reliability policy** — it presents META-ERROR / status / `/unavailable`.  
8. **No new Domains / API families** for “better monitoring.”

---

# 3. Reliability Boundaries

## 3.1 Criticality classes

| Class | Meaning | Examples |
|-------|---------|----------|
| REL-AUTH | Auth/session must be correct | FAM-AUTH, STF-SESSION |
| REL-API | Product Command/Query edge | PD-2.4 families |
| REL-DOMAIN | M11–M15 capability execution | Primary Domain paths |
| REL-JOB | Async generation/orchestration | M12 / autopilot jobs |
| REL-STORE | Persistence families | PD-5.4 STF-* |
| REL-OPS | Health/metrics/integrity observation | FAM-OPS / v80 ops |
| REL-FE | Presentation only | Not backend reliability owner |

## 3.2 Boundary rules

| Rule | Statement |
|------|-----------|
| RB-01 | REL-FE outage UX ≠ Domain data loss |
| RB-02 | REL-STORE failure ⇒ Commands fail closed (no silent success) |
| RB-03 | REL-JOB failure leaves observable job state — not invented UI completion |
| RB-04 | Supporting Domain degrade must follow PD-5.2 mapped fail/degrade policy |
| RB-05 | Reliability tooling must not bypass tenant isolation |

## 3.3 Ownership

| Concern | Owner |
|---------|-------|
| Define retry/timeout/fallback policy for APIs/jobs | Backend (this architecture + existing contracts) |
| Present loading/error/unavailable | Frontend |
| Health/metrics truth | Existing ops surfaces (M13 + mapped) |
| Business recovery decisions | Owning Domain |

---

# 4. Health / Readiness / Liveness

## 4.1 Probe semantics (architecture)

| Probe | Question | Product expectation |
|-------|----------|---------------------|
| **Liveness** | Process should be restarted? | Runtime alive; no deep Domain business checks required |
| **Readiness** | May accept product traffic? | Auth/session path + critical dependencies reachable enough to serve |
| **Health (ops)** | Operator view of system health | Existing `/api/v80/ops/health` (+ related) |

Exact probe endpoints beyond existing ops health remain implementation; **product observation** prefers the existing v80 health surface — **no new health API family**.

## 4.2 Readiness inputs (logical)

| Check | Failure effect |
|-------|----------------|
| Session store reachable (when auth required) | Not ready for protected routes |
| Primary persistence for serving Domain | Not ready / degraded per family |
| Job runtime (if generation offered) | Generation Commands may UNAVAILABLE; reads may continue |
| Downstream supporting runtime | Degrade mapped Commands only |

## 4.3 Rules

| Rule | Statement |
|------|-----------|
| HL-01 | Liveness must not take Domain locks or run heavy Queries |
| HL-02 | Readiness must not expose secrets or cross-tenant inventories |
| HL-03 | Customer Golden Path APIs are not health dashboards |
| HL-04 | `/unavailable` UI is a consumption of backend UNAVAILABLE — not a probe |
| HL-05 | Ops health access follows PD-5.5 ops authorization |

---

# 5. Logging / Trace / Metric Strategy

## 5.1 Telemetry classes

| Class | Purpose | Owner bias |
|-------|---------|------------|
| LOG-ACCESS | Request authn/z outcomes | M13 / API Edge |
| LOG-APP | Service orchestration events | L4 |
| LOG-DOMAIN | Domain accept/reject (safe codes) | Owning Domain |
| LOG-JOB | Job state transitions | M12 |
| LOG-AUDIT | Governance/security audit | M13 / M15 (existing) |
| TRACE-REQ | Correlation across API → service → Domain | Backend |
| METRIC-OPS | Latency/error/saturation signals | Existing metrics surfaces |
| METRIC-USAGE | Product usage observations | Existing usage/ops |

## 5.2 Logging rules

| Rule | Statement |
|------|-----------|
| LG-01 | Never log passwords, OTP, session secrets, raw tokens (PD-5.5) |
| LG-02 | Prefer opaque ids (`requestId`, `tenantId`, `projectId`, `jobId`) |
| LG-03 | Domain business payloads logged only at safe summary level |
| LG-04 | Errors include stable `code` when available — not stack traces to clients |
| LG-05 | Tenant boundaries apply to log query access in ops |

## 5.3 Trace rules

| Rule | Statement |
|------|-----------|
| TR-01 | Propagate correlation id across L5→L4→L3→L2 where feasible |
| TR-02 | Traces must not become a new product Domain or API family |
| TR-03 | Job traces link `jobId` to initiating principal/tenant |

## 5.4 Metric rules

| Rule | Statement |
|------|-----------|
| MT-01 | Prefer existing `/api/v80/ops/metrics` and usage runs for operator views |
| MT-02 | RED/USE style signals (rate, errors, duration; utilization) are architectural goals — implementation may map to existing metrics |
| MT-03 | Customer APIs must not return cluster-wide raw metric dumps |
| MT-04 | Metrics cardinality must not explode on unbounded user text |

---

# 6. Error and Retry Behavior

## 6.1 Error classes (reliability reading)

| Class | Retryable? | Notes |
|-------|------------|-------|
| `UNAUTH` / `EXPIRED` | After re-auth only | Same Command |
| `FORBIDDEN` | No (without permission change) | Fail closed |
| `VALIDATION` | No until client fixes payload | Contract-level |
| `DOMAIN_REJECT` | No / only if Domain says retryable | Domain-authoritative |
| `CONFLICT` | Conditional | Per existing contract |
| `UNAVAILABLE` / dependency | Yes with backoff | Idempotent Commands only |
| `NOT_FOUND` | No | Empty/not-found |

## 6.2 Backend retry rules

| Rule | Statement |
|------|-----------|
| RY-01 | Internal retries only for transient infrastructure failures — not to override Domain reject |
| RY-02 | Internal retry budget is bounded; then return UNAVAILABLE/safe error |
| RY-03 | Never retry non-idempotent side effects without existing idempotency contract |
| RY-04 | Supporting Domain failures follow mapped fail vs degrade (PD-5.2) — not infinite retry loops |
| RY-05 | Frontend retries = re-issue same Command/Query (PD-4.5); backend must remain safe |

## 6.3 Client-visible retry guidance

| Outcome | Frontend consumption |
|---------|----------------------|
| Transient UNAVAILABLE | META-ERROR + retry intent / `/unavailable` |
| Domain reject | Show safe message; no alternate Golden Path invention |
| Job still running | Status Object / processing presentation — not error |

---

# 7. Timeout / Fallback Policy

## 7.1 Timeout classes

| Class | Applies to | Policy |
|-------|------------|--------|
| TO-EDGE | API Edge request budget | Hard timeout → UNAVAILABLE/cancel work per contract |
| TO-SERVICE | L4 orchestration | Bound outbound Domain/runtime calls |
| TO-DOMAIN | Sync Domain operation | Fail within budget; no infinite wait |
| TO-JOB | Async job overall | Job state machine timeout/expiry per existing autopilot contract |
| TO-STORE | Persistence calls | Fail closed on write timeout |

Exact numeric SLOs are implementation/ops configuration — architecture requires **bounded** timeouts.

## 7.2 Fallback policy

| Situation | Allowed fallback | Forbidden |
|-----------|------------------|-----------|
| Read dependency down | Cached disposable BE cache if fresh **and** marked non-SoT; else error | Invent business Objects |
| Write dependency down | Fail Command | Optimistic durable lie |
| Job runtime down | Reject new jobs; show existing job states if readable | Fake “generated” success |
| Metrics down | Ops view error | Hide integrity failures |
| Auth down | Protected routes fail closed | Open tenant data |

## 7.3 Rules

| Rule | Statement |
|------|-----------|
| TF-01 | Timeouts must not leave unknown partial writes without Domain conflict/idempotency handling |
| TF-02 | Fallback never widens tenant scope |
| TF-03 | Fallback never creates new API families |
| TF-04 | Frontend skeleton/loading is not a backend fallback |

---

# 8. Queue / Job Visibility

## 8.1 Job surface (existing)

| Concern | Existing binding | Domain |
|---------|------------------|--------|
| Start / progress generation | `/api/v80/autopilot/job/run` | M12 (+ supports) |
| Workspace interaction progress | workspace + job NEAREST | M12 / M13 |
| Durable job state | STF-JOB (PD-5.4) | M12 |

## 8.2 Visibility model

```
Command accepted (job created)
  → Persist job state (queued | running | succeeded | failed | cancelled as contracted)
  → Emit LOG-JOB + metrics
  → Query/status via existing job/workspace/tender status surfaces
  → Frontend shows CMP-STATUS-PROCESS / Objects — does not poll invent APIs
```

## 8.3 Job reliability rules

| Rule | Statement |
|------|-----------|
| JB-01 | Sync API must not pretend async job finished early |
| JB-02 | Job failures store safe error codes reachable to authorized callers |
| JB-03 | Duplicate submit follows existing idempotency — no duplicate silent Domain corruption |
| JB-04 | Ops may observe job health via existing metrics/health — not a new job-admin Domain |
| JB-05 | Job visibility is tenant-scoped (PD-5.5) |

---

# 9. Operational Signals

## 9.1 Signal catalogue (existing APIs)

| Signal | Existing API | Consumer |
|--------|--------------|----------|
| Health | `/api/v80/ops/health` | Ops / readiness alignment |
| Metrics | `/api/v80/ops/metrics` | `ViewUsage` support / ops |
| Usage | `/api/enterprise-saas/usage/run` | SCR-09 |
| Governance audit | `/api/v80/ops/governance/audit` | `ViewGovernance` |
| Production integrity | `/api/v80/production/integrity` | Governance support |
| Dashboard | `/api/enterprise-saas/dashboard/run` | `ViewAdminDashboard` |

## 9.2 Alerting architecture (policy)

| Alert class | Trigger idea | Response owner |
|-------------|--------------|----------------|
| ALT-HEALTH | Health failing / not ready | Ops (M13 surfaces) |
| ALT-ERROR-BUDGET | Elevated 5xx/UNAVAILABLE rate | Ops + owning Domain team |
| ALT-AUTH | Auth service failure | M13 |
| ALT-JOB | Job failure spike / queue stuck | M12 |
| ALT-INTEGRITY | Integrity check fail | M13 / M15 governance path |
| ALT-SECURITY | Authz denial anomalies (existing audit) | Security/ops |

Alert routing tooling is implementation; **signals must originate from existing metrics/health/audit/integrity families**.

## 9.3 Rules

| Rule | Statement |
|------|-----------|
| OS-01 | No new alerting API family |
| OS-02 | Alerts must not include secrets |
| OS-03 | Customer Screens are not paging responders |
| OS-04 | Integrity failures are not papered over by FE cache |

---

# 10. Incident / Recovery Boundary

## 10.1 Roles

| Role | Responsibility |
|------|----------------|
| Backend / Domain owners | Restore stores, jobs, auth, APIs; preserve tenant isolation |
| Ops (existing surfaces) | Observe health/metrics/integrity; coordinate |
| Frontend | Show safe errors; allow retry/Sign In/Home; `/unavailable` |
| Product Delivery freeze docs | Not runtime incident runbooks |

## 10.2 Recovery rules

| Rule | Statement |
|------|-----------|
| IR-01 | Recovery must not invent compensatory Domain writes outside mapped Commands |
| IR-02 | Restore from backup preserves Domain ownership and tenant boundaries (PD-5.4) |
| IR-03 | After auth recovery, sessions follow PD-5.5 EXPIRED/re-auth behavior |
| IR-04 | After job runtime recovery, reconcile from STF-JOB state — not FE local guesses |
| IR-05 | Post-incident: prefer refetch Domain SoT over trusting caches |
| IR-06 | Do not create a new “Incident Domain” |

## 10.3 Degraded mode catalogue

| Mode | Allowed | Disallowed |
|------|---------|------------|
| Reads-only (if explicitly configured) | Queries that do not need failed writers | Commands that require failed store |
| Generation-paused | Status + prior artifacts | New Generate success lies |
| Auth-down | Public auth request may fail too | Serving protected tenant data |

---

# 11. Frontend Consumption (boundary reminder)

| Backend outcome | Frontend behavior (existing PD-4) |
|-----------------|-----------------------------------|
| Success DTO | ST-SERVER update |
| Processing/job status | Status presentation |
| UNAVAILABLE | META-ERROR / `/unavailable` |
| Safe error codes | META-ERROR + retry/Sign In |
| Ops metrics/health | SCR-09 only when authorized |

Frontend **does not** define backend SLOs, alert routes, or probe implementations.

---

# 12. Observability Freeze Summary

```
RELIABILITY_OBS_ID     = product-backend-reliability-observability-v1
OWNER                  = Backend
FRONTEND_ROLE          = Consume outcomes only
HEALTH                 = Existing /api/v80/ops/health (+ readiness/liveness semantics)
METRICS                = Existing /api/v80/ops/metrics + usage
AUDIT_INTEGRITY        = Existing governance audit + production integrity
JOBS                   = /api/v80/autopilot/job/run + STF-JOB
RETRY                  = Bounded; idempotent; same Command re-issue
TIMEOUTS               = Bounded TO-* classes
FALLBACK               = Fail closed on writes; no fake Objects
NO_NEW_DOMAIN          = true
NO_NEW_API_FAMILY      = true
SECRET_SAFE_TELEMETRY  = true
```

## Immutable prohibitions

1. No new Domains or API families for monitoring.  
2. No secrets in logs/traces/alerts.  
3. No fake Command success on dependency failure.  
4. No FE-owned reliability policy.  
5. No cross-tenant observability leakage.

---

# 13. Release Gate

## Gate ID

`product-backend-reliability-observability-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| ROB-BOUND | Reliability boundaries | Criticality classes + ownership |
| ROB-HEALTH | Health/readiness/liveness | Probe semantics + existing health surface |
| ROB-TEL | Logging/trace/metrics | Classes + secret-safe rules |
| ROB-RETRY | Error/retry | Retryability matrix + bounded retries |
| ROB-TO | Timeout/fallback | TO-* + fail-closed writes |
| ROB-JOB | Queue/job visibility | Existing job surface + STF-JOB |
| ROB-OPS | Operational signals | Existing health/metrics/usage/audit/integrity |
| ROB-INC | Incident/recovery | Roles + recovery rules |
| ROB-SCOPE | Upstream intact | PD-1…PD-5.5 / M11–M15 unmodified; no new Domains/API families; single new file |

## Verdict

```
PD-5.6 Gate = PASS
  iff ROB-BOUND ∧ ROB-HEALTH ∧ ROB-TEL ∧ ROB-RETRY ∧ ROB-TO
    ∧ ROB-JOB ∧ ROB-OPS ∧ ROB-INC ∧ ROB-SCOPE all PASS
```

---

# 14. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-ROB-01 | Reliability boundaries + health/readiness defined | ✓ |
| AC-ROB-02 | Logging/trace/metrics + error/retry + timeout/fallback defined | ✓ |
| AC-ROB-03 | Job visibility + operational signals + incident/recovery defined | ✓ |
| AC-ROB-04 | Freeze summary + Release Gate present | ✓ |
| AC-ROB-05 | Backend owns reliability/observability; FE consumes outcomes only | ✓ |
| AC-ROB-06 | No new Domains/API families; Markdown only; upstream unmodified | ✓ |

## Verdict

```
PD-5.6 document PASS iff AC-ROB-01 … AC-ROB-06 PASS
```

---

# Document Statement

PD-5.6 Reliability & Observability Architecture locks how the backend stays operable and visible.

```
Health/metrics/audit/integrity via existing ops families
Jobs visible via existing autopilot + STF-JOB
Bounded timeouts; fail closed on writes
Retries idempotent; frontend re-issues same Command
No new Domains / no new API families
```
