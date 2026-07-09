/**
 * V68 P3 — Configuration source catalog (declarative)
 */
import type { ConfigSourceEntry, ConfigSourceManifest } from "./governance.types";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "./governance.types";

export const CONFIG_SOURCE_CATALOG: ConfigSourceEntry[] = [
  {
    id: "CFG-SRC-001",
    sourceKind: "environment",
    path: "NODE_ENV",
    serviceDefRef: "SVC-DEF-001",
    required: true,
    description: "Runtime environment for production API",
  },
  {
    id: "CFG-SRC-002",
    sourceKind: "file",
    path: ".env.production",
    required: true,
    description: "Production environment file",
  },
  {
    id: "CFG-SRC-003",
    sourceKind: "declarative",
    path: "lib/monitoring/v67/incident/lifecycle.types.ts",
    serviceDefRef: "SVC-DEF-003",
    required: true,
    description: "Incident lifecycle frozen type definitions",
  },
  {
    id: "CFG-SRC-004",
    sourceKind: "declarative",
    path: "lib/monitoring/v67/alerting/taxonomy.types.ts",
    serviceDefRef: "SVC-DEF-004",
    required: true,
    description: "Alert taxonomy frozen type definitions",
  },
  {
    id: "CFG-SRC-005",
    sourceKind: "file",
    path: "lib/monitoring/v67/oncall/response.target.catalog.ts",
    serviceDefRef: "SVC-DEF-005",
    required: true,
    description: "On-call response SLA declarative catalog",
  },
  {
    id: "CFG-SRC-006",
    sourceKind: "frozen-reference",
    path: "package.json#scripts.verify:v66-deployment",
    serviceDefRef: "SVC-DEF-006",
    required: true,
    description: "V66 deployment verify script reference",
  },
  {
    id: "CFG-SRC-007",
    sourceKind: "environment",
    path: "READINESS_PROBE_PATH",
    serviceDefRef: "SVC-DEF-007",
    required: true,
    description: "Readiness probe path override",
  },
  {
    id: "CFG-SRC-008",
    sourceKind: "declarative",
    path: "lib/monitoring/v67/slo/slo.types.catalog.ts",
    serviceDefRef: "SVC-DEF-008",
    required: true,
    description: "SLO type catalog frozen reference",
  },
];

export function buildConfigSourceManifest(): ConfigSourceManifest {
  const sources = CONFIG_SOURCE_CATALOG;
  const kinds = new Set(sources.map((s) => s.sourceKind));
  const catalogComplete = sources.length >= 6 && kinds.size >= 3;

  return {
    version: V68_CONFIGURATION_GOVERNANCE_VERSION,
    sourceCount: sources.length,
    kindCount: kinds.size,
    catalogComplete,
    sources,
    summary: [
      `config-sources count=${sources.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getConfigSourceById(id: string): ConfigSourceEntry | undefined {
  return CONFIG_SOURCE_CATALOG.find((s) => s.id === id);
}
