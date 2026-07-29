# PD-2.5 — Domain Mapping

## Status

**Frozen**

## Type

Product Planning

## Version

`product-planning-pd-2.5-v1`

## Freeze Date

2026-07-29

## Base (Input — read-only)

- `PD-2.4-api-mapping.md` (`product-planning-pd-2.4-v1`)

## Purpose

Bind every PD-2.4 Command / API binding to **M11–M15 Existing Domains only**.

```
Screen
    ↓
Command
    ↓
API                 ← PD-2.4 (frozen)
    ↓
M11–M15 Domain      ← this document
```

## Rules

1. **M11–M15 only** — Primary Domain must be one of M11, M12, M13, M14, M15.
2. **No new Domain** — do not invent M16+, do not create folders, do not extend Domain code.
3. **No implementation** — planning map only.
4. **Do not modify** PD-2.1 … PD-2.4.
5. PD-2.4 runtime surfaces (`DOM-AUTH`, `DOM-TENDER`, …) remain API bindings; this document assigns **enterprise product Domain ownership** on the frozen M-chain.
6. Supporting Domains (if any) must also be within M11–M15.

---

# 01 Allowed Domains (Frozen Baselines)

| Domain | Path | Baseline ID | Role in Product Planning |
|--------|------|-------------|--------------------------|
| **M11 Knowledge** | `lib/product/m11` | `enterprise-product-knowledge-baseline-v1` | Knowledge entities, retrieval, tender/requirement knowledge, document knowledge catalog |
| **M12 Agent** | `lib/product/m12` | `enterprise-product-agent-baseline-v1` | Agent invocation, guided workspace interaction, generation orchestration |
| **M13 OS** | `lib/product/m13` | `enterprise-product-os-baseline-v1` | Platform surfaces, projects/workspace operations, admin ops, access/navigation |
| **M14 Intelligence** | `lib/product/m14` | `enterprise-product-intelligence-baseline-v1` | Analysis lenses, solution/budget/proposal intelligence, opportunity intelligence |
| **M15 Evolution** | `lib/product/m15` | `enterprise-product-evolution-baseline-v1` | Feedback / experience / learning signals, optimization cues, evolution governance |

## Chain (read-only)

```
M11 Knowledge Baseline
    ↓
M12 Agent Baseline
    ↓
M13 OS Baseline
    ↓
M14 Intelligence Baseline
    ↓
M15 Evolution Baseline
```

---

# 02 Domain Concern Rules

| Concern class | Primary Domain | Rationale |
|---------------|----------------|-----------|
| Access / language / goal navigation / projects / tenant / admin metrics | **M13 OS** | Platform surface & operation ownership |
| Tender upload / processing status / requirement knowledge / document browse·preview·download | **M11 Knowledge** | Knowledge intake & artifact knowledge |
| Workspace interact / agent-guided generation (autopilot pack) / start agent planning session | **M12 Agent** | Invocation & guided work |
| Planning input analysis / solution·budget·proposal review / sales opportunity intelligence | **M14 Intelligence** | Intelligence analysis lenses |
| Share / returning continuity / usage-as-feedback / governance oversight | **M15 Evolution** | Feedback, experience, governance |

Supporting Domains may be listed when a Command crosses concerns (still M11–M15 only).

---

# 03 Action → Command → API (PD-2.4) → M11–M15 Map

## SCR-01 — Homepage

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-01-01 | `SignIn` | `/api/auth/*` | **M13** | — | OS access operation |
| ACT-01-02 | `SelectLanguage` | PREF | **M13** | — | OS surface preference |
| ACT-01-03 | `ChooseGoal.EnterpriseBuilder` | NAV | **M13** | — | OS goal surface entry |
| ACT-01-04 | `ChooseGoal.TenderIntelligence` | NAV | **M13** | — | OS goal surface entry |
| ACT-01-05 | `ChooseGoal.SalesCenter` | NAV | **M13** | — | OS goal surface entry |
| ACT-01-06 | `OpenMyProjects` | `/api/project/list` | **M13** | — | OS project surface |

## SCR-02 — Enterprise Builder Entry

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-02-01 | `StartPlanning` | `/api/v80/tenant/run` \| onboarding | **M12** | M13 | Agent planning session; OS workspace bootstrap support |
| ACT-02-02 | `SubmitPlanningInputs` | `/api/v80/budget/calculate` \| `/api/plan` | **M14** | M11 | Intelligence analysis of inputs; knowledge capture support |
| ACT-02-03 | `ContinueToWorkspace` | NAV | **M13** | M12 | OS navigation into Agent workspace |

## SCR-03 — Tender Intelligence Entry

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-03-01 | `UploadTenderDocument` | `/api/v80/tender/intake` | **M11** | — | Knowledge intake |
| ACT-03-02 | `ViewProcessingStatus` | tender intake / gate | **M11** | M12 | Knowledge processing status; Agent may drive processing |
| ACT-03-03 | `ProceedToRequirementReview` | `/api/tender/analyze` | **M11** | M13 | Knowledge → OS navigate to workspace |

## SCR-04 — AI Workspace

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-04-01 | `WorkspaceInteract` | workspace / autopilot | **M12** | M13 | Agent invocation; OS workspace surface |
| ACT-04-02 | `ViewProjectContext` | `/api/project/[projectId]` | **M13** | M11 | OS project context; knowledge entities visible |
| ACT-04-03 | `ConfirmRequirements` | tender analyze / gate | **M11** | M14 | Knowledge confirmation; intelligence validation support |
| ACT-04-04 | `GenerateTenderPackage` | `/api/v80/autopilot/job/run` | **M12** | M11, M14 | Agent orchestration over knowledge → intelligence outputs |
| ACT-04-05 | `CaptureOpportunity` | `/api/sales/signals` | **M14** | M12 | Opportunity intelligence; Agent assist support |
| ACT-04-06 | `OpenSolutionResult` | `/api/v80/pdf?type=plan` | **M14** | M13 | Intelligence result; OS navigation |
| ACT-04-07 | `OpenBudgetResult` | `/api/v80/budget/calculate` | **M14** | M13 | Budget intelligence; OS navigation |
| ACT-04-08 | `OpenDocuments` | `/api/documents/projects/[projectId]` | **M11** | M13 | Document knowledge; OS navigation |

## SCR-05 — Solution Result

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-05-01 | `ReviewSolution` | `/api/v80/pdf?type=plan` | **M14** | M11 | Solution intelligence review |
| ACT-05-02 | `ReviewProposalResult` | `/api/v80/proposal-pdf/render` | **M14** | M12 | Proposal intelligence; Agent-produced pack |
| ACT-05-03 | `DownloadSolution` | `/api/v80/pdf?artifactId=` | **M11** | — | Knowledge artifact export |
| ACT-05-04 | `ShareSolution` | download-token / delivery | **M15** | M11 | Evolution feedback/share signal; knowledge artifact |
| ACT-05-05 | `ContinueToBudget` | `/api/v80/budget/calculate` | **M14** | M13 | Intelligence → OS navigate |
| ACT-05-06 | `OpenDocuments` | `/api/documents/summary` | **M11** | M13 | Document knowledge catalog |
| ACT-05-07 | `ReturnToWorkspace` | NAV | **M13** | M12 | OS return to Agent workspace |

## SCR-06 — Budget Result

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-06-01 | `ReviewBudget` | budget + pdf budget | **M14** | M11 | Budget intelligence |
| ACT-06-02 | `DownloadBudget` | `/api/v80/pdf?type=budget` | **M11** | — | Knowledge artifact export |
| ACT-06-03 | `AdjustRequirements` | NAV | **M13** | M12, M14 | OS return; later Agent/Intelligence resubmit |
| ACT-06-04 | `OpenDocuments` | documents project | **M11** | M13 | Document knowledge |
| ACT-06-05 | `ReturnToSolution` | NAV | **M13** | M14 | OS navigate back to intelligence result |

## SCR-07 — My Projects

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-07-01 | `ListProjects` | `/api/project/list` | **M13** | M15 | OS project list; Evolution experience (returning) support |
| ACT-07-02 | `ContinueProject` | `/api/project/[projectId]` | **M13** | M12, M15 | OS resume; Agent workspace; experience continuity |
| ACT-07-03 | `OpenProjectDocuments` | documents project | **M11** | M13 | Knowledge documents via OS project |

## SCR-08 — My Documents

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-08-01 | `BrowseDocumentCategories` | `/api/documents/summary` | **M11** | — | Knowledge catalog browse |
| ACT-08-02 | `PreviewDocument` | `/api/v80/pdf?artifactId=` | **M11** | — | Knowledge artifact preview |
| ACT-08-03 | `DownloadDocument` | `/api/v80/pdf?artifactId=` | **M11** | — | Knowledge artifact download |
| ACT-08-04 | `ShareDocument` | download-token / delivery | **M15** | M11 | Evolution feedback; knowledge artifact |
| ACT-08-05 | `ReturnToProjects` | NAV | **M13** | — | OS navigation |
| ACT-08-06 | `ReturnToWorkspace` | NAV | **M13** | M12 | OS → Agent workspace |

## SCR-09 — Admin Dashboard

| Action ID | Command | PD-2.4 API (ref) | Primary | Supporting | Notes |
|-----------|---------|------------------|---------|------------|-------|
| ACT-09-01 | `ViewAdminDashboard` | enterprise-saas dashboard | **M13** | — | OS operations surface |
| ACT-09-02 | `ViewOrganizations` | enterprise-saas tenant | **M13** | — | OS tenant operation |
| ACT-09-03 | `ViewUsers` | enterprise-saas user | **M13** | — | OS user operation |
| ACT-09-04 | `ViewUsage` | usage + `/api/v80/ops/metrics` | **M13** | M15 | OS metrics; Evolution optimization signal support |
| ACT-09-05 | `ViewSecurity` | permission / role / auth | **M13** | — | OS security/governance policy surface |
| ACT-09-06 | `ViewGovernance` | `/api/v80/ops/governance/audit` | **M15** | M13 | Evolution governance oversight; OS audit surface support |

---

# 04 Coverage Summary

| Metric | Value |
|--------|-------|
| Actions mapped | **47 / 47** |
| Primary ∈ {M11, M12, M13, M14, M15} | **47 / 47** |
| Supporting outside M11–M15 | **0** |
| New Domains | **0** |
| PD-2.4 modified | **No** |

## Primary Domain Distribution

| Domain | Primary count | Typical Commands |
|--------|---------------|------------------|
| M11 Knowledge | 13 | Upload, requirements, document browse/preview/download |
| M12 Agent | 3 | StartPlanning, WorkspaceInteract, GenerateTenderPackage |
| M13 OS | 20 | Access, navigation, projects, admin ops |
| M14 Intelligence | 8 | Planning inputs, reviews, opportunity, open solution/budget |
| M15 Evolution | 3 | ShareSolution, ShareDocument, ViewGovernance |
| **Total** | **47** | |

---

# 05 PD-2.4 Runtime Surface → M11–M15 Ownership

| PD-2.4 Domain ID (runtime) | M11–M15 Owner | Rule |
|----------------------------|---------------|------|
| DOM-AUTH | M13 | OS access |
| DOM-PREF | M13 | OS preference surface |
| DOM-TENANT | M13 | OS tenant/workspace |
| DOM-PLAN | M14 (+ M12 start) | Intelligence analysis / Agent session start |
| DOM-TENDER | M11 (+ M12 generate) | Knowledge intake; Agent pack generation |
| DOM-AUTOPILOT | M12 | Agent orchestration |
| DOM-BUDGET | M14 | Intelligence budget analysis |
| DOM-PDF | M11 (+ M14 review) | Knowledge artifact; Intelligence review |
| DOM-PROPOSAL | M14 (+ M12) | Intelligence result; Agent production |
| DOM-PROJECT | M13 | OS project surface |
| DOM-DOCS | M11 (+ M15 share) | Knowledge catalog; Evolution share/feedback |
| DOM-SALES | M14 | Opportunity intelligence |
| DOM-OPS | M13 (+ M15 governance) | OS ops; Evolution governance |

This table **does not** resurrect PD-2.4 runtime modules as product Domains. Ownership is M11–M15 only.

---

# 06 Golden Path Domain Chains

## GP-01 — Enterprise Customer

```
M13 SignIn / ChooseGoal
    ↓
M12 StartPlanning
    ↓
M14 SubmitPlanningInputs
    ↓
M13 ContinueToWorkspace
    ↓
M12 WorkspaceInteract
    ↓
M13 ViewProjectContext
    ↓
M14 OpenSolutionResult → ReviewSolution → ContinueToBudget → ReviewBudget
    ↓
M11 DownloadBudget / OpenDocuments / Browse / DownloadDocument
```

## GP-02 — Tender Customer

```
M13 ChooseGoal.TenderIntelligence
    ↓
M11 Upload → Status → Proceed → ConfirmRequirements
    ↓
M12 GenerateTenderPackage
    ↓
M14 ReviewProposalResult
    ↓
M11 DownloadSolution / Documents
```

## GP-03 — Sales Consultant

```
M13 ChooseGoal.SalesCenter
    ↓
M14 CaptureOpportunity
    ↓
M12 WorkspaceInteract
    ↓
M14 OpenSolutionResult → ReviewProposalResult → ContinueToBudget → ReviewBudget
    ↓
M15 ShareSolution / ShareDocument
    ↓
M11 DownloadDocument
```

## GP-04 — Platform Administrator

```
M13 ViewAdminDashboard → Organizations → Users → Usage → Security
    ↓
M15 ViewGovernance
```

---

# 07 Out of Scope

- New Domain modules or M16+
- Changes to `lib/product/m11` … `m15` code
- New APIs or API schemas
- Implementation / UI / database
- Treating PD-2.4 `DOM-*` runtime modules as Primary Domains
- Modifying PD-2.4

---

# 08 EXIT Checklist

| Criterion | Status |
|-----------|--------|
| Every PD-2.4 Action mapped | ✓ 47/47 |
| Primary Domain ∈ M11–M15 only | ✓ |
| No new Domain | ✓ |
| No implementation | ✓ |
| Ready for downstream engineering alignment | ✓ |

---

# Freeze Statement

PD-2.5 Domain Mapping is frozen.

Downstream work must resolve product Domain ownership through **M11 Knowledge → M12 Agent → M13 OS → M14 Intelligence → M15 Evolution** only.

APIs remain as frozen in PD-2.4; Domains remain as frozen in M11–M15 baselines.
