# PD-3.1 — Information Architecture

## Status

**Frozen**

## Type

Product Design

## Version

`product-planning-pd-3.1-v1`

## Freeze Date

2026-07-29

## Base (Input — read-only)

- `PD-2.1-feature-catalog.md`
- `PD-2.2-screen-map.md`
- `PD-2.3-user-action-map.md`

## Purpose

Define the **MVP Information Architecture**: how product information is organized for users.

IA answers:

- What information exists?
- Where does the user find it?
- How does information group by goal (not by technical module)?

## Rules

1. **Product Design only**
2. **No implementation**
3. **No React / Next.js**
4. **No UI styling** (no color, typography, spacing, components)
5. **No API**
6. **No Domain changes**
7. **Input only** — Screens, Features, Actions from PD-2.1 … PD-2.3
8. Do not modify input documents

---

# 01 IA Principles

1. Organize by **user goals**, not engines or modules.
2. **Project** is the central business object.
3. AI appears as a **guide inside work**, not a separate product silo.
4. First-time entry uses **goal cards**; returning entry uses **Projects**.
5. Results (Solution / Budget) and **Documents** are distinct but linked.
6. Technical concepts stay hidden from user-facing structure.

---

# 02 Top-Level IA Map

```
AI Fitness Solution
│
├── 1. Product Entry          → SCR-01
│     ├── Sign In
│     ├── Language
│     └── Business Goals
│           ├── Enterprise Builder      → SCR-02
│           ├── Tender Intelligence     → SCR-03
│           └── Sales Center            → SCR-04
│
├── 2. Projects               → SCR-07
│     ├── Project List
│     ├── Continue Project              → SCR-04
│     └── Project Documents             → SCR-08
│
├── 3. AI Workspace           → SCR-04
│     ├── Guided Conversation
│     ├── Current Task
│     └── Project Context
│           ├── Project
│           ├── Requirements
│           ├── Progress
│           └── Documents (link)
│
├── 4. Results
│     ├── Solution Result     → SCR-05
│     └── Budget Result       → SCR-06
│
├── 5. Documents              → SCR-08
│     ├── Solution
│     ├── Budget
│     ├── Tender
│     └── Delivery
│
└── 6. Operations             → SCR-09
      ├── Organizations
      ├── Users
      ├── Usage
      ├── Security
      └── Governance
```

---

# 03 IA Layers → Screens

| IA Layer | Purpose | Screen(s) | Primary Features |
|----------|---------|-----------|------------------|
| L1 Product Entry | Choose goal / access | SCR-01 | FEAT-01, FEAT-02, FEAT-03, FEAT-30 |
| L2 Intake | Collect need or tender | SCR-02, SCR-03 | FEAT-10…12, FEAT-20…22 |
| L3 Guided Work | AI-assisted task work | SCR-04 | FEAT-23, FEAT-24, FEAT-31, FEAT-40, FEAT-41 |
| L4 Results | Review outcomes | SCR-05, SCR-06 | FEAT-13, FEAT-14, FEAT-15, FEAT-16, FEAT-32, FEAT-33 |
| L5 Continuity | Resume prior work | SCR-07 | FEAT-50, FEAT-51, FEAT-52 |
| L6 Artifacts | Manage generated files | SCR-08 | FEAT-15, FEAT-16, FEAT-25, FEAT-53…55 |
| L7 Operations | Platform administration | SCR-09 | FEAT-60 |

---

# 04 Information Objects (User-Facing)

Objects users understand. Not Domain models. Not database entities.

| Object ID | Name | Meaning | Lives primarily on | Related Features |
|-----------|------|---------|--------------------|------------------|
| OBJ-01 | **Business Goal** | Why the user entered (Builder / Tender / Sales) | SCR-01 | FEAT-01, FEAT-30 |
| OBJ-02 | **Project** | Central container for one piece of work | SCR-04, SCR-07 | FEAT-41, FEAT-50, FEAT-51 |
| OBJ-03 | **Planning Inputs** | Company size, location, space, budget, goals | SCR-02 | FEAT-11 |
| OBJ-04 | **Tender Source** | Uploaded tender document | SCR-03 | FEAT-20 |
| OBJ-05 | **Processing Status** | Whether understanding is running / ready | SCR-03 | FEAT-21 |
| OBJ-06 | **Requirements** | Confirmed need / extracted constraints | SCR-04 | FEAT-23 |
| OBJ-07 | **Opportunity** | Customer info + requirements (Sales) | SCR-04 | FEAT-31 |
| OBJ-08 | **Current Task** | What the user is doing now in Workspace | SCR-04 | FEAT-40 |
| OBJ-09 | **Progress** | How far the project has advanced | SCR-04 | FEAT-41 |
| OBJ-10 | **Solution** | Planning / proposal / package result | SCR-05 | FEAT-13, FEAT-24, FEAT-32 |
| OBJ-11 | **Budget** | Investment range and breakdown | SCR-06 | FEAT-14, FEAT-32 |
| OBJ-12 | **Document** | Downloadable / shareable file | SCR-08 (also actions on SCR-05/06) | FEAT-15, FEAT-16, FEAT-25, FEAT-33, FEAT-53…55 |
| OBJ-13 | **Document Category** | Solution / Budget / Tender / Delivery | SCR-08 | FEAT-53 |
| OBJ-14 | **Organization** | Tenant/org observation (Admin) | SCR-09 | FEAT-60 |
| OBJ-15 | **User (Admin view)** | Platform user observation | SCR-09 | FEAT-60 |
| OBJ-16 | **Usage** | Platform usage observation | SCR-09 | FEAT-60 |
| OBJ-17 | **Security** | Security observation area | SCR-09 | FEAT-60 |
| OBJ-18 | **Governance** | Governance observation area | SCR-09 | FEAT-60 |

## Object hierarchy

```
Business Goal
    ↓
Project
    ├── Planning Inputs  OR  Tender Source  OR  Opportunity
    ├── Requirements
    ├── Current Task + Progress
    ├── Solution
    ├── Budget
    └── Documents
          ├── Solution
          ├── Budget
          ├── Tender
          └── Delivery
```

Admin Operations sit **beside** the Project tree (not inside a customer Project):

```
Operations
    ├── Organizations
    ├── Users
    ├── Usage
    ├── Security
    └── Governance
```

---

# 05 Screen Content Zones (Structural Only)

Zones describe **what information appears**, not layout styling.

## SCR-01 Homepage

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Access | Sign In, Language | ACT-01-01, ACT-01-02 |
| Goal Entry | Enterprise Builder / Tender Intelligence / Sales Center | ACT-01-03…05 |
| Continuity Entry | My Projects | ACT-01-06 |

## SCR-02 Enterprise Builder Entry

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Guide | AI welcome / planning start | ACT-02-01 |
| Inputs | Company size, location, space, budget, goals | ACT-02-02 |
| Forward | Continue to Workspace | ACT-02-03 |

## SCR-03 Tender Intelligence Entry

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Source | Tender upload | ACT-03-01 |
| Status | AI processing status | ACT-03-02 |
| Forward | Proceed to requirement review | ACT-03-03 |

## SCR-04 AI Workspace

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Conversation | Guided AI work | ACT-04-01 |
| Task | Current task | ACT-04-01, ACT-04-03…05 |
| Context | Project, requirements, progress, documents | ACT-04-02, ACT-04-08 |
| Outcomes | Open Solution / Budget | ACT-04-06, ACT-04-07 |

## SCR-05 Solution Result

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Summary | Solution / proposal / package overview | ACT-05-01, ACT-05-02 |
| Result Cards | Planning · Configuration · Budget (as summary) | — |
| Artifact Actions | Download, Share | ACT-05-03, ACT-05-04 |
| Forward | Budget, Documents, Workspace | ACT-05-05…07 |

## SCR-06 Budget Result

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Overview | Investment range, category breakdown, options | ACT-06-01 |
| Artifact Actions | Download Budget | ACT-06-02 |
| Forward | Adjust requirements, Documents, Solution | ACT-06-03…05 |

## SCR-07 My Projects

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| List | Projects (name, status, created date) | ACT-07-01 |
| Project Actions | Continue, View Documents | ACT-07-02, ACT-07-03 |

## SCR-08 My Documents

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Categories | Solution / Budget / Tender / Delivery | ACT-08-01 |
| Document Actions | Preview, Download, Share | ACT-08-02…04 |
| Forward | Projects, Workspace | ACT-08-05, ACT-08-06 |

## SCR-09 Admin Dashboard

| Zone | Information | Actions (ref) |
|------|--------------|---------------|
| Metrics / Areas | Organizations, Users, Usage, Security, Governance | ACT-09-01…06 |

---

# 06 Labeling System (User-Facing Names)

Use these names in product structure. Do **not** expose internal names.

| Use this | Do not show as navigation / IA label |
|----------|--------------------------------------|
| Enterprise Builder | Quote Engine, Planning Engine |
| Tender Intelligence | Tender Engine, Parser |
| Sales Center | CRM module |
| AI Workspace | Agent runtime, Model provider |
| Solution | Proposal engine output (as a module name) |
| Budget | Budget Engine |
| My Projects | Tenant inventory |
| My Documents | Artifact store |
| Admin Dashboard | Ops cluster / Domain governance console |

Document category labels (fixed for MVP):

1. Solution  
2. Budget  
3. Tender  
4. Delivery  

---

# 07 Navigation IA (Goal-Based)

Structural paths only — not menu chrome design.

## First-time paths

```
Home (SCR-01)
  ├─ Enterprise Builder → Intake (SCR-02) → Workspace (SCR-04) → Solution (SCR-05) → Budget (SCR-06) → Documents (SCR-08)
  ├─ Tender Intelligence → Intake (SCR-03) → Workspace (SCR-04) → Solution (SCR-05) → Documents (SCR-08)
  └─ Sales Center → Workspace (SCR-04) → Solution (SCR-05) → Budget (SCR-06) → Documents (SCR-08)
```

## Returning path

```
Home (SCR-01) → My Projects (SCR-07) → Workspace (SCR-04) or Documents (SCR-08)
```

## Admin path

```
Admin entry → Admin Dashboard (SCR-09)
```

## Cross-links (information adjacency)

| From | User may reach | Why |
|------|----------------|-----|
| Workspace | Solution, Budget, Documents | Outcomes and artifacts of current Project |
| Solution | Budget, Documents, Workspace | Complete review / adjust |
| Budget | Solution, Documents, Workspace | Adjust or archive |
| Projects | Workspace, Documents | Resume or open files |
| Documents | Projects, Workspace | Return to work |

---

# 08 Persona × IA Focus

| Persona | Primary IA layers | Primary objects |
|---------|-------------------|-----------------|
| PER-01 Enterprise Customer | L1 → L2 → L3 → L4 → L6 | Goal, Project, Inputs, Solution, Budget, Documents |
| PER-02 Tender Customer | L1 → L2 → L3 → L4 → L6 | Goal, Tender Source, Requirements, Solution, Documents |
| PER-03 Sales Consultant | L1 → L3 → L4 → L6 | Goal, Opportunity, Solution, Budget, Documents |
| Returning user | L1 → L5 → L3 / L6 | Project, Documents |
| PER-06 Platform Administrator | L7 | Organizations, Users, Usage, Security, Governance |

---

# 09 Feature → IA Placement

| Feature | IA Layer | Object(s) | Screen |
|---------|----------|-----------|--------|
| FEAT-01 | L1 | Business Goal | SCR-01 |
| FEAT-02 | L1 | — (access) | SCR-01 |
| FEAT-03 | L1 | — (preference) | SCR-01 |
| FEAT-10…12 | L2 | Planning Inputs → Project | SCR-02 |
| FEAT-13 | L4 | Solution | SCR-05 |
| FEAT-14 | L4 | Budget | SCR-06 |
| FEAT-15 | L4 / L6 | Document | SCR-05, SCR-06, SCR-08 |
| FEAT-16 | L4 / L6 | Document | SCR-05, SCR-08 |
| FEAT-20…22 | L2 | Tender Source, Status | SCR-03 |
| FEAT-23…24 | L3 / L4 | Requirements, Solution | SCR-04, SCR-05 |
| FEAT-25 | L6 | Document (Tender) | SCR-08 |
| FEAT-30…33 | L1 / L3 / L4 / L6 | Opportunity, Solution, Budget, Document | SCR-01,04,05,06,08 |
| FEAT-40…41 | L3 | Current Task, Project Context | SCR-04 |
| FEAT-50…52 | L5 | Project, Documents | SCR-07 |
| FEAT-53…55 | L6 | Document Category, Document | SCR-08 |
| FEAT-60 | L7 | Org / User / Usage / Security / Governance | SCR-09 |

---

# 10 Action → Information Effect (Design)

What information changes or becomes visible — not how systems compute it.

| Action class (from PD-2.3) | IA effect |
|----------------------------|-----------|
| Goal Entry | Selects Business Goal branch |
| Intake | Creates/updates Project + Inputs / Tender Source / Opportunity |
| Guided Work | Updates Current Task, Requirements, Progress |
| Result Review | Surfaces Solution or Budget object |
| Artifact | Makes Document available (browse / preview / download / share) |
| Continuity | Reopens Project in Workspace or Documents |
| Operations | Surfaces Operations objects on Admin Dashboard |
| Navigation | Moves user between IA layers without new object types |

---

# 11 Hidden from IA

Never appear as user IA nodes or labels:

- Quote Engine / Budget Engine / Tender Engine
- Artifact (as a technical term)
- Workflow Engine / Autopilot (as a module name)
- Model / provider / embedding / vector / RAG
- Domain module names (M11–M15, etc.)
- API routes

These may exist behind the product; they are **not** Information Architecture.

---

# 12 MVP Scope Boundary

**In IA**

- Layers L1–L7 above
- Objects OBJ-01…OBJ-18
- Screens SCR-01…SCR-09
- Features MVP = In from PD-2.1
- Golden Path and supporting Actions from PD-2.3 that belong to those Screens

**Out of IA (MVP)**

- Supplier Hub structure
- Full Delivery Platform structure (Delivery remains a **document category** only)
- Billing / checkout IA
- Marketplace IA
- New Screens or Features

---

# 13 Design Chain

```
PD-2.1 Features
    ↓
PD-2.2 Screens
    ↓
PD-2.3 Actions
    ↓
PD-3.1 Information Architecture  ← this document
    ↓
PD-3.x Navigation / Wireframe detail (later, if needed)
```

---

# 14 EXIT Checklist

| Criterion | Status |
|-----------|--------|
| Top-level IA map defined | ✓ |
| Every MVP Screen placed in an IA layer | ✓ |
| User-facing objects defined | ✓ |
| Project is central object | ✓ |
| Feature → IA placement complete | ✓ |
| Technical modules hidden | ✓ |
| No implementation / React / styling / API / Domain changes | ✓ |
| Inputs unmodified | ✓ |

---

# Freeze Statement

PD-3.1 Information Architecture is frozen for MVP Product Design.

Downstream design must place content and navigation inside these layers and objects — without exposing internal engines or creating new IA branches outside MVP scope.
