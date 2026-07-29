# PD-5.4 — Persistence Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Persistence Architecture

## Version

`product-delivery-pd-5.4-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.5 / M11–M15 | Domain ownership of durable outcomes |
| PD-3.1 | OBJ-* presentation objects (not DB entities) |
| PD-4.3 / PD-4.5 | Frontend disposable cache vs Domain SoT |
| PD-5.1 / PD-5.2 / PD-5.3 | L1 ports, transactions, API edge |

## Purpose

Define **persistence ownership**, **storage boundaries**, **repository mapping**, and **data durability rules** for backend architecture.

Domain persistence is the **source of truth** for business entities.  
Frontend ST-* caches are **disposable** and not persistence.  
**No new Domains.** **No new storage families.**  
Backend owns business logic; frontend consumes APIs only.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Persistence layer overview | L1 position + storage families |
| Data ownership | M11–M15 durable classes |
| Repository boundary | Ports vs services vs API |
| Entity / table mapping | Logical persistence map (not DDL invention) |
| Read / write paths | Query vs Command durability |
| Transaction boundary | Consistency scopes |
| Migration / schema boundary | Who may change schemas |
| Cache / snapshot boundary | Disposable vs durable |
| Retention / durability | Keep / purge / artifact rules |
| Release Gate | Readiness |
| Freeze summary | Lock points |

## Out of scope

| Item | Reason |
|------|--------|
| Choosing Postgres/SQLite/S3 vendors as product Domains | Engine choice ≠ new storage family; not prescribed as Domain redesign |
| Full DDL / migration scripts | Implementation; boundary only here |
| Frontend state stores as SoT | Forbidden |
| New Domains or new storage families | Forbidden |
| Modification of PD-1…PD-5.3 or M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Persistence Layer Overview

## 2.1 Position

```
L5  API Edge
L4  Application Services
L3  Domain Capabilities (M11–M15)
L2  Domain Runtime Adapters (DOM-* / existing libs)
L1  Persistence Ports + Stores   ← THIS DOCUMENT
```

## 2.2 Persistence shape

```
Command / Query
  → Service (L4)
    → Domain capability (L3)
      → Persistence Port (L1)
        → Existing Storage Family
```

L5/L4 must **not** open storage engines directly for product business writes.

## 2.3 Existing storage families (closed set)

Storage families are **existing infrastructure classes** already used by Domains/runtimes — not new product Domains.

| Family ID | Kind | Typical use | Owning Domains (logical) |
|-----------|------|-------------|--------------------------|
| STF-RELATIONAL | Relational / structured records | Projects, users, opportunities, catalogs, ops rows | M13 primary; M11/M14/M15 records as owned |
| STF-DOCUMENT | Document / JSON document stores (if already used) | Flexible Domain records | Owning Domain only |
| STF-OBJECT | Object / blob artifact bytes | PDFs, uploads, export binaries | M11 (+ delivery paths) |
| STF-JOB | Job / run state stores | Autopilot / agent orchestration state | M12 |
| STF-SESSION | Session / credential stores | Auth sessions | M13 / DOM-AUTH |
| STF-AUDIT | Audit / governance logs | Ops audit, evolution governance | M13 / M15 |
| STF-CACHE-BE | Backend ephemeral cache | Read acceleration only | Non-SoT; Domain-scoped |

**No new storage families** under this architecture.

## 2.4 Overview rules

| Rule | Statement |
|------|-----------|
| PO-01 | Every durable business write has exactly one primary Domain owner |
| PO-02 | Storage family ≠ Domain — families are infrastructure classes |
| PO-03 | Frontend never writes Domain stores |
| PO-04 | API Edge does not own databases (PD-5.1 PER-03) |

---

# 3. Data Ownership

## 3.1 Durable data classes

| Data class ID | Content | Primary Domain | Supporting |
|---------------|---------|----------------|------------|
| DATA-KNOWLEDGE | Tender intake, requirements knowledge, document catalog entries, artifact metadata | **M11** | M13 (project scope), M12 (processing drive) |
| DATA-ARTIFACT-BYTES | Plan/budget/proposal/tender file bytes | **M11** | M14 (review producers), M15 (share references) |
| DATA-AGENT-RUN | Agent/autopilot job runs, orchestration progress | **M12** | M11/M14 inputs/outputs refs |
| DATA-OS-PLATFORM | Tenants, users, projects, workspace cues, entitlements presentation sources | **M13** | M15 continuity signals |
| DATA-SESSION | Auth session records | **M13** | — |
| DATA-OPS | Admin metrics snapshots sources, org/user ops configs | **M13** | M15 usage-as-feedback |
| DATA-INTELLIGENCE | Solution/budget/proposal analysis outcomes, opportunity records | **M14** | M11 knowledge refs, M12 packs |
| DATA-EVOLUTION | Share/feedback signals, governance oversight records | **M15** | M11 artifact refs, M13 audit surfaces |
| DATA-UI-CACHE | ST-SERVER display snapshots | **Frontend** (non-durable SoT) | — |

## 3.2 Ownership rules

| Rule | Statement |
|------|-----------|
| OWN-01 | Primary Domain owns create/update/delete semantics for its data class |
| OWN-02 | Supporting Domains may reference foreign opaque ids — not silently rewrite foreign rows |
| OWN-03 | OBJ-* are presentation projections — not table definitions |
| OWN-04 | Secrets persist only in STF-SESSION / existing auth mechanisms |
| OWN-05 | Cross-Domain copies require mapped Command semantics (PD-2.5) |

---

# 4. Repository Boundary

## 4.1 Definition

A **repository / persistence port** is the Domain-facing interface to a storage family.  
Repositories belong to **Domains** (via L1 ports), not to the API Edge or frontend.

## 4.2 Repository catalogue (logical)

| Repository ID | Owner Domain | Storage families | Serves |
|---------------|--------------|------------------|--------|
| REPO-KNOWLEDGE | M11 | STF-RELATIONAL / DOCUMENT | Intake, requirements, catalog |
| REPO-ARTIFACT | M11 | STF-OBJECT (+ metadata relational) | Upload/export bytes |
| REPO-AGENT-RUN | M12 | STF-JOB | Generate / workspace jobs |
| REPO-PROJECT | M13 | STF-RELATIONAL | Project list/detail |
| REPO-TENANT-USER | M13 | STF-RELATIONAL | Tenant/user/ops configs |
| REPO-SESSION | M13 | STF-SESSION | Auth sessions |
| REPO-INTELLIGENCE | M14 | STF-RELATIONAL / DOCUMENT | Analyses, opportunities |
| REPO-EVOLUTION | M15 | STF-RELATIONAL / AUDIT | Share, feedback, governance |
| REPO-OPS-AUDIT | M13 (+ M15 read paths) | STF-AUDIT / RELATIONAL | Ops governance surfaces |

These IDs are **logical ports** — they do not create new Domains or new storage families.

## 4.3 Boundary rules

| Rule | Statement |
|------|-----------|
| RB-01 | Services call Domain capabilities → ports; services do not embed SQL/blob SDKs for product logic |
| RB-02 | One repository has one owning Domain |
| RB-03 | Repositories must not expose UI route or CMP concepts |
| RB-04 | Runtime DOM-* adapters may implement ports — ownership remains M11–M15 |
| RB-05 | No shared “global repository” that becomes M16 in practice |

---

# 5. Entity / Table Mapping

## 5.1 Mapping authority

| Layer | Authority |
|-------|-----------|
| Physical tables / collections / buckets | **Existing** Domain/runtime schemas |
| Logical entity ownership | **This document** + PD-2.5 |
| Presentation Objects OBJ-* | PD-3.1 (not persistence entities) |

This document does **not** invent new physical schemas.

## 5.2 Logical entity map

| Logical entity | Data class | Owner | Typical UI Objects (presentation) |
|----------------|------------|-------|-----------------------------------|
| KnowledgeDocument / TenderSource | DATA-KNOWLEDGE | M11 | Tender/requirement related OBJ-* |
| ArtifactObject | DATA-ARTIFACT-BYTES | M11 | Solution/Budget/Document artifacts |
| DocumentCatalogEntry | DATA-KNOWLEDGE | M11 | Library items/categories |
| AgentJobRun | DATA-AGENT-RUN | M12 | Processing/generation status cues |
| Project | DATA-OS-PLATFORM | M13 | OBJ project identity |
| Tenant / User | DATA-OS-PLATFORM | M13 | Access / admin |
| Session | DATA-SESSION | M13 | SES-* observation source |
| IntelligenceResult (solution/budget/proposal) | DATA-INTELLIGENCE | M14 | Result summary/blocks/overview |
| OpportunitySignal | DATA-INTELLIGENCE | M14 | Sales capture outcomes |
| ShareFeedbackSignal | DATA-EVOLUTION | M15 | Share actions |
| GovernanceAuditRecord | DATA-EVOLUTION / OPS | M15 / M13 | Admin governance |

## 5.3 Mapping rules

| Rule | Statement |
|------|-----------|
| ET-01 | Do not create parallel tables “for frontend” that duplicate Domain entities |
| ET-02 | Do not rename physical schemas solely to match UI labels |
| ET-03 | Foreign keys / references use opaque ids across Domains |
| ET-04 | No new entity family outside M11–M15 ownership |
| ET-05 | Table-per-Screen modeling is forbidden |

---

# 6. Read / Write Paths

## 6.1 Write path (Command)

```
Command (PD-2.3)
  → API (PD-5.3) → Service (PD-5.2)
    → Primary Domain validates business rules
      → Repository write(s) in owner store
      → Supporting Domain writes only if mapped
  → Authoritative result returned
Frontend may invalidate ST-SERVER cache (PD-4.3) — not a DB write
```

## 6.2 Read path (Query)

```
Query
  → API → Service → Domain read capability
    → Repository read (owner store)
    → Optional compose from supporting reads (references only)
  → DTO to frontend
Frontend may keep disposable ST-SERVER snapshot
```

## 6.3 Path rules

| Rule | Statement |
|------|-----------|
| RW-01 | Queries must not write durable business state |
| RW-02 | Writes occur only after Domain acceptance |
| RW-03 | Read-your-writes within a Command response follows Domain/transaction rules |
| RW-04 | Artifact byte reads stream from STF-OBJECT via existing PDF/download APIs |
| RW-05 | Backend STF-CACHE-BE may serve reads but must not diverge as SoT |

---

# 7. Transaction Boundary

## 7.1 Default scopes (aligned with PD-5.2)

| Case | Persistence transaction |
|------|-------------------------|
| Single-Domain Command | Single owner Unit of Work across that Domain’s repositories |
| Primary + supporting side effect | Primary commit authoritative; supporting follows mapped order/existing saga — **no new 2PC Domain** |
| Agent long-running job | Job state transitions in STF-JOB; completion asynchronous per existing contract |
| Share referencing artifact | Evolution signal write ≠ rewriting artifact bytes ownership |
| Query | No write transaction |

## 7.2 Transaction rules

| Rule | Statement |
|------|-----------|
| TX-01 | Transactions open through Domain ports — not API Edge |
| TX-02 | No silent dual-write across Domain stores |
| TX-03 | Compensations only when existing Domain/runtime contracts define them |
| TX-04 | Idempotent Command retries must not corrupt durable state beyond existing guarantees |
| TX-05 | Frontend retries are re-issued Commands — not client DB access |

---

# 8. Migration / Schema Boundary

## 8.1 Ownership

| Change type | Owner | Forbidden |
|-------------|-------|-----------|
| Schema evolution for a Domain store | Owning Domain / its runtime adapters | Other Domains rewriting foreign schemas |
| Additive migration for existing family | Delivery under Domain ownership | Inventing a new storage family “to avoid migration” |
| API DTO change | Existing API contract process (PD-5.3) | Forcing UI schema into DB |
| Presentation-only field | Frontend Adapter | Persisting UI-only fields as Domain SoT |

## 8.2 Migration rules

| Rule | Statement |
|------|-----------|
| MG-01 | Migrations must not create M16+ or new storage families |
| MG-02 | Cross-Domain schema coupling requires explicit mapped Command ownership — prefer references over shared mutable tables |
| MG-03 | Destructive migrations require Product Delivery revision beyond silent hotfix of ownership |
| MG-04 | This architecture doc does not ship migration files |

---

# 9. Cache / Snapshot Boundary

## 9.1 Cache classes

| Class | Location | Durable SoT? | Rule |
|-------|----------|--------------|------|
| FE ST-SERVER | Frontend | **No** | Disposable display snapshot (PD-4.3) |
| FE ST-LOCAL/SHARED | Frontend | **No** | Ephemeral UI |
| STF-CACHE-BE | Backend | **No** | Optional read acceleration; invalidate on Command |
| Domain rollback snapshots (baseline docs) | Planning/freeze artifacts | N/A | Not runtime product DB |
| Artifact object versions | STF-OBJECT under M11 | **Yes** (as artifacts) | Versioning per existing artifact contracts |

## 9.2 Snapshot rules

| Rule | Statement |
|------|-----------|
| CS-01 | Caches must prefer refetch over inventing values |
| CS-02 | Backend cache keys use opaque ids + Domain scope |
| CS-03 | Auth failure clears session-related caches (FE + BE session cache) |
| CS-04 | Do not build write-through client Domain replicas |
| CS-05 | “Snapshot” in freeze/rollback docs ≠ runtime persistence SoT |

---

# 10. Retention / Durability

## 10.1 Durability classes

| Class | Expectation | Examples |
|-------|-------------|----------|
| DUR-CRITICAL | Survive process restart; Domain SoT | Projects, catalog entries, analyses, sessions as contracted |
| DUR-ARTIFACT | Durable bytes until retention policy | PDFs, uploads |
| DUR-JOB | Durable enough for run recovery per existing job contract | Autopilot runs |
| DUR-AUDIT | Append-oriented retention for governance | Governance audit |
| DUR-EPHEMERAL | May evaporate | FE caches, STF-CACHE-BE |

## 10.2 Retention rules

| Rule | Statement |
|------|-----------|
| RT-01 | Retention/purge policies are Domain-owned (and ops/governance where mapped) — not UI timers |
| RT-02 | Share tokens follow existing download-token / delivery retention |
| RT-03 | Deleting a Project cue in UI does not itself delete Domain data unless a mapped Command exists |
| RT-04 | Artifact deletion/retention must not orphan Evolution signals without Domain rules |
| RT-05 | Backups/replicas are infrastructure — must preserve Domain ownership boundaries |
| RT-06 | No retention policy that invents a new storage family |

---

# 11. Responsibility Matrix

| Concern | Frontend | API | Service | Domain | Persistence Port |
|---------|----------|-----|---------|--------|------------------|
| Display cache | Owns | — | — | — | — |
| Business write decision | — | — | Orchestrates | **Owns** | Executes |
| Schema ownership | — | — | — | **Owns** | Implements |
| Auth session durability | Observes | Gates | — | M13 | REPO-SESSION |
| Artifact bytes | Downloads via API | Streams | Orchestrates | M11 | REPO-ARTIFACT |

---

# 12. Release Gate

## Gate ID

`product-backend-persistence-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| PSA-OVER | Layer overview | L1 position + closed storage families |
| PSA-OWN | Data ownership | M11–M15 data classes defined |
| PSA-REPO | Repository boundary | Logical repos + rules; no global God-repo |
| PSA-ENT | Entity mapping | Logical map; no new physical schema invention |
| PSA-RW | Read/write paths | Command write / Query read rules |
| PSA-TX | Transaction boundary | Single-owner default; no new 2PC Domain |
| PSA-MIG | Migration boundary | Domain-owned schema evolution rules |
| PSA-CACHE | Cache/snapshot | Disposable vs durable split |
| PSA-RET | Retention/durability | DUR-* + retention rules |
| PSA-SCOPE | Upstream intact | PD-1…PD-5.3 / M11–M15 unmodified; no new Domains/storage families; single new file |

## Verdict

```
PD-5.4 Gate = PASS
  iff PSA-OVER ∧ PSA-OWN ∧ PSA-REPO ∧ PSA-ENT ∧ PSA-RW
    ∧ PSA-TX ∧ PSA-MIG ∧ PSA-CACHE ∧ PSA-RET ∧ PSA-SCOPE all PASS
```

---

# 13. Freeze Summary

```
PERSISTENCE_ARCH_ID    = product-backend-persistence-architecture-v1
LAYER                  = L1 Persistence Ports
STORAGE_FAMILIES       = RELATIONAL | DOCUMENT | OBJECT | JOB | SESSION | AUDIT | CACHE-BE
NEW_STORAGE_FAMILIES   = 0
DOMAINS                = M11–M15 only
SOT                    = Domain persistence
FE_CACHE_IS_SOT        = false
NO_NEW_DOMAIN          = true
BACKEND_OWNS_LOGIC     = true
FRONTEND_CONSUMES_API  = true
```

## Immutable statements

1. No new Domains or storage families.  
2. Domain persistence is SoT; frontend cache is not.  
3. Repositories are Domain ports — not API/UI owned.  
4. No silent cross-Domain dual-writes.  
5. Migrations must not invent parallel schemas for Screens.

---

# 14. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-PSA-01 | Persistence overview + storage families defined | ✓ |
| AC-PSA-02 | Data ownership + repository boundary defined | ✓ |
| AC-PSA-03 | Entity mapping + read/write + transaction defined | ✓ |
| AC-PSA-04 | Migration + cache/snapshot + retention defined | ✓ |
| AC-PSA-05 | Release Gate + Freeze summary present | ✓ |
| AC-PSA-06 | No new Domains/storage families; Markdown only; upstream unmodified | ✓ |

## Verdict

```
PD-5.4 document PASS iff AC-PSA-01 … AC-PSA-06 PASS
```

---

# Document Statement

PD-5.4 Persistence Architecture locks durable ownership for frozen Domains.

```
API → Service → Domain → Persistence Port → Existing Storage Family
Domain stores are SoT
Frontend caches are disposable
No new Domains / no new storage families
```
