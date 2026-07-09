/**
 * V69 P5 — Security governance rollback index (declarative)
 */
import { V69_SECURITY_GOVERNANCE_FREEZE_VERSION } from "./governance.types";

export type SecurityGovernanceRollbackEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type SecurityGovernanceRollbackIndex = {
  version: typeof V69_SECURITY_GOVERNANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: SecurityGovernanceRollbackEntry[];
  summary: string;
};

export const SECURITY_GOVERNANCE_ROLLBACK_INDEX: SecurityGovernanceRollbackEntry[] = [
  {
    id: "SGR-P5",
    layer: "P5",
    snapshotPath: "lib/technical-governance/v69/security-governance/",
    rollbackAction: "Delete P5 security-governance modules + verify:v69-p5 script",
    required: true,
  },
  {
    id: "SGR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert v69 index.ts exports to P1–P4 state",
    required: true,
  },
  {
    id: "SGR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-p5 script from package.json",
    required: true,
  },
  {
    id: "SGR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/V69-SECURITY-GOVERNANCE.md",
    rollbackAction: "Delete V69 P5 security governance doc",
    required: true,
  },
  {
    id: "SGR-UP-P4",
    layer: "upstream-p4",
    snapshotPath: "lib/technical-governance/v69/technical-standards/",
    rollbackAction: "DO NOT MODIFY — frozen P4 upstream",
    required: true,
  },
  {
    id: "SGR-UP-P3",
    layer: "upstream-p3",
    snapshotPath: "lib/technical-governance/v69/code-governance/",
    rollbackAction: "DO NOT MODIFY — frozen P3 upstream",
    required: true,
  },
  {
    id: "SGR-UP-P2",
    layer: "upstream-p2",
    snapshotPath: "lib/technical-governance/v69/architecture-dependency/",
    rollbackAction: "DO NOT MODIFY — frozen P2 upstream",
    required: true,
  },
  {
    id: "SGR-UP-P1",
    layer: "upstream-p1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "DO NOT MODIFY — frozen P1 upstream",
    required: true,
  },
];

export function buildSecurityGovernanceRollbackIndex(): SecurityGovernanceRollbackIndex {
  const entries = SECURITY_GOVERNANCE_ROLLBACK_INDEX;
  const indexComplete = entries.length >= 4;

  return {
    version: V69_SECURITY_GOVERNANCE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-index entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}
