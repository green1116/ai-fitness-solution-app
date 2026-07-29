# PD-3.8 — UI Freeze

## Status

**Frozen**

## Type

Product Design — Freeze

## Version

`product-planning-pd-3.8-v1`

## Freeze ID

`product-ui-freeze-1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

- `PD-3.1-information-architecture.md`
- `PD-3.2-navigation-layout.md`
- `PD-3.3-screen-specifications.md`
- `PD-3.4-component-specifications.md`
- `PD-3.5-interaction-specifications.md`
- `PD-3.6-responsive-design.md`
- `PD-3.7-accessibility.md`

## Purpose

Freeze the complete **Product Design UI baseline** for MVP.

After this freeze:

- PD-3.1 … PD-3.7 are immutable without an explicit Product Design revision,
- no new Screens, Layouts, Components, Interactions, or Features may be introduced under this freeze,
- downstream delivery must consume this UI baseline as-is.

This document **freezes existing deliverables only**. It adds no product surfaces.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Freeze declaration | PD-3.1 … PD-3.7 |
| Dependency manifest | Chain from Product Planning → UI Design |
| Traceability | Objects → Screens → Layouts → Components → Interactions → Responsive → A11y |
| Release gate | PASS/FAIL for UI baseline readiness |
| Verification checklist | Inventory integrity |
| Rollback reference | Restore to this freeze set |
| Acceptance criteria | Freeze completeness |

## Out of scope

| Item | Reason |
|------|--------|
| New Screens / Components / Interactions / Layouts / Features | Freeze only |
| Business logic | Not UI Design |
| Implementation / React / CSS / HTML / ARIA code | Freeze only |
| API / database / Domain changes | Forbidden |
| Modification of PD-1, PD-2.x, PD-3.1–3.7, M11–M15 | Forbidden |
| PD-2.4 / PD-2.5 / PD-2.6 changes | Outside UI freeze scope (already frozen upstream) |

## Freeze principles

1. Freeze existing UI deliverables only.  
2. No new Screens, Components, Interactions, Layouts, or Features.  
3. UI owns no business logic.  
4. Markdown freeze record only — no implementation artifacts.  
5. Upstream Product Planning (PD-1 / PD-2.x) remains frozen and unmodified.  
6. Domains M11–M15 remain unmodified.

---

# 2. Frozen Deliverables

| Order | Document | Path | Version | Role |
|-------|----------|------|---------|------|
| 1 | PD-3.1 Information Architecture | `docs/product-planning/PD-3.1-information-architecture.md` | `product-planning-pd-3.1-v1` | Objects, layers, labeling |
| 2 | PD-3.2 Navigation & Layout | `docs/product-planning/PD-3.2-navigation-layout.md` | `product-planning-pd-3.2-v1` | Nav hierarchy, shell, LAY-* |
| 3 | PD-3.3 Screen Specifications | `docs/product-planning/PD-3.3-screen-specifications.md` | `product-planning-pd-3.3-v1` | SCR-01…09 behavior |
| 4 | PD-3.4 Component Specifications | `docs/product-planning/PD-3.4-component-specifications.md` | `product-planning-pd-3.4-v1` | CMP-* catalogue |
| 5 | PD-3.5 Interaction Specifications | `docs/product-planning/PD-3.5-interaction-specifications.md` | `product-planning-pd-3.5-v1` | INT-* catalogue |
| 6 | PD-3.6 Responsive Design | `docs/product-planning/PD-3.6-responsive-design.md` | `product-planning-pd-3.6-v1` | BP-* adaptation |
| 7 | PD-3.7 Accessibility | `docs/product-planning/PD-3.7-accessibility.md` | `product-planning-pd-3.7-v1` | A11Y-* requirements |
| 8 | PD-3.8 UI Freeze (this document) | `docs/product-planning/PD-3.8-ui-freeze.md` | `product-planning-pd-3.8-v1` | Freeze lock |

## Frozen inventory counts (from deliverables)

| Inventory | Count | Source |
|-----------|-------|--------|
| Screens | 9 (SCR-01…SCR-09) | PD-3.3 / PD-2.2 |
| Layout Patterns | 7 (LAY-ENTRY … LAY-OPS) | PD-3.2 |
| Components | 26 (CMP-*) | PD-3.4 |
| Interactions | 25 (INT-*) | PD-3.5 |
| Breakpoints | 3 (BP-COMPACT / MEDIUM / EXPANDED) | PD-3.6 |
| Accessibility requirements | 15 (A11Y-*) | PD-3.7 |
| IA Objects | 18 (OBJ-01…OBJ-18) | PD-3.1 |

## Immutable tag

```
UI_BASELINE_ID     = product-ui-baseline-v1
UI_FREEZE_VERSION  = product-ui-freeze-1
UI_FREEZE_BASE     = product-planning-pd-3.7-v1
UI_SIGNOFF         = product-ui-baseline-signoff-1
```

---

# 3. Dependency Manifest

## 3.1 Upstream Product Planning (read-only inputs to UI)

| Doc | Version | Supplies to UI |
|-----|---------|----------------|
| PD-1 Product Blueprint | `product-planning-pd-1-v1` | Product lines, personas, principles |
| PD-2.1 Feature Catalog | `product-planning-pd-2.1-v1` | FEAT-* MVP |
| PD-2.2 Screen Map | `product-planning-pd-2.2-v1` | SCR-* |
| PD-2.3 User Action Map | `product-planning-pd-2.3-v1` | ACT-* / Commands |
| PD-2.4 API Mapping | `product-planning-pd-2.4-v1` | Existing API bindings (not redesigned here) |
| PD-2.5 Domain Mapping | `product-planning-pd-2.5-v1` | M11–M15 ownership (not redesigned here) |
| PD-2.6 Acceptance Criteria | `product-planning-pd-2.6-v1` | Golden Path acceptance |

## 3.2 UI Design dependency chain

```
PD-1
  ↓
PD-2.1 → PD-2.2 → PD-2.3 → PD-2.4 → PD-2.5 → PD-2.6
  ↓
PD-3.1 Information Architecture
  ↓
PD-3.2 Navigation & Layout
  ↓
PD-3.3 Screen Specifications
  ↓
PD-3.4 Component Specifications
  ↓
PD-3.5 Interaction Specifications
  ↓
PD-3.6 Responsive Design
  ↓
PD-3.7 Accessibility
  ↓
PD-3.8 UI Freeze   ← this lock
```

## 3.3 Soft references (must remain intact)

| Reference | Required value |
|-----------|----------------|
| MVP Screens | SCR-01 … SCR-09 only |
| Golden Paths | GP-01, GP-01R, GP-02, GP-03, GP-04 |
| Domain ownership | M11–M15 only (PD-2.5) — no new Domain |
| UI business logic | None |

---

# 4. Traceability Matrix

## 4.1 Layer → deliverable

| Layer | Frozen IDs | Document |
|-------|------------|----------|
| Information | OBJ-01…18, L1…L7 | PD-3.1 |
| Navigation / Layout | NAV-*, LAY-*, Shell regions | PD-3.2 |
| Screens | SCR-01…09 | PD-3.3 |
| Components | CMP-* (26) | PD-3.4 |
| Interactions | INT-* (25) | PD-3.5 |
| Responsive | BP-* (3) | PD-3.6 |
| Accessibility | A11Y-* (15) | PD-3.7 |

## 4.2 Screen → Layout → Components (summary)

| Screen | Layout | Components (families) |
|--------|--------|------------------------|
| SCR-01 | LAY-ENTRY | Shell, Access, Goal Cards, Continuity |
| SCR-02 | LAY-INTAKE | Guide, Planning Inputs, Forward |
| SCR-03 | LAY-INTAKE | Guide, Upload, Status, Forward |
| SCR-04 | LAY-SPLIT-3 | Conversation, Task, Context, Outcomes |
| SCR-05 | LAY-RESULT | Summary, Blocks, Artifact Actions, Forward |
| SCR-06 | LAY-RESULT | Summary, Budget Overview, Artifact Actions, Forward |
| SCR-07 | LAY-LIST | Project List, Project Row |
| SCR-08 | LAY-LIBRARY | Categories, Document Item, Artifact Actions, Forward |
| SCR-09 | LAY-OPS | Ops Area ×5 |

## 4.3 Golden Path → Screen chain (locked)

| Path | Screen chain |
|------|--------------|
| GP-01 | SCR-01 → SCR-02 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| GP-01R | SCR-01 → SCR-07 → SCR-04 |
| GP-02 | SCR-01 → SCR-03 → SCR-04 → SCR-05 → SCR-08 |
| GP-03 | SCR-01 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| GP-04 | SCR-09 |

## 4.4 Integrity rules (locked)

| Rule | Statement |
|------|-----------|
| T-01 | Every Screen has exactly one Layout Pattern |
| T-02 | Every interactive Component maps to ≥1 Interaction |
| T-03 | Every Interaction maps to existing Screen Action(s) |
| T-04 | Responsive adaptation does not add/remove Screens or Actions |
| T-05 | Accessibility requirements apply to all SCR / CMP / INT without new surfaces |
| T-06 | No Feature outside PD-2.1 MVP = In |
| T-07 | No Object outside PD-3.1 OBJ-01…18 |

---

# 5. Release Gate

## Gate ID

`product-ui-baseline-gate`

## Checks

| Check ID | Component | Label | Pass condition |
|----------|-----------|-------|----------------|
| UIFZ-ID | freeze | UI baseline ID locked | `UI_BASELINE_ID = product-ui-baseline-v1` and `UI_FREEZE_VERSION = product-ui-freeze-1` |
| UIFZ-CHAIN | freeze | PD-3.1→3.7 chain intact | All seven deliverables present at frozen versions |
| UIFZ-INVENTORY | freeze | Inventory counts locked | Screens=9, Layouts=7, Components=26, Interactions=25, Breakpoints=3, A11Y=15, Objects=18 |
| UIFZ-GP | freeze | Golden Paths locked | GP-01 / GP-01R / GP-02 / GP-03 / GP-04 chains unchanged |
| UIFZ-SCOPE | freeze | No new surfaces / no business logic | No new SCR/CMP/INT/LAY/FEAT; UI owns no business logic; Domains untouched |

## Verdict formula

```
UI Freeze Gate = PASS
  iff UIFZ-ID ∧ UIFZ-CHAIN ∧ UIFZ-INVENTORY ∧ UIFZ-GP ∧ UIFZ-SCOPE all PASS
```

## Signoff

```
signoff = product-ui-baseline-signoff-1
result  = PASS | FAIL
```

---

# 6. Verification Checklist

Manual / planning verification only (no implementation scripts required by this freeze).

| # | Check | Expected |
|---|-------|----------|
| V-01 | `PD-3.1-information-architecture.md` exists | Present |
| V-02 | `PD-3.2-navigation-layout.md` exists | Present |
| V-03 | `PD-3.3-screen-specifications.md` exists | Present |
| V-04 | `PD-3.4-component-specifications.md` exists | Present |
| V-05 | `PD-3.5-interaction-specifications.md` exists | Present |
| V-06 | `PD-3.6-responsive-design.md` exists | Present |
| V-07 | `PD-3.7-accessibility.md` exists | Present |
| V-08 | Each PD-3.1…3.7 Status = Frozen | Frozen |
| V-09 | Screen IDs only SCR-01…SCR-09 | No extras |
| V-10 | Layout IDs only LAY-* from PD-3.2 | No extras |
| V-11 | Component IDs only CMP-* from PD-3.4 | Count 26 |
| V-12 | Interaction IDs only INT-* from PD-3.5 | Count 25 |
| V-13 | Breakpoints only BP-COMPACT/MEDIUM/EXPANDED | Count 3 |
| V-14 | Golden Path screen chains match §4.3 | Match |
| V-15 | No modification of M11–M15 / PD-1 / PD-2 / PD-3.1–3.7 in this freeze task | Intact |
| V-16 | This freeze adds no business logic / implementation | Markdown only |

**Verification PASS** iff V-01 … V-16 all PASS.

---

# 7. Rollback Reference

## Snapshot

| Field | Value |
|-------|-------|
| Snapshot ID | `product-ui-baseline-rollback-1` |
| Baseline ID | `product-ui-baseline-v1` |
| Freeze Version | `product-ui-freeze-1` |
| Restore Base | `product-planning-pd-3.7-v1` |
| Read-only | true |

## Restore set (paths)

1. `docs/product-planning/PD-3.1-information-architecture.md`  
2. `docs/product-planning/PD-3.2-navigation-layout.md`  
3. `docs/product-planning/PD-3.3-screen-specifications.md`  
4. `docs/product-planning/PD-3.4-component-specifications.md`  
5. `docs/product-planning/PD-3.5-interaction-specifications.md`  
6. `docs/product-planning/PD-3.6-responsive-design.md`  
7. `docs/product-planning/PD-3.7-accessibility.md`  
8. `docs/product-planning/PD-3.8-ui-freeze.md`  

## Rollback rule

To roll back UI Product Design to this baseline:

- restore the eight paths above to the freeze versions listed in §2,
- do not invent replacement Screens/Components/Interactions,
- do not “fix forward” by adding Features under this freeze ID.

---

# 8. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-UIFZ-01 | Freeze declares Status = Frozen | ✓ |
| AC-UIFZ-02 | All PD-3.1…PD-3.7 listed as frozen deliverables | ✓ |
| AC-UIFZ-03 | Dependency manifest includes Product Planning → UI chain | ✓ |
| AC-UIFZ-04 | Traceability matrix covers Objects→Screens→Layouts→Components→Interactions→Responsive→A11y | ✓ |
| AC-UIFZ-05 | Release gate defines 5 checks + PASS formula | ✓ |
| AC-UIFZ-06 | Verification checklist covers inventory integrity | ✓ |
| AC-UIFZ-07 | Rollback snapshot IDs and restore paths defined | ✓ |
| AC-UIFZ-08 | No new Screens/Components/Interactions/Layouts/Features introduced | ✓ |
| AC-UIFZ-09 | No business logic / implementation | ✓ |
| AC-UIFZ-10 | Upstream PD-1 / PD-2 / PD-3.1–3.7 / M11–M15 unmodified by this task | ✓ |

## Verdict

```
PD-3.8 PASS
  iff AC-UIFZ-01 … AC-UIFZ-10 PASS
  ∧ UI Freeze Gate PASS
  ∧ Verification Checklist PASS
```

---

# Freeze Statement

**Product UI Baseline is frozen.**

```
baselineId     = product-ui-baseline-v1
freezeVersion  = product-ui-freeze-1
signoff        = product-ui-baseline-signoff-1
deliverables   = PD-3.1 … PD-3.7 (+ PD-3.8 lock)
screens        = SCR-01 … SCR-09
noNewSurface   = true
noBusinessLogic= true
readOnly       = true
```

Downstream engineering must implement against this UI baseline.  
Any change to Screens, Layouts, Components, Interactions, Responsive rules, or Accessibility requirements requires a new Product Design revision — not an silent edit under `product-ui-freeze-1`.
