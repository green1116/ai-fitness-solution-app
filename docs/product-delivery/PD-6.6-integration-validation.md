# PD-6.6 — Integration Validation

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Integration Validation

## Version

`product-delivery-pd-6.6-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-6.1 … PD-6.5 | Integration arch / contracts / workflows / security / reliability |
| PD-2.3 / PD-2.4 / PD-2.5 / PD-2.6 | Commands, APIs, Domains, Golden Path AC |
| PD-4 / PD-5 freezes | FE / BE baselines |
| PD-5.7 | Deployment validation patterns |

## Purpose

Define **integration validation**: how contracts, APIs, data, and end-to-end flows are verified against frozen baselines before release.

**Reuse only.** Validation asserts existing inventories — it does not invent Domains, APIs, Screens, or schemas.

---

# 1. Validation Model

## 1.1 Validation layers

| Layer ID | What is validated | Against |
|----------|-------------------|---------|
| VAL-CONTRACT | Seam guarantees C0…C7 | PD-6.2 |
| VAL-API | Family / binding / Kind | PD-2.4 / PD-5.3 |
| VAL-DATA | Ownership / SoT / no shadow Domain | PD-5.4 / PD-4.3 |
| VAL-FLOW | Read / Command / Async / Fail / Recover | PD-6.3 / PD-6.5 |
| VAL-SEC | Authn/z / tenant / secrets | PD-6.4 / PD-5.5 |
| VAL-E2E | Golden Path integration | PD-2.6 / GP-* |
| VAL-DEPLOY | Post-deploy smoke | PD-5.7 DV-* |

## 1.2 Validation kinds

| Kind | When | Owner bias |
|------|------|------------|
| Static / planning check | Doc & inventory integrity | Delivery / architecture |
| Contract check | Adapter ↔ API shape compatibility | FE + BE |
| Automated test | CI against existing routes | Engineering |
| Manual / staging smoke | Pre-promote | Shared |
| Prod canary | Post-deploy | Ops + delivery |

## 1.3 Principles

1. **Reuse only** — assert PD-2.4 routes and M11–M15 ownership.  
2. **Fail closed** — red validation blocks promote (PD-5.7).  
3. **No new surfaces** to “make tests pass.”  
4. **Domain outcomes authoritative** — UI checks presentation only.  
5. **Secret-safe** evidence (PD-6.4).  
6. **Same Command** in retry tests (PD-6.5).

---

# 2. Contract Validation

## 2.1 Checklist (C0…C7)

| Check ID | Contract | Pass condition |
|----------|----------|----------------|
| CV-C0 | Intent | Every ACT-* maps to a PD-2.3 Command name |
| CV-C1 | Presentation | Adapter maps to OBJ-* only; no Domain types in CMP props |
| CV-C2 | Transport | Command Kind + route ∈ PD-2.4; family ∈ PD-5.3 closed set |
| CV-C3 | Application | Primary SVC-* entry exists (PD-5.2); no God-service |
| CV-C4 | Domain | Primary Domain ∈ M11–M15 per PD-2.5 |
| CV-C5 | Persistence | Writes via Domain ports; FE cache not SoT |
| CV-C6 | Error | Classes map to safe envelope; no stacks/secrets |
| CV-C7 | Compatibility | Prefer v80; additive-tolerant; no new family |

## 2.2 Contract validation rules

| Rule | Statement |
|------|-----------|
| CTR-01 | Missing PD-2.4 binding ⇒ FAIL (do not invent NEAREST ad hoc in code) |
| CTR-02 | FE emitting unknown Command ⇒ FAIL |
| CTR-03 | BE accepting UI route as business input ⇒ FAIL |
| CTR-04 | Envelope rewrite that breaks existing routes ⇒ FAIL |

---

# 3. API Validation

## 3.1 API inventory checks

| Check ID | Assertion |
|----------|-----------|
| AV-FAM | Called prefixes ⊆ closed FAM-* set |
| AV-BIND | Each HTTP ACT uses documented route or documented NEAREST |
| AV-V80 | Preferred v80 used when PD-2.4 marks preferred |
| AV-KIND | NAV/PREF do not force fake HTTP |
| AV-AUTH | Protected families require session; ops require opsCapable |
| AV-ERR | Error responses are safe (no secrets/stacks) |
| AV-PFS | List calls use existing pagination/filter params only |

## 3.2 Per-family smoke (staging)

| Family | Minimal smoke |
|--------|---------------|
| FAM-AUTH | SignIn path + `/api/auth/me` |
| FAM-PROJECT | `ListProjects` / project detail |
| FAM-V80 | One preferred route per active Golden Path need (tenant/tender/budget/pdf/job/ops) |
| FAM-DOCUMENTS | summary / project docs |
| FAM-OPS | One ops view under authorized principal |

## 3.3 API validation rules

| Rule | Statement |
|------|-----------|
| API-01 | New undeclared route in FE Adapter ⇒ FAIL |
| API-02 | Calling Domain module from FE ⇒ FAIL |
| API-03 | Smoke must use synthetic tenant in non-prod |
| API-04 | Do not create a parallel “test API family” |

---

# 4. Data Validation

## 4.1 Data correctness checks

| Check ID | Assertion |
|----------|-----------|
| DV-SOT | After Command success, FE ST-SERVER matches Domain via refetch — not invented fields |
| DV-OWN | Entity class owned by expected Domain (PD-5.4 / PD-2.5) |
| DV-TENANT | Cross-tenant id probe returns FORBIDDEN or safe NOT_FOUND |
| DV-EMPTY | Empty list ≠ error; no placeholder business rows |
| DV-DERIVED | ST-DERIVED does not invent Domain policy fields |
| DV-CACHE | Stale cache discarded on invalidate; prefer refetch |
| DV-SECRET | No secrets in DTO, logs, or FE state |

## 4.2 Object mapping checks

| Check ID | Assertion |
|----------|-----------|
| DV-OBJ | Response fields map to frozen OBJ-* labels only |
| DV-NO-ENGINE | Engine/Domain module names not shown as product labels |
| DV-ARTIFACT | Download/preview uses existing PDF/download contracts |

## 4.3 Data validation rules

| Rule | Statement |
|------|-----------|
| DAT-01 | FE must not persist Domain entities as SoT |
| DAT-02 | Dual-write across Domains without map ⇒ FAIL |
| DAT-03 | Optimistic FE Domain write ⇒ FAIL |

---

# 5. Integration Verification

## 5.1 Flow verification matrix

| Flow | Verify |
|------|--------|
| WF-READ | Enter Screen → META-LOADING → ST-SERVER/Empty/Error |
| WF-COMMAND | Intent → API → Domain accept → invalidate → render |
| WF-ASYNC | Accept job → status reads → terminal → result read |
| WF-NAV | Only after success on API+NAV / allowed edges |
| WF-FAIL | Typed class → META-ERROR; no write on UNAUTH/FORBIDDEN/EXPIRED |
| WF-RECOVER | REAUTH / RETRY / REFETCH / JOB-* behave per PD-6.5 |

## 5.2 Golden Path verification (E2E)

| Path | Minimum verification |
|------|----------------------|
| GP-01 | Home → Builder → Workspace → Solution → Budget → Documents (existing Commands only) |
| GP-01R | Projects list → Continue → Workspace |
| GP-02 | Tender upload → status → confirm/generate → results/docs |
| GP-03 | Workspace opportunity → results → share/download |
| GP-04 | Admin areas load under ops principal; denied without |

Exact user AC remain PD-2.6 — this section verifies **integration wiring**.

## 5.3 Security + reliability verification

| Check ID | Assertion |
|----------|-----------|
| IV-SEC-1 | GRD pass without session still blocked at API |
| IV-SEC-2 | Ops route denied without opsCapable |
| IV-SEC-3 | Foreign tenant resource denied safely |
| IV-REL-1 | Bounded retry on UNAVAILABLE; no retry on FORBIDDEN |
| IV-REL-2 | Async does not show final Objects before job success |
| IV-REL-3 | Double-submit does not corrupt beyond idempotency contract |

## 5.4 Verification rules

| Rule | Statement |
|------|-----------|
| VF-01 | E2E must not require new Screens/APIs |
| VF-02 | Evidence is secret-safe |
| VF-03 | Staging PASS required before ENV-PROD promote |
| VF-04 | Prod canary remains tenant-safe |

---

# 6. Acceptance Criteria

## 6.1 Document / baseline AC

| AC ID | Criterion |
|-------|-----------|
| AC-VAL-01 | Validation model covers contract/API/data/flow/sec/e2e/deploy |
| AC-VAL-02 | Contract validation checklist C0…C7 present |
| AC-VAL-03 | API + data validation checks present |
| AC-VAL-04 | Integration verification includes GP-* and WF-* |
| AC-VAL-05 | Release Gate + Freeze present; reuse only |

## 6.2 Integration release AC (must PASS to promote)

| AC ID | Criterion | Linked |
|-------|-----------|--------|
| AC-REL-CONTRACT | CV-* all PASS | §2 |
| AC-REL-API | AV-* all PASS on target env | §3 |
| AC-REL-DATA | DV-* critical checks PASS | §4 |
| AC-REL-FLOW | WF-* verification PASS for in-scope GPs | §5.1 |
| AC-REL-GP | Active Golden Paths smoke PASS (PD-2.6 alignment) | §5.2 |
| AC-REL-SEC | IV-SEC-* PASS | §5.3 |
| AC-REL-REL | IV-REL-* PASS | §5.3 |
| AC-REL-HEALTH | DV-HEALTH / auth smoke PASS (PD-5.7) | Deploy |

## 6.3 Verdict

```
Integration Validation ACCEPT
  iff AC-REL-* all PASS for the release candidate
```

---

# 7. Release Gate

## Gate ID

`product-integration-validation-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| IVG-MODEL | Validation model | Layers + kinds + principles |
| IVG-CTR | Contract validation | C0…C7 checklist |
| IVG-API | API validation | Inventory + smoke rules |
| IVG-DATA | Data validation | SoT/tenant/object checks |
| IVG-VFY | Integration verification | WF + GP + sec/rel checks |
| IVG-AC | Acceptance criteria | Document + release AC defined |
| IVG-SCOPE | Reuse only / upstream intact | No new Domains/APIs; PD-1…PD-6.5 / M11–M15 unmodified; single new file |

## Verdict

```
PD-6.6 Gate = PASS
  iff IVG-MODEL ∧ IVG-CTR ∧ IVG-API ∧ IVG-DATA
    ∧ IVG-VFY ∧ IVG-AC ∧ IVG-SCOPE all PASS
```

---

# 8. Freeze Summary

```
INTEGRATION_VALIDATION_ID = product-integration-validation-v1
VALIDATES                 = contracts | APIs | data | flows | security | reliability | GP-*
AGAINST                   = PD-2.3/2.4/2.5/2.6 + PD-4/5/6 freezes
PROMOTE_REQUIRES          = AC-REL-* PASS
NO_NEW_DOMAIN             = true
NO_NEW_API_FAMILY         = true
NO_NEW_TEST_SURFACE       = true
REUSE_ONLY                = true
```

## Immutable statements

1. Validation asserts frozen inventories — does not create product surfaces.  
2. Contract/API/data/flow/security/reliability checks are mandatory for promote.  
3. Golden Path verification uses existing Commands/APIs only.  
4. Evidence remains secret-safe and tenant-safe.  
5. Upstream PD-1…PD-6.5 and M11–M15 unmodified by this task.

---

# 9. Document Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-VALDOC-01 | Validation model defined | ✓ |
| AC-VALDOC-02 | Contract + API + data validation defined | ✓ |
| AC-VALDOC-03 | Integration verification + acceptance criteria defined | ✓ |
| AC-VALDOC-04 | Release Gate + Freeze summary present | ✓ |
| AC-VALDOC-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-6.6 document PASS iff AC-VALDOC-01 … AC-VALDOC-05 PASS
```

---

# Document Statement

PD-6.6 Integration Validation locks how the frozen FE ↔ BE seam is proven before release.

```
Validate contracts → APIs → data → workflows → GP-*
Promote only when AC-REL-* PASS
Reuse only · No new Domains/APIs/surfaces
```
