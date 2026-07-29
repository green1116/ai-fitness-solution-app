# PD-6.2 — Integration Contracts

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Integration Contracts

## Version

`product-delivery-pd-6.2-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-6.1 | Integration pipeline |
| PD-2.3 / PD-2.4 / PD-2.5 | Commands, APIs, Domains |
| PD-4.x / PD-5.x freezes | FE / BE baselines |
| PD-5.3 | API edge contract authority |

## Purpose

Define **integration contracts** between frozen frontend and backend layers: what each seam guarantees, how Commands/Queries and errors are exchanged, and how versions stay compatible.

**Reuse only** — existing routes and Domain contracts remain wire SoT.  
This document defines **integration rules**, not new schemas, Domains, or API families.

---

# 1. Contract Overview

## 1.1 Contract stack

```
C0  Product Intent Contract     INT-* / ACT-* / Command names (PD-2.3)
C1  Presentation Contract       OBJ-* props / ST-* (PD-3.1 / PD-4.3)
C2  Transport Contract          Existing HTTP APIs (PD-2.4 / PD-5.3)
C3  Application Contract        Service Command/Query handlers (PD-5.2)
C4  Domain Contract             M11–M15 capabilities (PD-5.1 / PD-2.5)
C5  Persistence Contract        Domain ports / STF-* (PD-5.4)
C6  Error Contract              Safe envelopes (PD-5.3 / PD-5.5 / PD-6.1)
C7  Compatibility Contract      Version / Kind rules (this doc §6)
```

## 1.2 Authority

| Contract aspect | Authority |
|-----------------|-----------|
| Field-level request/response bodies | **Existing** API implementations |
| Command names / Action IDs | PD-2.3 (frozen) |
| API family membership | PD-2.4 / PD-5.3 (closed) |
| Primary Domain per Command | PD-2.5 (frozen) |
| Integration seam rules | **This document** + PD-6.1 |

## 1.3 Contract principles

1. **Reuse only** — no new API families, Domains, or product Screens.  
2. **Preserve existing envelopes** — do not invent a breaking global DTO.  
3. **Intents up / data down** at UI; **Commands/Queries** at API.  
4. **Domain outcomes are authoritative** on success and reject.  
5. **Errors are typed classes**, not stack traces.  
6. **Compatibility prefers `/api/v80/*`** when PD-2.4 marks preferred.  
7. **NAV/PREF** are first-class non-HTTP contracts.

---

# 2. Layer Contracts

## 2.1 UI ↔ Adapter (C1)

| Guarantee | Rule |
|-----------|------|
| Inputs | Components emit INT-*; Screens own ACT-* |
| Outputs | Adapter supplies OBJ-*-ready view models + ST-META |
| Forbidden | Domain imports; business eligibility engines in UI |
| Auth observation | SES-* mirrors `/api/auth/me` only |

## 2.2 Adapter ↔ API Edge (C2)

| Guarantee | Rule |
|-----------|------|
| Binding | Only PD-2.4 Kind + route for that Command |
| Request | Opaque ids + existing payload fields; existing auth credential mechanism |
| Response | Existing success body/stream **or** safe error envelope |
| Forbidden | UI route tables in API; secrets in responses |

## 2.3 API Edge ↔ Service (C3)

| Guarantee | Rule |
|-----------|------|
| Context | Principal / tenant / session from authn (PD-5.5) |
| Dispatch | One Command/Query → one primary SVC-* entry (PD-5.2) |
| Forbidden | Bypass auth for “FE speed”; God-service Domain |

## 2.4 Service ↔ Domain (C4)

| Guarantee | Rule |
|-----------|------|
| Ownership | Primary Domain from PD-2.5; supports explicit only |
| Outcome | Accept / reject / not-found / conflict per Domain |
| Forbidden | Service inventing business policy outside Domain |

## 2.5 Domain ↔ Persistence (C5)

| Guarantee | Rule |
|-----------|------|
| SoT | Owner Domain store only |
| Scope | Tenant-scoped ports (PD-5.4 / PD-5.5) |
| Forbidden | Cross-Domain silent dual-write; FE direct DB |

## 2.6 Layer contract rules

| Rule | Statement |
|------|-----------|
| LC-01 | Each seam may only speak the contract of its adjacent layers |
| LC-02 | Lower layers must not depend on Screens/CMP IDs |
| LC-03 | Upper layers must not call persistence ports directly for product logic |

---

# 3. API Contracts

## 3.1 Closed family contract

Integration may call only these families (PD-5.3):

`FAM-AUTH | V80 | PROJECT | WORKSPACE | TENDER | DOCUMENTS | PDF | SALES | DOWNLOAD | OPS | PLAN`

## 3.2 Request contract (integration)

| Element | Contract |
|---------|----------|
| Identity | Existing session mechanism; no client-minted roles |
| Resource keys | Opaque `projectId` / `artifactId` / `jobId` / … |
| Uploads | Existing intake contract; untrusted until Domain accept |
| Pagination/filter/sort | Existing route params only (PD-5.3) |
| Idempotency | Only if already on existing route |

## 3.3 Response contract (integration)

| Element | Contract |
|---------|----------|
| JSON success | Preserve existing shape; map to OBJ-* in Adapter |
| Empty collection | HTTP success + empty list |
| Binary / PDF | Existing stream/redirect/token contracts |
| Meta | Optional paging/cursor only when existing |
| Logical fields | `ok`/`data`/`error`/`meta` when envelope already structured — do not break legacy shapes |

## 3.4 API contract rules

| Rule | Statement |
|------|-----------|
| AC-01 | No new routes/families for integration convenience |
| AC-02 | Prefer v80 twin when mapped |
| AC-03 | `API+NAV` does not return next UI path as Domain logic |
| AC-04 | Adapter must tolerate existing contracts — not redefine them |

---

# 4. Command / Query Contracts

## 4.1 Shared intent contract

| Field (logical) | Required | Notes |
|-----------------|----------|-------|
| `command` / `query` name | Yes | PD-2.3 Command name |
| `actionId` | Optional trace | ACT-* for correlation |
| `payload` | Per existing API | No invented eligibility flags |
| `context.projectId` etc. | When Screen cue requires | Opaque |

## 4.2 Command contract

| Clause | Statement |
|--------|-----------|
| Precondition | Authn/z satisfied when gate requires |
| Effect | May mutate Domain / side-effect per primary Domain |
| Success | Domain-accepted result DTO/ack/stream |
| Failure | Typed error; **no** partial silent commit beyond Domain transaction rules |
| FE after | Invalidate ST-SERVER as needed; NAV only if Kind `API+NAV` |

## 4.3 Query contract

| Clause | Statement |
|--------|-----------|
| Precondition | Authn/z when required |
| Effect | **No** business mutation |
| Success | Read DTO / empty collection / artifact metadata |
| Failure | Typed error |
| FE after | ST-SERVER update or META-EMPTY/ERROR |

## 4.4 Kind contract

| Kind | HTTP? | FE NAV? |
|------|-------|---------|
| `API` | Yes | No (unless FE chooses allowed edge later) |
| `API+NAV` | Yes | Yes — FE owns edge |
| `NEAREST` | Yes (nearest existing) | Per row |
| `NAV` | No | Yes |
| `PREF` | No (or existing pref surface) | No |

## 4.5 CQ rules

| Rule | Statement |
|------|-----------|
| CQ-01 | Name must match PD-2.3; binding must match PD-2.4 |
| CQ-02 | Primary Domain must match PD-2.5 |
| CQ-03 | Queries never write durable business state |
| CQ-04 | Commands never succeed without Domain accept |
| CQ-05 | Retry re-issues the **same** Command/Query |

---

# 5. Error Contracts

## 5.1 Error class contract

| Class | Typical meaning | FE must |
|-------|-----------------|---------|
| `UNAUTH` | No/invalid principal | Clear session presentation; Sign In |
| `EXPIRED` | Session no longer valid | Treat as UNAUTH |
| `FORBIDDEN` | Authenticated, not permitted | Safe denial; no privilege escalate |
| `VALIDATION` | Contract/payload invalid | Fix input; no ST-SERVER lie |
| `DOMAIN_REJECT` | Business reject | Show safe message |
| `NOT_FOUND` | Missing resource | Empty/not-found |
| `CONFLICT` | State conflict | Per existing contract |
| `UNAVAILABLE` | Dependency/infra | Retry / `/unavailable` |

Exact HTTP status codes follow **existing** APIs; classes are integration semantics.

## 5.2 Error payload contract (logical)

| Field | Required | Rule |
|-------|----------|------|
| `code` | When existing | Stable machine code |
| `message` | Yes (safe) | User-mappable; no secrets |
| `class` | Logical | One of §5.1 |
| `details` | Optional | Non-sensitive; no stacks |

## 5.3 Propagation contract

```
Domain/Auth/Runtime failure
  → Service classifies
  → API safe envelope
  → Adapter → META-ERROR (± SES clear)
  → User recovery intents only (retry / Sign In / allowed NAV)
```

## 5.4 Error rules

| Rule | Statement |
|------|-----------|
| EC-01 | Fail closed: UNAUTH/FORBIDDEN/EXPIRED ⇒ no business write |
| EC-02 | No stack traces or secret material to FE |
| EC-03 | No alternate Golden Path invention on error |
| EC-04 | Job “running” is status, not `UNAVAILABLE` |
| EC-05 | Do not invent `/forbidden` Feature Screen |

---

# 6. Version Compatibility

## 6.1 Compatibility axes

| Axis | Compatible when |
|------|-----------------|
| API family | Still within closed PD-5.3 set |
| Route generation | Prefer `/api/v80/*`; legacy secondary only if PD-2.4 allows |
| Command name | Unchanged PD-2.3 token |
| DTO additive fields | FE Adapter ignores unknown fields safely |
| DTO removal/rename | Requires Product Delivery revision — not silent FE guess |
| Domain primary | Unchanged PD-2.5 owner |
| FE baseline | Consumes same Commands/APIs; no new surfaces required |

## 6.2 Compatibility rules

| Rule | Statement |
|------|-----------|
| VC-01 | Do not introduce `/api/v81/*` (or new family) under this freeze for cleanup |
| VC-02 | Breaking wire changes need explicit revision of bindings — not Adapter hacks that invent Domains |
| VC-03 | FE and BE may deploy on different ART-* revisions only if CQ/API contracts remain compatible (PD-5.7) |
| VC-04 | Canary/rollback must preserve authz and tenant contracts (PD-5.5) |
| VC-05 | Unknown error codes map to safe generic failure — not Domain policy invention |

## 6.3 Compatibility matrix (integration)

| FE change | BE change | Allowed? |
|-----------|-----------|----------|
| Presentation-only | None | Yes |
| New ACT/Command | New API family | **No** |
| Same Command | Additive response fields | Yes (ignore-unknown) |
| Same Command | Remove required field FE depends on | **No** without revision |
| Same Screen | Domain primary remapped silently | **No** |

---

# 7. Release Gate

## Gate ID

`product-integration-contracts-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| CTC-OVER | Contract overview | C0…C7 stack + authority |
| CTC-LAYER | Layer contracts | UI↔API↔Service↔Domain↔Persistence seams |
| CTC-API | API contracts | Closed families + REQ/RES rules |
| CTC-CQ | Command/Query contracts | Kind + CQ rules |
| CTC-ERR | Error contracts | Classes + payload + propagation |
| CTC-VER | Version compatibility | Axes + VC rules + matrix |
| CTC-SCOPE | Reuse only / upstream intact | No new Domains/APIs/schemas invented; PD-1…PD-6.1 / M11–M15 unmodified; single new file |

## Verdict

```
PD-6.2 Gate = PASS
  iff CTC-OVER ∧ CTC-LAYER ∧ CTC-API ∧ CTC-CQ
    ∧ CTC-ERR ∧ CTC-VER ∧ CTC-SCOPE all PASS
```

---

# 8. Freeze Summary

```
INTEGRATION_CONTRACTS_ID = product-integration-contracts-v1
INTEGRATION_ARCH_REF     = product-integration-architecture-v1
WIRE_SOT                 = existing API implementations
COMMAND_SOT              = PD-2.3
DOMAIN_SOT               = PD-2.5 / M11–M15
API_FAMILIES             = closed (PD-5.3)
ERROR_CLASSES            = UNAUTH|EXPIRED|FORBIDDEN|VALIDATION|DOMAIN_REJECT|NOT_FOUND|CONFLICT|UNAVAILABLE
COMPAT                   = prefer v80; additive-tolerant; no new families
REUSE_ONLY               = true
NO_NEW_DOMAIN            = true
NO_NEW_API_FAMILY        = true
```

## Immutable statements

1. Contracts reuse frozen FE/BE/API/Domain inventories only.  
2. No new wire schemas that orphan PD-2.4 bindings.  
3. Command/Query names and primary Domains stay frozen maps.  
4. Errors remain safe, classified, fail-closed on writes.  
5. Upstream PD-1…PD-6.1 and M11–M15 unmodified by this task.

---

# 9. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-CTC-01 | Contract overview + layer contracts defined | ✓ |
| AC-CTC-02 | API + Command/Query contracts defined | ✓ |
| AC-CTC-03 | Error + version compatibility defined | ✓ |
| AC-CTC-04 | Release Gate + Freeze summary present | ✓ |
| AC-CTC-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.2 document PASS iff AC-CTC-01 … AC-CTC-05 PASS
```

---

# Document Statement

PD-6.2 Integration Contracts locks the seam guarantees between frozen UI and backend.

```
Intent → Transport (existing APIs) → Service → Domain
Commands mutate · Queries read · Errors classify safely
Prefer v80 · No new Domains/API families · Reuse only
```
