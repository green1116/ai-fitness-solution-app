/**
 * V68 P5 — Capacity baseline catalog (declarative, aligned with P1 services)
 */
import type { CapacityBaselineEntry, CapacityBaselineManifest } from "./governance.types";
import { V68_CAPACITY_PLANNING_VERSION } from "./governance.types";

export const CAPACITY_BASELINE_CATALOG: CapacityBaselineEntry[] = [
  {
    id: "CAP-BASE-001",
    serviceDefRef: "SVC-DEF-001",
    resourceKind: "requests",
    baselineValue: 1000,
    unit: "rps",
    window: "1h",
    required: true,
    description: "Production API baseline request rate",
  },
  {
    id: "CAP-BASE-002",
    serviceDefRef: "SVC-DEF-002",
    resourceKind: "cpu",
    baselineValue: 30,
    unit: "percent",
    window: "24h",
    required: true,
    description: "Health probe CPU baseline",
  },
  {
    id: "CAP-BASE-003",
    serviceDefRef: "SVC-DEF-003",
    resourceKind: "connections",
    baselineValue: 50,
    unit: "count",
    window: "1h",
    required: true,
    description: "Incident lifecycle active connection baseline",
  },
  {
    id: "CAP-BASE-004",
    serviceDefRef: "SVC-DEF-004",
    resourceKind: "requests",
    baselineValue: 500,
    unit: "rps",
    window: "1h",
    required: true,
    description: "Alert routing throughput baseline",
  },
  {
    id: "CAP-BASE-005",
    serviceDefRef: "SVC-DEF-005",
    resourceKind: "connections",
    baselineValue: 20,
    unit: "count",
    window: "24h",
    required: true,
    description: "On-call concurrent page baseline",
  },
  {
    id: "CAP-BASE-006",
    serviceDefRef: "SVC-DEF-006",
    resourceKind: "cpu",
    baselineValue: 40,
    unit: "percent",
    window: "1h",
    required: true,
    description: "Deployment verify CPU spike baseline",
  },
  {
    id: "CAP-BASE-007",
    serviceDefRef: "SVC-DEF-007",
    resourceKind: "memory",
    baselineValue: 512,
    unit: "gb",
    window: "24h",
    required: true,
    description: "Readiness probe memory baseline — declarative MB scaled",
  },
  {
    id: "CAP-BASE-008",
    serviceDefRef: "SVC-DEF-008",
    resourceKind: "storage",
    baselineValue: 10,
    unit: "gb",
    window: "30d",
    required: true,
    description: "SLO metrics storage baseline",
  },
];

export function buildCapacityBaselineManifest(): CapacityBaselineManifest {
  const baselines = CAPACITY_BASELINE_CATALOG;
  const resourceKinds = new Set(baselines.map((b) => b.resourceKind));
  const catalogComplete = baselines.length >= 6 && resourceKinds.size >= 4;

  return {
    version: V68_CAPACITY_PLANNING_VERSION,
    entryCount: baselines.length,
    resourceKindCount: resourceKinds.size,
    catalogComplete,
    baselines,
    summary: [
      `capacity-baselines count=${baselines.length}`,
      `resourceKinds=${resourceKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getBaselineByServiceRef(serviceDefRef: string): CapacityBaselineEntry[] {
  return CAPACITY_BASELINE_CATALOG.filter((b) => b.serviceDefRef === serviceDefRef);
}
