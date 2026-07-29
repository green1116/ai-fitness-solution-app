# PD-3.3 — Screen Specifications

## Status

**Frozen**

## Type

Product Design

## Version

`product-planning-pd-3.3-v1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

- `PD-2.2-screen-map.md`
- `PD-2.3-user-action-map.md`
- `PD-3.1-information-architecture.md`
- `PD-3.2-navigation-layout.md`

## Purpose

Specify **product behavior** for each MVP Screen (SCR-01…SCR-09).

One specification per Screen.  
Screens present information and issue Commands (PD-2.3).  
Screens do **not** own business logic.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Screen catalogue | SCR-01…SCR-09 only |
| Per-screen specification | Purpose, consumers, features, objects, zones, actions, entry/exit, behavior |
| Screen relationships | Allowed transitions (from PD-3.2 / PD-2.3) |
| Constraints & exclusions | Product-behavior boundaries |
| Acceptance criteria | Spec completeness |

## Out of scope

| Item | Reason |
|------|--------|
| New Screens / Features / Objects | Reuse frozen inputs only |
| Business logic | Commands → existing Domains (elsewhere) |
| React / implementation | Product Design only |
| Component / layout / styling design | Layout pattern IDs referenced only (PD-3.2) |
| API / database / state | Not Screen Spec |
| Permission implementation | Not Screen Spec |
| Modification of PD-1, PD-2.x, PD-3.1, PD-3.2, M11–M15 | Frozen |

## Design chain

```
PD-2.2 Screens
PD-2.3 Actions
PD-3.1 Objects / Zones
PD-3.2 Layout Pattern IDs + Navigation
        ↓
PD-3.3 Screen Specifications  ← this document
```

---

# 2. Screen Catalogue

| Screen ID | Name | Layout Pattern (PD-3.2) | IA Layer (PD-3.1) | Golden Path |
|-----------|------|-------------------------|------------------|-------------|
| SCR-01 | Homepage | LAY-ENTRY | L1 Product Entry | Yes (start) |
| SCR-02 | Enterprise Builder Entry | LAY-INTAKE | L2 Intake | Yes (GP-01) |
| SCR-03 | Tender Intelligence Entry | LAY-INTAKE | L2 Intake | Yes (GP-02) |
| SCR-04 | AI Workspace | LAY-SPLIT-3 | L3 Guided Work | Yes (GP-01/02/03) |
| SCR-05 | Solution Result | LAY-RESULT | L4 Results | Yes |
| SCR-06 | Budget Result | LAY-RESULT | L4 Results | Yes |
| SCR-07 | My Projects | LAY-LIST | L5 Continuity | Yes (GP-01R) |
| SCR-08 | My Documents | LAY-LIBRARY | L6 Artifacts | Yes |
| SCR-09 | Admin Dashboard | LAY-OPS | L7 Operations | GP-04 (ops) |

**Catalogue count: 9** — no additional Screens in MVP.

---

# 3. Screen Specification Template

Each Screen Spec uses this template:

| Field | Meaning |
|-------|---------|
| Screen ID / Name | Stable ID from PD-2.2 |
| Purpose | One primary user goal |
| Primary Consumer | Persona(s) |
| Product Line | From PD-2.2 |
| Layout Pattern Ref | PD-3.2 pattern ID only (no redesign) |
| Features | PD-2.1 Feature IDs on this Screen |
| Objects Present | PD-3.1 Object IDs visible / actionable |
| Content Zones | What the user can see/do by zone (behavior, not styling) |
| Actions Owned | PD-2.3 Actions that belong **only** to this Screen |
| Entry From | Prior Screens / entry |
| Exit To | Next Screens |
| User Behavior | What the user can accomplish here |
| Screen Must Not | Explicit non-behaviors |
| Golden Paths | Paths that use this Screen |

---

# 4. Screen Specifications

## SCR-01 — Homepage

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-01 |
| Name | Homepage |
| Purpose | Provide clear business entry points |
| Primary Consumer | PER-01, PER-02, PER-03; returning users |
| Product Line | Platform Entry |
| Layout Pattern Ref | LAY-ENTRY |
| Features | FEAT-01, FEAT-02, FEAT-03, FEAT-30 |
| Objects Present | OBJ-01 Business Goal |
| Content Zones | **Access** — Sign In, Language · **Goal Entry** — Enterprise Builder, Tender Intelligence, Sales Center · **Continuity** — My Projects |
| Actions Owned | ACT-01-01, ACT-01-02, ACT-01-03, ACT-01-04, ACT-01-05, ACT-01-06 |
| Entry From | External / Login |
| Exit To | SCR-02, SCR-03, SCR-04, SCR-07 |
| User Behavior | User signs in (if needed), selects language, chooses a business goal, or opens My Projects |
| Screen Must Not | Expose technical modules; start Solution/Budget without going through Intake/Workspace; host Admin ops |
| Golden Paths | GP-01, GP-01R, GP-02, GP-03 (start) |

---

## SCR-02 — Enterprise Builder Entry

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-02 |
| Name | Enterprise Builder Entry |
| Purpose | Start enterprise fitness planning |
| Primary Consumer | PER-01 |
| Product Line | PL-01 |
| Layout Pattern Ref | LAY-INTAKE |
| Features | FEAT-10, FEAT-11, FEAT-12 |
| Objects Present | OBJ-02 Project (forming), OBJ-03 Planning Inputs |
| Content Zones | **Guide** — start planning · **Inputs** — company size, location, space, budget, goals · **Forward** — Continue to AI Workspace |
| Actions Owned | ACT-02-01, ACT-02-02, ACT-02-03 |
| Entry From | SCR-01 |
| Exit To | SCR-04 |
| User Behavior | User starts planning, provides planning inputs, continues into AI Workspace |
| Screen Must Not | Generate or display final Solution/Budget; expose Domain engines; skip to Documents |
| Golden Paths | GP-01 |

---

## SCR-03 — Tender Intelligence Entry

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-03 |
| Name | Tender Intelligence Entry |
| Purpose | Start tender workflow |
| Primary Consumer | PER-02 |
| Product Line | PL-02 |
| Layout Pattern Ref | LAY-INTAKE |
| Features | FEAT-20, FEAT-21, FEAT-22 |
| Objects Present | OBJ-02 Project (forming), OBJ-04 Tender Source, OBJ-05 Processing Status |
| Content Zones | **Source** — upload tender · **Status** — processing visibility · **Forward** — proceed to requirement review |
| Actions Owned | ACT-03-01, ACT-03-02, ACT-03-03 |
| Entry From | SCR-01 |
| Exit To | SCR-04 |
| User Behavior | User uploads tender document, observes processing status, proceeds to requirement review in Workspace |
| Screen Must Not | Confirm requirements here (that is SCR-04); generate tender package here; show engine/parser UI |
| Golden Paths | GP-02 |

---

## SCR-04 — AI Workspace

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-04 |
| Name | AI Workspace |
| Purpose | AI-guided working environment |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | Shared (PL-01 / PL-02 / PL-03) |
| Layout Pattern Ref | LAY-SPLIT-3 |
| Features | FEAT-12, FEAT-22, FEAT-23, FEAT-24, FEAT-31, FEAT-40, FEAT-41, FEAT-51 |
| Objects Present | OBJ-02 Project, OBJ-06 Requirements, OBJ-07 Opportunity, OBJ-08 Current Task, OBJ-09 Progress |
| Content Zones | **Conversation** — guided AI work · **Task** — confirm requirements / capture opportunity / generate package · **Context** — project, requirements, progress, documents link · **Outcomes** — open Solution / Budget |
| Actions Owned | ACT-04-01, ACT-04-02, ACT-04-03, ACT-04-04, ACT-04-05, ACT-04-06, ACT-04-07, ACT-04-08 |
| Entry From | SCR-02, SCR-03, SCR-01 (Sales), SCR-07 |
| Exit To | SCR-05, SCR-06, SCR-08 |
| User Behavior | User works with AI guidance, views project context, confirms requirements or captures opportunity when applicable, requests package generation when applicable, opens Solution, Budget, or Documents |
| Screen Must Not | Own generation/scoring algorithms; expose model/provider panels; replace Result Screens for full review |
| Golden Paths | GP-01, GP-01R, GP-02, GP-03 |

---

## SCR-05 — Solution Result

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-05 |
| Name | Solution Result |
| Purpose | Display generated solution |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | PL-01 / PL-02 / PL-03 |
| Layout Pattern Ref | LAY-RESULT |
| Features | FEAT-13, FEAT-15, FEAT-16, FEAT-24, FEAT-32, FEAT-33 |
| Objects Present | OBJ-10 Solution, OBJ-12 Document (via actions) |
| Content Zones | **Summary** — solution / proposal / package overview · **Result blocks** — Planning, Configuration, Budget (summary) · **Artifact actions** — Download, Share · **Forward** — Budget, Documents, Workspace |
| Actions Owned | ACT-05-01, ACT-05-02, ACT-05-03, ACT-05-04, ACT-05-05, ACT-05-06, ACT-05-07 |
| Entry From | SCR-04 |
| Exit To | SCR-06, SCR-08, SCR-04 |
| User Behavior | User reviews solution or proposal/package result, downloads or shares materials, continues to Budget, opens Documents, or returns to Workspace |
| Screen Must Not | Recalculate budgets; redefine document categories; act as Admin Dashboard |
| Golden Paths | GP-01, GP-02, GP-03 |

---

## SCR-06 — Budget Result

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-06 |
| Name | Budget Result |
| Purpose | Display investment information |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | PL-01 / PL-02 / PL-03 |
| Layout Pattern Ref | LAY-RESULT |
| Features | FEAT-14, FEAT-15, FEAT-32 |
| Objects Present | OBJ-11 Budget, OBJ-12 Document (via actions) |
| Content Zones | **Overview** — investment range, category breakdown, options · **Artifact actions** — Download Budget · **Forward** — Adjust Requirements, Documents, Solution |
| Actions Owned | ACT-06-01, ACT-06-02, ACT-06-03, ACT-06-04, ACT-06-05 |
| Entry From | SCR-04, SCR-05 |
| Exit To | SCR-04, SCR-08, SCR-05 |
| User Behavior | User reviews budget estimate, downloads budget materials, returns to Workspace to adjust requirements, opens Documents, or returns to Solution |
| Screen Must Not | Own pricing algorithms; create new document types; replace Documents library |
| Golden Paths | GP-01, GP-03 |

---

## SCR-07 — My Projects

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-07 |
| Name | My Projects |
| Purpose | Manage previous projects |
| Primary Consumer | Returning users (PER-01 / PER-02 / PER-03) |
| Product Line | Shared |
| Layout Pattern Ref | LAY-LIST |
| Features | FEAT-50, FEAT-51, FEAT-52 |
| Objects Present | OBJ-02 Project |
| Content Zones | **List** — projects (name, status, created date) · **Row actions** — Continue, View Documents |
| Actions Owned | ACT-07-01, ACT-07-02, ACT-07-03 |
| Entry From | SCR-01, global NAV-PROJECTS |
| Exit To | SCR-04, SCR-08 |
| User Behavior | User lists projects, continues a project into Workspace, or opens that project’s Documents |
| Screen Must Not | Act as Admin Organizations list; create new Project types beyond MVP Objects |
| Golden Paths | GP-01R |

---

## SCR-08 — My Documents

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-08 |
| Name | My Documents |
| Purpose | Manage generated files |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | Shared |
| Layout Pattern Ref | LAY-LIBRARY |
| Features | FEAT-15, FEAT-16, FEAT-25, FEAT-33, FEAT-52, FEAT-53, FEAT-54, FEAT-55 |
| Objects Present | OBJ-12 Document, OBJ-13 Document Category |
| Content Zones | **Categories** — Solution, Budget, Tender, Delivery · **Item actions** — Preview, Download, Share · **Return** — My Projects, AI Workspace |
| Actions Owned | ACT-08-01, ACT-08-02, ACT-08-03, ACT-08-04, ACT-08-05, ACT-08-06 |
| Entry From | SCR-05, SCR-06, SCR-07, SCR-04 |
| Exit To | SCR-07, SCR-04 (, Home via shell) |
| User Behavior | User browses fixed categories, previews / downloads / shares documents, returns to Projects or Workspace |
| Screen Must Not | Add categories beyond the four MVP labels; host Intake or Admin ops |
| Golden Paths | GP-01, GP-02, GP-03 |

---

## SCR-09 — Admin Dashboard

| Field | Specification |
|-------|----------------|
| Screen ID | SCR-09 |
| Name | Admin Dashboard |
| Purpose | Platform operation |
| Primary Consumer | PER-06 |
| Product Line | PL-05 |
| Layout Pattern Ref | LAY-OPS |
| Features | FEAT-60 |
| Objects Present | OBJ-14 Organization, OBJ-15 User (Admin view), OBJ-16 Usage, OBJ-17 Security, OBJ-18 Governance |
| Content Zones | **Areas** — Organizations, Users, Usage, Security, Governance |
| Actions Owned | ACT-09-01, ACT-09-02, ACT-09-03, ACT-09-04, ACT-09-05, ACT-09-06 |
| Entry From | Admin entry (not customer Golden Path) |
| Exit To | — (ops surface; areas remain on this Screen) |
| User Behavior | Administrator opens dashboard and observes Organizations, Users, Usage, Security, and Governance areas |
| Screen Must Not | Appear on customer GP-01/02/03; split areas into new Screens in MVP; expose infrastructure tooling as product Screens |
| Golden Paths | GP-04 |

---

# 5. Screen Relationships

## 5.1 Relationship map

```
SCR-01 ──► SCR-02 ──► SCR-04 ──► SCR-05 ──► SCR-06 ──► SCR-08
  │                      ▲  │       │  ▲       │         │
  ├──► SCR-03 ───────────┘  │       │  └───────┘         │
  ├──► SCR-04 (Sales) ──────┤       └──► SCR-08 ◄────────┤
  └──► SCR-07 ──────────────┘              ▲             │
         │                                 │             │
         └──────────────► SCR-08 ──────────┘             │
                                                         │
Admin entry ──► SCR-09                                   │
```

## 5.2 Relationship table

| Relationship | From | To | Owning Action(s) |
|--------------|------|----|------------------|
| Goal → Builder Intake | SCR-01 | SCR-02 | ACT-01-03 |
| Goal → Tender Intake | SCR-01 | SCR-03 | ACT-01-04 |
| Goal → Sales Workspace | SCR-01 | SCR-04 | ACT-01-05 |
| Home → Projects | SCR-01 | SCR-07 | ACT-01-06 |
| Builder → Workspace | SCR-02 | SCR-04 | ACT-02-03 |
| Tender → Workspace | SCR-03 | SCR-04 | ACT-03-03 |
| Workspace → Solution | SCR-04 | SCR-05 | ACT-04-06 |
| Workspace → Budget | SCR-04 | SCR-06 | ACT-04-07 |
| Workspace → Documents | SCR-04 | SCR-08 | ACT-04-08 |
| Solution → Budget | SCR-05 | SCR-06 | ACT-05-05 |
| Solution → Documents | SCR-05 | SCR-08 | ACT-05-06 |
| Solution → Workspace | SCR-05 | SCR-04 | ACT-05-07 |
| Budget → Workspace | SCR-06 | SCR-04 | ACT-06-03 |
| Budget → Documents | SCR-06 | SCR-08 | ACT-06-04 |
| Budget → Solution | SCR-06 | SCR-05 | ACT-06-05 |
| Projects → Workspace | SCR-07 | SCR-04 | ACT-07-02 |
| Projects → Documents | SCR-07 | SCR-08 | ACT-07-03 |
| Documents → Projects | SCR-08 | SCR-07 | ACT-08-05 |
| Documents → Workspace | SCR-08 | SCR-04 | ACT-08-06 |

## 5.3 Golden Path screen chains (unchanged)

| Path | Chain |
|------|-------|
| GP-01 | SCR-01 → SCR-02 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| GP-01R | SCR-01 → SCR-07 → SCR-04 |
| GP-02 | SCR-01 → SCR-03 → SCR-04 → SCR-05 → SCR-08 |
| GP-03 | SCR-01 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| GP-04 | SCR-09 |

---

# 6. Screen Constraints

| ID | Constraint |
|----|------------|
| SC-01 | Exactly one specification per Screen SCR-01…SCR-09 |
| SC-02 | Every Action on a Screen is owned by that Screen only (PD-2.3) |
| SC-03 | Features listed must exist in PD-2.1 MVP = In |
| SC-04 | Objects listed must exist in PD-3.1 OBJ-01…OBJ-18 |
| SC-05 | Layout Pattern Ref must match PD-3.2 mapping — no new patterns, no layout redesign here |
| SC-06 | Screen describes **product behavior only** — what user can see/do and where they can go |
| SC-07 | Screen must not embed business logic, scoring, pricing, extraction, or generation rules |
| SC-08 | Screen must not define APIs, databases, state stores, or permission implementations |
| SC-09 | No new Screens in this document |
| SC-10 | Customer Golden Paths must not require SCR-09 |
| SC-11 | Document categories on SCR-08 remain exactly: Solution, Budget, Tender, Delivery |
| SC-12 | UI / Screen owns no business logic — Commands remain the behavior boundary |

---

# 7. Exclusions

This document excludes:

1. React / Next.js / any implementation  
2. Component design  
3. Layout redesign (beyond referencing PD-3.2 pattern IDs)  
4. Visual styling  
5. API / schema / routes  
6. Database / persistence  
7. State management  
8. Permission implementation  
9. Business logic / algorithms  
10. New Screens, Features, Objects, or Actions  
11. Modifications to PD-1, PD-2.x, PD-3.1, PD-3.2, M11–M15  

---

# 8. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-SS-01 | Catalogue lists exactly SCR-01…SCR-09 | ✓ |
| AC-SS-02 | One complete specification per Screen using the template | ✓ |
| AC-SS-03 | Every Screen lists only its owned Actions from PD-2.3 | ✓ |
| AC-SS-04 | Every Feature on a Screen is from PD-2.1 MVP | ✓ |
| AC-SS-05 | Every Object on a Screen is from PD-3.1 | ✓ |
| AC-SS-06 | Layout Pattern Ref matches PD-3.2 for each Screen | ✓ |
| AC-SS-07 | Entry/Exit relationships align with PD-2.2 and PD-3.2 §7.1 | ✓ |
| AC-SS-08 | Golden Path chains unchanged | ✓ |
| AC-SS-09 | No business logic, React, components, styling, API, DB, state, or permission implementation | ✓ |
| AC-SS-10 | Inputs PD-2.2, PD-2.3, PD-3.1, PD-3.2 unmodified | ✓ |

## Verdict

```
PD-3.3 PASS iff AC-SS-01 … AC-SS-10 all PASS
```

---

# Freeze Statement

PD-3.3 Screen Specifications is frozen for MVP Product Design.

Each Screen’s product behavior is defined here.  
Downstream delivery must implement Screens as specified — without adding Screens, embedding business logic in UI, or altering frozen PD-2 / PD-3.1 / PD-3.2 / M11–M15 baselines.
