/**
 * V68 P5 — Threshold definition catalog (declarative)
 */
import type { ThresholdDefinition, ThresholdDefinitionManifest } from "./governance.types";
import { V68_CAPACITY_PLANNING_VERSION } from "./governance.types";

export const THRESHOLD_DEFINITION_CATALOG: ThresholdDefinition[] = [
  {
    id: "CAP-THR-001",
    baselineRef: "CAP-BASE-001",
    thresholdKind: "warning",
    thresholdValue: 1500,
    unit: "rps",
    required: true,
    description: "API request rate warning at 1.5x baseline",
  },
  {
    id: "CAP-THR-002",
    baselineRef: "CAP-BASE-001",
    thresholdKind: "critical",
    thresholdValue: 2000,
    unit: "rps",
    required: true,
    description: "API request rate critical at 2x baseline",
  },
  {
    id: "CAP-THR-003",
    baselineRef: "CAP-BASE-002",
    thresholdKind: "warning",
    thresholdValue: 60,
    unit: "percent",
    required: true,
    description: "Health probe CPU warning threshold",
  },
  {
    id: "CAP-THR-004",
    baselineRef: "CAP-BASE-004",
    thresholdKind: "saturated",
    thresholdValue: 1000,
    unit: "rps",
    required: true,
    description: "Alert routing saturation threshold",
  },
  {
    id: "CAP-THR-005",
    baselineRef: "CAP-BASE-005",
    thresholdKind: "critical",
    thresholdValue: 40,
    unit: "count",
    required: true,
    description: "On-call concurrent page critical threshold",
  },
  {
    id: "CAP-THR-006",
    baselineRef: "CAP-BASE-006",
    thresholdKind: "warning",
    thresholdValue: 70,
    unit: "percent",
    required: true,
    description: "Deployment verify CPU warning",
  },
  {
    id: "CAP-THR-007",
    baselineRef: "CAP-BASE-007",
    thresholdKind: "critical",
    thresholdValue: 1024,
    unit: "gb",
    required: true,
    description: "Readiness probe memory critical",
  },
  {
    id: "CAP-THR-008",
    baselineRef: "CAP-BASE-008",
    thresholdKind: "warning",
    thresholdValue: 15,
    unit: "gb",
    required: true,
    description: "SLO metrics storage warning",
  },
];

export function buildThresholdDefinitionManifest(): ThresholdDefinitionManifest {
  const thresholds = THRESHOLD_DEFINITION_CATALOG;
  const kinds = new Set(thresholds.map((t) => t.thresholdKind));
  const catalogComplete = thresholds.length >= 6 && kinds.size >= 3;

  return {
    version: V68_CAPACITY_PLANNING_VERSION,
    entryCount: thresholds.length,
    kindCount: kinds.size,
    catalogComplete,
    thresholds,
    summary: [
      `threshold-definitions count=${thresholds.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getThresholdsByBaselineRef(baselineRef: string): ThresholdDefinition[] {
  return THRESHOLD_DEFINITION_CATALOG.filter((t) => t.baselineRef === baselineRef);
}
