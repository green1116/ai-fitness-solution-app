# PD-6.7 — Integration Readiness

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Integration Readiness

## Version

`product-delivery-pd-6.7-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-6.1 … PD-6.6 | Integration arch → validation |
| PD-4 / PD-5 freezes | FE / BE baselines |
| PD-5.6 / PD-5.7 | Reliability / deployment |
| PD-2.4 / PD-2.5 / PD-2.6 | APIs, Domains, Golden Path AC |
| M11–M15 | Existing Domains only |

## Purpose

Define **integration readiness**: when the frozen FE ↔ BE seam is ready for environment promotion and go-live, without inventing Domains, APIs, or product surfaces.

**Reuse only.** Readiness consumes PD-6.6 validation outcomes and existing ops/health surfaces.

---

# 1. Readiness Model

## 1.1 Readiness dimensions

| Dimension ID | Meaning | Primary refs |
|--------------|---------|--------------|
| RDY-ENV | Target environment isolable and correctly configured | PD-5.7 |
| RDY-DEP | Required APIs / Domains / runtimes reachable | PD-2.4 / PD-5.1–5.2 |
| RDY-DATA | Persistence SoT / migrations / tenant scope ready | PD-5.4 |
| RDY-SEC | Authn/z, secrets, tenant isolation ready | PD-6.4 / PD-5.5 |
| RDY-OPS | Health / metrics / jobs / rollback observable | PD-5.6 / PD-6.5 |
| RDY-VAL | Integration validation AC-REL-* PASS | PD-6.6 |
| RDY-GL | Go-live checklist complete for ENV-PROD | This doc §7 |

## 1.2 Readiness states

| State | Meaning |
|-------|---------|
| NOT_READY | Any blocking check FAIL / unknown |
| DEGRADED | Non-blocking gap; no ENV-PROD promote |
| READY_STAGING | Staging promote candidate PASS |
| READY_PROD | Go-live checklist PASS |
| BLOCKED | Security / data / health red — fail closed |

## 1.3 Principles

1. **Reuse only** — readiness asserts frozen inventories.  
2. **Validation before readiness** — PD-6.6 AC-REL-* required.  
3. **Fail closed** — red health/auth/tenant blocks go-live.  
4. **Env ≠ tenant** — readiness is per ENV-*; tenants remain data-scoped.  
5. **FE consumes; BE enforces** — UI readiness ≠ Domain authz.  
6. **No new Domains / API families** to declare “ready.”

## 1.4 Readiness formula (staging)

```
READY_STAGING
  iff RDY-ENV ∧ RDY-DEP ∧ RDY-DATA ∧ RDY-SEC ∧ RDY-OPS ∧ RDY-VAL all PASS
```

## 1.5 Readiness formula (production go-live)

```
READY_PROD
  iff READY_STAGING
    ∧ RDY-GL all PASS
    ∧ ENV-STAGING → ENV-PROD promotion gates PASS (PD-5.7)
```

---

# 2. Environment Readiness

## 2.1 Per-environment expectations

| Env | Ready when |
|-----|------------|
| ENV-LOCAL | Build runs; synthetic fixtures; no prod secrets |
| ENV-DEV | FE+BE against existing APIs; isolated stores |
| ENV-STAGING | Full AC-REL-* + health/auth smoke; masked/synthetic data |
| ENV-PROD | READY_PROD; real tenants; secrets injected; rollback artifact identified |

## 2.2 Environment checks

| Check ID | Pass condition |
|----------|----------------|
| ER-ISO | No lower-env write path to ENV-PROD stores |
| ER-CFG | Non-secret config present; endpoints point to this env only |
| ER-SEC-INJECT | Secrets injected from env secret store — not in artifacts/FE bundle |
| ER-ART | Deploy references ART-META set (PD-5.7) |
| ER-MIG | Domain migrations applied or confirmed N/A before traffic |
| ER-PROMOTE | Promotion path LOCAL→DEV→STAGING→PROD respected |

## 2.3 Environment rules

| Rule | Statement |
|------|-----------|
| ENV-01 | Staging PASS required before PROD promote |
| ENV-02 | Hot-edit PROD without release artifact ⇒ NOT_READY |
| ENV-03 | Env flags must not invent Domains/API families |

---

# 3. Dependency Readiness

## 3.1 Dependency catalogue (reuse)

| Dependency | Existing surface / owner | Blocking for |
|------------|--------------------------|--------------|
| Auth / session | FAM-AUTH / M13 | All protected GP-* |
| Projects / workspace | FAM-PROJECT / WORKSPACE / M13 | GP-01/01R/02/03 |
| Tender / knowledge | FAM-V80 tender / TENDER / M11 | GP-02 |
| Agent / jobs | FAM-V80 autopilot / M12 | Generate / async paths |
| Intelligence / budget | FAM-V80 budget / plan / M14 | GP-01/03 results |
| Documents / PDF | FAM-DOCUMENTS / PDF / M11 | Download/preview |
| Share / delivery | FAM-DOWNLOAD / M15 | Share Commands |
| Ops / health / metrics | FAM-OPS / v80 ops / M13 (+ M15) | GP-04 + go-live ops |

## 3.2 Dependency checks

| Check ID | Pass condition |
|----------|----------------|
| DR-REACH | Required families for in-scope GPs respond (authn as required) |
| DR-BIND | Adapter/Service bindings ⊆ PD-2.4 only |
| DR-JOB | Job runtime reachable if Generate in scope |
| DR-SUP | Supporting Domain degrade policy documented — no silent fake success |
| DR-NO-NEW | No undeclared dependency Domain/API |

## 3.3 Dependency rules

| Rule | Statement |
|------|-----------|
| DEP-01 | Missing preferred v80 twin ⇒ use documented secondary only |
| DEP-02 | Unreachable auth ⇒ BLOCKED for protected traffic |
| DEP-03 | Job runtime down ⇒ generation NOT_READY; reads may continue if contracted |

---

# 4. Data Readiness

## 4.1 Data readiness checks

| Check ID | Pass condition |
|----------|----------------|
| DAR-SOT | Domain persistence is SoT; FE ST-SERVER disposable |
| DAR-OWN | Data classes owned by M11–M15 as PD-5.4 |
| DAR-TENANT | Tenant predicates enforced on list/detail smoke |
| DAR-MIG | Schema/migrations Domain-owned; no partial serve on failed migrate |
| DAR-EMPTY | Empty states valid — no fabricated business rows |
| DAR-ARTIFACT | Object/PDF access via existing authorized APIs |
| DAR-SEED | Non-prod uses synthetic/masked data only |

## 4.2 Data rules

| Rule | Statement |
|------|-----------|
| DAT-01 | Prod go-live must not depend on DEV data copies |
| DAT-02 | Cross-tenant probe must fail safely before READY_PROD |
| DAT-03 | Cache warm ≠ data readiness |

---

# 5. Security Readiness

## 5.1 Security checks

| Check ID | Pass condition |
|----------|----------------|
| SR-AUTHN | SignIn + `/api/auth/me` smoke PASS |
| SR-GATE | Protected APIs reject without session |
| SR-OPS | Admin/ops denied without opsCapable |
| SR-TENANT | Foreign id probe FORBIDDEN or safe NOT_FOUND |
| SR-SECRET | No secrets in FE bundle, logs, or release artifacts |
| SR-FAIL | UNAUTH/FORBIDDEN/EXPIRED ⇒ no business write |
| SR-VIS | FE visibility ≠ authz still enforced at Edge/Domain |

## 5.2 Security rules

| Rule | Statement |
|------|-----------|
| SEC-01 | Any SR-* FAIL ⇒ BLOCKED for go-live |
| SEC-02 | GRD-* green without API enforcement ⇒ NOT_READY |
| SEC-03 | Readiness evidence must be secret-safe |

---

# 6. Operational Readiness

## 6.1 Operational checks

| Check ID | Pass condition |
|----------|----------------|
| OR-HEALTH | `/api/v80/ops/health` (+ readiness) PASS for target env |
| OR-METRICS | Metrics/usage smoke reachable for ops principal |
| OR-INTEGRITY | Production integrity check PASS when applicable |
| OR-JOB-VIS | Job/status surfaces observable for async paths |
| OR-RETRY | Bounded retry policy wired; no retry on FORBIDDEN |
| OR-TIMEOUT | TO-* budgets configured (values env-specific) |
| OR-ROLLBACK | Prior ART-META identified; rollback path known |
| OR-ALERT | Alert signals map to existing health/metrics/audit — no new family |
| OR-UNAVAIL | FE `/unavailable` / META-ERROR path verified |

## 6.2 Operational rules

| Rule | Statement |
|------|-----------|
| OPS-01 | Red health ⇒ NOT_READY / BLOCKED |
| OPS-02 | Canary monitor uses existing signals only |
| OPS-03 | Customer Screens are not paging responders |
| OPS-04 | In-flight jobs reconciled from STF-JOB after rollback |

---

# 7. Go-live Checklist

## 7.1 Preconditions

| # | Item | Pass |
|---|------|------|
| GL-01 | PD-4 / PD-5 / PD-6.1…6.6 baselines consumed (reuse only) | ☐ |
| GL-02 | PD-6.6 AC-REL-* PASS on ENV-STAGING | ☐ |
| GL-03 | RDY-ENV … RDY-OPS PASS on ENV-STAGING | ☐ |
| GL-04 | Release artifact ART-META tagged; secrets not included | ☐ |
| GL-05 | Rollback artifact + config revision identified | ☐ |

## 7.2 Production cutover

| # | Item | Pass |
|---|------|------|
| GL-06 | Migrations applied (Domain-owned) or confirmed N/A | ☐ |
| GL-07 | DV-HEALTH / DV-AUTH / DV-FE PASS on ENV-PROD | ☐ |
| GL-08 | DV-SMOKE-GP subset PASS (in-scope Golden Paths) | ☐ |
| GL-09 | SR-TENANT / SR-OPS spot checks PASS | ☐ |
| GL-10 | Job path smoke PASS if Generate in scope | ☐ |
| GL-11 | Canary or RO-ALL per PD-5.7; error budget acceptable | ☐ |
| GL-12 | Ops on-call knows existing health/metrics/integrity surfaces | ☐ |

## 7.3 Exit / abort

| # | Item | Pass |
|---|------|------|
| GL-13 | Abort criteria known: auth down / health red / integrity fail / tenant leak | ☐ |
| GL-14 | Abort action = rollback prior ART-META (not invent Domain hotfix) | ☐ |
| GL-15 | Post-go-live: prefer Domain refetch over trusting FE caches | ☐ |

## 7.4 Go-live verdict

```
RDY-GL = PASS iff GL-01 … GL-15 all PASS
READY_PROD = PASS iff READY_STAGING ∧ RDY-GL PASS
```

---

# 8. Release Gate

## Gate ID

`product-integration-readiness-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| IRD-MODEL | Readiness model | Dimensions + states + formulas |
| IRD-ENV | Environment readiness | ER-* + env rules |
| IRD-DEP | Dependency readiness | Catalogue + DR-* |
| IRD-DATA | Data readiness | DAR-* |
| IRD-SEC | Security readiness | SR-* (blocking) |
| IRD-OPS | Operational readiness | OR-* |
| IRD-GL | Go-live checklist | GL-01…15 defined |
| IRD-SCOPE | Reuse only / upstream intact | No new Domains/APIs; PD-1…PD-6.6 / M11–M15 unmodified; single new file |

## Verdict

```
PD-6.7 Gate = PASS
  iff IRD-MODEL ∧ IRD-ENV ∧ IRD-DEP ∧ IRD-DATA
    ∧ IRD-SEC ∧ IRD-OPS ∧ IRD-GL ∧ IRD-SCOPE all PASS
```

---

# 9. Freeze Summary

```
INTEGRATION_READINESS_ID = product-integration-readiness-v1
VALIDATION_REF           = product-integration-validation-v1
DEPLOY_REF               = product-backend-deployment-architecture-v1
DIMENSIONS               = ENV | DEP | DATA | SEC | OPS | VAL | GL
STATES                   = NOT_READY | DEGRADED | READY_STAGING | READY_PROD | BLOCKED
PROMOTE_STAGING          = READY_STAGING formula
GO_LIVE                  = READY_PROD formula
REUSE_ONLY               = true
NO_NEW_DOMAIN            = true
NO_NEW_API_FAMILY        = true
```

## Immutable statements

1. Readiness reuses frozen FE/BE/integration baselines only.  
2. AC-REL-* and health/auth are blocking for promote/go-live.  
3. No new Domains, API families, or readiness-only product surfaces.  
4. Fail closed on security/health/tenant failures.  
5. Upstream PD-1…PD-6.6 and M11–M15 unmodified by this task.

---

# 10. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-IRD-01 | Readiness model + formulas defined | ✓ |
| AC-IRD-02 | Environment + dependency readiness defined | ✓ |
| AC-IRD-03 | Data + security + operational readiness defined | ✓ |
| AC-IRD-04 | Go-live checklist + Release Gate + Freeze present | ✓ |
| AC-IRD-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.7 document PASS iff AC-IRD-01 … AC-IRD-05 PASS
```

---

# Document Statement

PD-6.7 Integration Readiness locks when the frozen FE ↔ BE seam may promote and go live.

```
READY_STAGING = env + deps + data + security + ops + validation
READY_PROD = READY_STAGING + go-live checklist
Reuse only · Fail closed · No new Domains/APIs
```
