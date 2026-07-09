/**
 * V68 P7 — Alert mapping catalog (declarative, links observability to P6 failure tiers)
 */
import type { AlertMappingEntry, AlertMappingManifest } from "./governance.types";
import { V68_OBSERVABILITY_POLICY_VERSION } from "./governance.types";

export const ALERT_MAPPING_CATALOG: AlertMappingEntry[] = [
  {
    id: "OBS-ALM-001",
    serviceDefRef: "SVC-DEF-001",
    sourceKind: "metric",
    sourceRef: "OBS-MET-001",
    failureRef: "REL-FAIL-002",
    alertSeverityRef: "P1",
    required: true,
    description: "API latency breach maps to major degradation",
  },
  {
    id: "OBS-ALM-002",
    serviceDefRef: "SVC-DEF-001",
    sourceKind: "metric",
    sourceRef: "OBS-MET-002",
    failureRef: "REL-FAIL-001",
    alertSeverityRef: "P0",
    required: true,
    description: "API error spike maps to total outage",
  },
  {
    id: "OBS-ALM-003",
    serviceDefRef: "SVC-DEF-002",
    sourceKind: "log",
    sourceRef: "OBS-LOG-003",
    failureRef: "REL-FAIL-003",
    alertSeverityRef: "P2",
    required: true,
    description: "Health probe warnings map to partial impact",
  },
  {
    id: "OBS-ALM-004",
    serviceDefRef: "SVC-DEF-003",
    sourceKind: "trace",
    sourceRef: "OBS-TRC-004",
    failureRef: "REL-FAIL-004",
    alertSeverityRef: "P3",
    required: true,
    description: "Incident lifecycle trace anomalies map to minor incident",
  },
  {
    id: "OBS-ALM-005",
    serviceDefRef: "SVC-DEF-004",
    sourceKind: "metric",
    sourceRef: "OBS-MET-005",
    failureRef: "REL-FAIL-006",
    alertSeverityRef: "P1",
    required: true,
    description: "Alert routing SLO breach mapping",
  },
  {
    id: "OBS-ALM-006",
    serviceDefRef: "SVC-DEF-006",
    sourceKind: "log",
    sourceRef: "OBS-LOG-006",
    failureRef: "REL-FAIL-007",
    alertSeverityRef: "P0",
    required: true,
    description: "Verify failure logs map to security/outage tier",
  },
  {
    id: "OBS-ALM-007",
    serviceDefRef: "SVC-DEF-007",
    sourceKind: "trace",
    sourceRef: "OBS-TRC-007",
    failureRef: "REL-FAIL-008",
    alertSeverityRef: "P2",
    required: true,
    description: "Readiness latency traces map to capacity pressure",
  },
  {
    id: "OBS-ALM-008",
    serviceDefRef: "SVC-DEF-008",
    sourceKind: "metric",
    sourceRef: "OBS-MET-008",
    failureRef: "REL-FAIL-006",
    alertSeverityRef: "P1",
    required: true,
    description: "SLO error budget exhaustion alert mapping",
  },
];

export function buildAlertMappingManifest(): AlertMappingManifest {
  const mappings = ALERT_MAPPING_CATALOG;
  const sourceKinds = new Set(mappings.map((m) => m.sourceKind));
  const catalogComplete = mappings.length >= 6 && sourceKinds.size >= 3;

  return {
    version: V68_OBSERVABILITY_POLICY_VERSION,
    entryCount: mappings.length,
    sourceKindCount: sourceKinds.size,
    catalogComplete,
    mappings,
    summary: [
      `alert-mappings count=${mappings.length}`,
      `sourceKinds=${sourceKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAlertMappingsByServiceRef(serviceDefRef: string): AlertMappingEntry[] {
  return ALERT_MAPPING_CATALOG.filter((m) => m.serviceDefRef === serviceDefRef);
}

export function getAlertMappingsBySourceKind(
  sourceKind: AlertMappingEntry["sourceKind"],
): AlertMappingEntry[] {
  return ALERT_MAPPING_CATALOG.filter((m) => m.sourceKind === sourceKind);
}
