/**
 * V68 P5 — Stress risk marker catalog (declarative)
 */
import type { StressRiskManifest, StressRiskMarker } from "./governance.types";
import { V68_CAPACITY_PLANNING_VERSION } from "./governance.types";

export const STRESS_RISK_CATALOG: StressRiskMarker[] = [
  {
    id: "CAP-RISK-001",
    serviceDefRef: "SVC-DEF-001",
    thresholdRef: "CAP-THR-002",
    riskLevel: "critical",
    triggerCondition: "requests.rps > threshold.critical",
    required: true,
    description: "Production API overload critical risk",
  },
  {
    id: "CAP-RISK-002",
    serviceDefRef: "SVC-DEF-002",
    thresholdRef: "CAP-THR-003",
    riskLevel: "medium",
    triggerCondition: "cpu.percent > threshold.warning",
    required: true,
    description: "Health probe CPU pressure risk",
  },
  {
    id: "CAP-RISK-003",
    serviceDefRef: "SVC-DEF-003",
    thresholdRef: "CAP-THR-005",
    riskLevel: "high",
    triggerCondition: "connections.count > threshold.critical",
    required: true,
    description: "Incident lifecycle connection saturation risk",
  },
  {
    id: "CAP-RISK-004",
    serviceDefRef: "SVC-DEF-004",
    thresholdRef: "CAP-THR-004",
    riskLevel: "high",
    triggerCondition: "requests.rps >= threshold.saturated",
    required: true,
    description: "Alert routing saturation risk",
  },
  {
    id: "CAP-RISK-005",
    serviceDefRef: "SVC-DEF-005",
    thresholdRef: "CAP-THR-005",
    riskLevel: "medium",
    triggerCondition: "oncall.pages > threshold.critical",
    required: true,
    description: "On-call paging storm risk",
  },
  {
    id: "CAP-RISK-006",
    serviceDefRef: "SVC-DEF-006",
    thresholdRef: "CAP-THR-006",
    riskLevel: "low",
    triggerCondition: "cpu.percent > threshold.warning",
    required: true,
    description: "Deployment verify CPU pressure risk",
  },
  {
    id: "CAP-RISK-007",
    serviceDefRef: "SVC-DEF-007",
    thresholdRef: "CAP-THR-007",
    riskLevel: "critical",
    triggerCondition: "memory.usage > threshold.critical",
    required: true,
    description: "Readiness probe OOM risk",
  },
  {
    id: "CAP-RISK-008",
    serviceDefRef: "SVC-DEF-008",
    thresholdRef: "CAP-THR-008",
    riskLevel: "medium",
    triggerCondition: "storage.used > threshold.warning",
    required: true,
    description: "SLO metrics storage growth risk",
  },
];

export function buildStressRiskManifest(): StressRiskManifest {
  const markers = STRESS_RISK_CATALOG;
  const riskLevels = new Set(markers.map((m) => m.riskLevel));
  const catalogComplete = markers.length >= 6 && riskLevels.size >= 3;

  return {
    version: V68_CAPACITY_PLANNING_VERSION,
    entryCount: markers.length,
    riskLevelCount: riskLevels.size,
    catalogComplete,
    markers,
    summary: [
      `stress-risk markers=${markers.length}`,
      `levels=${riskLevels.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getStressRisksByServiceRef(serviceDefRef: string): StressRiskMarker[] {
  return STRESS_RISK_CATALOG.filter((m) => m.serviceDefRef === serviceDefRef);
}
