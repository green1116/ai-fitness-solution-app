# V67 P2 — Incident Lifecycle & State Machine

Declarative incident lifecycle: states, transition rules, ack/escalate/resolve/postmortem paths. **Read-only layer** — no notifications, no UI, no V48–V66 mutations.

## Scope (P2 only)

| Artifact | Purpose |
|----------|---------|
| State catalog | 8 incident states (`triggered` → `closed`) |
| Transition rules | 12 declarative transition rules |
| State machine | Deterministic `applyLifecycleAction` / `simulateLifecyclePath` |
| Lifecycle report | Integrates P1 foundation readiness |

## Upstream

- **P1**: `lib/monitoring/v67/foundation.*` — read-only import
- **Frozen**: V48–V66 untouched

## Module layout

```
lib/monitoring/v67/incident/
  lifecycle.types.ts        # Domain types
  lifecycle.surface.ts        # Artifact paths
  lifecycle.states.ts         # State catalog
  lifecycle.transitions.ts    # Transition rules
  lifecycle.machine.ts        # State machine logic
  lifecycle.builder.ts          # Report builder
  lifecycle.entry.ts            # Unified entry
  incident.ts
```

## Incident states

```
triggered → open → acknowledged → mitigating → resolved → postmortem → closed
              ↘ escalated ↗
```

## Lifecycle actions

`trigger` | `acknowledge` | `escalate` | `mitigate` | `resolve` | `postmortem` | `close` | `silence`

## Canonical paths

- **Resolution**: trigger → acknowledge → mitigate → resolve → postmortem → close
- **Escalation**: trigger → escalate → mitigate → resolve → close

## Unified entry

```ts
import { runIncidentLifecycle, formatIncidentLifecycleSummary } from "@/lib/monitoring/v67";

const report = runIncidentLifecycle({ deploymentId: "prod" });
console.log(formatIncidentLifecycleSummary(report));
```

## Verify

```bash
npm run verify:v67-p2-incident-lifecycle
npm run verify:v67-monitoring          # P1 + P2
npm run verify:v67-p1-monitoring-foundation
```

## Freeze point (P2)

After P2 PASS:

- `lib/monitoring/v67/incident/` — P2 module tree (independent of P1 delete path)
- `docs/monitoring/V67-INCIDENT-LIFECYCLE.md`
- `scripts/verify-v67-p2-incident-lifecycle.ts`

P1 remains independently rollback-safe. Deleting P2 does not affect P1.

## Rollback

Delete P2 artifacts and revert `verify:v67-monitoring` to P1-only. P1 and V48–V66 unaffected.

## Boundaries

- State machine is in-memory simulation only
- No alert delivery, paging, or persistence
- `allowedRoles` are declarative labels, not RBAC enforcement
