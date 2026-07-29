# PD-7.2 — Deployment Readiness

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Deployment Readiness

## Version

`product-delivery-pd-7.2-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-5.7 | Deployment architecture (ENV-*, ART-*, promote/rollback) |
| PD-5.6 | Health / metrics / integrity / jobs |
| PD-6.6 / PD-6.7 | Validation AC-REL-*; READY_STAGING / READY_PROD |
| PD-7.1 | Release readiness GO / NO-GO |
| PD-4.8 / PD-5.8 / PD-6.8 | FE / BE / Integration freezes |
| M11–M15 | Existing Domains only |

## Purpose

Define **deployment readiness**: when a Release Candidate may be deployed and promoted across ENV-* without inventing Domains, API families, or product surfaces.

**Reuse only.** Consumes PD-5.7 deployment rules and PD-7.1 release criteria. Backend owns deploy behavior; frontend consumes deployed capabilities.

---

# 1. Deployment Scope

## 1.1 In scope

| Scope ID | Coverage |
|----------|----------|
| DS-ENV | Environment isolation & target readiness |
| DS-ART | Build / release artifact readiness |
| DS-CFG | Config / secret injection readiness |
| DS-PROM | Promotion path & gates |
| DS-RB | Rollback readiness for deploy |
| DS-TENANT | Tenant / workspace boundary at deploy time |
| DS-HEALTH | Health / smoke post-deploy |
| DS-GATE | Release Gate + Freeze |

## 1.2 Out of scope

| Item | Reason |
|------|--------|
| New Domains / API families / Screens | Forbidden |
| Cloud vendor lock-in as product Domain | Implementation |
| Modification of PD-1…PD-7.1 or M11–M15 | Forbidden |
| Additional files | Task constraint |

## 1.3 Deployment candidate

A **Deployment Candidate (DC)** is an RC (PD-7.1) plus target `ENV-*` for which:

- ART-META is immutable and cited,
- env-specific config/secrets are prepared,
- deploy validation plan uses existing DV-* surfaces only.

## 1.4 Principles

1. **Reuse only** — existing FAM-* / M11–M15 / DV-* only.  
2. **Promote artifacts, not ad-hoc servers.**  
3. **Secrets never in artifacts.**  
4. **Tenant ≠ environment.**  
5. **Validate before promote; fail closed on red health.**  
6. **Rollback target mandatory before PROD cutover.**  
7. **RELEASE_READY (PD-7.1) required before ENV-PROD Go.**

---

# 2. Environment Readiness

## 2.1 Environment catalogue (PD-5.7)

| Env | Deploy-ready when |
|-----|-------------------|
| ENV-LOCAL | Buildable; synthetic data; no prod secrets |
| ENV-DEV | Isolated stores; FE+BE against existing APIs |
| ENV-STAGING | READY_STAGING (PD-6.7); AC-REL-* PASS |
| ENV-PROD | PD-7.1 GO + this doc DEPLOY_READY_PROD |

## 2.2 Environment checks

| Check ID | Pass condition |
|----------|----------------|
| DER-01 | Target ENV-* identity clear; no cross-env store pointers |
| DER-02 | Lower envs cannot write ENV-PROD data |
| DER-03 | Prod config does not point at DEV stores |
| DER-04 | Network/identity credentials scoped to target env |
| DER-05 | Jobs/runtimes scoped to target env (no cross-env drain) |
| DER-06 | Promotion path LOCAL→DEV→STAGING→PROD respected for PROD |

## 2.3 Environment rules

| Rule | Statement |
|------|-----------|
| ENV-R1 | Staging red ⇒ not ready for PROD deploy |
| ENV-R2 | Env flags must not invent Domains/APIs |
| ENV-R3 | Hot-edit PROD without ART-META ⇒ NOT_READY |

---

# 3. Build Artifact Readiness

## 3.1 Artifact set (PD-5.7)

| Artifact | Deploy-ready when |
|----------|-------------------|
| ART-BE-API | Built; existing API families only |
| ART-BE-DOMAIN | M11–M15 adapters only |
| ART-BE-WORKER | Present if async Generate in scope |
| ART-FE-WEB | FE freeze; APIs only |
| ART-MIG | Planned/applied per Domain ownership |
| ART-CFG-TEMPLATE | Non-secret placeholders |
| ART-META | Versions, digests, baseline refs (UI/FE/BE/INT) |

## 3.2 Artifact checks

| Check ID | Pass condition |
|----------|----------------|
| DAR-01 | ART-META complete for DC |
| DAR-02 | Digests match built outputs |
| DAR-03 | Baseline freeze IDs recorded on manifest |
| DAR-04 | No secrets inside ART-* |
| DAR-05 | No new API family / Domain package in build |
| DAR-06 | FE bundle contains no Domain engines |
| DAR-07 | Prior ART-META retained for rollback |

## 3.3 Artifact rules

| Rule | Statement |
|------|-----------|
| ART-R1 | Deploy references ART-META only |
| ART-R2 | Rebuild without retag ⇒ not a new immutable RC |
| ART-R3 | Worker omitted while Generate in scope ⇒ NOT_READY |

---

# 4. Config / Secret Readiness

## 4.1 Config classes

| Class | Ready when |
|-------|------------|
| CFG-PUBLIC | Safe public endpoints/flags; no Domain invention |
| CFG-ENV | Per-env URLs, timeout budgets set |
| CFG-DOMAIN | Domain knobs under M11–M15 meaning only |
| SEC-SECRET | Injected from secret store for target env |
| SEC-SESSION | Runtime session via existing auth only |

## 4.2 Config / secret checks

| Check ID | Pass condition |
|----------|----------------|
| CSR-01 | Target env config present and reviewed |
| CSR-02 | Prod/non-prod secret sets distinct |
| CSR-03 | Secrets not in git, ART-*, or FE bundle |
| CSR-04 | Auth/session mechanism configured (FAM-AUTH) |
| CSR-05 | Object-store / DB credentials injected (not hardcoded) |
| CSR-06 | Deploy logs secret-safe |
| CSR-07 | Config change does not add API families/Domains |

## 4.3 Config rules

| Rule | Statement |
|------|-----------|
| CFG-R1 | Missing prod secrets ⇒ NO deploy |
| CFG-R2 | Entitlements come from existing APIs — not ad-hoc deploy JSON Domains |
| CFG-R3 | Config-only “hotfix Domain” ⇒ forbidden |

---

# 5. Promotion / Rollback Readiness

## 5.1 Promotion readiness

| From → To | Ready when |
|-----------|------------|
| LOCAL → DEV | Build + basic contract checks |
| DEV → STAGING | Integration against existing APIs; no family drift |
| STAGING → PROD | READY_STAGING + PD-7.1 RELEASE_READY + GNG GO + rollback known |
| Emergency PROD | Explicit procedure **without** new Domains/APIs |

## 5.2 Promotion checks

| Check ID | Pass condition |
|----------|----------------|
| PRR-01 | Prior env validation PASS for this ART-META |
| PRR-02 | Migrations planned for target before traffic |
| PRR-03 | Canary or RO-ALL strategy chosen (PD-5.7) |
| PRR-04 | Promote does not rewrite PD-2.4 bindings |
| PRR-05 | On-call / abort owner assigned for PROD |

## 5.3 Rollback readiness (deploy)

| Check ID | Pass condition |
|----------|----------------|
| RBR-01 | Prior ART-META identified |
| RBR-02 | Prior cfg (+ secrets version) identified |
| RBR-03 | Abort triggers known (auth/health/tenant/integrity/scope) |
| RBR-04 | Job reconcile via STF-JOB / existing status |
| RBR-05 | FE prior web artifact available if needed |
| RBR-06 | Migrate reverse only if Domain contract allows |

## 5.4 Promote / rollback rules

| Rule | Statement |
|------|-----------|
| PR-R1 | No rollback target ⇒ not ready for PROD cutover |
| PR-R2 | Failed migrate ⇒ stop promote; no partial schema success |
| PR-R3 | Rollback redeploys prior ART-META — no invent Domain hotfix |
| PR-R4 | Canary must keep authz/tenant isolation |

---

# 6. Tenant / Workspace Readiness

## 6.1 Boundary reminder

| Concept | Deploy meaning |
|---------|----------------|
| ENV-* | Operator deploy target |
| Tenant | Customer isolation (PD-5.5 / PD-6.4) |
| Workspace / project | Product context within tenant (M13) |

## 6.2 Tenant / workspace checks

| Check ID | Pass condition |
|----------|----------------|
| TWR-01 | Deploy does not create per-tenant API families |
| TWR-02 | Non-prod uses synthetic/masked tenants only |
| TWR-03 | Prod serves many tenants in one ENV-PROD |
| TWR-04 | Workspace bootstrap remains existing tenant/workspace APIs |
| TWR-05 | Cross-tenant probe safe deny after deploy smoke |
| TWR-06 | Canary does not weaken tenant isolation tests |

## 6.3 Tenant rules

| Rule | Statement |
|------|-----------|
| TW-R1 | Tenant provisioning ≠ new deploy Domain |
| TW-R2 | Env promotion must not copy DEV tenant data into PROD as SoT |
| TW-R3 | Opaque ids in config are not capability tokens |

---

# 7. Health / Smoke Readiness

## 7.1 Post-deploy checks (existing surfaces)

| Check ID | Uses | Pass condition |
|----------|------|----------------|
| HSR-HEALTH | `/api/v80/ops/health` (+ readiness) | Green for target env |
| HSR-AUTH | `/api/auth/*` + `/api/auth/me` | Sign-in/observe path works |
| HSR-METRICS | `/api/v80/ops/metrics` (ops-auth) | Reachable smoke |
| HSR-INTEGRITY | `/api/v80/production/integrity` | PASS when applicable |
| HSR-FE | ART-FE-WEB | App loads; calls deployed APIs only |
| HSR-GP | DV-SMOKE-GP | In-scope Golden Path Commands PASS |
| HSR-JOB | autopilot/status surfaces | Async path observable if in scope |
| HSR-TENANT | Probe | Foreign id safe deny |

## 7.2 Smoke rules

| Rule | Statement |
|------|-----------|
| SM-R1 | Red health ⇒ deploy NOT_READY / abort promote |
| SM-R2 | No new monitoring API family for smoke |
| SM-R3 | Smoke evidence secret-safe |
| SM-R4 | Prod canary remains tenant-safe |
| SM-R5 | FE smoke does not assert Domain business algorithms |

---

# 8. Deployment Readiness Formulas

## 8.1 Staging deploy

```
DEPLOY_READY_STAGING = PASS
  iff DER-* ∧ DAR-* ∧ CSR-* (staging)
    ∧ PRR-01…02
    ∧ HSR-HEALTH ∧ HSR-AUTH ∧ HSR-FE
    ∧ PD-6.7 READY_STAGING
```

## 8.2 Production deploy

```
DEPLOY_READY_PROD = PASS
  iff DEPLOY_READY_STAGING
    ∧ PD-7.1 RELEASE_READY ∧ GNG GO
    ∧ PRR-03…05 ∧ RBR-01…06
    ∧ TWR-* ∧ HSR-* (prod/canary plan)
    ∧ CSR-* (prod secrets)
```

## 8.3 Verdict linkage

```
Allow STAGING deploy  iff DEPLOY_READY_STAGING
Allow PROD cutover    iff DEPLOY_READY_PROD
Abort / rollback      iff NG-* (PD-7.1) or HSR-HEALTH/AUTH/TENANT/INTEGRITY fail
```

---

# 9. Release Gate

## Gate ID

`product-deployment-readiness-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| DPR-SCOPE | Deployment scope | DC definition + principles |
| DPR-ENV | Environment readiness | DER-* + env rules |
| DPR-ART | Build artifact readiness | DAR-* |
| DPR-CFG | Config / secret readiness | CSR-* |
| DPR-PROM | Promotion / rollback | PRR-* + RBR-* |
| DPR-TENANT | Tenant / workspace | TWR-* |
| DPR-HEALTH | Health / smoke | HSR-* + formulas |
| DPR-UP | Upstream intact | Reuse only; PD-1…PD-7.1 / M11–M15 unmodified; single new file |

## Verdict

```
PD-7.2 Gate = PASS
  iff DPR-SCOPE ∧ DPR-ENV ∧ DPR-ART ∧ DPR-CFG
    ∧ DPR-PROM ∧ DPR-TENANT ∧ DPR-HEALTH ∧ DPR-UP all PASS
```

---

# 10. Freeze Summary

```
DEPLOYMENT_READINESS_ID = product-deployment-readiness-v1
DEPLOY_ARCH_REF         = product-backend-deployment-architecture-v1
RELEASE_READY_REF       = product-release-readiness-v1
ENVIRONMENTS            = LOCAL | DEV | STAGING | PROD
FORMULAS                = DEPLOY_READY_STAGING | DEPLOY_READY_PROD
ARTIFACTS               = BE-API | BE-DOMAIN | BE-WORKER | FE-WEB | MIG | CFG-TEMPLATE | META
SECRETS_IN_ARTIFACTS    = false
TENANT_IS_ENV           = false
REUSE_ONLY              = true
NO_NEW_DOMAIN           = true
NO_NEW_API_FAMILY       = true
```

## Immutable statements

1. Deployment readiness reuses PD-5.7 / PD-6.7 / PD-7.1 only.  
2. PROD cutover requires DEPLOY_READY_PROD.  
3. Secrets never ship in artifacts; tenant ≠ env.  
4. Red health/auth/tenant/integrity aborts promote.  
5. No new Domains/APIs for deploy convenience.  
6. Upstream PD-1…PD-7.1 and M11–M15 unmodified by this task.

## Handoff

```
Release Readiness (PD-7.1)     = GO criteria
Deployment Readiness (PD-7.2)  = ENV deploy/promote criteria
PROD cutover                   = DEPLOY_READY_PROD only
```

---

# 11. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-DPR-01 | Deployment scope + environment readiness defined | ✓ |
| AC-DPR-02 | Artifact + config/secret readiness defined | ✓ |
| AC-DPR-03 | Promotion/rollback + tenant/workspace readiness defined | ✓ |
| AC-DPR-04 | Health/smoke + formulas + Release Gate + Freeze present | ✓ |
| AC-DPR-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-7.2 document PASS iff AC-DPR-01 … AC-DPR-05 PASS
```

---

# Document Statement

PD-7.2 Deployment Readiness locks when an RC may deploy and promote across environments.

```
DEPLOY_READY_STAGING → promote → DEPLOY_READY_PROD → cutover
Artifacts · Config/Secrets · Tenant · Health all blocking
Reuse only · Rollback mandatory · No new Domains/APIs
```
