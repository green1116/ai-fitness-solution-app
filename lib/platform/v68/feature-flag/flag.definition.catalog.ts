/**
 * V68 P4 — Feature flag definition catalog (declarative)
 */
import type { FlagDefinition, FlagDefinitionManifest } from "./governance.types";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "./governance.types";

export const FLAG_DEFINITION_CATALOG: FlagDefinition[] = [
  {
    id: "FF-DEF-001",
    key: "production_api_enabled",
    serviceDefRef: "SVC-DEF-001",
    configItemRef: "CFG-ITEM-001",
    defaultState: "enabled",
    required: true,
    description: "Master switch for production API traffic",
  },
  {
    id: "FF-DEF-002",
    key: "health_probe_strict_mode",
    serviceDefRef: "SVC-DEF-002",
    configItemRef: "CFG-ITEM-002",
    defaultState: "enabled",
    required: true,
    description: "Strict health probe validation",
  },
  {
    id: "FF-DEF-003",
    key: "incident_lifecycle_auto_escalate",
    serviceDefRef: "SVC-DEF-003",
    configItemRef: "CFG-ITEM-003",
    defaultState: "enabled",
    required: true,
    description: "Auto-escalate incidents per lifecycle rules",
  },
  {
    id: "FF-DEF-004",
    key: "alert_taxonomy_routing",
    serviceDefRef: "SVC-DEF-004",
    configItemRef: "CFG-ITEM-004",
    defaultState: "enabled",
    required: true,
    description: "Route alerts via taxonomy catalog",
  },
  {
    id: "FF-DEF-005",
    key: "oncall_page_enabled",
    serviceDefRef: "SVC-DEF-005",
    configItemRef: "CFG-ITEM-005",
    defaultState: "rollout",
    required: true,
    description: "On-call paging — declarative rollout flag",
  },
  {
    id: "FF-DEF-006",
    key: "deployment_verify_gate",
    serviceDefRef: "SVC-DEF-006",
    configItemRef: "CFG-ITEM-006",
    defaultState: "enabled",
    required: true,
    description: "Block deployment without verify chain pass",
  },
  {
    id: "FF-DEF-007",
    key: "readiness_probe_required",
    serviceDefRef: "SVC-DEF-007",
    configItemRef: "CFG-ITEM-007",
    defaultState: "disabled",
    required: true,
    description: "Require readiness probe before traffic",
  },
  {
    id: "FF-DEF-008",
    key: "slo_burn_rate_alerts",
    serviceDefRef: "SVC-DEF-008",
    configItemRef: "CFG-ITEM-008",
    defaultState: "kill-switch",
    required: true,
    description: "SLO burn-rate alert routing",
  },
];

export function buildFlagDefinitionManifest(): FlagDefinitionManifest {
  const flags = FLAG_DEFINITION_CATALOG;
  const stateKinds = new Set(flags.map((f) => f.defaultState));
  const catalogComplete = flags.length >= 6 && stateKinds.size >= 3;

  return {
    version: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
    flagCount: flags.length,
    stateKindCount: stateKinds.size,
    catalogComplete,
    flags,
    summary: [
      `flag-definitions count=${flags.length}`,
      `defaultStates=${stateKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getFlagDefinitionById(id: string): FlagDefinition | undefined {
  return FLAG_DEFINITION_CATALOG.find((f) => f.id === id);
}

export function getFlagDefinitionByKey(key: string): FlagDefinition | undefined {
  return FLAG_DEFINITION_CATALOG.find((f) => f.key === key);
}
