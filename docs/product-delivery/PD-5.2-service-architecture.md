# PD-5.2 — Service Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Service Architecture

## Version

`product-delivery-pd-5.2-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.3 / PD-2.4 / PD-2.5 | Commands, APIs, M11–M15 ownership |
| PD-4.8 | Frontend consumes APIs only |
| PD-5.1 | Backend layering L1…L5; service ≠ Domain |

## Purpose

Define **backend service layering**, **service responsibilities**, **orchestration boundaries**, and **service-to-domain mapping**.

Services orchestrate existing M11–M15 capabilities to fulfill PD-2.3 Commands / Queries via existing PD-2.4 APIs.  
Services are **not** new product Domains.  
**Backend owns business logic** (in Domains + authorized service orchestration).  
**Frontend consumes APIs only.**

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Service layer overview | Position in L1…L5 |
| Service responsibilities | What services may/must not do |
| Use case orchestration | Golden Path / multi-step flows |
| Command handling | Mutating path |
| Query handling | Read path |
| Service-to-domain mapping | Primary/supporting Domains |
| Service-to-API mapping | Existing route families |
| Error handling boundary | Failure ownership |
| Transaction boundary | Consistency ownership |
| Release Gate | Readiness |
| Freeze summary | Lock points |

## Out of scope

| Item | Reason |
|------|--------|
| New Domains / new APIs | Forbidden |
| Framework/library choice | Implementation |
| Frontend adapter design | PD-4 |
| Persistence engine DDL | Not this doc |
| Modification of PD-1…PD-5.1 or M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Service Layer Overview

## 2.1 Position (from PD-5.1)

```
L5  API Edge                 ← existing routes (PD-2.4)
L4  Application Services     ← THIS DOCUMENT
L3  Domain Capabilities      ← M11–M15
L2  Domain Runtime Adapters  ← DOM-* / existing lib runtimes
L1  Persistence Ports        ← Domain-owned stores
```

## 2.2 Service layer shape

```
API request (Command | Query name + payload)
        ↓
Authn/z gate (existing)
        ↓
Use-case / Application Service (L4)
        ↓
Primary Domain capability (L3)  [+ supporting Domains per PD-2.5]
        ↓
Runtime adapters as needed (L2)
        ↓
Persistence (L1)
        ↓
API response DTO
```

## 2.3 Service catalogue (delivery units)

Services are grouped by **product concern**, not by inventing Domains.

| Service ID | Name | Primary Domain | Typical Screens |
|------------|------|----------------|-----------------|
| SVC-ACCESS | Access & Session Service | M13 | SCR-01 |
| SVC-PROJECT | Project & Workspace Surface Service | M13 | SCR-04, SCR-07 |
| SVC-KNOWLEDGE-INTAKE | Tender / Requirement Knowledge Service | M11 | SCR-03, SCR-04 |
| SVC-DOCUMENT | Document Catalog & Artifact Service | M11 | SCR-05…08 |
| SVC-AGENT | Agent Orchestration Service | M12 | SCR-02, SCR-04 |
| SVC-INTELLIGENCE | Intelligence Analysis Service | M14 | SCR-02, SCR-04…06 |
| SVC-EVOLUTION | Share / Feedback / Governance Service | M15 | SCR-05, SCR-08, SCR-09 |
| SVC-OPS | Admin Operations Service | M13 | SCR-09 |

These IDs are **application service units**. They do not create M16+.

## 2.4 Layer rules

| Rule | Statement |
|------|-----------|
| SL-01 | L4 services never become product Domains |
| SL-02 | L4 may orchestrate; L3 decides authoritative business outcomes |
| SL-03 | L4 must not import frontend modules |
| SL-04 | One HTTP product binding → one primary service entry (may call supports) |
| SL-05 | No “God service” owning all M11–M15 logic |

---

# 3. Service Responsibilities

## 3.1 May

| Responsibility | Notes |
|----------------|-------|
| Accept Command/Query from API Edge | Named per PD-2.3 |
| Enforce preconditions already required by API/Domain contracts | Auth context present, required ids |
| Orchestrate primary + supporting Domain calls | PD-2.5 map only |
| Map request DTO → Domain operation inputs | No business reinventing |
| Map Domain outcomes → response DTO | For frontend Adapter |
| Propagate Domain errors to API error envelope | Safe codes/messages |
| Coordinate transaction scope when Domain ports require it | See §10 |
| Invoke existing runtime adapters (DOM-*) | Under M ownership |

## 3.2 Must not

| Forbidden | Why |
|-----------|-----|
| Invent new Domain policies / eligibility engines outside Domains | Business logic ownership |
| Create new API routes | PD-2.4 closed |
| Own Screen/Component/route catalogues | UI / FE freeze |
| Bypass auth for convenience | Security |
| Dual-write across Domains without mapped Command semantics | Domain boundary |
| Cache as Source of Truth | Persistence ownership |
| Re-implement M11–M15 baselines | Domains frozen |

## 3.3 Responsibility matrix

| Concern | Service (L4) | Domain (L3) | API Edge (L5) | Frontend |
|---------|--------------|-------------|---------------|----------|
| Business decision | Orchestrate only | **Owns** | — | — |
| Auth gate | Assume context | Policy as owned | **Enforce transport auth** | Observe session |
| DTO mapping | **Owns** | — | Shape transport | Map to OBJ-* |
| UI navigation | — | — | — | **Owns** |
| Persistence SoT | Via Domain ports | **Owns** | — | Disposable cache |

---

# 4. Use Case Orchestration

## 4.1 Definition

A **use case** is a PD-2.3 Command (or Query) fulfillment path, optionally spanning supporting Domains, still with one **primary** Domain owner.

## 4.2 Orchestration steps

```
1. Identify Command/Query (PD-2.3)
2. Resolve binding Kind + API (PD-2.4)
3. Resolve Primary + Supporting Domains (PD-2.5)
4. Select L4 service unit (§2.3)
5. Authorize via existing gates
6. Execute primary Domain capability
7. Execute supporting Domain calls if mapped
8. Compose response DTO
9. Return to API Edge → Frontend Adapter
```

## 4.3 Golden Path orchestration (service view)

| Path | Dominant service sequence |
|------|---------------------------|
| GP-01 | SVC-ACCESS → SVC-AGENT → SVC-INTELLIGENCE → SVC-PROJECT → SVC-AGENT → SVC-INTELLIGENCE → SVC-DOCUMENT |
| GP-01R | SVC-PROJECT → SVC-AGENT |
| GP-02 | SVC-ACCESS → SVC-KNOWLEDGE-INTAKE → SVC-AGENT → SVC-INTELLIGENCE → SVC-DOCUMENT |
| GP-03 | SVC-ACCESS → SVC-AGENT → SVC-INTELLIGENCE → SVC-EVOLUTION / SVC-DOCUMENT |
| GP-04 | SVC-OPS (+ SVC-EVOLUTION for governance) |

## 4.4 Orchestration rules

| Rule | Statement |
|------|-----------|
| OR-01 | Orchestration must not change primary Domain ownership |
| OR-02 | Supporting calls are explicit, ordered, and failure-scoped |
| OR-03 | Do not invent multi-Command “macro APIs” outside PD-2.4 |
| OR-04 | NAV/PREF use cases do not require L4 HTTP orchestration |
| OR-05 | Long-running generation (e.g. autopilot) follows existing job/run contracts — service does not fake sync Domain completion |

---

# 5. Command Handling

## 5.1 Command path

```
Command name + payload
  → API Edge authn/z
  → L4 Command handler
  → Validate transport/required fields (contract-level)
  → Primary Domain command/capability
  → Supporting Domain side effects (mapped only)
  → Persist via Domain ports
  → Return authoritative result / acknowledgment
```

## 5.2 Command catalogue → service (summary)

| Service | Commands (representative) |
|---------|---------------------------|
| SVC-ACCESS | `SignIn` |
| SVC-AGENT | `StartPlanning`, `WorkspaceInteract`, `GenerateTenderPackage` |
| SVC-INTELLIGENCE | `SubmitPlanningInputs`, `CaptureOpportunity`, `ContinueToBudget`, `OpenBudgetResult` (when mutating/calc), related review triggers per API semantics |
| SVC-KNOWLEDGE-INTAKE | `UploadTenderDocument`, `ConfirmRequirements`, `ProceedToRequirementReview` |
| SVC-DOCUMENT | `DownloadSolution`, `DownloadBudget`, `DownloadDocument`, `PreviewDocument` (side-effecting token/stream as existing) |
| SVC-EVOLUTION | `ShareSolution`, `ShareDocument` |
| SVC-PROJECT | `ContinueProject` (resume side effects as existing), project bootstrap assists |

Exact Primary Domain per Command remains PD-2.5.

## 5.3 Command handling rules

| Rule | Statement |
|------|-----------|
| CH-01 | Commands are authorized before Domain mutation |
| CH-02 | Handler does not commit UI navigation — frontend owns NAV after `API+NAV` |
| CH-03 | Success means Domain-accepted outcome, not “UI looked OK” |
| CH-04 | Idempotency follows existing API/Domain contracts |
| CH-05 | Draft data becomes Domain input only at Command acceptance |

---

# 6. Query Handling

## 6.1 Query path

```
Query name + selectors (ids, filters)
  → API Edge authn/z
  → L4 Query handler
  → Primary Domain read capability
  → Optional supporting reads (mapped)
  → Compose read DTO (no business mutation)
  → Return
```

## 6.2 Query catalogue → service (summary)

| Service | Queries (representative) |
|---------|--------------------------|
| SVC-ACCESS | Session observe via existing auth me (as bound) |
| SVC-PROJECT | `ListProjects`, `ViewProjectContext`, `OpenMyProjects` |
| SVC-KNOWLEDGE-INTAKE | `ViewProcessingStatus` |
| SVC-DOCUMENT | `BrowseDocumentCategories`, `OpenDocuments`, `OpenProjectDocuments`, review reads that are read-only per API |
| SVC-INTELLIGENCE | `ReviewSolution`, `ReviewBudget`, `ReviewProposalResult`, `OpenSolutionResult` when read-oriented |
| SVC-OPS | `ViewAdminDashboard`, `ViewOrganizations`, `ViewUsers`, `ViewUsage`, `ViewSecurity` |
| SVC-EVOLUTION | `ViewGovernance` |

When PD-2.4 binding performs calculation as part of “open/review”, classify by **existing API semantics** (PD-5.1 CQ guidance) — do not invent a second API.

## 6.3 Query handling rules

| Rule | Statement |
|------|-----------|
| QH-01 | Queries must not mutate Domain business state |
| QH-02 | Query handlers must not write “helpful” derived business fields Domains did not produce |
| QH-03 | Empty results are valid responses — not Errors |
| QH-04 | Ops queries remain scoped to authorized ops context |

---

# 7. Service-to-Domain Mapping

## 7.1 Primary map

| Service ID | Primary Domain | Supporting Domains (typical) |
|------------|----------------|------------------------------|
| SVC-ACCESS | M13 | — |
| SVC-PROJECT | M13 | M12 (workspace), M15 (continuity), M11 (visible knowledge cues) |
| SVC-KNOWLEDGE-INTAKE | M11 | M12 (processing drive), M13 (navigate/context), M14 (validation support) |
| SVC-DOCUMENT | M11 | M13 (project scope), M15 (share path separate Command) |
| SVC-AGENT | M12 | M13 (tenant/workspace bootstrap), M11 / M14 (pack inputs/outputs) |
| SVC-INTELLIGENCE | M14 | M11 (knowledge capture), M12 (agent-produced packs), M13 (navigation surfaces) |
| SVC-EVOLUTION | M15 | M11 (artifact reference), M13 (audit surface support) |
| SVC-OPS | M13 | M15 (governance oversight) |

## 7.2 Command → Primary Domain (ownership lock)

Service handlers **must** respect PD-2.5 primary ownership:

| Primary | Service bias |
|---------|--------------|
| M11 | SVC-KNOWLEDGE-INTAKE, SVC-DOCUMENT |
| M12 | SVC-AGENT |
| M13 | SVC-ACCESS, SVC-PROJECT, SVC-OPS |
| M14 | SVC-INTELLIGENCE |
| M15 | SVC-EVOLUTION |

## 7.3 Mapping rules

| Rule | Statement |
|------|-----------|
| SD-01 | Primary Domain always wins conflicts of authoritative outcome |
| SD-02 | Supporting Domain failure policy is explicit (fail Command vs degrade) per existing contract — not UI preference |
| SD-03 | Do not remap a Command’s primary Domain to “whichever service is convenient” |
| SD-04 | Runtime DOM-* calls execute under the mapped M owner |

---

# 8. Service-to-API Mapping

## 8.1 Route family → service

| Existing API family (PD-2.4) | Primary service |
|------------------------------|-----------------|
| `/api/auth/*` | SVC-ACCESS |
| `/api/project/*` | SVC-PROJECT |
| `/api/v80/tenant/run`, entitlements | SVC-AGENT / SVC-PROJECT (per Command) |
| `/api/v80/tender/intake`, `/api/tender/analyze` | SVC-KNOWLEDGE-INTAKE |
| `/api/v80/autopilot/job/run` | SVC-AGENT |
| `/api/v80/budget/calculate`, plan/proposal surfaces | SVC-INTELLIGENCE |
| `/api/v80/pdf`, `/api/v80/proposal-pdf/render` | SVC-DOCUMENT / SVC-INTELLIGENCE (review vs export per Command) |
| `/api/documents/*` | SVC-DOCUMENT |
| `/api/download-token` (share) | SVC-EVOLUTION |
| `/api/sales/signals` | SVC-INTELLIGENCE |
| `/api/enterprise-saas/*`, `/api/v80/ops/*` | SVC-OPS (+ SVC-EVOLUTION for governance audit) |

## 8.2 Binding Kind behavior in services

| Kind | Service behavior |
|------|------------------|
| `API` | Full Command/Query handling; return DTO |
| `API+NAV` | Same as API; navigation performed by frontend after success |
| `NEAREST` | Use documented nearest existing surface only |
| `NAV` / `PREF` | No L4 HTTP service path required |

## 8.3 Mapping rules

| Rule | Statement |
|------|-----------|
| SA-01 | Services consume existing routes only — no new routes |
| SA-02 | Prefer `/api/v80/*` when PD-2.4 marks preferred |
| SA-03 | One product Command binding → one primary service entrypoint |
| SA-04 | Do not aggregate unrelated PD-2.4 routes into a new facade Domain |

---

# 9. Error Handling Boundary

## 9.1 Error classes (service view)

| Class | Origin | Service action |
|-------|--------|----------------|
| AUTH_UNAUTH | Auth gate / session | Reject; no Domain mutation |
| AUTH_FORBIDDEN | Authz / ops policy | Reject; no privilege escalation |
| VALIDATION_CONTRACT | Required fields / schema | Reject before Domain when contract-invalid |
| DOMAIN_REJECT | Domain business rules | Propagate Domain decision |
| NOT_FOUND | Missing entity | Return empty/not-found per contract |
| CONFLICT / STATE | Domain state conflict | Propagate; no silent overwrite |
| DEPENDENCY | Supporting Domain/runtime failure | Apply mapped fail/degrade policy |
| UNAVAILABLE | Infra/runtime down | Safe unavailable envelope |

## 9.2 Ownership

| Concern | Owner |
|---------|-------|
| Decide business rejection | Domain |
| Map to API error envelope | Service / API Edge |
| User-language presentation | Frontend (PD-4.5/4.6) |
| Invent alternate Golden Path on error | **Forbidden** |

## 9.3 Error rules

| Rule | Statement |
|------|-----------|
| ER-01 | Services must not convert Domain rejection into fake success DTOs |
| ER-02 | Stack traces are not product API payloads |
| ER-03 | Partial multi-area ops queries fail per area when contracts allow — no cross-area fake success |
| ER-04 | Auth errors do not leak other tenants’ resource existence beyond safe messages |

---

# 10. Transaction Boundary

## 10.1 Definition

A **transaction boundary** is the consistency scope for a single Command’s durable effects.

## 10.2 Default policy

| Case | Boundary |
|------|----------|
| Single-Domain Command | One Domain persistence transaction/unit of work |
| Primary + supporting side effect | Primary commit is authoritative; supporting effects follow mapped saga/order of existing runtimes — **no new distributed transaction Domain** |
| Query | No write transaction |
| Long-running job (autopilot) | Job/run state per existing runtime; completion is asynchronous as contracted |
| Share + artifact reference | Evolution signal vs knowledge artifact remain separately owned |

## 10.3 Transaction rules

| Rule | Statement |
|------|-----------|
| TX-01 | Services do not open DB transactions that bypass Domain ports |
| TX-02 | No silent dual-write across M11–M15 stores |
| TX-03 | Compensating actions only if already part of existing Domain/runtime contracts |
| TX-04 | Frontend retries re-issue the same Command — services must remain safe per existing idempotency |
| TX-05 | Do not invent 2PC infrastructure as a new product Domain |

---

# 11. Release Gate

## Gate ID

`product-backend-service-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| SVA-OVER | Layer overview | L4 position + service catalogue defined |
| SVA-RESP | Responsibilities | May/must-not + matrix present |
| SVA-ORCH | Use case orchestration | Steps + Golden Path service sequences |
| SVA-CMD | Command handling | Path + rules |
| SVA-QRY | Query handling | Path + rules |
| SVA-DOM | Service↔Domain map | Primary/supporting + ownership lock |
| SVA-API | Service↔API map | Existing families only |
| SVA-ERR | Error boundary | Classes + ownership |
| SVA-TX | Transaction boundary | Default policy + rules |
| SVA-SCOPE | Upstream intact | PD-1…PD-5.1 / M11–M15 unmodified; no new Domains; single new file |

## Verdict

```
PD-5.2 Gate = PASS
  iff SVA-OVER ∧ SVA-RESP ∧ SVA-ORCH ∧ SVA-CMD ∧ SVA-QRY
    ∧ SVA-DOM ∧ SVA-API ∧ SVA-ERR ∧ SVA-TX ∧ SVA-SCOPE all PASS
```

---

# 12. Freeze Summary

```
SERVICE_ARCH_ID        = product-backend-service-architecture-v1
BACKEND_ARCH_REF       = product-backend-architecture-v1
SERVICE_UNITS          = SVC-ACCESS | PROJECT | KNOWLEDGE-INTAKE | DOCUMENT | AGENT | INTELLIGENCE | EVOLUTION | OPS
LAYER                  = L4 Application Services
DOMAINS                = M11–M15 only
APIS                   = PD-2.4 existing only
SERVICES_ARE_DOMAINS   = false
BACKEND_OWNS_LOGIC     = true (Domains authoritative; services orchestrate)
FRONTEND_CONSUMES_API  = true
NO_NEW_DOMAIN          = true
NO_NEW_API             = true
```

## Immutable statements

1. Services are not product Domains.  
2. Primary Domain ownership follows PD-2.5.  
3. No new Domains or APIs.  
4. Commands mutate via Domains; Queries do not.  
5. Errors and transactions respect Domain authority.

---

# 13. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-SVA-01 | Service layer overview + responsibilities defined | ✓ |
| AC-SVA-02 | Use case orchestration + Command/Query handling defined | ✓ |
| AC-SVA-03 | Service↔Domain and Service↔API mappings defined | ✓ |
| AC-SVA-04 | Error + transaction boundaries defined | ✓ |
| AC-SVA-05 | Release Gate + Freeze summary present | ✓ |
| AC-SVA-06 | M11–M15 only; no new Domains; Markdown only; upstream unmodified | ✓ |

## Verdict

```
PD-5.2 document PASS iff AC-SVA-01 … AC-SVA-06 PASS
```

---

# Document Statement

PD-5.2 Service Architecture locks how application services orchestrate frozen Domains.

```
API → L4 Service → M11–M15 (+ supports) → Persistence
Services orchestrate; Domains decide
Existing APIs only; no new Domains
Frontend consumes APIs only
```
