# PD-6.8 — Integration Freeze

## Status

**Frozen**

## Type

Product Delivery — Integration Freeze

## Version

`product-delivery-pd-6.8-v1`

## Baseline ID

`product-integration-baseline-v1`

## Freeze ID

`product-integration-freeze-1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

| Source | Role |
|--------|------|
| PD-1 … PD-2.x | Product Planning (read-only) |
| PD-3.1 … PD-3.8 | UI baseline `product-ui-baseline-v1` |
| PD-4.1 … PD-4.8 | Frontend baseline `product-frontend-architecture-baseline-v1` |
| PD-5.1 … PD-5.8 | Backend baseline `product-backend-architecture-baseline-v1` |
| PD-6.1 … PD-6.7 | Integration deliverables to freeze |
| M11–M15 | Existing Domains (unmodified) |

## Purpose

Freeze the complete **PD-6 Integration baseline**.

After this freeze:

- PD-6.1 … PD-6.7 are immutable without an explicit Product Delivery revision,
- implementation must integrate FE ↔ BE along this baseline only,
- no new Domains, API families, product Screens, or Golden Paths under this freeze,
- frontend consumes APIs; backend owns business logic and enforcement,
- **reuse only**.

This document **freezes existing deliverables only**. It adds no product surfaces and no implementation code.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Baseline ID / Freeze ID | Lock tags |
| Deliverables | PD-6.1 … PD-6.7 (+ this lock) |
| Dependency chain | Planning → UI → FE → BE → Integration |
| Traceability matrix | Integration concerns ↔ deliverables |
| Immutable scope | What must not change |
| Release Gate | PASS/FAIL for integration baseline |
| Verification checklist | Inventory integrity |
| Rollback snapshot | Restore set |
| Freeze summary | Handoff lock |

## Out of scope

| Item | Reason |
|------|--------|
| New Domains / APIs / Screens / journeys | Freeze only |
| Runtime implementation | Freeze record only |
| Modification of PD-1…PD-6.7 or M11–M15 | Forbidden |
| Additional files | Task constraint |

## Freeze principles

1. Freeze existing PD-6.1 … PD-6.7 deliverables only.  
2. Reuse frozen UI / FE / BE / Domain / API inventories only.  
3. No new Domains, API families, storage families, or product surfaces.  
4. Integration seam = UI → API → Service → Domain → Persistence.  
5. Markdown freeze record only — no implementation artifacts.  
6. Upstream Planning / UI / FE / BE freezes remain unmodified.  
7. Domains M11–M15 remain unmodified.

---

# 2. Frozen Deliverables

| Order | Document | Path | Version | Sub-baseline ID | Gate ID |
|-------|----------|------|---------|-----------------|---------|
| 1 | PD-6.1 Integration Architecture | `docs/product-delivery/PD-6.1-integration-architecture.md` | `product-delivery-pd-6.1-v1` | `product-integration-architecture-v1` | `product-integration-architecture-gate` |
| 2 | PD-6.2 Integration Contracts | `docs/product-delivery/PD-6.2-integration-contracts.md` | `product-delivery-pd-6.2-v1` | `product-integration-contracts-v1` | `product-integration-contracts-gate` |
| 3 | PD-6.3 Integration Workflow | `docs/product-delivery/PD-6.3-integration-workflow.md` | `product-delivery-pd-6.3-v1` | `product-integration-workflow-v1` | `product-integration-workflow-gate` |
| 4 | PD-6.4 Integration Security | `docs/product-delivery/PD-6.4-integration-security.md` | `product-delivery-pd-6.4-v1` | `product-integration-security-v1` | `product-integration-security-gate` |
| 5 | PD-6.5 Integration Reliability | `docs/product-delivery/PD-6.5-integration-reliability.md` | `product-delivery-pd-6.5-v1` | `product-integration-reliability-v1` | `product-integration-reliability-gate` |
| 6 | PD-6.6 Integration Validation | `docs/product-delivery/PD-6.6-integration-validation.md` | `product-delivery-pd-6.6-v1` | `product-integration-validation-v1` | `product-integration-validation-gate` |
| 7 | PD-6.7 Integration Readiness | `docs/product-delivery/PD-6.7-integration-readiness.md` | `product-delivery-pd-6.7-v1` | `product-integration-readiness-v1` | `product-integration-readiness-gate` |
| 8 | PD-6.8 Integration Freeze (this document) | `docs/product-delivery/PD-6.8-integration-freeze.md` | `product-delivery-pd-6.8-v1` | — | `product-integration-baseline-gate` |

## Locked inventory (consumed)

| Inventory | Locked value | Source |
|-----------|--------------|--------|
| Pipeline | UI → API → Service → Domain → Persistence | PD-6.1 |
| Contracts | C0…C7 | PD-6.2 |
| Workflows | READ \| COMMAND \| ASYNC \| NAV \| FAIL \| RECOVER | PD-6.3 |
| Golden Paths | GP-01 \| GP-01R \| GP-02 \| GP-03 \| GP-04 | PD-3.8 / PD-6.3 |
| Trust | Browser untrusted → Edge gate → trusted Domains | PD-6.4 |
| Reliability | Bounded retry/timeout; existing jobs | PD-6.5 |
| Validation | AC-REL-* for promote | PD-6.6 |
| Readiness | READY_STAGING / READY_PROD | PD-6.7 |
| Domains | M11–M15 only | PD-2.5 / PD-5 |
| API families | Closed set (PD-5.3) | PD-5.3 / PD-6.2 |
| FE baseline | `product-frontend-architecture-baseline-v1` | PD-4.8 |
| BE baseline | `product-backend-architecture-baseline-v1` | PD-5.8 |
| UI baseline | `product-ui-baseline-v1` | PD-3.8 |

## Immutable tags

```
INT_BASELINE_ID      = product-integration-baseline-v1
INT_FREEZE_ID        = product-integration-freeze-1
INT_FREEZE_VERSION   = product-delivery-pd-6.8-v1
INT_FE_BASELINE_REF  = product-frontend-architecture-baseline-v1
INT_BE_BASELINE_REF  = product-backend-architecture-baseline-v1
INT_UI_BASELINE_REF  = product-ui-baseline-v1
INT_SIGNOFF          = product-integration-signoff-1
REUSE_ONLY           = true
NO_NEW_DOMAIN        = true
NO_NEW_API_FAMILY    = true
NO_NEW_SURFACE       = true
NO_NEW_JOURNEY       = true
```

---

# 3. Dependency Chain

## 3.1 Upstream (read-only)

```
PD-1 Product Blueprint
  ↓
PD-2.1 … PD-2.6
  ↓
PD-3.1 … PD-3.8   (product-ui-baseline-v1)
  ↓
PD-4.1 … PD-4.8   (product-frontend-architecture-baseline-v1)
  ↓
PD-5.1 … PD-5.8   (product-backend-architecture-baseline-v1)
  ↓
M11–M15 Domains   (existing only)
```

## 3.2 Integration chain (frozen)

```
PD-6.1 Integration Architecture
  ↓
PD-6.2 Integration Contracts
  ↓
PD-6.3 Integration Workflow
  ↓
PD-6.4 Integration Security
  ↓
PD-6.5 Integration Reliability
  ↓
PD-6.6 Integration Validation
  ↓
PD-6.7 Integration Readiness
  ↓
PD-6.8 Integration Freeze   ← this lock
```

## 3.3 Soft references (must remain intact)

| Reference | Required value |
|-----------|----------------|
| Domains | M11–M15 only |
| API bindings | PD-2.4 / closed FAM-* only |
| Screens / CMP / INT | UI freeze catalogues only |
| Golden Paths | GP-01 … GP-04 only |
| FE role | Presentation; consumes APIs |
| BE role | Business logic + enforcement |
| Services are Domains | false |

---

# 4. Traceability Matrix

## 4.1 Concern → deliverable

| Concern | Frozen content | Document |
|---------|----------------|----------|
| End-to-end seam | UI→API→Service→Domain; ownership; errors | PD-6.1 |
| Seam guarantees | C0…C7; CQ; compatibility | PD-6.2 |
| Journey execution | WF-*; GP-* maps; async/fail/recover | PD-6.3 |
| Trust / authz | Boundaries; session; tenant; secure data | PD-6.4 |
| Resilience | Retry; timeout; idempotency; async coord | PD-6.5 |
| Proof before release | Contract/API/data/flow/GP validation | PD-6.6 |
| Promote / go-live | RDY-*; READY_STAGING / READY_PROD | PD-6.7 |
| Freeze lock | Baseline + gate + rollback | PD-6.8 |

## 4.2 Pipeline traceability (locked)

```
INT-* / ACT-* (PD-2.3 / PD-3 / PD-4)
  → Adapter (PD-4 / PD-6.1)
  → Existing API (PD-2.4 / PD-5.3 / PD-6.2)
  → Service (PD-5.2)
  → M11–M15 (PD-2.5 / PD-5.1)
  → Persistence (PD-5.4)
  ← Authz (PD-5.5 / PD-6.4)
  ← Reliability (PD-5.6 / PD-6.5)
  ← Validated (PD-6.6) → Ready (PD-6.7) → Deploy (PD-5.7)
```

## 4.3 Integrity rules (locked)

| Rule | Statement |
|------|-----------|
| T-01 | Every Domain-touching path uses existing PD-2.4 bindings |
| T-02 | Every Command has one primary Domain in M11–M15 |
| T-03 | Queries do not mutate; Commands require Domain accept |
| T-04 | FE never imports Domains; BE never owns UI catalogues |
| T-05 | Tenant isolation is hard; fail closed on UNAUTH/FORBIDDEN/EXPIRED writes |
| T-06 | Async completion is job/Domain-authoritative |
| T-07 | Promote requires AC-REL-*; go-live requires READY_PROD |
| T-08 | No new Domains / API families / Screens / journeys under this freeze |

---

# 5. Immutable Scope

## Must not change under this freeze

1. PD-6.1 … PD-6.7 meanings and locked inventories.  
2. Integration pipeline UI → API → Service → Domain → Persistence.  
3. Contract stack C0…C7 and closed API families.  
4. Workflow kinds and Golden Path screen chains.  
5. Trust boundary and Domain-authoritative authz.  
6. Bounded retry/timeout and existing job surfaces.  
7. Validation AC-REL-* and readiness formulas.  
8. Consumed FE / BE / UI / Domain baselines.

## Must not be introduced under this freeze

| Forbidden addition | Reason |
|--------------------|--------|
| New Domains (M16+) | Freeze |
| New API families / generations | Freeze |
| New Screens / CMP / INT / LAY / Features | UI freeze |
| New Golden Paths or journey Screens | Freeze |
| FE business logic / FE authz engine | Ownership split |
| Shadow Domain / write-through FE SoT | Data ownership |
| Validation-only or readiness-only product APIs | Reuse only |

## Allowed after freeze (implementation only)

- Code that **implements** PD-6.1…PD-6.7 without changing contracts.  
- Env config/secret injection and deploy of existing ART-*.  
- Verification scripts that assert this baseline (not required by this freeze doc itself).

---

# 6. Release Gate

## Gate ID

`product-integration-baseline-gate`

## Checks

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| INTFZ-ID | Baseline/Freeze IDs locked | `INT_BASELINE_ID = product-integration-baseline-v1` ∧ `INT_FREEZE_ID = product-integration-freeze-1` |
| INTFZ-CHAIN | PD-6.1→6.7 chain intact | All seven deliverables present at frozen versions in §2 |
| INTFZ-UPSTREAM | Upstream intact | PD-1…PD-5.8 / M11–M15 unmodified; FE/BE/UI baseline refs intact |
| INTFZ-TRACE | Traceability complete | Concern matrix + pipeline + integrity rules present |
| INTFZ-SCOPE | Immutable scope | Reuse only; no new Domains/APIs/surfaces/journeys |
| INTFZ-CHILD | Child gates referenced | All PD-6.1…6.7 gate IDs listed |
| INTFZ-ROLL | Rollback defined | Snapshot ID + restore paths present |

## Child gate references (must remain PASS conceptually)

| Child | Gate ID |
|-------|---------|
| PD-6.1 | `product-integration-architecture-gate` |
| PD-6.2 | `product-integration-contracts-gate` |
| PD-6.3 | `product-integration-workflow-gate` |
| PD-6.4 | `product-integration-security-gate` |
| PD-6.5 | `product-integration-reliability-gate` |
| PD-6.6 | `product-integration-validation-gate` |
| PD-6.7 | `product-integration-readiness-gate` |

## Verdict formula

```
Integration Freeze Gate = PASS
  iff INTFZ-ID ∧ INTFZ-CHAIN ∧ INTFZ-UPSTREAM ∧ INTFZ-TRACE
    ∧ INTFZ-SCOPE ∧ INTFZ-CHILD ∧ INTFZ-ROLL all PASS
```

## Signoff

```
signoff = product-integration-signoff-1
result  = PASS | FAIL
```

---

# 7. Verification Checklist

Manual / planning verification only (no implementation scripts required by this freeze).

| # | Check | Expected |
|---|-------|----------|
| V-01 | `PD-6.1-integration-architecture.md` exists | Present |
| V-02 | `PD-6.2-integration-contracts.md` exists | Present |
| V-03 | `PD-6.3-integration-workflow.md` exists | Present |
| V-04 | `PD-6.4-integration-security.md` exists | Present |
| V-05 | `PD-6.5-integration-reliability.md` exists | Present |
| V-06 | `PD-6.6-integration-validation.md` exists | Present |
| V-07 | `PD-6.7-integration-readiness.md` exists | Present |
| V-08 | Versions match §2 table | Match |
| V-09 | Sub-baseline IDs match §2 | Match |
| V-10 | Pipeline UI→API→Service→Domain present | Present |
| V-11 | Contracts C0…C7 referenced | Present |
| V-12 | WF-* and GP-* locked | Present |
| V-13 | Security trust boundary + tenant hard isolation | Present |
| V-14 | Reliability bounded retry/timeout + existing jobs | Present |
| V-15 | AC-REL-* / READY_STAGING / READY_PROD present | Present |
| V-16 | Baseline ID + Freeze ID match immutable tags | Match |
| V-17 | No modification of PD-1…PD-6.7 / M11–M15 in this task | Intact |
| V-18 | This freeze adds no implementation / new surfaces | Markdown only |

**Verification PASS** iff V-01 … V-18 all PASS.

---

# 8. Rollback Snapshot

## Snapshot

| Field | Value |
|-------|-------|
| Snapshot ID | `product-integration-rollback-1` |
| Baseline ID | `product-integration-baseline-v1` |
| Freeze ID | `product-integration-freeze-1` |
| Restore Base | `product-delivery-pd-6.7-v1` |
| FE baseline ref | `product-frontend-architecture-baseline-v1` |
| BE baseline ref | `product-backend-architecture-baseline-v1` |
| UI baseline ref | `product-ui-baseline-v1` |
| Read-only | true |

## Restore set (paths)

1. `docs/product-delivery/PD-6.1-integration-architecture.md`  
2. `docs/product-delivery/PD-6.2-integration-contracts.md`  
3. `docs/product-delivery/PD-6.3-integration-workflow.md`  
4. `docs/product-delivery/PD-6.4-integration-security.md`  
5. `docs/product-delivery/PD-6.5-integration-reliability.md`  
6. `docs/product-delivery/PD-6.6-integration-validation.md`  
7. `docs/product-delivery/PD-6.7-integration-readiness.md`  
8. `docs/product-delivery/PD-6.8-integration-freeze.md`  

## Rollback rule

To roll back Integration to this baseline:

- restore the eight paths above to the freeze versions listed in §2,
- do not invent replacement Domains/APIs/Screens/journeys,
- do not “fix forward” by adding product surfaces under this freeze ID,
- keep FE / BE / UI baselines as consumed inputs,
- distinguish architecture-doc rollback from runtime deploy rollback (PD-5.7).

---

# 9. Freeze Summary

**Integration Baseline is frozen.**

```
baselineId         = product-integration-baseline-v1
freezeId           = product-integration-freeze-1
signoff            = product-integration-signoff-1
deliverables       = PD-6.1 … PD-6.7 (+ PD-6.8 lock)
feBaselineRef      = product-frontend-architecture-baseline-v1
beBaselineRef      = product-backend-architecture-baseline-v1
uiBaselineRef      = product-ui-baseline-v1
pipeline           = UI → API → Service → Domain → Persistence
domains            = M11–M15 only
apiFamilies        = closed
reuseOnly          = true
noNewDomain        = true
noNewApiFamily     = true
noNewSurface       = true
noNewJourney       = true
```

## Handoff statement

```
Product Planning (PD-1…PD-2)     = Frozen
UI Baseline (PD-3)               = Frozen
Frontend Architecture (PD-4)     = Frozen
Backend Architecture (PD-5)      = Frozen
Integration (PD-6.1…PD-6.7)      = Frozen
Integration Freeze (PD-6.8)      = Locked
Implementation may integrate     = Against this baseline only
```

---

# 10. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-INTFZ-01 | Status = Frozen; Baseline ID + Freeze ID declared | ✓ |
| AC-INTFZ-02 | PD-6.1…PD-6.7 listed as frozen deliverables with versions | ✓ |
| AC-INTFZ-03 | Dependency chain Planning → UI → FE → BE → Integration defined | ✓ |
| AC-INTFZ-04 | Traceability matrix present | ✓ |
| AC-INTFZ-05 | Immutable scope defined | ✓ |
| AC-INTFZ-06 | Release Gate + child gate references present | ✓ |
| AC-INTFZ-07 | Verification checklist present | ✓ |
| AC-INTFZ-08 | Rollback snapshot + restore paths defined | ✓ |
| AC-INTFZ-09 | Freeze summary present | ✓ |
| AC-INTFZ-10 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.8 PASS
  iff AC-INTFZ-01 … AC-INTFZ-10 PASS
  ∧ Integration Freeze Gate PASS
  ∧ Verification Checklist PASS
```

---

# Freeze Statement

```
Product Integration Baseline is frozen.
Consume PD-6.1…PD-6.7 as-is.
UI → API → Service → Domain → Persistence
Reuse only · FE consumes APIs · BE owns logic
Domains M11–M15 and existing API families remain the only capability sources.
```
