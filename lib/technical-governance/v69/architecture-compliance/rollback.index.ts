/**
 * V69 P7 — Architecture compliance rollback index (declarative)
 */
import { V69_ARCHITECTURE_COMPLIANCE_FREEZE_VERSION } from "./compliance.types";

export type ArchitectureComplianceRollbackEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type ArchitectureComplianceRollbackIndex = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: ArchitectureComplianceRollbackEntry[];
  summary: string;
};

export const ARCHITECTURE_COMPLIANCE_ROLLBACK_INDEX: ArchitectureComplianceRollbackEntry[] = [
  {
    id: "ACR-P7",
    layer: "P7",
    snapshotPath: "lib/technical-governance/v69/architecture-compliance/",
    rollbackAction: "Delete P7 architecture-compliance modules + verify:v69-p7 script",
    required: true,
  },
  {
    id: "ACR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert v69 index.ts exports to P1–P6 state",
    required: true,
  },
  {
    id: "ACR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-p7 script from package.json",
    required: true,
  },
  {
    id: "ACR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/V69-ARCHITECTURE-COMPLIANCE.md",
    rollbackAction: "Delete V69 P7 architecture compliance doc",
    required: true,
  },
  {
    id: "ACR-UP-P6",
    layer: "upstream-p6",
    snapshotPath: "lib/technical-governance/v69/quality-governance/",
    rollbackAction: "DO NOT MODIFY — frozen P6 upstream",
    required: true,
  },
  {
    id: "ACR-UP-P5",
    layer: "upstream-p5",
    snapshotPath: "lib/technical-governance/v69/security-governance/",
    rollbackAction: "DO NOT MODIFY — frozen P5 upstream",
    required: true,
  },
  {
    id: "ACR-UP-P4",
    layer: "upstream-p4",
    snapshotPath: "lib/technical-governance/v69/technical-standards/",
    rollbackAction: "DO NOT MODIFY — frozen P4 upstream",
    required: true,
  },
  {
    id: "ACR-UP-P1",
    layer: "upstream-p1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "DO NOT MODIFY — frozen P1 upstream",
    required: true,
  },
];

export function buildArchitectureComplianceRollbackIndex(): ArchitectureComplianceRollbackIndex {
  const entries = ARCHITECTURE_COMPLIANCE_ROLLBACK_INDEX;
  const indexComplete = entries.length >= 4;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-index entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}
