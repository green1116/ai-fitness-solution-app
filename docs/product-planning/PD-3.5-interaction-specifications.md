# PD-3.5 — Interaction Specifications

## Status

**Frozen**

## Type

Product Design

## Version

`product-planning-pd-3.5-v1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

- `PD-3.4-component-specifications.md`
- `PD-3.3-screen-specifications.md`
- `PD-3.2-navigation-layout.md`
- `PD-3.1-information-architecture.md`

## Purpose

Define **interaction behavior** between users and reusable Components on MVP Screens.

Interactions:

- describe what the user does and what becomes visible next,
- map to existing Component intents and Screen Actions,
- **own no business logic**.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Interaction principles | Goal-based, Screen-owned Actions |
| Interaction catalogue | Named reusable interaction behaviors |
| Interaction specifications | Trigger → Component → Effect → Action ref |
| Interaction → Component mapping | All CMP-* from PD-3.4 |
| Interaction rules | Allowed / forbidden behaviors |
| Acceptance criteria | Spec completeness |

## Out of scope

| Item | Reason |
|------|--------|
| React / implementation | Product Design only |
| Animation / motion design | Explicitly excluded |
| Styling / design tokens | Explicitly excluded |
| API / database / state management | Not Interaction Spec |
| Permission logic | Not Interaction Spec |
| Business logic | Domains / Commands elsewhere |
| New Screens / Components / Features / Objects | Reuse frozen inputs only |
| Modification of PD-1, PD-2, PD-3.1–3.4, M11–M15 | Frozen |

## Design chain

```
PD-3.1 Objects / Zones
PD-3.2 Navigation & Layout
PD-3.3 Screen Specifications
PD-3.4 Component Specifications
        ↓
PD-3.5 Interaction Specifications  ← this document
```

---

# 2. Interaction Principles

1. **User acts on Components; Screens own Actions** — interaction emits intent; Action IDs remain on Screens (PD-3.3 / PD-2.3).
2. **One primary interaction per forward step** on Intake and Result Screens where a Primary Forward exists.
3. **Feedback is observational** — status and summaries become visible; no algorithms defined here.
4. **Navigation interactions only use allowed transitions** (PD-3.2).
5. **Interaction owns no business logic** — no scoring, pricing, extraction, generation, or permission decisions.
6. **No animation, styling, or tokens** in this specification.
7. **Reuse only** existing Screens, Components, Features, and Objects.
8. Golden Path interactions must remain completable end-to-end.

---

# 3. Interaction Catalogue

| Interaction ID | Name | Kind | Primary Components |
|----------------|------|------|--------------------|
| INT-NAV-SHELL | Activate Shell Destination | Navigate | CMP-SHELL-HEADER |
| INT-ACCESS-SIGNIN | Activate Sign In | Access | CMP-ACCESS-SIGNIN |
| INT-ACCESS-LANGUAGE | Select Language | Access | CMP-ACCESS-LANGUAGE |
| INT-ENTRY-GOAL | Activate Goal Card | Navigate | CMP-GOAL-CARD |
| INT-ENTRY-CONTINUITY | Activate Continuity Link | Navigate | CMP-NAV-CONTINUITY |
| INT-INTAKE-START | Activate Guide Start | Intake | CMP-GUIDE-PANEL |
| INT-INTAKE-INPUT | Enter Planning Inputs | Input | CMP-INPUT-PLANNING |
| INT-INTAKE-UPLOAD | Upload Tender Source | Input | CMP-UPLOAD-TENDER |
| INT-INTAKE-STATUS | Observe Processing Status | Observe | CMP-STATUS-PROCESS |
| INT-FORWARD-PRIMARY | Activate Primary Forward | Navigate | CMP-FORWARD-PRIMARY |
| INT-WS-CONVERSE | Interact in Conversation | Work | CMP-CONV-PANEL |
| INT-WS-TASK | Complete Current Task Step | Work | CMP-TASK-PANEL |
| INT-WS-CONTEXT | Inspect Project Context | Observe | CMP-CONTEXT-PANEL |
| INT-WS-OUTCOME | Activate Outcome Link | Navigate | CMP-OUTCOME-LINKS |
| INT-RESULT-REVIEW | Review Result Summary | Observe | CMP-RESULT-SUMMARY, CMP-RESULT-BLOCKS, CMP-BUDGET-OVERVIEW |
| INT-ARTIFACT-PREVIEW | Preview Document | Artifact | CMP-ARTIFACT-ACTIONS, CMP-DOC-ITEM |
| INT-ARTIFACT-DOWNLOAD | Download Materials | Artifact | CMP-ARTIFACT-ACTIONS |
| INT-ARTIFACT-SHARE | Share Materials | Artifact | CMP-ARTIFACT-ACTIONS |
| INT-FORWARD-GROUP | Activate Forward Link | Navigate | CMP-FORWARD-GROUP |
| INT-LIST-BROWSE | Browse Project List | Observe | CMP-PROJECT-LIST |
| INT-LIST-CONTINUE | Continue Project from Row | Navigate | CMP-PROJECT-ROW |
| INT-LIST-DOCS | Open Documents from Row | Navigate | CMP-PROJECT-ROW |
| INT-LIB-CATEGORY | Select Document Category | Observe | CMP-DOC-CATEGORIES |
| INT-LIB-SELECT | Select Document Item | Select | CMP-DOC-ITEM |
| INT-OPS-VIEW | View Operations Area | Observe | CMP-OPS-AREA |

**Catalogue count: 25** interactions.

---

# 4. Interaction Specifications

## Template

| Field | Meaning |
|-------|---------|
| Interaction ID / Name | Stable ID |
| Kind | Navigate / Access / Input / Observe / Work / Artifact / Select |
| User does | Trigger behavior |
| On Component | CMP-* |
| On Screen | SCR-* |
| System shows | Visible effect (no algorithm) |
| Maps to Action | PD-2.3 / PD-3.3 Action ID(s) |
| Next typical interaction | Optional |
| Must not | Non-behaviors |
| Business logic | Always **None** |

---

## Access & Entry

### INT-ACCESS-SIGNIN — Activate Sign In

| Field | Specification |
|-------|----------------|
| Kind | Access |
| User does | Activates Sign In control |
| On Component | CMP-ACCESS-SIGNIN |
| On Screen | SCR-01 |
| System shows | Sign-in opportunity / signed-in readiness for goal entry |
| Maps to Action | ACT-01-01 |
| Next typical | INT-ENTRY-GOAL or INT-ENTRY-CONTINUITY |
| Must not | Define auth provider flows or credential storage |
| Business logic | None |

### INT-ACCESS-LANGUAGE — Select Language

| Field | Specification |
|-------|----------------|
| Kind | Access |
| User does | Chooses a language option |
| On Component | CMP-ACCESS-LANGUAGE |
| On Screen | SCR-01 |
| System shows | Language preference applied to presentation |
| Maps to Action | ACT-01-02 |
| Next typical | — |
| Must not | Own localization content pipeline |
| Business logic | None |

### INT-ENTRY-GOAL — Activate Goal Card

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates one Goal Entry Card |
| On Component | CMP-GOAL-CARD |
| On Screen | SCR-01 |
| System shows | Navigation to SCR-02 / SCR-03 / SCR-04 per selected goal |
| Maps to Action | ACT-01-03 / ACT-01-04 / ACT-01-05 |
| Next typical | INT-INTAKE-START or INT-WS-TASK (Sales) |
| Must not | Encode product-line eligibility rules |
| Business logic | None |

### INT-ENTRY-CONTINUITY — Activate Continuity Link

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates My Projects link |
| On Component | CMP-NAV-CONTINUITY |
| On Screen | SCR-01 |
| System shows | Navigation to SCR-07 |
| Maps to Action | ACT-01-06 |
| Next typical | INT-LIST-BROWSE |
| Must not | Load Admin organization inventory |
| Business logic | None |

### INT-NAV-SHELL — Activate Shell Destination

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates a global destination in Shell Header |
| On Component | CMP-SHELL-HEADER |
| On Screen | SCR-01…SCR-08 (as offered by shell mode) |
| System shows | Navigation to Home / Projects / Documents / Workspace when allowed |
| Maps to Action | Shell navigation per PD-3.2 (no new Actions) |
| Next typical | Screen-specific browse/work |
| Must not | Invent destinations outside PD-3.2 global set |
| Business logic | None |

---

## Intake

### INT-INTAKE-START — Activate Guide Start

| Field | Specification |
|-------|----------------|
| Kind | Intake |
| User does | Starts planning from Guide Panel |
| On Component | CMP-GUIDE-PANEL |
| On Screen | SCR-02 |
| System shows | Planning intake ready for inputs |
| Maps to Action | ACT-02-01 |
| Next typical | INT-INTAKE-INPUT |
| Must not | Auto-generate Solution |
| Business logic | None |

### INT-INTAKE-INPUT — Enter Planning Inputs

| Field | Specification |
|-------|----------------|
| Kind | Input |
| User does | Enters company size, location, space, budget, goals |
| On Component | CMP-INPUT-PLANNING |
| On Screen | SCR-02 |
| System shows | Inputs accepted on Screen |
| Maps to Action | ACT-02-02 |
| Next typical | INT-FORWARD-PRIMARY |
| Must not | Validate business feasibility or pricing |
| Business logic | None |

### INT-INTAKE-UPLOAD — Upload Tender Source

| Field | Specification |
|-------|----------------|
| Kind | Input |
| User does | Provides tender document to upload area |
| On Component | CMP-UPLOAD-TENDER |
| On Screen | SCR-03 |
| System shows | Tender source accepted on Screen |
| Maps to Action | ACT-03-01 |
| Next typical | INT-INTAKE-STATUS |
| Must not | Parse or extract requirements |
| Business logic | None |

### INT-INTAKE-STATUS — Observe Processing Status

| Field | Specification |
|-------|----------------|
| Kind | Observe |
| User does | Views processing status |
| On Component | CMP-STATUS-PROCESS |
| On Screen | SCR-03 |
| System shows | In-progress / ready status visibility |
| Maps to Action | ACT-03-02 |
| Next typical | INT-FORWARD-PRIMARY |
| Must not | Decide extraction quality |
| Business logic | None |

### INT-FORWARD-PRIMARY — Activate Primary Forward

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates primary forward control |
| On Component | CMP-FORWARD-PRIMARY |
| On Screen | SCR-02, SCR-03, SCR-05, SCR-06 |
| System shows | Navigation to next allowed Screen |
| Maps to Action | ACT-02-03 / ACT-03-03 / ACT-05-05 / ACT-06-03 (per Screen) |
| Next typical | Path-dependent |
| Must not | Choose targets outside PD-3.2 allowed transitions |
| Business logic | None |

---

## Workspace

### INT-WS-CONVERSE — Interact in Conversation

| Field | Specification |
|-------|----------------|
| Kind | Work |
| User does | Continues guided conversation |
| On Component | CMP-CONV-PANEL |
| On Screen | SCR-04 |
| System shows | Task progress updated in Workspace |
| Maps to Action | ACT-04-01 |
| Next typical | INT-WS-CONTEXT or INT-WS-TASK |
| Must not | Select models/providers; own prompt logic |
| Business logic | None |

### INT-WS-TASK — Complete Current Task Step

| Field | Specification |
|-------|----------------|
| Kind | Work |
| User does | Completes the current task affordance (confirm / capture / generate request) |
| On Component | CMP-TASK-PANEL |
| On Screen | SCR-04 |
| System shows | Task step accepted; may enable outcomes |
| Maps to Action | ACT-04-03 / ACT-04-04 / ACT-04-05 (and ACT-04-01 as ongoing work) |
| Next typical | INT-WS-OUTCOME |
| Must not | Score compliance; compose packages |
| Business logic | None |

### INT-WS-CONTEXT — Inspect Project Context

| Field | Specification |
|-------|----------------|
| Kind | Observe |
| User does | Views project, requirements, progress, documents link |
| On Component | CMP-CONTEXT-PANEL |
| On Screen | SCR-04 |
| System shows | Context information visible |
| Maps to Action | ACT-04-02 (Documents link may lead to ACT-04-08) |
| Next typical | INT-WS-CONVERSE / INT-WS-OUTCOME / INT-LIB-* via documents |
| Must not | Edit hidden Domain graphs |
| Business logic | None |

### INT-WS-OUTCOME — Activate Outcome Link

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates Open Solution or Open Budget |
| On Component | CMP-OUTCOME-LINKS |
| On Screen | SCR-04 |
| System shows | Navigation to SCR-05 or SCR-06 |
| Maps to Action | ACT-04-06 / ACT-04-07 |
| Next typical | INT-RESULT-REVIEW |
| Must not | Generate result content in the interaction itself |
| Business logic | None |

---

## Results & Artifacts

### INT-RESULT-REVIEW — Review Result Summary

| Field | Specification |
|-------|----------------|
| Kind | Observe |
| User does | Reviews solution or budget summary / blocks / overview |
| On Component | CMP-RESULT-SUMMARY, CMP-RESULT-BLOCKS, CMP-BUDGET-OVERVIEW |
| On Screen | SCR-05, SCR-06 |
| System shows | Result content visible for review |
| Maps to Action | ACT-05-01 / ACT-05-02 / ACT-06-01 |
| Next typical | INT-ARTIFACT-* or INT-FORWARD-* |
| Must not | Recalculate results |
| Business logic | None |

### INT-ARTIFACT-PREVIEW — Preview Document

| Field | Specification |
|-------|----------------|
| Kind | Artifact |
| User does | Requests preview of a selected document |
| On Component | CMP-ARTIFACT-ACTIONS (+ CMP-DOC-ITEM when on SCR-08) |
| On Screen | SCR-08 (primary); preview intent may apply where documents are selected |
| System shows | Preview visible |
| Maps to Action | ACT-08-02 |
| Next typical | INT-ARTIFACT-DOWNLOAD |
| Must not | Define viewer engine behavior |
| Business logic | None |

### INT-ARTIFACT-DOWNLOAD — Download Materials

| Field | Specification |
|-------|----------------|
| Kind | Artifact |
| User does | Requests download of solution / budget / document materials |
| On Component | CMP-ARTIFACT-ACTIONS |
| On Screen | SCR-05, SCR-06, SCR-08 |
| System shows | Download command issued (observable) |
| Maps to Action | ACT-05-03 / ACT-06-02 / ACT-08-03 |
| Next typical | — or INT-FORWARD-GROUP |
| Must not | Define file binary formats |
| Business logic | None |

### INT-ARTIFACT-SHARE — Share Materials

| Field | Specification |
|-------|----------------|
| Kind | Artifact |
| User does | Requests share of solution or document |
| On Component | CMP-ARTIFACT-ACTIONS |
| On Screen | SCR-05, SCR-08 |
| System shows | Share command issued (observable) |
| Maps to Action | ACT-05-04 / ACT-08-04 |
| Next typical | — |
| Must not | Define external share-channel implementations |
| Business logic | None |

### INT-FORWARD-GROUP — Activate Forward Link

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates a forward destination link |
| On Component | CMP-FORWARD-GROUP |
| On Screen | SCR-05, SCR-06, SCR-08 |
| System shows | Navigation to Budget / Documents / Workspace / Solution / Projects as labeled |
| Maps to Action | ACT-05-05…07 / ACT-06-03…05 / ACT-08-05…06 |
| Next typical | Path-dependent |
| Must not | Invent transitions outside PD-3.2 |
| Business logic | None |

---

## Continuity & Library

### INT-LIST-BROWSE — Browse Project List

| Field | Specification |
|-------|----------------|
| Kind | Observe |
| User does | Views list of projects |
| On Component | CMP-PROJECT-LIST |
| On Screen | SCR-07 |
| System shows | Project list visible |
| Maps to Action | ACT-07-01 |
| Next typical | INT-LIST-CONTINUE or INT-LIST-DOCS |
| Must not | Act as Admin org inventory |
| Business logic | None |

### INT-LIST-CONTINUE — Continue Project from Row

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates Continue on a project row |
| On Component | CMP-PROJECT-ROW |
| On Screen | SCR-07 |
| System shows | Navigation to SCR-04 |
| Maps to Action | ACT-07-02 |
| Next typical | INT-WS-CONVERSE |
| Must not | Recreate intake unless Screen path requires it |
| Business logic | None |

### INT-LIST-DOCS — Open Documents from Row

| Field | Specification |
|-------|----------------|
| Kind | Navigate |
| User does | Activates View Documents on a project row |
| On Component | CMP-PROJECT-ROW |
| On Screen | SCR-07 |
| System shows | Navigation to SCR-08 |
| Maps to Action | ACT-07-03 |
| Next typical | INT-LIB-CATEGORY |
| Must not | Open Admin documents surfaces |
| Business logic | None |

### INT-LIB-CATEGORY — Select Document Category

| Field | Specification |
|-------|----------------|
| Kind | Observe |
| User does | Selects Solution / Budget / Tender / Delivery |
| On Component | CMP-DOC-CATEGORIES |
| On Screen | SCR-08 |
| System shows | Category items available to browse |
| Maps to Action | ACT-08-01 |
| Next typical | INT-LIB-SELECT |
| Must not | Add categories beyond MVP four |
| Business logic | None |

### INT-LIB-SELECT — Select Document Item

| Field | Specification |
|-------|----------------|
| Kind | Select |
| User does | Selects a document item |
| On Component | CMP-DOC-ITEM |
| On Screen | SCR-08 |
| System shows | Document selected for artifact actions |
| Maps to Action | Enables ACT-08-02…04 via CMP-ARTIFACT-ACTIONS |
| Next typical | INT-ARTIFACT-PREVIEW / DOWNLOAD / SHARE |
| Must not | Auto-download without user artifact intent |
| Business logic | None |

---

## Operations

### INT-OPS-VIEW — View Operations Area

| Field | Specification |
|-------|----------------|
| Kind | Observe |
| User does | Opens dashboard and views an operations area |
| On Component | CMP-OPS-AREA |
| On Screen | SCR-09 |
| System shows | Organizations / Users / Usage / Security / Governance area visible |
| Maps to Action | ACT-09-01…06 |
| Next typical | Another INT-OPS-VIEW on a different area |
| Must not | Provision tenants; implement RBAC; leave SCR-09 for new Screens |
| Business logic | None |

---

# 5. Interaction-to-Component Mapping

| Component | Interactions |
|-----------|----------------|
| CMP-SHELL-HEADER | INT-NAV-SHELL |
| CMP-SHELL-CONTEXT | — (orientation only; no dedicated interaction ID) |
| CMP-SHELL-FOOTER | — (non-primary; no Golden Path interaction ID) |
| CMP-ACCESS-SIGNIN | INT-ACCESS-SIGNIN |
| CMP-ACCESS-LANGUAGE | INT-ACCESS-LANGUAGE |
| CMP-GOAL-CARD | INT-ENTRY-GOAL |
| CMP-NAV-CONTINUITY | INT-ENTRY-CONTINUITY |
| CMP-GUIDE-PANEL | INT-INTAKE-START |
| CMP-INPUT-PLANNING | INT-INTAKE-INPUT |
| CMP-UPLOAD-TENDER | INT-INTAKE-UPLOAD |
| CMP-STATUS-PROCESS | INT-INTAKE-STATUS |
| CMP-FORWARD-PRIMARY | INT-FORWARD-PRIMARY |
| CMP-CONV-PANEL | INT-WS-CONVERSE |
| CMP-TASK-PANEL | INT-WS-TASK |
| CMP-CONTEXT-PANEL | INT-WS-CONTEXT |
| CMP-OUTCOME-LINKS | INT-WS-OUTCOME |
| CMP-RESULT-SUMMARY | INT-RESULT-REVIEW |
| CMP-RESULT-BLOCKS | INT-RESULT-REVIEW |
| CMP-BUDGET-OVERVIEW | INT-RESULT-REVIEW |
| CMP-ARTIFACT-ACTIONS | INT-ARTIFACT-PREVIEW, INT-ARTIFACT-DOWNLOAD, INT-ARTIFACT-SHARE |
| CMP-FORWARD-GROUP | INT-FORWARD-GROUP |
| CMP-PROJECT-LIST | INT-LIST-BROWSE |
| CMP-PROJECT-ROW | INT-LIST-CONTINUE, INT-LIST-DOCS |
| CMP-DOC-CATEGORIES | INT-LIB-CATEGORY |
| CMP-DOC-ITEM | INT-LIB-SELECT |
| CMP-OPS-AREA | INT-OPS-VIEW |

## Coverage

| Rule | Status |
|------|--------|
| Every interactive Component has ≥1 Interaction (except pure orientation shell pieces) | ✓ |
| Every Interaction maps to ≥1 Component | ✓ |
| Shell Context / Footer may be presentational without dedicated INT-* | ✓ allowed |

---

# 6. Interaction Rules

| Rule ID | Rule |
|---------|------|
| IR-01 | Interactions emit intents only; Screens retain Action ownership |
| IR-02 | Navigate-kind interactions may only target PD-3.2 allowed transitions |
| IR-03 | Observe-kind interactions change visibility only — no Domain writes defined here |
| IR-04 | Input-kind interactions accept user-provided values on Screen — no validation algorithms |
| IR-05 | Artifact-kind interactions issue preview/download/share intents — no format/channel logic |
| IR-06 | Work-kind interactions support guided work — no model/provider/prompt ownership |
| IR-07 | One Primary Forward interaction at a time on Intake Screens for the main path step |
| IR-08 | Golden Path sequences must be expressible as ordered INT-* chains (see below) |
| IR-09 | No interaction may embed API, database, state, permission, or business rules |
| IR-10 | No animation, styling, or design tokens may be required to define an interaction |
| IR-11 | Do not invent Components or Screens to support an interaction |
| IR-12 | CMP-SHELL-CONTEXT orients; it does not require a separate business interaction |

## Golden Path interaction chains (reference)

### GP-01

```
INT-ACCESS-SIGNIN (optional)
→ INT-ENTRY-GOAL (Builder)
→ INT-INTAKE-START → INT-INTAKE-INPUT → INT-FORWARD-PRIMARY
→ INT-WS-CONVERSE → INT-WS-CONTEXT → INT-WS-OUTCOME
→ INT-RESULT-REVIEW → INT-FORWARD-PRIMARY (to Budget)
→ INT-RESULT-REVIEW → INT-ARTIFACT-DOWNLOAD → INT-FORWARD-GROUP (to Documents)
→ INT-LIB-CATEGORY → INT-LIB-SELECT → INT-ARTIFACT-DOWNLOAD
```

### GP-01R

```
INT-ENTRY-CONTINUITY → INT-LIST-BROWSE → INT-LIST-CONTINUE → INT-WS-CONVERSE
```

### GP-02

```
INT-ENTRY-GOAL (Tender)
→ INT-INTAKE-UPLOAD → INT-INTAKE-STATUS → INT-FORWARD-PRIMARY
→ INT-WS-TASK (confirm) → INT-WS-TASK (generate) → INT-WS-OUTCOME
→ INT-RESULT-REVIEW → INT-ARTIFACT-DOWNLOAD → INT-FORWARD-GROUP
→ INT-LIB-CATEGORY → INT-ARTIFACT-DOWNLOAD
```

### GP-03

```
INT-ENTRY-GOAL (Sales)
→ INT-WS-TASK (capture) → INT-WS-CONVERSE → INT-WS-OUTCOME
→ INT-RESULT-REVIEW → INT-FORWARD-PRIMARY → INT-RESULT-REVIEW
→ INT-ARTIFACT-SHARE → INT-ARTIFACT-DOWNLOAD
```

### GP-04

```
INT-OPS-VIEW (Dashboard)
→ INT-OPS-VIEW (Organizations / Users / Usage / Security / Governance)
```

---

# 7. Exclusions

This document excludes:

1. React / Next.js / any implementation  
2. Animation / motion / micro-interaction timing  
3. Visual styling  
4. Design tokens / themes  
5. API / database  
6. State management  
7. Permission logic  
8. Business logic / algorithms  
9. New Screens, Components, Features, Objects  
10. Modifications to PD-1, PD-2, PD-3.1, PD-3.2, PD-3.3, PD-3.4, M11–M15  

---

# 8. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-INT-01 | Interaction catalogue defined | ✓ 25 interactions |
| AC-INT-02 | Every Interaction follows the specification template | ✓ |
| AC-INT-03 | Every Interaction declares Business logic = None | ✓ |
| AC-INT-04 | Every Interaction maps to existing Component(s) | ✓ |
| AC-INT-05 | Interactive Components from PD-3.4 are covered | ✓ |
| AC-INT-06 | Action mappings reuse existing Screen Actions only | ✓ |
| AC-INT-07 | Navigate interactions respect PD-3.2 allowed transitions | ✓ |
| AC-INT-08 | Golden Path INT chains are complete for GP-01 / GP-01R / GP-02 / GP-03 / GP-04 | ✓ |
| AC-INT-09 | No React, animation, styling, tokens, API, DB, state, or permission logic | ✓ |
| AC-INT-10 | Inputs PD-3.1…PD-3.4 unmodified | ✓ |

## Verdict

```
PD-3.5 PASS iff AC-INT-01 … AC-INT-10 all PASS
```

---

# Freeze Statement

PD-3.5 Interaction Specifications is frozen for MVP Product Design.

Interactions define user↔component behavior only.  
They emit intents to frozen Screen Actions and Components — and own **no** business logic, animation, styling, API, or Domain behavior.
