# PD-4.2 — Frontend Routing

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Frontend Routing

## Version

`product-delivery-pd-4.2-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-4.1 Frontend Architecture | Route keys + layer rules |
| PD-3.2 Navigation & Layout | Allowed transitions |
| PD-3.3 Screen Specifications | Page ownership |
| PD-3.8 UI Freeze | `product-ui-baseline-v1` |
| PD-2.2 / PD-2.3 | Screens / Actions |
| PD-2.4 / PD-2.5 | Existing API / Domain (auth observation only) |

## Purpose

Define **route structure**, **route ownership**, **guard behavior**, and **route-to-page mapping** for MVP frontend delivery.

Routing is a delivery projection of frozen Screens.  
Routers **own no business logic**.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Route tree | Canonical paths for SCR-01…09 |
| Route groups | Entry / Work / Result / Library / Ops / System |
| Page ownership | Route → Screen → Layout → Actions |
| Auth / guard behavior | Presentation guards only |
| Golden Path sequences | GP-01…GP-04 |
| Fallback / error routes | Not-found / unavailable |
| Navigation entry points | Shell + goal + continuity |
| Route freeze summary | Locked inventory |
| Release Gate | Routing readiness |

## Out of scope

| Item | Reason |
|------|--------|
| React Router / Next.js file layout code | Markdown architecture only |
| New Screens or routes beyond freeze | UI baseline locked |
| Business eligibility / scoring in guards | Forbidden |
| Permission engine / RBAC Domain | Not frontend routing |
| New APIs / Domains | Forbidden |
| Modification of PD-1…PD-3, PD-4.1, M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Routing Principles

1. **One primary route per Screen** (MVP).  
2. **Routes mirror Screens** — no parallel “shadow” product surfaces.  
3. **Allowed transitions only** — edges from PD-3.2 / PD-4.1.  
4. **Guards are presentation gates** — session presence / missing context cues — not Domain decisions.  
5. **Opaque identifiers only** in params (`projectId`, `documentId`) for presentation context.  
6. **Admin route isolated** from customer Golden Paths.  
7. **Fallback routes** never invent Features.  
8. Frontend consumes existing auth API results (PD-2.4); does not invent auth Domains.

---

# 3. Route Tree

## 3.1 Canonical paths

| Route ID | Path | Screen | Name | Group |
|----------|------|--------|------|-------|
| RT-HOME | `/` | SCR-01 | Homepage | Entry |
| RT-HOME-ALT | `/home` | SCR-01 | Homepage (alias) | Entry |
| RT-BUILDER | `/builder` | SCR-02 | Enterprise Builder Entry | Work |
| RT-TENDER | `/tender` | SCR-03 | Tender Intelligence Entry | Work |
| RT-WORKSPACE | `/workspace` | SCR-04 | AI Workspace | Work |
| RT-SOLUTION | `/solution` | SCR-05 | Solution Result | Result |
| RT-BUDGET | `/budget` | SCR-06 | Budget Result | Result |
| RT-PROJECTS | `/projects` | SCR-07 | My Projects | Library |
| RT-DOCUMENTS | `/documents` | SCR-08 | My Documents | Library |
| RT-ADMIN | `/admin` | SCR-09 | Admin Dashboard | Ops |
| RT-NOT-FOUND | `/404` | — (system) | Not Found | System |
| RT-UNAVAILABLE | `/unavailable` | — (system) | Temporarily Unavailable | System |

**Alias rule:** `/home` resolves to the same page ownership as `/`. Canonical link target is `/`.

## 3.2 Optional presentation params

Params carry **presentation context only** (no business meaning invented here).

| Route | Optional params | Purpose |
|-------|-----------------|---------|
| `/workspace` | `?projectId=` | Project cue for SHELL-CONTEXT / SCR-04 |
| `/solution` | `?projectId=` | Bind result view to project |
| `/budget` | `?projectId=` | Bind budget view to project |
| `/documents` | `?projectId=` `&category=` | Scope library; category ∈ {solution,budget,tender,delivery} |
| `/projects` | — | List only |
| `/admin` | `?area=` | Optional ops area focus ∈ {organizations,users,usage,security,governance} — still SCR-09 |

## 3.3 Tree view

```
/
├── /home                    → SCR-01 (alias)
├── /builder                 → SCR-02
├── /tender                  → SCR-03
├── /workspace               → SCR-04
├── /solution                → SCR-05
├── /budget                  → SCR-06
├── /projects                → SCR-07
├── /documents               → SCR-08
├── /admin                   → SCR-09
├── /404                     → System Not Found
└── /unavailable             → System Unavailable
```

**No other product routes** under this freeze.

---

# 4. Route Groups

| Group ID | Name | Routes | Shell mode (PD-4.1) |
|----------|------|--------|---------------------|
| RG-ENTRY | Entry | `/`, `/home` | Entry |
| RG-WORK | Work | `/builder`, `/tender`, `/workspace` | Work |
| RG-RESULT | Result | `/solution`, `/budget` | Result |
| RG-LIBRARY | Library | `/projects`, `/documents` | Library |
| RG-OPS | Operations | `/admin` | Ops |
| RG-SYSTEM | System | `/404`, `/unavailable` | Minimal shell |

## Group rules

| Rule | Statement |
|------|-----------|
| RG-01 | Customer Golden Paths use RG-ENTRY + RG-WORK + RG-RESULT + RG-LIBRARY only |
| RG-02 | RG-OPS is never required by GP-01 / GP-01R / GP-02 / GP-03 |
| RG-03 | RG-SYSTEM does not map to SCR-01…09 |
| RG-04 | Cross-group navigation must still obey allowed edges (§7) |

---

# 5. Page Ownership

## 5.1 Ownership model

```
Route
  → Page (delivery unit)
    → Screen (PD-3.3)
      → Layout Pattern (PD-3.2)
        → Components / Interactions
          → Actions (PD-2.3) owned by that Screen only
```

## 5.2 Route → Page → Screen map

| Route ID | Path | Page ID | Screen | Layout | Owns Actions |
|----------|------|---------|--------|--------|--------------|
| RT-HOME | `/` | PG-HOME | SCR-01 | LAY-ENTRY | ACT-01-01…06 |
| RT-BUILDER | `/builder` | PG-BUILDER | SCR-02 | LAY-INTAKE | ACT-02-01…03 |
| RT-TENDER | `/tender` | PG-TENDER | SCR-03 | LAY-INTAKE | ACT-03-01…03 |
| RT-WORKSPACE | `/workspace` | PG-WORKSPACE | SCR-04 | LAY-SPLIT-3 | ACT-04-01…08 |
| RT-SOLUTION | `/solution` | PG-SOLUTION | SCR-05 | LAY-RESULT | ACT-05-01…07 |
| RT-BUDGET | `/budget` | PG-BUDGET | SCR-06 | LAY-RESULT | ACT-06-01…05 |
| RT-PROJECTS | `/projects` | PG-PROJECTS | SCR-07 | LAY-LIST | ACT-07-01…03 |
| RT-DOCUMENTS | `/documents` | PG-DOCUMENTS | SCR-08 | LAY-LIBRARY | ACT-08-01…06 |
| RT-ADMIN | `/admin` | PG-ADMIN | SCR-09 | LAY-OPS | ACT-09-01…06 |
| RT-NOT-FOUND | `/404` | PG-NOT-FOUND | — | Minimal | Navigate Home only |
| RT-UNAVAILABLE | `/unavailable` | PG-UNAVAILABLE | — | Minimal | Retry / Home |

## 5.3 Ownership rules

| Rule | Statement |
|------|-----------|
| PO-01 | Each product Page owns exactly one Screen |
| PO-02 | Page may not host Actions belonging to another Screen |
| PO-03 | System Pages own no Feature catalogue IDs |
| PO-04 | Page ownership does not include Domain / API design |

---

# 6. Auth / Guard Behavior

Guards are **presentation gates**. They do not implement Domain authorization engines.

## 6.1 Guard catalogue

| Guard ID | Name | Applies to | Behavior |
|----------|------|------------|----------|
| GRD-NONE | No session gate | `/`, `/home`, `/404`, `/unavailable` | Always allow enter |
| GRD-SESSION | Session presentation | `/builder`, `/tender`, `/workspace`, `/solution`, `/budget`, `/projects`, `/documents` | If existing auth API indicates no session → redirect `/` with Sign In affordance (ACT-01-01 path) |
| GRD-CONTEXT | Project cue soft gate | `/workspace`, `/solution`, `/budget`, `/documents` | If `projectId` missing → allow enter but show Empty/guide to `/projects` or `/` (no Domain decision) |
| GRD-OPS | Ops entry gate | `/admin` | If session not presented as admin-capable by **existing** auth/ops surface → redirect `/` (no new permission Domain) |
| GRD-ALIAS | Home alias | `/home` | Rewrite/normalize to `/` |

## 6.2 Guard rules

| Rule | Statement |
|------|-----------|
| GD-01 | Guards consume existing auth/session observation only (PD-2.4 → M13) |
| GD-02 | Guards must not encode pricing, entitlement matrices, or Feature flags as business engines |
| GD-03 | Soft context gate never blocks reading Empty guidance |
| GD-04 | Failed ops gate returns user to Entry — does not invent `/forbidden` Feature Screen |
| GD-05 | Router does not call Domains to “compute eligibility” beyond existing session/ops APIs |

## 6.3 Auth interaction points

| Intent | Route effect |
|--------|--------------|
| Sign In success (ACT-01-01) | Remain `/` or resume intended deep link if present |
| Sign In required by GRD-SESSION | Navigate `/` |
| Language (ACT-01-02) | No route change |

---

# 7. Allowed Transitions (Route Edges)

Derived from PD-3.2 / PD-4.1. Routers must not add edges.

| From path | To path | Trigger (Action ref) |
|-----------|---------|----------------------|
| `/` | `/builder` | ACT-01-03 |
| `/` | `/tender` | ACT-01-04 |
| `/` | `/workspace` | ACT-01-05 |
| `/` | `/projects` | ACT-01-06 |
| `/builder` | `/workspace` | ACT-02-03 |
| `/tender` | `/workspace` | ACT-03-03 |
| `/workspace` | `/solution` | ACT-04-06 |
| `/workspace` | `/budget` | ACT-04-07 |
| `/workspace` | `/documents` | ACT-04-08 |
| `/solution` | `/budget` | ACT-05-05 |
| `/solution` | `/documents` | ACT-05-06 |
| `/solution` | `/workspace` | ACT-05-07 |
| `/budget` | `/workspace` | ACT-06-03 |
| `/budget` | `/documents` | ACT-06-04 |
| `/budget` | `/solution` | ACT-06-05 |
| `/projects` | `/workspace` | ACT-07-02 |
| `/projects` | `/documents` | ACT-07-03 |
| `/documents` | `/projects` | ACT-08-05 |
| `/documents` | `/workspace` | ACT-08-06 |
| `*` (shell) | `/`, `/projects`, `/documents`, `/workspace` | INT-NAV-SHELL when offered |
| unknown | `/404` | Fallback |
| critical outage | `/unavailable` | Fallback |

## Forbidden edges

| Forbidden | Reason |
|-----------|--------|
| `/` → `/solution` or `/budget` directly | Skips Intake/Workspace |
| Customer GP → `/admin` required | Ops isolated |
| Routes named for engines (`/quote-engine`, etc.) | Hidden from IA |
| `/admin/organizations` as separate Screen route | Areas stay on SCR-09 |

---

# 8. Golden Path Route Sequences

| Path | Sequence |
|------|----------|
| **GP-01** | `/` → `/builder` → `/workspace` → `/solution` → `/budget` → `/documents` |
| **GP-01R** | `/` → `/projects` → `/workspace` |
| **GP-02** | `/` → `/tender` → `/workspace` → `/solution` → `/documents` |
| **GP-03** | `/` → `/workspace` → `/solution` → `/budget` → `/documents` |
| **GP-04** | `/admin` |

## Sequence rules

| Rule | Statement |
|------|-----------|
| GP-R1 | Intermediate redirects for GRD-SESSION must return user to the interrupted step after sign-in when deep link preserved |
| GP-R2 | Query params may decorate steps; they must not reorder the path |
| GP-R3 | Completing GP does not require `/404` or `/unavailable` |

---

# 9. Fallback / Error Routes

| Route | When used | User outcome | Next |
|-------|-----------|--------------|------|
| `/404` | Unknown path / removed surface | Not Found message | Link to `/` |
| `/unavailable` | Existing API/auth critically unavailable for page boot | Unavailable message | Retry current intent or `/` |

## Fallback rules

| Rule | Statement |
|------|-----------|
| FB-01 | Do not map Domain business errors to new Feature routes |
| FB-02 | Screen-level Loading/Error/Empty (PD-4.1 §11) stay on the product route — do not bounce to `/404` for empty lists |
| FB-03 | `/404` and `/unavailable` own no FEAT-* |
| FB-04 | Fallback copy avoids engine/Domain jargon (PD-3.7) |

---

# 10. Navigation Entry Points

## 10.1 Shell entry points (PD-3.2 NAV-*)

| Nav ID | Label | Target route |
|--------|-------|--------------|
| NAV-HOME | Home | `/` |
| NAV-PROJECTS | My Projects | `/projects` |
| NAV-DOCUMENTS | My Documents | `/documents` |
| NAV-WORKSPACE | AI Workspace | `/workspace` |
| NAV-ADMIN | Admin | `/admin` |

## 10.2 Homepage goal entry points

| Goal | Action | Target route |
|------|--------|--------------|
| Enterprise Builder | ACT-01-03 | `/builder` |
| Tender Intelligence | ACT-01-04 | `/tender` |
| Sales Center | ACT-01-05 | `/workspace` |
| My Projects | ACT-01-06 | `/projects` |

## 10.3 Continuity / outcome entry points

| From | Entry | Target |
|------|-------|--------|
| Projects row Continue | ACT-07-02 | `/workspace?projectId=` |
| Projects row Documents | ACT-07-03 | `/documents?projectId=` |
| Workspace outcomes | ACT-04-06/07/08 | `/solution` / `/budget` / `/documents` |

---

# 11. Route Freeze Summary

## Locked inventory

| Item | Locked value |
|------|--------------|
| Product routes | 9 Screens → 9 primary paths (+ `/home` alias) |
| System routes | `/404`, `/unavailable` |
| Route groups | RG-ENTRY / WORK / RESULT / LIBRARY / OPS / SYSTEM |
| UI baseline | `product-ui-baseline-v1` |
| Architecture parent | PD-4.1 |
| New routes under freeze | **None** |

## Freeze tags

```
ROUTE_BASELINE_ID   = product-frontend-routing-v1
ROUTE_FREEZE_REF    = product-ui-freeze-1
ROUTE_SCREEN_SET    = SCR-01…SCR-09
NO_NEW_ROUTE        = true
NO_BUSINESS_LOGIC   = true
```

## Immutable statements

1. No product route outside §3.1.  
2. No guard may introduce Domain business rules.  
3. Golden Path sequences in §8 are frozen.  
4. PD-4.1 logical keys remain the architectural source; this document is the routing delivery spec.

---

# 12. Release Gate

## Gate ID

`product-frontend-routing-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| RTE-TREE | Route tree complete | All SCR-01…09 mapped; `/` canonical; system routes present |
| RTE-OWN | Page ownership complete | Each product route → one Screen → one Layout → Screen Actions |
| RTE-EDGE | Transitions locked | Allowed edges match PD-3.2; forbidden edges documented |
| RTE-GP | Golden Paths locked | GP-01…GP-04 sequences exact |
| RTE-GUARD | Guards presentation-only | GRD-* do not encode business logic; use existing auth/ops only |
| RTE-FALLBACK | Fallbacks bounded | Only `/404` + `/unavailable`; no new Feature Screens |
| RTE-SCOPE | No new surfaces | No routes beyond freeze; PD-1…3 / PD-4.1 / M11–M15 untouched |

## Verdict

```
PD-4.2 Gate = PASS
  iff RTE-TREE ∧ RTE-OWN ∧ RTE-EDGE ∧ RTE-GP
    ∧ RTE-GUARD ∧ RTE-FALLBACK ∧ RTE-SCOPE all PASS
```

---

# 13. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-RTE-01 | Route tree defined for all MVP Screens | ✓ |
| AC-RTE-02 | Route groups defined | ✓ |
| AC-RTE-03 | Page ownership matrix complete | ✓ |
| AC-RTE-04 | Auth/guard behavior defined without business logic | ✓ |
| AC-RTE-05 | Golden Path sequences defined | ✓ |
| AC-RTE-06 | Fallback routes defined | ✓ |
| AC-RTE-07 | Navigation entry points defined | ✓ |
| AC-RTE-08 | Freeze summary + Release Gate present | ✓ |
| AC-RTE-09 | Markdown only; no additional files; upstream unmodified | ✓ |

## Verdict

```
PD-4.2 document PASS iff AC-RTE-01 … AC-RTE-09 PASS
```

---

# Document Statement

PD-4.2 Frontend Routing locks how frozen Screens are addressed, guarded, and sequenced.

```
Routes → Pages → Screens → Actions
Guards → presentation only
APIs/Domains → existing only
Business logic → none in router
```
