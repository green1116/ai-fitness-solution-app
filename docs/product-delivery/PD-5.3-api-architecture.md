# PD-5.3 — API Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — API Architecture

## Version

`product-delivery-pd-5.3-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.3 / PD-2.4 / PD-2.5 | Commands, existing API bindings, M11–M15 ownership |
| PD-4.2 / PD-4.5 / PD-4.6 | Frontend routes, data flow, auth consumption |
| PD-5.1 / PD-5.2 | Backend layering, services, CQ boundary |

## Purpose

Define **backend API architecture**, **API ownership**, **request/response contract**, and **API boundary** for frontend consumption.

APIs are the **only** product integration surface for the frontend.  
Bindings are the **existing** PD-2.4 set — **no new API families**.  
Backend (M11–M15 via services) **owns business logic**.  
Frontend consumes APIs only.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| API surface overview | Families + edge role |
| Read / Command endpoints | Query vs Command classification |
| Request / response contracts | Envelope rules (not new schemas) |
| Route-to-API mapping | FE routes → Commands → existing APIs |
| Error contract | Stable failure envelope |
| Pagination / filter / sort | List query conventions |
| Auth / permission contract | Session & authz at API edge |
| Versioning policy | Existing version surfaces |
| API freeze summary | Locked inventory |
| Release Gate | Readiness |

## Out of scope

| Item | Reason |
|------|--------|
| Inventing new `/api/*` families or routes | Forbidden |
| Full OpenAPI / field-level schemas | Existing contracts remain SoT; this doc defines architecture rules |
| Frontend presentation mapping | PD-4 |
| New Domains | Forbidden |
| Modification of PD-1…PD-5.2 or M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. API Surface Overview

## 2.1 Edge position

```
Frontend Adapter (PD-4)
        ↓  HTTPS
API Edge (L5)     ← THIS DOCUMENT’s contract surface
        ↓
L4 Services (PD-5.2)
        ↓
M11–M15 Domains (PD-5.1 / PD-2.5)
```

## 2.2 Existing API families (closed set)

| Family ID | Prefix / surface | Primary M owner | Role |
|-----------|------------------|-----------------|------|
| FAM-AUTH | `/api/auth/*` | M13 | Sign-in, session observe |
| FAM-V80 | `/api/v80/*` | Mixed (see routes) | Preferred product runtime |
| FAM-PROJECT | `/api/project/*` | M13 | Project list / detail |
| FAM-WORKSPACE | `/api/workspace/*` | M13 (+ M12) | Workspace summary surfaces |
| FAM-TENDER | `/api/tender/*` | M11 | Legacy/secondary tender |
| FAM-DOCUMENTS | `/api/documents/*` | M11 | Document catalog |
| FAM-PDF | `/api/v80/pdf`, `/api/v80/proposal-pdf/*` | M11 (+ M14) | Artifact render/download |
| FAM-SALES | `/api/sales/*` | M14 | Opportunity signals |
| FAM-DOWNLOAD | `/api/download-token`, `/api/commercial-delivery/*` | M15 (+ M11) | Share / delivery nearest |
| FAM-OPS | `/api/enterprise-saas/*`, `/api/v80/ops/*` | M13 (+ M15) | Admin / governance |
| FAM-PLAN | `/api/plan`, `/api/onboarding/*` | M14 (+ M12/M13) | Nearest planning bootstrap |

**No new families** may be added under this architecture.

## 2.3 Preferred surface

Where PD-2.4 marks a preferred twin, prefer **`/api/v80/*`** over legacy equivalents.

## 2.4 Binding kinds at the API edge

| Kind | API Edge behavior |
|------|-------------------|
| `API` | Invoke existing route; return contract response |
| `API+NAV` | Same as API; frontend navigates after success |
| `NEAREST` | Use documented nearest existing route only |
| `NAV` / `PREF` | No HTTP product API required |

## 2.5 Surface rules

| Rule | Statement |
|------|-----------|
| SUR-01 | Frontend must not call Domain modules directly |
| SUR-02 | Product MVP paths use only families in §2.2 |
| SUR-03 | API Edge enforces authn/z; Domains own business authorization outcomes |
| SUR-04 | API Edge does not own UI routes (`/builder`, `/workspace`, …) |

---

# 3. Read / Command Endpoints

## 3.1 Classification

| Class | Meaning | HTTP expectation |
|-------|---------|------------------|
| **Query (Read)** | No business mutation | Read existing resource/status/list/artifact metadata |
| **Command** | Mutate or side-effect | Upload, generate, calculate-as-command, share, auth verify |

Classification follows PD-5.1 / PD-5.2 and existing route semantics — not a license to create dual endpoints.

## 3.2 Query endpoints (existing bindings)

| Command (Query) | Existing API | Family | Service |
|-----------------|--------------|--------|---------|
| Session observe (`/api/auth/me`) | `/api/auth/me` | FAM-AUTH | SVC-ACCESS |
| `ListProjects` / `OpenMyProjects` | `/api/project/list` | FAM-PROJECT | SVC-PROJECT |
| `ViewProjectContext` / `ContinueProject` (read) | `/api/project/[projectId]`, `/api/workspace/summary` | FAM-PROJECT / WORKSPACE | SVC-PROJECT |
| `ViewProcessingStatus` | `/api/v80/tender/intake` status / tender gate | FAM-V80 / TENDER | SVC-KNOWLEDGE-INTAKE |
| `BrowseDocumentCategories` / `OpenDocuments` | `/api/documents/summary`, `/api/documents/projects/[projectId]` | FAM-DOCUMENTS | SVC-DOCUMENT |
| `ReviewSolution` / preview reads | `/api/v80/pdf?type=plan` | FAM-PDF | SVC-DOCUMENT / INTELLIGENCE |
| `ReviewBudget` (read aspect) | budget + `/api/v80/pdf?type=budget` | FAM-V80 / PDF | SVC-INTELLIGENCE |
| `ReviewProposalResult` | `/api/v80/proposal-pdf/render` | FAM-PDF | SVC-INTELLIGENCE |
| Admin views | `/api/enterprise-saas/*/run`, `/api/v80/ops/*` | FAM-OPS | SVC-OPS / EVOLUTION |

## 3.3 Command endpoints (existing bindings)

| Command | Existing API | Family | Service |
|---------|--------------|--------|---------|
| `SignIn` | `/api/auth/otp/*` or `/api/auth/email/*` | FAM-AUTH | SVC-ACCESS |
| `StartPlanning` | `/api/v80/tenant/run` and/or `/api/onboarding/submit` | FAM-V80 / PLAN | SVC-AGENT |
| `SubmitPlanningInputs` | `/api/v80/budget/calculate` and/or `/api/plan` | FAM-V80 / PLAN | SVC-INTELLIGENCE |
| `UploadTenderDocument` | `/api/v80/tender/intake` | FAM-V80 | SVC-KNOWLEDGE-INTAKE |
| `ProceedToRequirementReview` / `ConfirmRequirements` | `/api/tender/analyze` (+ gates) | FAM-TENDER | SVC-KNOWLEDGE-INTAKE |
| `GenerateTenderPackage` / workspace job | `/api/v80/autopilot/job/run` | FAM-V80 | SVC-AGENT |
| `CaptureOpportunity` | `/api/sales/signals` / analyze | FAM-SALES | SVC-INTELLIGENCE |
| `ContinueToBudget` / `OpenBudgetResult` | `/api/v80/budget/calculate` | FAM-V80 | SVC-INTELLIGENCE |
| Download / Preview artifacts | `/api/v80/pdf?artifactId=` / `?type=` | FAM-PDF | SVC-DOCUMENT |
| `ShareSolution` / `ShareDocument` | `/api/download-token` / commercial-delivery | FAM-DOWNLOAD | SVC-EVOLUTION |

## 3.4 Endpoint rules

| Rule | Statement |
|------|-----------|
| EP-01 | Do not add a parallel “clean” REST resource if PD-2.4 already binds a route |
| EP-02 | Queries must not mutate Domain business state |
| EP-03 | Commands return Domain-authoritative results |
| EP-04 | Binary download/stream responses remain first-class existing contracts |

---

# 4. Request / Response Contracts

## 4.1 Contract authority

| Layer | Authority |
|-------|-----------|
| Field-level / wire schemas | **Existing** route implementations & contracts |
| Architecture envelope rules | **This document** |
| Object presentation (OBJ-*) | Frontend Adapter mapping (PD-3.1 / PD-4.5) |

This document **does not redefine** request/response body schemas.

## 4.2 Request rules

| Rule | Statement |
|------|-----------|
| REQ-01 | Requests carry opaque ids (`projectId`, `artifactId`, …) — not Domain policy objects |
| REQ-02 | Auth credentials/tokens use existing auth mechanisms only |
| REQ-03 | Uploads use existing intake multipart/contract — untrusted until Domain accepts |
| REQ-04 | Clients must not send invented business eligibility flags for Domains to “honor” |
| REQ-05 | Idempotency keys only if already part of an existing contract |

## 4.3 Response rules

| Rule | Statement |
|------|-----------|
| RES-01 | Success payloads expose Domain outcomes needed for OBJ-* mapping — not engine internals |
| RES-02 | Empty collections are success with empty list — not errors |
| RES-03 | Artifact endpoints may return binary or redirect/token per existing contract |
| RES-04 | Do not embed UI layout, route tables, or CMP trees in API responses |
| RES-05 | Do not return secrets, raw session secrets, or stack traces |

## 4.4 Logical envelope (architecture)

When an existing JSON API already uses a structured envelope, preserve it.  
Architecturally, product responses distinguish:

| Field (logical) | Meaning |
|-----------------|---------|
| `ok` / status | Success vs failure |
| `data` | Domain result payload |
| `error` | Error contract (§6) |
| `meta` | Optional paging/cursor meta when existing |

Do **not** invent a new global envelope that breaks existing routes.

---

# 5. Route-to-API Mapping

Frontend **UI routes** (PD-4.2) are not backend API routes. Mapping is via Screen Actions → Commands → existing APIs.

| UI route | Screen | Dominant API families |
|----------|--------|----------------------|
| `/` | SCR-01 | FAM-AUTH; FAM-PROJECT on OpenMyProjects |
| `/builder` | SCR-02 | FAM-V80 tenant/budget; FAM-PLAN |
| `/tender` | SCR-03 | FAM-V80 tender; FAM-TENDER |
| `/workspace` | SCR-04 | FAM-WORKSPACE; FAM-V80 autopilot; FAM-PROJECT; FAM-SALES; FAM-PDF |
| `/solution` | SCR-05 | FAM-PDF; FAM-DOWNLOAD; FAM-V80 budget; FAM-DOCUMENTS |
| `/budget` | SCR-06 | FAM-V80 budget; FAM-PDF; FAM-DOCUMENTS |
| `/projects` | SCR-07 | FAM-PROJECT; FAM-DOCUMENTS |
| `/documents` | SCR-08 | FAM-DOCUMENTS; FAM-PDF; FAM-DOWNLOAD |
| `/admin` | SCR-09 | FAM-OPS; FAM-AUTH observe |

## Mapping rules

| Rule | Statement |
|------|-----------|
| MAP-01 | UI path changes must not require new API families |
| MAP-02 | Exact Command→API rows remain PD-2.4 (read-only) |
| MAP-03 | `API+NAV` success does not return “next UI route” as business logic — frontend owns navigation edges |

---

# 6. Error Contract

## 6.1 Error classes (aligned with PD-5.2)

| Class | Typical HTTP (existing) | Client handling (PD-4.6) |
|-------|-------------------------|-------------------------|
| `UNAUTH` | 401 | Clear session presentation; Sign In |
| `FORBIDDEN` | 403 | Denial; Admin → safe Entry |
| `VALIDATION` | 400 | Show field/contract message; no Domain write |
| `NOT_FOUND` | 404 | Empty/not-found presentation |
| `CONFLICT` | 409 (if used) | Domain state conflict message |
| `DOMAIN_REJECT` | 4xx/422 as existing | Propagate Domain decision |
| `UNAVAILABLE` | 503 / 5xx | Retry / `/unavailable` |

Exact status codes follow **existing** implementations; architecture forbids inventing a parallel error taxonomy that replaces them.

## 6.2 Error payload rules

| Rule | Statement |
|------|-----------|
| ERR-01 | Include stable machine `code` when existing contract has one |
| ERR-02 | Include safe human `message` suitable for META-ERROR mapping |
| ERR-03 | No stack traces / internal Domain dumps |
| ERR-04 | Do not leak cross-tenant resource names beyond safe messaging |
| ERR-05 | Partial ops area failures may be per-area when existing contracts allow |

---

# 7. Pagination / Filter / Sort Contract

## 7.1 Applicability

Primarily list/query surfaces:

- `/api/project/list`
- `/api/documents/summary` / project documents
- Ops list/run surfaces under FAM-OPS

## 7.2 Architecture conventions

| Concern | Rule |
|---------|------|
| Pagination | Use **existing** query params/body fields of each route — do not invent a new global pager API |
| Filter | Only filters already supported by existing APIs (e.g. document category labels already in product) |
| Sort | Prefer server-supported sort; otherwise frontend ST-DERIVED sort of **returned** rows only (PD-4.3) |
| Page size | Honor existing defaults/limits; do not demand unbounded dumps |
| Cursor vs offset | Follow each existing route’s model — no forced unification that creates new families |

## 7.3 Rules

| Rule | Statement |
|------|-----------|
| PFS-01 | Missing page ⇒ empty list success, not fabricated rows |
| PFS-02 | Filter must not encode Domain entitlement engines in query strings |
| PFS-03 | Frontend must not page-client-side invent business aggregates |

---

# 8. Auth / Permission Contract

## 8.1 Authn

| Surface | Contract |
|---------|----------|
| Establish session | `SignIn` via `/api/auth/*` (existing OTP/email flows) |
| Observe session | `/api/auth/me` |
| Credentials | Existing session mechanism only (cookies/tokens as implemented) |

## 8.2 Authz

| Rule | Statement |
|------|-----------|
| AZ-01 | Every Command/Query (except documented public auth request) requires valid session when existing gate requires it |
| AZ-02 | Admin/ops families require ops-capable authorization from existing auth/ops surfaces |
| AZ-03 | API authz failure → `UNAUTH` / `FORBIDDEN` — UI visibility is not sufficient |
| AZ-04 | Project/document access enforced by Domain/API — opaque ids in URLs are not capability tokens by themselves |

## 8.3 Permission visibility vs enforcement

| Layer | Role |
|-------|------|
| Frontend | Visibility + GRD-* presentation (PD-4.6) |
| API Edge | Transport session/ops gates |
| Domain | Authoritative permission / policy outcomes |

---

# 9. Versioning Policy

## 9.1 Existing version surfaces

| Surface | Policy |
|---------|--------|
| `/api/v80/*` | **Preferred** product runtime generation for MVP bindings |
| Legacy `/api/tender/*`, `/api/plan`, etc. | **Secondary** / NEAREST only when PD-2.4 says so |
| `/api/enterprise-saas/*` | Existing ops generation — no parallel ops family |

## 9.2 Versioning rules

| Rule | Statement |
|------|-----------|
| VER-01 | Do not create `/api/v81/*` (or new generation) under this freeze to “clean up” MVP |
| VER-02 | Prefer v80 twin when both exist |
| VER-03 | Breaking changes to existing contracts require explicit Product Delivery revision — not silent FE hacks |
| VER-04 | Versioning must not introduce new Domains |
| VER-05 | Deprecation of a legacy secondary route does not authorize inventing a replacement family outside PD-2.4 |

---

# 10. API Ownership Matrix

| Concern | Owner |
|---------|-------|
| Wire contract of existing route | Existing API implementation |
| Business outcome | M11–M15 (primary per PD-2.5) |
| Orchestration | L4 Services (PD-5.2) |
| Authn transport | FAM-AUTH / session mechanism |
| Authz decision | Domain + existing ops/auth |
| FE route table | Frontend (PD-4.2) |
| OBJ-* presentation | Frontend Adapter |

---

# 11. API Freeze Summary

```
API_ARCH_ID            = product-backend-api-architecture-v1
API_BINDING_SOURCE     = product-planning-pd-2.4-v1
FAMILIES               = AUTH | V80 | PROJECT | WORKSPACE | TENDER | DOCUMENTS | PDF | SALES | DOWNLOAD | OPS | PLAN
NEW_FAMILIES           = 0
NEW_ROUTES             = 0
PREFERRED              = /api/v80/* where mapped
FRONTEND_CONSUMES      = APIs only
BACKEND_OWNS_LOGIC     = true
DOMAINS                = M11–M15 only
CQ                     = Query vs Command on existing endpoints
```

## Locked inventory refs

| Item | Value |
|------|-------|
| Actions with HTTP bindings | API + API+NAV + NEAREST (PD-2.4) |
| NAV / PREF (no HTTP) | Remain non-HTTP |
| New APIs invented in PD-2.4 | 0 |
| New APIs invented here | 0 |

## Immutable prohibitions

1. No new API families or routes for MVP convenience.  
2. No Domain import from frontend.  
3. No business logic in API Edge beyond auth gates + DTO pass-through/orchestration handoff.  
4. No schema rewrite that orphans PD-2.4 bindings.  
5. No new Domains.

---

# 12. Release Gate

## Gate ID

`product-backend-api-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| APIA-SUR | Surface overview | Closed family set + edge position |
| APIA-CQ | Read/Command endpoints | Query + Command tables on existing routes |
| APIA-CTR | Request/response contracts | Authority + REQ/RES rules |
| APIA-MAP | Route-to-API mapping | UI routes → families; PD-2.4 retained |
| APIA-ERR | Error contract | Classes + payload rules |
| APIA-PFS | Pagination/filter/sort | Existing-param conventions |
| APIA-AUTH | Auth/permission | Authn/z + visibility≠enforcement |
| APIA-VER | Versioning | Prefer v80; no new generation under freeze |
| APIA-SCOPE | Upstream intact | PD-1…PD-5.2 / M11–M15 unmodified; no new families; single new file |

## Verdict

```
PD-5.3 Gate = PASS
  iff APIA-SUR ∧ APIA-CQ ∧ APIA-CTR ∧ APIA-MAP ∧ APIA-ERR
    ∧ APIA-PFS ∧ APIA-AUTH ∧ APIA-VER ∧ APIA-SCOPE all PASS
```

---

# 13. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-APIA-01 | API surface overview + closed families defined | ✓ |
| AC-APIA-02 | Read/Command endpoints on existing bindings defined | ✓ |
| AC-APIA-03 | Request/response + error + paging contracts defined | ✓ |
| AC-APIA-04 | Route-to-API + auth + versioning defined | ✓ |
| AC-APIA-05 | Freeze summary + Release Gate present | ✓ |
| AC-APIA-06 | No new Domains/API families; Markdown only; upstream unmodified | ✓ |

## Verdict

```
PD-5.3 document PASS iff AC-APIA-01 … AC-APIA-06 PASS
```

---

# Document Statement

PD-5.3 API Architecture locks the existing API edge for frontend consumption.

```
Frontend → Existing API families only → Services → M11–M15
No new API families / no new Domains
Backend owns business logic
Contracts preserve PD-2.4 bindings
```
