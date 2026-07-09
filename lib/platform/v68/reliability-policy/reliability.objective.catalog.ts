/**
 * V68 P6 — Reliability objective catalog (declarative, aligned with P1 services)
 */
import type { ReliabilityObjectiveEntry, ReliabilityObjectiveManifest } from "./governance.types";
import { V68_RELIABILITY_POLICY_VERSION } from "./governance.types";

export const RELIABILITY_OBJECTIVE_CATALOG: ReliabilityObjectiveEntry[] = [
  {
    id: "REL-OBJ-001",
    serviceDefRef: "SVC-DEF-001",
    kind: "availability",
    target: 99.9,
    unit: "percent",
    window: "30d",
    required: true,
    description: "Production API availability objective — aligns SLOT-001",
  },
  {
    id: "REL-OBJ-002",
    serviceDefRef: "SVC-DEF-001",
    kind: "latency",
    target: 500,
    unit: "ms",
    window: "1h",
    required: true,
    description: "Production API P95 latency objective",
  },
  {
    id: "REL-OBJ-003",
    serviceDefRef: "SVC-DEF-002",
    kind: "availability",
    target: 99,
    unit: "percent",
    window: "24h",
    required: true,
    description: "Health probe reliability objective",
  },
  {
    id: "REL-OBJ-004",
    serviceDefRef: "SVC-DEF-003",
    kind: "mttr",
    target: 60,
    unit: "minutes",
    window: "30d",
    required: true,
    description: "Incident lifecycle MTTR objective",
  },
  {
    id: "REL-OBJ-005",
    serviceDefRef: "SVC-DEF-004",
    kind: "error-budget",
    target: 1,
    unit: "percent",
    window: "5m",
    required: true,
    description: "Alert routing error budget",
  },
  {
    id: "REL-OBJ-006",
    serviceDefRef: "SVC-DEF-006",
    kind: "availability",
    target: 100,
    unit: "percent",
    window: "24h",
    required: true,
    description: "Deployment verify chain must pass",
  },
  {
    id: "REL-OBJ-007",
    serviceDefRef: "SVC-DEF-007",
    kind: "latency",
    target: 200,
    unit: "ms",
    window: "1h",
    required: true,
    description: "Readiness probe response latency",
  },
  {
    id: "REL-OBJ-008",
    serviceDefRef: "SVC-DEF-008",
    kind: "error-budget",
    target: 0.1,
    unit: "percent",
    window: "30d",
    required: true,
    description: "SLO monitoring error budget objective",
  },
];

export function buildReliabilityObjectiveManifest(): ReliabilityObjectiveManifest {
  const objectives = RELIABILITY_OBJECTIVE_CATALOG;
  const kinds = new Set(objectives.map((o) => o.kind));
  const catalogComplete = objectives.length >= 6 && kinds.size >= 3;

  return {
    version: V68_RELIABILITY_POLICY_VERSION,
    entryCount: objectives.length,
    kindCount: kinds.size,
    catalogComplete,
    objectives,
    summary: [
      `reliability-objectives count=${objectives.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getObjectivesByServiceRef(serviceDefRef: string): ReliabilityObjectiveEntry[] {
  return RELIABILITY_OBJECTIVE_CATALOG.filter((o) => o.serviceDefRef === serviceDefRef);
}
