# PD-6.1 — Integration Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Integration Architecture

## Version

`product-delivery-pd-6.1-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Baseline |
|--------|----------|
| UI | `product-ui-baseline-v1` |
| Frontend Architecture | `product-frontend-architecture-baseline-v1` |
| Backend Architecture | `product-backend-architecture-baseline-v1` |
| Domains | M11–M15 only |
| APIs | PD-2.4 existing families only |

## Purpose

Define how **frozen frontend** and **frozen backend** integrate end-to-end without inventing Domains, APIs, Screens, or business logic in the UI.

**Reuse only.**  
Frontend consumes APIs.  
Backend owns business logic and enforcement.

---

# 1. Integration Overview

## 1.1 System integration shape

```
┌──────────────────────────────────────────────┐
│ Frontend (PD-4 freeze)                        │
│ Screens → Components → Actions / INT-*        │
│ Adapter maps OBJ-*  ←→  API DTOs              │
└────────────────────┬─────────────────────────┘
                     │ Existing HTTP APIs (PD-2.4 / PD-5.3)
┌────────────────────▼─────────────────────────┐
│ Backend (PD-5 freeze)                         │
│ API Edge → Services → M11–M15 → Persistence   │
└──────────────────────────────────────────────┘
```

## 1.2 Integration principles

1. **Reuse only** — existing Screens, CMP-*, Commands, APIs, Domains.  
2. **One pipeline** — UI → API → Service → Domain → Persistence.  
3. **SoT** — Domain persistence; FE ST-* disposable.  
4. **Ownership split** — FE presentation; BE business logic + authz.  
5. **No new Domains / API families / product surfaces** under this integration.  
6. **Errors propagate** as safe envelopes; FE presents META-ERROR / fallbacks.  
7. **NAV/PREF** may skip HTTP; all Domain-touching paths use existing APIs.

## 1.3 Closed inventories (consumed)

| Inventory | Source |
|-----------|--------|
| SCR-01…09, 26 CMP-*, 25 INT-* | PD-3 / PD-4 |
| ACT-* / Commands | PD-2.3 |
| API families | PD-5.3 / PD-2.4 |
| SVC-* units | PD-5.2 |
| M11–M15 | PD-2.5 / PD-5.1 |

---

# 2. UI → API → Service → Domain

## 2.1 Canonical chain

```
User Interaction (INT-*)
  → Component intent (PD-4.4)
  → Screen Action (ACT-*) (PD-2.3)
  → Command name
  → Frontend Adapter
  → Existing API (PD-2.4 / PD-5.3)
  → API Edge authn/z (PD-5.5)
  → L4 Service (PD-5.2)
  → Primary Domain M11–M15 (+ supports per PD-2.5)
  → Persistence Port (PD-5.4)
  → Response DTO
  → Adapter → OBJ-* / ST-SERVER / ST-META
  → Screen re-render and/or NAV (PD-4.2)
```

## 2.2 Binding Kind at integration seam

| Kind | Integration behavior |
|------|----------------------|
| `API` | Full chain through Domain |
| `API+NAV` | Full chain; FE navigates after success |
| `NEAREST` | Same chain on documented nearest existing route |
| `NAV` / `PREF` | FE-only; no Domain HTTP |

## 2.3 Layer handoff rules

| From → To | May pass | Must not |
|-----------|----------|----------|
| UI → API | Opaque ids, drafts, auth session credential (existing mechanism) | Domain modules, policy engines |
| API → Service | Principal/tenant context + Command/Query | UI routes / CMP trees |
| Service → Domain | Domain operation inputs | Fake success without Domain accept |
| Domain → Persistence | Owner-scoped writes/reads | Cross-tenant silent access |
| API → UI | DTO / safe errors | Stack traces, secrets |

---

# 3. Read / Command Flow

## 3.1 Read (Query) flow

```
Screen enter / invalidate / retry
  → FE META-LOADING
  → Adapter GET/observe existing read API
  → Service Query handler
  → Domain read (no business mutation)
  → DTO → ST-SERVER (+ ST-DERIVED)
  → Ready | Empty | Error (ST-META)
```

| Rule | Statement |
|------|-----------|
| R-01 | Reads use existing APIs only |
| R-02 | Queries must not mutate Domain state |
| R-03 | Empty list = success + META-EMPTY — not fabricated Objects |
| R-04 | Cache hits still Domain-backed snapshots (disposable) |

## 3.2 Command flow

```
INT-* → ACT-* → Command
  → FE META-LOADING (command-scoped)
  → Adapter invokes existing Command API
  → Authn/z gate
  → Service Command handler
  → Primary Domain (+ mapped supports)
  → Persist if accepted
  → DTO / ack
  → FE invalidate ST-SERVER as needed
  → If API+NAV: FE allowed edge only
```

| Rule | Statement |
|------|-----------|
| C-01 | Commands authorized before mutation |
| C-02 | Success = Domain-accepted outcome |
| C-03 | Draft ST-LOCAL becomes payload only at issue time |
| C-04 | No optimistic Domain write in FE |
| C-05 | Idempotent re-issue follows existing contracts (PD-5.6) |

## 3.3 Screen → integration bias (summary)

| Screen | Dominant reads | Dominant commands |
|--------|----------------|-------------------|
| SCR-01 | auth me | SignIn |
| SCR-02/03 | status/resume | planning/tender intake |
| SCR-04 | workspace/context | agent/generate/opportunity |
| SCR-05/06 | result artifacts | download/share/budget continue |
| SCR-07/08 | projects/docs | continue/download/share |
| SCR-09 | ops areas | ops observe (existing) |

Exact rows remain PD-2.4 / PD-2.5.

---

# 4. Ownership

## 4.1 Ownership matrix

| Concern | Owner | Consumer |
|---------|-------|----------|
| Screens / CMP / INT / routes | Frontend (PD-4) | Users |
| ST-LOCAL / META / presentation cache | Frontend | — |
| API wire contracts | Existing API (PD-5.3) | FE Adapter + Services |
| Command/Query orchestration | Services (PD-5.2) | API Edge |
| Business logic / authz outcomes | Domains M11–M15 | Services |
| Durable entities | Domain persistence (PD-5.4) | Domains |
| Session mint / enforce | Backend M13 / FAM-AUTH | FE observes |
| Reliability / deploy | Backend (PD-5.6 / PD-5.7) | FE consumes uptime outcomes |

## 4.2 Ownership rules

| Rule | Statement |
|------|-----------|
| O-01 | FE never imports Domain modules |
| O-02 | BE never owns UI catalogues |
| O-03 | Services are not Domains |
| O-04 | Integration adds no M16 / no new API family |
| O-05 | Primary Domain per Command remains PD-2.5 |

---

# 5. Error Propagation

## 5.1 Propagation path

```
Domain / runtime / auth failure
  → Service maps to error class (PD-5.2 / PD-5.5)
  → API Edge returns safe envelope (PD-5.3)
  → FE Adapter maps → ST-META (META-ERROR) and/or session clear
  → User: retry same Command/read | Sign In | safe NAV | /unavailable
```

## 5.2 Class → FE consumption

| Backend class | FE behavior |
|---------------|-------------|
| `UNAUTH` / `EXPIRED` | Clear SES-*; Sign In path; guarded routes → `/` |
| `FORBIDDEN` | META-ERROR; Admin → `/` if on ops |
| `VALIDATION` | Field/contract message; no ST-SERVER lie |
| `DOMAIN_REJECT` | Safe message; no alternate Golden Path |
| `NOT_FOUND` | Empty/not-found presentation |
| `UNAVAILABLE` | META-ERROR and/or `/unavailable` |
| Job still running | Status presentation — not error |

## 5.3 Propagation rules

| Rule | Statement |
|------|-----------|
| E-01 | No fake success DTO on Domain reject |
| E-02 | No secrets/stack traces to FE |
| E-03 | FE does not invent new Domain workflows on error |
| E-04 | Retry = same Command/Query after fix/re-auth |
| E-05 | Partial ops area failures stay per-area when contracted |

---

# 6. Release Gate

## Gate ID

`product-integration-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| INTG-OVER | Overview | UI↔BE shape + reuse principles |
| INTG-CHAIN | UI→API→Service→Domain | Canonical chain + handoff rules |
| INTG-CQ | Read/Command | Query + Command flows + rules |
| INTG-OWN | Ownership | Matrix + O-01…O-05 |
| INTG-ERR | Error propagation | Path + class map + E-01…E-05 |
| INTG-SCOPE | Reuse only / upstream intact | No new Domains/APIs/surfaces; PD-1…PD-5.8 / M11–M15 unmodified; single new file |

## Verdict

```
PD-6.1 Gate = PASS
  iff INTG-OVER ∧ INTG-CHAIN ∧ INTG-CQ ∧ INTG-OWN ∧ INTG-ERR ∧ INTG-SCOPE all PASS
```

---

# 7. Freeze Summary

```
INTEGRATION_ARCH_ID    = product-integration-architecture-v1
FE_BASELINE_REF        = product-frontend-architecture-baseline-v1
BE_BASELINE_REF        = product-backend-architecture-baseline-v1
PIPELINE               = UI → API → Service → Domain → Persistence
READ_FLOW              = defined
COMMAND_FLOW           = defined
OWNERSHIP              = FE presentation; BE logic/enforcement
ERROR_PROPAGATION      = safe envelope → ST-META / fallbacks
REUSE_ONLY             = true
NO_NEW_DOMAIN          = true
NO_NEW_API_FAMILY      = true
NO_NEW_SURFACE         = true
```

## Immutable statements

1. Integration reuses frozen FE + BE baselines only.  
2. No new Domains, API families, or product Screens under this doc.  
3. Domain is SoT; FE cache is not.  
4. Errors fail closed on writes; FE only presents outcomes.  
5. Upstream PD-1…PD-5.8 and M11–M15 unmodified by this task.

## Handoff

```
UI + Frontend + Backend baselines = Frozen
Integration Architecture (PD-6.1) = Defined
Implementation integrates along this pipeline only
```

---

# 8. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-INTG-01 | Integration overview defined | ✓ |
| AC-INTG-02 | UI→API→Service→Domain chain defined | ✓ |
| AC-INTG-03 | Read/Command flows defined | ✓ |
| AC-INTG-04 | Ownership + error propagation defined | ✓ |
| AC-INTG-05 | Release Gate + Freeze summary present | ✓ |
| AC-INTG-06 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.1 document PASS iff AC-INTG-01 … AC-INTG-06 PASS
```

---

# Document Statement

PD-6.1 Integration Architecture locks the end-to-end seam between frozen frontend and backend.

```
UI → API → Service → Domain → Persistence
Reuse only · Domain SoT · FE consumes outcomes
No new Domains / APIs / surfaces
```
