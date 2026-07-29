# PD-7.4 — Customer Readiness

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Customer Readiness

## Version

`product-delivery-pd-7.4-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-1 / PD-2.6 | Personas, Golden Paths, acceptance |
| PD-3.8 / PD-4.8 | UI / FE baselines (Screens SCR-01…09) |
| PD-5.8 / PD-6.8 | BE / Integration baselines |
| PD-2.4 / PD-2.5 | Existing tenant / entitlements / APIs; M11–M15 |
| PD-7.1 … PD-7.3 | Release / deploy / operational readiness |
| M13 OS | Tenant / workspace / access ownership |

## Purpose

Define **customer readiness**: when a customer tenant can be onboarded, configured, licensed, trained, and handed to support against frozen Product Delivery baselines.

**Reuse only.** Uses existing tenant/workspace/entitlements/auth surfaces. Invents no new Domains, API families, Screens, or commercial engines.

---

# 1. Customer Readiness Scope

## 1.1 In scope

| Scope ID | Coverage |
|----------|----------|
| CR-SCOPE | Customer / persona readiness boundary |
| CR-TENANT | Tenant onboarding readiness |
| CR-WS | Workspace / project readiness |
| CR-LIC | License / entitlement readiness |
| CR-CFG | Customer configuration readiness |
| CR-TRAIN | Training readiness |
| CR-HO | Support handoff |
| CR-GATE | Release Gate + Freeze |

## 1.2 Out of scope

| Item | Reason |
|------|--------|
| New billing checkout / license Domain | Forbidden — reuse entitlements surface |
| New onboarding Screens beyond SCR-01…09 | UI freeze |
| New tenant API families | Forbidden |
| Modification of PD-1…PD-7.3 or M11–M15 | Forbidden |
| Additional files | Task constraint |

## 1.3 Customer readiness subjects

| Subject | Personas (PD-1) | Dominant Golden Paths |
|---------|-----------------|------------------------|
| Enterprise customer | PER-01 | GP-01 / GP-01R |
| Tender customer | PER-02 | GP-02 |
| Sales consultant | PER-03 | GP-03 |
| Platform admin (ops customer of the platform) | PER-06 | GP-04 |
| Supplier / Partner | PER-04 / PER-05 | Supporting — no new MVP Surfaces |

MVP customer readiness focuses on **PER-01 / PER-02 / PER-03 / PER-06**. Supporting personas reuse existing capabilities only.

## 1.4 Principles

1. **Reuse only** — tenant/workspace via existing `/api/v80/tenant/run`, entitlements via `/api/v80/entitlements`, auth via FAM-AUTH.  
2. **Tenant ≠ environment** — customers live as tenants inside ENV-PROD.  
3. **Backend enforces entitlements; FE only presents outcomes.**  
4. **No new Screens** for onboarding theater.  
5. **Training teaches frozen Golden Paths**, not engine names.  
6. **Support handoff requires operational readiness (PD-7.3).**

---

# 2. Tenant Onboarding Readiness

## 2.1 Onboarding definition

Tenant onboarding is ready when a customer organization can be established and accessed through **existing** M13 / DOM-TENANT / auth surfaces — without inventing a parallel onboarding Domain.

## 2.2 Existing surfaces (reuse)

| Concern | Existing surface |
|---------|------------------|
| Tenant / workspace bootstrap | `/api/v80/tenant/run` |
| Org/tenant ops view | `/api/enterprise-saas/tenant/run` |
| Sign-in / session | `/api/auth/*`, `/api/auth/me` |
| Optional planning bootstrap | `/api/onboarding/submit` (NEAREST where mapped) |

## 2.3 Tenant onboarding checks

| Check ID | Pass condition |
|----------|----------------|
| TOR-01 | Auth path works for first admin / user of tenant |
| TOR-02 | Tenant bootstrap uses existing tenant/run (or mapped NEAREST) only |
| TOR-03 | Tenant isolation verified (foreign tenant probe safe deny) |
| TOR-04 | Non-prod onboarding uses synthetic tenants only |
| TOR-05 | Prod onboarding does not require new API families |
| TOR-06 | Admin org visibility (if needed) uses existing enterprise-saas tenant surface |

## 2.4 Tenant rules

| Rule | Statement |
|------|-----------|
| TOR-R1 | Per-tenant micro-apps / APIs forbidden |
| TOR-R2 | Onboarding scripts must not mint FE session flags as SoT |
| TOR-R3 | Failed auth ⇒ stop onboarding; fail closed |

---

# 3. Workspace Readiness

## 3.1 Workspace definition

Workspace readiness means the customer can reach and use project/workspace context for in-scope Golden Paths via existing project/workspace APIs and Screens SCR-02…08.

## 3.2 Existing surfaces (reuse)

| Concern | Existing surface / Screen |
|---------|---------------------------|
| Start planning / workspace | `StartPlanning` → tenant/run / onboarding |
| Project list / continue | SCR-07; `/api/project/*` |
| AI Workspace | SCR-04; workspace summary / autopilot as mapped |
| Project context cue | ST-CONTEXT / shell context (FE) + Domain project SoT |

## 3.3 Workspace checks

| Check ID | Pass condition |
|----------|----------------|
| WSR-01 | Customer can create/enter workspace path for their GP (existing Commands) |
| WSR-02 | `projectId` cue works; missing cue shows Empty/guide — not Domain invent |
| WSR-03 | Continue project (GP-01R) works via existing project APIs |
| WSR-04 | Workspace reads do not mutate Domain incorrectly |
| WSR-05 | Tenant-scoped project lists only show caller tenant |

## 3.4 Workspace rules

| Rule | Statement |
|------|-----------|
| WSR-R1 | Workspace ≠ deploy environment |
| WSR-R2 | No per-customer workspace product Domain |
| WSR-R3 | FE context cues never expand tenant scope |

---

# 4. License Readiness

## 4.1 License / entitlement definition

License readiness means the customer’s plan/entitlements can be **observed and enforced** through existing `/api/v80/entitlements` (and related OS surfaces) — not through a new billing Domain invented for release.

## 4.2 Existing surfaces (reuse)

| Concern | Existing surface |
|---------|------------------|
| Plan entitlements | `/api/v80/entitlements` |
| Access / ops capability | Auth me + existing ops/auth surfaces |
| Admin usage observation | `/api/enterprise-saas/usage/run`, `/api/v80/ops/metrics` |

## 4.3 License checks

| Check ID | Pass condition |
|----------|----------------|
| LIC-01 | Entitlements endpoint reachable for authorized callers |
| LIC-02 | Backend enforces entitlement outcomes on Commands that depend on them |
| LIC-03 | FE does not invent entitlement matrices or “unlock” Features locally |
| LIC-04 | Denied entitlement → safe FORBIDDEN / Domain reject — no fake success |
| LIC-05 | No new license checkout API family for MVP readiness |

## 4.4 License rules

| Rule | Statement |
|------|-----------|
| LIC-R1 | Visibility of a CTA ≠ licensed capability |
| LIC-R2 | Commercial packaging changes require Product Planning revision — not PD-7.4 invention |
| LIC-R3 | Usage metrics are observation, not a new metering Domain |

---

# 5. Configuration Readiness

## 5.1 Customer configuration classes

| Class | Examples | Owner |
|-------|----------|-------|
| CFG-ACCESS | Users/sign-in readiness | M13 / auth |
| CFG-PREF | Language preference (PREF) | M13 / DOM-PREF |
| CFG-GOAL | Goal entry path (SCR-01) | FE presentation + existing bootstrap |
| CFG-TENANT | Tenant/workspace knobs via existing tenant surfaces | M13 |
| CFG-OPS | Admin ops areas for PER-06 | M13 (+ M15 governance) |

## 5.2 Configuration checks

| Check ID | Pass condition |
|----------|----------------|
| CFR-01 | Required customer config done via existing Screens/Commands only |
| CFR-02 | Language preference works without new API |
| CFR-03 | Secrets/credentials never placed in customer-visible config dumps |
| CFR-04 | Customer config cannot disable tenant isolation |
| CFR-05 | Admin config uses SCR-09 / existing ops APIs only |

## 5.3 Configuration rules

| Rule | Statement |
|------|-----------|
| CFG-R1 | No customer-specific Feature flags that invent Domains |
| CFG-R2 | Config readiness ≠ schema redesign |
| CFG-R3 | Customer cannot configure cross-tenant access |

---

# 6. Training Readiness

## 6.1 Training scope (frozen product only)

| Audience | Must be able to complete |
|----------|--------------------------|
| PER-01 | GP-01 / GP-01R on SCR-01→… using existing CTAs |
| PER-02 | GP-02 tender path |
| PER-03 | GP-03 sales/opportunity path |
| PER-06 | GP-04 admin observation areas |

Training materials teach **user-facing Objects/labels** (PD-3.1), not engine/Domain module names.

## 6.2 Training checks

| Check ID | Pass condition |
|----------|----------------|
| TRN-01 | Golden Path walkthrough exists for each in-scope persona |
| TRN-02 | Materials map to SCR-01…09 only — no fictional Screens |
| TRN-03 | Failure classes explained: Sign In, Empty, Error, Unavailable |
| TRN-04 | Async/processing status explained without inventing APIs |
| TRN-05 | Admin training covers ops observation — not privilege escalation hacks |

## 6.3 Training rules

| Rule | Statement |
|------|-----------|
| TRN-R1 | Training must not document forbidden Domain bypasses |
| TRN-R2 | Training readiness does not add product Features |
| TRN-R3 | Supplier/Partner training (if any) stays on existing supporting surfaces |

---

# 7. Support Handoff

## 7.1 Handoff definition

Support handoff is ready when customer-facing operation can be supported using frozen product behavior plus PD-7.3 operational readiness — without new support Domains.

## 7.2 Handoff package (logical)

| Item | Content |
|------|---------|
| Customer profile | Tenant id (opaque), in-scope personas, in-scope GPs |
| Access | How Sign In works; who is tenant admin |
| Entitlements | Observed via existing entitlements surface |
| Known limits | Closed Screen/API/Domain inventories |
| Escalation | Auth / job / integrity / rollback owners (PD-7.3) |
| Evidence rules | Secret-safe; tenant-safe |

## 7.3 Support handoff checks

| Check ID | Pass condition |
|----------|----------------|
| HO-01 | PD-7.3 OPERATIONALLY_READY for ENV-PROD |
| HO-02 | Support knows GP failure → recovery (re-auth / retry / safe NAV) |
| HO-03 | Support knows existing ops signals for escalation |
| HO-04 | Customer contacts / tenant admin identified |
| HO-05 | No handoff step requires direct DB edit or new API |
| HO-06 | Rollback/abort awareness present for release incidents |

## 7.4 Handoff rules

| Rule | Statement |
|------|-----------|
| HO-R1 | Handoff ≠ inventing a CRM Domain |
| HO-R2 | Support must not grant entitlements by FE flag edits |
| HO-R3 | Missing operational readiness ⇒ customer handoff NOT_READY |

---

# 8. Customer Readiness Formula

## 8.1 Per-customer / per-cohort

```
CUSTOMER_READY = PASS
  iff TOR-* ∧ WSR-* ∧ LIC-* ∧ CFR-* ∧ TRN-* ∧ HO-* all PASS
    for the in-scope personas / Golden Paths of that customer
```

## 8.2 Release linkage

```
Allow customer go-live enablement
  iff CUSTOMER_READY
    ∧ PD-7.1 RELEASE_READY ∧ GNG GO
    ∧ PD-7.2 DEPLOY_READY_PROD
    ∧ PD-7.3 OPERATIONALLY_READY
```

## 8.3 Blocking conditions

| Condition | Result |
|-----------|--------|
| Auth/tenant bootstrap broken | BLOCKED |
| Entitlements unenforceable / FE-only unlock | BLOCKED |
| Training documents non-existent Screens/APIs | NOT_READY |
| Support handoff without ops readiness | NOT_READY |
| Cross-tenant access possible | NO-GO |

---

# 9. Release Gate

## Gate ID

`product-customer-readiness-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| CUR-SCOPE | Customer readiness scope | Personas / GPs / principles |
| CUR-TENANT | Tenant onboarding | TOR-* |
| CUR-WS | Workspace readiness | WSR-* |
| CUR-LIC | License readiness | LIC-* |
| CUR-CFG | Configuration readiness | CFR-* |
| CUR-TRAIN | Training readiness | TRN-* |
| CUR-HO | Support handoff | HO-* + formula |
| CUR-UP | Upstream intact | Reuse only; PD-1…PD-7.3 / M11–M15 unmodified; single new file |

## Verdict

```
PD-7.4 Gate = PASS
  iff CUR-SCOPE ∧ CUR-TENANT ∧ CUR-WS ∧ CUR-LIC
    ∧ CUR-CFG ∧ CUR-TRAIN ∧ CUR-HO ∧ CUR-UP all PASS
```

---

# 10. Freeze Summary

```
CUSTOMER_READINESS_ID  = product-customer-readiness-v1
PERSONAS_IN_SCOPE      = PER-01 | PER-02 | PER-03 | PER-06
GOLDEN_PATHS           = GP-01 | GP-01R | GP-02 | GP-03 | GP-04
TENANT_SURFACES        = /api/v80/tenant/run | enterprise-saas tenant | auth
LICENSE_SURFACE        = /api/v80/entitlements
FORMULA                = CUSTOMER_READY
REQUIRES               = RELEASE_READY ∧ DEPLOY_READY_PROD ∧ OPERATIONALLY_READY
REUSE_ONLY             = true
NO_NEW_DOMAIN          = true
NO_NEW_API_FAMILY      = true
NO_NEW_SCREEN          = true
```

## Immutable statements

1. Customer readiness reuses frozen Screens, APIs, Domains only.  
2. Tenant/workspace/license use existing surfaces — no new commercial Domain.  
3. Training and support teach Golden Paths — not engine bypasses.  
4. CUSTOMER_READY requires release + deploy + operational readiness.  
5. Upstream PD-1…PD-7.3 and M11–M15 unmodified by this task.

## Handoff

```
Release (PD-7.1)       = GO / NO-GO
Deploy (PD-7.2)        = ENV cutover
Operate (PD-7.3)       = monitor / incident / support ops
Customer (PD-7.4)      = onboard / configure / train / hand off tenant
Enable customer        = all four aligned
```

---

# 11. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-CUR-01 | Customer readiness scope defined | ✓ |
| AC-CUR-02 | Tenant + workspace + license readiness defined | ✓ |
| AC-CUR-03 | Configuration + training + support handoff defined | ✓ |
| AC-CUR-04 | Release Gate + Freeze summary present | ✓ |
| AC-CUR-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-7.4 document PASS iff AC-CUR-01 … AC-CUR-05 PASS
```

---

# Document Statement

PD-7.4 Customer Readiness locks when a customer can be enabled on the frozen product.

```
Tenant → Workspace → Entitlements → Config → Train → Support handoff
Existing surfaces only
Reuse only · No new Domains/APIs/Screens
```
