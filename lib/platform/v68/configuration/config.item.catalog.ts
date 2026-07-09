/**
 * V68 P3 — Configuration item catalog (declarative, aligned with P1 services)
 */
import type { ConfigItemDefinition, ConfigItemManifest } from "./governance.types";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "./governance.types";

export const CONFIG_ITEM_CATALOG: ConfigItemDefinition[] = [
  {
    id: "CFG-ITEM-001",
    key: "API_BASE_URL",
    serviceDefRef: "SVC-DEF-001",
    valueKind: "string",
    defaultValue: "/api/production",
    required: true,
    description: "Production API base path",
  },
  {
    id: "CFG-ITEM-002",
    key: "HEALTH_PROBE_ENABLED",
    serviceDefRef: "SVC-DEF-002",
    valueKind: "boolean",
    defaultValue: "true",
    required: true,
    description: "Enable health probe endpoint",
  },
  {
    id: "CFG-ITEM-003",
    key: "INCIDENT_LIFECYCLE_VERSION",
    serviceDefRef: "SVC-DEF-003",
    valueKind: "string",
    defaultValue: "v67-incident-lifecycle-1",
    required: true,
    description: "Frozen incident lifecycle version ref",
  },
  {
    id: "CFG-ITEM-004",
    key: "ALERT_TAXONOMY_VERSION",
    serviceDefRef: "SVC-DEF-004",
    valueKind: "string",
    defaultValue: "v67-alert-taxonomy-1",
    required: true,
    description: "Frozen alert taxonomy version ref",
  },
  {
    id: "CFG-ITEM-005",
    key: "ONCALL_ESCALATION_MINUTES",
    serviceDefRef: "SVC-DEF-005",
    valueKind: "number",
    defaultValue: "15",
    required: true,
    description: "Primary on-call escalation timeout minutes",
  },
  {
    id: "CFG-ITEM-006",
    key: "VERIFY_CHAIN_SCRIPT",
    serviceDefRef: "SVC-DEF-006",
    valueKind: "enum",
    defaultValue: "verify:v66-deployment",
    required: true,
    description: "Deployment verify chain npm script",
  },
  {
    id: "CFG-ITEM-007",
    key: "READINESS_PROBE_PATH",
    serviceDefRef: "SVC-DEF-007",
    valueKind: "string",
    defaultValue: "/api/readiness",
    required: true,
    description: "Readiness probe HTTP path",
  },
  {
    id: "CFG-ITEM-008",
    key: "SLO_AVAILABILITY_TARGET",
    serviceDefRef: "SVC-DEF-008",
    valueKind: "number",
    defaultValue: "99.9",
    required: true,
    description: "Availability SLO objective percent",
  },
];

export function buildConfigItemManifest(): ConfigItemManifest {
  const items = CONFIG_ITEM_CATALOG;
  const kinds = new Set(items.map((i) => i.valueKind));
  const catalogComplete = items.length >= 6 && kinds.size >= 4;

  return {
    version: V68_CONFIGURATION_GOVERNANCE_VERSION,
    itemCount: items.length,
    kindCount: kinds.size,
    catalogComplete,
    items,
    summary: [
      `config-items count=${items.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getConfigItemById(id: string): ConfigItemDefinition | undefined {
  return CONFIG_ITEM_CATALOG.find((i) => i.id === id);
}

export function getConfigItemsByService(serviceDefRef: string): ConfigItemDefinition[] {
  return CONFIG_ITEM_CATALOG.filter((i) => i.serviceDefRef === serviceDefRef);
}
