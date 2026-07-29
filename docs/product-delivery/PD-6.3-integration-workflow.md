# PD-6.3 — Integration Workflow

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Integration Workflow

## Version

`product-delivery-pd-6.3-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-6.1 / PD-6.2 | Integration pipeline + contracts |
| PD-2.3 / PD-2.4 / PD-2.5 | Actions, APIs, Domains |
| PD-2.6 / PD-3.8 | Golden Paths / UI freeze |
| PD-4 / PD-5 freezes | FE / BE baselines |
| PD-5.6 | Jobs, retry, UNAVAILABLE |

## Purpose

Define **integration workflows**: how user journeys become read/command/async paths across the frozen UI → API → Service → Domain chain, including failure and recovery.

**Reuse only.** No new Domains, APIs, Screens, or Golden Paths.

---

# 1. Workflow Overview

## 1.1 Workflow kinds

| Workflow ID | Kind | Meaning |
|-------------|------|---------|
| WF-READ | Sync read | Query existing API → Domain read → ST-SERVER |
| WF-COMMAND | Sync command | Mutating/side-effect Command → Domain accept |
| WF-ASYNC | Async job | Command starts job; status via existing job/status surfaces |
| WF-NAV | Client nav | `NAV` / `API+NAV` edge after success |
| WF-FAIL | Failure | Typed error propagation |
| WF-RECOVER | Recovery | Re-auth, retry, safe NAV, job reconcile |

## 1.2 Canonical engine (all HTTP workflows)

```
Intent (INT-*) → Action (ACT-*) → Command/Query
  → Adapter → Existing API → Service → Domain → Persistence
  → DTO | Error | Job status
  → ST-* / NAV / META-*
```

## 1.3 Workflow principles

1. **Reuse only** — PD-2.3 Commands + PD-2.4 bindings + M11–M15.  
2. **One primary Domain** per Command (PD-2.5).  
3. **Async does not fake sync success** (PD-5.6).  
4. **Failure fail-closed on writes**.  
5. **Recovery re-issues the same Command/Query** (or re-auths then same).  
6. **FE presents; BE decides.**  
7. **NAV is FE-owned** after contract success.

---

# 2. User Journey → Integration Flow

## 2.1 Mapping rule

```
Golden Path (GP-*)
  → Screen sequence (SCR-*)
  → User Actions (ACT-*)
  → Integration workflow kind (WF-*)
  → Existing API + Domain
```

## 2.2 Golden Path integration map

| Path | Screen chain | Dominant WF kinds |
|------|--------------|-------------------|
| GP-01 | SCR-01→02→04→05→06→08 | WF-COMMAND (plan/generate) + WF-READ (results/docs) + WF-ASYNC (agent/job where used) + WF-NAV |
| GP-01R | SCR-01→07→04 | WF-READ (list) + WF-COMMAND/NAV (continue) |
| GP-02 | SCR-01→03→04→05→08 | WF-COMMAND (upload/confirm/generate) + WF-ASYNC (processing/pack) + WF-READ |
| GP-03 | SCR-01→04→05→06→08 | WF-COMMAND (opportunity/share) + WF-READ + WF-NAV |
| GP-04 | SCR-09 | WF-READ (ops) |

## 2.3 Journey step template

| Step field | Content |
|------------|---------|
| Screen | SCR-* |
| Intent | INT-* |
| Action / Command | ACT-* / Command name |
| Workflow | WF-READ \| COMMAND \| ASYNC \| NAV |
| API family | Existing FAM-* only |
| Primary Domain | M11–M15 |
| Success next | Re-render and/or allowed NAV edge |
| Failure next | WF-FAIL → WF-RECOVER |

## 2.4 Journey rules

| Rule | Statement |
|------|-----------|
| JY-01 | No journey step may invent APIs/Domains |
| JY-02 | Screen order follows frozen Golden Paths |
| JY-03 | `API+NAV` success still runs Domain before FE NAV |

---

# 3. Read Workflow

## 3.1 Steps

```
1. Trigger: Screen enter | cache miss | invalidate | user retry
2. FE: META-LOADING = loading
3. Adapter: Query existing read API (Kind API / NEAREST)
4. Edge: authn/z when required
5. Service: Query handler
6. Domain: read capability (no mutation)
7. Persistence: owner-scoped read
8a. Success: DTO → ST-SERVER → Ready
8b. Empty: META-EMPTY + guidance (allowed routes only)
8c. Failure: WF-FAIL
9. FE: clear loading; render CMP-*
```

## 3.2 Typical reads

| Command / observe | Screen bias | Domain |
|-------------------|-------------|--------|
| `/api/auth/me` | SCR-01+ | M13 |
| `ListProjects` / `OpenMyProjects` | SCR-07 / 01 | M13 |
| `ViewProjectContext` | SCR-04 | M13 |
| `ViewProcessingStatus` | SCR-03 | M11 |
| `BrowseDocumentCategories` / `OpenDocuments` | SCR-08 | M11 |
| `ReviewSolution` / `ReviewBudget` / proposal review | SCR-05/06 | M14 (+ M11 artifacts) |
| Admin views | SCR-09 | M13 (+ M15 governance) |

## 3.3 Read rules

| Rule | Statement |
|------|-----------|
| RD-01 | No business writes |
| RD-02 | Prefer valid ST-SERVER cache; else fetch (PD-4.3/4.7) |
| RD-03 | Empty ≠ error |
| RD-04 | Do not fabricate Objects while loading |

---

# 4. Command Workflow

## 4.1 Steps

```
1. Trigger: INT-* on Screen
2. FE: optional presentation validation only
3. FE: META-LOADING (command-scoped); disable double-submit
4. Adapter: Command → existing API (API / API+NAV / NEAREST)
5. Edge: authn/z
6. Service: Command handler
7. Domain: primary (+ mapped supports)
8. Persistence: owner writes if accepted
9a. Success: DTO/ack → invalidate caches → render
9b. If API+NAV: FE navigates allowed edge
9c. Failure: WF-FAIL (no optimistic Domain)
```

## 4.2 Typical commands

| Command | WF note | Domain |
|---------|---------|--------|
| `SignIn` | Session establish | M13 |
| `StartPlanning` / `SubmitPlanningInputs` | Sync command | M12 / M14 |
| `UploadTenderDocument` / `ConfirmRequirements` | Sync (+ may lead async status) | M11 |
| `CaptureOpportunity` | Sync | M14 |
| `Download*` / `Share*` | Side-effect / token | M11 / M15 |
| `ContinueToBudget` / `OpenBudgetResult` | Per existing calc semantics | M14 |

## 4.3 Command rules

| Rule | Statement |
|------|-----------|
| CM-01 | Draft ST-LOCAL joins payload only at issue |
| CM-02 | Success requires Domain accept |
| CM-03 | FE never commits Domain state locally |
| CM-04 | Idempotent retry only per existing contract |
| CM-05 | NAV after success does not replace required API |

---

# 5. Async Workflow

## 5.1 When async applies

Long-running generation/processing bound to existing job/status surfaces, especially:

- `/api/v80/autopilot/job/run` (M12)
- Tender processing status surfaces (M11)
- Workspace progress NEAREST bindings

## 5.2 Steps

```
1. User Command accepted (e.g. GenerateTenderPackage / upload pipeline)
2. Domain/runtime creates/updates job (STF-JOB) — sync ack: accepted/queued/running
3. FE shows processing status (CMP-STATUS-PROCESS / Objects) — NOT final success Objects invented
4. Poll/refresh via existing status/job/workspace read APIs only (WF-READ)
5a. Job succeeded → subsequent WF-READ for results/artifacts
5b. Job failed → WF-FAIL with safe job error code
5c. Still running → stay in processing presentation
```

## 5.3 Async rules

| Rule | Statement |
|------|-----------|
| AS-01 | Sync HTTP must not claim generation complete early |
| AS-02 | No new job-admin API family |
| AS-03 | Status reads are Queries; they do not mutate |
| AS-04 | Job visibility is tenant-scoped |
| AS-05 | FE must not invent progress percentages Domains did not return |

---

# 6. Failure Workflow

## 6.1 Steps

```
1. Failure detected (auth / validation / Domain / dependency / job fail)
2. Classify per PD-6.2 error contract
3. Ensure no unauthorized business write remains open (fail closed)
4. API returns safe envelope
5. Adapter → META-ERROR (± clear SES-* on UNAUTH/EXPIRED)
6. FE presents message + recovery affordances
7. Enter WF-RECOVER (user or automatic bounded retry where allowed)
```

## 6.2 Class → immediate FE effect

| Class | Immediate effect |
|-------|------------------|
| `UNAUTH` / `EXPIRED` | Session presentation cleared; Sign In |
| `FORBIDDEN` | Denial; leave Admin if needed |
| `VALIDATION` | Stay on Screen; fix inputs |
| `DOMAIN_REJECT` | Stay; safe message |
| `NOT_FOUND` | Empty/not-found |
| `UNAVAILABLE` | Retry and/or `/unavailable` |
| Job failed | Processing → error state on status region |

## 6.3 Failure rules

| Rule | Statement |
|------|-----------|
| FL-01 | No fake success DTO |
| FL-02 | No new Golden Path on error |
| FL-03 | No secrets/stacks to user |
| FL-04 | Partial ops failures stay per-area when contracted |

---

# 7. Recovery Workflow

## 7.1 Recovery catalogue

| Recovery ID | Trigger | Steps |
|-------------|---------|-------|
| RC-REAUTH | UNAUTH/EXPIRED | SignIn → refresh SES-* → re-issue **same** Command/Query if user retries |
| RC-RETRY | Transient UNAVAILABLE / retryable | Bounded backoff; same Command/Query; stop then `/unavailable` or message |
| RC-FIXINPUT | VALIDATION | User edits ST-LOCAL → re-issue Command |
| RC-SAFE-NAV | Context missing / soft deny | Allowed edges only (`/`, `/projects`, …) |
| RC-REFETCH | Stale after success elsewhere | WF-READ refresh |
| RC-JOB-WAIT | Async still running | Continue status reads |
| RC-JOB-RECONCILE | After deploy/incident | Trust STF-JOB / Domain status — not FE local guess (PD-5.6/5.7) |

## 7.2 Recovery steps (generic)

```
1. Classify failure
2. Select Recovery ID
3. Perform precondition (re-auth / fix / wait)
4. Re-enter WF-READ or WF-COMMAND or continue WF-ASYNC status
5. On repeated hard failure: stop; safe NAV / support via existing ops — no Domain invention
```

## 7.3 Recovery rules

| Rule | Statement |
|------|-----------|
| RC-01 | Recovery never remaps Command to a different Domain “that might work” |
| RC-02 | Re-auth does not auto-fire mutating Commands without user intent |
| RC-03 | Rollback of deploy ≠ user recovery workflow (ops-owned) |
| RC-04 | Cache discard + refetch preferred over inventing values |
| RC-05 | Share/download token expiry → re-issue existing share/download Command |

---

# 8. End-to-End Workflow Examples (reuse)

## 8.1 GP-01 fragment — planning to workspace

```
SCR-02 SubmitPlanningInputs → WF-COMMAND (M14)
  → success → ContinueToWorkspace → WF-NAV
SCR-04 enter → WF-READ workspace/context
  → optional Generate / Interact → WF-COMMAND and/or WF-ASYNC (M12)
```

## 8.2 GP-02 fragment — tender upload

```
SCR-03 UploadTenderDocument → WF-COMMAND (M11)
  → ViewProcessingStatus → WF-READ / WF-ASYNC status
  → Proceed/Confirm → WF-COMMAND (+ NAV to SCR-04)
  → GenerateTenderPackage → WF-ASYNC (M12)
```

## 8.3 Failure → recovery fragment

```
Command → FORBIDDEN → WF-FAIL → RC-SAFE-NAV or stay with message
Command → EXPIRED → WF-FAIL → RC-REAUTH → user retry same Command
Job running → WF-ASYNC → RC-JOB-WAIT → WF-READ status
```

---

# 9. Release Gate

## Gate ID

`product-integration-workflow-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| IWF-OVER | Workflow overview | WF kinds + engine + principles |
| IWF-JOURNEY | User journey map | GP-* → SCR → WF kinds |
| IWF-READ | Read workflow | Steps + rules |
| IWF-CMD | Command workflow | Steps + rules |
| IWF-ASYNC | Async workflow | Job/status steps + rules |
| IWF-FAIL | Failure workflow | Classification + FE effects |
| IWF-REC | Recovery workflow | RC-* catalogue + rules |
| IWF-SCOPE | Reuse only / upstream intact | No new Domains/APIs/paths; PD-1…PD-6.2 / M11–M15 unmodified; single new file |

## Verdict

```
PD-6.3 Gate = PASS
  iff IWF-OVER ∧ IWF-JOURNEY ∧ IWF-READ ∧ IWF-CMD
    ∧ IWF-ASYNC ∧ IWF-FAIL ∧ IWF-REC ∧ IWF-SCOPE all PASS
```

---

# 10. Freeze Summary

```
INTEGRATION_WORKFLOW_ID = product-integration-workflow-v1
INTEGRATION_ARCH_REF    = product-integration-architecture-v1
CONTRACTS_REF           = product-integration-contracts-v1
WORKFLOWS               = READ | COMMAND | ASYNC | NAV | FAIL | RECOVER
GOLDEN_PATHS            = GP-01 | GP-01R | GP-02 | GP-03 | GP-04
ASYNC_SURFACE           = existing job/status APIs only
RECOVERY                = REAUTH | RETRY | FIXINPUT | SAFE-NAV | REFETCH | JOB-WAIT | JOB-RECONCILE
REUSE_ONLY              = true
NO_NEW_DOMAIN           = true
NO_NEW_API_FAMILY       = true
NO_NEW_JOURNEY          = true
```

## Immutable statements

1. Workflows reuse frozen Golden Paths and bindings only.  
2. Async completion is Domain/job-authoritative.  
3. Failure is typed and fail-closed on writes.  
4. Recovery reuses the same Commands/Queries.  
5. Upstream PD-1…PD-6.2 and M11–M15 unmodified by this task.

---

# 11. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-IWF-01 | Workflow overview + journey mapping defined | ✓ |
| AC-IWF-02 | Read + Command + Async workflows defined | ✓ |
| AC-IWF-03 | Failure + Recovery workflows defined | ✓ |
| AC-IWF-04 | Release Gate + Freeze summary present | ✓ |
| AC-IWF-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.3 document PASS iff AC-IWF-01 … AC-IWF-05 PASS
```

---

# Document Statement

PD-6.3 Integration Workflow locks how journeys run on the frozen integration chain.

```
Journey → Read | Command | Async | Nav
Failure → typed envelope → Recovery (same Command / re-auth / safe NAV)
Reuse only · No new Domains/APIs/paths
```
