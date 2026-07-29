# PD-4.7 — Frontend Performance

## Status

**Draft → Ready for Freeze**

## Type

Product Delivery — Frontend Performance

## Version

`product-delivery-pd-4.7-v1`

## Date

2026-07-29

## Base (Frozen — read-only)

| Source | Role |
|--------|------|
| PD-3.2 / PD-3.3 / PD-3.6 | Layout, Screens, responsive breakpoints |
| PD-3.4 / PD-3.5 / PD-3.8 | Components, interactions, UI freeze |
| PD-4.1 … PD-4.6 | Architecture, routes, state, components, data flow, security |

## Purpose

Define **frontend performance boundaries**, **rendering strategy**, **loading strategy**, and **optimization rules**.

Performance work improves presentation responsiveness only.  
It must **not** invent APIs, Domains, Screens, or business logic.  
Cache and prefetch remain **presentation concerns** (PD-4.3 / PD-4.5).

---

# 1. Scope

## In scope

| Topic | Coverage |
|-------|----------|
| Initial render | First paint / first meaningful Screen content |
| Route transition | Navigation between PD-4.2 routes |
| Data fetch timing | When reads/Commands start relative to render |
| Prefetch / cache policy | Allowed speculative fetch + ST-SERVER snapshots |
| Bundle / component split | Delivery split guidance by Screen/route |
| Skeleton / loading strategy | ST-META presentation during wait |
| List / table rendering | SCR-07 / SCR-08 / ops lists |
| Image / asset handling | Brand/media presentation limits |
| Performance freeze summary | Locked rules |
| Release Gate | Performance readiness |

## Out of scope

| Item | Reason |
|------|--------|
| Hard SLA numbers as Domain contracts | Not product Domain redesign |
| CDN / infra provisioning | Outside frontend delivery doc |
| New APIs for “faster UI” | Forbidden |
| Virtualization library mandate | Implementation choice |
| Modification of PD-1…PD-3, PD-4.1–4.6, M11–M15 | Forbidden |
| Additional files | Task constraint |

---

# 2. Performance Principles

1. **Perceive progress first** — primary path must not appear silently dead (PD-4.1 / PD-4.5).  
2. **Shell before Domain data** — render layout/shell with META-LOADING; then fill ST-SERVER.  
3. **Fetch what the Screen owns** — no cross-Golden-Path speculative Domain graphs.  
4. **Cache is disposable** — ST-SERVER snapshots only; Domain remains SoT.  
5. **Split by route/Screen** — do not ship Admin ops UI on customer Entry by default.  
6. **Optimize presentation, not policy** — no business-rule shortcuts for speed.  
7. **Responsive cost awareness** — BP-COMPACT may simplify chrome density, not drop intents (PD-3.6).  
8. **Existing capabilities only** — performance must not create new Domains/APIs.

---

# 3. Initial Render

## 3.1 Definition

**Initial render** is the first presentation of a target Screen after cold entry or hard reload.

## 3.2 Priority order

```
1. App shell chrome (CMP-SHELL-* as applicable)
2. Screen layout host (LAYCMP-*)
3. Static / local affordances (labels, Sign In, Goal cards structure)
4. ST-SESSION observe (if guard needs it)
5. Screen-owned ST-SERVER reads
6. Secondary regions (footer, non-primary links)
```

## 3.3 Per-Screen initial render posture

| Screen | First meaningful content | Deferred until after shell |
|--------|--------------------------|----------------------------|
| SCR-01 | Brand + Goal cards + Sign In / Language | Optional auth me observe |
| SCR-02 / SCR-03 | Guide + input/upload structure | Status / resume reads |
| SCR-04 | Three-zone layout chrome | Conversation / task / context data |
| SCR-05 / SCR-06 | Result layout chrome | Summary / blocks / budget Objects |
| SCR-07 | List layout chrome | Project rows |
| SCR-08 | Category chrome | Document items / artifacts |
| SCR-09 | Ops layout chrome | Per-area observations (may stagger) |

## 3.4 Initial render rules

| Rule | Statement |
|------|-----------|
| IR-01 | Do not block shell paint on non-critical secondary fetches |
| IR-02 | GRD-SESSION/OPS may await session observe before guarded content — still show safe Entry redirect path promptly |
| IR-03 | Do not prefetch entire MVP catalogue on Entry |
| IR-04 | Initial render must not invent placeholder business Objects |

---

# 4. Route Transition

## 4.1 Definition

Transition along allowed PD-4.2 edges (NAV / API+NAV after Command).

## 4.2 Transition steps

```
User nav intent / successful API+NAV
  → Keep outgoing Screen interactive until navigate commits (no double-submit storms)
  → Enter target route
  → Render target shell + META-LOADING immediately
  → Run target Screen reads (PD-4.5 Read flow)
  → Reuse valid ST-SERVER cache if key matches (PD-4.3)
  → Ready / Empty / Error
```

## 4.3 Transition rules

| Rule | Statement |
|------|-----------|
| RT-01 | Do not preload every possible next Golden Path Screen on every click |
| RT-02 | Prefetch next Screen **code** may be allowed for highly probable edges only (§6) |
| RT-03 | Route transition must not re-fetch unrelated global catalogues |
| RT-04 | Back/forward restores presentation via cache/refetch policy — not Domain write |
| RT-05 | Admin ↔ customer transitions must drop ops payload from customer view memory when leaving SCR-09 |

---

# 5. Data Fetch Timing

## 5.1 Timing classes

| Class | When | Examples |
|-------|------|----------|
| T-BOOT | App/session boot | Auth me observe for guards |
| T-ENTER | On Screen enter | Project list, workspace summary, result Objects |
| T-ACTION | On Command issue | Upload, generate, download, share |
| T-INVALIDATE | After Command success / cue change | Refetch project-scoped caches |
| T-MANUAL | User refresh / retry | Error retry, ops remount |
| T-IDLE | Optional background | Prefetch probable next read (§6) — never Domain mutation |

## 5.2 Timing rules

| Rule | Statement |
|------|-----------|
| FT-01 | Screen-owned reads start at T-ENTER unless satisfied by valid cache |
| FT-02 | Commands never auto-fire on enter — only via ACT-* |
| FT-03 | Parallel reads allowed within one Screen when independent (e.g. SCR-09 areas) |
| FT-04 | Do not chain invent APIs to “batch” Domain modules |
| FT-05 | Fetch waterfalls that hide primary intent behind unrelated calls are forbidden |
| FT-06 | ST-LOCAL drafts do not trigger Domain reads on every keystroke |

---

# 6. Prefetch / Cache Policy

## 6.1 Cache (from PD-4.3 — performance reading)

| Scope | Performance use | Invalidate |
|-------|-----------------|------------|
| Screen fetch cache | Avoid repeat list/result fetch on quick reenter | Leave+stale policy; Command; refresh |
| Project-scoped cache | Keep workspace/result/docs warm for same `projectId` | Cue change; mutating Commands |
| Session cache | Avoid repeat auth me | Sign-in / logout / auth failure |
| Ops cache | Per-area SCR-09 | Remount / refresh / ops-relevant Command |

## 6.2 Prefetch (allowed)

| Prefetch ID | Trigger | What | Forbidden |
|-------------|---------|------|-----------|
| PF-CODE-NEXT | Hover/focus on primary Forward with known edge | Next route’s Screen bundle | Prefetch all routes |
| PF-READ-PROBABLE | After intake success before nav settles | Target workspace/result read for known `projectId` | Prefetch other tenants/projects |
| PF-SESSION | Boot | Auth me once | Continuous polling inventing load |

## 6.3 Prefetch / cache rules

| Rule | Statement |
|------|-----------|
| PC-01 | Prefetch is presentation acceleration only — never a hidden Command |
| PC-02 | Prefetch must use existing read APIs only |
| PC-03 | Prefer refetch over inventing values when stale (PD-4.3 C-01) |
| PC-04 | Cache keys = opaque ids + Screen scope — not business scores |
| PC-05 | No write-through Domain replication for speed |
| PC-06 | Security wins: auth failure clears caches even if “warm” (PD-4.6) |

---

# 7. Bundle / Component Split Guidance

## 7.1 Split units (delivery)

| Split unit | Contains | Default load |
|------------|----------|--------------|
| BU-SHELL | Shell CMP-* + router shell | Eager with app |
| BU-ENTRY | SCR-01 feature assemblies | Eager for `/` |
| BU-INTAKE | SCR-02 / SCR-03 | Lazy on `/builder`, `/tender` |
| BU-WORKSPACE | SCR-04 | Lazy on `/workspace` |
| BU-RESULT | SCR-05 / SCR-06 | Lazy on `/solution`, `/budget` |
| BU-CONTINUITY | SCR-07 / SCR-08 | Lazy on `/projects`, `/documents` |
| BU-OPS | SCR-09 | Lazy on `/admin` only |
| BU-SYSTEM | `/404`, `/unavailable` | Lazy or lightweight shared |

## 7.2 Component split rules

| Rule | Statement |
|------|-----------|
| BS-01 | Shared CMP-* (artifact/forward) live in a shared chunk — not duplicated per Screen with divergent business forks |
| BS-02 | Ops components must not ship in customer Entry critical path |
| BS-03 | Base primitives may be shared; product meaning stays at CMP-* (PD-4.4) |
| BS-04 | Split must not create new product CMP-* IDs |
| BS-05 | Framework code-splitting mechanism is an implementation choice — ownership rules above are mandatory |

---

# 8. Skeleton / Loading Strategy

## 8.1 Strategy

Use **layout-preserving skeletons / progress presentation** bound to ST-META, not fake business data.

| Mode | When | Presentation |
|------|------|--------------|
| SK-SHELL | Route enter before layout stable | Shell + empty main slot / skeleton regions |
| SK-REGION | Partial Screen fetch | Skeleton only the loading region (e.g. one ops area) |
| SK-COMMAND | Mutating Command in flight | Disable primary controls + status text (CMP-STATUS-PROCESS where specified) |
| SK-NONE | Cache hit Ready | No skeleton flash if content paints immediately |

## 8.2 Screen binding

| Screen | Preferred skeleton | Notes |
|--------|--------------------|-------|
| SCR-01 | Minimal | Goals are local structure — avoid heavy skeleton |
| SCR-02 / SCR-03 | Intake regions | Status region for processing |
| SCR-04 | Per-zone skeletons | Compact may stack zones (PD-3.6) |
| SCR-05 / SCR-06 | Summary + blocks/overview placeholders | No invented figures |
| SCR-07 / SCR-08 | List/row placeholders | Count optional; not fake projects/docs |
| SCR-09 | Per-area skeleton | Independent area meta |

## 8.3 Skeleton rules

| Rule | Statement |
|------|-----------|
| SK-01 | Skeletons must not display fabricated OBJ-* values |
| SK-02 | Loading ≠ Empty ≠ Error (PD-4.5) |
| SK-03 | Color-only loading status forbidden (PD-3.7) |
| SK-04 | Long Commands show perceptible progress; do not spin forever without escape (retry/back) |
| SK-05 | Avoid skeleton flicker on sub-threshold cache hits when Ready is immediate |

---

# 9. List / Table Rendering Guidance

## 9.1 Applicable Surfaces

| Surface | Component | Pattern |
|---------|-----------|---------|
| SCR-07 | CMP-PROJECT-LIST / ROW | List + row actions |
| SCR-08 | CMP-DOC-CATEGORIES / ITEM | Category set + items |
| SCR-09 | CMP-OPS-AREA | Ops observation lists/panels |

MVP has **no** separate data-grid Feature beyond these.

## 9.2 Rendering rules

| Rule | Statement |
|------|-----------|
| LR-01 | Render rows from ST-SERVER / ST-DERIVED only — no client-generated business rows |
| LR-02 | Prefer incremental paint: chrome → first page of rows → remainder |
| LR-03 | Client sort/filter stays DER-* presentation (PD-4.3) — not Domain query redesign |
| LR-04 | Very long lists may use windowing/virtualization as **implementation** — must keep all INT-* reachable |
| LR-05 | Do not fetch per-row Domain details eagerly for entire catalogues |
| LR-06 | Row hover/selection is ST-LOCAL — must not trigger Domain writes |
| LR-07 | Empty list uses META-EMPTY guidance — not infinite skeleton |

## 9.3 Table-specific

| Rule | Statement |
|------|-----------|
| TB-01 | If a dense tabular presentation is used inside ops/list, it remains the same Screen/CMP — no new Screen |
| TB-02 | Column presence follows Objects/labels — hide engine columns |
| TB-03 | Do not compute Domain aggregates in the table layer for “fast summaries” |

---

# 10. Image / Asset Handling

## 10.1 Asset classes

| Class | Examples | Guidance |
|-------|----------|----------|
| Brand / chrome | Logo, shell marks | Eager small assets with shell |
| Illustrative | Optional Entry atmosphere | Lazy; must not block Goal CTAs |
| Icons | Control affordances | Shared sprite/system; avoid huge per-route icon packs |
| Document previews | If existing API returns preview affordance | Lazy; download remains Command |
| User uploads | Tender files | Not treated as display images until Domain accepts; no client-side “parse for speed” |

## 10.2 Asset rules

| Rule | Statement |
|------|-----------|
| IA-01 | Decorative assets never delay primary INT-* |
| IA-02 | Prefer responsive-appropriate sizes; do not ship oversized bitmaps for BP-COMPACT by default |
| IA-03 | No Domain-generated marketing carousels invented for performance theater |
| IA-04 | Do not embed large binaries into client state stores (PD-4.6 SD) |
| IA-05 | Alt/text equivalents remain required for meaningful images (PD-3.7) — performance is not an a11y waiver |

---

# 11. Performance Anti-Patterns (Forbidden)

| ID | Anti-pattern |
|----|--------------|
| AP-01 | Silent blank Screen while multiple Domains load |
| AP-02 | Prefetching mutating Commands |
| AP-03 | Keeping Admin bundles in Entry critical path |
| AP-04 | Shadow Domain in memory for “instant” answers |
| AP-05 | Polling inventing new progress APIs |
| AP-06 | Fake Objects to make skeletons look “done” |
| AP-07 | Blocking navigation on unrelated cache warmups |
| AP-08 | Trading away required intents on Compact for speed |

---

# 12. Performance Freeze Summary

```
FRONTEND_PERF_ID       = product-frontend-performance-v1
INITIAL_RENDER         = shell → layout → local → session → screen reads
ROUTE_TRANSITION       = immediate target shell + META-LOADING
FETCH_TIMING           = T-BOOT | T-ENTER | T-ACTION | T-INVALIDATE | T-MANUAL | T-IDLE
PREFETCH               = code/probable-read only; never hidden Commands
CACHE                  = PD-4.3 disposable ST-SERVER snapshots
BUNDLE_SPLIT           = by route/Screen; ops isolated
SKELETON               = layout-preserving; no fake Objects
LIST_RENDER            = chrome then rows; optional windowing
ASSETS                 = non-blocking decorative; a11y preserved
NO_BUSINESS_LOGIC      = true
NO_NEW_API             = true
```

## Immutable prohibitions

1. No performance shortcut that invents APIs/Domains/Objects.  
2. No hidden Commands via prefetch.  
3. No fake business data in skeletons.  
4. No dropping Golden Path intents for speed.  
5. No Admin critical-path bundling into customer Entry.

---

# 13. Release Gate

## Gate ID

`product-frontend-performance-gate`

| Check ID | Label | Pass condition |
|----------|-------|----------------|
| PERF-IR | Initial render | Priority order + per-Screen posture |
| PERF-RT | Route transition | Shell-first + cache reuse rules |
| PERF-FT | Fetch timing | Timing classes + rules |
| PERF-PC | Prefetch/cache | Allowed PF-* + PD-4.3 alignment |
| PERF-BS | Bundle split | Route/Screen units; ops isolated |
| PERF-SK | Skeleton/loading | ST-META; no fake Objects |
| PERF-LR | List/table | Rendering rules present |
| PERF-IA | Images/assets | Non-blocking + a11y preserved |
| PERF-SCOPE | Upstream intact | PD-1…3 / PD-4.1–4.6 / M11–M15 unmodified; single new file only |

## Verdict

```
PD-4.7 Gate = PASS
  iff PERF-IR ∧ PERF-RT ∧ PERF-FT ∧ PERF-PC ∧ PERF-BS
    ∧ PERF-SK ∧ PERF-LR ∧ PERF-IA ∧ PERF-SCOPE all PASS
```

---

# 14. Acceptance Criteria

| AC ID | Criterion | Pass |
|-------|-----------|------|
| AC-PERF-01 | Initial render + route transition defined | ✓ |
| AC-PERF-02 | Fetch timing + prefetch/cache policy defined | ✓ |
| AC-PERF-03 | Bundle split + skeleton/loading defined | ✓ |
| AC-PERF-04 | List/table + image/asset guidance defined | ✓ |
| AC-PERF-05 | Freeze summary + Release Gate present; no business logic | ✓ |
| AC-PERF-06 | Markdown only; no additional files; upstream unmodified | ✓ |

## Verdict

```
PD-4.7 document PASS iff AC-PERF-01 … AC-PERF-06 PASS
```

---

# Document Statement

PD-4.7 Frontend Performance locks how the UI stays responsive without redesigning Domains.

```
Shell first → load Screen data → Ready / Empty / Error
Prefetch code/probable reads only
Cache disposable snapshots
Split by route; isolate Admin
No fake Objects, no hidden Commands, no business logic
```
