/**
 * V68 P3 — Configuration validity contract (declarative)
 */
import type { ConfigValidityManifest, ConfigValidityRule } from "./governance.types";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "./governance.types";

export const CONFIG_VALIDITY_CATALOG: ConfigValidityRule[] = [
  {
    id: "CFG-VAL-001",
    configItemRef: "CFG-ITEM-001",
    sourceRef: "CFG-SRC-001",
    constraint: "value.startsWith('/api')",
    expectedStatus: "valid",
    required: true,
    description: "API base URL must be under /api",
  },
  {
    id: "CFG-VAL-002",
    configItemRef: "CFG-ITEM-002",
    sourceRef: "CFG-SRC-002",
    constraint: "value == 'true' || value == 'false'",
    expectedStatus: "valid",
    required: true,
    description: "Health probe flag must be boolean string",
  },
  {
    id: "CFG-VAL-003",
    configItemRef: "CFG-ITEM-003",
    sourceRef: "CFG-SRC-003",
    constraint: "value == 'v67-incident-lifecycle-1'",
    expectedStatus: "valid",
    required: true,
    description: "Lifecycle version must match frozen constant",
  },
  {
    id: "CFG-VAL-004",
    configItemRef: "CFG-ITEM-004",
    sourceRef: "CFG-SRC-004",
    constraint: "value == 'v67-alert-taxonomy-1'",
    expectedStatus: "valid",
    required: true,
    description: "Alert taxonomy version must match frozen constant",
  },
  {
    id: "CFG-VAL-005",
    configItemRef: "CFG-ITEM-005",
    sourceRef: "CFG-SRC-005",
    constraint: "value > 0 && value <= 60",
    expectedStatus: "valid",
    required: true,
    description: "Escalation minutes within SLA bounds",
  },
  {
    id: "CFG-VAL-006",
    configItemRef: "CFG-ITEM-006",
    sourceRef: "CFG-SRC-006",
    constraint: "value.startsWith('verify:')",
    expectedStatus: "valid",
    required: true,
    description: "Verify script must be npm verify prefix",
  },
  {
    id: "CFG-VAL-007",
    configItemRef: "CFG-ITEM-007",
    sourceRef: "CFG-SRC-007",
    constraint: "value.startsWith('/')",
    expectedStatus: "valid",
    required: true,
    description: "Readiness path must be absolute HTTP path",
  },
  {
    id: "CFG-VAL-008",
    configItemRef: "CFG-ITEM-008",
    sourceRef: "CFG-SRC-008",
    constraint: "value >= 99.0 && value <= 100.0",
    expectedStatus: "valid",
    required: true,
    description: "SLO availability target within percent bounds",
  },
];

export function buildConfigValidityManifest(): ConfigValidityManifest {
  const rules = CONFIG_VALIDITY_CATALOG;
  const statuses = new Set(rules.map((r) => r.expectedStatus));
  const contractComplete = rules.length >= 6 && statuses.size >= 1;

  return {
    version: V68_CONFIGURATION_GOVERNANCE_VERSION,
    ruleCount: rules.length,
    statusCount: statuses.size,
    contractComplete,
    rules,
    summary: [
      `config-validity rules=${rules.length}`,
      `statuses=${statuses.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getValidityRulesByItemRef(configItemRef: string): ConfigValidityRule[] {
  return CONFIG_VALIDITY_CATALOG.filter((r) => r.configItemRef === configItemRef);
}
