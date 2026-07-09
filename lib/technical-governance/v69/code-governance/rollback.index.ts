/**
 * V69 P3 — Code governance rollback index (declarative)
 */
import { V69_CODE_GOVERNANCE_FREEZE_VERSION } from "./governance.types";

export type CodeGovernanceRollbackEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type CodeGovernanceRollbackIndex = {
  version: typeof V69_CODE_GOVERNANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: CodeGovernanceRollbackEntry[];
  summary: string;
};

export const CODE_GOVERNANCE_ROLLBACK_INDEX: CodeGovernanceRollbackEntry[] = [
  {
    id: "CGR-P3",
    layer: "P3",
    snapshotPath: "lib/technical-governance/v69/code-governance/",
    rollbackAction: "Delete P3 code-governance modules + verify:v69-p3 script",
    required: true,
  },
  {
    id: "CGR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert v69 index.ts exports to P1–P2 state",
    required: true,
  },
  {
    id: "CGR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-p3 script from package.json",
    required: true,
  },
  {
    id: "CGR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/V69-CODE-GOVERNANCE.md",
    rollbackAction: "Delete V69 P3 code governance doc",
    required: true,
  },
  {
    id: "CGR-UP-P2",
    layer: "upstream-p2",
    snapshotPath: "lib/technical-governance/v69/architecture-dependency/",
    rollbackAction: "DO NOT MODIFY — frozen P2 upstream",
    required: true,
  },
  {
    id: "CGR-UP-P1",
    layer: "upstream-p1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "DO NOT MODIFY — frozen P1 upstream",
    required: true,
  },
];

export function buildCodeGovernanceRollbackIndex(): CodeGovernanceRollbackIndex {
  const entries = CODE_GOVERNANCE_ROLLBACK_INDEX;
  const indexComplete = entries.length >= 4;

  return {
    version: V69_CODE_GOVERNANCE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-index entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}
