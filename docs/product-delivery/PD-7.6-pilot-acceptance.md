# PD-7.6 — Pilot Acceptance

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Pilot Acceptance

## Version

`product-delivery-pd-7.6-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-2.6 | Golden Path user acceptance (47 ACs) |
| PD-1 / PD-2.x / PD-3.8 | Personas, Features, UI freeze |
| PD-4.8 / PD-5.8 / PD-6.8 | FE / BE / Integration freezes |
| PD-6.6 / PD-6.7 | Validation / integration readiness |
| PD-7.1 … PD-7.5 | Release / deploy / ops / customer / docs readiness |
| M11–M15 | Existing Domains only |

## Purpose

Define **pilot acceptance**: the criteria to accept (or reject) a production pilot of the frozen MVP against business, technical, operational, and customer dimensions.

**Reuse only.** Pilot exercises existing Golden Paths, APIs, Domains, and Screens. Invents no new product surfaces.

---

# 1. Pilot Scope

## 1.1 In scope

| Scope ID | Coverage |
|----------|----------|
| PILOT-SCOPE | Who / what / where the pilot covers |
| PILOT-AC | Acceptance criteria model |
| PILOT-BIZ | Business acceptance |
| PILOT-TECH | Technical acceptance |
| PILOT-OPS | Operational acceptance |
| PILOT-CUST | Customer acceptance |
| PILOT-EXIT | Exit criteria (PASS / FAIL / EXTEND) |
| PILOT-GATE | Release Gate + Freeze |

## 1.2 Pilot definition

A **Pilot** is a time-bounded production (or production-like ENV-PROD canary) exercise of frozen MVP Golden Paths with named customer tenants, under PD-7 readiness gates.

## 1.3 Included inventories (reuse)

| Inventory | Locked set |
|-----------|------------|
| Personas | PER-01, PER-02, PER-03, PER-06 (primary); PER-04/05 supporting only |
| Golden Paths | GP-01, GP-01R, GP-02, GP-03, GP-04 |
| Screens | SCR-01…SCR-09 only |
| Domains | M11–M15 only |
| APIs | PD-2.4 / closed FAM-* only |
| User ACs | PD-2.6 (47 path ACs) |

## 1.4 Out of scope

| Item | Reason |
|------|--------|
| Non–Golden Path Features as pilot success gates | PD-2.6 |
| New Domains / APIs / Screens for pilot | Forbidden |
| Unlimited production rollout (post-pilot) | Separate exit decision |
| Modification of PD-1…PD-7.5 or M11–M15 | Forbidden |
| Additional files | Task constraint |

## 1.5 Principles

1. **Reuse only** — pilot validates frozen baselines.  
2. **PD-2.6 is business north star** — user can finish Golden Path goals.  
3. **Readiness before pilot** — PD-7.1…7.5 aligned where applicable.  
4. **Fail closed** on security/tenant/integrity.  
5. **Evidence secret-safe and tenant-safe.**  
6. **Exit is explicit** — PASS / FAIL / EXTEND — not silent “ship everything.”

---

# 2. Acceptance Criteria

## 2.1 Acceptance dimensions

| Dimension | Meaning | Primary refs |
|-----------|---------|--------------|
| ACC-BIZ | Users complete Golden Path business goals | PD-2.6 |
| ACC-TECH | FE↔BE integration works on existing contracts | PD-4…PD-6 |
| ACC-OPS | Monitor / alert / recover / rollback work | PD-5.6 / PD-7.3 |
| ACC-CUST | Tenant onboard / license / train / support handoff | PD-7.4 |
| ACC-DOC | Docs match freeze IDs / paths | PD-7.5 |
| ACC-READY | Release/deploy readiness still green | PD-7.1 / PD-7.2 |

## 2.2 Pilot acceptance formula

```
PILOT_ACCEPT = PASS
  iff ACC-BIZ ∧ ACC-TECH ∧ ACC-OPS ∧ ACC-CUST
    ∧ ACC-DOC ∧ ACC-READY
    ∧ Exit decision = PASS (see §7)
```

## 2.3 Evidence rules

| Rule | Statement |
|------|-----------|
| EV-01 | Evidence cites Screens/Actions/APIs from frozen inventories only |
| EV-02 | No secrets / real tokens / cross-tenant data in evidence packs |
| EV-03 | Failed path AC cannot be waived by inventing a new API |
| EV-04 | Async paths judged by Domain/job SoT — not FE optimism |

---

# 3. Business Acceptance

## 3.1 Business PASS conditions (PD-2.6)

| Path | Persona | Business goal | PASS when |
|------|---------|---------------|-----------|
| GP-01 | PER-01 | Solution + budget for decision | AC-GP01-01…15 PASS |
| GP-01R | Returning | Resume project | AC-GP01R-01…04 PASS |
| GP-02 | PER-02 | Tender materials path | AC-GP02-01…12 PASS |
| GP-03 | PER-03 | Opportunity → materials | AC-GP03-01…10 PASS |
| GP-04 | PER-06 | Ops observation | AC-GP04-01…06 PASS |

```
ACC-BIZ = PASS
  iff GP-01 ∧ GP-01R ∧ GP-02 ∧ GP-03 ∧ GP-04 all PASS
  (pilot may subset personas only if explicitly scoped — default = all MVP paths)
```

## 3.2 Business checks

| Check ID | Pass condition |
|----------|----------------|
| BIZ-01 | In-scope Golden Paths executed on pilot tenants |
| BIZ-02 | Goals met without non-catalog Screens |
| BIZ-03 | User-facing labels remain product Objects (PD-3.1) |
| BIZ-04 | Known Empty/Error/Unavailable states are understandable |
| BIZ-05 | No business success claimed via Domain bypass |

## 3.3 Business rules

| Rule | Statement |
|------|-----------|
| BIZ-R1 | Pilot “delight” Features outside freeze do not count as acceptance |
| BIZ-R2 | Partial path completion ≠ path PASS |
| BIZ-R3 | Language preference (non-GP) is not a business gate |

---

# 4. Technical Acceptance

## 4.1 Technical PASS conditions

| Area | PASS when |
|------|-----------|
| Integration | PD-6.6 AC-REL-* PASS on pilot env |
| Pipeline | UI → API → Service → Domain holds for pilot Commands |
| APIs | Only closed families; prefer v80 where mapped |
| Data | Domain SoT; FE cache disposable; no shadow Domain |
| Security | Authn/z + tenant isolation hold under pilot load |
| Async | Jobs visible; no fake sync completion |
| Reliability | Bounded retry; fail closed on writes |

## 4.2 Technical checks

| Check ID | Pass condition |
|----------|----------------|
| TECH-01 | No undeclared API/Domain appears in pilot telemetry |
| TECH-02 | Cross-tenant probes still safe deny |
| TECH-03 | Command failures map to typed error classes |
| TECH-04 | ART-META freeze IDs match running pilot build |
| TECH-05 | Double-submit / idempotency behaves per existing contracts |
| TECH-06 | FE does not import Domain modules |

## 4.3 Technical rules

| Rule | Statement |
|------|-----------|
| TECH-R1 | Hotfix inventing routes during pilot ⇒ technical FAIL |
| TECH-R2 | Performance complaints do not authorize new Domains |
| TECH-R3 | ACC-TECH FAIL blocks PILOT_ACCEPT |

```
ACC-TECH = PASS iff TECH-01…06 PASS ∧ AC-REL-* PASS
```

---

# 5. Operational Acceptance

## 5.1 Operational PASS conditions (PD-7.3)

| Area | PASS when |
|------|-----------|
| Monitoring | Health/metrics/(integrity) usable for pilot |
| Alerting | Critical ALT-* classes owned and firing appropriately |
| Incident | Abort/rollback exercised or dry-run proven |
| Support | Escalation paths used or verified |
| Runbooks | Critical RBK-* topics available |
| SLO signals | Measurable on existing surfaces |

## 5.2 Operational checks

| Check ID | Pass condition |
|----------|----------------|
| OPS-01 | OPERATIONALLY_READY held at pilot start |
| OPS-02 | At least one health/auth smoke cadence during pilot |
| OPS-03 | Job failure (if occurred) reconciled via existing status — not FE guess |
| OPS-04 | No secret leakage in ops evidence |
| OPS-05 | Rollback ART-META still identified |
| OPS-06 | Customer Screens not used as pager |

## 5.3 Operational rules

| Rule | Statement |
|------|-----------|
| OPS-R1 | Silent monitoring gaps on critical paths ⇒ OPS FAIL |
| OPS-R2 | Integrity/tenant incidents ⇒ fail closed / exit FAIL or EXTEND — not ignore |
| OPS-R3 | Ops acceptance ≠ inventing new alert API family |

```
ACC-OPS = PASS iff OPS-01…06 PASS ∧ PD-7.3 critical readiness intact
```

---

# 6. Customer Acceptance

## 6.1 Customer PASS conditions (PD-7.4)

| Area | PASS when |
|------|-----------|
| Tenant | Pilot tenants onboarded via existing surfaces |
| Workspace | GP workspace/project paths usable |
| License | Entitlements enforced — not FE unlock |
| Config | Preferences/goals configured without new Screens |
| Training | Pilot users complete guided Golden Paths |
| Handoff | Support can assist without Domain bypass |

## 6.2 Customer checks

| Check ID | Pass condition |
|----------|----------------|
| CUST-01 | CUSTOMER_READY for each pilot cohort at entry |
| CUST-02 | Pilot admins can Sign In / observe session |
| CUST-03 | Entitlement denials are safe and understandable |
| CUST-04 | Training did not require non-catalog Features |
| CUST-05 | Support tickets (if any) resolved within frozen product capabilities or logged as EXTEND backlog — not new Domain |
| CUST-06 | No cross-tenant data visible to pilot users |

## 6.3 Customer rules

| Rule | Statement |
|------|-----------|
| CUST-R1 | One unhappy cosmetic request ≠ customer FAIL if GP goals met |
| CUST-R2 | Blocking auth/tenant/entitlement failure ⇒ customer FAIL |
| CUST-R3 | Supplier/Partner (PER-04/05) not required for MVP pilot PASS unless scoped |

```
ACC-CUST = PASS iff CUST-01…06 PASS for in-scope cohorts
```

---

# 7. Exit Criteria

## 7.1 Exit decisions

| Decision | When |
|----------|------|
| **PASS** | `PILOT_ACCEPT` formula PASS; recommend limited GA / next rollout step |
| **FAIL** | Blocking ACC-* FAIL or NG-* security/integrity/tenant breach |
| **EXTEND** | Core GPs mostly PASS but bounded gaps remain that do **not** require new Domains/APIs — timeboxed retest |

## 7.2 Mandatory FAIL exits

| Trigger | Action |
|---------|--------|
| Cross-tenant leak | Immediate abort; FAIL |
| Auth mass outage unresolved | FAIL or abort to rollback |
| Production integrity fail unresolved | FAIL |
| RC invents Domain/API/Screen mid-pilot | FAIL |
| GP business goals unmet for in-scope paths | FAIL (or EXTEND only if explicitly scoped subset still pending) |

## 7.3 EXTEND rules

| Rule | Statement |
|------|-----------|
| EX-01 | EXTEND must list concrete retest ACs from existing inventories |
| EX-02 | EXTEND must not authorize M16+ / new API families |
| EX-03 | EXTEND has end date; default reopen to PASS/FAIL |

## 7.4 Exit checklist

| # | Item | Pass |
|---|------|------|
| EXC-01 | ACC-BIZ recorded (per path) | ☐ |
| EXC-02 | ACC-TECH recorded | ☐ |
| EXC-03 | ACC-OPS recorded | ☐ |
| EXC-04 | ACC-CUST recorded | ☐ |
| EXC-05 | ACC-DOC / ACC-READY recorded | ☐ |
| EXC-06 | Security/tenant/integrity status clean or escalated | ☐ |
| EXC-07 | Exit decision PASS \| FAIL \| EXTEND signed | ☐ |
| EXC-08 | If FAIL: rollback/containment executed as needed | ☐ |
| EXC-09 | If PASS: next rollout constraint = reuse-only baselines | ☐ |
| EXC-10 | Evidence pack archived secret-safe | ☐ |

```
Exit complete iff EXC-01…10 addressed
```

---

# 8. Release Gate

## Gate ID

`product-pilot-acceptance-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| PAG-SCOPE | Pilot scope | Personas/GPs/inventories locked |
| PAG-AC | Acceptance model | Dimensions + PILOT_ACCEPT formula |
| PAG-BIZ | Business acceptance | PD-2.6 path linkage |
| PAG-TECH | Technical acceptance | TECH-* + AC-REL-* |
| PAG-OPS | Operational acceptance | OPS-* |
| PAG-CUST | Customer acceptance | CUST-* |
| PAG-EXIT | Exit criteria | PASS/FAIL/EXTEND + EXC-* |
| PAG-UP | Upstream intact | Reuse only; PD-1…PD-7.5 / M11–M15 unmodified; single new file |

## Verdict

```
PD-7.6 Gate = PASS
  iff PAG-SCOPE ∧ PAG-AC ∧ PAG-BIZ ∧ PAG-TECH
    ∧ PAG-OPS ∧ PAG-CUST ∧ PAG-EXIT ∧ PAG-UP all PASS
```

---

# 9. Freeze Summary

```
PILOT_ACCEPTANCE_ID    = product-pilot-acceptance-v1
BUSINESS_AC_REF        = product-planning-pd-2.6-v1
UI_BASELINE_REF        = product-ui-baseline-v1
FE_BASELINE_REF        = product-frontend-architecture-baseline-v1
BE_BASELINE_REF        = product-backend-architecture-baseline-v1
INT_BASELINE_REF       = product-integration-baseline-v1
GOLDEN_PATHS           = GP-01 | GP-01R | GP-02 | GP-03 | GP-04
FORMULA                = PILOT_ACCEPT
EXIT_DECISIONS         = PASS | FAIL | EXTEND
REUSE_ONLY             = true
NO_NEW_DOMAIN          = true
NO_NEW_API_FAMILY      = true
NO_NEW_SCREEN          = true
```

## Immutable statements

1. Pilot acceptance reuses PD-2.6 Golden Path ACs and frozen delivery baselines.  
2. Business PASS requires in-scope GP path ACs.  
3. Technical/ops/customer dimensions are blocking.  
4. EXIT is explicit; EXTEND cannot invent Domains/APIs.  
5. Upstream PD-1…PD-7.5 and M11–M15 unmodified by this task.

## Handoff

```
Readiness PD-7.1…7.5     = enter pilot only if aligned
Pilot Acceptance PD-7.6  = accept / reject / extend pilot
Post-PASS                = rollout still reuse-only on freezes
```

---

# 10. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-PAG-01 | Pilot scope + acceptance model defined | ✓ |
| AC-PAG-02 | Business + technical acceptance defined | ✓ |
| AC-PAG-03 | Operational + customer acceptance defined | ✓ |
| AC-PAG-04 | Exit criteria + Release Gate + Freeze present | ✓ |
| AC-PAG-05 | Reuse only; one file; no upstream changes | ✓ |

## Verdict

```
PD-7.6 document PASS iff AC-PAG-01 … AC-PAG-05 PASS
```

---

# Document Statement

PD-7.6 Pilot Acceptance locks how the frozen MVP pilot is judged.

```
Business (PD-2.6 GPs) ∧ Technical ∧ Operational ∧ Customer
→ PASS | FAIL | EXTEND
Reuse only · No new Domains/APIs/Screens
```
