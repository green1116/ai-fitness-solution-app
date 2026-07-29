# PD-3.7 — Accessibility

## Status

**Frozen**

## Type

Product Design

## Version

`product-planning-pd-3.7-v1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

- `PD-3.6-responsive-design.md`
- `PD-3.5-interaction-specifications.md`
- `PD-3.4-component-specifications.md`
- `PD-3.3-screen-specifications.md`

## Purpose

Define **accessibility requirements** for MVP Screens, Components, and Interactions.

Accessibility ensures users can:

- perceive what is on each Screen,
- operate each Interaction,
- understand labels and status,
- complete Golden Paths.

This document states **requirements only**.  
It does **not** implement HTML, ARIA, CSS, or code.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Accessibility principles | Product-level a11y rules |
| Accessibility catalogue | Named requirement IDs |
| Screen accessibility | SCR-01…SCR-09 |
| Component accessibility | CMP-* from PD-3.4 |
| Interaction accessibility | INT-* from PD-3.5 |
| Acceptance criteria | Spec completeness |

## Out of scope

| Item | Reason |
|------|--------|
| React / implementation | Product Design only |
| HTML / ARIA implementation | Explicitly excluded |
| CSS / styling | Explicitly excluded |
| API / database / state | Not Accessibility Spec |
| Business logic | Domains / Actions elsewhere |
| Permission logic | Not Accessibility Spec |
| New Screens / Components / Interactions | Reuse frozen inputs only |
| Modification of PD-1, PD-2, PD-3.1–3.6, M11–M15 | Frozen |

## Design chain

```
PD-3.3 Screen Specifications
PD-3.4 Component Specifications
PD-3.5 Interaction Specifications
PD-3.6 Responsive Design
        ↓
PD-3.7 Accessibility  ← this document
```

---

# 2. Accessibility Principles

1. **Same meaning for all users** — Features, Objects, Actions, and Golden Paths do not change for assistive use.
2. **Every interactive control is operable** without relying on pointer-only or color-only cues.
3. **Every status and result is perceivable** as text or equivalent labeled feedback — not color alone.
4. **Labels match product language** from PD-3.1 (user-facing names; no engine/Domain jargon).
5. **Focus order follows product order** — Guide → capture → Forward; Task before secondary chrome; Artifact before optional Forward where specified.
6. **Responsive must not remove accessibility** — Compact stacking (PD-3.6) keeps the same operable intents.
7. **Errors and empty states are understandable** — user knows what happened and what they can do next (without defining business validation rules).
8. **Accessibility owns no business logic** — requirements constrain presentation and operation, not Domain decisions.
9. **No HTML/ARIA/CSS in this document** — downstream implementation must satisfy these requirements by appropriate means.
10. **Admin and customer paths both covered** — SCR-09 included; customer Golden Paths do not depend on SCR-09.

---

# 3. Accessibility Catalogue

Named requirement IDs. Planning-level only.

| Requirement ID | Name | Concern |
|----------------|------|---------|
| A11Y-P01 | Perceivable content | Text/labels convey meaning |
| A11Y-P02 | Non-color status | Status not by color alone |
| A11Y-P03 | Text alternatives for non-text | Icons/controls have text names |
| A11Y-O01 | Keyboard operable | All INT-* operable without pointer |
| A11Y-O02 | Visible focus | Focused control is identifiable |
| A11Y-O03 | Focus order | Order matches Screen product flow |
| A11Y-O04 | Target adequacy | Interactive targets usable (no size CSS here — behavioral adequacy) |
| A11Y-U01 | Consistent naming | Same control → same accessible name across Screens |
| A11Y-U02 | Clear purpose | Control name states purpose (goal, forward, download, etc.) |
| A11Y-U03 | Status announcements | Processing / result / empty states are available as readable status |
| A11Y-U04 | Error understanding | Failure to complete an Interaction is explained without Domain jargon |
| A11Y-R01 | Structure fidelity | Screen purpose and zones remain discoverable at all breakpoints |
| A11Y-R02 | No access loss on Compact | Compact layout keeps all required intents (PD-3.6) |
| A11Y-G01 | Golden Path completeness | GP-01…GP-04 completable with keyboard-only operation |
| A11Y-G02 | Language selection available | Language control reachable on entry (SCR-01) |

**Catalogue count: 15** accessibility requirements.

---

# 4. Screen Accessibility

Each Screen must satisfy the mapped requirements while preserving PD-3.3 behavior.

| Screen | Critical user tasks | Required A11Y IDs | Notes |
|--------|---------------------|-------------------|-------|
| SCR-01 | Sign in, language, choose goal, open projects | A11Y-P01, P03, O01–O03, U01–U02, G01–G02, R01–R02 | Goal cards must have distinct accessible names (Builder / Tender / Sales) |
| SCR-02 | Start planning, enter inputs, continue | A11Y-P01, O01–O03, U01–U02, U04, R01–R02, G01 | Input fields labeled with Planning Inputs meanings |
| SCR-03 | Upload, observe status, proceed | A11Y-P01–P03, O01–O03, U02–U04, R01–R02, G01 | Processing status must be readable, not color-only |
| SCR-04 | Converse, task steps, context, outcomes | A11Y-P01–P03, O01–O03, U01–U03, R01–R02, G01 | Three zones discoverable when stacked (Compact) |
| SCR-05 | Review solution, download/share, forward | A11Y-P01–P02, O01–O03, U01–U03, R01–R02, G01 | Result summary text available |
| SCR-06 | Review budget, download, forward | A11Y-P01–P02, O01–O03, U01–U03, R01–R02, G01 | Investment overview text available |
| SCR-07 | List projects, continue, open documents | A11Y-P01, O01–O03, U01–U02, R01–R02, G01 | Each row exposes name + actions |
| SCR-08 | Categories, select, preview/download/share | A11Y-P01–P03, O01–O03, U01–U02, R01–R02, G01 | Four category names explicit |
| SCR-09 | View ops areas | A11Y-P01, O01–O03, U01–U02, R01–R02, G01 | Each Ops Area distinctly named |

## Screen-level rules

| Rule ID | Rule |
|---------|------|
| SA-01 | Screen title / purpose is available as a clear heading-equivalent in product structure |
| SA-02 | Empty lists (projects/documents) state that nothing is available and what the user can do next |
| SA-03 | Forward controls are reachable after required capture/review steps without pointer-only gestures |
| SA-04 | Shell destinations, when offered, are included in operable navigation set |
| SA-05 | Compact adaptation must not hide required Screen Actions |

---

# 5. Component Accessibility

| Component | Must expose | Required A11Y IDs | Must not |
|-----------|-------------|-------------------|----------|
| CMP-SHELL-HEADER | Named destinations (Home / Projects / Documents / Workspace as offered) | P01, P03, O01–O03, U01 | Engine names as labels |
| CMP-SHELL-CONTEXT | Project identity text cue | P01, U01 | Rely on color bar alone for project identity |
| CMP-SHELL-FOOTER | Secondary link names (if present) | P01, O01 | Host sole path to Golden Path CTAs |
| CMP-ACCESS-SIGNIN | Name conveys Sign In | P03, O01–O02, U02, G02 related | Pointer-only activation |
| CMP-ACCESS-LANGUAGE | Name conveys Language; options named | P01, O01, U01, G02 | Flag/color-only language choice |
| CMP-GOAL-CARD | Distinct name per goal | P01, P03, O01–O03, U01–U02 | Ambiguous “Start” without goal |
| CMP-NAV-CONTINUITY | Name conveys My Projects | P03, O01, U02 | Unlabeled icon-only |
| CMP-GUIDE-PANEL | Guide text available | P01, U02 | Decorative-only welcome |
| CMP-INPUT-PLANNING | Each input has visible purpose label | P01, O01, U01–U02, U04 | Placeholder-only labeling |
| CMP-UPLOAD-TENDER | Upload control named; selected source acknowledged | P01, P03, O01, U02–U03 | Status by color alone |
| CMP-STATUS-PROCESS | Status text (in progress / ready) | P01, P02, U03 | Color-only status |
| CMP-FORWARD-PRIMARY | Name matches forward purpose | P03, O01–O03, U02 | Disabled without explanation when blocked |
| CMP-CONV-PANEL | Conversation region identifiable; messages readable | P01, O01, U03 | Unlabeled chat surface |
| CMP-TASK-PANEL | Current task name/purpose clear | P01, O01–O03, U02 | Task controls without names |
| CMP-CONTEXT-PANEL | Project / requirements / progress / documents link named | P01, O01, U01 | Context only as unlabeled icons |
| CMP-OUTCOME-LINKS | Solution / Budget targets distinctly named | P03, O01, U02 | Generic “Next” for both outcomes |
| CMP-RESULT-SUMMARY | Summary content available as text | P01, U03 | Image-only summary |
| CMP-RESULT-BLOCKS | Block titles: Planning / Configuration / Budget | P01, U01 | Untitled blocks |
| CMP-BUDGET-OVERVIEW | Range / breakdown / options as text structure | P01, U03 | Chart-only without text equivalent requirement |
| CMP-ARTIFACT-ACTIONS | Preview / Download / Share distinctly named | P03, O01, U01–U02 | Icon-only undifferentiated actions |
| CMP-FORWARD-GROUP | Each destination distinctly named | P03, O01, U02 | Ambiguous multi-links |
| CMP-PROJECT-LIST | List structure with readable rows | P01, O01, U03 | Empty state silent |
| CMP-PROJECT-ROW | Name, status, date text; Continue / Documents named | P01, P02, O01, U01 | Status by color alone |
| CMP-DOC-CATEGORIES | Four category names explicit | P01, O01, U01 | Icon-only categories |
| CMP-DOC-ITEM | Document identity text | P01, O01 | Unnamed items |
| CMP-OPS-AREA | Area name (Orgs / Users / Usage / Security / Governance) | P01, O01, U01 | Unlabeled metric tiles |

## Component-level rules

| Rule ID | Rule |
|---------|------|
| CA-A01 | Every interactive Component has an accessible name derived from product labels |
| CA-A02 | Repeated Components (Goal Cards, Ops Areas, Project Rows) are distinguishable from each other |
| CA-A03 | Composite groups (Artifact Actions, Forward Group) expose each child intent separately |
| CA-A04 | Non-interactive display Components still provide text for their Objects |
| CA-A05 | Component accessibility requirements do not alter Component business-logic ownership (remains None) |

---

# 6. Interaction Accessibility

| Interaction | Operable requirement | Perceivable feedback | Required A11Y IDs |
|-------------|----------------------|----------------------|-------------------|
| INT-ACCESS-SIGNIN | Keyboard activate Sign In | Sign-in readiness / opportunity clear | O01–O02, U02, G02 |
| INT-ACCESS-LANGUAGE | Keyboard select language | Selected language apparent | O01, P01, G02 |
| INT-ENTRY-GOAL | Keyboard activate each goal | Navigation to correct Screen | O01–O03, U01–U02, G01 |
| INT-ENTRY-CONTINUITY | Keyboard activate My Projects | Arrive SCR-07 | O01, U02, G01 |
| INT-NAV-SHELL | Keyboard activate destinations | Arrive allowed Screens only | O01–O03, U01 |
| INT-INTAKE-START | Keyboard activate start | Intake ready | O01, U02 |
| INT-INTAKE-INPUT | Keyboard enter/review fields | Values visible as entered | O01, P01, U02, U04 |
| INT-INTAKE-UPLOAD | Keyboard operable upload affordance | Source accepted acknowledgement | O01, P01, U03 |
| INT-INTAKE-STATUS | Status readable without pointer hover | In progress / ready text | P01–P02, U03 |
| INT-FORWARD-PRIMARY | Keyboard activate forward | Navigate next Screen | O01–O03, U02, G01 |
| INT-WS-CONVERSE | Keyboard participate in conversation | Messages/status readable | O01, P01, U03 |
| INT-WS-TASK | Keyboard complete task controls | Task acceptance visible | O01–O03, U02, G01 |
| INT-WS-CONTEXT | Keyboard reach context and documents link | Context content readable | O01, P01 |
| INT-WS-OUTCOME | Keyboard activate Solution/Budget | Navigate SCR-05/06 | O01, U02, G01 |
| INT-RESULT-REVIEW | Content reviewable without hover-only | Summary/blocks/overview text | P01, U03, G01 |
| INT-ARTIFACT-PREVIEW | Keyboard activate Preview | Preview available / announced as available | O01, U02 |
| INT-ARTIFACT-DOWNLOAD | Keyboard activate Download | Download intent issued observably | O01, U02, G01 |
| INT-ARTIFACT-SHARE | Keyboard activate Share | Share intent issued observably | O01, U02 |
| INT-FORWARD-GROUP | Keyboard activate each forward link | Navigate allowed targets | O01–O03, U02, G01 |
| INT-LIST-BROWSE | List traversable by keyboard | Rows readable | O01, P01, U03 |
| INT-LIST-CONTINUE | Keyboard Continue on row | Navigate SCR-04 | O01, U02, G01 |
| INT-LIST-DOCS | Keyboard Documents on row | Navigate SCR-08 | O01, U02 |
| INT-LIB-CATEGORY | Keyboard select category | Category selected apparent | O01, U01 |
| INT-LIB-SELECT | Keyboard select item | Selection apparent | O01, P01 |
| INT-OPS-VIEW | Keyboard reach each Ops Area | Area content readable | O01–O03, P01, G01 |

## Interaction-level rules

| Rule ID | Rule |
|---------|------|
| IA-A01 | Every INT-* remains operable at BP-COMPACT (PD-3.6) |
| IA-A02 | Pointer is optional — never the only activation method |
| IA-A03 | Hover-only information is not the sole way to learn status or labels |
| IA-A04 | Interaction accessibility does not add business validation — only clarity of feedback |
| IA-A05 | Golden Path INT chains (PD-3.5) must be completable keyboard-only |

---

# 7. Exclusions

This document excludes:

1. React / Next.js / any implementation  
2. HTML markup  
3. ARIA attribute implementation  
4. CSS / media queries / styling  
5. Design tokens  
6. API / database / state management  
7. Permission / RBAC implementation  
8. Business logic / algorithms  
9. Automated a11y tooling configuration  
10. New Screens, Components, or Interactions  
11. Modifications to PD-1, PD-2, PD-3.1–3.6, M11–M15  

---

# 8. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-A11Y-01 | Accessibility catalogue defined (A11Y-* IDs) | ✓ 15 requirements |
| AC-A11Y-02 | Every MVP Screen has accessibility mapping | ✓ SCR-01…09 |
| AC-A11Y-03 | Every Component has accessibility expectations | ✓ CMP-* |
| AC-A11Y-04 | Every Interaction has operable/perceivable requirements | ✓ INT-* |
| AC-A11Y-05 | Keyboard operability required for all interactive INT-* | ✓ A11Y-O01 / IA-A02 |
| AC-A11Y-06 | Status not by color alone | ✓ A11Y-P02 |
| AC-A11Y-07 | Golden Paths keyboard-completable | ✓ A11Y-G01 |
| AC-A11Y-08 | Compact breakpoint does not remove required intents | ✓ A11Y-R02 |
| AC-A11Y-09 | No HTML/ARIA/CSS/React/API/business logic in this doc | ✓ |
| AC-A11Y-10 | Inputs PD-3.3…PD-3.6 unmodified | ✓ |

## Verdict

```
PD-3.7 PASS iff AC-A11Y-01 … AC-A11Y-10 all PASS
```

---

# Freeze Statement

PD-3.7 Accessibility is frozen for MVP Product Design.

Accessibility requirements constrain how frozen Screens, Components, and Interactions must be operable and perceivable.  
Downstream implementation must satisfy these requirements without changing product meaning, Domains, or upstream PD documents — and without treating this file as HTML/ARIA/CSS source.
