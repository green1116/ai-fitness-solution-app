# PD-5.5 — Backend Security Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Backend Security Architecture

## Version

`product-delivery-pd-5.5-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.4 / PD-2.5 | Auth/ops APIs; M13 primary access ownership |
| PD-4.6 | Frontend observes; does not enforce |
| PD-5.1 … PD-5.4 | Backend layers, services, API edge, persistence |
| M11–M15 | Existing Domains only |

## Purpose

Define **backend security architecture**, **authentication / authorization boundary**, **tenant isolation**, and **secure data access rules**.

**Backend owns security enforcement.**  
**Frontend only consumes security outcomes** (PD-4.6).  
Reuse **M11–M15** and **existing API families** only — no new Domains, no new API families.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Security boundary | Who enforces what |
| Authentication model | Identity establishment |
| Authorization model | Permission decisions |
| Tenant isolation | Cross-tenant hard boundary |
| Session / token handling | Durable session rules |
| Permission enforcement | Where checks run |
| Sensitive data handling | Secrets / PII / artifacts |
| Audit / trace boundary | Security-relevant logging |
| UNAUTH / FORBIDDEN / EXPIRED | Backend error behavior |
| Security freeze summary | Lock points |
| Release Gate | Readiness |

## Out of scope

| Item | Reason |
|------|--------|
| Cryptography algorithm design worksheets | Outside this delivery doc |
| New auth providers / API families | Forbidden |
| Frontend RBAC engine | Forbidden (PD-4.6) |
| New Domains (M16+) | Forbidden |
| Modification of PD-1…PD-5.4 or M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Security Principles

1. **Backend enforces; frontend reflects** — UI guards/visibility never waive API/Domain checks.  
2. **M13 owns access platform** — auth session, tenant/user platform, ops gates (PD-2.5).  
3. **Domain owns resource authorization** — project/knowledge/intelligence/evolution access decisions follow owning Domain.  
4. **Existing surfaces only** — FAM-AUTH / FAM-OPS / related PD-2.4 bindings.  
5. **Fail closed on mutation** — unauthenticated/forbidden Commands do not write.  
6. **Tenant isolation is hard** — opaque ids are not capability tokens.  
7. **Least privilege for ops** — Admin families require ops-capable authorization.  
8. **Safe errors** — no stack traces or cross-tenant leakage.  
9. **No new Domains / API families** under this architecture.

---

# 3. Security Boundary

## 3.1 Layer responsibilities

| Layer | Security role |
|-------|---------------|
| Frontend (PD-4.6) | Observe session/ops; visibility; GRD-*; present UNAUTH/FORBIDDEN/EXPIRED |
| API Edge (L5) | Transport authn gate; attach principal/tenant context; reject missing session when required |
| Services (L4) | Require authenticated context; invoke Domain authz; never bypass gates |
| Domains (L3) M11–M15 | **Authoritative** permission / policy outcomes for owned resources |
| Persistence (L1) | Enforce tenant/owner scoped access via Domain ports — no cross-tenant scans for convenience |

## 3.2 Boundary rules

| Rule | Statement |
|------|-----------|
| SB-01 | Frontend GRD-* pass ≠ authorized Command |
| SB-02 | API Edge must not encode Golden Path business eligibility as a substitute for Domain authz |
| SB-03 | Services must not call repositories with “god” credentials to skip Domain checks |
| SB-04 | Supporting Domains inherit caller principal — they do not mint a stronger identity |
| SB-05 | Security enforcement is backend-owned; UI only consumes outcomes |

## 3.3 Ownership split vs frontend

| Concern | Backend | Frontend |
|---------|---------|----------|
| Verify credentials / mint session | **Owns** (M13 / DOM-AUTH) | Invokes `SignIn` only |
| Decide resource permission | **Owns** (Domain) | Hides/shows controls |
| Ops capability | **Owns** (M13 + existing ops) | SES-OPS-CAPABLE observation |
| Route enter UX | — | GRD-* presentation |
| Error copy | Safe API codes/messages | META-ERROR mapping |

---

# 4. Authentication Model

## 4.1 Surfaces (existing only)

| Step | Existing API | Domain |
|------|--------------|--------|
| Request / verify sign-in | `/api/auth/otp/*` or `/api/auth/email/*` | M13 / DOM-AUTH |
| Observe principal | `/api/auth/me` | M13 / DOM-AUTH |
| Session store | STF-SESSION (PD-5.4) | M13 |

## 4.2 Principal context

After successful authentication, API Edge establishes a **principal context** for the request:

| Attribute (logical) | Meaning |
|---------------------|---------|
| `principalId` | Authenticated subject opaque id |
| `tenantId` | Active tenant opaque id (when applicable) |
| `sessionId` | Session opaque id |
| `opsCapable` | Whether existing auth/ops marks admin-capable |
| `authStatus` | authenticated \| anonymous \| expired |

Exact field names follow existing auth contracts — architecture requires the semantics above.

## 4.3 Authentication rules

| Rule | Statement |
|------|-----------|
| AU-01 | Only FAM-AUTH establishes product sessions for MVP |
| AU-02 | Anonymous callers may hit only documented public auth request endpoints |
| AU-03 | All other PD-2.4 product Command/Query bindings require authenticated principal when existing gates require it |
| AU-04 | Backend never accepts client-supplied “I am admin” flags as truth |
| AU-05 | Preference (`SelectLanguage`) is not authentication |

---

# 5. Authorization Model

## 5.1 Decision points

```
Request
  → Authn (session valid?)
  → Edge gate (family requires auth / ops?)
  → Service
  → Domain authorization for resource + action
  → Allow → execute Command/Query
  → Deny → FORBIDDEN / DOMAIN_REJECT
```

## 5.2 Authorization domains

| Resource class | Authoritative Domain | Examples |
|----------------|----------------------|----------|
| Session / tenant membership / project platform access | **M13** | ListProjects, ViewProjectContext, admin entry |
| Knowledge / documents / artifacts | **M11** | Upload, browse, download, preview |
| Agent runs | **M12** | GenerateTenderPackage, WorkspaceInteract job side |
| Intelligence results / opportunities | **M14** | Review*, CaptureOpportunity, budget calculate |
| Share / governance oversight | **M15** | Share*, ViewGovernance |
| Ops dashboards / users / usage / security views | **M13** (+ M15 governance) | SCR-09 Commands |

## 5.3 Authorization rules

| Rule | Statement |
|------|-----------|
| AZ-01 | Authorization is evaluated server-side on every Command/Query |
| AZ-02 | Entitlement / plan limits (if returned by existing entitlements API) are enforced backend — not by UI flags |
| AZ-03 | NEAREST bindings still enforce authz on the nearest existing surface |
| AZ-04 | Deny is authoritative even if UI showed the control |
| AZ-05 | Do not invent a parallel RBAC Domain outside M13/ops existing surfaces |

---

# 6. Tenant Isolation

## 6.1 Hard boundary

| Rule | Statement |
|------|-----------|
| TI-01 | Data access is scoped to the authenticated tenant (and principal permissions within it) |
| TI-02 | Supplying another tenant’s `projectId` / `artifactId` must not return foreign data — `FORBIDDEN` or safe `NOT_FOUND` per existing contract |
| TI-03 | List Queries return only tenant-scoped rows |
| TI-04 | Jobs, artifacts, intelligence rows carry tenant ownership in persistence (PD-5.4) |
| TI-05 | Ops cross-tenant views only via existing authorized ops surfaces — not customer APIs |
| TI-06 | Frontend shared state cues never expand tenant scope |

## 6.2 Isolation enforcement points

| Point | Mechanism |
|-------|-----------|
| API Edge | Bind tenant from session — not from untrusted body override |
| Domain | Validate resource belongs to caller tenant |
| Repository | Queries include tenant predicates via Domain ports |
| Object storage | Artifact access via authorized metadata + existing download APIs |

---

# 7. Session / Token Handling

## 7.1 Session lifecycle (backend)

```
SignIn verify success
  → Create/refresh STF-SESSION record
  → Issue existing session credential (cookie/token as implemented)
  → Subsequent requests: resolve session → principal context
Expiry / logout / invalidation
  → Session unusable
  → Requests → UNAUTH / EXPIRED
  → Frontend clears ST-SESSION (consumes outcome)
```

## 7.2 Token rules

| Rule | Statement |
|------|-----------|
| TK-01 | Session secrets persist only in STF-SESSION / existing auth mechanism |
| TK-02 | Access tokens/cookies are not logged in audit payloads |
| TK-03 | Download/share tokens (FAM-DOWNLOAD) are scoped, time-bounded per existing contracts |
| TK-04 | Share tokens are not ambient session substitutes for full API access |
| TK-05 | Services must not place raw session secrets into Domain business tables |
| TK-06 | Client-local storage beyond existing session mechanism is not a backend trust source |

---

# 8. Permission Enforcement

## 8.1 Enforcement matrix

| Family / path | Authn required | Extra authz |
|---------------|----------------|-------------|
| FAM-AUTH request/verify | Public for request; verify establishes session | — |
| FAM-AUTH me | Session | Self only |
| Customer product APIs (project, tender, docs, budget, …) | Session | Tenant + resource Domain authz |
| FAM-OPS / admin | Session | `opsCapable` + existing permission/role surfaces |
| FAM-DOWNLOAD share/token | Per existing token/session rules | Token scope + Domain checks |

## 8.2 Enforcement rules

| Rule | Statement |
|------|-----------|
| PE-01 | Check order: authn → edge gate → Domain authz → execute |
| PE-02 | Failed authn/z performs **no** business write |
| PE-03 | Autopilot/job creation checks caller rights before STF-JOB write |
| PE-04 | Artifact download checks M11 (and token scope if share) before byte stream |
| PE-05 | Permission/role runs (`ViewSecurity`) are read of existing surfaces — not a new policy engine Domain |

---

# 9. Sensitive Data Handling

## 9.1 Classes

| Class | Examples | Backend rule |
|-------|----------|--------------|
| Secrets | Passwords, OTP, session secrets, API keys | Never in API success bodies, logs, or FE-bound DTOs |
| PII | Names, emails | Return only fields existing contracts already expose to authorized callers |
| Tenant/project ids | Opaque ids | Allowed in DTOs; not proof of authz alone |
| Artifacts | PDFs, uploads | Authorized stream only; no world-readable buckets for product paths |
| Ops telemetry | Usage/security/governance | Ops-authorized callers only |
| Intelligence outcomes | Solution/budget analyses | Tenant-scoped; no cross-tenant “similar deals” leakage invented here |

## 9.2 Handling rules

| Rule | Statement |
|------|-----------|
| SD-01 | Mask/omit secrets in error and audit detail fields |
| SD-02 | Uploads treated untrusted until Domain accepts (malware/policy as existing) |
| SD-03 | Do not persist UI drafts as authoritative secrets stores |
| SD-04 | Cross-Domain references pass ids — not copied secret material |
| SD-05 | Backup/export infrastructure must preserve tenant isolation |

---

# 10. Audit / Trace Boundary

## 10.1 What to audit (security-relevant)

| Event class | Owner store | Notes |
|-------------|-------------|-------|
| Sign-in success/failure | M13 / auth | No credential contents |
| Authz denials on sensitive Commands | M13 / owning Domain as existing | Safe codes only |
| Admin ops views / governance | M13 / M15 (STF-AUDIT) | Existing governance audit paths |
| Share token issuance | M15 (+ delivery) | Token id metadata, not raw token if avoidable |
| Artifact download (when contracted) | M11 / delivery | Actor + artifact id |

## 10.2 Trace rules

| Rule | Statement |
|------|-----------|
| AT-01 | Prefer existing `/api/v80/ops/governance/audit` and related surfaces — no new audit API family |
| AT-02 | Traces must not include session secrets or OTP |
| AT-03 | Audit is not a substitute for preventive authz |
| AT-04 | Customer Golden Path APIs must not dump other tenants’ audit rows |
| AT-05 | Correlation ids may be used for ops — still tenant-safe |

---

# 11. Error Behavior: Unauthorized / Forbidden / Expired

## 11.1 Backend classification

| Class | Condition | HTTP (existing typical) | Persistence effect |
|-------|-----------|-------------------------|--------------------|
| `UNAUTH` | No/invalid principal | 401 | No business write |
| `FORBIDDEN` | Authenticated but not permitted | 403 | No business write |
| `EXPIRED` | Session was valid, now invalid | 401 (or existing equivalent) | No business write; session unusable |
| `UNAVAILABLE` | Auth service down | 503 / 5xx | Fail closed on protected routes |

## 11.2 Backend handling flow

```
Detect UNAUTH | FORBIDDEN | EXPIRED | UNAVAILABLE
  → Do not execute Domain mutation
  → Return PD-5.3 safe error envelope (code + safe message)
  → Optionally record authz denial audit (if existing policy)
  → Frontend consumes and presents (PD-4.6) — backend does not redirect UI routes
```

## 11.3 Per-surface behavior

| Surface | UNAUTH | FORBIDDEN | EXPIRED |
|---------|--------|-----------|---------|
| Customer Command/Query | 401 envelope | 403 envelope | Treat as UNAUTH |
| Admin/ops | 401 | 403 (even if UI showed Admin) | 401 |
| Download/share | 401/403/token-invalid per contract | 403 | Re-auth or re-issue token per contract |
| Auth me | 401 | — | 401 |

## 11.4 Rules

| Rule | Statement |
|------|-----------|
| UF-01 | Backend does not invent `/forbidden` HTML Feature Screens |
| UF-02 | Prefer not to confirm foreign resource existence on FORBIDDEN beyond existing safe practice |
| UF-03 | EXPIRED must invalidate server session usability — not only FE cache |
| UF-04 | Retry after re-auth is the same Command/Query — no alternate Domain workflow |

---

# 12. Secure Data Access Rules (Summary)

| ID | Rule |
|----|------|
| SDA-01 | All durable reads/writes go Domain port → tenant-scoped store |
| SDA-02 | Object/byte access requires authorized metadata check |
| SDA-03 | Job run access scoped to caller tenant |
| SDA-04 | Intelligence and knowledge rows are not world-readable within cluster “for debugging” in product paths |
| SDA-05 | Supporting Domain calls propagate the same principal context |

---

# 13. Security Freeze Summary

```
BACKEND_SECURITY_ID    = product-backend-security-architecture-v1
ENFORCEMENT_OWNER      = Backend (API Edge + M11–M15)
FRONTEND_ROLE          = Consume outcomes only (PD-4.6)
AUTHN                  = FAM-AUTH / M13
AUTHZ                  = Domain-authoritative + ops gates
TENANT_ISOLATION       = Hard boundary
SESSION_STORE          = STF-SESSION
AUDIT                  = Existing ops/governance surfaces
ERROR_CLASSES          = UNAUTH | FORBIDDEN | EXPIRED | UNAVAILABLE
NO_NEW_DOMAIN          = true
NO_NEW_API_FAMILY      = true
```

## Immutable prohibitions

1. No trust of frontend guards as authorization.  
2. No new auth Domains or API families.  
3. No cross-tenant data access via opaque id guessing.  
4. No secrets in logs, DTOs, or audit detail.  
5. No business writes on UNAUTH/FORBIDDEN/EXPIRED.

---

# 14. Release Gate

## Gate ID

`product-backend-security-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| BSEC-BOUND | Security boundary | Backend enforces; FE consumes |
| BSEC-AUTHN | Authentication model | FAM-AUTH + principal context |
| BSEC-AUTHZ | Authorization model | Domain-authoritative map |
| BSEC-TENANT | Tenant isolation | Hard boundary rules |
| BSEC-SESSION | Session/token | STF-SESSION + token rules |
| BSEC-ENF | Permission enforcement | Check order + family matrix |
| BSEC-SENS | Sensitive data | Secrets/PII/artifact rules |
| BSEC-AUDIT | Audit/trace | Existing surfaces; no secret logging |
| BSEC-UF | UNAUTH/FORBIDDEN/EXPIRED | Fail closed + safe envelopes |
| BSEC-SCOPE | Upstream intact | PD-1…PD-5.4 / M11–M15 unmodified; no new Domains/API families; single new file |

## Verdict

```
PD-5.5 Gate = PASS
  iff BSEC-BOUND ∧ BSEC-AUTHN ∧ BSEC-AUTHZ ∧ BSEC-TENANT ∧ BSEC-SESSION
    ∧ BSEC-ENF ∧ BSEC-SENS ∧ BSEC-AUDIT ∧ BSEC-UF ∧ BSEC-SCOPE all PASS
```

---

# 15. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-BSEC-01 | Security boundary + authn/authz models defined | ✓ |
| AC-BSEC-02 | Tenant isolation + session/token + enforcement defined | ✓ |
| AC-BSEC-03 | Sensitive data + audit + UNAUTH/FORBIDDEN/EXPIRED defined | ✓ |
| AC-BSEC-04 | Freeze summary + Release Gate present | ✓ |
| AC-BSEC-05 | Backend owns enforcement; FE consumes outcomes only | ✓ |
| AC-BSEC-06 | No new Domains/API families; Markdown only; upstream unmodified | ✓ |

## Verdict

```
PD-5.5 document PASS iff AC-BSEC-01 … AC-BSEC-06 PASS
```

---

# Document Statement

PD-5.5 Backend Security Architecture locks server-side enforcement for the frozen product.

```
Authn (M13) → Edge gate → Domain authz → Execute
Tenant isolation is hard
Frontend only consumes UNAUTH / FORBIDDEN / EXPIRED outcomes
No new Domains / no new API families
```
