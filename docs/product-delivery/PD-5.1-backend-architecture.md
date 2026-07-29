# PD-5.1 — Backend Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Backend Architecture

## Version

`product-delivery-pd-5.1-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Layer | Source | Baseline |
|-------|--------|----------|
| Product Blueprint | PD-1 | `product-planning-pd-1-v1` |
| Feature / Action / API / Domain maps | PD-2.1 … PD-2.6 | Frozen |
| UI baseline | PD-3.1 … PD-3.8 | `product-ui-baseline-v1` |
| Frontend architecture | PD-4.1 … PD-4.8 | `product-frontend-architecture-baseline-v1` |
| Enterprise Product Domains | M11–M15 | Existing baselines only |

## Purpose

Define the **backend architecture consumed by the frontend**, based on the frozen Enterprise Product Domain (M11–M15).

Backend:

- **owns business logic**,
- exposes **existing APIs** (PD-2.4) for frontend consumption,
- executes **Commands / Queries** against M11–M15 only,
- **does not create new Domains**.

Frontend consumes APIs only and owns no business logic (PD-4 freeze).

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Backend architecture overview | System shape vs frontend |
| Existing Domain ownership | M11–M15 |
| Existing Capability ownership | Domain capability surfaces |
| API ownership | Existing route / contract owners |
| Service boundary | Runtime services vs Domains |
| Domain boundary | Cross-Domain rules |
| Command / Query boundary | Write vs read paths |
| Persistence ownership | Who owns durable state |
| Backend layering | Delivery layers |
| Release Gate | Architecture readiness |
| Freeze summary | Lock points for downstream |

## Out of scope

| Item | Reason |
|------|--------|
| New Domains (M16+) | Forbidden |
| New API routes invented for UI convenience | Forbidden — PD-2.4 closed set |
| Frontend implementation | PD-4 |
| Database vendor selection / schema DDL | Not this architecture doc |
| Modification of PD-1…PD-4 or M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Backend Architecture Overview

## 2.1 System shape

```
┌─────────────────────────────────────────────┐
│  Frontend (PD-4 freeze)                      │
│  Screens / Adapter / presentation only       │
└───────────────────┬─────────────────────────┘
                    │ Existing HTTP APIs (PD-2.4)
                    ▼
┌─────────────────────────────────────────────┐
│  API Edge                                    │
│  authn/z observation · routing · contracts   │
└───────────────────┬─────────────────────────┘
                    │ Command / Query
                    ▼
┌─────────────────────────────────────────────┐
│  Application / Service boundary              │
│  orchestrate existing runtime surfaces       │
│  (DOM-* from PD-2.4) without new Domains     │
└───────────────────┬─────────────────────────┘
                    │ Domain operations
                    ▼
┌─────────────────────────────────────────────┐
│  Enterprise Product Domains (M11–M15)        │
│  business logic · policies · outcomes        │
└───────────────────┬─────────────────────────┘
                    │ persistence ports
                    ▼
┌─────────────────────────────────────────────┐
│  Persistence / stores (Domain-owned)         │
└─────────────────────────────────────────────┘
```

## 2.2 Ownership split (locked)

| Layer | Owns | Does not own |
|-------|------|--------------|
| Frontend | Presentation, intents, ST-META | Business rules, Domain mutations |
| API Edge | Transport contracts, auth gates to existing surfaces | Product Domain redesign |
| Service / Application | Orchestration of existing capabilities per Command | Shadow Domains |
| M11–M15 | Business logic, policies, authoritative outcomes | UI layout / routing policy |
| Persistence | Durable Domain state | Client caches |

## 2.3 Backend principles

1. **M11–M15 only** — Primary Domain ownership from PD-2.5.  
2. **No new Domains** — do not invent M16+ or parallel product Domain folders.  
3. **Backend owns business logic** — validation, eligibility, generation, pricing/analysis rules live behind Domains/services — not in UI.  
4. **Frontend consumes APIs only** — no direct Domain module imports from client.  
5. **Existing APIs only** — PD-2.4 bindings; prefer `/api/v80/*` where marked.  
6. **Runtime surfaces (DOM-\*) are not product Domains** — they are capability/runtime owners mapped onto M11–M15.  
7. **Commands mutate; Queries read** — clear CQ boundary.  
8. **Persistence follows Domain ownership** — no cross-Domain silent writes.

---

# 3. Existing Domain Ownership

## 3.1 Frozen Domain catalogue

| Domain | Path | Baseline ID | Backend role |
|--------|------|-------------|--------------|
| **M11 Knowledge** | `lib/product/m11` | `enterprise-product-knowledge-baseline-v1` | Knowledge entities, tender/requirement knowledge, document catalog, artifact export semantics |
| **M12 Agent** | `lib/product/m12` | `enterprise-product-agent-baseline-v1` | Agent invocation, guided workspace interaction, generation orchestration |
| **M13 OS** | `lib/product/m13` | `enterprise-product-os-baseline-v1` | Access, projects/workspace platform ops, admin ops, navigation/tenant surfaces |
| **M14 Intelligence** | `lib/product/m14` | `enterprise-product-intelligence-baseline-v1` | Solution/budget/proposal/opportunity analysis lenses |
| **M15 Evolution** | `lib/product/m15` | `enterprise-product-evolution-baseline-v1` | Share/feedback signals, continuity experience, governance oversight |

## 3.2 Domain chain (read-only)

```
M11 Knowledge
  → M12 Agent
    → M13 OS
      → M14 Intelligence
        → M15 Evolution
```

## 3.3 Concern → Primary Domain (PD-2.5)

| Concern class | Primary Domain |
|---------------|----------------|
| Access / language / goal entry / projects / tenant / admin metrics | **M13** |
| Tender upload / processing / requirements / document browse·preview·download | **M11** |
| Workspace interact / agent-guided generation / start planning session | **M12** |
| Planning analysis / solution·budget·proposal review / opportunity intelligence | **M14** |
| Share / returning continuity / usage-as-feedback / governance oversight | **M15** |

## 3.4 Primary Command load (locked counts)

| Domain | Primary Command count (PD-2.5) |
|--------|--------------------------------|
| M11 | 13 |
| M12 | 3 |
| M13 | 20 |
| M14 | 8 |
| M15 | 3 |
| **Total** | **47** |

Supporting Domains may assist; supporting set remains within M11–M15 only.

---

# 4. Existing Capability Ownership

## 4.1 Capability model

Each M-domain exposes **capabilities** (foundation catalogues, runtimes, policies, governance) already frozen in Domain baselines.  
Backend architecture **reuses** these capabilities — it does not invent a parallel capability Domain.

## 4.2 Capability ownership map

| Capability class | Owner Domain | Examples consumed by backend Commands |
|------------------|--------------|----------------------------------------|
| Knowledge retrieval / catalog / intake | M11 | Tender intake, document browse, artifact PDF export |
| Agent invocation / orchestration | M12 | StartPlanning, WorkspaceInteract, GenerateTenderPackage |
| OS surfaces / operations / access | M13 | SignIn, projects, admin dashboard areas, NAV-related platform ops |
| Intelligence analysis lenses | M14 | SubmitPlanningInputs, ReviewSolution/Budget, CaptureOpportunity |
| Evolution / feedback / governance | M15 | Share*, ViewGovernance, continuity signals |

## 4.3 Runtime capability surfaces (PD-2.4 DOM-* → M owner)

| Runtime surface | M owner | Backend note |
|-----------------|---------|--------------|
| DOM-AUTH / DOM-PREF / DOM-TENANT / DOM-PROJECT / DOM-OPS | M13 | Platform access & ops |
| DOM-TENDER / DOM-PDF / DOM-DOCS | M11 (+ supports) | Knowledge artifacts |
| DOM-AUTOPILOT | M12 | Agent orchestration |
| DOM-PLAN / DOM-BUDGET / DOM-PROPOSAL / DOM-SALES | M14 (+ supports) | Intelligence outcomes |
| Share / governance audit paths | M15 (+ M11/M13) | Evolution signals |

Runtime modules may live under existing `lib/*` paths; **product ownership** remains M11–M15.

## 4.4 Capability rules

| Rule | Statement |
|------|-----------|
| CAP-01 | Capabilities are invoked through existing APIs / Domain contracts — not by UI |
| CAP-02 | Do not duplicate a capability in a second Domain “for convenience” |
| CAP-03 | Cross-capability orchestration stays within PD-2.5 primary/supporting map |
| CAP-04 | Capability status/readiness remains Domain-owned — UI only presents results |

---

# 5. API Ownership

## 5.1 API Edge role

The API Edge:

- accepts frontend Adapter requests,
- enforces existing authn/z gates,
- dispatches to the owning Domain/capability,
- returns existing contracts (no schema redesign in this doc).

## 5.2 Ownership rules

| Rule | Statement |
|------|-----------|
| API-01 | Every product Command with Kind `API` / `API+NAV` / `NEAREST` binds to an **existing** route from PD-2.4 |
| API-02 | Prefer `/api/v80/*` when PD-2.4 marks preferred |
| API-03 | API Edge does not own business decisions — Domains do |
| API-04 | No new `/api/*` routes created by backend architecture under this delivery step |
| API-05 | `NAV` / `PREF` require no HTTP; backend still owns related Domain preference/access rules when applicable |
| API-06 | Error codes/messages exposed to UI are mapped from Domain/API failures — not invented Feature Screens |

## 5.3 Preferred existing API set (reference)

| Route family | Typical Domain owner |
|--------------|----------------------|
| `/api/auth/*` | M13 |
| `/api/v80/tenant/run`, entitlements | M13 |
| `/api/v80/tender/intake`, tender analyze | M11 |
| `/api/v80/autopilot/job/run` | M12 |
| `/api/v80/budget/calculate`, plan/proposal surfaces | M14 |
| `/api/v80/pdf`, `/api/v80/proposal-pdf/render` | M11 (+ M14 review) |
| `/api/project/*`, `/api/documents/*` | M13 / M11 |
| `/api/v80/ops/*`, enterprise-saas ops | M13 (+ M15 governance) |
| `/api/sales/signals` | M14 |

Exact Action→API rows remain in PD-2.4 / PD-2.5 (read-only).

---

# 6. Service Boundary

## 6.1 Definition

**Services** are application/runtime orchestrators that call Domain capabilities and existing libraries to fulfill a Command/Query.

Services are **not** new product Domains.

## 6.2 Allowed service responsibilities

| May | Must not |
|-----|----------|
| Translate API request → Domain operation | Redefine Domain baselines |
| Coordinate primary + supporting Domains per PD-2.5 | Invent cross-Domain policies outside maps |
| Apply transport/auth middleware | Implement UI routing policy |
| Emit Domain events / audit hooks already owned | Bypass auth for “frontend speed” |
| Map Domain results → API response DTOs | Embed presentation layout rules |

## 6.3 Service boundary rules

| Rule | Statement |
|------|-----------|
| SVC-01 | One Command has one primary Domain owner; services respect that owner |
| SVC-02 | Supporting Domain calls are explicit and mapped — not ad-hoc |
| SVC-03 | Do not create a “God service” that becomes M16 in practice |
| SVC-04 | Autopilot/tenant/budget runtime services remain capability providers under M ownership |

---

# 7. Domain Boundary

## 7.1 Invariants

| Rule | Statement |
|------|-----------|
| DOM-01 | Primary Domain decides authoritative outcome for its Commands |
| DOM-02 | Supporting Domains may supply inputs/side effects but not steal primary ownership |
| DOM-03 | Domains do not import frontend modules |
| DOM-04 | Domains do not own Screen/Component catalogues |
| DOM-05 | Cross-Domain writes require mapped Command semantics — no silent dual writes |
| DOM-06 | M11–M15 baselines remain frozen; delivery adapts consumption, not Domain redesign |

## 7.2 Boundary examples

| Interaction | Boundary |
|-------------|----------|
| M12 GenerateTenderPackage uses M11 knowledge + M14 outputs | M12 orchestrates; M11/M14 remain owners of their artifacts/analyses |
| M15 Share* references M11 artifact | M15 owns share/feedback signal; M11 owns artifact bytes/catalog |
| M13 ListProjects with M15 continuity support | M13 owns project list; M15 may record experience signals |
| M14 ReviewBudget with M11 PDF export later | M14 owns analysis; M11 owns download artifact Command |

---

# 8. Command / Query Boundary

## 8.1 Definitions

| Kind | Meaning | Backend effect |
|------|---------|----------------|
| **Command** | Intent to change Domain state or trigger side effects | Mutate / generate / share / auth session change |
| **Query** | Intent to read presentation-ready Domain state | Read-only; no business mutation |

Frontend ACT-* map to PD-2.3 Commands; backend classifies execution as Command or Query at the API/service boundary.

## 8.2 Classification guidance

| Pattern | Usually | Examples |
|---------|---------|----------|
| Upload / submit / generate / capture / share / sign-in verify | Command | `UploadTenderDocument`, `GenerateTenderPackage`, `ShareDocument`, `SignIn` |
| List / browse / review / view status / view admin metrics | Query | `ListProjects`, `BrowseDocumentCategories`, `ViewProcessingStatus`, `ViewUsage` |
| Open result that may calculate then navigate | Command and/or Query per PD-2.4 binding | `OpenBudgetResult`, `ReviewBudget` — follow existing API semantics |
| Pure NAV / PREF | No HTTP Command/Query | Client-only; Domain preference rules remain M13 where applicable |

## 8.3 CQ rules

| Rule | Statement |
|------|-----------|
| CQ-01 | Queries must not mutate Domain business state |
| CQ-02 | Commands are authorized by existing auth/ops gates before Domain execution |
| CQ-03 | Command success is Domain-authoritative; UI cache invalidation follows (PD-4.3/4.5) |
| CQ-04 | Idempotency / retries follow existing API/Domain contracts — not UI-invented workflows |
| CQ-05 | Do not expose Domain-internal commands that bypass PD-2.4 product bindings for MVP paths |

---

# 9. Persistence Ownership

## 9.1 Ownership model

| Data class | Owner | Notes |
|------------|-------|-------|
| Knowledge entities / tender artifacts / documents catalog | **M11** | Inclusive of exportable artifact bytes metadata |
| Agent run / orchestration records | **M12** | Job/run state for generation |
| Projects / tenants / users / session / ops configs | **M13** | Platform persistence |
| Intelligence analyses / opportunity records | **M14** | Analysis outcomes |
| Feedback / share / governance audit signals | **M15** | Evolution records |
| Client ST-* caches | Frontend | Disposable; not persistence SoT |

## 9.2 Persistence rules

| Rule | Statement |
|------|-----------|
| PER-01 | Source of truth for business entities is Domain persistence — not frontend stores |
| PER-02 | A Domain must not silently overwrite another Domain’s durable store |
| PER-03 | API Edge does not own databases |
| PER-04 | Derived API projections are not independent SoT |
| PER-05 | Secrets / credentials persist only via existing auth mechanisms (M13 / DOM-AUTH) |
| PER-06 | This document does not prescribe storage engines |

---

# 10. Backend Layering

```
L5  API Edge                 Existing routes (PD-2.4)
L4  Application Services     Command/Query handlers / orchestration
L3  Domain Capabilities      M11–M15 capability & policy surfaces
L2  Domain Runtime Adapters  Existing DOM-* / lib runtime modules
L1  Persistence Ports        Domain-owned stores
```

## Layering rules

| Rule | Statement |
|------|-----------|
| BL-01 | Lower layers must not depend on frontend |
| BL-02 | L5 may authenticate and route; must not encode Golden Path UI eligibility engines |
| BL-03 | L4 orchestrates; L3 decides business outcomes |
| BL-04 | L2 adapts existing runtimes into Domain ownership — does not become a new Domain |
| BL-05 | L1 persistence access goes through Domain ports — not from L5 directly for product logic |
| BL-06 | Layering must preserve PD-2.5 primary Domain for each Command |

## Mapping to frontend consumption

```
Frontend Adapter
  → L5 API
    → L4 Service (Command/Query)
      → L3 M11–M15
        → L2 runtime as needed
          → L1 persistence
  ← response DTO
Frontend maps to OBJ-* / ST-SERVER
```

---

# 11. Security & Boundary Alignment (Backend reading)

| Concern | Backend rule | Frontend counterpart |
|---------|--------------|----------------------|
| Authentication | Existing auth APIs / session (M13) | ST-SESSION observe |
| Authorization | Domain + ops enforce on Command/Query | Visibility ≠ authorization |
| Admin ops | M13 (+ M15 governance) | GRD-OPS presentation only |
| Uploads | Untrusted until M11 accepts | Presentation payload only |
| Errors | Domain/API safe failure contracts | META-ERROR mapping |

Backend must not rely on UI guards as security.

---

# 12. Golden Path Backend Chains (architecture)

| Path | Dominant Domain sequence (from PD-2.5) |
|------|----------------------------------------|
| GP-01 | M13 → M12 → M14 → M13 → M12 → M14 → M11 |
| GP-01R | M13 → M12 (resume) |
| GP-02 | M13 → M11 → M12 → M14 → M11 |
| GP-03 | M13 → M12 → M14 → M15/M11 |
| GP-04 | M13 (+ M15 governance) |

Exact Command rows remain in PD-2.5.

---

# 13. Release Gate

## Gate ID

`product-backend-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| BEA-OVER | Overview | System shape + ownership split defined |
| BEA-DOM | Domain ownership | M11–M15 catalogue + concern map + 47 Command ownership referenced |
| BEA-CAP | Capability ownership | Capability classes + DOM-* → M map |
| BEA-API | API ownership | Existing PD-2.4 only; no new routes |
| BEA-SVC | Service boundary | Services ≠ Domains; orchestration rules |
| BEA-BOUND | Domain boundary | Cross-Domain invariants |
| BEA-CQ | Command/Query | CQ definitions + rules |
| BEA-PER | Persistence | Domain-owned SoT rules |
| BEA-LAYER | Layering | L1…L5 defined |
| BEA-SCOPE | Upstream intact | PD-1…PD-4 / M11–M15 unmodified; single new file; no new Domains |

## Verdict

```
PD-5.1 Gate = PASS
  iff BEA-OVER ∧ BEA-DOM ∧ BEA-CAP ∧ BEA-API ∧ BEA-SVC
    ∧ BEA-BOUND ∧ BEA-CQ ∧ BEA-PER ∧ BEA-LAYER ∧ BEA-SCOPE all PASS
```

---

# 14. Freeze Summary

```
BACKEND_ARCH_ID        = product-backend-architecture-v1
FE_BASELINE_REF        = product-frontend-architecture-baseline-v1
UI_BASELINE_REF        = product-ui-baseline-v1
DOMAINS                = M11–M15 only
PRIMARY_COMMANDS       = 47 (PD-2.5)
API_SET                = PD-2.4 existing only
BACKEND_OWNS           = business logic
FRONTEND_OWNS          = presentation only
NO_NEW_DOMAIN          = true
NO_NEW_API             = true
LAYERS                 = L1…L5
```

## Immutable statements

1. No new Domains under this architecture.  
2. Backend owns business logic; frontend consumes APIs only.  
3. API set closed to PD-2.4 existing bindings.  
4. Persistence SoT remains Domain-owned.  
5. PD-1…PD-4 and M11–M15 unmodified by this task.

## Handoff

```
Product Planning + UI + Frontend Architecture = Frozen
Backend Architecture (PD-5.1)                 = Defined
Next delivery                                 = Backend routing/services/adapters against this doc
                                              = without Domain redesign
```

---

# 15. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-BEA-01 | Backend overview + ownership split defined | ✓ |
| AC-BEA-02 | Domain + capability + API ownership defined | ✓ |
| AC-BEA-03 | Service + Domain + CQ + persistence boundaries defined | ✓ |
| AC-BEA-04 | Backend layering defined | ✓ |
| AC-BEA-05 | Release Gate + Freeze summary present | ✓ |
| AC-BEA-06 | M11–M15 only; no new Domains; backend owns business logic; Markdown only; upstream unmodified | ✓ |

## Verdict

```
PD-5.1 document PASS iff AC-BEA-01 … AC-BEA-06 PASS
```

---

# Document Statement

PD-5.1 Backend Architecture locks how frozen Enterprise Product Domains serve the frozen frontend.

```
Frontend → Existing API → Service → M11–M15 → Persistence
Backend owns business logic
No new Domains / no new APIs
Frontend consumes APIs only
```
