# PD-5.7 — Deployment Architecture

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Deployment Architecture

## Version

`product-delivery-pd-5.7-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-3.8 / PD-4.8 | UI + Frontend architecture baselines (consumed, not redesigned) |
| PD-2.4 / PD-2.5 | Existing API families; M11–M15 ownership |
| PD-5.1 … PD-5.6 | Backend, API, persistence, security, reliability |
| M11–M15 | Existing Domains only — baselines frozen |

## Purpose

Define **deployment architecture**, **environment boundaries**, **release flow**, **rollout behavior**, and **operational deployment rules**.

**Backend owns deployment behavior** for services, APIs, Domains, and persistence.  
**Frontend only consumes deployed capabilities** (existing APIs / Screens against frozen FE baseline).  
**No new Domains. No new API families.**

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Environment model | Env classes + isolation |
| Build / release / deploy flow | Pipeline stages |
| Release artifact boundary | What is shipped |
| Rollout / rollback behavior | Progressive release + restore |
| Configuration / secret handling | Env config vs secrets |
| Tenant / workspace deployment boundary | Multi-tenant deploy rules |
| Promotion policy | Env promotion gates |
| Deployment validation | Pre/post checks |
| Deployment freeze summary | Lock points |
| Release Gate | Readiness |

## Out of scope

| Item | Reason |
|------|--------|
| Cloud vendor lock-in as product Domain | Implementation |
| New deploy control-plane API families | Forbidden |
| Redesign of M11–M15 baselines | Forbidden |
| Frontend architecture changes | PD-4 freeze |
| Modification of PD-1…PD-5.6 or M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Deployment Principles

1. **Same product contract across envs** — PD-2.4 API families; M11–M15 ownership unchanged.  
2. **Promote artifacts, not ad-hoc servers** — reproducible release artifacts.  
3. **Secrets never in artifacts or git** — injected per environment.  
4. **Tenant data is not an environment** — envs isolate ops; tenants isolate customers (PD-5.5).  
5. **Validate before promote** — health/readiness/integrity + smoke against existing surfaces.  
6. **Rollback is a first-class deploy action** — restore prior artifact + config revision.  
7. **Frontend consumes whatever is deployed** — no FE-owned infra policy.  
8. **No new Domains / API families** to “make deploy work.”

---

# 3. Environment Model

## 3.1 Environment catalogue

| Env ID | Name | Purpose | Production data? |
|--------|------|---------|------------------|
| ENV-LOCAL | Local | Developer workstation | No (fixtures/synthetic) |
| ENV-DEV | Development | Integration of FE+BE against existing APIs | No |
| ENV-STAGING | Staging | Pre-prod validation / promotion candidate | No (or masked) |
| ENV-PROD | Production | Customer Golden Paths | Yes |

Additional named sandboxes are allowed only as **instances of these classes** — not new product Domains.

## 3.2 Environment isolation

| Boundary | Rule |
|----------|------|
| Network / identity | Per-env credentials and endpoints |
| Persistence | Per-env storage instances (PD-5.4 families) — no silent prod reads from lower envs |
| Secrets | Per-env secret sets |
| Tenants | Synthetic tenants in non-prod; real tenants only in ENV-PROD |
| Jobs | Job runtimes scoped per env — no cross-env job drain |

## 3.3 Environment rules

| Rule | Statement |
|------|-----------|
| EM-01 | Lower envs must not write to ENV-PROD stores |
| EM-02 | ENV-PROD config must not point product traffic at DEV stores |
| EM-03 | Feature inventing via env flags must not create new Domains/API families |
| EM-04 | `/api/v80/*` preference remains across envs where mapped |

---

# 4. Build / Release / Deploy Flow

## 4.1 Canonical flow

```
1. Build
   - Compile/bundle backend + frontend delivery artifacts from approved baseline
   - Run automated checks required by Engineering Workflow
2. Release
   - Tag immutable release artifact set (versioned)
   - Record release metadata (artifact ids, commit/baseline refs)
3. Deploy
   - Apply artifact + env config to target ENV-*
   - Run migrations only via Domain-owned migration boundary (PD-5.4)
4. Validate
   - Health / readiness / smoke (PD-5.6 + §10)
5. Promote or Rollback
   - Promote to next env per §9
   - Or rollback per §6
```

## 4.2 Ownership of stages

| Stage | Owner | Frontend role |
|-------|-------|---------------|
| Build FE assets | Delivery pipeline | Source of UI artifact only |
| Build BE services/Domains adapters | Backend delivery | — |
| Release tagging | Backend/ops delivery ownership for runtime | Consumes tag indirectly |
| Deploy runtime | Backend owns deploy behavior | — |
| Smoke UI against APIs | Shared validation | Consumes deployed APIs |

## 4.3 Flow rules

| Rule | Statement |
|------|-----------|
| FL-01 | Do not hot-edit ENV-PROD without a release artifact |
| FL-02 | Do not deploy unscoped Domain experiments as M16 |
| FL-03 | Build must not embed ENV-PROD secrets |
| FL-04 | Deploy order must respect Domain persistence migrations before serving traffic that requires them |

---

# 5. Release Artifact Boundary

## 5.1 Artifact classes

| Artifact ID | Contents | Notes |
|-------------|----------|-------|
| ART-BE-API | API Edge + service handlers | Existing families only |
| ART-BE-DOMAIN | M11–M15 consumption adapters / runtime bindings | No new Domain packages |
| ART-BE-WORKER | Job/autopilot workers if separately shipped | M12 job visibility preserved |
| ART-FE-WEB | Frontend web assets (PD-4 baseline) | Consumes APIs only |
| ART-MIG | Domain schema migrations | Domain-owned (PD-5.4) |
| ART-CFG-TEMPLATE | Non-secret config templates | Placeholders only |
| ART-META | Release manifest (versions, digests, baseline refs) | Immutable with release |

## 5.2 Artifact rules

| Rule | Statement |
|------|-----------|
| RA-01 | A production deploy references a complete ART-META set |
| RA-02 | Secrets are **not** release artifacts |
| RA-03 | Documentation freezes (PD-*) are baselines — not runtime deploy binaries |
| RA-04 | Do not ship new API route packs outside PD-2.4 |
| RA-05 | Frontend artifact must not include Domain business engines |

---

# 6. Rollout / Rollback Behavior

## 6.1 Rollout patterns (allowed)

| Pattern | Use | Constraint |
|---------|-----|------------|
| RO-ALL | Replace env runtime with new artifact | After validation |
| RO-CANARY | Small traffic share then expand | Same artifact; monitor health/errors (PD-5.6) |
| RO-INSTANCE | Rolling instance replace | Keep readiness gates |

Rollout must not invent per-tenant “shadow Domains.”

## 6.2 Rollback patterns

| Pattern | Action |
|---------|--------|
| RB-ART | Redeploy previous ART-META artifact set |
| RB-CFG | Restore previous non-secret config revision (+ secrets version if required) |
| RB-MIG | Forward-fix preferred; reverse only if Domain migration contract supports it (PD-5.4) |
| RB-FE | Redeploy previous ART-FE-WEB if UI regresses — APIs remain compatible per versioning policy |

## 6.3 Rollout / rollback rules

| Rule | Statement |
|------|-----------|
| RR-01 | Rollback target is a prior known-good release — not an improvised hotfix Domain |
| RR-02 | During canary, authz/tenant isolation remain enforced (PD-5.5) |
| RR-03 | Failed migrate ⇒ stop promote; do not serve partial schema as success |
| RR-04 | Job in-flight: drain/reconcile via STF-JOB state after rollback (PD-5.6) |
| RR-05 | Architecture doc rollbacks (PD-4.8 style) ≠ runtime deploy rollback — keep concepts separate |

---

# 7. Configuration / Secret Handling

## 7.1 Configuration classes

| Class | Examples | In artifact? |
|-------|----------|--------------|
| CFG-PUBLIC | Feature presentation toggles that do not invent Domains; public endpoints | Template yes |
| CFG-ENV | Per-env API base URLs, timeout budgets (PD-5.6) | Injected at deploy |
| CFG-DOMAIN | Domain runtime knobs already owned by M11–M15 | Env-injected; Domain-authored meaning |
| SEC-SECRET | DB creds, auth secrets, object-store keys, third-party keys | **Never** in git/artifacts |
| SEC-SESSION | Runtime session material | STF-SESSION only (PD-5.4/5.5) |

## 7.2 Handling rules

| Rule | Statement |
|------|-----------|
| CS-01 | Secrets injected from env secret store / existing secret mechanism only |
| CS-02 | Config changes that alter API families or Domains require Product Delivery revision |
| CS-03 | Do not put secrets in FE bundles |
| CS-04 | Do not log secret values during deploy validation |
| CS-05 | Prod/non-prod secret sets are distinct |
| CS-06 | Entitlement/plan flags (if any) come from existing entitlements API — not ad-hoc deploy JSON Domains |

---

# 8. Tenant / Workspace Deployment Boundary

## 8.1 Separation

| Concept | Meaning |
|---------|---------|
| Environment (ENV-*) | Operator deployment target |
| Tenant | Customer isolation unit (PD-5.5) |
| Workspace / project | Product context within tenant (M13) |

Deploying an environment **does not** deploy “a tenant as an app.” Tenants are data/authz scoped.

## 8.2 Rules

| Rule | Statement |
|------|-----------|
| TW-01 | One ENV-PROD serves many tenants — isolation is authz/persistence, not separate Domain per tenant |
| TW-02 | Do not create per-tenant API families |
| TW-03 | Tenant provisioning uses existing tenant/OS surfaces (M13) — not deploy pipeline inventing M16 |
| TW-04 | Canary must not pin only one real tenant’s data path as the sole validation if it weakens isolation tests |
| TW-05 | Workspace bootstrap remains `/api/v80/tenant/run` (and mapped) — not a deploy hook Domain |

---

# 9. Promotion Policy

## 9.1 Promotion path

```
ENV-LOCAL → ENV-DEV → ENV-STAGING → ENV-PROD
```

Skips are forbidden for ENV-PROD unless an explicit emergency procedure is approved **without** creating new Domains/APIs.

## 9.2 Promotion gates (architecture)

| From → To | Minimum gates |
|-----------|---------------|
| LOCAL → DEV | Build success; unit/contract checks as required |
| DEV → STAGING | Integration against existing APIs; no new family drift |
| STAGING → PROD | Staging validation PASS (§10); change record; rollback artifact identified |
| Any → next | Secrets/config present for target; migrations planned |

## 9.3 Promotion rules

| Rule | Statement |
|------|-----------|
| PR-01 | Only artifacts that passed prior env validation promote |
| PR-02 | Promotion does not rewrite PD-2.4 bindings |
| PR-03 | Hotfix in PROD still produces a release artifact and recorded rollback point |
| PR-04 | Domain baseline freezes (M11–M15) are not “promoted away” by deploy |

---

# 10. Deployment Validation

## 10.1 Validation catalogue

| Check ID | When | Uses |
|----------|------|------|
| DV-BUILD | Pre-release | Build/test pipeline |
| DV-MIG | Pre-traffic | Migration dry-run/apply per Domain ownership |
| DV-HEALTH | Post-deploy | `/api/v80/ops/health` (+ readiness) |
| DV-METRICS | Post-deploy | `/api/v80/ops/metrics` smoke (ops-auth) |
| DV-INTEGRITY | Post-deploy / promote | `/api/v80/production/integrity` when applicable |
| DV-AUTH | Post-deploy | `/api/auth/me` / sign-in path smoke |
| DV-SMOKE-GP | Staging/Prod canary | Golden Path Commands against **existing** APIs (subset) |
| DV-FE | Post-deploy | FE loads; calls deployed APIs only |

## 10.2 Validation rules

| Rule | Statement |
|------|-----------|
| DV-01 | Validation must not require new monitoring API families |
| DV-02 | Failures block promotion; do not mark deploy success on red health |
| DV-03 | Smoke uses synthetic tenant in non-prod; prod canary remains tenant-safe |
| DV-04 | Validation logs are secret-safe (PD-5.5/5.6) |
| DV-05 | UI smoke does not implement business assertions Domains own |

---

# 11. Responsibility Matrix

| Concern | Backend / Ops | Frontend | Domains M11–M15 |
|---------|---------------|----------|-----------------|
| Env deploy | **Owns** | Consumes endpoints | Runtime consumed |
| Artifact BE | **Owns** | — | Included as existing |
| Artifact FE | Pipeline | Source | — |
| Secrets | **Owns** injection | No secrets in bundle | Uses via ports |
| Migrations | Orchestrates | — | **Own** schema meaning |
| Rollback runtime | **Owns** | May redeploy FE artifact | Preserve SoT rules |
| New API/Domain | **Forbidden** | **Forbidden** | **Frozen set only** |

---

# 12. Deployment Freeze Summary

```
DEPLOYMENT_ARCH_ID     = product-backend-deployment-architecture-v1
ENVIRONMENTS           = LOCAL | DEV | STAGING | PROD
ARTIFACTS              = BE-API | BE-DOMAIN | BE-WORKER | FE-WEB | MIG | CFG-TEMPLATE | META
PROMOTION              = LOCAL → DEV → STAGING → PROD
ROLLOUT                = ALL | CANARY | INSTANCE
ROLLBACK               = prior ART-META (+ cfg/secrets revision)
SECRETS_IN_ARTIFACTS   = false
TENANT_IS_ENV          = false
BACKEND_OWNS_DEPLOY    = true
FRONTEND_CONSUMES      = deployed capabilities only
NO_NEW_DOMAIN          = true
NO_NEW_API_FAMILY      = true
```

## Immutable prohibitions

1. No new Domains or API families via deploy.  
2. No secrets in release artifacts or FE bundles.  
3. No cross-env prod data access from lower envs.  
4. No promote-on-red health/integrity.  
5. No treating tenants as separately invented deploy Domains.

---

# 13. Release Gate

## Gate ID

`product-backend-deployment-architecture-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| DEP-ENV | Environment model | ENV-* catalogue + isolation |
| DEP-FLOW | Build/release/deploy flow | Canonical stages + ownership |
| DEP-ART | Release artifacts | Closed artifact classes; no secrets |
| DEP-RR | Rollout/rollback | Patterns + rules |
| DEP-CFG | Config/secrets | Classes + injection rules |
| DEP-TENANT | Tenant/workspace boundary | Tenant ≠ env |
| DEP-PROM | Promotion policy | Path + gates |
| DEP-VAL | Deployment validation | DV-* checks on existing surfaces |
| DEP-SCOPE | Upstream intact | PD-1…PD-5.6 / M11–M15 unmodified; no new Domains/API families; single new file |

## Verdict

```
PD-5.7 Gate = PASS
  iff DEP-ENV ∧ DEP-FLOW ∧ DEP-ART ∧ DEP-RR ∧ DEP-CFG
    ∧ DEP-TENANT ∧ DEP-PROM ∧ DEP-VAL ∧ DEP-SCOPE all PASS
```

---

# 14. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-DEP-01 | Environment model + build/release/deploy flow defined | ✓ |
| AC-DEP-02 | Artifact + rollout/rollback + config/secret boundaries defined | ✓ |
| AC-DEP-03 | Tenant/workspace boundary + promotion + validation defined | ✓ |
| AC-DEP-04 | Freeze summary + Release Gate present | ✓ |
| AC-DEP-05 | Backend owns deploy behavior; FE consumes deployed capabilities only | ✓ |
| AC-DEP-06 | No new Domains/API families; Markdown only; upstream unmodified | ✓ |

## Verdict

```
PD-5.7 document PASS iff AC-DEP-01 … AC-DEP-06 PASS
```

---

# Document Statement

PD-5.7 Deployment Architecture locks how the frozen product is built, promoted, and rolled back.

```
Build → Release artifact → Deploy ENV-* → Validate → Promote | Rollback
Secrets injected; never shipped in artifacts
Tenants ≠ environments
Existing APIs / M11–M15 only
Frontend consumes deployed capabilities only
```
