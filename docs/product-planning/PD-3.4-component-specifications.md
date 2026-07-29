# PD-3.4 — Component Specifications

## Status

**Frozen**

## Type

Product Design

## Version

`product-planning-pd-3.4-v1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

- `PD-3.3-screen-specifications.md`
- `PD-3.2-navigation-layout.md`
- `PD-3.1-information-architecture.md`
- `PD-2.2-screen-map.md`

## Purpose

Define **reusable UI components** for MVP Screens.

Components:

- present Objects and zones,
- emit user intents that map to existing Screen Actions (PD-2.3 / PD-3.3),
- **own no business logic**.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Component catalogue | Reusable product UI building blocks |
| Per-component specification | Role, content, intents, reuse screens |
| Component → Screen mapping | SCR-01…SCR-09 |
| Composition rules | How components assemble under Layout Patterns |
| Acceptance criteria | Spec completeness |

## Out of scope

| Item | Reason |
|------|--------|
| React / implementation | Product Design only |
| Styling / design tokens | Explicitly excluded |
| API / database / state | Not Component Spec |
| Permission logic | Not Component Spec |
| Business logic | Commands / Domains elsewhere |
| New Screens / Features / Objects | Reuse frozen inputs only |
| Modification of PD-1, PD-2, PD-3.1–3.3, M11–M15 | Frozen |

## Design chain

```
PD-2.2 Screens
PD-3.1 Objects / Zones
PD-3.2 Layout Patterns
PD-3.3 Screen Specifications
        ↓
PD-3.4 Component Specifications  ← this document
```

## Component principles

1. **Reusable** across Screens where zones repeat.
2. **Presentational / intent-emitting only** — no business logic.
3. Bind only to existing Objects (PD-3.1) and Screen Actions (PD-3.3).
4. Do not invent Screens, Features, or Objects.
5. Layout Pattern (PD-3.2) owns arrangement; Component owns reusable unit behavior.

---

# 2. Component Catalogue

| Component ID | Name | Family | Primary reuse |
|--------------|------|--------|---------------|
| CMP-SHELL-HEADER | Shell Header | Shell | All customer Screens; Admin may simplify |
| CMP-SHELL-CONTEXT | Shell Context | Shell | SCR-04, SCR-05, SCR-06, SCR-08 |
| CMP-SHELL-FOOTER | Shell Footer | Shell | SCR-01 (optional) |
| CMP-ACCESS-SIGNIN | Sign In Control | Access | SCR-01 |
| CMP-ACCESS-LANGUAGE | Language Selector | Access | SCR-01 |
| CMP-GOAL-CARD | Goal Entry Card | Entry | SCR-01 |
| CMP-NAV-CONTINUITY | Continuity Link | Entry | SCR-01 |
| CMP-GUIDE-PANEL | Guide Panel | Intake | SCR-02, SCR-03 |
| CMP-INPUT-PLANNING | Planning Inputs Group | Intake | SCR-02 |
| CMP-UPLOAD-TENDER | Tender Upload Area | Intake | SCR-03 |
| CMP-STATUS-PROCESS | Processing Status | Intake | SCR-03 |
| CMP-FORWARD-PRIMARY | Primary Forward Control | Shared | SCR-02, SCR-03, SCR-05, SCR-06 |
| CMP-CONV-PANEL | Conversation Panel | Workspace | SCR-04 |
| CMP-TASK-PANEL | Task Panel | Workspace | SCR-04 |
| CMP-CONTEXT-PANEL | Project Context Panel | Workspace | SCR-04 |
| CMP-OUTCOME-LINKS | Outcome Links | Workspace | SCR-04 |
| CMP-RESULT-SUMMARY | Result Summary | Results | SCR-05, SCR-06 |
| CMP-RESULT-BLOCKS | Result Blocks | Results | SCR-05 |
| CMP-BUDGET-OVERVIEW | Budget Overview | Results | SCR-06 |
| CMP-ARTIFACT-ACTIONS | Artifact Action Group | Artifacts | SCR-05, SCR-06, SCR-08 |
| CMP-FORWARD-GROUP | Forward Link Group | Shared | SCR-05, SCR-06, SCR-08 |
| CMP-PROJECT-LIST | Project List | Continuity | SCR-07 |
| CMP-PROJECT-ROW | Project Row | Continuity | SCR-07 |
| CMP-DOC-CATEGORIES | Document Category Set | Library | SCR-08 |
| CMP-DOC-ITEM | Document Item | Library | SCR-08 |
| CMP-OPS-AREA | Operations Area Panel | Ops | SCR-09 |

**Catalogue count: 26** reusable components.

---

# 3. Component Specification Template

| Field | Meaning |
|-------|---------|
| Component ID / Name | Stable ID |
| Purpose | What reusable job it performs |
| Family | Shell / Access / Entry / Intake / Workspace / Results / Artifacts / Continuity / Library / Ops / Shared |
| Displays | Objects / labels (PD-3.1) |
| User intents | What the user can invoke (maps to Screen Actions) |
| Used on Screens | SCR IDs |
| Composes with | Peer / child components |
| Must not | Non-behaviors |
| Business logic | Always **None** |

---

# 4. Component Specifications

## Shell

### CMP-SHELL-HEADER — Shell Header

| Field | Specification |
|-------|----------------|
| Purpose | Provide brand and global access / destination cues |
| Family | Shell |
| Displays | Brand label; optional global destinations (Home, My Projects, My Documents, AI Workspace per PD-3.2) |
| User intents | Navigate Home / Projects / Documents / Workspace when offered |
| Used on Screens | SCR-01…SCR-08; SCR-09 may simplify |
| Composes with | CMP-ACCESS-SIGNIN, CMP-ACCESS-LANGUAGE (on SCR-01) |
| Must not | Show engine/Domain names; own session rules |
| Business logic | None |

### CMP-SHELL-CONTEXT — Shell Context

| Field | Specification |
|-------|----------------|
| Purpose | Show current Project identity cue during work / results / documents |
| Family | Shell |
| Displays | OBJ-02 Project identity (name cue) |
| User intents | Orient user; no independent business decision |
| Used on Screens | SCR-04, SCR-05, SCR-06, SCR-08 |
| Composes with | Screen main content |
| Must not | Compute project status; implement permissions |
| Business logic | None |

### CMP-SHELL-FOOTER — Shell Footer

| Field | Specification |
|-------|----------------|
| Purpose | Hold non-primary secondary links on entry |
| Family | Shell |
| Displays | Secondary links only |
| User intents | Non-critical navigation |
| Used on Screens | SCR-01 (optional) |
| Composes with | CMP-SHELL-HEADER |
| Must not | Host Golden Path primary CTAs |
| Business logic | None |

---

## Access & Entry

### CMP-ACCESS-SIGNIN — Sign In Control

| Field | Specification |
|-------|----------------|
| Purpose | Let user start sign-in from Homepage |
| Family | Access |
| Displays | Sign-in affordance |
| User intents | Sign In → ACT-01-01 |
| Used on Screens | SCR-01 |
| Composes with | CMP-SHELL-HEADER |
| Must not | Implement auth providers; store credentials logic |
| Business logic | None |

### CMP-ACCESS-LANGUAGE — Language Selector

| Field | Specification |
|-------|----------------|
| Purpose | Let user select display language |
| Family | Access |
| Displays | Language options |
| User intents | Select Language → ACT-01-02 |
| Used on Screens | SCR-01 |
| Composes with | CMP-SHELL-HEADER |
| Must not | Own localization content pipeline |
| Business logic | None |

### CMP-GOAL-CARD — Goal Entry Card

| Field | Specification |
|-------|----------------|
| Purpose | Present one Business Goal destination |
| Family | Entry |
| Displays | OBJ-01 Business Goal label (Enterprise Builder / Tender Intelligence / Sales Center) |
| User intents | Choose goal → ACT-01-03 / ACT-01-04 / ACT-01-05 |
| Used on Screens | SCR-01 |
| Composes with | Other CMP-GOAL-CARD instances |
| Must not | Encode product-line business rules |
| Business logic | None |

### CMP-NAV-CONTINUITY — Continuity Link

| Field | Specification |
|-------|----------------|
| Purpose | Open My Projects for returning users |
| Family | Entry |
| Displays | “My Projects” destination |
| User intents | Open My Projects → ACT-01-06 |
| Used on Screens | SCR-01 |
| Composes with | CMP-GOAL-CARD set |
| Must not | List projects itself (that is SCR-07 / CMP-PROJECT-LIST) |
| Business logic | None |

---

## Intake

### CMP-GUIDE-PANEL — Guide Panel

| Field | Specification |
|-------|----------------|
| Purpose | Welcome / start cue for intake |
| Family | Intake |
| Displays | Guide copy for planning or tender start |
| User intents | Start Planning → ACT-02-01 (when on SCR-02) |
| Used on Screens | SCR-02, SCR-03 |
| Composes with | CMP-INPUT-PLANNING or CMP-UPLOAD-TENDER |
| Must not | Run AI models; expose providers |
| Business logic | None |

### CMP-INPUT-PLANNING — Planning Inputs Group

| Field | Specification |
|-------|----------------|
| Purpose | Collect planning inputs |
| Family | Intake |
| Displays | OBJ-03 fields: company size, location, space, budget, goals |
| User intents | Provide Planning Inputs → ACT-02-02 |
| Used on Screens | SCR-02 |
| Composes with | CMP-GUIDE-PANEL, CMP-FORWARD-PRIMARY |
| Must not | Validate business feasibility; price anything |
| Business logic | None |

### CMP-UPLOAD-TENDER — Tender Upload Area

| Field | Specification |
|-------|----------------|
| Purpose | Accept tender source document |
| Family | Intake |
| Displays | OBJ-04 Tender Source upload affordance |
| User intents | Upload Tender Document → ACT-03-01 |
| Used on Screens | SCR-03 |
| Composes with | CMP-STATUS-PROCESS, CMP-FORWARD-PRIMARY |
| Must not | Parse tender content; define storage schema |
| Business logic | None |

### CMP-STATUS-PROCESS — Processing Status

| Field | Specification |
|-------|----------------|
| Purpose | Show whether understanding is in progress / ready |
| Family | Intake |
| Displays | OBJ-05 Processing Status |
| User intents | Observe status → ACT-03-02 |
| Used on Screens | SCR-03 |
| Composes with | CMP-UPLOAD-TENDER |
| Must not | Decide extraction outcomes |
| Business logic | None |

### CMP-FORWARD-PRIMARY — Primary Forward Control

| Field | Specification |
|-------|----------------|
| Purpose | Advance to the next Screen on the path |
| Family | Shared |
| Displays | Primary forward label (Continue / Proceed / Continue to Budget, etc.) |
| User intents | Screen-specific: ACT-02-03, ACT-03-03, ACT-05-05, ACT-06-03 (as used by Screen) |
| Used on Screens | SCR-02, SCR-03, SCR-05, SCR-06 |
| Composes with | Intake or Result components |
| Must not | Choose next Screen via business rules beyond PD-3.2 allowed transitions |
| Business logic | None |

---

## Workspace

### CMP-CONV-PANEL — Conversation Panel

| Field | Specification |
|-------|----------------|
| Purpose | Support guided AI conversation |
| Family | Workspace |
| Displays | Conversation surface for OBJ-08 Current Task guidance |
| User intents | Work in AI Workspace → ACT-04-01 |
| Used on Screens | SCR-04 |
| Composes with | CMP-TASK-PANEL, CMP-CONTEXT-PANEL |
| Must not | Own prompts, models, or agent selection |
| Business logic | None |

### CMP-TASK-PANEL — Task Panel

| Field | Specification |
|-------|----------------|
| Purpose | Present the current task the user must complete |
| Family | Workspace |
| Displays | OBJ-08 Current Task; may surface Requirements confirmation or Opportunity capture affordances |
| User intents | Confirm Requirements → ACT-04-03; Generate Tender Package → ACT-04-04; Capture Opportunity → ACT-04-05; WorkspaceInteract → ACT-04-01 |
| Used on Screens | SCR-04 |
| Composes with | CMP-CONV-PANEL, CMP-CONTEXT-PANEL |
| Must not | Score compliance; compose packages |
| Business logic | None |

### CMP-CONTEXT-PANEL — Project Context Panel

| Field | Specification |
|-------|----------------|
| Purpose | Show project context beside work |
| Family | Workspace |
| Displays | OBJ-02 Project, OBJ-06 Requirements, OBJ-09 Progress, Documents link |
| User intents | View Project Context → ACT-04-02; Open Documents → ACT-04-08 |
| Used on Screens | SCR-04 |
| Composes with | CMP-CONV-PANEL, CMP-TASK-PANEL, CMP-OUTCOME-LINKS |
| Must not | Edit Domain knowledge graphs |
| Business logic | None |

### CMP-OUTCOME-LINKS — Outcome Links

| Field | Specification |
|-------|----------------|
| Purpose | Move from Workspace to Result Screens |
| Family | Workspace |
| Displays | Open Solution / Open Budget destinations |
| User intents | Open Solution Result → ACT-04-06; Open Budget Result → ACT-04-07 |
| Used on Screens | SCR-04 |
| Composes with | CMP-CONTEXT-PANEL |
| Must not | Generate results itself |
| Business logic | None |

---

## Results & Artifacts

### CMP-RESULT-SUMMARY — Result Summary

| Field | Specification |
|-------|----------------|
| Purpose | Present overview of Solution or Budget result |
| Family | Results |
| Displays | OBJ-10 Solution overview and/or OBJ-11 Budget overview (per Screen) |
| User intents | Review Solution → ACT-05-01 / ACT-05-02; Review Budget → ACT-06-01 |
| Used on Screens | SCR-05, SCR-06 |
| Composes with | CMP-RESULT-BLOCKS or CMP-BUDGET-OVERVIEW, CMP-ARTIFACT-ACTIONS |
| Must not | Recalculate content |
| Business logic | None |

### CMP-RESULT-BLOCKS — Result Blocks

| Field | Specification |
|-------|----------------|
| Purpose | Show Solution summary blocks |
| Family | Results |
| Displays | Planning · Configuration · Budget (summary) labels for OBJ-10 |
| User intents | Support review (with CMP-RESULT-SUMMARY) |
| Used on Screens | SCR-05 |
| Composes with | CMP-RESULT-SUMMARY |
| Must not | Define PDF page layout |
| Business logic | None |

### CMP-BUDGET-OVERVIEW — Budget Overview

| Field | Specification |
|-------|----------------|
| Purpose | Show investment information structure |
| Family | Results |
| Displays | OBJ-11: investment range, category breakdown, options |
| User intents | Review Budget → ACT-06-01 |
| Used on Screens | SCR-06 |
| Composes with | CMP-RESULT-SUMMARY, CMP-ARTIFACT-ACTIONS |
| Must not | Own pricing algorithms |
| Business logic | None |

### CMP-ARTIFACT-ACTIONS — Artifact Action Group

| Field | Specification |
|-------|----------------|
| Purpose | Offer Preview / Download / Share on materials |
| Family | Artifacts |
| Displays | Actions for OBJ-12 Document (and result materials) |
| User intents | Download / Share / Preview per Screen Actions (ACT-05-03/04, ACT-06-02, ACT-08-02/03/04) |
| Used on Screens | SCR-05, SCR-06, SCR-08 |
| Composes with | CMP-RESULT-SUMMARY, CMP-DOC-ITEM |
| Must not | Define file formats or share-channel implementations |
| Business logic | None |

### CMP-FORWARD-GROUP — Forward Link Group

| Field | Specification |
|-------|----------------|
| Purpose | Offer allowed next Screens from Results / Documents |
| Family | Shared |
| Displays | Forward destinations (Budget, Documents, Workspace, Solution, Projects) |
| User intents | ACT-05-05…07, ACT-06-03…05, ACT-08-05…06 as applicable |
| Used on Screens | SCR-05, SCR-06, SCR-08 |
| Composes with | Result / Library components |
| Must not | Invent transitions outside PD-3.2 |
| Business logic | None |

---

## Continuity & Library

### CMP-PROJECT-LIST — Project List

| Field | Specification |
|-------|----------------|
| Purpose | Present the user’s projects |
| Family | Continuity |
| Displays | Collection of OBJ-02 Project |
| User intents | List My Projects → ACT-07-01 |
| Used on Screens | SCR-07 |
| Composes with | CMP-PROJECT-ROW |
| Must not | Act as Admin Organizations list |
| Business logic | None |

### CMP-PROJECT-ROW — Project Row

| Field | Specification |
|-------|----------------|
| Purpose | Show one project and its row actions |
| Family | Continuity |
| Displays | OBJ-02: name, status, created date |
| User intents | Continue Project → ACT-07-02; Open Project Documents → ACT-07-03 |
| Used on Screens | SCR-07 |
| Composes with | CMP-PROJECT-LIST |
| Must not | Compute status workflows |
| Business logic | None |

### CMP-DOC-CATEGORIES — Document Category Set

| Field | Specification |
|-------|----------------|
| Purpose | Browse fixed document categories |
| Family | Library |
| Displays | OBJ-13: Solution, Budget, Tender, Delivery |
| User intents | Browse Document Categories → ACT-08-01 |
| Used on Screens | SCR-08 |
| Composes with | CMP-DOC-ITEM |
| Must not | Add categories beyond MVP four |
| Business logic | None |

### CMP-DOC-ITEM — Document Item

| Field | Specification |
|-------|----------------|
| Purpose | Represent one document in a category |
| Family | Library |
| Displays | OBJ-12 Document identity |
| User intents | Select document for Preview / Download / Share via CMP-ARTIFACT-ACTIONS |
| Used on Screens | SCR-08 |
| Composes with | CMP-DOC-CATEGORIES, CMP-ARTIFACT-ACTIONS |
| Must not | Render proprietary viewer engines |
| Business logic | None |

---

## Operations

### CMP-OPS-AREA — Operations Area Panel

| Field | Specification |
|-------|----------------|
| Purpose | Present one Admin observation area |
| Family | Ops |
| Displays | One of OBJ-14…OBJ-18 (Organizations / Users / Usage / Security / Governance) |
| User intents | View Admin Dashboard / area → ACT-09-01…06 |
| Used on Screens | SCR-09 |
| Composes with | Other CMP-OPS-AREA instances on SCR-09 |
| Must not | Provision tenants; implement RBAC; become separate Screens |
| Business logic | None |

---

# 5. Component-to-Screen Mapping

| Screen | Layout Pattern | Components |
|--------|----------------|------------|
| SCR-01 | LAY-ENTRY | CMP-SHELL-HEADER, CMP-ACCESS-SIGNIN, CMP-ACCESS-LANGUAGE, CMP-GOAL-CARD (×3 goals), CMP-NAV-CONTINUITY, CMP-SHELL-FOOTER (optional) |
| SCR-02 | LAY-INTAKE | CMP-SHELL-HEADER, CMP-GUIDE-PANEL, CMP-INPUT-PLANNING, CMP-FORWARD-PRIMARY |
| SCR-03 | LAY-INTAKE | CMP-SHELL-HEADER, CMP-GUIDE-PANEL, CMP-UPLOAD-TENDER, CMP-STATUS-PROCESS, CMP-FORWARD-PRIMARY |
| SCR-04 | LAY-SPLIT-3 | CMP-SHELL-HEADER, CMP-SHELL-CONTEXT, CMP-CONV-PANEL, CMP-TASK-PANEL, CMP-CONTEXT-PANEL, CMP-OUTCOME-LINKS |
| SCR-05 | LAY-RESULT | CMP-SHELL-HEADER, CMP-SHELL-CONTEXT, CMP-RESULT-SUMMARY, CMP-RESULT-BLOCKS, CMP-ARTIFACT-ACTIONS, CMP-FORWARD-GROUP / CMP-FORWARD-PRIMARY |
| SCR-06 | LAY-RESULT | CMP-SHELL-HEADER, CMP-SHELL-CONTEXT, CMP-RESULT-SUMMARY, CMP-BUDGET-OVERVIEW, CMP-ARTIFACT-ACTIONS, CMP-FORWARD-GROUP / CMP-FORWARD-PRIMARY |
| SCR-07 | LAY-LIST | CMP-SHELL-HEADER, CMP-PROJECT-LIST, CMP-PROJECT-ROW |
| SCR-08 | LAY-LIBRARY | CMP-SHELL-HEADER, CMP-SHELL-CONTEXT, CMP-DOC-CATEGORIES, CMP-DOC-ITEM, CMP-ARTIFACT-ACTIONS, CMP-FORWARD-GROUP |
| SCR-09 | LAY-OPS | CMP-SHELL-HEADER (simplified), CMP-OPS-AREA (×5 areas) |

## Coverage check

| Rule | Status |
|------|--------|
| Every MVP Screen has ≥1 component | ✓ |
| Every component maps to ≥1 Screen | ✓ |
| No Screen outside SCR-01…SCR-09 | ✓ |

---

# 6. Component Composition Rules

| Rule ID | Rule |
|---------|------|
| CR-01 | Components assemble only under their Screen’s PD-3.2 Layout Pattern |
| CR-02 | Shell components wrap Screen content; they do not replace Screen purpose |
| CR-03 | CMP-GOAL-CARD is instantiated once per Business Goal on SCR-01 (Builder, Tender, Sales) |
| CR-04 | LAY-SPLIT-3 requires CMP-CONV-PANEL + CMP-TASK-PANEL + CMP-CONTEXT-PANEL together on SCR-04 |
| CR-05 | CMP-ARTIFACT-ACTIONS may appear on Result and Library Screens; intents remain Screen-owned Actions |
| CR-06 | CMP-FORWARD-PRIMARY / CMP-FORWARD-GROUP may only target transitions allowed in PD-3.2 |
| CR-07 | CMP-DOC-CATEGORIES composition is fixed to four labels: Solution, Budget, Tender, Delivery |
| CR-08 | CMP-OPS-AREA instances remain on SCR-09; do not promote each area to a new Screen |
| CR-09 | CMP-PROJECT-LIST is composed of CMP-PROJECT-ROW children |
| CR-10 | Components emit intents only; Screens own Action IDs; Domains own business outcomes |
| CR-11 | No component may embed API calls, persistence, or permission checks in this specification |
| CR-12 | Reuse existing components before inventing new ones; catalogue is closed for MVP unless Product Design revises PD-3.4 |

## Composition by pattern

| Pattern | Required component set |
|---------|------------------------|
| LAY-ENTRY | Header + Goal Cards + Continuity (+ Access) |
| LAY-INTAKE | Guide + (Inputs **or** Upload+Status) + Primary Forward |
| LAY-SPLIT-3 | Conversation + Task + Context (+ Outcome Links) |
| LAY-RESULT | Summary + (Blocks **or** Budget Overview) + Artifact Actions + Forward |
| LAY-LIST | Project List + Project Rows |
| LAY-LIBRARY | Categories + Document Items + Artifact Actions + Forward |
| LAY-OPS | Ops Area Panels (Organizations, Users, Usage, Security, Governance) |

---

# 7. Exclusions

This document excludes:

1. React / Next.js / code  
2. Visual styling  
3. Design tokens / themes  
4. Component library implementation details  
5. API / database  
6. State management  
7. Permission logic  
8. Business logic / algorithms  
9. New Screens, Features, Objects  
10. Modifications to PD-1, PD-2, PD-3.1, PD-3.2, PD-3.3, M11–M15  

---

# 8. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-CMP-01 | Catalogue lists reusable components only | ✓ 26 components |
| AC-CMP-02 | Every component follows the specification template | ✓ |
| AC-CMP-03 | Every component declares Business logic = None | ✓ |
| AC-CMP-04 | Every component maps to ≥1 existing Screen | ✓ |
| AC-CMP-05 | Every MVP Screen has a component mapping | ✓ SCR-01…09 |
| AC-CMP-06 | Displays reference only PD-3.1 Objects / fixed labels | ✓ |
| AC-CMP-07 | User intents map only to existing Screen Actions | ✓ |
| AC-CMP-08 | Composition rules align with PD-3.2 Layout Patterns | ✓ |
| AC-CMP-09 | No React, styling, tokens, API, DB, state, or permission logic | ✓ |
| AC-CMP-10 | Inputs PD-2.2, PD-3.1, PD-3.2, PD-3.3 unmodified | ✓ |

## Verdict

```
PD-3.4 PASS iff AC-CMP-01 … AC-CMP-10 all PASS
```

---

# Freeze Statement

PD-3.4 Component Specifications is frozen for MVP Product Design.

Reusable components are defined for composition into frozen Screens.  
Components present information and emit intents only — they own **no** business logic, and do not alter Domains, APIs, or upstream PD documents.
