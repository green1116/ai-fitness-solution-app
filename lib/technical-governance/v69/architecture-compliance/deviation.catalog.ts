/**
 * V69 P7 — Deviation catalog (declarative)
 */
import type { DeviationEntry, DeviationManifest } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";

export const DEVIATION_CATALOG: DeviationEntry[] = [
  {
    id: "ACMP-DEV-001",
    complianceObjectRef: "ACMP-OBJ-001",
    severity: "blocker",
    deviationType: "missing_arc_def",
    gateBlock: true,
    required: true,
    description: "Missing architecture definition deviation",
  },
  {
    id: "ACMP-DEV-002",
    complianceObjectRef: "ACMP-OBJ-002",
    severity: "critical",
    deviationType: "interface_mismatch",
    gateBlock: true,
    required: true,
    description: "API interface standard mismatch deviation",
  },
  {
    id: "ACMP-DEV-003",
    complianceObjectRef: "ACMP-OBJ-003",
    severity: "major",
    deviationType: "cross_ref_drift",
    gateBlock: false,
    required: true,
    description: "Domain cross-reference drift deviation",
  },
  {
    id: "ACMP-DEV-004",
    complianceObjectRef: "ACMP-OBJ-004",
    severity: "critical",
    deviationType: "frozen_layer_change",
    gateBlock: true,
    required: true,
    description: "Unauthorized frozen layer change deviation",
  },
  {
    id: "ACMP-DEV-005",
    complianceObjectRef: "ACMP-OBJ-005",
    severity: "blocker",
    deviationType: "security_gate_fail",
    gateBlock: true,
    required: true,
    description: "Security governance gate failure deviation",
  },
  {
    id: "ACMP-DEV-006",
    complianceObjectRef: "ACMP-OBJ-006",
    severity: "major",
    deviationType: "module_root_violation",
    gateBlock: false,
    required: true,
    description: "Governance module root layout violation",
  },
  {
    id: "ACMP-DEV-007",
    complianceObjectRef: "ACMP-OBJ-007",
    severity: "minor",
    deviationType: "verify_contract_drift",
    gateBlock: false,
    required: true,
    description: "Verify script contract drift deviation",
  },
  {
    id: "ACMP-DEV-008",
    complianceObjectRef: "ACMP-OBJ-008",
    severity: "critical",
    deviationType: "unapproved_release_deviation",
    gateBlock: true,
    required: true,
    description: "Unapproved deployment release deviation",
  },
];

export function buildDeviationManifest(): DeviationManifest {
  const deviations = DEVIATION_CATALOG;
  const severities = new Set(deviations.map((d) => d.severity));
  const catalogComplete = deviations.length >= 6 && severities.size >= 3;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    entryCount: deviations.length,
    severityCount: severities.size,
    catalogComplete,
    deviations,
    summary: [
      `deviations count=${deviations.length}`,
      `severities=${severities.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDeviationsByObjectRef(
  complianceObjectRef: string,
): DeviationEntry[] {
  return DEVIATION_CATALOG.filter((d) => d.complianceObjectRef === complianceObjectRef);
}

export function computeDeclarativeComplianceBlock(input: {
  severity: DeviationEntry["severity"];
}): boolean {
  return input.severity === "blocker" || input.severity === "critical";
}
