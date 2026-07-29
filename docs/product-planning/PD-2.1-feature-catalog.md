# PD-2.1 — Feature Catalog

## Status

**Frozen**

## Type

Product Planning

## Version

`product-planning-pd-2.1-v1`

## Freeze Date

2026-07-29

## Base

PD-1 Product Blueprint (`PD-1-product-blueprint.md`)

## Source (Approved)

Enterprise Blueprint V1.0 — Product Lines, Personas, User Journeys, Information Architecture, Wireframe.

## Purpose

Catalog MVP user-facing features only.

Features describe **what the user can achieve**, not Domain capabilities, APIs, or UI components.

---

# Feature Format

| Field | Meaning |
|-------|---------|
| Feature ID | Stable planning ID |
| Name | User-facing feature name |
| Product Line | PL-01…PL-05 |
| Primary Persona | PER-01…PER-06 |
| Purpose | Business outcome |
| MVP | In / Out |
| Screen(s) | Forward ref to PD-2.2 |
| Out of Scope | Explicit exclusions |

---

# 01 MVP Feature Catalog

## Entry & Access

| Feature ID | Name | Product Line | Primary Persona | Purpose | MVP | Screen(s) |
|------------|------|--------------|-----------------|---------|-----|-----------|
| FEAT-01 | Choose Business Goal | Platform Entry | PER-01 / PER-02 / PER-03 | Enter via business goal, not technical module | In | SCR-01 |
| FEAT-02 | Sign In | Platform Entry | All MVP personas | Authenticate returning user | In | SCR-01 |
| FEAT-03 | Select Language | Platform Entry | All MVP personas | Switch language | In | SCR-01 |

## Enterprise Builder (PL-01)

| Feature ID | Name | Product Line | Primary Persona | Purpose | MVP | Screen(s) |
|------------|------|--------------|-----------------|---------|-----|-----------|
| FEAT-10 | Start Fitness Space Planning | PL-01 | PER-01 | Begin enterprise fitness planning | In | SCR-02 |
| FEAT-11 | Provide Planning Inputs | PL-01 | PER-01 | Supply company size, location, space, budget, goals | In | SCR-02 |
| FEAT-12 | Continue to AI Workspace | PL-01 | PER-01 | Move from intake to guided work | In | SCR-02 → SCR-04 |
| FEAT-13 | Review Planning Solution | PL-01 | PER-01 | Review space plan and configuration | In | SCR-05 |
| FEAT-14 | Review Budget Estimate | PL-01 | PER-01 | Review investment range and breakdown | In | SCR-06 |
| FEAT-15 | Download Solution Materials | PL-01 | PER-01 | Obtain solution / budget documents for decision | In | SCR-05, SCR-06, SCR-08 |
| FEAT-16 | Share Solution | PL-01 | PER-01 | Share generated materials | In | SCR-05, SCR-08 |

## Tender Intelligence (PL-02)

| Feature ID | Name | Product Line | Primary Persona | Purpose | MVP | Screen(s) |
|------------|------|--------------|-----------------|---------|-----|-----------|
| FEAT-20 | Upload Tender Document | PL-02 | PER-02 | Start tender workflow with source document | In | SCR-03 |
| FEAT-21 | Observe AI Processing Status | PL-02 | PER-02 | Know tender understanding is in progress | In | SCR-03 |
| FEAT-22 | Proceed to Requirement Review | PL-02 | PER-02 | Confirm extracted requirements before generation | In | SCR-03 → SCR-04 |
| FEAT-23 | Confirm Extracted Requirements | PL-02 | PER-02 | Validate scope and constraints | In | SCR-04 |
| FEAT-24 | Generate Tender Package | PL-02 | PER-02 | Obtain technical / commercial / budget package | In | SCR-04, SCR-05 |
| FEAT-25 | Download Tender Materials | PL-02 | PER-02 | Prepare for review and submission | In | SCR-08 |

## Sales Center (PL-03)

| Feature ID | Name | Product Line | Primary Persona | Purpose | MVP | Screen(s) |
|------------|------|--------------|-----------------|---------|-----|-----------|
| FEAT-30 | Start Customer Proposal | PL-03 | PER-03 | Enter Sales Center from homepage | In | SCR-01 → SCR-04 |
| FEAT-31 | Capture Customer Opportunity | PL-03 | PER-03 | Enter customer information and requirements | In | SCR-04 |
| FEAT-32 | Review Customer Proposal | PL-03 | PER-03 | Review AI-produced proposal and budget | In | SCR-05, SCR-06 |
| FEAT-33 | Share Proposal with Customer | PL-03 | PER-03 | Support opportunity communication | In | SCR-05, SCR-08 |

## AI Workspace (Shared)

| Feature ID | Name | Product Line | Primary Persona | Purpose | MVP | Screen(s) |
|------------|------|--------------|-----------------|---------|-----|-----------|
| FEAT-40 | Work in AI Workspace | Shared | PER-01 / PER-02 / PER-03 | Guided conversation + task + context | In | SCR-04 |
| FEAT-41 | View Project Context | Shared | PER-01 / PER-02 / PER-03 | See project, requirements, progress, documents | In | SCR-04 |

## Projects & Documents

| Feature ID | Name | Product Line | Primary Persona | Purpose | MVP | Screen(s) |
|------------|------|--------------|-----------------|---------|-----|-----------|
| FEAT-50 | List My Projects | Shared | Returning users | Resume prior work | In | SCR-07 |
| FEAT-51 | Continue Project | Shared | Returning users | Re-enter active project | In | SCR-07 → SCR-04 |
| FEAT-52 | Open Project Documents | Shared | Returning users | Jump to project documents | In | SCR-07 → SCR-08 |
| FEAT-53 | Browse Document Categories | Shared | PER-01 / PER-02 / PER-03 | Find Solution / Budget / Tender / Delivery files | In | SCR-08 |
| FEAT-54 | Preview Document | Shared | PER-01 / PER-02 / PER-03 | Inspect generated file | In | SCR-08 |
| FEAT-55 | Download Document | Shared | PER-01 / PER-02 / PER-03 | Export generated file | In | SCR-08 |

## Enterprise Operations (PL-05)

| Feature ID | Name | Product Line | Primary Persona | Purpose | MVP | Screen(s) |
|------------|------|--------------|-----------------|---------|-----|-----------|
| FEAT-60 | View Admin Dashboard | PL-05 | PER-06 | Observe orgs, users, usage, security, governance | In | SCR-09 |

---

# 02 Feature Classification

| Class | Feature IDs | Meaning |
|-------|-------------|---------|
| Entry | FEAT-01…FEAT-03 | Goal selection and access |
| Intake | FEAT-10…FEAT-12, FEAT-20…FEAT-22, FEAT-30…FEAT-31 | Collect need / tender / opportunity |
| Guided Work | FEAT-40…FEAT-41, FEAT-23…FEAT-24 | AI Workspace collaboration |
| Result | FEAT-13…FEAT-14, FEAT-32 | Review solution / budget / proposal |
| Artifact | FEAT-15…FEAT-16, FEAT-25, FEAT-33, FEAT-53…FEAT-55 | Download / share / manage documents |
| Continuity | FEAT-50…FEAT-52 | Returning-user project continuity |
| Operations | FEAT-60 | Platform administration |

---

# 03 Explicitly Out of MVP Feature Scope

These appear in PD-1 Product Lines / Journeys but are **not** MVP Feature Catalog items for PD-2.2 Screen Map:

| Item | Reason |
|------|--------|
| Supplier Hub full workflow (PER-04) | No MVP screen in frozen wireframe |
| Delivery Platform full lifecycle (PL-04 / PER-05) | Delivery category in documents only; no dedicated delivery screen in MVP wireframe |
| Quote Engine / Budget Engine / Tender Engine | Internal concepts — never user features |
| New Domain capabilities | Forbidden — Product Planning only |
| Billing / payment checkout | Not in Enterprise Blueprint MVP wireframe |
| Marketplace / third-party integration UI | Not in MVP screen set |

---

# 04 Rules

1. Every MVP feature maps to at least one MVP screen (PD-2.2).
2. Features do not define business logic.
3. Features do not invent Domain APIs.
4. Features do not add capabilities beyond PD-1 / Enterprise Blueprint V1.0.
5. Do not modify PD-1.

---

# Freeze Statement

PD-2.1 Feature Catalog is frozen.

PD-2.2 Screen Map and PD-2.3 User Action Map must bind only to Feature IDs listed as **MVP = In**.
