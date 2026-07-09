/**
 * V69 P4 — Technical standards rollback index (declarative)
 */
import { V69_TECHNICAL_STANDARDS_FREEZE_VERSION } from "./standards.types";

export type TechnicalStandardsRollbackEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type TechnicalStandardsRollbackIndex = {
  version: typeof V69_TECHNICAL_STANDARDS_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: TechnicalStandardsRollbackEntry[];
  summary: string;
};

export const TECHNICAL_STANDARDS_ROLLBACK_INDEX: TechnicalStandardsRollbackEntry[] = [
  {
    id: "TSR-P4",
    layer: "P4",
    snapshotPath: "lib/technical-governance/v69/technical-standards/",
    rollbackAction: "Delete P4 technical-standards modules + verify:v69-p4 script",
    required: true,
  },
  {
    id: "TSR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert v69 index.ts exports to P1–P3 state",
    required: true,
  },
  {
    id: "TSR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-p4 script from package.json",
    required: true,
  },
  {
    id: "TSR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/V69-TECHNICAL-STANDARDS.md",
    rollbackAction: "Delete V69 P4 technical standards doc",
    required: true,
  },
  {
    id: "TSR-UP-P3",
    layer: "upstream-p3",
    snapshotPath: "lib/technical-governance/v69/code-governance/",
    rollbackAction: "DO NOT MODIFY — frozen P3 upstream",
    required: true,
  },
  {
    id: "TSR-UP-P2",
    layer: "upstream-p2",
    snapshotPath: "lib/technical-governance/v69/architecture-dependency/",
    rollbackAction: "DO NOT MODIFY — frozen P2 upstream",
    required: true,
  },
  {
    id: "TSR-UP-P1",
    layer: "upstream-p1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "DO NOT MODIFY — frozen P1 upstream",
    required: true,
  },
];

export function buildTechnicalStandardsRollbackIndex(): TechnicalStandardsRollbackIndex {
  const entries = TECHNICAL_STANDARDS_ROLLBACK_INDEX;
  const indexComplete = entries.length >= 4;

  return {
    version: V69_TECHNICAL_STANDARDS_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-index entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}
