# PD-2.3 — User Action Map

## Status

**Frozen**

## Type

Product Planning

## Version

`product-planning-pd-2.3-v1`

## Freeze Date

2026-07-29

## Base (Input — read-only)

- `PD-2.1-feature-catalog.md` (`product-planning-pd-2.1-v1`)
- `PD-2.2-screen-map.md` (`product-planning-pd-2.2-v1`)

## Purpose

Map every MVP Screen to user Actions.

Actions are **commands issued from a Screen**. They do not embed business logic.

## Action Model

```
Screen
    ↓
Command
    ↓
API          ← defined in PD-2.4 (not this document)
    ↓
Existing Domain
```

**Not allowed:**

```
Screen
    ↓
Business Logic
```

## Action Format

| Field | Meaning |
|-------|---------|
| Action ID | Stable ID; belongs to exactly one Screen |
| Action Name | User-facing command name |
| Screen | SCR-01…SCR-09 |
| Feature | PD-2.1 Feature ID(s) realized by this Action |
| Primary Consumer | Persona |
| Purpose | Why the user issues the command |
| Preconditions | What must already be true |
| Result | Observable outcome (not algorithm) |
| Next Action | Typical next Action ID, or — |
| Golden Path | GP-01 / GP-02 / GP-03 / GP-04 / — |
| Command | Planning command intent (no API schema) |
| Out of Scope | Explicit exclusions |

---

# 01 User Action Catalog

## SCR-01 — Homepage

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-01-01 | Sign In | FEAT-02 | All MVP personas | Authenticate returning user | User is on SCR-01 | User session established | ACT-01-03 or ACT-01-06 | GP-01 / GP-02 / GP-03 | `SignIn` | Auth provider UI design |
| ACT-01-02 | Select Language | FEAT-03 | All MVP personas | Switch display language | User is on SCR-01 | Language preference applied | — | — | `SelectLanguage` | Localization implementation |
| ACT-01-03 | Choose Enterprise Builder | FEAT-01 | PER-01 | Enter PL-01 goal | User is on SCR-01 | Navigate to SCR-02 | ACT-02-01 | GP-01 | `ChooseGoal.EnterpriseBuilder` | Technical module menus |
| ACT-01-04 | Choose Tender Intelligence | FEAT-01 | PER-02 | Enter PL-02 goal | User is on SCR-01 | Navigate to SCR-03 | ACT-03-01 | GP-02 | `ChooseGoal.TenderIntelligence` | Parser UI |
| ACT-01-05 | Choose Sales Center | FEAT-30 | PER-03 | Enter PL-03 goal | User is on SCR-01 | Navigate to SCR-04 (Sales) | ACT-04-05 | GP-03 | `ChooseGoal.SalesCenter` | CRM implementation |
| ACT-01-06 | Open My Projects | FEAT-50 | Returning users | Resume prior work | User signed in | Navigate to SCR-07 | ACT-07-01 | GP-01 return | `OpenMyProjects` | Admin tenant list |

---

## SCR-02 — Enterprise Builder Entry

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-02-01 | Start Fitness Space Planning | FEAT-10 | PER-01 | Begin enterprise fitness planning | Arrived from ACT-01-03 | Planning intake session ready | ACT-02-02 | GP-01 | `StartPlanning` | Domain engine exposure |
| ACT-02-02 | Provide Planning Inputs | FEAT-11 | PER-01 | Supply company size, location, space, budget, goals | ACT-02-01 done | Planning inputs accepted on screen | ACT-02-03 | GP-01 | `SubmitPlanningInputs` | Validation algorithms |
| ACT-02-03 | Continue to AI Workspace | FEAT-12 | PER-01 | Move from intake to guided work | ACT-02-02 inputs present | Navigate to SCR-04 | ACT-04-01 | GP-01 | `ContinueToWorkspace` | Auto-planning logic |

---

## SCR-03 — Tender Intelligence Entry

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-03-01 | Upload Tender Document | FEAT-20 | PER-02 | Start tender workflow with source document | Arrived from ACT-01-04 | Tender document accepted on screen | ACT-03-02 | GP-02 | `UploadTenderDocument` | File storage schema |
| ACT-03-02 | Observe AI Processing Status | FEAT-21 | PER-02 | Know tender understanding is in progress | ACT-03-01 done | Processing status visible | ACT-03-03 | GP-02 | `ViewProcessingStatus` | Model/provider selection |
| ACT-03-03 | Proceed to Requirement Review | FEAT-22 | PER-02 | Enter requirement confirmation in workspace | Processing status allows next step | Navigate to SCR-04 | ACT-04-03 | GP-02 | `ProceedToRequirementReview` | Extraction algorithm |

---

## SCR-04 — AI Workspace

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-04-01 | Work in AI Workspace | FEAT-40 | PER-01 / PER-02 / PER-03 | Continue guided conversation and task | On SCR-04 via SCR-02 / SCR-03 / SCR-01 / SCR-07 | Task progress updated in workspace | ACT-04-02 | GP-01 / GP-02 / GP-03 | `WorkspaceInteract` | Prompt engineering |
| ACT-04-02 | View Project Context | FEAT-41 | PER-01 / PER-02 / PER-03 | See project, requirements, progress, documents | On SCR-04 | Context panel shows current project state | ACT-04-01 or ACT-04-06 | GP-01 / GP-02 / GP-03 | `ViewProjectContext` | Internal engine panels |
| ACT-04-03 | Confirm Extracted Requirements | FEAT-23 | PER-02 | Validate scope and constraints | Arrived via ACT-03-03 | Requirements confirmed | ACT-04-04 | GP-02 | `ConfirmRequirements` | Compliance scoring logic |
| ACT-04-04 | Generate Tender Package | FEAT-24 | PER-02 | Request tender package generation | ACT-04-03 done | Navigate to SCR-05 with package result intent | ACT-05-02 | GP-02 | `GenerateTenderPackage` | Package composition logic |
| ACT-04-05 | Capture Customer Opportunity | FEAT-31 | PER-03 | Enter customer information and requirements | Arrived via ACT-01-05 | Opportunity inputs accepted | ACT-04-06 | GP-03 | `CaptureOpportunity` | CRM schema |
| ACT-04-06 | Open Solution Result | FEAT-13 / FEAT-24 / FEAT-32 | PER-01 / PER-02 / PER-03 | Move from guided work to solution review | Workspace task ready for result | Navigate to SCR-05 | ACT-05-01 | GP-01 / GP-02 / GP-03 | `OpenSolutionResult` | Generation algorithms |
| ACT-04-07 | Open Budget Result | FEAT-14 / FEAT-32 | PER-01 / PER-03 | Move to investment review | Solution or workspace allows budget view | Navigate to SCR-06 | ACT-06-01 | GP-01 / GP-03 | `OpenBudgetResult` | Pricing algorithm |
| ACT-04-08 | Open Documents from Workspace | FEAT-52 | PER-01 / PER-02 / PER-03 | Jump to documents | Project context available | Navigate to SCR-08 | ACT-08-01 | — | `OpenDocuments` | New document types |

---

## SCR-05 — Solution Result

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-05-01 | Review Planning Solution | FEAT-13 | PER-01 | Review space plan and configuration | Arrived via ACT-04-06 (GP-01) | Solution summary visible | ACT-05-05 | GP-01 | `ReviewSolution` | PDF layout |
| ACT-05-02 | Review Proposal / Package Result | FEAT-24 / FEAT-32 | PER-02 / PER-03 | Review generated proposal or tender package | Arrived via ACT-04-04 or ACT-04-06 | Result cards visible | ACT-05-03 or ACT-05-06 | GP-02 / GP-03 | `ReviewProposalResult` | Document content rules |
| ACT-05-03 | Download Solution Materials | FEAT-15 | PER-01 / PER-02 / PER-03 | Obtain solution materials from this screen | Solution result visible | Download command issued | ACT-05-06 | GP-01 / GP-02 / GP-03 | `DownloadSolution` | File format specs |
| ACT-05-04 | Share Solution | FEAT-16 / FEAT-33 | PER-01 / PER-03 | Share generated materials | Solution result visible | Share command issued | — | GP-01 / GP-03 | `ShareSolution` | Share channel UI |
| ACT-05-05 | Continue to Budget | FEAT-14 | PER-01 / PER-03 | Proceed to investment information | Solution reviewed | Navigate to SCR-06 | ACT-06-01 | GP-01 / GP-03 | `ContinueToBudget` | Budget calculation |
| ACT-05-06 | Open Documents | FEAT-15 / FEAT-25 / FEAT-33 | PER-01 / PER-02 / PER-03 | Manage generated files | Solution available | Navigate to SCR-08 | ACT-08-01 | GP-01 / GP-02 / GP-03 | `OpenDocuments` | — |
| ACT-05-07 | Return to AI Workspace | FEAT-40 | PER-01 / PER-02 / PER-03 | Adjust or continue guided work | On SCR-05 | Navigate to SCR-04 | ACT-04-01 | — | `ReturnToWorkspace` | — |

---

## SCR-06 — Budget Result

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-06-01 | Review Budget Estimate | FEAT-14 / FEAT-32 | PER-01 / PER-03 | Review investment range and breakdown | Arrived via ACT-05-05 or ACT-04-07 | Budget overview visible | ACT-06-02 | GP-01 / GP-03 | `ReviewBudget` | Pricing algorithm |
| ACT-06-02 | Download Budget | FEAT-15 | PER-01 / PER-03 | Obtain budget materials from this screen | Budget result visible | Download command issued | ACT-06-04 | GP-01 / GP-03 | `DownloadBudget` | PDF schema |
| ACT-06-03 | Adjust Requirements | FEAT-11 / FEAT-40 | PER-01 / PER-03 | Return to workspace to change inputs | Budget result visible | Navigate to SCR-04 | ACT-04-01 | — | `AdjustRequirements` | Recompute logic |
| ACT-06-04 | Open Documents | FEAT-15 | PER-01 / PER-03 | Manage budget / related files | Budget available | Navigate to SCR-08 | ACT-08-01 | GP-01 / GP-03 | `OpenDocuments` | — |
| ACT-06-05 | Return to Solution | FEAT-13 / FEAT-32 | PER-01 / PER-03 | Revisit solution summary | On SCR-06 | Navigate to SCR-05 | ACT-05-01 | — | `ReturnToSolution` | — |

---

## SCR-07 — My Projects

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-07-01 | List My Projects | FEAT-50 | Returning users | See prior projects | Arrived via ACT-01-06 | Project list visible | ACT-07-02 | GP-01 return | `ListProjects` | Admin org inventory |
| ACT-07-02 | Continue Project | FEAT-51 | Returning users | Re-enter active project | Project selected | Navigate to SCR-04 | ACT-04-01 | GP-01 return | `ContinueProject` | — |
| ACT-07-03 | Open Project Documents | FEAT-52 | Returning users | Jump to project documents | Project selected | Navigate to SCR-08 | ACT-08-01 | — | `OpenProjectDocuments` | Cross-tenant access |

---

## SCR-08 — My Documents

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-08-01 | Browse Document Categories | FEAT-53 | PER-01 / PER-02 / PER-03 | Find Solution / Budget / Tender / Delivery files | On SCR-08 | Category list visible | ACT-08-02 | GP-01 / GP-02 / GP-03 | `BrowseDocumentCategories` | New categories |
| ACT-08-02 | Preview Document | FEAT-54 | PER-01 / PER-02 / PER-03 | Inspect generated file | Document selected | Preview shown | ACT-08-03 | GP-01 / GP-02 / GP-03 | `PreviewDocument` | Viewer implementation |
| ACT-08-03 | Download Document | FEAT-55 / FEAT-15 / FEAT-25 | PER-01 / PER-02 / PER-03 | Export generated file | Document selected | Download command issued | — | GP-01 / GP-02 / GP-03 | `DownloadDocument` | File binary format |
| ACT-08-04 | Share Document | FEAT-16 / FEAT-33 | PER-01 / PER-03 | Share generated file | Document selected | Share command issued | — | GP-01 / GP-03 | `ShareDocument` | External share channels |
| ACT-08-05 | Return to My Projects | FEAT-50 | Returning users | Back to project list | On SCR-08 | Navigate to SCR-07 | ACT-07-01 | — | `ReturnToProjects` | — |
| ACT-08-06 | Return to AI Workspace | FEAT-40 | PER-01 / PER-02 / PER-03 | Resume guided work | Project context known | Navigate to SCR-04 | ACT-04-01 | — | `ReturnToWorkspace` | — |

---

## SCR-09 — Admin Dashboard

| Action ID | Action Name | Feature | Primary Consumer | Purpose | Preconditions | Result | Next Action | Golden Path | Command | Out of Scope |
|-----------|-------------|---------|------------------|---------|---------------|--------|-------------|-------------|-------------|--------------|
| ACT-09-01 | View Admin Dashboard | FEAT-60 | PER-06 | Open platform operations surface | Admin entry; PER-06 | Dashboard visible | ACT-09-02 | GP-04 | `ViewAdminDashboard` | Infra tooling |
| ACT-09-02 | View Organizations | FEAT-60 | PER-06 | Observe organizations metric/area | On SCR-09 | Organizations area visible | ACT-09-03 | GP-04 | `ViewOrganizations` | Tenant provisioning logic |
| ACT-09-03 | View Users | FEAT-60 | PER-06 | Observe users metric/area | On SCR-09 | Users area visible | ACT-09-04 | GP-04 | `ViewUsers` | Permission engine design |
| ACT-09-04 | View Usage | FEAT-60 | PER-06 | Observe usage metric/area | On SCR-09 | Usage area visible | ACT-09-05 | GP-04 | `ViewUsage` | Metering implementation |
| ACT-09-05 | View Security | FEAT-60 | PER-06 | Observe security metric/area | On SCR-09 | Security area visible | ACT-09-06 | GP-04 | `ViewSecurity` | Security product expansion |
| ACT-09-06 | View Governance | FEAT-60 | PER-06 | Observe governance metric/area | On SCR-09 | Governance area visible | — | GP-04 | `ViewGovernance` | New Domain governance UIs |

---

# 02 Screen → Action Mapping

| Screen | Actions | Count |
|--------|---------|-------|
| SCR-01 Homepage | ACT-01-01 … ACT-01-06 | 6 |
| SCR-02 Enterprise Builder Entry | ACT-02-01 … ACT-02-03 | 3 |
| SCR-03 Tender Intelligence Entry | ACT-03-01 … ACT-03-03 | 3 |
| SCR-04 AI Workspace | ACT-04-01 … ACT-04-08 | 8 |
| SCR-05 Solution Result | ACT-05-01 … ACT-05-07 | 7 |
| SCR-06 Budget Result | ACT-06-01 … ACT-06-05 | 5 |
| SCR-07 My Projects | ACT-07-01 … ACT-07-03 | 3 |
| SCR-08 My Documents | ACT-08-01 … ACT-08-06 | 6 |
| SCR-09 Admin Dashboard | ACT-09-01 … ACT-09-06 | 6 |

**Totals:** 9 Screens · **47 Actions**

**Integrity rules verified:**

- Every MVP Screen has ≥1 Action
- Every Action ID maps to exactly one Screen (prefix `ACT-{screen}-*`)
- No Action invents a Screen outside SCR-01…SCR-09
- No Action invents a Feature outside PD-2.1 MVP = In

---

# 03 Golden Path Action Flow

## GP-01 — Enterprise Customer

```
ACT-01-01 Sign In (optional if already signed in)
    ↓
ACT-01-03 Choose Enterprise Builder
    ↓
ACT-02-01 Start Fitness Space Planning
    ↓
ACT-02-02 Provide Planning Inputs
    ↓
ACT-02-03 Continue to AI Workspace
    ↓
ACT-04-01 Work in AI Workspace
    ↓
ACT-04-02 View Project Context
    ↓
ACT-04-06 Open Solution Result
    ↓
ACT-05-01 Review Planning Solution
    ↓
ACT-05-05 Continue to Budget
    ↓
ACT-06-01 Review Budget Estimate
    ↓
ACT-06-02 Download Budget
    ↓
ACT-06-04 Open Documents
    ↓
ACT-08-01 Browse Document Categories
    ↓
ACT-08-03 Download Document
```

**Returning path (GP-01 return):**

```
ACT-01-06 Open My Projects
    ↓
ACT-07-01 List My Projects
    ↓
ACT-07-02 Continue Project
    ↓
ACT-04-01 … (resume GP-01 from workspace)
```

## GP-02 — Tender Customer

```
ACT-01-01 Sign In (optional)
    ↓
ACT-01-04 Choose Tender Intelligence
    ↓
ACT-03-01 Upload Tender Document
    ↓
ACT-03-02 Observe AI Processing Status
    ↓
ACT-03-03 Proceed to Requirement Review
    ↓
ACT-04-03 Confirm Extracted Requirements
    ↓
ACT-04-04 Generate Tender Package
    ↓
ACT-05-02 Review Proposal / Package Result
    ↓
ACT-05-03 Download Solution Materials
    ↓
ACT-05-06 Open Documents
    ↓
ACT-08-01 Browse Document Categories
    ↓
ACT-08-03 Download Document
```

## GP-03 — Sales Consultant

```
ACT-01-01 Sign In (optional)
    ↓
ACT-01-05 Choose Sales Center
    ↓
ACT-04-05 Capture Customer Opportunity
    ↓
ACT-04-01 Work in AI Workspace
    ↓
ACT-04-06 Open Solution Result
    ↓
ACT-05-02 Review Proposal / Package Result
    ↓
ACT-05-05 Continue to Budget
    ↓
ACT-06-01 Review Budget Estimate
    ↓
ACT-05-04 / ACT-08-04 Share (Solution or Document)
    ↓
ACT-08-03 Download Document
```

## GP-04 — Platform Administrator

```
ACT-09-01 View Admin Dashboard
    ↓
ACT-09-02 View Organizations
    ↓
ACT-09-03 View Users
    ↓
ACT-09-04 View Usage
    ↓
ACT-09-05 View Security
    ↓
ACT-09-06 View Governance
```

---

# 04 Action Classification

| Class | Action IDs | Meaning |
|-------|------------|---------|
| Access | ACT-01-01, ACT-01-02 | Sign-in / language |
| Goal Entry | ACT-01-03, ACT-01-04, ACT-01-05, ACT-01-06 | Choose goal or resume |
| Intake | ACT-02-01, ACT-02-02, ACT-02-03, ACT-03-01, ACT-03-02, ACT-03-03, ACT-04-05 | Collect need / tender / opportunity |
| Guided Work | ACT-04-01, ACT-04-02, ACT-04-03, ACT-04-04 | Workspace collaboration commands |
| Navigation | ACT-04-06, ACT-04-07, ACT-04-08, ACT-05-05, ACT-05-06, ACT-05-07, ACT-06-03, ACT-06-04, ACT-06-05, ACT-07-02, ACT-07-03, ACT-08-05, ACT-08-06 | Screen-to-screen commands |
| Result Review | ACT-05-01, ACT-05-02, ACT-06-01, ACT-07-01 | Inspect outcomes / lists |
| Artifact | ACT-05-03, ACT-05-04, ACT-06-02, ACT-08-01, ACT-08-02, ACT-08-03, ACT-08-04 | Preview / download / share / browse |
| Operations | ACT-09-01 … ACT-09-06 | Admin observation commands |

---

# 05 Action Preconditions (Summary)

| Rule | Applies |
|------|---------|
| User must be on the Action’s Screen | All Actions |
| Goal-entry Actions require SCR-01 | ACT-01-03…06 |
| Intake Actions require prior goal choice | ACT-02-*, ACT-03-* |
| Tender confirm/generate require tender path entry | ACT-04-03, ACT-04-04 |
| Sales capture requires Sales Center entry | ACT-04-05 |
| Result Actions require workspace/result readiness | ACT-05-*, ACT-06-* |
| Document Actions require a selectable document or category context | ACT-08-02…04 |
| Admin Actions require PER-06 / admin entry | ACT-09-* |
| No Action requires a non-MVP Screen or Feature | All Actions |

Preconditions describe **state readiness only**. They do not encode business rules, scoring, or Domain logic.

---

# 06 Action Results (Summary)

| Result Type | Example Actions | Observable Result |
|-------------|-----------------|-------------------|
| Session | ACT-01-01 | Signed-in state |
| Preference | ACT-01-02 | Language applied |
| Navigation | ACT-01-03…06, ACT-02-03, ACT-03-03, ACT-04-06…08, ACT-05-05…07, ACT-06-03…05, ACT-07-02…03, ACT-08-05…06 | Arrive on target Screen |
| Intake Accepted | ACT-02-02, ACT-03-01, ACT-04-05 | Inputs/document/opportunity accepted on Screen |
| Status Visible | ACT-03-02, ACT-04-02, ACT-07-01, ACT-09-* | Status / list / metrics visible |
| Confirmation | ACT-04-03 | Requirements confirmed |
| Generation Requested | ACT-04-04 | Tender package generation commanded |
| Review Ready | ACT-05-01, ACT-05-02, ACT-06-01 | Result content visible |
| Artifact Command | ACT-05-03, ACT-05-04, ACT-06-02, ACT-08-02…04 | Preview / download / share commanded |

Results are **user-observable outcomes**. They do not define Domain processing, API payloads, or persistence.

---

# 07 Feature → Action Coverage

| Feature | Actions (primary Screen ownership) |
|---------|--------------------------------------|
| FEAT-01 | ACT-01-03, ACT-01-04 |
| FEAT-02 | ACT-01-01 |
| FEAT-03 | ACT-01-02 |
| FEAT-10 | ACT-02-01 |
| FEAT-11 | ACT-02-02 (also ACT-06-03 adjust path) |
| FEAT-12 | ACT-02-03 |
| FEAT-13 | ACT-05-01 |
| FEAT-14 | ACT-06-01, ACT-04-07, ACT-05-05 |
| FEAT-15 | ACT-05-03, ACT-06-02, ACT-08-03 |
| FEAT-16 | ACT-05-04, ACT-08-04 |
| FEAT-20 | ACT-03-01 |
| FEAT-21 | ACT-03-02 |
| FEAT-22 | ACT-03-03 |
| FEAT-23 | ACT-04-03 |
| FEAT-24 | ACT-04-04, ACT-05-02 |
| FEAT-25 | ACT-08-03 |
| FEAT-30 | ACT-01-05 |
| FEAT-31 | ACT-04-05 |
| FEAT-32 | ACT-05-02, ACT-06-01 |
| FEAT-33 | ACT-05-04, ACT-08-04 |
| FEAT-40 | ACT-04-01, ACT-05-07, ACT-08-06 |
| FEAT-41 | ACT-04-02 |
| FEAT-50 | ACT-01-06, ACT-07-01, ACT-08-05 |
| FEAT-51 | ACT-07-02 |
| FEAT-52 | ACT-04-08, ACT-07-03 |
| FEAT-53 | ACT-08-01 |
| FEAT-54 | ACT-08-02 |
| FEAT-55 | ACT-08-03 |
| FEAT-60 | ACT-09-01 … ACT-09-06 |

Every PD-2.1 MVP Feature has ≥1 Action.

---

# 08 Out of Scope

- API routes, request/response schemas → **PD-2.4**
- Business logic / scoring / pricing / extraction algorithms
- UI design / components / visual system
- Database schema
- New Domain modules
- New Screens or Features
- Supplier Hub / full Delivery Platform / Billing / Marketplace actions
- Modification of PD-2.1 or PD-2.2

---

# 09 EXIT Checklist

| Criterion | Status |
|-----------|--------|
| Every MVP Screen has Actions | ✓ SCR-01…SCR-09 |
| Every Action belongs to exactly one Screen | ✓ |
| Golden Path complete | ✓ GP-01…GP-04 |
| No business logic | ✓ Commands only |
| No new capabilities | ✓ Input Features/Screens only |
| Ready for PD-2.4 API Mapping | ✓ Command column is mapping key |

---

# Freeze Statement

PD-2.3 User Action Map is frozen.

PD-2.4 API Mapping must bind Commands from Action IDs **ACT-01-01 … ACT-09-06** only, via:

`Screen → Command → API → Existing Domain`
