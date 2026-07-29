# PD-4.5 — Frontend Data Flow

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Frontend Data Flow

## Version

`product-delivery-pd-4.5-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.3 User Action Map | ACT-* / Command catalogue |
| PD-2.4 API Mapping | Existing API + binding kinds |
| PD-2.5 Domain Mapping | M11–M15 ownership |
| PD-3.1 … PD-3.8 | Objects, Screens, UI freeze |
| PD-4.1 … PD-4.4 | Architecture, routes, state, components |

## Purpose

Define **data flow from UI to existing API and back**, including **request/response boundaries** and **flow ownership**.

Frontend presents Objects and issues Commands.  
**Source of truth** remains existing Domains via existing APIs.  
Frontend **owns no business logic**.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Canonical pipeline | UI → Action → Adapter → Existing API → Response |
| Read flow | Fetch / observe server data for display |
| Command flow | Mutating / side-effect Commands |
| Error flow | Failure presentation + retry ownership |
| Loading / empty flow | ST-META ownership during fetch |
| Validation boundary | What UI may check vs Domain |
| Transformation boundary | Adapter mapping limits |
| Data ownership | Who owns each payload stage |
| Flow freeze summary | Locked rules |
| Release Gate | Data-flow readiness |

## Out of scope

| Item | Reason |
|------|--------|
| New APIs / request-response schemas | Forbidden — consume existing contracts |
| Transport library choice (fetch/axios/etc.) | Implementation |
| Domain algorithms / retry policy engines | Domain-owned |
| Modification of PD-1…PD-3, PD-4.1–4.4, M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Data Flow Principles

1. **One pipeline** — every Domain-touching path uses UI → Action → Adapter → Existing API → Response.  
2. **Existing APIs only** — bindings from PD-2.4; prefer `/api/v80/*` when marked.  
3. **No business logic in UI or Adapter** — map shapes for presentation; Domains decide.  
4. **NAV / PREF are first-class** — not forced into fake HTTP.  
5. **Objects in, intents out** — responses become OBJ-* view models; UI emits ACT-* / Commands.  
6. **ST-META is UI-owned** — loading / error / empty never become Domain redesign.  
7. **Validation is presentation-only** until Domain confirms.  
8. **Technology-agnostic** — ownership rules, not client libraries.

---

# 3. Canonical Pipeline

```
User Interaction (INT-*)
        ↓
Component intent (PD-4.4)
        ↓
Screen Action (ACT-*)          ← Screen owns
        ↓
Command (PD-2.3)               ← named intent
        ↓
UI Adapter                     ← map only; no business logic
        ↓
Existing API (PD-2.4)          ← if Kind requires HTTP
        ↓
Existing Domain (PD-2.5)       ← M11–M15 / mapped DOM-*
        ↓
API Response (existing contract)
        ↓
UI Adapter → OBJ-* / ST-SERVER / ST-META
        ↓
Screen re-render and/or Navigation (PD-4.2)
```

## Stage ownership

| Stage | Owner | Responsibility | Must not |
|-------|-------|----------------|----------|
| INT-* | Component | Emit presentation intent | Call APIs |
| ACT-* | Screen | Bind intent → Command | Implement Domain rules |
| Command | Planning map (PD-2.3) | Stable name for capability | Invent new Commands here |
| UI Adapter | Frontend delivery | Serialize request view → API; map response → Objects | Recompute Domain outcomes |
| Existing API | Backend contract | Transport + auth surface | Be redefined by frontend docs |
| Existing Domain | M11–M15 / DOM-* | Business truth | Live inside UI stores |
| Response mapping | UI Adapter | Display-ready ST-SERVER + ST-DERIVED inputs | Invent fields Domains did not return |
| Navigation | Router (PD-4.2) | Allowed edges only | Substitute for required API Commands |

## Pipeline rules

| Rule | Statement |
|------|-----------|
| P-01 | L1–L4 components never skip Screen Action to call Adapter/API |
| P-02 | Adapter never selects “which Domain algorithm” beyond PD-2.4 binding |
| P-03 | Successful Domain mutation updates ST-SERVER only after response mapping |
| P-04 | Failed calls update ST-META error; they must not write fake success Objects |

---

# 4. Read Flow

## 4.1 Definition

**Read flow** loads or refreshes presentation data without intending a Domain mutation Command (or after invalidation triggers a refetch).

## 4.2 Steps

```
Screen mount / cue change / invalidation
  → Screen sets META-LOADING = loading
  → Adapter issues GET/observe against existing read API (PD-2.4)
  → Domain returns existing contract
  → Adapter maps → ST-SERVER (+ optional ST-DERIVED)
  → META-LOADING = success | META-EMPTY if no rows / no artifact
  → Screen renders CMP-* with props
```

## 4.3 Read catalogue (by Screen)

| Screen | Typical read targets | Result state |
|--------|----------------------|--------------|
| SCR-01 | Optional session observe (auth me) | ST-SESSION |
| SCR-02 / SCR-03 | Project cue / intake status if resuming | ST-SERVER + ST-CONTEXT |
| SCR-04 | Workspace summary / task / context | ST-SERVER |
| SCR-05 / SCR-06 | Solution / Budget result Objects | ST-SERVER |
| SCR-07 | Project list | ST-SERVER |
| SCR-08 | Documents by category | ST-SERVER |
| SCR-09 | Ops area observations | ST-SERVER |

## 4.4 Read rules

| Rule | Statement |
|------|-----------|
| R-01 | Reads use existing APIs only — no client-fabricated Domain snapshots |
| R-02 | Read failures are ST-META errors with optional retry (same read) |
| R-03 | Empty list/result is META-EMPTY + guidance — not invented placeholder business data |
| R-04 | Read flow must not mutate Domain |

---

# 5. Command Flow

## 5.1 Definition

**Command flow** issues a PD-2.3 Command that may mutate Domain state or trigger side effects (generate, upload, download, share, sign-in, etc.).

## 5.2 Steps (HTTP kinds: `API` / `API+NAV` / `NEAREST`)

```
INT-* → ACT-* → Command
  → Screen sets META-LOADING (command-scoped)
  → Adapter maps draft/view inputs → existing request contract
  → Existing API invoked
  → Domain executes
  → Response mapped → ST-SERVER update and/or download/share presentation
  → Invalidate related caches (PD-4.3)
  → If Kind includes NAV: navigate allowed edge (PD-4.2)
  → META-LOADING = success | META-ERROR on failure
```

## 5.3 Steps (non-HTTP kinds: `NAV` / `PREF`)

```
INT-* → ACT-* → Command (NAV or PREF)
  → No Domain HTTP (unless PREF already has an existing preference surface)
  → Router or preference presentation applies
  → ST-SHARED / ST-CONTEXT / language cue updates
  → No fake API body invented
```

## 5.4 Binding-kind behavior

| Kind | Request | Response handling |
|------|---------|-------------------|
| `API` | Call existing route | Map to Objects; stay or refresh Screen |
| `API+NAV` | Call existing route | Map Objects; then navigate allowed next Screen |
| `NAV` | None | Route change only |
| `PREF` | Existing preference surface if any | Presentation preference only |
| `NEAREST` | Documented nearest existing surface | Same as API; do not invent exact route |

## 5.5 Command rules

| Rule | Statement |
|------|-----------|
| C-01 | Every mutating path maps to a PD-2.3 Command bound in PD-2.4 |
| C-02 | Draft ST-LOCAL becomes request payload only at Command issue time |
| C-03 | Optimistic Domain writes are forbidden — wait for response (or documented existing contract behavior) |
| C-04 | Download/Share treat binary/link presentation as response mapping — not new Domains |
| C-05 | Command success must not invent Objects absent from response / subsequent read |

---

# 6. Error Flow

## 6.1 Definition

Any failure in Adapter transport, API status, or unusable response for presentation.

## 6.2 Steps

```
Failure detected (network / HTTP error / unusable payload)
  → Adapter surfaces structured failure to Screen (no Domain redesign)
  → META-ERROR = user-language message (+ optional retry intent)
  → META-LOADING = idle / failed
  → ST-SERVER left unchanged or cleared only if Screen policy says “unsafe to show stale”
  → User may: Retry (same Command/read) | Navigate safe back edge | Dismiss
```

## 6.3 Error ownership

| Concern | Owner |
|---------|-------|
| Detect transport/API failure | Adapter + Screen |
| User-visible copy | Frontend (PD-3.7 language) |
| Business rejection reason codes | Existing API surface (mapped, not invented) |
| Retry policy | Re-issue same Command/read only |
| Domain compensation / rollback | Domain — not UI |

## 6.4 Error rules

| Rule | Statement |
|------|-----------|
| E-01 | Do not show engine stack traces as primary UX |
| E-02 | Do not invent alternate Golden Paths on error |
| E-03 | Auth failure may clear ST-SESSION and route to allowed entry — not custom auth Domain |
| E-04 | Partial multi-call Screens fail per-area where PD-3 defines (e.g. SCR-09) — no cross-area fake success |

---

# 7. Loading / Empty Flow

## 7.1 Loading flow

```
Start read or Command
  → META-LOADING = loading
  → CMP-* may show processing / disabled primary controls (PD-3.5)
  → On settle: META-LOADING = success | failed
```

| Rule | Statement |
|------|-----------|
| L-01 | Loading is ST-META — not a Domain progress engine (except when Object already exposes status, e.g. tender processing Object) |
| L-02 | Primary path must not appear silently dead while loading |
| L-03 | Nested loads (list vs detail) may use scoped meta keys — still UI-owned |

## 7.2 Empty flow

```
Successful read with no presentable rows / artifacts
  → META-EMPTY = true
  → Guidance targets allowed routes only (PD-4.2)
  → No placeholder business inventing (fake projects, fake budgets)
```

| Rule | Statement |
|------|-----------|
| M-01 | Empty ≠ error |
| M-02 | Empty guidance must not unlock Features outside UI freeze |
| M-03 | Intake empty drafts are ST-LOCAL, not META-EMPTY for server lists |

---

# 8. Validation Boundary

## 8.1 What UI may validate (presentation)

| Allowed check | Purpose |
|---------------|---------|
| Required field non-empty before enabling Forward | UX readiness (DER-FORWARD-ENABLED) |
| File selected before upload Command | Prevent empty Command spam |
| Max length / format hints for inputs | Client ergonomics only |
| Route param presence (`projectId`) | Guard presentation (PD-4.2) |

## 8.2 What UI must not validate

| Forbidden | Owner |
|-----------|-------|
| Feasibility / pricing / compliance / entitlement decisions | Domain |
| Tender parse quality / extraction completeness rules | Domain |
| Budget correctness / ROI business rules | Domain |
| Cross-tenant authorization | Domain / auth API |
| Invented “business-ready” gates beyond presentation | — |

## 8.3 Validation rules

| Rule | Statement |
|------|-----------|
| V-01 | UI validation failures never write ST-SERVER |
| V-02 | Domain may still reject a Command that passed UI checks — treat as Error flow |
| V-03 | Disabling a control is not Domain approval |

---

# 9. Transformation Boundary

## 9.1 Adapter may transform

| Transform | Example |
|-----------|---------|
| Field rename / pick for OBJ-* view models | API project name → display label |
| List → row props for CMP-PROJECT-ROW | id, name cue, continue affordance |
| Status enum → user-facing status text | Processing Object → CMP-STATUS-PROCESS |
| Binary/link response → download affordance | Artifact action presentation |
| Error payload → META-ERROR message | Map known codes to copy |

## 9.2 Adapter must not transform

| Forbidden transform | Why |
|---------------------|-----|
| Recompute totals / scores / eligibility | Business logic |
| Merge multi-Domain policies into new truth | Shadow Domain |
| Invent missing Objects when API returns empty | Lies to user |
| Change Command target Domain based on UI heuristics | Bypass PD-2.4 |
| Normalize into new API schemas | Schemas owned elsewhere |

## 9.3 Transformation rules

| Rule | Statement |
|------|-----------|
| T-01 | Transformation is lossless w.r.t. user-visible Domain meaning — no silent “fixes” |
| T-02 | ST-DERIVED runs after Adapter mapping; still pure presentation |
| T-03 | Request mapping sends only fields required by existing contract — no extra business payloads |

---

# 10. Data Ownership

## 10.1 Ownership by payload stage

| Data | Owner | Class |
|------|-------|-------|
| Draft inputs before submit | Frontend | ST-LOCAL |
| Project / result / document entities | Domain via API | ST-SERVER |
| Display projections (sort/filter/label) | Frontend | ST-DERIVED |
| Loading / error / empty flags | Frontend | ST-META |
| Auth observation | Auth API + Frontend presentation | ST-SESSION |
| `projectId` / route cues | Router + Frontend | ST-CONTEXT |
| Request wire payload | Adapter (ephemeral) | Not stored as Domain |
| Response wire payload | Adapter (ephemeral) → mapped ST-SERVER | Domain truth remains server |

## 10.2 Ownership rules

| Rule | Statement |
|------|-----------|
| O-01 | Frontend never claims write-ownership of Domain entities |
| O-02 | Cache of ST-SERVER is a disposable snapshot (PD-4.3) |
| O-03 | Components receive owned view props — they do not own fetch lifecycle |
| O-04 | Screens own Action issuance; Adapter owns wire mapping; Domains own truth |

---

# 11. End-to-End Flow Matrix (Golden Paths)

| Path | Dominant read | Dominant Commands | Nav after |
|------|---------------|-------------------|-----------|
| GP-01 | Workspace / Solution / Budget / Docs | Planning submit, generate, download | Intake → Workspace → Results → Documents |
| GP-01R | Project list → Workspace | Continue project | Projects → Workspace |
| GP-02 | Tender status → Solution / Docs | Upload, confirm/generate, download | Tender → Workspace/Results → Documents |
| GP-03 | Workspace / proposal / budget | Opportunity capture, share/download | Workspace → Results |
| GP-04 | Ops areas | Observe / refresh ops reads | Stay on Admin |

All chains reuse PD-2.4 bindings only.

---

# 12. Flow Freeze Summary

```
DATA_FLOW_ID            = product-frontend-data-flow-v1
PIPELINE                = UI → Action → Adapter → Existing API → Response
READ_FLOW               = defined
COMMAND_FLOW            = defined (API / API+NAV / NAV / PREF / NEAREST)
ERROR_FLOW              = ST-META owned
LOADING_EMPTY_FLOW      = ST-META owned
VALIDATION_BOUNDARY     = presentation-only
TRANSFORMATION_BOUNDARY   = map Objects; no business logic
DATA_OWNERSHIP          = Domain SoT; UI presentation only
NO_NEW_API              = true
NO_BUSINESS_LOGIC       = true
```

## Immutable prohibitions

1. No new API routes or Domain modules from frontend data flow.  
2. No shadow Domain in client stores.  
3. No business validation or transformation in UI/Adapter.  
4. No bypass of Screen Action for Domain-touching calls.  
5. No modification of PD-2.3 / PD-2.4 meanings under this freeze.

---

# 13. Release Gate

## Gate ID

`product-frontend-data-flow-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| DF-PIPE | Canonical pipeline | UI → Action → Adapter → Existing API → Response defined with ownership |
| DF-READ | Read flow | Steps + rules + Screen read targets |
| DF-CMD | Command flow | HTTP and non-HTTP kinds; Command rules |
| DF-ERR | Error flow | META-ERROR + retry same Command/read |
| DF-META | Loading / empty | ST-META ownership rules |
| DF-VAL | Validation boundary | UI presentation vs Domain decision split |
| DF-XFORM | Transformation boundary | Adapter map-only limits |
| DF-OWN | Data ownership | Domain SoT; stage ownership table |
| DF-SCOPE | Upstream intact | PD-1…3 / PD-4.1–4.4 / M11–M15 unmodified; single new file only |

## Verdict

```
PD-4.5 Gate = PASS
  iff DF-PIPE ∧ DF-READ ∧ DF-CMD ∧ DF-ERR ∧ DF-META
    ∧ DF-VAL ∧ DF-XFORM ∧ DF-OWN ∧ DF-SCOPE all PASS
```

---

# 14. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-DF-01 | Canonical UI→API→Response pipeline defined | ✓ |
| AC-DF-02 | Read, Command, Error, Loading/Empty flows defined | ✓ |
| AC-DF-03 | Validation + transformation boundaries defined | ✓ |
| AC-DF-04 | Data ownership + freeze summary + Release Gate present | ✓ |
| AC-DF-05 | Frontend owns no business logic; existing Domains/APIs only | ✓ |
| AC-DF-06 | Markdown only; no additional files; upstream unmodified | ✓ |

## Verdict

```
PD-4.5 document PASS iff AC-DF-01 … AC-DF-06 PASS
```

---

# Document Statement

PD-4.5 Frontend Data Flow locks how presentation talks to existing capabilities.

```
INT-* → ACT-* → Command → Adapter → Existing API → Domain
Response → Adapter → OBJ-* / ST-SERVER → Screen
Errors / loading / empty → ST-META (UI-owned)
Validation & transform → presentation only
Domain remains source of truth
```
