# PD-4.4 — Frontend Component Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Frontend Component Architecture

## Version

`product-delivery-pd-4.4-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-3.4 Component Specifications | CMP-* catalogue (26) |
| PD-3.5 Interaction Specifications | INT-* bindings |
| PD-3.2 / PD-3.3 | Layout patterns / Screen ownership |
| PD-3.8 UI Freeze | `product-ui-baseline-v1` |
| PD-4.1 / PD-4.2 / PD-4.3 | Architecture, routes, state |

## Purpose

Define **frontend component layering**, **reuse rules**, **composition rules**, and **responsibility boundaries**.

Components present Objects and emit intents.  
Components **own no business logic**.  
Catalogue remains the frozen PD-3.4 set — this document defines delivery layering only.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Component hierarchy | Layer stack |
| Base components | Primitive presentation units |
| Composite components | Assembled CMP-* |
| Feature components | Screen-feature bindings |
| Layout components | Shell + LAY-* hosts |
| Screen components | Page/Screen roots |
| Reuse rules | Closed catalogue reuse |
| Naming rules | Delivery identifiers |
| Props / events boundary | Data in / intents out |
| Component freeze summary | Locked inventory |
| Release Gate | Architecture readiness |

## Out of scope

| Item | Reason |
|------|--------|
| React implementation / file tree code | Markdown only |
| New CMP-* beyond PD-3.4 | UI freeze |
| Styling / design tokens / CSS | Not this doc |
| Business logic in components | Forbidden |
| Direct Domain calls from components | Adapter/Screen Action path only |
| Modification of PD-1…PD-3, PD-4.1–4.3, M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Component Principles

1. **Closed catalogue** — reuse PD-3.4 CMP-* only under `product-ui-freeze-1`.  
2. **Presentation only** — no pricing, extraction, generation, compliance, or Domain rules.  
3. **Intents up, data down** — props carry view data; events carry INT-*/Action intents.  
4. **Screens own Actions** — components do not own ACT-* IDs as business engines.  
5. **Compose by Layout Pattern** — PD-3.2 / PD-3.4 composition rules.  
6. **State class respect** — components consume ST-* per PD-4.3; no shadow Domain.  
7. **Accessibility / responsive** — honor PD-3.6 / PD-3.7 without new components.  
8. **Technology-agnostic ownership** — layering rules apply regardless of framework.

---

# 3. Component Hierarchy

```
L5  Screen components          PG-* / SCR-* roots
      │
L4  Layout components          Shell regions + LAY-* hosts
      │
L3  Feature components         Screen-bound feature assemblies
      │
L2  Composite components       PD-3.4 CMP-* (primary catalogue)
      │
L1  Base components            Primitives (label, text, control shell)
```

## Hierarchy rules

| Rule | Statement |
|------|-----------|
| H-01 | Lower layers must not import Screen/Feature knowledge as business rules |
| H-02 | L2 CMP-* are the product reusable units specified in PD-3.4 |
| H-03 | L1 exists only to support L2 presentation — not a second product catalogue |
| H-04 | L5 may wire routes/state; must not embed Domain logic |
| H-05 | Events bubble toward L5; Domain I/O occurs via UI Adapter after Action — not inside L1–L2 |

---

# 4. Base Components (L1)

## 4.1 Role

Framework-agnostic **primitives** used inside composite CMP-*.  
They are delivery helpers — **not** new product Features.

## 4.2 Primitive set (illustrative, non-expanding product inventory)

| Base ID | Purpose | May be used by |
|---------|---------|----------------|
| BASE-TEXT | Render labeled text | All CMP-* |
| BASE-HEADING | Region/title text | Panels, summaries |
| BASE-CONTROL | Generic activatable control shell | Sign-in, forward, artifact, nav |
| BASE-FIELD | Labeled input shell | Planning inputs, opportunity fields |
| BASE-STATUS-TEXT | Readable status text | Processing status, meta messages |
| BASE-LIST | List container | Project list, doc items |
| BASE-REGION | Landmark/region wrapper | Conversation/task/context zones |

## 4.3 Base rules

| Rule | Statement |
|------|-----------|
| B-01 | Base components expose no Domain types |
| B-02 | Base components emit only generic UI events (activate, change, select) |
| B-03 | Do not create BASE-* that duplicate a CMP-* product intent |
| B-04 | Base layer owns no routing and no API calls |

---

# 5. Composite Components (L2)

## 5.1 Role

The **frozen product component catalogue** (PD-3.4).  
Each CMP-* is a composite of base primitives + product labeling.

## 5.2 Catalogue (locked — 26)

| Family | Component IDs |
|--------|----------------|
| Shell | CMP-SHELL-HEADER, CMP-SHELL-CONTEXT, CMP-SHELL-FOOTER |
| Access / Entry | CMP-ACCESS-SIGNIN, CMP-ACCESS-LANGUAGE, CMP-GOAL-CARD, CMP-NAV-CONTINUITY |
| Intake | CMP-GUIDE-PANEL, CMP-INPUT-PLANNING, CMP-UPLOAD-TENDER, CMP-STATUS-PROCESS |
| Shared forward | CMP-FORWARD-PRIMARY, CMP-FORWARD-GROUP |
| Workspace | CMP-CONV-PANEL, CMP-TASK-PANEL, CMP-CONTEXT-PANEL, CMP-OUTCOME-LINKS |
| Results / Artifacts | CMP-RESULT-SUMMARY, CMP-RESULT-BLOCKS, CMP-BUDGET-OVERVIEW, CMP-ARTIFACT-ACTIONS |
| Continuity / Library | CMP-PROJECT-LIST, CMP-PROJECT-ROW, CMP-DOC-CATEGORIES, CMP-DOC-ITEM |
| Ops | CMP-OPS-AREA |

## 5.3 Composite responsibility

| Owns | Does not own |
|------|--------------|
| Product-facing structure for its zone | Business validation |
| Mapping props → visible Objects/labels | API schemas |
| Emitting INT-* intents | Domain mutations |
| Local ephemeral UI (focus/open) | Session minting / RBAC |

## 5.4 Composition pairs (from PD-3.4)

| Parent | Children |
|--------|----------|
| CMP-PROJECT-LIST | CMP-PROJECT-ROW |
| CMP-DOC-CATEGORIES | CMP-DOC-ITEM |
| CMP-DOC-ITEM / Result panels | CMP-ARTIFACT-ACTIONS |
| Intake panels | CMP-FORWARD-PRIMARY |
| Result panels | CMP-FORWARD-GROUP / CMP-FORWARD-PRIMARY |
| SCR-09 | CMP-OPS-AREA ×5 |

---

# 6. Feature Components (L3)

## 6.1 Role

**Screen-feature assemblies** that bind one or more CMP-* to a Feature (FEAT-*) **without** adding business logic.

Feature components are thin wrappers for reuse clarity in delivery — they still only emit intents.

## 6.2 Feature assembly map

| Feature component ID | Feature(s) | Composes | Screens |
|----------------------|------------|----------|---------|
| FEATCMP-GOAL-ENTRY | FEAT-01, FEAT-30 | CMP-GOAL-CARD ×3 | SCR-01 |
| FEATCMP-ACCESS | FEAT-02, FEAT-03 | CMP-ACCESS-SIGNIN, CMP-ACCESS-LANGUAGE | SCR-01 |
| FEATCMP-CONTINUITY | FEAT-50 | CMP-NAV-CONTINUITY | SCR-01 |
| FEATCMP-BUILDER-INTAKE | FEAT-10…12 | GUIDE + INPUT-PLANNING + FORWARD | SCR-02 |
| FEATCMP-TENDER-INTAKE | FEAT-20…22 | GUIDE + UPLOAD + STATUS + FORWARD | SCR-03 |
| FEATCMP-WORKSPACE | FEAT-40, FEAT-41, FEAT-23/24/31 | CONV + TASK + CONTEXT + OUTCOME | SCR-04 |
| FEATCMP-SOLUTION-RESULT | FEAT-13/15/16/24/32/33 | SUMMARY + BLOCKS + ARTIFACT + FORWARD | SCR-05 |
| FEATCMP-BUDGET-RESULT | FEAT-14/15/32 | SUMMARY + BUDGET-OVERVIEW + ARTIFACT + FORWARD | SCR-06 |
| FEATCMP-PROJECTS | FEAT-50…52 | PROJECT-LIST + ROW | SCR-07 |
| FEATCMP-DOCUMENTS | FEAT-53…55 (+15/16/25/33) | CATEGORIES + ITEM + ARTIFACT + FORWARD | SCR-08 |
| FEATCMP-ADMIN-OPS | FEAT-60 | OPS-AREA ×5 | SCR-09 |

## 6.3 Feature component rules

| Rule | Statement |
|------|-----------|
| F-01 | FEATCMP-* must not introduce new user-facing Objects |
| F-02 | FEATCMP-* may pass Screen Action handlers downward as callbacks |
| F-03 | FEATCMP-* must not call APIs directly — Screen/Adapter owns fetch+Command |
| F-04 | FEATCMP-* count is delivery organization only; product inventory remains CMP-* |

---

# 7. Layout Components (L4)

## 7.1 Role

Hosts that apply **shell regions** and **Layout Patterns (LAY-*)**.

## 7.2 Layout component set

| Layout component ID | Pattern / region | Hosts |
|---------------------|------------------|-------|
| LAYCMP-SHELL | App shell | HEADER + CONTEXT + MAIN slot + FOOTER |
| LAYCMP-ENTRY | LAY-ENTRY | Access + Goal entry + Continuity |
| LAYCMP-INTAKE | LAY-INTAKE | Guide + capture + Forward |
| LAYCMP-SPLIT-3 | LAY-SPLIT-3 | Conversation + Task + Context (+ Outcomes) |
| LAYCMP-RESULT | LAY-RESULT | Summary + blocks/overview + artifacts + forward |
| LAYCMP-LIST | LAY-LIST | Project list host |
| LAYCMP-LIBRARY | LAY-LIBRARY | Categories + items + artifacts + forward |
| LAYCMP-OPS | LAY-OPS | Ops areas host |

## 7.3 Layout rules

| Rule | Statement |
|------|-----------|
| LY-01 | Exactly one LAY-* host per Screen (PD-3.3 / PD-4.1) |
| LY-02 | Layout components arrange slots only — no Domain branching |
| LY-03 | Responsive behavior rearranges slots per PD-3.6 — no new layout IDs |
| LY-04 | Shell destinations emit nav intents only (PD-4.2 allowed routes) |

---

# 8. Screen Components (L5)

## 8.1 Role

**Page roots** (PD-4.2 PG-*) that:

- select Layout host,
- bind Feature assemblies,
- connect INT-* → ACT-* → UI Adapter / router,
- own Screen-level ST-META (loading/error/empty).

## 8.2 Screen component map

| Screen component | Page | Screen | Layout host | Feature assembly |
|------------------|------|--------|-------------|------------------|
| SCRCMP-HOME | PG-HOME | SCR-01 | LAYCMP-ENTRY | ACCESS + GOAL-ENTRY + CONTINUITY |
| SCRCMP-BUILDER | PG-BUILDER | SCR-02 | LAYCMP-INTAKE | BUILDER-INTAKE |
| SCRCMP-TENDER | PG-TENDER | SCR-03 | LAYCMP-INTAKE | TENDER-INTAKE |
| SCRCMP-WORKSPACE | PG-WORKSPACE | SCR-04 | LAYCMP-SPLIT-3 | WORKSPACE |
| SCRCMP-SOLUTION | PG-SOLUTION | SCR-05 | LAYCMP-RESULT | SOLUTION-RESULT |
| SCRCMP-BUDGET | PG-BUDGET | SCR-06 | LAYCMP-RESULT | BUDGET-RESULT |
| SCRCMP-PROJECTS | PG-PROJECTS | SCR-07 | LAYCMP-LIST | PROJECTS |
| SCRCMP-DOCUMENTS | PG-DOCUMENTS | SCR-08 | LAYCMP-LIBRARY | DOCUMENTS |
| SCRCMP-ADMIN | PG-ADMIN | SCR-09 | LAYCMP-OPS | ADMIN-OPS |

## 8.3 Screen component rules

| Rule | Statement |
|------|-----------|
| SC-01 | Screen component owns only that Screen’s Actions |
| SC-02 | API consumption happens via Adapter invoked from Screen Action handlers — not from L1/L2 |
| SC-03 | Navigation uses PD-4.2 edges only |
| SC-04 | Screen components must not implement Domain algorithms |

---

# 9. Reuse Rules

| Rule ID | Rule |
|---------|------|
| RU-01 | Prefer existing CMP-* before any new delivery wrapper |
| RU-02 | Do not fork CMP-* per persona — vary by props (labels, enabled intents) |
| RU-03 | CMP-ARTIFACT-ACTIONS reused on SCR-05/06/08 with Screen-specific Action maps |
| RU-04 | CMP-FORWARD-PRIMARY / GROUP reused; targets constrained by parent Screen edges |
| RU-05 | CMP-OPS-AREA reused five times on SCR-09 — not five Screens |
| RU-06 | CMP-GOAL-CARD reused three times for three goals — distinct accessible names |
| RU-07 | No duplicate “one-off” composites that clone PD-3.4 behaviour under new IDs |
| RU-08 | Base primitives shared freely; product meaning stays at CMP-* |

---

# 10. Naming Rules

| Layer | Pattern | Example |
|-------|---------|---------|
| Product composite | `CMP-{FAMILY}-{NAME}` | `CMP-GOAL-CARD` |
| Feature assembly | `FEATCMP-{FEATURE-AREA}` | `FEATCMP-WORKSPACE` |
| Layout host | `LAYCMP-{PATTERN}` | `LAYCMP-SPLIT-3` |
| Screen root | `SCRCMP-{SCREEN}` | `SCRCMP-HOME` |
| Base primitive | `BASE-{PRIMITIVE}` | `BASE-FIELD` |
| Page (route ownership) | `PG-{NAME}` | `PG-WORKSPACE` |

## Naming constraints

| Rule | Statement |
|------|-----------|
| N-01 | Do not name components after Domain modules (M11, KnowledgeRuntime, etc.) |
| N-02 | Do not name components after engines (BudgetEngine, TenderParser) |
| N-03 | User-visible strings remain PD-3.1 labels — identifiers stay English technical tokens |
| N-04 | New CMP-* names are forbidden under UI freeze without Product Design revision |

---

# 11. Props / Events Boundary

## 11.1 Data down (props)

| Prop category | Allowed content | Forbidden content |
|---------------|-----------------|-------------------|
| View model | OBJ-* display fields from ST-SERVER / ST-DERIVED | Domain policy objects |
| Meta | META-LOADING / ERROR / EMPTY flags | Stack traces as primary UX |
| Context cues | projectId, category, selected ids | Secrets / raw tokens |
| Presentation options | breakpoint class, simplified shell | Entitlement matrices |
| Labels | PD-3.1 user-facing names | Engine jargon |

## 11.2 Events up (intents)

| Event category | Maps to | Forbidden |
|----------------|---------|-----------|
| Activate / submit / select / navigate intents | INT-* → ACT-* / Command | Inline Domain calls |
| Draft change | ST-LOCAL updates | Business validation engines |
| Retry | Re-issue same Command | Alternate Domain workflow invention |

## 11.3 Boundary diagram

```
Parent (Screen / Feature)
   props (view data, meta, cues)
        ↓
   CMP-* / LAYCMP-*
        ↑
   events (INT-* intents)
Parent → Action handler → UI Adapter → Existing API → Domain
```

## 11.4 Boundary rules

| Rule | Statement |
|------|-----------|
| PE-01 | Components never import Domain modules directly |
| PE-02 | Components never invent ACT-* not owned by their Screen |
| PE-03 | Props are display-ready; components do not recompute business totals |
| PE-04 | Async results enter via props after Screen/Adapter fetch — not hidden fetches inside L2 |
| PE-05 | Event payloads carry opaque ids + intent names only |

---

# 12. Responsibility Matrix

| Layer | May | Must not |
|-------|-----|----------|
| L1 Base | Render primitives | Know Features/Domains |
| L2 Composite | Product zone UI + INT emit | API/Domain logic |
| L3 Feature | Assemble CMP-* for FEAT-* | Own business rules |
| L4 Layout | Slot arrangement + shell | Decide Golden Path eligibility |
| L5 Screen | Action wiring + meta + adapter calls | Implement M11–M15 logic |
| UI Adapter | Map API↔view models | Become a Domain |

---

# 13. Component Freeze Summary

```
COMPONENT_ARCH_ID     = product-frontend-component-architecture-v1
UI_BASELINE_REF       = product-ui-baseline-v1
CMP_CATALOGUE_COUNT   = 26
CMP_CATALOGUE_SOURCE  = PD-3.4
NO_NEW_CMP            = true
NO_BUSINESS_LOGIC     = true
LAYERS                = L1…L5
```

## Locked inventories

| Item | Count / set |
|------|-------------|
| Product composites | 26 CMP-* |
| Feature assemblies | 11 FEATCMP-* (delivery only) |
| Layout hosts | 8 LAYCMP-* |
| Screen roots | 9 SCRCMP-* |
| Screens covered | SCR-01…09 |

## Immutable prohibitions

1. No new product Components under this freeze.  
2. No business logic in any layer.  
3. No direct Domain access from L1–L4.  
4. No modification of PD-3.4 catalogue meanings.

---

# 14. Release Gate

## Gate ID

`product-frontend-component-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| CMPA-HIER | Hierarchy defined | L1…L5 present with rules |
| CMPA-CAT | Catalogue locked | 26 CMP-* from PD-3.4; no extras as product inventory |
| CMPA-MAP | Screen mapping complete | All SCR-01…09 have SCRCMP + LAYCMP + FEATCMP |
| CMPA-BOUND | Props/events bounded | Data down / intents up; no Domain imports in components |
| CMPA-REUSE | Reuse rules present | Closed catalogue; shared artifact/forward/ops reuse |
| CMPA-NAME | Naming rules present | CMP/FEATCMP/LAYCMP/SCRCMP/BASE patterns |
| CMPA-SCOPE | Upstream intact | PD-1…3 / PD-4.1–4.3 / M11–M15 unmodified; single new file only |

## Verdict

```
PD-4.4 Gate = PASS
  iff CMPA-HIER ∧ CMPA-CAT ∧ CMPA-MAP ∧ CMPA-BOUND
    ∧ CMPA-REUSE ∧ CMPA-NAME ∧ CMPA-SCOPE all PASS
```

---

# 15. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-CMPA-01 | Hierarchy + layer responsibilities defined | ✓ |
| AC-CMPA-02 | Base / composite / feature / layout / screen layers defined | ✓ |
| AC-CMPA-03 | Reuse + naming + props/events boundaries defined | ✓ |
| AC-CMPA-04 | Freeze summary + Release Gate present | ✓ |
| AC-CMPA-05 | Frontend owns no business logic; existing Domains/APIs only | ✓ |
| AC-CMPA-06 | Markdown only; no additional files; upstream unmodified | ✓ |

## Verdict

```
PD-4.4 document PASS iff AC-CMPA-01 … AC-CMPA-06 PASS
```

---

# Document Statement

PD-4.4 Frontend Component Architecture locks how frozen CMP-* are layered for delivery.

```
Screen → Layout → Feature assembly → Composite (CMP-*) → Base
props down / intents up
Actions at Screen → Adapter → existing API → Domain
Components own presentation only
```
