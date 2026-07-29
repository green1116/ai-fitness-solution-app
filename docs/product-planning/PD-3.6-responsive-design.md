# PD-3.6 — Responsive Design

## Status

**Frozen**

## Type

Product Design

## Version

`product-planning-pd-3.6-v1`

## Freeze Date

2026-07-29

## Base (Input — Frozen, read-only)

- `PD-3.5-interaction-specifications.md`
- `PD-3.4-component-specifications.md`
- `PD-3.3-screen-specifications.md`
- `PD-3.2-navigation-layout.md`

## Purpose

Define **responsive behavior** for MVP Screens, Layout Patterns, and Components across viewport classes.

Responsive Design answers:

- Which breakpoint classes exist?
- How does each Layout Pattern adapt?
- How do Screens and Components reflow without changing product meaning?

It does **not** define CSS, media queries, styling, tokens, or implementation.

---

# 1. Scope

## In scope

| Item | Coverage |
|------|----------|
| Responsive principles | Meaning-preserving adaptation |
| Breakpoint catalogue | Named viewport classes only |
| Layout adaptation | LAY-* patterns from PD-3.2 |
| Screen adaptation | SCR-01…SCR-09 |
| Component adaptation | CMP-* from PD-3.4 |
| Acceptance criteria | Spec completeness |

## Out of scope

| Item | Reason |
|------|--------|
| React / implementation | Product Design only |
| CSS / media queries | Explicitly excluded |
| Styling / design tokens | Explicitly excluded |
| API / database / state | Not Responsive Spec |
| Business logic | Domains / Actions elsewhere |
| New Screens / Layout Patterns / Components | Reuse frozen inputs only |
| Modification of PD-1, PD-2, PD-3.1–3.5, M11–M15 | Frozen |

## Design chain

```
PD-3.2 Navigation & Layout (patterns)
PD-3.3 Screen Specifications
PD-3.4 Component Specifications
PD-3.5 Interaction Specifications
        ↓
PD-3.6 Responsive Design  ← this document
```

---

# 2. Responsive Principles

1. **Preserve product meaning** — same Features, Objects, Actions, and Interactions at every breakpoint.
2. **Adapt structure, not rules** — change arrangement / stacking / visibility priority; do not change business outcomes.
3. **Reuse frozen Layout Patterns** — adapt LAY-* behavior; do not invent new pattern IDs.
4. **Primary path first** — Golden Path forward actions remain reachable on all breakpoints.
5. **Progressive disclosure of chrome** — global destinations may collapse; Screen purpose must not disappear.
6. **Workspace stays three concerns** — Conversation, Task, Context remain available (may stack).
7. **No CSS / media queries / tokens** in this document — breakpoints are named classes only.
8. **Responsive owns no business logic**.
9. **Interactions unchanged** — INT-* still map to the same Components and Actions (PD-3.5).
10. Admin Ops areas remain on SCR-09 — they may stack; they do not become new Screens.

---

# 3. Breakpoint Catalogue

Named viewport classes for Product Design.  
**Not** pixel values, CSS breakpoints, or media queries.

| Breakpoint ID | Name | Intent | Typical device class (informative only) |
|---------------|------|--------|-----------------------------------------|
| BP-COMPACT | Compact | Single-column priority; stack zones | Phone / narrow |
| BP-MEDIUM | Medium | Two-zone comfort; partial side panels | Tablet / narrow laptop |
| BP-EXPANDED | Expanded | Full pattern as specified in PD-3.2 | Desktop / wide |

## Breakpoint rules

| Rule | Requirement |
|------|-------------|
| BP-R1 | Exactly these three classes for MVP |
| BP-R2 | Every Screen must be usable at BP-COMPACT |
| BP-R3 | BP-EXPANDED matches PD-3.2 default structural description |
| BP-R4 | Breakpoint change must not add/remove Screens, Features, or Actions |
| BP-R5 | No numeric CSS thresholds defined here |

---

# 4. Layout Adaptation

Adaptation of frozen Layout Patterns (PD-3.2) by breakpoint.

| Pattern ID | BP-EXPANDED | BP-MEDIUM | BP-COMPACT |
|------------|-------------|-----------|------------|
| LAY-ENTRY | Header · Goal area · Goal destinations side-by-side · Continuity · Footer optional | Goals wrap to two columns or stacked pairs | Goals stack vertically; Access remains in Header; Continuity below goals |
| LAY-INTAKE | Guide · Inputs/Upload · Primary Forward in single column flow | Same single column; denser vertical rhythm (structure only) | Same order: Guide → Inputs/Upload/Status → Forward; Forward stays visible after inputs |
| LAY-SPLIT-3 | Left Conversation · Center Task · Right Context simultaneously | Conversation + Task primary; Context as secondary column or collapsible panel **still available** | Stack: Task (primary) → Conversation → Context; Outcome Links remain reachable after Task |
| LAY-RESULT | Summary · Blocks/Overview · Artifact Actions · Forward | Summary + Blocks stack; Actions and Forward remain below content | Same vertical order; Artifact Actions before Forward; all actions reachable |
| LAY-LIST | List + row actions inline | List full width; row actions remain on each row | List full width; row actions stack under each row identity |
| LAY-LIBRARY | Categories beside or above items | Categories above items | Categories as vertical set; then items; then Artifact Actions; then Forward |
| LAY-OPS | Multiple Ops Areas visible in dashboard arrangement | Areas in two-column wrap (structural) | Areas stack vertically; each CMP-OPS-AREA fully reachable |

## Pattern invariants (all breakpoints)

| Pattern | Must remain true |
|---------|------------------|
| LAY-ENTRY | All three goals + Continuity reachable |
| LAY-INTAKE | Guide → capture → Forward order preserved |
| LAY-SPLIT-3 | Conversation, Task, Context all reachable without new Screens |
| LAY-RESULT | Review → Artifact → Forward order preserved |
| LAY-LIST | Every project row can Continue or open Documents |
| LAY-LIBRARY | Four categories only; Preview/Download/Share reachable |
| LAY-OPS | Five areas remain on SCR-09 |

---

# 5. Screen Adaptation

| Screen | Pattern | BP-EXPANDED | BP-MEDIUM | BP-COMPACT | Must remain reachable |
|--------|---------|-------------|-----------|------------|------------------------|
| SCR-01 | LAY-ENTRY | Full goal entry | Goals wrap | Goals stack | Sign In, Language, 3 Goals, My Projects |
| SCR-02 | LAY-INTAKE | Full intake | Full intake | Stacked intake | Start, Inputs, Continue → SCR-04 |
| SCR-03 | LAY-INTAKE | Full intake | Full intake | Stacked intake | Upload, Status, Proceed → SCR-04 |
| SCR-04 | LAY-SPLIT-3 | 3 zones side-by-side | 2+1 / collapsible Context | Stacked 3 zones | Converse, Task steps, Context, Outcomes → SCR-05/06/08 |
| SCR-05 | LAY-RESULT | Full result | Stacked result | Stacked result | Review, Download/Share, Budget/Documents/Workspace |
| SCR-06 | LAY-RESULT | Full budget result | Stacked | Stacked | Review, Download, Adjust/Documents/Solution |
| SCR-07 | LAY-LIST | List + inline actions | List + inline/adjacent actions | List + stacked row actions | List, Continue → SCR-04, Documents → SCR-08 |
| SCR-08 | LAY-LIBRARY | Categories + items | Categories above items | Categories → items → actions | 4 categories, Preview/Download/Share, return links |
| SCR-09 | LAY-OPS | Multi-area dashboard | Wrapped areas | Stacked areas | Orgs, Users, Usage, Security, Governance |

## Shell adaptation

| Shell region | BP-EXPANDED | BP-MEDIUM | BP-COMPACT |
|--------------|-------------|-----------|------------|
| SHELL-HEADER | Brand + destinations + access as offered | Destinations may compact into a destination set (still same targets) | Destinations offered via compact navigation set; same NAV targets only |
| SHELL-CONTEXT | Visible when Project known | Visible when Project known | Visible as short Project cue above main content when Project known |
| SHELL-MAIN | Pattern at Expanded | Pattern at Medium | Pattern at Compact |
| SHELL-FOOTER | Optional on SCR-01 | Optional | May hide non-critical footer; must not hide Golden Path CTAs |

## Golden Path responsive guarantee

| Path | Guarantee |
|------|-----------|
| GP-01…GP-04 | Completable at BP-COMPACT, BP-MEDIUM, and BP-EXPANDED |
| GP-01R | My Projects → Continue → Workspace completable at all breakpoints |

---

# 6. Component Adaptation

Components keep the same purpose and intents (PD-3.4 / PD-3.5).  
Only presentation arrangement priority changes.

| Component | BP-EXPANDED | BP-MEDIUM | BP-COMPACT | Interaction preserved |
|-----------|-------------|-----------|------------|------------------------|
| CMP-SHELL-HEADER | Full destination set as allowed | Compact destination set | Compact destination set | INT-NAV-SHELL |
| CMP-SHELL-CONTEXT | Full cue | Full/short cue | Short cue | Orientation only |
| CMP-SHELL-FOOTER | Optional | Optional | Optional / omit if non-critical | Non-primary |
| CMP-ACCESS-SIGNIN | In header | In header | In header / access set | INT-ACCESS-SIGNIN |
| CMP-ACCESS-LANGUAGE | In header | In header | In header / access set | INT-ACCESS-LANGUAGE |
| CMP-GOAL-CARD | Horizontal group | Wrap | Vertical stack | INT-ENTRY-GOAL |
| CMP-NAV-CONTINUITY | With goals | With/below goals | Below goals | INT-ENTRY-CONTINUITY |
| CMP-GUIDE-PANEL | Above capture | Above capture | Above capture | INT-INTAKE-START |
| CMP-INPUT-PLANNING | Single column fields | Single column | Single column | INT-INTAKE-INPUT |
| CMP-UPLOAD-TENDER | Full upload zone | Full upload zone | Full upload zone | INT-INTAKE-UPLOAD |
| CMP-STATUS-PROCESS | Below/near upload | Below upload | Below upload | INT-INTAKE-STATUS |
| CMP-FORWARD-PRIMARY | After capture/result | After capture/result | After capture/result; must not be obscured by stacked content | INT-FORWARD-PRIMARY |
| CMP-CONV-PANEL | Left zone | Primary or secondary column | Stacked section | INT-WS-CONVERSE |
| CMP-TASK-PANEL | Center zone | Primary zone | First stacked section (primary) | INT-WS-TASK |
| CMP-CONTEXT-PANEL | Right zone | Secondary / collapsible but available | Third stacked section | INT-WS-CONTEXT |
| CMP-OUTCOME-LINKS | Near context/task | Near task | After task/context stack | INT-WS-OUTCOME |
| CMP-RESULT-SUMMARY | Top of main | Top | Top | INT-RESULT-REVIEW |
| CMP-RESULT-BLOCKS | Beside/below summary | Below summary | Below summary | INT-RESULT-REVIEW |
| CMP-BUDGET-OVERVIEW | Main body | Main body | Main body | INT-RESULT-REVIEW |
| CMP-ARTIFACT-ACTIONS | With result/library | Below content | Below content, before Forward | INT-ARTIFACT-* |
| CMP-FORWARD-GROUP | After actions | After actions | After actions | INT-FORWARD-GROUP |
| CMP-PROJECT-LIST | Full list | Full list | Full list | INT-LIST-BROWSE |
| CMP-PROJECT-ROW | Identity + inline actions | Identity + actions | Identity + stacked actions | INT-LIST-CONTINUE / DOCS |
| CMP-DOC-CATEGORIES | Side or top | Top | Top vertical set | INT-LIB-CATEGORY |
| CMP-DOC-ITEM | In category pane | Below categories | Below categories | INT-LIB-SELECT |
| CMP-OPS-AREA | Multi-area layout | Wrapped | Stacked | INT-OPS-VIEW |

## Component adaptation rules

| Rule ID | Rule |
|---------|------|
| CA-01 | Component ID set is closed — no new CMP-* for responsiveness |
| CA-02 | Component intents and mapped Actions do not change by breakpoint |
| CA-03 | Collapsing Context on Medium still requires Context to be user-reachable |
| CA-04 | Compact stacking must not drop Artifact or Primary Forward intents |
| CA-05 | Goal Cards remain three distinct activations (Builder / Tender / Sales) |
| CA-06 | Document categories remain exactly four labels |
| CA-07 | Ops Areas remain five panels on SCR-09 |

---

# 7. Exclusions

This document excludes:

1. React / Next.js / any implementation  
2. CSS  
3. Media queries  
4. Visual styling  
5. Design tokens / themes / spacing scales  
6. Pixel breakpoint values  
7. API / database / state management  
8. Permission logic  
9. Business logic  
10. Animation specifications  
11. New Screens, Layout Patterns, or Components  
12. Modifications to PD-1, PD-2, PD-3.1–3.5, M11–M15  

---

# 8. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-RSP-01 | Breakpoint catalogue defines BP-COMPACT, BP-MEDIUM, BP-EXPANDED only | ✓ |
| AC-RSP-02 | Every Layout Pattern has adaptation for all three breakpoints | ✓ |
| AC-RSP-03 | Every MVP Screen has adaptation mapping | ✓ SCR-01…09 |
| AC-RSP-04 | Every Component has adaptation notes / preservation of intents | ✓ |
| AC-RSP-05 | Pattern invariants preserve PD-3.2 meaning | ✓ |
| AC-RSP-06 | Golden Paths completable at Compact | ✓ |
| AC-RSP-07 | No new Screens / Patterns / Components introduced | ✓ |
| AC-RSP-08 | Interactions remain those in PD-3.5 (no new INT required for resize) | ✓ |
| AC-RSP-09 | No CSS, media queries, styling, tokens, React, API, DB, or business logic | ✓ |
| AC-RSP-10 | Inputs PD-3.2…PD-3.5 unmodified | ✓ |

## Verdict

```
PD-3.6 PASS iff AC-RSP-01 … AC-RSP-10 all PASS
```

---

# Freeze Statement

PD-3.6 Responsive Design is frozen for MVP Product Design.

Viewport classes adapt arrangement of frozen Layout Patterns, Screens, and Components.  
Product meaning, Actions, Interactions, and Domains remain unchanged.  
No CSS, media queries, or implementation artifacts are authorized by this document.
