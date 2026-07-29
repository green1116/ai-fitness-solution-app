# PD-4.1 — Frontend Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Frontend Architecture

## Version

`product-delivery-pd-4.1-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Layer | Source | Baseline |
|-------|--------|----------|
| Product Blueprint | `docs/product-planning/PD-1-product-blueprint.md` | `product-planning-pd-1-v1` |
| Feature Design | PD-2.1 … PD-2.6 | Frozen |
| UI / UX Design | PD-3.1 … PD-3.8 | `product-ui-baseline-v1` / `product-ui-freeze-1` |
| Domains | M11–M15 | Existing only |

## Purpose

Define the **frontend architecture** that implements the frozen Product Planning / UI baseline.

Frontend:

- presents Screens SCR-01…SCR-09,
- emits Actions / Commands from PD-2.3,
- consumes **existing** APIs (PD-2.4) and **existing** Domains (PD-2.5 / M11–M15),
- **owns no business logic**.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Frontend architecture | Overall layering |
| Presentation layer | Screens / views |
| Route architecture | Route ↔ Screen map |
| Layout architecture | Shell + LAY-* |
| Component layering | CMP-* composition |
| UI ownership | What UI may / may not own |
| State boundary | Client vs server / Domain |
| API consumption | PD-2.4 bindings only |
| Data flow | Screen → Action → API → Domain → UI |
| Error / loading / empty | Presentation states |
| Security boundary | Frontend limits |
| Technical guardrails | Delivery constraints |
| Release Gate | Architecture readiness |
| Freeze summary | Handoff lock points |

## Out of scope

| Item | Reason |
|------|--------|
| React / Next.js code in this document | Architecture only (Markdown) |
| New Screens / Features / Components / Interactions | UI baseline frozen |
| New Domains / Domain changes | M11–M15 read-only |
| New APIs | PD-2.4 existing only |
| Business logic in UI | Forbidden |
| Database / persistence design | Not frontend |
| Modification of PD-1 / PD-2 / PD-3 / M11–M15 | Forbidden |
| Additional files beyond this document | Task constraint |

---

# 2. Frontend Architecture Overview

## 2.1 Layer stack

```
┌─────────────────────────────────────────────┐
│  Presentation (Screens SCR-01…09)           │
│  Layout Shell + LAY-* patterns              │
│  Components CMP-* + Interactions INT-*      │
├─────────────────────────────────────────────┤
│  UI Adapter (no business logic)             │
│  - map Action → Command                     │
│  - map API response → view models           │
│  - loading / error / empty presentation     │
├─────────────────────────────────────────────┤
│  Existing API surface (PD-2.4)              │
├─────────────────────────────────────────────┤
│  Existing Domains M11–M15 (PD-2.5)          │
└─────────────────────────────────────────────┘
```

## 2.2 Architectural principles

1. **Product Planning is source of truth** for Screens, Actions, Components, Interactions.  
2. **UI owns presentation only** — no pricing, extraction, generation, compliance, or Domain rules.  
3. **One Screen ↔ one primary route** (MVP).  
4. **Layout Pattern per Screen** locked by PD-3.2 / PD-3.3.  
5. **Components emit intents**; Screens own Actions; Domains own outcomes.  
6. **Consume existing capabilities only** — APIs from PD-2.4; Domains from PD-2.5.  
7. **Responsive + Accessibility** constraints from PD-3.6 / PD-3.7 apply to all layers above the adapter.  
8. **Golden Paths** GP-01…GP-04 must remain navigable end-to-end.

## 2.3 System context

```
User
  ↓
Frontend (this architecture)
  ↓ Command (PD-2.3)
  ↓
Existing API (PD-2.4)
  ↓
Existing Domain M11–M15 (PD-2.5)
  ↓
Response (observable result only)
  ↓
Frontend view update (presentation)
```

---

# 3. Presentation Layer

## 3.1 Responsibility

| Owns | Does not own |
|------|--------------|
| Render SCR-* per PD-3.3 | Business rules |
| Compose CMP-* per PD-3.4 | Domain computation |
| Host INT-* per PD-3.5 | API schema design |
| Apply BP-* / A11Y-* constraints | Persistence |

## 3.2 Screen inventory (locked)

| Screen | Name | Layout | Primary consumers |
|--------|------|--------|-------------------|
| SCR-01 | Homepage | LAY-ENTRY | PER-01/02/03, returning |
| SCR-02 | Enterprise Builder Entry | LAY-INTAKE | PER-01 |
| SCR-03 | Tender Intelligence Entry | LAY-INTAKE | PER-02 |
| SCR-04 | AI Workspace | LAY-SPLIT-3 | PER-01/02/03 |
| SCR-05 | Solution Result | LAY-RESULT | PER-01/02/03 |
| SCR-06 | Budget Result | LAY-RESULT | PER-01/02/03 |
| SCR-07 | My Projects | LAY-LIST | Returning |
| SCR-08 | My Documents | LAY-LIBRARY | PER-01/02/03 |
| SCR-09 | Admin Dashboard | LAY-OPS | PER-06 |

## 3.3 Presentation rules

| Rule | Statement |
|------|-----------|
| P-01 | Every Screen implements only Actions owned by that Screen (PD-2.3 / PD-3.3) |
| P-02 | Labels follow PD-3.1 user-facing names (no engine/Domain jargon) |
| P-03 | Document categories remain Solution / Budget / Tender / Delivery |
| P-04 | Admin Ops areas remain on SCR-09 (not separate Screens) |
| P-05 | UI never invents Screens beyond SCR-01…09 under `product-ui-freeze-1` |

---

# 4. Route Architecture

## 4.1 Routing principles

1. Routes are a **delivery projection** of frozen Screens — not a new IA.  
2. One primary route per Screen for MVP.  
3. Navigation transitions must match PD-3.2 allowed edges.  
4. Route changes must not encode business eligibility rules (no permission engine in frontend architecture).  
5. Deep links may open a Screen; Domain outcomes still come from existing APIs.

## 4.2 Route ↔ Screen map (logical)

Logical route keys (not framework file paths):

| Route key | Screen | Entry modes |
|-----------|--------|-------------|
| `/` or `/home` | SCR-01 | Entry |
| `/builder` | SCR-02 | Goal: Enterprise Builder |
| `/tender` | SCR-03 | Goal: Tender Intelligence |
| `/workspace` | SCR-04 | Builder / Tender / Sales / Resume |
| `/solution` | SCR-05 | From Workspace |
| `/budget` | SCR-06 | From Workspace / Solution |
| `/projects` | SCR-07 | Continuity |
| `/documents` | SCR-08 | Library |
| `/admin` | SCR-09 | Ops entry |

## 4.3 Golden Path route sequences

| Path | Route sequence |
|------|----------------|
| GP-01 | home → builder → workspace → solution → budget → documents |
| GP-01R | home → projects → workspace |
| GP-02 | home → tender → workspace → solution → documents |
| GP-03 | home → workspace → solution → budget → documents |
| GP-04 | admin |

## 4.4 Route guardrails

| Allowed | Forbidden |
|---------|-----------|
| Navigate along PD-3.2 edges | Routes to Quote/Budget/Tender Engines as products |
| Pass opaque project/document identifiers as route params when needed for presentation | Embed business decision logic in routers |
| Keep SCR-09 off customer Golden Paths | Force GP-01/02/03 through `/admin` |

---

# 5. Layout Architecture

## 5.1 App shell (PD-3.2)

```
SHELL-HEADER   → brand, access, global destinations
SHELL-CONTEXT  → project cue (when Project known)
SHELL-MAIN     → active Screen (LAY-*)
SHELL-FOOTER   → optional non-primary (SCR-01)
```

## 5.2 Shell modes

| Mode | Screens | Emphasis |
|------|---------|----------|
| Entry | SCR-01 | Goals + access + continuity |
| Work | SCR-02, SCR-03, SCR-04 | Forward path + context |
| Result | SCR-05, SCR-06 | Review + artifact + forward |
| Library | SCR-07, SCR-08 | Lists / categories |
| Ops | SCR-09 | Ops areas only |

## 5.3 Layout Pattern binding

| Pattern | Structure (architecture) | Screens |
|---------|--------------------------|---------|
| LAY-ENTRY | Header + goals + continuity | SCR-01 |
| LAY-INTAKE | Guide + capture + forward | SCR-02, SCR-03 |
| LAY-SPLIT-3 | Conversation + Task + Context | SCR-04 |
| LAY-RESULT | Summary + blocks/overview + artifacts + forward | SCR-05, SCR-06 |
| LAY-LIST | List + row actions | SCR-07 |
| LAY-LIBRARY | Categories + items + artifacts + forward | SCR-08 |
| LAY-OPS | Ops area panels | SCR-09 |

## 5.4 Responsive binding (PD-3.6)

| Breakpoint | Architectural effect |
|------------|----------------------|
| BP-EXPANDED | Full pattern structure |
| BP-MEDIUM | Partial collapse / wrap; Context remains reachable |
| BP-COMPACT | Stack zones; all required intents remain reachable |

Layout adaptation **must not** add/remove Screens, Actions, or Components.

---

# 6. Component Layering

## 6.1 Layers

```
Screen (SCR-*)
  └── Layout Pattern (LAY-*)
        └── Shell regions
              └── Feature components (CMP-*)
                    └── Interaction bindings (INT-*)
```

## 6.2 Component families (locked counts)

| Family | Examples | Count role |
|--------|----------|------------|
| Shell | HEADER, CONTEXT, FOOTER | App chrome |
| Access / Entry | SIGNIN, LANGUAGE, GOAL-CARD, CONTINUITY | SCR-01 |
| Intake | GUIDE, INPUT-PLANNING, UPLOAD, STATUS, FORWARD | SCR-02/03 |
| Workspace | CONV, TASK, CONTEXT, OUTCOME | SCR-04 |
| Results / Artifacts | SUMMARY, BLOCKS, BUDGET-OVERVIEW, ARTIFACT-ACTIONS, FORWARD-GROUP | SCR-05/06/08 |
| Continuity / Library | PROJECT-LIST/ROW, DOC-CATEGORIES/ITEM | SCR-07/08 |
| Ops | OPS-AREA | SCR-09 |

**Frozen catalogue size: 26 components (PD-3.4).**

## 6.3 Layering rules

| Rule | Statement |
|------|-----------|
| C-01 | Screens compose Components; Components do not own routing policy beyond emitting nav intents |
| C-02 | Components emit INT-*; they do not call Domains directly in architecture terms |
| C-03 | Reuse CMP-* before inventing UI parts (inventory closed under UI freeze) |
| C-04 | Artifact actions remain shared across Result and Library Screens |
| C-05 | Ops areas are repeated CMP-OPS-AREA instances — not new Screens |

---

# 7. UI Ownership

## 7.1 UI may own

| Ownership | Examples |
|-----------|----------|
| Presentation structure | Zones, layout pattern application |
| View-model shaping for display | Map API fields → labels/lists already defined by Objects |
| Interaction wiring | INT-* → ACT-* |
| Client navigation | Allowed Screen transitions |
| Presentation states | Loading / error / empty UI |
| Accessibility / responsive application | A11Y-*, BP-* |

## 7.2 UI must not own

| Non-ownership | Examples |
|---------------|----------|
| Business logic | Pricing, extraction, generation, compliance scoring |
| Domain rules | M11–M15 policy / lifecycle decisions |
| API contracts | Creating or changing routes/schemas |
| Persistence | Database / stores as source of truth |
| Permission engine | RBAC implementation as product Domain |
| New product surfaces | Screens/Features beyond freeze |

## 7.3 Ownership statement

```
UI = Presentation + Intent emission + API consumption adapter
Domain = Business outcomes via existing APIs
```

---

# 8. State Boundary

## 8.1 State classes

| Class | Location | Allowed content | Forbidden content |
|-------|----------|-----------------|-------------------|
| Ephemeral UI state | Frontend | Focus, open panel, selected row, form draft text, local language preference display | Business eligibility decisions |
| Screen context | Frontend | Current Screen, current Project cue id, selected document id | Domain graph mutations |
| Session presentation | Frontend | Signed-in presentation flag as returned by existing auth API | Auth provider secrets |
| Server / Domain state | Existing APIs + Domains | Projects, requirements, results, documents, ops observations | — |

## 8.2 Boundary rules

| Rule | Statement |
|------|-----------|
| S-01 | Source of truth for business data is existing Domain via existing API |
| S-02 | Frontend may cache display data; cache invalidation is presentation concern, not Domain redesign |
| S-03 | Form drafts on Intake remain UI state until Command is issued |
| S-04 | No frontend-only “shadow Domain” duplicating M11–M15 |
| S-05 | State management technology is an implementation choice — architecture only forbids business logic in client state |

---

# 9. API Consumption

## 9.1 Consumption model

```
INT-* / ACT-* / Command (PD-2.3)
        ↓
UI Adapter
        ↓
Existing API (PD-2.4)     ← preferred /api/v80/* where mapped
        ↓
Existing Domain (PD-2.5)  ← M11–M15 primary ownership
```

## 9.2 Binding kinds (from PD-2.4)

| Kind | Frontend behavior |
|------|-------------------|
| `API` / `API+NAV` | Call existing route; then update view and/or navigate |
| `NAV` | Navigate only — no HTTP required |
| `PREF` | Apply preference presentation (e.g. language) without new API |
| `NEAREST` | Use documented nearest existing surface — do not invent APIs |

## 9.3 Consumption rules

| Rule | Statement |
|------|-----------|
| A-01 | Only APIs listed or classified in PD-2.4 |
| A-02 | Prefer `/api/v80/*` when PD-2.4 marks preferred |
| A-03 | No new API routes created by frontend architecture |
| A-04 | Request/response schemas are not redefined here — consume existing contracts |
| A-05 | NAV/PREF Commands must not be forced into fake HTTP calls |

## 9.4 Domain alignment (read-only)

| Concern | Primary Domain (PD-2.5) |
|---------|-------------------------|
| Knowledge / documents / tender intake | M11 |
| Agent / workspace generation orchestration | M12 |
| OS / projects / admin ops / access | M13 |
| Intelligence / solution / budget / opportunity review | M14 |
| Evolution / share feedback / governance oversight | M15 |

Frontend does not re-implement these Domains.

---

# 10. Data Flow

## 10.1 Canonical flow

```
User Interaction (INT-*)
  → Component intent
  → Screen Action (ACT-*)
  → Command (PD-2.3)
  → Existing API (PD-2.4)   [if Kind requires]
  → Existing Domain (PD-2.5)
  → Observable result
  → UI Adapter maps to Objects (PD-3.1)
  → Screen re-render / Navigation (PD-3.2)
```

## 10.2 Flow by Golden Path (architecture)

| Path | Dominant flow |
|------|----------------|
| GP-01 | Entry → Intake inputs → Workspace → Solution/Budget review → Documents download |
| GP-01R | Projects list → Workspace resume |
| GP-02 | Tender upload/status → Confirm/Generate → Solution → Documents |
| GP-03 | Sales capture → Workspace → Proposal/Budget → Share/Download |
| GP-04 | Admin observe ops areas |

## 10.3 Data flow rules

| Rule | Statement |
|------|-----------|
| D-01 | Data enters UI only as presentation of Objects OBJ-* |
| D-02 | Mutations happen only by issuing Commands to existing APIs |
| D-03 | Navigation is not a substitute for Domain commands when PD-2.4 requires API |
| D-04 | Errors from API surface as presentation states — not Domain redesign |

---

# 11. Error / Loading / Empty States

Presentation-only states. No business retry policy invented beyond user-observable behavior.

## 11.1 State definitions

| UI State | Meaning | User-visible requirement |
|----------|---------|--------------------------|
| Loading | Command/API in flight or Screen bootstrapping | User can perceive progress; primary path not silently dead |
| Empty | No projects / documents / ops rows to show | Explain emptiness; offer allowed next step when defined (e.g. go Home / start goal) |
| Error | Command/API failed or result unavailable | Explain failure in user language; offer retry intent and/or safe navigation back |
| Ready | Content available for Interaction | Normal INT-* enabled |

## 11.2 Screen expectations

| Screen | Loading | Empty | Error |
|--------|---------|-------|-------|
| SCR-01 | Minimal (auth check if any) | N/A for goals | Auth/preference failure message |
| SCR-02 / SCR-03 | While start/upload/status pending | N/A | Upload/start failure understandable |
| SCR-04 | While workspace context loads | Context missing → guide user back to Intake/Projects | Task/command failure visible |
| SCR-05 / SCR-06 | While result loads | No result → return Workspace | Result unavailable message |
| SCR-07 | While list loads | No projects → Continuity empty guidance | List failure message |
| SCR-08 | While library loads | No documents in category | Category/item failure message |
| SCR-09 | While areas load | Area empty observation | Area load failure message |

## 11.3 Rules

| Rule | Statement |
|------|-----------|
| E-01 | Status is never color-only (PD-3.7) |
| E-02 | Error copy avoids engine/Domain jargon |
| E-03 | Loading does not invent Domain progress semantics beyond PD Objects (e.g. OBJ-05 status) |
| E-04 | Empty states do not create new Features |

---

# 12. Security Boundary

## 12.1 Frontend security posture

| Boundary | Rule |
|----------|------|
| Secrets | No Domain secrets, API keys, or credentials stored in presentation code as product architecture |
| Tokens | Session tokens handled only via existing auth surfaces (PD-2.4 DOM-AUTH → M13) |
| Admin surface | `/admin` (SCR-09) is ops path — not mixed into customer Golden Paths |
| Input | Treat Intake uploads/inputs as untrusted presentation payloads until Domain accepts via API |
| Output | Do not render raw internal engine errors to users |

## 12.2 Explicit non-goals for this document

- Permission / RBAC implementation details  
- Threat modeling worksheets  
- Cryptography design  

Those remain outside PD-4.1; frontend must still not bypass existing API auth.

---

# 13. Technical Guardrails

| ID | Guardrail |
|----|-----------|
| G-01 | Do not modify PD-1 / PD-2 / PD-3 / M11–M15 |
| G-02 | Do not add Screens beyond SCR-01…09 under UI freeze |
| G-03 | Do not add Components / Interactions / Layout Patterns outside frozen catalogues |
| G-04 | Do not place business logic in Screens, Components, hooks, or client stores |
| G-05 | Do not create new API routes to “make UI work” |
| G-06 | Do not create new Domains |
| G-07 | Consume PD-2.4 bindings; prefer documented `/api/v80/*` |
| G-08 | Preserve Golden Path sequences |
| G-09 | Honor PD-3.6 breakpoints and PD-3.7 accessibility requirements |
| G-10 | UI labels follow PD-3.1; hide engines and Domain module names |
| G-11 | Delivery code may use React/Next.js later — this architecture document remains Markdown-only and framework-agnostic in ownership rules |
| G-12 | PD-4.1 creates no additional deliverable files beyond itself in this task |

---

# 14. Release Gate

## Gate ID

`product-frontend-architecture-gate`

## Checks

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| FEA-BASE | UI baseline locked | Consumes `product-ui-baseline-v1` / `product-ui-freeze-1` |
| FEA-SCREENS | Screen set locked | Exactly SCR-01…09 in presentation + routes |
| FEA-FLOW | Data flow compliant | Screen → Action → API → Domain → UI; no UI business logic |
| FEA-API | API consumption compliant | PD-2.4 only; no new APIs |
| FEA-DOMAIN | Domain reuse only | PD-2.5 / M11–M15 only; Domains unmodified |
| FEA-STATES | Presentation states defined | Loading / empty / error / ready specified |
| FEA-GUARD | Guardrails present | G-01…G-12 recorded |
| FEA-GP | Golden Paths preserved | GP-01…GP-04 route/screen sequences intact |

## Verdict

```
PD-4.1 Gate = PASS
  iff FEA-BASE ∧ FEA-SCREENS ∧ FEA-FLOW ∧ FEA-API
    ∧ FEA-DOMAIN ∧ FEA-STATES ∧ FEA-GUARD ∧ FEA-GP all PASS
```

---

# 15. Freeze Summary

## What PD-4.1 freezes architecturally

| Item | Locked reference |
|------|------------------|
| UI baseline | `product-ui-baseline-v1` |
| Screens / routes | SCR-01…09 ↔ logical routes §4.2 |
| Layouts | LAY-* + shell modes |
| Components / interactions | PD-3.4 / PD-3.5 catalogues |
| API / Domain | PD-2.4 / PD-2.5 |
| Ownership | UI = presentation; Domain = outcomes |
| Next delivery | Implementation must follow this architecture |

## Handoff statement

```
Product Planning (PD-1…PD-3)     = Frozen
UI Baseline                      = product-ui-baseline-v1
Frontend Architecture (PD-4.1)   = Defined
Frontend owns                    = Presentation + intents + API consumption adapter
Frontend does not own            = Business logic / Domains / new APIs
```

## Downstream

Next Product Delivery steps (not created by this task):

- Frontend route/module scaffolding against §4–§6  
- Adapter implementation against PD-2.4  
- Verification against PD-2.6 Golden Path acceptance + PD-4.1 gate  

---

# Acceptance Criteria (document)

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-FEA-01 | Architecture covers presentation, routes, layouts, components | ✓ |
| AC-FEA-02 | UI ownership and state boundary defined | ✓ |
| AC-FEA-03 | API consumption and data flow defined | ✓ |
| AC-FEA-04 | Error/loading/empty + security boundary defined | ✓ |
| AC-FEA-05 | Technical guardrails + Release Gate defined | ✓ |
| AC-FEA-06 | Freeze summary present | ✓ |
| AC-FEA-07 | No new Screens/Features/Domains/APIs introduced | ✓ |
| AC-FEA-08 | Markdown only; no additional files in this task | ✓ |
| AC-FEA-09 | PD-1 / PD-2 / PD-3 / M11–M15 unmodified | ✓ |

## Verdict

```
PD-4.1 document PASS iff AC-FEA-01 … AC-FEA-09 PASS
```

---

# Document Statement

PD-4.1 Frontend Architecture defines how the frozen Product Planning / UI baseline is delivered as a presentation system.

Frontend consumes existing APIs and Domains only.  
Frontend owns no business logic.
