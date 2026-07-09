/**
 * V68 P4 — Feature flag toggle contract (declarative enable/disable rules)
 */
import type { ToggleContractManifest, ToggleRule } from "./governance.types";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "./governance.types";

export const TOGGLE_RULE_CATALOG: ToggleRule[] = [
  {
    id: "FF-TGL-001",
    flagRef: "FF-DEF-001",
    action: "disable",
    condition: "health_probe == unhealthy",
    required: true,
    description: "Disable production API when health probe fails",
  },
  {
    id: "FF-TGL-002",
    flagRef: "FF-DEF-002",
    action: "enable",
    condition: "deployment.verify == pass",
    required: true,
    description: "Enable strict health probe after verify pass",
  },
  {
    id: "FF-TGL-003",
    flagRef: "FF-DEF-003",
    action: "enable",
    condition: "incident.severity >= P1",
    required: true,
    description: "Enable auto-escalate on P1+ incidents",
  },
  {
    id: "FF-TGL-004",
    flagRef: "FF-DEF-004",
    action: "disable",
    condition: "maintenance_window == active",
    required: true,
    description: "Silence alert routing during maintenance",
  },
  {
    id: "FF-TGL-005",
    flagRef: "FF-DEF-005",
    action: "rollout-percent",
    condition: "rollout.percent < 100",
    required: true,
    description: "Gradual on-call paging rollout",
  },
  {
    id: "FF-TGL-006",
    flagRef: "FF-DEF-006",
    action: "enable",
    condition: "verify:v66-deployment == pass",
    required: true,
    description: "Enforce verify gate when V66 deployment passes",
  },
  {
    id: "FF-TGL-007",
    flagRef: "FF-DEF-007",
    action: "disable",
    condition: "environment == staging",
    required: true,
    description: "Disable readiness requirement in staging",
  },
  {
    id: "FF-TGL-008",
    flagRef: "FF-DEF-008",
    action: "kill",
    condition: "slo.burn_rate > threshold",
    required: true,
    description: "Kill-switch SLO alerts on runaway burn rate",
  },
];

export function buildToggleContractManifest(): ToggleContractManifest {
  const rules = TOGGLE_RULE_CATALOG;
  const actionKinds = new Set(rules.map((r) => r.action));
  const contractComplete = rules.length >= 6 && actionKinds.size >= 3;

  return {
    version: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
    ruleCount: rules.length,
    actionKindCount: actionKinds.size,
    contractComplete,
    rules,
    summary: [
      `toggle-rules count=${rules.length}`,
      `actions=${actionKinds.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getToggleRulesByFlagRef(flagRef: string): ToggleRule[] {
  return TOGGLE_RULE_CATALOG.filter((r) => r.flagRef === flagRef);
}
