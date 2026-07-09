/**
 * V69 P6 — Quality standard catalog (declarative)
 */
import type { QualityStandardEntry, QualityStandardManifest } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";

export const QUALITY_STANDARD_CATALOG: QualityStandardEntry[] = [
  {
    id: "QGOV-STD-001",
    kind: "verification",
    label: "phase_verify_pass",
    metric: "verify_exit_code",
    threshold: "0",
    enforceLevel: "required",
    required: true,
    description: "Each governance phase verify must exit 0",
  },
  {
    id: "QGOV-STD-002",
    kind: "test",
    label: "catalog_completeness",
    metric: "catalog_complete_ratio",
    threshold: "1.0",
    enforceLevel: "required",
    required: true,
    description: "All catalog manifests must report catalogComplete",
  },
  {
    id: "QGOV-STD-003",
    kind: "acceptance",
    label: "readiness_score",
    metric: "readiness_score",
    threshold: "100",
    enforceLevel: "required",
    required: true,
    description: "Governance report readiness score must be 100",
  },
  {
    id: "QGOV-STD-004",
    kind: "gate",
    label: "alignment_pass",
    metric: "refs_aligned",
    threshold: "true",
    enforceLevel: "required",
    required: true,
    description: "Cross-reference alignment must pass",
  },
  {
    id: "QGOV-STD-005",
    kind: "defect",
    label: "zero_blocker_defects",
    metric: "blocker_count",
    threshold: "0",
    enforceLevel: "required",
    required: true,
    description: "No blocker defects at freeze gate",
  },
  {
    id: "QGOV-STD-006",
    kind: "release",
    label: "typescript_compile",
    metric: "tsc_exit_code",
    threshold: "0",
    enforceLevel: "required",
    required: true,
    description: "TypeScript compile must pass",
  },
  {
    id: "QGOV-STD-007",
    kind: "verification",
    label: "registry_complete",
    metric: "registry_complete",
    threshold: "true",
    enforceLevel: "required",
    required: true,
    description: "Registry index must be complete",
  },
  {
    id: "QGOV-STD-008",
    kind: "release",
    label: "freeze_lock_intact",
    metric: "freeze_lock_ok",
    threshold: "true",
    enforceLevel: "required",
    required: true,
    description: "Freeze lock must match expected",
  },
];

export function buildQualityStandardManifest(): QualityStandardManifest {
  const standards = QUALITY_STANDARD_CATALOG;
  const kinds = new Set(standards.map((s) => s.kind));
  const catalogComplete = standards.length >= 6 && kinds.size >= 5;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    entryCount: standards.length,
    kindCount: kinds.size,
    catalogComplete,
    standards,
    summary: [
      `quality-standards count=${standards.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getQualityStandardById(id: string): QualityStandardEntry | undefined {
  return QUALITY_STANDARD_CATALOG.find((s) => s.id === id);
}
