# PD-4.6 — Frontend Security

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Frontend Security

## Version

`product-delivery-pd-4.6-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.4 / PD-2.5 | Auth / ops API + Domain ownership (DOM-AUTH → M13) |
| PD-3.1 … PD-3.8 | Objects, Screens, UI freeze |
| PD-4.1 | Security boundary posture |
| PD-4.2 | GRD-* route guards + fallbacks |
| PD-4.3 | ST-SESSION / ST-META |
| PD-4.4 / PD-4.5 | Component + data-flow boundaries |

## Purpose

Define the **frontend security boundary**, **auth surface**, **permission visibility**, and **safe UI behavior**.

Frontend **observes** existing auth/ops results and **presents** safe states.  
Frontend **does not** implement RBAC, entitlement engines, or Domain authorization.  
Frontend **owns no business logic**.

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Auth boundary | What UI may/must not do with auth |
| Permission visibility | Showing/hiding affordances vs enforcing rights |
| Session handling | ST-SESSION lifecycle presentation |
| Route/page guard behavior | GRD-* security reading |
| Safe fallback behavior | Entry / unavailable / empty |
| Unauthorized / forbidden / expired | Error + recovery presentation |
| Sensitive UI data handling | Secrets, tokens, PII display |
| Security freeze summary | Locked rules |
| Release Gate | Security readiness |

## Out of scope

| Item | Reason |
|------|--------|
| RBAC / permission engine implementation | Domain / existing ops APIs |
| Cryptography / threat-model worksheets | Outside delivery UI doc |
| New auth providers or APIs | Forbidden |
| New `/forbidden` Feature Screen | PD-4.2 forbids |
| Modification of PD-1…PD-3, PD-4.1–4.5, M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Security Principles

1. **Server enforces; UI reflects** — authorization truth lives in existing auth/ops Domains via APIs.  
2. **Observe, do not mint** — SES-* mirrors `/api/auth/me` (or PD-2.4 equivalent); UI never invents roles.  
3. **Visibility ≠ authorization** — hiding a control is UX; Domain may still reject Commands.  
4. **Guards are presentation gates** — GRD-* only (PD-4.2); no business eligibility engines.  
5. **No secrets in presentation code** — credentials/tokens only via existing session mechanism.  
6. **Fail closed for ops; fail open to Entry** — admin denied → `/`; never invent admin Features.  
7. **Safe copy only** — no engine stack traces or internal auth diagnostics as primary UX.  
8. **Existing capabilities only** — DOM-AUTH / DOM-OPS / M13; no new Domains.

---

# 3. Auth Boundary

## 3.1 Auth surface (existing only)

| Surface | Binding | Role |
|---------|---------|------|
| Sign In | `SignIn` / ACT-01-01 → `/api/auth/otp/*` or `/api/auth/email/*` | Establish session |
| Session observe | `/api/auth/me` | SES-SIGNED-IN / display cues |
| Ops capability observe | Existing auth/ops (PD-2.4 NEAREST for admin) | SES-OPS-CAPABLE for GRD-OPS |
| Preference | `SelectLanguage` / PREF | Non-auth preference only |

## 3.2 Frontend may

| Allowed | Notes |
|---------|-------|
| Invoke Sign In Command via Adapter | PD-4.5 Command flow |
| Read session observation into ST-SESSION | PD-4.3 |
| Apply GRD-SESSION / GRD-OPS | PD-4.2 |
| Show Sign In affordance (CMP-ACCESS-SIGNIN) | SCR-01 |
| Clear presentation session on auth failure / logout signal | ST-SESSION + cache invalidation |

## 3.3 Frontend must not

| Forbidden | Why |
|-----------|-----|
| Store passwords / OTP secrets in ST-LOCAL/SHARED | Credential exposure |
| Implement auth providers / token minting | Domain-owned |
| Bypass API auth by calling Domain modules from UI | Boundary violation |
| Fabricate SES-SIGNED-IN / SES-OPS-CAPABLE | Shadow auth |
| Encode entitlement matrices in guards | Business logic |
| Create new auth routes | PD-2.4 closed set |

## 3.4 Auth boundary rules

| Rule | Statement |
|------|-----------|
| AB-01 | All auth HTTP uses PD-2.4 DOM-AUTH bindings only |
| AB-02 | Adapter maps auth responses to SES-* — does not reinterpret policy |
| AB-03 | Components emit Sign In intent only; Screen owns ACT-01-01 |
| AB-04 | Deep-link resume after Sign In uses allowed PD-4.2 edges only |

---

# 4. Permission Visibility

## 4.1 Definition

**Permission visibility** is the UI choice to show, hide, disable, or label affordances based on **observed** session/ops presentation — not a permission engine.

## 4.2 Visibility catalogue

| Visibility key | Observation input | UI effect |
|----------------|-------------------|-----------|
| VIS-SIGNED-OUT | SES-SIGNED-IN = false | Show Sign In; GRD-SESSION targets redirect to `/` |
| VIS-SIGNED-IN | SES-SIGNED-IN = true | Customer path affordances available per Screen |
| VIS-OPS | SES-OPS-CAPABLE = true | `/admin` enterable; ops CMP-OPS-AREA may load |
| VIS-OPS-DENIED | SES-OPS-CAPABLE = false / unknown | Hide or non-route admin entry from customer chrome; GRD-OPS redirects `/` |
| VIS-CONTEXT-MISSING | No `projectId` cue | Soft empty/guide (GRD-CONTEXT) — not a hard auth deny |
| VIS-ACTION-DISABLED | ST-META loading / local readiness | Disable primary controls — not Domain approval |

## 4.3 Visibility rules

| Rule | Statement |
|------|-----------|
| PV-01 | Hiding Admin from customer shell is presentation — Domain still enforces on `/admin` APIs |
| PV-02 | Enabling a control never means “authorized forever” — every Command still hits existing API auth |
| PV-03 | Do not compute Feature entitlements (pricing tiers, unpaid locks) in UI |
| PV-04 | SCR-09 areas remain five CMP-OPS-AREA instances — visibility does not split into new Screens |
| PV-05 | Artifact Download/Share affordances remain visible per Screen spec; API may still return forbidden |

## 4.4 Customer vs Ops separation

| Surface | Visibility posture |
|---------|-------------------|
| Golden Paths GP-01…03 | No Admin ops panels mixed into customer Screens |
| GP-04 / SCR-09 | Isolated `/admin`; not linked from primary customer Forward groups |
| Shell destinations | Home / Projects / Documents / Workspace only (PD-3.2) — Admin not a customer shell primary |

---

# 5. Session Handling

## 5.1 Session presentation state (ST-SESSION)

| Key | Meaning | Source of truth |
|-----|---------|-----------------|
| SES-SIGNED-IN | Signed-in presentation | Existing auth me |
| SES-DISPLAY-NAME | Optional user label | Auth API |
| SES-OPS-CAPABLE | Admin gate presentation | Existing auth/ops observation |

## 5.2 Lifecycle

```
Boot / route enter
  → Adapter observes /api/auth/me (or equivalent)
  → Map → ST-SESSION
  → Guards read SES-*
Sign In success
  → Refresh ST-SESSION
  → Invalidate prior anonymous caches
  → Optional resume deep link (allowed edges)
Auth failure / expired / logout signal
  → Clear ST-SESSION presentation
  → Invalidate ST-SERVER presentation caches
  → Navigate safe Entry `/` (or stay on GRD-NONE routes)
```

## 5.3 Session rules

| Rule | Statement |
|------|-----------|
| SH-01 | Session tokens remain in existing session mechanism — not copied into CMP props as secrets |
| SH-02 | ST-SESSION is observation cache — Domain/session service remains SoT |
| SH-03 | Context ids (projectId) do not imply session or authorization success (PD-4.3 CX-02) |
| SH-04 | Language PREF must not be stored as a substitute for auth session |
| SH-05 | Fabricating session to skip GRD-SESSION is forbidden |

---

# 6. Route / Page Guard Behavior (Security Reading)

Guards remain as defined in PD-4.2. This section states their **security meaning**.

| Guard | Security meaning | On fail |
|-------|------------------|---------|
| GRD-NONE | Public entry / system routes | N/A |
| GRD-SESSION | Require presented session for customer work Screens | Redirect `/` + Sign In path |
| GRD-CONTEXT | Missing project cue — soft UX gate | Empty/guide; not auth deny |
| GRD-OPS | Require presented ops capability for Admin | Redirect `/` — no `/forbidden` Screen |
| GRD-ALIAS | Normalize `/home` → `/` | N/A |

## Guard security rules

| Rule | Statement |
|------|-----------|
| GS-01 | Guards never call Domains to score eligibility beyond session/ops observe APIs |
| GS-02 | GRD-CONTEXT must not be used as a hard authorization substitute |
| GS-03 | Client-side guard pass does not waive API auth on subsequent Commands |
| GS-04 | No new security Screens or routes beyond PD-4.2 catalogue |

---

# 7. Safe Fallback Behavior

## 7.1 Fallback catalogue

| Condition | Fallback | User-facing intent |
|-----------|----------|--------------------|
| Not signed in on guarded route | `/` + Sign In | Re-authenticate |
| Ops capability absent | `/` | Leave Admin; no privilege escalation UI |
| Missing project context | Empty + link to `/projects` or `/` | Restore cue — not deny page |
| Unknown route | `/404` | Safe dead-end; Home |
| Auth/API critically unavailable at boot | `/unavailable` | Retry or Home |
| Command unauthorized mid-flow | Stay on Screen + META-ERROR or soft return `/` | Retry Sign In / safe back |

## 7.2 Fallback rules

| Rule | Statement |
|------|-----------|
| SF-01 | Fallbacks use only `/`, `/404`, `/unavailable`, and allowed Empty guidance edges |
| SF-02 | Do not invent `/forbidden`, `/login-error`, or privilege Screens |
| SF-03 | Fallbacks must not leak whether a resource exists when API signals forbidden (prefer generic denial copy) |
| SF-04 | Admin denial never dumps ops payload fragments into customer Screens |

---

# 8. Unauthorized / Forbidden / Expired Session

## 8.1 Classification (presentation mapping)

| Class | Typical API signal | UI handling |
|-------|--------------------|-------------|
| UNAUTH | 401 / unauthenticated | Clear SES-*; META-ERROR or redirect `/`; offer Sign In |
| FORBIDDEN | 403 / not permitted | META-ERROR user-language denial; do not escalate privileges in UI; Admin → `/` if on SCR-09 |
| EXPIRED | Session invalid / me fails after prior signed-in | Treat as UNAUTH; invalidate caches; Sign In |
| UNAVAILABLE | Auth service down | `/unavailable` or Screen META-ERROR with retry observe |

Exact status codes follow existing API contracts — UI maps, does not redefine.

## 8.2 Handling flow

```
API/Adapter signals UNAUTH | FORBIDDEN | EXPIRED | UNAVAILABLE
  → Map to presentation class (no new business codes)
  → Update ST-SESSION if auth observation invalidated
  → Set META-ERROR (and/or navigate fallback per §7)
  → Offer: Sign In (ACT-01-01) | Retry same read/Command | Navigate Home
  → Do not invent alternate Domain workflow
```

## 8.3 Per-context behavior

| Context | UNAUTH | FORBIDDEN | EXPIRED |
|---------|--------|-----------|---------|
| Customer Screen Command | Error + Sign In CTA | Error; keep safe Objects or clear if unsafe | Same as UNAUTH |
| GRD-SESSION enter | Redirect `/` | N/A (pre-enter) | Redirect `/` |
| SCR-09 / GRD-OPS | Redirect `/` | Redirect `/` or area error without data leak | Redirect `/` |
| Download/Share | Error; no partial secret file display | Error | Sign In then retry intent |

## 8.4 Rules

| Rule | Statement |
|------|-----------|
| UF-01 | Retry means same Command/read after re-auth — not a new API |
| UF-02 | Forbidden must not reveal other tenants’ resource names beyond API-safe messages |
| UF-03 | Expired session clears presentation caches (PD-4.3 session invalidation) |
| UF-04 | UI never “fixes” forbidden by switching to a different Domain module |

---

# 9. Sensitive UI Data Handling

## 9.1 Sensitivity classes

| Class | Examples | UI rule |
|-------|----------|---------|
| Secrets | Passwords, OTP codes, API keys, raw session tokens | Never persist in CMP props, logs, or ST-DERIVED; input only through existing auth controls |
| Auth headers | Bearer/cookies per existing mechanism | Adapter/transport only — not rendered |
| PII labels | Display name, email if returned | Show only fields Domain returned for presentation; no scraping into unrelated Screens |
| Tenant / project ids | Opaque ids | Pass as cues; do not expose internal engine ids beyond Objects |
| Artifacts | Documents, proposals, budgets | Download via existing Commands; do not embed raw binary in client state stores |
| Ops telemetry | SCR-09 observations | Ops Screen only; not mixed into customer Golden Path UI |
| Errors | Stack traces, internal codes | Map to safe user copy (PD-4.5 Error flow) |

## 9.2 Handling rules

| Rule | Statement |
|------|-----------|
| SD-01 | No secrets in repository presentation strings or client-bundled config as product architecture |
| SD-02 | Upload payloads are untrusted until Domain accepts (PD-4.1) |
| SD-03 | Do not write sensitive fields into URL query beyond opaque ids already allowed (projectId, category, area) |
| SD-04 | Clipboard/share uses existing Share Command surfaces — no ad-hoc exfiltration UI |
| SD-05 | Client logs (if any in implementation) must not record tokens or OTP |
| SD-06 | ST-LOCAL drafts may hold user-typed planning text — not credentials |

---

# 10. Responsibility Matrix

| Concern | Frontend | Existing Domain / API |
|---------|----------|------------------------|
| Present Sign In | ✓ | — |
| Verify credentials / mint session | — | DOM-AUTH |
| Observe session | ✓ (read) | DOM-AUTH (SoT) |
| Enforce permissions on Commands | — | Auth + Domain APIs |
| Hide/show Admin entry | ✓ (visibility) | — |
| Allow Admin data access | — | DOM-OPS + auth |
| Route guards | ✓ (presentation) | Session/ops observe inputs |
| Entitlement / RBAC policy | — | Existing Domains |
| Safe error copy | ✓ | May supply codes |

---

# 11. Security Freeze Summary

```
FRONTEND_SECURITY_ID   = product-frontend-security-v1
AUTH_SURFACE           = existing DOM-AUTH (PD-2.4) only
PERMISSION_MODEL       = visibility only; Domain enforces
SESSION_STATE          = ST-SESSION observation (SES-*)
GUARDS                 = GRD-NONE | SESSION | CONTEXT | OPS | ALIAS
FALLBACKS              = / | /404 | /unavailable | Empty guidance
UNAUTH_FORBIDDEN_EXP   = mapped presentation classes
SENSITIVE_DATA         = no secrets in UI state/props
NO_RBAC_IN_UI          = true
NO_BUSINESS_LOGIC      = true
NO_NEW_AUTH_API        = true
```

## Immutable prohibitions

1. No frontend RBAC / entitlement engine.  
2. No fabricated session or ops capability.  
3. No `/forbidden` Feature Screen.  
4. No secrets in ST-LOCAL/SHARED/DERIVED or component props.  
5. No new auth Domains or routes.  
6. No bypass of existing API authentication.

---

# 12. Release Gate

## Gate ID

`product-frontend-security-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| SEC-AUTH | Auth boundary | May/must-not + existing DOM-AUTH only |
| SEC-VIS | Permission visibility | Visibility ≠ authorization; customer/ops split |
| SEC-SES | Session handling | SES-* lifecycle + no credential storage |
| SEC-GRD | Guard behavior | PD-4.2 GRD-* security reading intact |
| SEC-FB | Safe fallbacks | Only allowed fallbacks; no new security Screens |
| SEC-UF | UNAUTH/FORBIDDEN/EXPIRED | Presentation classes + recovery rules |
| SEC-SENS | Sensitive data | Secrets/PII/ops/artifact rules present |
| SEC-SCOPE | Upstream intact | PD-1…3 / PD-4.1–4.5 / M11–M15 unmodified; single new file only |

## Verdict

```
PD-4.6 Gate = PASS
  iff SEC-AUTH ∧ SEC-VIS ∧ SEC-SES ∧ SEC-GRD
    ∧ SEC-FB ∧ SEC-UF ∧ SEC-SENS ∧ SEC-SCOPE all PASS
```

---

# 13. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-SEC-01 | Auth boundary defined | ✓ |
| AC-SEC-02 | Permission visibility + session + guards defined | ✓ |
| AC-SEC-03 | Fallbacks + UNAUTH/FORBIDDEN/EXPIRED handling defined | ✓ |
| AC-SEC-04 | Sensitive data handling + freeze + Release Gate present | ✓ |
| AC-SEC-05 | Frontend owns no business logic; existing Domains/APIs only | ✓ |
| AC-SEC-06 | Markdown only; no additional files; upstream unmodified | ✓ |

## Verdict

```
PD-4.6 document PASS iff AC-SEC-01 … AC-SEC-06 PASS
```

---

# Document Statement

PD-4.6 Frontend Security locks safe UI behavior around existing auth.

```
Server enforces authorization
UI observes session/ops and presents visibility + guards
UNAUTH / FORBIDDEN / EXPIRED → safe Entry / error / unavailable
No secrets, no RBAC engine, no business logic in frontend
```
