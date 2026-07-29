# PD-3.2 — Navigation & Layout

## Status

**Frozen**

## Type

Product Design

## Version

`product-planning-pd-3.2-v1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

- `PD-3.1-information-architecture.md`
- `PD-2.1-feature-catalog.md`
- `PD-2.2-screen-map.md`
- `PD-2.3-user-action-map.md`

## Purpose

Define **MVP navigation hierarchy** and **structural layout patterns** for Screens SCR-01…SCR-09.

This document answers:

- Where can the user go?
- What is the global app shell?
- Which layout pattern each Screen uses?

It does **not** define visual styling, components, APIs, Domains, permissions, or business logic.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Navigation principles | Goal-based, Project-centric |
| Navigation hierarchy | Global + contextual + path flows |
| Global app shell | Structural regions only |
| Layout patterns | Named patterns mapped to Screens |
| Screen layout mapping | SCR-01…SCR-09 |
| Navigation rules | Allowed / forbidden moves |
| Acceptance criteria | Planning-level pass/fail |

## Out of scope

| Item | Reason |
|------|--------|
| React / Next.js | No implementation |
| Component design | No widgets, buttons, cards as UI kit |
| Visual styling | Color, typography, spacing, motion |
| API / database / state | Owned elsewhere |
| Permission logic | Not navigation design |
| Business logic in UI | UI owns no business logic |
| M11–M15 / PD-1 / PD-2 changes | Frozen inputs |
| New Screens or Features | MVP only |

## Design chain

```
PD-2.1 Features
    ↓
PD-2.2 Screens
    ↓
PD-2.3 Actions
    ↓
PD-3.1 Information Architecture
    ↓
PD-3.2 Navigation & Layout   ← this document
```

---

# 2. Navigation Principles

1. **Navigate by goals**, not by technical modules.
2. **Project** is the continuity anchor after entry (PD-3.1).
3. **First-time** users enter via Business Goal cards on Homepage.
4. **Returning** users enter via My Projects.
5. **AI Workspace** is the primary work surface; AI is a guide inside it, not a separate nav product.
6. **Results** (Solution / Budget) and **Documents** are reachable from work, not buried in engines.
7. **Operations** (Admin) is a separate shell path — not mixed into customer Golden Paths.
8. **One primary forward action** per Screen whenever possible.
9. **UI owns no business logic** — navigation only moves the user between Screens / zones; Commands remain as defined in PD-2.3.
10. Complexity appears only when needed (intake → workspace → results → documents).

---

# 3. Navigation Hierarchy

## 3.1 Global destinations (user-facing)

| Nav ID | Label | Target Screen | Who | IA Layer |
|--------|-------|---------------|-----|----------|
| NAV-HOME | Home | SCR-01 | Customer personas / returning | L1 |
| NAV-PROJECTS | My Projects | SCR-07 | Returning users | L5 |
| NAV-DOCUMENTS | My Documents | SCR-08 | Customer personas | L6 |
| NAV-WORKSPACE | AI Workspace | SCR-04 | Active project users | L3 |
| NAV-ADMIN | Admin | SCR-09 | PER-06 only (entry path) | L7 |

**Not global nav items** (reached by goal or flow, not persistent top-level for all users):

| Destination | Screen | How reached |
|-------------|--------|-------------|
| Enterprise Builder Entry | SCR-02 | Goal from SCR-01 |
| Tender Intelligence Entry | SCR-03 | Goal from SCR-01 |
| Solution Result | SCR-05 | From Workspace / flow |
| Budget Result | SCR-06 | From Workspace / Solution |

## 3.2 Goal entry branch (from Home)

```
SCR-01 Home
├── Enterprise Builder     → SCR-02 → SCR-04
├── Tender Intelligence    → SCR-03 → SCR-04
├── Sales Center           → SCR-04
└── My Projects            → SCR-07
```

## 3.3 Work → Result → Artifact branch

```
SCR-04 AI Workspace
├── Solution Result        → SCR-05
├── Budget Result          → SCR-06
└── Documents              → SCR-08

SCR-05 Solution Result
├── Budget Result          → SCR-06
├── Documents              → SCR-08
└── AI Workspace           → SCR-04

SCR-06 Budget Result
├── Solution Result        → SCR-05
├── Documents              → SCR-08
└── AI Workspace           → SCR-04  (Adjust Requirements)
```

## 3.4 Continuity branch

```
SCR-07 My Projects
├── Continue Project       → SCR-04
└── View Documents         → SCR-08

SCR-08 My Documents
├── My Projects            → SCR-07
└── AI Workspace           → SCR-04
```

## 3.5 Operations branch

```
Admin entry → SCR-09 Admin Dashboard
  (Organizations · Users · Usage · Security · Governance
   are areas on the same Screen — not separate Screens)
```

## 3.6 Hierarchy depth (MVP)

| Depth | Meaning | Examples |
|-------|---------|----------|
| 0 | Shell / Home | SCR-01, SCR-09 |
| 1 | Primary destinations | SCR-02, SCR-03, SCR-04, SCR-07, SCR-08 |
| 2 | Outcome Screens | SCR-05, SCR-06 |

MVP navigation depth stays shallow: **goal → work → result → documents**.

---

# 4. Global App Shell

Structural regions only. No chrome styling. No component specs.

## 4.1 Shell regions

```
┌──────────────────────────────────────────────────────────┐
│ SHELL-HEADER                                             │
│  Brand · (optional) Global Nav · Access (Sign In / Lang) │
├──────────────────────────────────────────────────────────┤
│ SHELL-CONTEXT (optional)                                 │
│  Current Project name / path cue when in work or results │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ SHELL-MAIN                                               │
│  Active Screen content (SCR-01…SCR-09)                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ SHELL-FOOTER (optional on marketing/entry)               │
│  Secondary links only — not primary task navigation      │
└──────────────────────────────────────────────────────────┘
```

## 4.2 Region rules

| Region | Present on | Contains (structure) | Must not contain |
|--------|------------|----------------------|------------------|
| SHELL-HEADER | All customer Screens; Admin may simplify | Brand, access, global destinations as allowed | Engine names, Domain names, API links |
| SHELL-CONTEXT | SCR-04, SCR-05, SCR-06, SCR-08 (when Project known) | Project identity cue | Business logic, permissions UI |
| SHELL-MAIN | All Screens | Screen layout pattern (see §5–§6) | Hidden technical modules |
| SHELL-FOOTER | SCR-01 primarily | Non-critical links | Primary Golden Path CTAs |

## 4.3 Shell modes

| Mode | Screens | Global nav emphasis |
|------|---------|---------------------|
| **Entry mode** | SCR-01 | Goals + Sign In + My Projects |
| **Work mode** | SCR-02, SCR-03, SCR-04 | Context Project; path forward |
| **Result mode** | SCR-05, SCR-06 | Forward to Budget / Documents / Workspace |
| **Library mode** | SCR-07, SCR-08 | Projects ↔ Documents |
| **Ops mode** | SCR-09 | Admin areas only; no customer goal cards |

---

# 5. Layout Patterns

Named structural patterns. Not visual design. Not components.

| Pattern ID | Name | Structure | Used by |
|------------|------|-----------|---------|
| LAY-ENTRY | Goal Entry | Header · Hero / goal area · Goal destinations · (Footer) | SCR-01 |
| LAY-INTAKE | Single-column Intake | Header · Guide · Input / Upload zone · Primary forward | SCR-02, SCR-03 |
| LAY-SPLIT-3 | Three-zone Workspace | Header · Left conversation · Center task · Right context | SCR-04 |
| LAY-RESULT | Result Review | Header · Summary · Result blocks · Artifact actions · Forward links | SCR-05, SCR-06 |
| LAY-LIST | List + Row Actions | Header · List of items · Per-item actions | SCR-07 |
| LAY-LIBRARY | Category + Items | Header · Category set · Item actions · Return links | SCR-08 |
| LAY-OPS | Ops Areas | Header · Dashboard areas (Orgs / Users / Usage / Security / Governance) | SCR-09 |

## Pattern intents

| Pattern | User intent |
|---------|-------------|
| LAY-ENTRY | Choose where to start |
| LAY-INTAKE | Provide what is needed to begin |
| LAY-SPLIT-3 | Do guided work with context visible |
| LAY-RESULT | Understand outcome and take next step |
| LAY-LIST | Find and resume a Project |
| LAY-LIBRARY | Find and use Documents |
| LAY-OPS | Observe platform operation |

---

# 6. Screen Layout Mapping

## SCR-01 — Homepage → LAY-ENTRY

| Region | Content (from PD-3.1 / PD-2.2) | Navigation / Actions (ref) |
|--------|-------------------------------|----------------------------|
| Header | Brand, Language, Sign In | ACT-01-01, ACT-01-02 |
| Main · Goals | Enterprise Builder · Tender Intelligence · Sales Center | ACT-01-03, ACT-01-04, ACT-01-05 |
| Main · Continuity | My Projects | ACT-01-06 |
| Footer | Optional secondary | — |

**Exits:** SCR-02, SCR-03, SCR-04, SCR-07

---

## SCR-02 — Enterprise Builder Entry → LAY-INTAKE

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| Guide | Start planning / AI welcome | ACT-02-01 |
| Inputs | Company size, location, space, budget, goals | ACT-02-02 |
| Forward | Continue to AI Workspace | ACT-02-03 → SCR-04 |

**Exits:** SCR-04

---

## SCR-03 — Tender Intelligence Entry → LAY-INTAKE

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| Source | Upload tender document | ACT-03-01 |
| Status | AI processing status | ACT-03-02 |
| Forward | Proceed to requirement review | ACT-03-03 → SCR-04 |

**Exits:** SCR-04

---

## SCR-04 — AI Workspace → LAY-SPLIT-3

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| Left | AI conversation | ACT-04-01 |
| Center | Current task (confirm requirements, capture opportunity, generate, etc.) | ACT-04-03, ACT-04-04, ACT-04-05 |
| Right | Project context (project, requirements, progress, documents link) | ACT-04-02, ACT-04-08 |
| Outcomes | Open Solution / Open Budget | ACT-04-06 → SCR-05, ACT-04-07 → SCR-06 |

**Exits:** SCR-05, SCR-06, SCR-08  
**Entries:** SCR-02, SCR-03, SCR-01 (Sales), SCR-07

---

## SCR-05 — Solution Result → LAY-RESULT

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| Summary | Solution / proposal / package overview | ACT-05-01, ACT-05-02 |
| Result blocks | Planning · Configuration · Budget (summary) | — |
| Artifact actions | Download · Share | ACT-05-03, ACT-05-04 |
| Forward | Continue to Budget · Documents · Workspace | ACT-05-05 → SCR-06, ACT-05-06 → SCR-08, ACT-05-07 → SCR-04 |

**Exits:** SCR-06, SCR-08, SCR-04

---

## SCR-06 — Budget Result → LAY-RESULT

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| Overview | Investment range, category breakdown, options | ACT-06-01 |
| Artifact actions | Download Budget | ACT-06-02 |
| Forward | Adjust Requirements · Documents · Solution | ACT-06-03 → SCR-04, ACT-06-04 → SCR-08, ACT-06-05 → SCR-05 |

**Exits:** SCR-04, SCR-08, SCR-05

---

## SCR-07 — My Projects → LAY-LIST

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| List | Projects (name, status, created date) | ACT-07-01 |
| Row actions | Continue · View Documents | ACT-07-02 → SCR-04, ACT-07-03 → SCR-08 |

**Exits:** SCR-04, SCR-08  
**Entries:** SCR-01, global NAV-PROJECTS

---

## SCR-08 — My Documents → LAY-LIBRARY

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| Categories | Solution · Budget · Tender · Delivery | ACT-08-01 |
| Item actions | Preview · Download · Share | ACT-08-02, ACT-08-03, ACT-08-04 |
| Return | My Projects · AI Workspace | ACT-08-05 → SCR-07, ACT-08-06 → SCR-04 |

**Exits:** SCR-07, SCR-04 (, SCR-01 via shell Home)  
**Entries:** SCR-05, SCR-06, SCR-07, SCR-04

---

## SCR-09 — Admin Dashboard → LAY-OPS

| Region | Content | Navigation / Actions (ref) |
|--------|---------|----------------------------|
| Areas | Organizations · Users · Usage · Security · Governance | ACT-09-01…06 |

**Exits:** — (ops surface)  
**Entries:** Admin entry only (not customer Golden Path)

---

## Mapping summary

| Screen | Layout pattern | Shell mode |
|--------|----------------|------------|
| SCR-01 | LAY-ENTRY | Entry |
| SCR-02 | LAY-INTAKE | Work |
| SCR-03 | LAY-INTAKE | Work |
| SCR-04 | LAY-SPLIT-3 | Work |
| SCR-05 | LAY-RESULT | Result |
| SCR-06 | LAY-RESULT | Result |
| SCR-07 | LAY-LIST | Library |
| SCR-08 | LAY-LIBRARY | Library |
| SCR-09 | LAY-OPS | Ops |

---

# 7. Navigation Rules

## 7.1 Allowed transitions (MVP)

| From | To | Trigger (Action class / ID) | Notes |
|------|----|-----------------------------|-------|
| SCR-01 | SCR-02 | ACT-01-03 | Enterprise Builder goal |
| SCR-01 | SCR-03 | ACT-01-04 | Tender Intelligence goal |
| SCR-01 | SCR-04 | ACT-01-05 | Sales Center goal |
| SCR-01 | SCR-07 | ACT-01-06 | My Projects |
| SCR-02 | SCR-04 | ACT-02-03 | Continue to Workspace |
| SCR-03 | SCR-04 | ACT-03-03 | Proceed to requirement review |
| SCR-04 | SCR-05 | ACT-04-06 | Open Solution Result |
| SCR-04 | SCR-06 | ACT-04-07 | Open Budget Result |
| SCR-04 | SCR-08 | ACT-04-08 | Open Documents |
| SCR-05 | SCR-06 | ACT-05-05 | Continue to Budget |
| SCR-05 | SCR-08 | ACT-05-06 | Open Documents |
| SCR-05 | SCR-04 | ACT-05-07 | Return to Workspace |
| SCR-06 | SCR-04 | ACT-06-03 | Adjust Requirements |
| SCR-06 | SCR-08 | ACT-06-04 | Open Documents |
| SCR-06 | SCR-05 | ACT-06-05 | Return to Solution |
| SCR-07 | SCR-04 | ACT-07-02 | Continue Project |
| SCR-07 | SCR-08 | ACT-07-03 | Open Project Documents |
| SCR-08 | SCR-07 | ACT-08-05 | Return to Projects |
| SCR-08 | SCR-04 | ACT-08-06 | Return to Workspace |
| — | SCR-09 | Admin entry | Ops mode only |

Global shell may also return to **SCR-01 (Home)** or **SCR-07 / SCR-08** when those destinations are available in the current shell mode — without inventing new Screens.

## 7.2 Golden Path navigation (must remain intact)

| Path | Screen sequence |
|------|-----------------|
| GP-01 | SCR-01 → SCR-02 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| GP-01R | SCR-01 → SCR-07 → SCR-04 |
| GP-02 | SCR-01 → SCR-03 → SCR-04 → SCR-05 → SCR-08 |
| GP-03 | SCR-01 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| GP-04 | SCR-09 |

## 7.3 Forbidden navigation patterns

| Forbidden | Reason |
|-----------|--------|
| Navigate to Quote / Budget / Tender **Engines** as destinations | Hidden from IA (PD-3.1) |
| Customer Golden Path forced through SCR-09 | Ops is separate |
| Jump SCR-01 → SCR-05 / SCR-06 without Workspace or Intake | Breaks goal → work → result |
| Treat Document categories as separate Screens | Categories are zones on SCR-08 |
| Split Admin areas into new Screens in MVP | LAY-OPS keeps areas on SCR-09 |
| UI decides business outcomes | UI owns no business logic; Actions/Commands stay PD-2.3 |

## 7.4 Layout rules

| Rule | Requirement |
|------|-------------|
| One pattern per Screen | As mapped in §6 |
| One primary forward where PD-2.2 defines Continue / Next | Intake and Result Screens |
| Workspace keeps three zones | Conversation · Task · Context |
| Results separate from Documents | SCR-05/06 ≠ SCR-08 |
| No styling mandated | Structure only |

---

# 8. Exclusions

Explicitly excluded from PD-3.2:

1. React / Next.js / any code  
2. Component libraries or control specifications  
3. Visual design system (color, type, spacing, motion)  
4. API routes, schemas, payloads  
5. Database / persistence  
6. Client state management  
7. Permission / RBAC logic  
8. Business rules, pricing, extraction, generation logic  
9. Changes to M11–M15 Domains  
10. Changes to PD-1 / PD-2.x / PD-3.1  
11. New Screens, Features, or Actions  
12. Supplier Hub / Marketplace / Billing checkout navigation  

---

# 9. Acceptance Criteria

Planning-level only. User-oriented where applicable.

## 9.1 Structure acceptance

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-NAV-01 | Every MVP Screen SCR-01…SCR-09 has exactly one Layout Pattern | Pattern assigned in §6 |
| AC-NAV-02 | Global destinations align with PD-3.1 top-level IA (Entry, Projects, Workspace, Documents, Operations) | §3.1 |
| AC-NAV-03 | Goal entry branch matches PD-2.2 Homepage exits | SCR-02 / SCR-03 / SCR-04 / SCR-07 |
| AC-NAV-04 | Allowed transitions cover all PD-2.3 navigation Actions for MVP Screens | §7.1 |
| AC-NAV-05 | Golden Path screen sequences unchanged from PD-2.2 / PD-2.3 | §7.2 |
| AC-NAV-06 | Technical engines are not navigation destinations | §7.3 |
| AC-NAV-07 | UI is described as structure only — no business logic ownership | Principles + Exclusions |
| AC-NAV-08 | No React, components, API, DB, state, or permission design included | Exclusions |

## 9.2 Path acceptance (navigation completeness)

| AC ID | Path | User can navigate | Pass when |
|-------|------|-------------------|-----------|
| AC-NAV-GP01 | GP-01 | Home → Builder → Workspace → Solution → Budget → Documents | All edges exist in §7.1 |
| AC-NAV-GP01R | GP-01R | Home → Projects → Workspace | All edges exist in §7.1 |
| AC-NAV-GP02 | GP-02 | Home → Tender → Workspace → Solution → Documents | All edges exist in §7.1 |
| AC-NAV-GP03 | GP-03 | Home → Workspace → Solution → Budget → Documents | All edges exist in §7.1 |
| AC-NAV-GP04 | GP-04 | Admin → Dashboard areas on SCR-09 | LAY-OPS defined |

## 9.3 Verdict

```
PD-3.2 PASS
  iff AC-NAV-01…08 PASS
  ∧ AC-NAV-GP01, GP01R, GP02, GP03, GP04 PASS
```

---

# Freeze Statement

PD-3.2 Navigation & Layout is frozen for MVP Product Design.

Downstream work must:

- keep Golden Path screen sequences intact,
- use the assigned layout patterns,
- keep UI free of business logic,
- leave Domains, APIs, and PD-1 / PD-2 / PD-3.1 unchanged.
