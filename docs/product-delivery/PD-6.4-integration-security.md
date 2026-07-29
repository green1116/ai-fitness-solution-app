# PD-6.4 — Integration Security

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Integration Security

## Version

`product-delivery-pd-6.4-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-4.6 | FE security: observe only; GRD-*; visibility ≠ authz |
| PD-5.5 | BE security: enforcement; tenant isolation; audit |
| PD-6.1 / PD-6.2 / PD-6.3 | Integration pipeline, contracts, workflows |
| PD-2.4 / PD-2.5 | API bindings; M11–M15 ownership |

## Purpose

Define **end-to-end integration security**: trust boundaries, authn/z flow, session propagation, tenant isolation, secure data flow, and failure handling across the frozen FE ↔ BE seam.

**Reuse only.** Backend enforces. Frontend observes. No new Domains or API families.

---

# 1. Trust Boundaries

## 1.1 Boundary map

```
┌─ UNTRUSTED ────────────────────────────────────┐
│ User device / browser / network                 │
│ Frontend runtime (PD-4)                         │
│   • FE guards = presentation only              │
│   • ST-LOCAL / ST-SESSION = disposable          │
│   • Adapter payloads = untrusted until Domain   │
└──────────────┬──────────────────────────────────┘
               │ HTTPS + existing auth credential
┌─ TRANSPORT GATE ───────────────────────────────┐
│ API Edge (L5)                                   │
│   • Authn: resolve session → principal          │
│   • Gate: require session / ops-capable         │
└──────────────┬──────────────────────────────────┘
               │ Principal context (trusted from here)
┌─ TRUSTED ──────────────────────────────────────┐
│ Services (L4) → Domains M11–M15 (L3)           │
│   • Authz: Domain-resource decisions            │
│   • Persistence: tenant-scoped (L1)             │
└─────────────────────────────────────────────────┘
```

## 1.2 Boundary rules

| Rule | Statement |
|------|-----------|
| TB-01 | Everything from the browser is untrusted — including ids, tokens, uploads |
| TB-02 | Trust begins at API Edge after session is resolved to a valid principal |
| TB-03 | Services inherit principal — they do not mint stronger identity |
| TB-04 | Domain persistence access is tenant-scoped; opaque ids are not capability tokens |
| TB-05 | FE GRD-* pass does not establish trust |

---

# 2. Authentication Flow

## 2.1 Steps (integration)

```
User → CMP-ACCESS-SIGNIN → ACT-01-01 → SignIn Command
  → Adapter → /api/auth/* (FAM-AUTH)
  → API Edge (public auth request endpoint)
  → M13 / DOM-AUTH verifies credentials
  → Session minted in STF-SESSION
  → Credential returned via existing mechanism (cookie/token)
  → Adapter → SES-SIGNED-IN = true; optional SES-DISPLAY-NAME
  → FE guards (GRD-SESSION) satisfied for subsequent routes
```

## 2.2 Session observe (per-request)

```
Request arrives (any route)
  → API Edge extracts session credential
  → Resolves principal: principalId, tenantId, sessionId, opsCapable
  → Attaches to request context
  → Services/Domains see trusted principal
  → FE: /api/auth/me maps → ST-SESSION observation
```

## 2.3 Authentication rules

| Rule | Statement |
|------|-----------|
| AN-01 | Only FAM-AUTH establishes sessions |
| AN-02 | Anonymous callers may hit only public auth request endpoints |
| AN-03 | FE never mints/fabricates SES-SIGNED-IN |
| AN-04 | `SelectLanguage` (PREF) is not authentication |
| AN-05 | Backend never accepts client-supplied "I am admin" |

---

# 3. Authorization Flow

## 3.1 Steps (integration)

```
Authenticated request
  → API Edge: family gate (session required? ops-capable required?)
  → Service: invoke Domain capability
  → Domain: authoritative decision for resource + action
     • Tenant match?
     • Principal has access to resource?
     • Business policy accept?
  → Allow → execute → respond
  → Deny → FORBIDDEN / DOMAIN_REJECT → safe envelope
```

## 3.2 Authorization domains (PD-5.5)

| Resource class | Authoritative Domain |
|----------------|----------------------|
| Session / tenant / projects / ops | **M13** |
| Knowledge / documents / artifacts | **M11** |
| Agent runs / generation | **M12** |
| Intelligence / opportunities | **M14** |
| Share / governance oversight | **M15** |

## 3.3 Authorization rules

| Rule | Statement |
|------|-----------|
| AZ-01 | Authz evaluated server-side on every Command/Query |
| AZ-02 | FE visibility ≠ authorization (PD-4.6) |
| AZ-03 | Domain deny is authoritative even if UI showed the control |
| AZ-04 | No parallel RBAC Domain outside M13/ops existing surfaces |
| AZ-05 | NEAREST bindings enforce authz on the nearest route |

---

# 4. Session Propagation

## 4.1 Propagation path

| Hop | Session state |
|-----|---------------|
| Browser → API Edge | Credential via existing mechanism (cookie/token in header) |
| API Edge → Service | Principal context (resolved, trusted) |
| Service → Domain | Same principal context |
| Domain → Persistence | Tenant-scoped queries via ports |
| API → FE (response) | Session validity implicit; `/api/auth/me` for explicit observe |

## 4.2 What propagates

| Attribute | Propagated? | How |
|-----------|-------------|-----|
| `principalId` | Yes | Context object |
| `tenantId` | Yes | Context object |
| `sessionId` | Yes (for audit correlation) | Context object |
| `opsCapable` | Yes | Context object |
| Raw session secret | **Never** beyond Edge resolution | Stays in transport layer |

## 4.3 Propagation rules

| Rule | Statement |
|------|-----------|
| SP-01 | Session credential crosses exactly one trust boundary (browser → Edge) |
| SP-02 | Principal context propagates internally — not the raw secret |
| SP-03 | Supporting Domain calls receive the same principal — no escalation |
| SP-04 | FE never sees or stores the server-side session record |
| SP-05 | Job runs carry initiator principal for authz on results |

---

# 5. Tenant Isolation

## 5.1 Isolation enforcement chain

```
Browser: opaque ids only (projectId, artifactId…)
  → Edge: bind tenant from session — ignore untrusted tenant override
  → Service: pass tenant-scoped context
  → Domain: validate resource belongs to caller tenant
  → Persistence: queries include tenant predicate via Domain ports
  → Object store: authorized metadata check before bytes
  → Response: only caller-tenant data
```

## 5.2 Isolation rules

| Rule | Statement |
|------|-----------|
| TI-01 | Foreign tenant resource request → FORBIDDEN or safe NOT_FOUND |
| TI-02 | List Queries return only caller-tenant rows |
| TI-03 | Ops cross-tenant views only via authorized ops surfaces |
| TI-04 | FE shared state cues never widen tenant scope |
| TI-05 | Canary / rollback must not weaken tenant isolation (PD-5.7) |
| TI-06 | Tenant provisioning uses existing M13 / tenant surfaces |
| TI-07 | Job and artifact ownership carry tenantId |

---

# 6. Secure Data Flow

## 6.1 Data flow with security controls

```
FE draft (ST-LOCAL) ──untrusted──▶ Adapter ──HTTPS──▶ Edge authn
  ▶ Service (trusted context) ──▶ Domain validates+authz
  ▶ Persistence write (tenant-scoped)
  ◀ Response DTO (no secrets, no stacks)
  ◀ Adapter → OBJ-* / ST-SERVER (disposable)
```

## 6.2 Per-data-class security

| Data class | Security control |
|------------|------------------|
| Planning drafts / uploads | Untrusted until Domain accept; upload via existing intake contract |
| Domain entities | Tenant-scoped persistence; read/write via Domain authz |
| Artifacts (PDFs) | Authorized stream via existing download APIs; no world-readable bucket |
| Intelligence results | Tenant-scoped; no cross-tenant "similar" leakage |
| Share/download tokens | Scoped, time-bounded per existing contract |
| Session secrets | Never in DTOs, logs, FE state, or audit detail |
| Ops telemetry | Ops-authorized callers only |

## 6.3 Secure data flow rules

| Rule | Statement |
|------|-----------|
| SD-01 | Secrets never cross the trust boundary toward the browser |
| SD-02 | Uploads are untrusted payloads until Domain accepts |
| SD-03 | Responses contain no stack traces, raw tokens, or foreign tenant data |
| SD-04 | Binary artifacts delivered via authorized existing APIs only |
| SD-05 | Audit / governance logs never include session secrets |
| SD-06 | Cross-Domain references pass opaque ids — not copied secret material |

---

# 7. Failure Handling (Security View)

## 7.1 Failure → security action

| Failure class | Security action | Write status |
|---------------|-----------------|--------------|
| `UNAUTH` | Reject; no Domain mutation; return 401 | **None** |
| `EXPIRED` | Treat as UNAUTH; session unusable | **None** |
| `FORBIDDEN` | Reject; no escalation; prefer not to confirm foreign resource existence | **None** |
| `VALIDATION` | Reject before Domain when contract-invalid | **None** |
| `DOMAIN_REJECT` | Domain decided; propagate safe code | **None** beyond Domain decision |
| `UNAVAILABLE` (auth svc) | Fail closed on protected routes | **None** |

## 7.2 Security failure rules

| Rule | Statement |
|------|-----------|
| SF-01 | Fail closed: no business write on UNAUTH/FORBIDDEN/EXPIRED |
| SF-02 | Error envelope contains no secrets or cross-tenant resource names |
| SF-03 | FE clears SES-* on UNAUTH/EXPIRED; does not invent privilege |
| SF-04 | Retry after re-auth is user-initiated same Command |
| SF-05 | No alternate Domain workflow invented on denial |
| SF-06 | Admin denied → FE safe Entry `/`; no data leak |

---

# 8. Release Gate

## Gate ID

`product-integration-security-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| ISEC-TB | Trust boundaries | Untrusted / gate / trusted defined |
| ISEC-AUTHN | Authentication flow | FAM-AUTH only; session resolve |
| ISEC-AUTHZ | Authorization flow | Domain-authoritative; per-Command |
| ISEC-SES | Session propagation | Principal context; no secret leak |
| ISEC-TEN | Tenant isolation | Hard boundary; enforcement chain |
| ISEC-DATA | Secure data flow | Per-class controls; rules |
| ISEC-FAIL | Failure handling | Fail closed; no secrets in errors |
| ISEC-SCOPE | Reuse only / upstream intact | No new Domains/APIs; PD-1…PD-6.3 / M11–M15 unmodified; single new file |

## Verdict

```
PD-6.4 Gate = PASS
  iff ISEC-TB ∧ ISEC-AUTHN ∧ ISEC-AUTHZ ∧ ISEC-SES
    ∧ ISEC-TEN ∧ ISEC-DATA ∧ ISEC-FAIL ∧ ISEC-SCOPE all PASS
```

---

# 9. Freeze Summary

```
INTEGRATION_SECURITY_ID = product-integration-security-v1
INTEGRATION_ARCH_REF    = product-integration-architecture-v1
FE_SECURITY_REF         = product-frontend-security-v1
BE_SECURITY_REF         = product-backend-security-architecture-v1
TRUST_BOUNDARY          = browser untrusted → Edge gate → trusted services/Domains
AUTHN                   = FAM-AUTH / M13 only
AUTHZ                   = Domain-authoritative per Command
TENANT_ISOLATION        = hard
SESSION_PROPAGATION     = principal context; no secret leak
FAIL_CLOSED             = true
REUSE_ONLY              = true
NO_NEW_DOMAIN           = true
NO_NEW_API_FAMILY       = true
```

## Immutable statements

1. Trust starts at API Edge after session resolution — never at browser.  
2. Authz is Domain-authoritative; FE visibility is not enforcement.  
3. Tenant isolation is hard; every layer enforces scoping.  
4. No secrets cross toward browser; no secrets in logs/audit detail.  
5. Fail closed on writes; no privilege escalation on denial.  
6. Upstream PD-1…PD-6.3 and M11–M15 unmodified by this task.

---

# 10. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-ISEC-01 | Trust boundaries defined | ✓ |
| AC-ISEC-02 | Authn + authz + session propagation defined | ✓ |
| AC-ISEC-03 | Tenant isolation + secure data flow defined | ✓ |
| AC-ISEC-04 | Failure handling + Release Gate + Freeze present | ✓ |
| AC-ISEC-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.4 document PASS iff AC-ISEC-01 … AC-ISEC-05 PASS
```

---

# Document Statement

PD-6.4 Integration Security locks end-to-end security across the frozen FE ↔ BE seam.

```
Untrusted browser → Edge authn gate → Trusted principal
Domain authz per Command · Tenant isolation hard
Fail closed · No secrets leak · Reuse only
```
