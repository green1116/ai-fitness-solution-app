/**
 * V69 P6 — Quality governance rollback index (declarative)
 */
import { V69_QUALITY_GOVERNANCE_FREEZE_VERSION } from "./governance.types";

export type QualityGovernanceRollbackEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type QualityGovernanceRollbackIndex = {
  version: typeof V69_QUALITY_GOVERNANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: QualityGovernanceRollbackEntry[];
  summary: string;
};

export const QUALITY_GOVERNANCE_ROLLBACK_INDEX: QualityGovernanceRollbackEntry[] = [
  {
    id: "QGR-P6",
    layer: "P6",
    snapshotPath: "lib/technical-governance/v69/quality-governance/",
    rollbackAction: "Delete P6 quality-governance modules + verify:v69-p6 script",
    required: true,
  },
  {
    id: "QGR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert v69 index.ts exports to P1–P5 state",
    required: true,
  },
  {
    id: "QGR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-p6 script from package.json",
    required: true,
  },
  {
    id: "QGR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/V69-QUALITY-GOVERNANCE.md",
    rollbackAction: "Delete V69 P6 quality governance doc",
    required: true,
  },
  {
    id: "QGR-UP-P5",
    layer: "upstream-p5",
    snapshotPath: "lib/technical-governance/v69/security-governance/",
    rollbackAction: "DO NOT MODIFY — frozen P5 upstream",
    required: true,
  },
  {
    id: "QGR-UP-P4",
    layer: "upstream-p4",
    snapshotPath: "lib/technical-governance/v69/technical-standards/",
    rollbackAction: "DO NOT MODIFY — frozen P4 upstream",
    required: true,
  },
  {
    id: "QGR-UP-P3",
    layer: "upstream-p3",
    snapshotPath: "lib/technical-governance/v69/code-governance/",
    rollbackAction: "DO NOT MODIFY — frozen P3 upstream",
    required: true,
  },
  {
    id: "QGR-UP-P1",
    layer: "upstream-p1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "DO NOT MODIFY — frozen P1 upstream",
    required: true,
  },
];

export function buildQualityGovernanceRollbackIndex(): QualityGovernanceRollbackIndex {
  const entries = QUALITY_GOVERNANCE_ROLLBACK_INDEX;
  const indexComplete = entries.length >= 4;

  return {
    version: V69_QUALITY_GOVERNANCE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-index entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}
