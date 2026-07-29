# PD-4.3 — Frontend State Management

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Frontend State Management

## Version

`product-delivery-pd-4.3-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-4.1 Frontend Architecture | State boundary + data flow |
| PD-4.2 Frontend Routing | Route/session/context cues |
| PD-3.1 … PD-3.8 | Objects, Screens, UI freeze |
| PD-2.3 / PD-2.4 / PD-2.5 | Actions, APIs, Domains |

## Purpose

Define **frontend state ownership**, **boundaries**, and **state flow** for the UI layer.

Client state exists only to support presentation and intent emission.  
**Source of truth for business data** remains existing Domains via existing APIs.  
Frontend **owns no business logic**.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| State taxonomy | Classes of state |
| Local UI state | Component / Screen ephemeral |
| Shared client state | Cross-Screen presentation context |
| Server state | Domain data via API |
| Derived state | View-only projections |
| Cache / invalidation | Display cache rules |
| Loading / error / empty | Ownership of presentation states |
| Session / context state | Auth presentation + project cue |
| State freeze summary | Locked rules |
| Release Gate | State architecture readiness |

## Out of scope

| Item | Reason |
|------|--------|
| Choosing Redux/Zustand/React Query/etc. | Implementation choice (PD-4.1 S-05) |
| New Domains or APIs | Forbidden |
| Business rules in stores | Forbidden |
| Database / persistence design | Not frontend |
| Modification of PD-1…PD-3, PD-4.1, PD-4.2, M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. State Principles

1. **Domain is source of truth** for Projects, Requirements, Results, Documents, Ops observations.  
2. **UI state is disposable** — losing it must not corrupt Domain data.  
3. **Commands mutate Domain** via existing APIs; UI then refreshes presentation.  
4. **No shadow Domain** — client stores must not re-implement M11–M15.  
5. **Derived state is pure presentation** — formatting/filtering without business decisions.  
6. **Loading / error / empty are UI-owned** presentation flags over server fetches.  
7. **Session presentation ≠ permission engine** — observe existing auth API only.  
8. **Technology-agnostic** — this doc defines ownership, not libraries.

---

# 3. State Taxonomy

| Class ID | Name | Owner | Lifetime | Source of truth |
|----------|------|-------|----------|-----------------|
| ST-LOCAL | Local UI state | Component / Screen | Ephemeral (unmount / navigate away) | Frontend only |
| ST-SHARED | Shared client state | Frontend presentation layer | Session / navigation span | Frontend cues only |
| ST-SERVER | Server state | Existing Domain via API | Until invalidated / refetched | Domain |
| ST-DERIVED | Derived state | Frontend adapter / view | Recomputed from inputs | Inputs (never independent) |
| ST-META | Presentation meta | Frontend | Per fetch / per Screen | Frontend (status flags) |
| ST-SESSION | Session presentation | Frontend + existing auth API | Browser session | Auth API observation |
| ST-CONTEXT | Navigation context | Frontend + route params | Per route / deep link | Route cues (PD-4.2) |

## Taxonomy rules

| Rule | Statement |
|------|-----------|
| TX-01 | Business entities (OBJ-02 Project, OBJ-10 Solution, etc.) live as ST-SERVER when loaded |
| TX-02 | ST-LOCAL must not be treated as Domain truth |
| TX-03 | ST-DERIVED must not invent fields Domains did not return |
| TX-04 | ST-META never replaces Domain progress semantics beyond Objects (e.g. OBJ-05) |

---

# 4. Local UI State (ST-LOCAL)

## 4.1 Definition

State that exists only to operate a Component or Screen interaction and is safe to discard.

## 4.2 Catalogue

| State key | Screen / Component | Content | Forbidden |
|-----------|--------------------|---------|-----------|
| LCL-FOCUS | Any interactive CMP | Focused control | Business eligibility |
| LCL-PANEL | SCR-04 Compact/Medium | Which stacked zone is expanded | Domain graph edits |
| LCL-DRAFT-PLAN | SCR-02 / CMP-INPUT-PLANNING | Draft planning input text before submit | Feasibility scoring |
| LCL-DRAFT-OPP | SCR-04 / CMP-TASK-PANEL | Draft opportunity fields before submit | CRM Domain rules |
| LCL-UPLOAD-PICK | SCR-03 / CMP-UPLOAD-TENDER | Selected file handle before Command | Parsing / extraction |
| LCL-ROW-HOVER | SCR-07 / SCR-08 | Hover/selection highlight | — |
| LCL-DOC-SELECT | SCR-08 | Selected document id for artifact actions | Cross-tenant access logic |
| LCL-OPS-FOCUS | SCR-09 | Focused ops area presentation | Provisioning logic |
| LCL-LANG-UI | SCR-01 | Language selector open/closed | Localization pipeline ownership |

## 4.3 Ownership rules

| Rule | Statement |
|------|-----------|
| L-01 | Drafts remain ST-LOCAL until ACT/Command issued |
| L-02 | Clearing ST-LOCAL must not call Domain delete APIs unless user issued that Command |
| L-03 | Local state must not bypass GRD-* by fabricating session |

---

# 5. Shared Client State (ST-SHARED)

## 5.1 Definition

Presentation context shared across Screens within a session **without** becoming Domain truth.

## 5.2 Catalogue

| State key | Content | Written by | Read by |
|-----------|---------|------------|---------|
| SHR-PROJECT-CUE | Opaque `projectId` for SHELL-CONTEXT | Resume / intake success / route param | SCR-04…08, shell |
| SHR-GOAL-CUE | Last chosen goal (Builder/Tender/Sales) for orientation | ACT-01-03/04/05 | Optional workspace chrome |
| SHR-RETURN-TO | Deep-link resume path after sign-in | GRD-SESSION redirect | Post sign-in navigation |
| SHR-LIBRARY-CATEGORY | Last document category label | INT-LIB-CATEGORY | SCR-08 presentation |
| SHR-BP-CLASS | Active breakpoint class BP-* | Responsive observer | Layout adaptation |

## 5.3 Ownership rules

| Rule | Statement |
|------|-----------|
| H-01 | Shared state holds IDs and cues — not Domain aggregates rebuilt client-side |
| H-02 | SHR-PROJECT-CUE must match route param when both present (route wins on entry) |
| H-03 | Shared state must not store secrets or raw auth tokens beyond what existing session mechanism already uses |
| H-04 | Invalid Domain id in cue → Empty/error presentation + navigate guidance (PD-4.2 soft gate) |

---

# 6. Server State (ST-SERVER)

## 6.1 Definition

Data owned by existing Domains, loaded through existing APIs (PD-2.4), presented as Objects (PD-3.1).

## 6.2 Catalogue (by Object)

| Server slice | Object(s) | Typical Screens | Primary Domain (PD-2.5) | Loaded via |
|--------------|-----------|-----------------|-------------------------|------------|
| SRV-SESSION-USER | — (session observation) | SCR-01+ | M13 | Existing auth API |
| SRV-PROJECT | OBJ-02 | SCR-04, SCR-07 | M13 | Project APIs |
| SRV-INPUTS | OBJ-03 | SCR-02 | M14 (+M11 support) | Plan/budget nearest APIs |
| SRV-TENDER | OBJ-04, OBJ-05 | SCR-03 | M11 | Tender intake APIs |
| SRV-REQUIREMENTS | OBJ-06 | SCR-04 | M11 | Tender analyze/nearest |
| SRV-OPPORTUNITY | OBJ-07 | SCR-04 | M14 | Sales APIs |
| SRV-TASK-PROGRESS | OBJ-08, OBJ-09 | SCR-04 | M12/M13 | Workspace/autopilot surfaces |
| SRV-SOLUTION | OBJ-10 | SCR-05 | M14 | PDF/proposal APIs |
| SRV-BUDGET | OBJ-11 | SCR-06 | M14 | Budget APIs |
| SRV-DOCUMENTS | OBJ-12, OBJ-13 | SCR-08 | M11 | Documents + PDF APIs |
| SRV-OPS | OBJ-14…18 | SCR-09 | M13/M15 | Enterprise-saas + ops APIs |

## 6.3 Ownership rules

| Rule | Statement |
|------|-----------|
| V-01 | ST-SERVER is read into UI as view models — mutations only via Commands |
| V-02 | Do not merge slices into a client “enterprise Domain model” |
| V-03 | Missing server slice → ST-META empty/error, not fabricated Domain defaults that imply business truth |
| V-04 | NAV/PREF Commands do not invent fake server slices |

---

# 7. Derived State (ST-DERIVED)

## 7.1 Definition

Pure presentation projections computed from ST-LOCAL / ST-SHARED / ST-SERVER / route.

## 7.2 Catalogue

| Derived key | Inputs | Output | Allowed | Forbidden |
|-------------|--------|--------|---------|-----------|
| DER-PROJECT-LIST-VIEW | SRV-PROJECT list | Sorted/filtered display rows | Sort by created date display | Hide projects by unpaid business rule invented in UI |
| DER-DOC-BY-CATEGORY | SRV-DOCUMENTS + category | Items in one of four categories | Category filter | New categories |
| DER-SHELL-CONTEXT-LABEL | SHR-PROJECT-CUE + SRV-PROJECT | Display name cue | Label mapping | Entitlement checks |
| DER-FORWARD-ENABLED | Screen readiness flags from meta + server presence | Whether forward control appears enabled | Reflect “inputs present” as UI readiness | Domain validation engines |
| DER-GP-STEP | Current route | Which Golden Path step label to show (optional chrome) | Orientation | Forcing path with business locks |

## 7.3 Ownership rules

| Rule | Statement |
|------|-----------|
| Y-01 | Derived functions must be side-effect free |
| Y-02 | Derived state must recompute when inputs change — not persist as independent truth |
| Y-03 | No Domain policy evaluation inside derived functions |

---

# 8. Cache / Invalidation

## 8.1 Cache purpose

Frontend may cache ST-SERVER **display snapshots** to avoid redundant fetches.  
Cache is a performance/presentation concern — not Domain redesign.

## 8.2 Cache scopes

| Scope | Examples | Invalidate when |
|-------|----------|-----------------|
| Screen fetch cache | Project list on SCR-07 | Leave+reenter with stale policy; after Continue/create Commands; explicit refresh |
| Project-scoped cache | Solution/Budget/Documents for `projectId` | Successful Command that may change that project’s artifacts; project cue change |
| Session cache | Auth me observation | Sign-in / logout / auth failure |
| Ops cache | SCR-09 areas | Area remount / manual refresh / successful ops-relevant Command (if any) |

## 8.3 Invalidation triggers (Command-driven)

| After Command class | Invalidate |
|---------------------|------------|
| Intake submit / upload / confirm / generate | Project-scoped workspace + result + documents caches |
| Download/Share | Optional; usually no list invalidation required |
| Continue project | Ensure workspace cache keyed by new `projectId` |
| Sign In / logout | Session + all ST-SERVER presentation caches |
| NAV-only | No Domain cache invalidation |

## 8.4 Rules

| Rule | Statement |
|------|-----------|
| C-01 | Stale UI must prefer refetch over inventing values |
| C-02 | Cache keys include opaque ids only — not business scores |
| C-03 | Do not build write-through Domain replication |
| C-04 | Invalidation does not mean Domain rollback |

---

# 9. Loading / Error / Empty State Ownership

## 9.1 Meta state (ST-META)

| Meta key | Values | Owner |
|----------|--------|-------|
| META-LOADING | idle / loading / success | Frontend |
| META-ERROR | none / message + optional retry intent | Frontend |
| META-EMPTY | false / true (+ guidance target route) | Frontend |

## 9.2 Ownership matrix

| Concern | Owner | Not owner |
|---------|-------|-----------|
| Whether fetch is in flight | UI (ST-META) | Domain |
| User-visible error copy | UI (user language, PD-3.7) | Engine stack traces |
| Empty list guidance | UI + allowed routes (PD-4.2) | New Features |
| Why Domain rejected a Command | Existing API error surface mapped to UI message | UI-invented business codes |
| Retry | Re-issue same Command / refetch | Alternate Domain workflow invented in UI |

## 9.3 Per-Screen meta binding

| Screen | Loading owns | Empty owns | Error owns |
|--------|--------------|------------|------------|
| SCR-01 | Auth observation | — | Auth failure presentation |
| SCR-02/03 | Start/upload/status fetches | — | Intake Command failures |
| SCR-04 | Context/task loads | Missing project cue guidance | Workspace Command failures |
| SCR-05/06 | Result loads | No result → guide workspace | Result unavailable |
| SCR-07 | List load | No projects → Home/goal guidance | List failure |
| SCR-08 | Library load | No docs in category | Library failure |
| SCR-09 | Area loads | Area empty observation | Area failure |

## 9.4 Rules

| Rule | Statement |
|------|-----------|
| M-01 | META-* must not encode Domain lifecycle states beyond Objects |
| M-02 | Color-only status forbidden (PD-3.7) |
| M-03 | Empty ≠ 404 route (PD-4.2 FB-02) |

---

# 10. Session / Context State

## 10.1 Session presentation (ST-SESSION)

| Key | Content | Source |
|-----|---------|--------|
| SES-SIGNED-IN | boolean presentation | Existing `/api/auth/me` (or equivalent PD-2.4) |
| SES-DISPLAY-NAME | optional label | Auth API |
| SES-OPS-CAPABLE | boolean presentation for `/admin` gate | Existing auth/ops observation only |

Rules:

| Rule | Statement |
|------|-----------|
| SE-01 | SES-* mirrors API observation — UI does not mint roles |
| SE-02 | GRD-SESSION / GRD-OPS read SES-* only |
| SE-03 | No credential storage in ST-LOCAL/SHARED beyond existing session mechanism |

## 10.2 Navigation context (ST-CONTEXT)

| Key | Content | Source |
|-----|---------|--------|
| CTX-ROUTE | Current path | Router (PD-4.2) |
| CTX-PROJECT-ID | Opaque id | Query param / SHR-PROJECT-CUE |
| CTX-DOCUMENT-ID | Opaque id | Selection on SCR-08 |
| CTX-DOC-CATEGORY | One of four labels | Query / SHR-LIBRARY-CATEGORY |
| CTX-ADMIN-AREA | Optional ops area | Query `area=` |

Rules:

| Rule | Statement |
|------|-----------|
| CX-01 | Route params win on Screen entry; then sync SHR-* |
| CX-02 | Context ids do not imply Domain authorization success |
| CX-03 | Clearing context navigates or shows Empty — does not delete Domain project |

---

# 11. State Flow

## 11.1 Canonical flow

```
INT-* (user)
  → update ST-LOCAL (draft/selection) as needed
  → ACT-* / Command
  → [if API] set META-LOADING
  → Existing API → Domain
  → on success: write ST-SERVER slice; clear relevant drafts; invalidate caches
  → on failure: set META-ERROR
  → [if NAV] update CTX-ROUTE / SHR-*
  → recompute ST-DERIVED
  → render
```

## 11.2 Flow by example

| User step | State changes |
|-----------|---------------|
| Enter planning inputs | LCL-DRAFT-PLAN updates |
| Continue to workspace | Command → API; SHR-PROJECT-CUE set; navigate `/workspace`; invalidate project caches |
| Open solution | META-LOADING → SRV-SOLUTION filled → Ready |
| Select document + download | LCL-DOC-SELECT → Command download → no Domain list fabricate |
| Sign out | Clear SES-*; invalidate all ST-SERVER presentation caches; navigate `/` |

## 11.3 Flow rules

| Rule | Statement |
|------|-----------|
| F-01 | No Command ⇒ no Domain mutation assumed |
| F-02 | NAV-only Commands skip ST-SERVER writes |
| F-03 | Derived recalculation happens after server/shared/local updates |

---

# 12. State Freeze Summary

## Locked statements

```
STATE_BASELINE_ID     = product-frontend-state-v1
STATE_UI_BASELINE_REF = product-ui-baseline-v1
STATE_ROUTE_REF       = product-frontend-routing-v1
DOMAIN_TRUTH          = existing M11–M15 via PD-2.4 APIs
UI_OWNS_BUSINESS_LOGIC= false
NO_SHADOW_DOMAIN      = true
```

## Locked inventories

| Item | Locked |
|------|--------|
| State classes | ST-LOCAL / SHARED / SERVER / DERIVED / META / SESSION / CONTEXT |
| Product Screens using state | SCR-01…09 |
| Server slices | SRV-* mapped to OBJ-* only |
| Document categories in derived/filter | Exactly four |

## Immutable prohibitions

1. No business logic in any state class.  
2. No new Domain entities in client state.  
3. No new APIs for state hydration.  
4. No replacement of PD-4.1 / PD-4.2 boundaries.

---

# 13. Release Gate

## Gate ID

`product-frontend-state-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| ST-TAX | Taxonomy complete | All seven classes defined |
| ST-OWN | Ownership clear | Local/shared/meta vs server truth separated |
| ST-FLOW | Flow compliant | INT→Action→API→Domain→UI; no UI business logic |
| ST-CACHE | Cache rules present | Invalidation Command-driven; no Domain replication |
| ST-META | L/E/E ownership defined | Per-Screen meta binding |
| ST-SES | Session/context bounded | Existing auth only; route cues only |
| ST-SCOPE | No upstream mutation | PD-1…3 / PD-4.1–4.2 / M11–M15 untouched; no new files beyond this doc |

## Verdict

```
PD-4.3 Gate = PASS
  iff ST-TAX ∧ ST-OWN ∧ ST-FLOW ∧ ST-CACHE
    ∧ ST-META ∧ ST-SES ∧ ST-SCOPE all PASS
```

---

# 14. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-ST-01 | State taxonomy defined | ✓ |
| AC-ST-02 | Local / shared / server / derived defined | ✓ |
| AC-ST-03 | Cache / invalidation defined | ✓ |
| AC-ST-04 | Loading / error / empty ownership defined | ✓ |
| AC-ST-05 | Session / context state defined | ✓ |
| AC-ST-06 | State flow defined | ✓ |
| AC-ST-07 | Freeze summary + Release Gate present | ✓ |
| AC-ST-08 | Frontend owns no business logic; Domains/APIs existing only | ✓ |
| AC-ST-09 | Markdown only; no additional files; upstream unmodified | ✓ |

## Verdict

```
PD-4.3 document PASS iff AC-ST-01 … AC-ST-09 PASS
```

---

# Document Statement

PD-4.3 Frontend State Management locks what the UI may remember and what it must refetch.

```
UI state     = presentation + cues + meta
Server state = existing Domains via existing APIs
Derived      = pure view projection
Business logic = never in frontend state
```
