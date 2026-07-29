# PD-2.4 — API Mapping

## Status

**Frozen**

## Type

Product Planning

## Version

`product-planning-pd-2.4-v1`

## Freeze Date

2026-07-29

## Base (Input — read-only)

- `PD-2.3-user-action-map.md` (`product-planning-pd-2.3-v1`)

## Purpose

Bind every PD-2.3 Command to an **existing** API surface and/or **existing** Domain module.

```
Screen
    ↓
Command
    ↓
API          ← this document
    ↓
Existing Domain
```

## Rules

1. **Existing Domains only** — no new Domain modules.
2. **No implementation** — planning map only; no code, schema, or route creation.
3. **Do not invent APIs** — use existing `/api/v80/*` preferred; legacy existing routes as secondary bindings.
4. **Do not modify** PD-2.1 / PD-2.2 / PD-2.3.
5. Client navigation and preference commands may have **no HTTP API**; they still bind to Existing Domain or client surface only when one already exists.
6. No request/response body schemas in this document.

---

# 01 Binding Kinds

| Kind | Meaning |
|------|---------|
| `API` | Existing HTTP route invoked by the Command |
| `API+NAV` | Existing API for data, plus client navigation to next Screen |
| `NAV` | Client navigation only — no HTTP required |
| `PREF` | Existing preference / session surface — no dedicated HTTP (or non-v80 preference) |
| `NEAREST` | No exact route; bound to nearest **existing** API + Domain (documented explicitly) |

---

# 02 Existing Domain Inventory (Allowed Targets)

| Domain ID | Module Path | Role |
|-----------|-------------|------|
| DOM-AUTH | `lib/product/auth` + `app/api/auth/*` | Sign-in / session |
| DOM-PREF | `lib/product/preference` | Language / preference |
| DOM-TENANT | `lib/scaffold/v80` + `lib/enterprise-saas` + `lib/product/tenant` | Tenant / workspace / entitlements |
| DOM-PLAN | `lib/planning` + `lib/product/p1` + `lib/product/p6` | Planning / onboarding / budget ROI product surfaces |
| DOM-TENDER | `lib/tender` + `lib/tender-parser` + `lib/tender-intelligence` | Tender intake / analysis |
| DOM-AUTOPILOT | `lib/autopilot` + `lib/scaffold/v80` | Tender pack / workflow run |
| DOM-BUDGET | `lib/scaffold/v80` (budget service) + `lib/product/p6` | Budget calculate |
| DOM-PDF | `lib/pdf` + `lib/proposal-pdf` | Plan / budget / proposal PDF |
| DOM-PROPOSAL | `lib/proposal-generation` + `lib/bidder-proposal-composer` | Proposal assembly |
| DOM-PROJECT | project APIs + workspace summary surfaces | Project list / detail / workspace context |
| DOM-DOCS | documents APIs + `lib/commercial-delivery` | Document browse / download |
| DOM-SALES | `lib/sales` + `lib/quote-lifecycle` | Opportunity / sales signals |
| DOM-OPS | `lib/enterprise-saas` + `lib/security` + `lib/usage` + V80 ops | Admin dashboard / usage / governance |

**Forbidden:** inventing M16+, new Domain folders, or new `/api/*` routes in this planning step.

---

# 03 Preferred Existing API Set (`/api/v80/*`)

| Route | Concern |
|-------|---------|
| `/api/v80/tenant/run` | Tenant / workspace bootstrap |
| `/api/v80/entitlements` | Plan entitlements |
| `/api/v80/tender/intake` | Tender upload / intake |
| `/api/v80/autopilot/job/run` | Tender pack / guided workflow |
| `/api/v80/budget/calculate` | Budget estimate |
| `/api/v80/pdf` | Plan / budget / artifact download (`?type=` / `?artifactId=`) |
| `/api/v80/proposal-pdf/render` | Proposal PDF render |
| `/api/v80/ops/health` | Ops health |
| `/api/v80/ops/metrics` | Ops metrics |
| `/api/v80/ops/governance/audit` | Governance audit |
| `/api/v80/production/integrity` | Production integrity |

Secondary existing routes (legacy / enterprise-saas) may be cited where v80 has no exact twin.

---

# 04 Action → Command → API → Domain Map

## SCR-01 — Homepage

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-01-01 | `SignIn` | API | `/api/auth/otp/request` → `/api/auth/otp/verify` (or `/api/auth/email/*`); session via `/api/auth/me` | DOM-AUTH | Existing auth only |
| ACT-01-02 | `SelectLanguage` | PREF | — (no dedicated language API) | DOM-PREF | Client/session preference; no new API |
| ACT-01-03 | `ChooseGoal.EnterpriseBuilder` | NAV | — | — | Navigation to SCR-02; optional context via `/api/v80/tenant/run` if session bootstrap needed |
| ACT-01-04 | `ChooseGoal.TenderIntelligence` | NAV | — | — | Navigation to SCR-03 |
| ACT-01-05 | `ChooseGoal.SalesCenter` | NAV | — | — | Navigation to SCR-04 |
| ACT-01-06 | `OpenMyProjects` | API+NAV | `/api/project/list` | DOM-PROJECT | Then navigate SCR-07 |

## SCR-02 — Enterprise Builder Entry

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-02-01 | `StartPlanning` | NEAREST | `/api/v80/tenant/run` (workspace) and/or `/api/onboarding/submit` | DOM-TENANT + DOM-PLAN | Nearest existing planning bootstrap |
| ACT-02-02 | `SubmitPlanningInputs` | NEAREST | `/api/v80/budget/calculate` and/or `/api/plan` | DOM-BUDGET + DOM-PLAN | Inputs feed existing budget/plan surfaces — no new intake Domain |
| ACT-02-03 | `ContinueToWorkspace` | NAV | — | — | Navigate SCR-04; context may use `/api/workspace/summary` |

## SCR-03 — Tender Intelligence Entry

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-03-01 | `UploadTenderDocument` | API | `/api/v80/tender/intake` | DOM-TENDER | Preferred v80; legacy `/api/tender/intake` secondary |
| ACT-03-02 | `ViewProcessingStatus` | API | `/api/v80/tender/intake` status / `/api/tender/[projectId]` / `/api/tender/gate` | DOM-TENDER | Existing status surfaces only |
| ACT-03-03 | `ProceedToRequirementReview` | API+NAV | `/api/tender/analyze` (nearest) | DOM-TENDER | Then navigate SCR-04 |

## SCR-04 — AI Workspace

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-04-01 | `WorkspaceInteract` | NEAREST | `/api/workspace/summary`; workflow progress via `/api/v80/autopilot/job/run` | DOM-PROJECT + DOM-AUTOPILOT | No dedicated chat API — bind existing workspace/autopilot surfaces |
| ACT-04-02 | `ViewProjectContext` | API | `/api/project/[projectId]` and/or `/api/workspace/summary` | DOM-PROJECT | Existing project context |
| ACT-04-03 | `ConfirmRequirements` | NEAREST | `/api/tender/analyze` / tender project gate surfaces | DOM-TENDER | Confirmation uses existing tender review surfaces |
| ACT-04-04 | `GenerateTenderPackage` | API | `/api/v80/autopilot/job/run` | DOM-AUTOPILOT + DOM-TENDER | `tender-pack-complete` journey binding |
| ACT-04-05 | `CaptureOpportunity` | NEAREST | `/api/sales/signals` / `/api/sales/analyze` | DOM-SALES | Existing sales surfaces only |
| ACT-04-06 | `OpenSolutionResult` | API+NAV | `/api/v80/pdf?type=plan` and/or `/api/v80/proposal-pdf/render` | DOM-PDF + DOM-PROPOSAL | Then navigate SCR-05 |
| ACT-04-07 | `OpenBudgetResult` | API+NAV | `/api/v80/budget/calculate` | DOM-BUDGET | Then navigate SCR-06 |
| ACT-04-08 | `OpenDocuments` | API+NAV | `/api/documents/projects/[projectId]` | DOM-DOCS | Then navigate SCR-08 |

## SCR-05 — Solution Result

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-05-01 | `ReviewSolution` | API | `/api/v80/pdf?type=plan` | DOM-PDF + DOM-PROPOSAL | Review existing plan artifact |
| ACT-05-02 | `ReviewProposalResult` | API | `/api/v80/proposal-pdf/render` (and/or prior autopilot artifacts via `/api/v80/pdf?artifactId=`) | DOM-PDF + DOM-AUTOPILOT | Existing proposal/pack results |
| ACT-05-03 | `DownloadSolution` | API | `/api/v80/pdf?artifactId=` (or `?type=plan`) | DOM-PDF | Preferred download surface |
| ACT-05-04 | `ShareSolution` | NEAREST | `/api/download-token` and/or `/api/commercial-delivery/download/run` | DOM-DOCS | No dedicated share API — nearest existing delivery/token surface |
| ACT-05-05 | `ContinueToBudget` | API+NAV | `/api/v80/budget/calculate` | DOM-BUDGET | Then navigate SCR-06 |
| ACT-05-06 | `OpenDocuments` | API+NAV | `/api/documents/summary` | DOM-DOCS | Navigate SCR-08 |
| ACT-05-07 | `ReturnToWorkspace` | NAV | — | — | Navigate SCR-04 |

## SCR-06 — Budget Result

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-06-01 | `ReviewBudget` | API | `/api/v80/budget/calculate` + `/api/v80/pdf?type=budget` | DOM-BUDGET + DOM-PDF | Existing budget result surfaces |
| ACT-06-02 | `DownloadBudget` | API | `/api/v80/pdf?type=budget` | DOM-PDF | |
| ACT-06-03 | `AdjustRequirements` | NAV | — | — | Navigate SCR-04; later resubmit via existing budget/tender APIs |
| ACT-06-04 | `OpenDocuments` | API+NAV | `/api/documents/projects/[projectId]` | DOM-DOCS | Navigate SCR-08 |
| ACT-06-05 | `ReturnToSolution` | NAV | — | — | Navigate SCR-05 |

## SCR-07 — My Projects

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-07-01 | `ListProjects` | API | `/api/project/list` | DOM-PROJECT | |
| ACT-07-02 | `ContinueProject` | API+NAV | `/api/project/[projectId]` | DOM-PROJECT | Then navigate SCR-04 |
| ACT-07-03 | `OpenProjectDocuments` | API+NAV | `/api/documents/projects/[projectId]` | DOM-DOCS | Then navigate SCR-08 |

## SCR-08 — My Documents

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-08-01 | `BrowseDocumentCategories` | API | `/api/documents/summary` / `/api/documents/reports` | DOM-DOCS | Categories: Solution / Budget / Tender / Delivery |
| ACT-08-02 | `PreviewDocument` | API | `/api/v80/pdf?artifactId=` | DOM-PDF | Preview via existing PDF surface |
| ACT-08-03 | `DownloadDocument` | API | `/api/v80/pdf?artifactId=` (secondary: `/api/commercial-delivery/download/run`) | DOM-PDF + DOM-DOCS | |
| ACT-08-04 | `ShareDocument` | NEAREST | `/api/download-token` / `/api/commercial-delivery/download/run` | DOM-DOCS | Same nearest binding as ShareSolution |
| ACT-08-05 | `ReturnToProjects` | NAV | — | — | Navigate SCR-07 |
| ACT-08-06 | `ReturnToWorkspace` | NAV | — | — | Navigate SCR-04 |

## SCR-09 — Admin Dashboard

| Action ID | Command | Kind | Existing API | Existing Domain | Notes |
|-----------|---------|------|--------------|-----------------|-------|
| ACT-09-01 | `ViewAdminDashboard` | API | `/api/enterprise-saas/dashboard/run` | DOM-OPS | Existing enterprise-saas dashboard |
| ACT-09-02 | `ViewOrganizations` | API | `/api/enterprise-saas/tenant/run` | DOM-TENANT + DOM-OPS | Existing tenant surface |
| ACT-09-03 | `ViewUsers` | API | `/api/enterprise-saas/user/run` | DOM-OPS | |
| ACT-09-04 | `ViewUsage` | API | `/api/enterprise-saas/usage/run` (+ `/api/v80/ops/metrics`) | DOM-OPS | |
| ACT-09-05 | `ViewSecurity` | NEAREST | `/api/enterprise-saas/permission/run` / `/api/enterprise-saas/role/run` + `/api/auth/me` | DOM-OPS + DOM-AUTH | No dedicated security dashboard API |
| ACT-09-06 | `ViewGovernance` | API | `/api/v80/ops/governance/audit` (+ `/api/v80/production/integrity`) | DOM-OPS | Preferred v80 governance |

---

# 05 Coverage Summary

| Metric | Value |
|--------|-------|
| Actions mapped | 47 / 47 |
| Screens covered | SCR-01 … SCR-09 |
| Kind = API or API+NAV | 28 |
| Kind = NAV | 11 |
| Kind = PREF | 1 |
| Kind = NEAREST | 7 |
| New APIs invented | **0** |
| New Domains invented | **0** |

Every Action has exactly one primary binding row.

---

# 06 Golden Path API Chains

## GP-01 — Enterprise Customer

```
SignIn                         → /api/auth/* + /api/auth/me
ChooseGoal.EnterpriseBuilder   → NAV SCR-02
StartPlanning                  → /api/v80/tenant/run | /api/onboarding/submit
SubmitPlanningInputs           → /api/v80/budget/calculate | /api/plan
ContinueToWorkspace            → NAV SCR-04
WorkspaceInteract              → /api/workspace/summary | /api/v80/autopilot/job/run
ViewProjectContext             → /api/project/[projectId]
OpenSolutionResult             → /api/v80/pdf?type=plan
ReviewSolution                 → /api/v80/pdf?type=plan
ContinueToBudget               → /api/v80/budget/calculate
ReviewBudget                   → /api/v80/budget/calculate + /api/v80/pdf?type=budget
DownloadBudget                 → /api/v80/pdf?type=budget
OpenDocuments                  → /api/documents/*
BrowseDocumentCategories       → /api/documents/summary
DownloadDocument               → /api/v80/pdf?artifactId=
```

## GP-02 — Tender Customer

```
SignIn                         → /api/auth/*
ChooseGoal.TenderIntelligence  → NAV SCR-03
UploadTenderDocument           → /api/v80/tender/intake
ViewProcessingStatus           → /api/v80/tender/intake | /api/tender/[projectId]
ProceedToRequirementReview     → /api/tender/analyze → NAV SCR-04
ConfirmRequirements            → /api/tender/analyze (nearest)
GenerateTenderPackage          → /api/v80/autopilot/job/run
ReviewProposalResult           → /api/v80/proposal-pdf/render | /api/v80/pdf?artifactId=
DownloadSolution               → /api/v80/pdf?artifactId=
OpenDocuments                  → /api/documents/*
DownloadDocument               → /api/v80/pdf?artifactId=
```

## GP-03 — Sales Consultant

```
SignIn                         → /api/auth/*
ChooseGoal.SalesCenter         → NAV SCR-04
CaptureOpportunity             → /api/sales/signals | /api/sales/analyze
WorkspaceInteract              → /api/workspace/summary
OpenSolutionResult             → /api/v80/proposal-pdf/render
ReviewProposalResult           → /api/v80/proposal-pdf/render
ContinueToBudget               → /api/v80/budget/calculate
ReviewBudget                   → /api/v80/budget/calculate
ShareSolution / ShareDocument  → /api/download-token | commercial-delivery download
DownloadDocument               → /api/v80/pdf?artifactId=
```

## GP-04 — Platform Administrator

```
ViewAdminDashboard             → /api/enterprise-saas/dashboard/run
ViewOrganizations              → /api/enterprise-saas/tenant/run
ViewUsers                      → /api/enterprise-saas/user/run
ViewUsage                      → /api/enterprise-saas/usage/run | /api/v80/ops/metrics
ViewSecurity                   → permission/role + auth (nearest)
ViewGovernance                 → /api/v80/ops/governance/audit
```

---

# 07 Command Index (alphabetical)

| Command | Action ID(s) | Primary Existing API |
|---------|--------------|----------------------|
| `AdjustRequirements` | ACT-06-03 | NAV |
| `BrowseDocumentCategories` | ACT-08-01 | `/api/documents/summary` |
| `CaptureOpportunity` | ACT-04-05 | `/api/sales/signals` |
| `ChooseGoal.EnterpriseBuilder` | ACT-01-03 | NAV |
| `ChooseGoal.SalesCenter` | ACT-01-05 | NAV |
| `ChooseGoal.TenderIntelligence` | ACT-01-04 | NAV |
| `ConfirmRequirements` | ACT-04-03 | `/api/tender/analyze` |
| `ContinueProject` | ACT-07-02 | `/api/project/[projectId]` |
| `ContinueToBudget` | ACT-05-05 | `/api/v80/budget/calculate` |
| `ContinueToWorkspace` | ACT-02-03 | NAV |
| `DownloadBudget` | ACT-06-02 | `/api/v80/pdf?type=budget` |
| `DownloadDocument` | ACT-08-03 | `/api/v80/pdf?artifactId=` |
| `DownloadSolution` | ACT-05-03 | `/api/v80/pdf?artifactId=` |
| `GenerateTenderPackage` | ACT-04-04 | `/api/v80/autopilot/job/run` |
| `ListProjects` | ACT-07-01 | `/api/project/list` |
| `OpenBudgetResult` | ACT-04-07 | `/api/v80/budget/calculate` |
| `OpenDocuments` | ACT-04-08, ACT-05-06, ACT-06-04 | `/api/documents/*` |
| `OpenMyProjects` | ACT-01-06 | `/api/project/list` |
| `OpenProjectDocuments` | ACT-07-03 | `/api/documents/projects/[projectId]` |
| `OpenSolutionResult` | ACT-04-06 | `/api/v80/pdf?type=plan` |
| `PreviewDocument` | ACT-08-02 | `/api/v80/pdf?artifactId=` |
| `ProceedToRequirementReview` | ACT-03-03 | `/api/tender/analyze` |
| `ProvidePlanningInputs` → `SubmitPlanningInputs` | ACT-02-02 | `/api/v80/budget/calculate` |
| `ReturnToProjects` | ACT-08-05 | NAV |
| `ReturnToSolution` | ACT-06-05 | NAV |
| `ReturnToWorkspace` | ACT-05-07, ACT-08-06 | NAV |
| `ReviewBudget` | ACT-06-01 | `/api/v80/budget/calculate` |
| `ReviewProposalResult` | ACT-05-02 | `/api/v80/proposal-pdf/render` |
| `ReviewSolution` | ACT-05-01 | `/api/v80/pdf?type=plan` |
| `SelectLanguage` | ACT-01-02 | DOM-PREF (no HTTP) |
| `ShareDocument` | ACT-08-04 | `/api/download-token` |
| `ShareSolution` | ACT-05-04 | `/api/download-token` |
| `SignIn` | ACT-01-01 | `/api/auth/*` |
| `StartPlanning` | ACT-02-01 | `/api/v80/tenant/run` |
| `UploadTenderDocument` | ACT-03-01 | `/api/v80/tender/intake` |
| `ViewAdminDashboard` | ACT-09-01 | `/api/enterprise-saas/dashboard/run` |
| `ViewGovernance` | ACT-09-06 | `/api/v80/ops/governance/audit` |
| `ViewOrganizations` | ACT-09-02 | `/api/enterprise-saas/tenant/run` |
| `ViewProcessingStatus` | ACT-03-02 | `/api/v80/tender/intake` |
| `ViewProjectContext` | ACT-04-02 | `/api/project/[projectId]` |
| `ViewSecurity` | ACT-09-05 | permission/role (nearest) |
| `ViewUsage` | ACT-09-04 | `/api/enterprise-saas/usage/run` |
| `ViewUsers` | ACT-09-03 | `/api/enterprise-saas/user/run` |
| `WorkspaceInteract` | ACT-04-01 | `/api/workspace/summary` |

---

# 08 Out of Scope

- Creating or renaming API routes
- Request/response JSON schemas
- Database models
- UI / React / Next.js pages
- New Domain modules (including M11–M15 changes)
- Business logic inside Screens
- Supplier Hub / Delivery Platform / Billing checkout APIs beyond existing download/ops surfaces

---

# 09 EXIT Checklist

| Criterion | Status |
|-----------|--------|
| Every PD-2.3 Action mapped | ✓ 47/47 |
| Binding follows Screen → Command → API → Existing Domain | ✓ |
| Existing Domains only | ✓ |
| No new API invented | ✓ |
| No implementation | ✓ |
| Ready for engineering consumption (route names only) | ✓ |

---

# Freeze Statement

PD-2.4 API Mapping is frozen.

Engineering must consume **existing** routes and Domains listed here.

Any missing exact route remains a **NEAREST** binding to an existing surface — it is **not** authorization to create a new Domain.
