# PD-2.2 — Screen Map

## Status

**Frozen**

## Type

Product Planning

## Version

`product-planning-pd-2.2-v1`

## Freeze Date

2026-07-29

## Base

- PD-1 Product Blueprint (`PD-1-product-blueprint.md`)
- PD-2.1 Feature Catalog (`PD-2.1-feature-catalog.md`)

## Source (Approved)

Enterprise Blueprint V1.0 — `07-WIREFRAME.md` (Page 1–9), aligned with `04-USER-JOURNEY.md`, `05-INFORMATION-ARCHITECTURE.md`, `06-NAVIGATION.md`.

## Purpose

Freeze the complete MVP Screen Map.

Screens describe **where the user works**, not UI layout details, visual design, or implementation.

---

# Screen Format

| Field | Meaning |
|-------|---------|
| Screen ID | Stable planning ID |
| Name | User-facing screen name |
| Purpose | One primary user goal |
| Primary Consumer | Persona(s) |
| Product Line | PL entry when applicable |
| Features | PD-2.1 Feature IDs on this screen |
| Entry From | Prior screen(s) / entry |
| Exit To | Next screen(s) |
| Golden Path | Yes / No |
| Out of Scope | Explicit exclusions |

---

# 01 MVP Screen Catalog

## SCR-01 — Homepage

| Field | Value |
|-------|-------|
| Screen ID | SCR-01 |
| Name | Homepage |
| Purpose | Provide clear business entry points |
| Primary Consumer | PER-01, PER-02, PER-03 (first entry); returning users |
| Product Line | Platform Entry |
| Features | FEAT-01, FEAT-02, FEAT-03, FEAT-30 |
| Entry From | External / Login |
| Exit To | SCR-02, SCR-03, SCR-04 (Sales), SCR-07 |
| Golden Path | Yes (start) |
| Structure (planning only) | Header · Hero · Entry Cards (Enterprise Builder / Tender Intelligence / Sales Center) · Footer |
| Out of Scope | Visual styling; technical module menus |

---

## SCR-02 — Enterprise Builder Entry

| Field | Value |
|-------|-------|
| Screen ID | SCR-02 |
| Name | Enterprise Builder Entry |
| Purpose | Start enterprise fitness planning |
| Primary Consumer | PER-01 |
| Product Line | PL-01 |
| Features | FEAT-10, FEAT-11, FEAT-12 |
| Entry From | SCR-01 |
| Exit To | SCR-04 |
| Golden Path | Yes (Enterprise Customer Journey) |
| Structure (planning only) | AI Assistant welcome · Conversation/input (company size, location, space, budget, goals) · Continue |
| Out of Scope | UI component design; Domain engine exposure |

---

## SCR-03 — Tender Intelligence Entry

| Field | Value |
|-------|-------|
| Screen ID | SCR-03 |
| Name | Tender Intelligence Entry |
| Purpose | Start tender workflow |
| Primary Consumer | PER-02 |
| Product Line | PL-02 |
| Features | FEAT-20, FEAT-21, FEAT-22 |
| Entry From | SCR-01 |
| Exit To | SCR-04 |
| Golden Path | Yes (Tender Customer Journey) |
| Structure (planning only) | Upload area · AI processing status · Next: Requirement Review |
| Out of Scope | Parser implementation; API schema |

---

## SCR-04 — AI Workspace

| Field | Value |
|-------|-------|
| Screen ID | SCR-04 |
| Name | AI Workspace |
| Purpose | AI-guided working environment |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | Shared (PL-01 / PL-02 / PL-03) |
| Features | FEAT-12, FEAT-22, FEAT-23, FEAT-24, FEAT-31, FEAT-40, FEAT-41, FEAT-51 |
| Entry From | SCR-02, SCR-03, SCR-01 (Sales), SCR-07 |
| Exit To | SCR-05, SCR-06, SCR-08 |
| Golden Path | Yes (all MVP journeys) |
| Structure (planning only) | Left: AI conversation · Center: current task · Right: context (project, requirements, progress, documents) |
| Out of Scope | Model/provider selection UI; internal engine panels |

---

## SCR-05 — Solution Result

| Field | Value |
|-------|-------|
| Screen ID | SCR-05 |
| Name | Solution Result |
| Purpose | Display generated solution |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | PL-01 / PL-02 / PL-03 |
| Features | FEAT-13, FEAT-15, FEAT-16, FEAT-24, FEAT-32, FEAT-33 |
| Entry From | SCR-04 |
| Exit To | SCR-06, SCR-08, SCR-04 |
| Golden Path | Yes |
| Structure (planning only) | Solution summary · Cards (Planning / Configuration / Budget) · Actions (Download / Continue / Share) |
| Out of Scope | PDF layout; visual card design |

---

## SCR-06 — Budget Result

| Field | Value |
|-------|-------|
| Screen ID | SCR-06 |
| Name | Budget Result |
| Purpose | Display investment information |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | PL-01 / PL-02 / PL-03 |
| Features | FEAT-14, FEAT-15, FEAT-32 |
| Entry From | SCR-04, SCR-05 |
| Exit To | SCR-05, SCR-08, SCR-04 (adjust requirements) |
| Golden Path | Yes |
| Structure (planning only) | Budget overview · Investment range · Category breakdown · Options · Actions (Download Budget / Adjust Requirements) |
| Out of Scope | Pricing algorithm; database |

---

## SCR-07 — My Projects

| Field | Value |
|-------|-------|
| Screen ID | SCR-07 |
| Name | My Projects |
| Purpose | Manage previous projects |
| Primary Consumer | Returning users (PER-01 / PER-02 / PER-03) |
| Product Line | Shared |
| Features | FEAT-50, FEAT-51, FEAT-52 |
| Entry From | SCR-01, global navigation |
| Exit To | SCR-04, SCR-08 |
| Golden Path | Yes (returning path) |
| Structure (planning only) | Project list · Project card (name, status, created date) · Actions (Continue / View Documents) |
| Out of Scope | Admin tenant management (see SCR-09) |

---

## SCR-08 — My Documents

| Field | Value |
|-------|-------|
| Screen ID | SCR-08 |
| Name | My Documents |
| Purpose | Manage generated files |
| Primary Consumer | PER-01, PER-02, PER-03 |
| Product Line | Shared |
| Features | FEAT-15, FEAT-16, FEAT-25, FEAT-33, FEAT-52, FEAT-53, FEAT-54, FEAT-55 |
| Entry From | SCR-05, SCR-06, SCR-07, SCR-04 |
| Exit To | SCR-07, SCR-04, SCR-01 |
| Golden Path | Yes (decision / submission preparation) |
| Structure (planning only) | Categories: Solution / Budget / Tender / Delivery · Actions: Preview / Download / Share |
| Out of Scope | New document types beyond blueprint categories |

---

## SCR-09 — Admin Dashboard

| Field | Value |
|-------|-------|
| Screen ID | SCR-09 |
| Name | Admin Dashboard |
| Purpose | Platform operation |
| Primary Consumer | PER-06 |
| Product Line | PL-05 |
| Features | FEAT-60 |
| Entry From | Admin entry (not customer Golden Path) |
| Exit To | — (operations surface) |
| Golden Path | No (operations path) |
| Structure (planning only) | Metrics · Organizations · Users · Usage · Security · Governance |
| Out of Scope | Infrastructure tooling; Domain governance UIs beyond blueprint |

---

# 02 Screen Inventory Summary

| Screen ID | Name | Golden Path | MVP |
|-----------|------|-------------|-----|
| SCR-01 | Homepage | Yes | In |
| SCR-02 | Enterprise Builder Entry | Yes | In |
| SCR-03 | Tender Intelligence Entry | Yes | In |
| SCR-04 | AI Workspace | Yes | In |
| SCR-05 | Solution Result | Yes | In |
| SCR-06 | Budget Result | Yes | In |
| SCR-07 | My Projects | Yes (return) | In |
| SCR-08 | My Documents | Yes | In |
| SCR-09 | Admin Dashboard | No | In |

**MVP Screen count: 9**

Every MVP Feature in PD-2.1 maps to at least one Screen above.

---

# 03 Golden Path Screen Flows

## GP-01 — Enterprise Customer

```
SCR-01 Homepage
    ↓
SCR-02 Enterprise Builder Entry
    ↓
SCR-04 AI Workspace
    ↓
SCR-05 Solution Result
    ↓
SCR-06 Budget Result
    ↓
SCR-08 My Documents
```

Returning:

```
SCR-01 → SCR-07 → SCR-04 → …
```

## GP-02 — Tender Customer

```
SCR-01 Homepage
    ↓
SCR-03 Tender Intelligence Entry
    ↓
SCR-04 AI Workspace
    ↓
SCR-05 Solution Result
    ↓
SCR-08 My Documents
```

## GP-03 — Sales Consultant

```
SCR-01 Homepage
    ↓
SCR-04 AI Workspace
    ↓
SCR-05 Solution Result
    ↓
SCR-06 Budget Result
    ↓
SCR-08 My Documents
```

## GP-04 — Platform Administrator

```
SCR-09 Admin Dashboard
```

---

# 04 Screen → Feature Coverage Matrix

| Screen | Features |
|--------|----------|
| SCR-01 | FEAT-01, FEAT-02, FEAT-03, FEAT-30 |
| SCR-02 | FEAT-10, FEAT-11, FEAT-12 |
| SCR-03 | FEAT-20, FEAT-21, FEAT-22 |
| SCR-04 | FEAT-12, FEAT-22, FEAT-23, FEAT-24, FEAT-31, FEAT-40, FEAT-41, FEAT-51 |
| SCR-05 | FEAT-13, FEAT-15, FEAT-16, FEAT-24, FEAT-32, FEAT-33 |
| SCR-06 | FEAT-14, FEAT-15, FEAT-32 |
| SCR-07 | FEAT-50, FEAT-51, FEAT-52 |
| SCR-08 | FEAT-15, FEAT-16, FEAT-25, FEAT-33, FEAT-52, FEAT-53, FEAT-54, FEAT-55 |
| SCR-09 | FEAT-60 |

---

# 05 Out of Scope Screens

Not part of this frozen MVP Screen Map:

- Supplier Hub screens
- Full Delivery Platform screens
- Billing / checkout screens
- Marketplace screens
- Internal engine / admin-of-engines screens

---

# 06 Rules

1. Do not add MVP screens without a Product Planning revision.
2. Do not split or rename SCR-01…SCR-09 without freeze revision.
3. No UI design, visual system, or component specs in this document.
4. No API or database definitions.
5. Do not modify PD-1 or PD-2.1.
6. Ready for PD-2.3 User Action Map: every screen will receive Actions; each Action belongs to exactly one Screen.

---

# Freeze Statement

PD-2.2 Screen Map is frozen.

PD-2.3 User Action Map must use only Screen IDs **SCR-01 … SCR-09**.
