# PD-2.6 — Acceptance Criteria

## Status

**Frozen**

## Type

Product Planning

## Version

`product-planning-pd-2.6-v1`

## Freeze Date

2026-07-29

## Base (Input — read-only)

- `PD-2.1-feature-catalog.md`
- `PD-2.2-screen-map.md`
- `PD-2.3-user-action-map.md`
- `PD-2.4-api-mapping.md`
- `PD-2.5-domain-mapping.md`

## Purpose

Define **user-oriented** acceptance criteria for **MVP Golden Paths only**.

A path PASSes when the persona can complete their business goal through the frozen Screens and Actions — without needing technical modules, new Domains, API changes, or UI design work described here.

## Rules

1. **Input only** — criteria derive solely from PD-2.1 … PD-2.5.
2. **Product Planning only** — no implementation.
3. **User-oriented** — pass/fail is what the user can achieve.
4. **Golden Path complete** — GP-01, GP-01 return, GP-02, GP-03, GP-04.
5. **MVP only** — non-MVP Features / Screens / Actions are out of scope.
6. **No API changes** — use PD-2.4 bindings as-is.
7. **No UI** — no visual or interaction design criteria.
8. **No new Domain** — use PD-2.5 M11–M15 ownership as-is.
9. Do not modify input documents.

---

# 01 How to Read Criteria

Each criterion answers:

> Can this user finish this step of their Golden Path?

| Field | Meaning |
|-------|---------|
| AC ID | Stable ID |
| User | Who must succeed |
| Goal | What success means for the user |
| Must be able to | Observable user capability |
| On screen | PD-2.2 Screen |
| Via action | PD-2.3 Action |
| Feature | PD-2.1 Feature |
| Trace | PD-2.4 Command + PD-2.5 Primary Domain (reference only) |

**Pass** = user can do the step.  
**Fail** = user is blocked from the step.

---

# 02 MVP Golden Paths in Scope

| Path | User | Business goal | Screens |
|------|------|---------------|---------|
| **GP-01** | Enterprise Customer | Get a fitness space solution and budget for internal decision | SCR-01 → SCR-02 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| **GP-01R** | Returning user | Resume a previous project | SCR-01 → SCR-07 → SCR-04 |
| **GP-02** | Tender Customer | Get tender materials ready for review / submission | SCR-01 → SCR-03 → SCR-04 → SCR-05 → SCR-08 |
| **GP-03** | Sales Consultant | Turn an opportunity into a shareable proposal + budget | SCR-01 → SCR-04 → SCR-05 → SCR-06 → SCR-08 |
| **GP-04** | Platform Administrator | See platform organizations, users, usage, security, governance | SCR-09 |

## Out of acceptance scope

- Non–Golden Path Actions in PD-2.3
- Non-MVP items in PD-2.1 §03 (Supplier Hub, full Delivery, Billing checkout, Marketplace, engines)
- Language selector (FEAT-03) — not on Golden Path
- UI polish, visual QA, performance, penetration testing
- Creating APIs or Domains

---

# 03 GP-01 — Enterprise Customer

**User success:** I can plan a fitness space, review solution and budget, and download materials.

| AC ID | User must be able to | On screen | Via action | Feature | Trace (ref) |
|-------|----------------------|-----------|------------|---------|-------------|
| AC-GP01-01 | Sign in (if not already signed in) | SCR-01 | ACT-01-01 | FEAT-02 | `SignIn` · M13 |
| AC-GP01-02 | Choose **Enterprise Builder** as my goal | SCR-01 | ACT-01-03 | FEAT-01 | `ChooseGoal.EnterpriseBuilder` · M13 |
| AC-GP01-03 | Start fitness space planning | SCR-02 | ACT-02-01 | FEAT-10 | `StartPlanning` · M12 |
| AC-GP01-04 | Provide company size, location, space, budget, goals | SCR-02 | ACT-02-02 | FEAT-11 | `SubmitPlanningInputs` · M14 |
| AC-GP01-05 | Continue into AI Workspace | SCR-02 → SCR-04 | ACT-02-03 | FEAT-12 | `ContinueToWorkspace` · M13 |
| AC-GP01-06 | Work with AI guidance on my task | SCR-04 | ACT-04-01 | FEAT-40 | `WorkspaceInteract` · M12 |
| AC-GP01-07 | See my project context (requirements, progress, documents) | SCR-04 | ACT-04-02 | FEAT-41 | `ViewProjectContext` · M13 |
| AC-GP01-08 | Open my solution result | SCR-04 → SCR-05 | ACT-04-06 | FEAT-13 | `OpenSolutionResult` · M14 |
| AC-GP01-09 | Review planning solution and configuration | SCR-05 | ACT-05-01 | FEAT-13 | `ReviewSolution` · M14 |
| AC-GP01-10 | Continue to budget | SCR-05 → SCR-06 | ACT-05-05 | FEAT-14 | `ContinueToBudget` · M14 |
| AC-GP01-11 | Review investment range and breakdown | SCR-06 | ACT-06-01 | FEAT-14 | `ReviewBudget` · M14 |
| AC-GP01-12 | Download budget materials | SCR-06 | ACT-06-02 | FEAT-15 | `DownloadBudget` · M11 |
| AC-GP01-13 | Open my documents | SCR-06 → SCR-08 | ACT-06-04 | FEAT-15 | `OpenDocuments` · M11 |
| AC-GP01-14 | Browse document categories (Solution / Budget / Tender / Delivery) | SCR-08 | ACT-08-01 | FEAT-53 | `BrowseDocumentCategories` · M11 |
| AC-GP01-15 | Download a document | SCR-08 | ACT-08-03 | FEAT-55 | `DownloadDocument` · M11 |

**Path PASS:** AC-GP01-01 … AC-GP01-15 all PASS.  
**Path FAIL:** any step blocks the user from reaching downloadable decision materials.

---

# 04 GP-01R — Returning User

**User success:** I can find my project and continue where I left off.

| AC ID | User must be able to | On screen | Via action | Feature | Trace (ref) |
|-------|----------------------|-----------|------------|---------|-------------|
| AC-GP01R-01 | Open **My Projects** from home | SCR-01 → SCR-07 | ACT-01-06 | FEAT-50 | `OpenMyProjects` · M13 |
| AC-GP01R-02 | See my project list | SCR-07 | ACT-07-01 | FEAT-50 | `ListProjects` · M13 |
| AC-GP01R-03 | Continue a selected project | SCR-07 → SCR-04 | ACT-07-02 | FEAT-51 | `ContinueProject` · M13 |
| AC-GP01R-04 | Keep working in AI Workspace on that project | SCR-04 | ACT-04-01 | FEAT-40 | `WorkspaceInteract` · M12 |

**Path PASS:** AC-GP01R-01 … AC-GP01R-04 all PASS (then GP-01 may resume from workspace).  
**Path FAIL:** returning user cannot resume into AI Workspace.

---

# 05 GP-02 — Tender Customer

**User success:** I can upload a tender, confirm requirements, get a package, and download materials.

| AC ID | User must be able to | On screen | Via action | Feature | Trace (ref) |
|-------|----------------------|-----------|------------|---------|-------------|
| AC-GP02-01 | Sign in (if needed) | SCR-01 | ACT-01-01 | FEAT-02 | `SignIn` · M13 |
| AC-GP02-02 | Choose **Tender Intelligence** as my goal | SCR-01 | ACT-01-04 | FEAT-01 | `ChooseGoal.TenderIntelligence` · M13 |
| AC-GP02-03 | Upload my tender document | SCR-03 | ACT-03-01 | FEAT-20 | `UploadTenderDocument` · M11 |
| AC-GP02-04 | See that AI processing is in progress / done | SCR-03 | ACT-03-02 | FEAT-21 | `ViewProcessingStatus` · M11 |
| AC-GP02-05 | Proceed to requirement review | SCR-03 → SCR-04 | ACT-03-03 | FEAT-22 | `ProceedToRequirementReview` · M11 |
| AC-GP02-06 | Confirm extracted requirements | SCR-04 | ACT-04-03 | FEAT-23 | `ConfirmRequirements` · M11 |
| AC-GP02-07 | Generate tender package | SCR-04 | ACT-04-04 | FEAT-24 | `GenerateTenderPackage` · M12 |
| AC-GP02-08 | Review proposal / package result | SCR-05 | ACT-05-02 | FEAT-24 | `ReviewProposalResult` · M14 |
| AC-GP02-09 | Download solution / package materials | SCR-05 | ACT-05-03 | FEAT-15 | `DownloadSolution` · M11 |
| AC-GP02-10 | Open my documents | SCR-05 → SCR-08 | ACT-05-06 | FEAT-25 | `OpenDocuments` · M11 |
| AC-GP02-11 | Browse document categories | SCR-08 | ACT-08-01 | FEAT-53 | `BrowseDocumentCategories` · M11 |
| AC-GP02-12 | Download tender materials | SCR-08 | ACT-08-03 | FEAT-25 / FEAT-55 | `DownloadDocument` · M11 |

**Path PASS:** AC-GP02-01 … AC-GP02-12 all PASS.  
**Path FAIL:** user cannot obtain downloadable tender materials after confirmation.

---

# 06 GP-03 — Sales Consultant

**User success:** I can capture an opportunity, review proposal and budget, share, and download.

| AC ID | User must be able to | On screen | Via action | Feature | Trace (ref) |
|-------|----------------------|-----------|------------|---------|-------------|
| AC-GP03-01 | Sign in (if needed) | SCR-01 | ACT-01-01 | FEAT-02 | `SignIn` · M13 |
| AC-GP03-02 | Choose **Sales Center** as my goal | SCR-01 | ACT-01-05 | FEAT-30 | `ChooseGoal.SalesCenter` · M13 |
| AC-GP03-03 | Capture customer opportunity (info + requirements) | SCR-04 | ACT-04-05 | FEAT-31 | `CaptureOpportunity` · M14 |
| AC-GP03-04 | Work with AI guidance on the opportunity | SCR-04 | ACT-04-01 | FEAT-40 | `WorkspaceInteract` · M12 |
| AC-GP03-05 | Open solution / proposal result | SCR-04 → SCR-05 | ACT-04-06 | FEAT-32 | `OpenSolutionResult` · M14 |
| AC-GP03-06 | Review customer proposal result | SCR-05 | ACT-05-02 | FEAT-32 | `ReviewProposalResult` · M14 |
| AC-GP03-07 | Continue to budget | SCR-05 → SCR-06 | ACT-05-05 | FEAT-32 / FEAT-14 | `ContinueToBudget` · M14 |
| AC-GP03-08 | Review budget estimate | SCR-06 | ACT-06-01 | FEAT-32 / FEAT-14 | `ReviewBudget` · M14 |
| AC-GP03-09 | Share proposal or document with customer | SCR-05 or SCR-08 | ACT-05-04 or ACT-08-04 | FEAT-33 | `ShareSolution` / `ShareDocument` · M15 |
| AC-GP03-10 | Download a document | SCR-08 | ACT-08-03 | FEAT-55 | `DownloadDocument` · M11 |

**Path PASS:** AC-GP03-01 … AC-GP03-10 all PASS.  
**Path FAIL:** sales user cannot review, share, and download opportunity materials.

---

# 07 GP-04 — Platform Administrator

**User success:** I can open the admin dashboard and observe platform operation areas.

| AC ID | User must be able to | On screen | Via action | Feature | Trace (ref) |
|-------|----------------------|-----------|------------|---------|-------------|
| AC-GP04-01 | Open Admin Dashboard | SCR-09 | ACT-09-01 | FEAT-60 | `ViewAdminDashboard` · M13 |
| AC-GP04-02 | View Organizations | SCR-09 | ACT-09-02 | FEAT-60 | `ViewOrganizations` · M13 |
| AC-GP04-03 | View Users | SCR-09 | ACT-09-03 | FEAT-60 | `ViewUsers` · M13 |
| AC-GP04-04 | View Usage | SCR-09 | ACT-09-04 | FEAT-60 | `ViewUsage` · M13 |
| AC-GP04-05 | View Security | SCR-09 | ACT-09-05 | FEAT-60 | `ViewSecurity` · M13 |
| AC-GP04-06 | View Governance | SCR-09 | ACT-09-06 | FEAT-60 | `ViewGovernance` · M15 |

**Path PASS:** AC-GP04-01 … AC-GP04-06 all PASS.  
**Path FAIL:** admin cannot observe any required area (orgs / users / usage / security / governance).

---

# 08 Golden Path Completeness Check

| Path | Steps | First screen | Last screen | User outcome |
|------|-------|--------------|-------------|--------------|
| GP-01 | 15 | SCR-01 | SCR-08 | Decision materials downloaded |
| GP-01R | 4 | SCR-01 | SCR-04 | Project resumed |
| GP-02 | 12 | SCR-01 | SCR-08 | Tender materials downloaded |
| GP-03 | 10 | SCR-01 | SCR-08 | Proposal shared + document downloaded |
| GP-04 | 6 | SCR-09 | SCR-09 | Ops areas observed |
| **Total** | **47** | — | — | All Golden Paths complete |

Every step references only:

- MVP Features (PD-2.1)
- MVP Screens (PD-2.2)
- Golden Path Actions (PD-2.3 §03)
- Existing API bindings (PD-2.4) — no changes
- M11–M15 Domains (PD-2.5) — no new Domain

---

# 09 MVP Acceptance Verdict

```
MVP Acceptance = PASS
  only if
    GP-01 PASS
    ∧ GP-01R PASS
    ∧ GP-02 PASS
    ∧ GP-03 PASS
    ∧ GP-04 PASS
```

| Rule | Required |
|------|----------|
| User can complete each Golden Path goal above | Yes |
| Non–Golden Path Actions scored | **No** |
| API schema / route changes allowed to pass | **No** |
| UI design criteria required to pass | **No** |
| New Domain allowed to pass | **No** |

---

# 10 Planning Integrity (non-user, reference)

These confirm the planning stack behind user criteria; they are not separate user tests.

| Check | Requirement |
|-------|-------------|
| Features | Only MVP = In Features appear in AC |
| Screens | Only SCR-01…SCR-09 on Golden Paths |
| Actions | Only Actions on PD-2.3 Golden Path flows |
| API | Bindings unchanged from PD-2.4 |
| Domain | Primary Domain ∈ M11–M15 per PD-2.5 |

---

# 11 Out of Scope

- Implementation code
- API changes or new routes
- UI / visual design
- New Domain modules
- Non–Golden Path / non-MVP acceptance
- Modification of PD-2.1 … PD-2.5

---

# 12 EXIT Checklist

| Criterion | Status |
|-----------|--------|
| User-oriented criteria | ✓ |
| Golden Path complete (GP-01 / GP-01R / GP-02 / GP-03 / GP-04) | ✓ |
| MVP only | ✓ |
| Input only / inputs unmodified | ✓ |
| No implementation / API / UI / new Domain | ✓ |
| Output path `PD-2.6-acceptance-criteria.md` | ✓ |

---

# Freeze Statement

PD-2.6 Acceptance Criteria is frozen.

MVP is accepted when every Golden Path user can complete their stated business goal through the frozen Screens and Actions.
