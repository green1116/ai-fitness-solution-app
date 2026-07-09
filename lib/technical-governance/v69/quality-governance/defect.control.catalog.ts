/**
 * V69 P6 — Defect control catalog (declarative)
 */
import type { DefectControlEntry, DefectControlManifest } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";

export const DEFECT_CONTROL_CATALOG: DefectControlEntry[] = [
  {
    id: "QGOV-DCT-001",
    qualityObjectRef: "QGOV-OBJ-001",
    severity: "blocker",
    controlAction: "block_release",
    gateBlock: true,
    required: true,
    description: "Application blocker defects block release",
  },
  {
    id: "QGOV-DCT-002",
    qualityObjectRef: "QGOV-OBJ-002",
    severity: "critical",
    controlAction: "block_api_deploy",
    gateBlock: true,
    required: true,
    description: "API critical defects block deploy",
  },
  {
    id: "QGOV-DCT-003",
    qualityObjectRef: "QGOV-OBJ-003",
    severity: "major",
    controlAction: "require_fix_before_merge",
    gateBlock: false,
    required: true,
    description: "Domain major defects require fix",
  },
  {
    id: "QGOV-DCT-004",
    qualityObjectRef: "QGOV-OBJ-004",
    severity: "critical",
    controlAction: "block_schema_change",
    gateBlock: true,
    required: true,
    description: "Data critical defects block schema changes",
  },
  {
    id: "QGOV-DCT-005",
    qualityObjectRef: "QGOV-OBJ-005",
    severity: "blocker",
    controlAction: "block_all_release",
    gateBlock: true,
    required: true,
    description: "Security blocker defects halt all release",
  },
  {
    id: "QGOV-DCT-006",
    qualityObjectRef: "QGOV-OBJ-006",
    severity: "major",
    controlAction: "block_governance_freeze",
    gateBlock: true,
    required: true,
    description: "Platform governance defects block freeze",
  },
  {
    id: "QGOV-DCT-007",
    qualityObjectRef: "QGOV-OBJ-007",
    severity: "minor",
    controlAction: "track_and_triage",
    gateBlock: false,
    required: true,
    description: "Monitoring minor defects tracked only",
  },
  {
    id: "QGOV-DCT-008",
    qualityObjectRef: "QGOV-OBJ-008",
    severity: "critical",
    controlAction: "block_pipeline",
    gateBlock: true,
    required: true,
    description: "Deployment critical defects block pipeline",
  },
];

export function buildDefectControlManifest(): DefectControlManifest {
  const controls = DEFECT_CONTROL_CATALOG;
  const severities = new Set(controls.map((c) => c.severity));
  const catalogComplete = controls.length >= 6 && severities.size >= 3;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    entryCount: controls.length,
    severityCount: severities.size,
    catalogComplete,
    controls,
    summary: [
      `defect-controls count=${controls.length}`,
      `severities=${severities.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDefectControlsByObjectRef(
  qualityObjectRef: string,
): DefectControlEntry[] {
  return DEFECT_CONTROL_CATALOG.filter((c) => c.qualityObjectRef === qualityObjectRef);
}

export function computeDeclarativeGateBlock(input: {
  severity: DefectControlEntry["severity"];
}): boolean {
  return input.severity === "blocker" || input.severity === "critical";
}
