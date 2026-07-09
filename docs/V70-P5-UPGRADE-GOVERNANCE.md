# V70 P5 — Upgrade Governance

Declarative upgrade governance plans. **Read-only** — no runtime, API, database, or UI changes. V48–V70 P1/P4 untouched.

## Scope (P5 only)

| Concept | Purpose |
|---------|---------|
| UpgradePlan | Full upgrade plan (`DLV-UPG-*`) |
| UpgradePath | From/to release version path (`DLV-UPG-PATH-*`) |
| PreCheck | Pre-upgrade validation (`DLV-UPG-PRE-*`) |
| PostCheck | Post-upgrade validation (`DLV-UPG-PST-*`) |
| RollbackPlan | Rollback on failure (`DLV-UPG-RBK-*`) |
| CompatibilityCheck | Link to P4 version pair (`DLV-VPX-*`) |
| Approval | required / approved / waived / rejected |
| RiskLevel | low / medium / high / critical |
| MaintenanceWindow | Scheduled maintenance window |
| SuccessCriteria | Declarative pass criteria |

## Module layout

```
lib/delivery/v70/
  upgrade.governance.ts
  upgrade.plan.ts
  upgrade.builder.ts
  upgrade.entry.ts
```

## Entry

```ts
import { buildUpgradeGovernance, runUpgradeGovernance } from "@/lib/delivery/v70/upgrade.entry";

const report = runUpgradeGovernance({ deploymentId: "prod" });
```

## Exports

- `V70_UPGRADE_GOVERNANCE_VERSION` = `v70-upgrade-governance-1`
- `V70_UPGRADE_GOVERNANCE_FREEZE_VERSION` = `v70-upgrade-governance-freeze-1`
- `buildUpgradeGovernance()`
- `runUpgradeGovernance()`

## Upstream (read-only)

- **P4**: `buildVersionCompatibility()`
- **P1**: via P4 chain (`DLV-REL-*`, `DLV-VPX-*`)

## Verify

```bash
npx tsx scripts/verify-v70-p5-upgrade-governance.ts
```

## Freeze point (P5)

- `v70-upgrade-governance-freeze-1`

## Boundaries

- Declarative upgrade modeling only — no upgrade execution
