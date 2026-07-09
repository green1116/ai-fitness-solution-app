/**
 * V69 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshotEntry, RollbackSnapshotIndex } from "./signoff.types";
import { V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "TSR-P1",
    layer: "P1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "Delete P1 architecture-catalog modules + verify:v69-p1 script",
    required: true,
  },
  {
    id: "TSR-P2",
    layer: "P2",
    snapshotPath: "lib/technical-governance/v69/architecture-dependency/",
    rollbackAction: "Delete P2 architecture-dependency modules + verify:v69-p2 script",
    required: true,
  },
  {
    id: "TSR-P3",
    layer: "P3",
    snapshotPath: "lib/technical-governance/v69/code-governance/",
    rollbackAction: "Delete P3 code-governance modules + verify:v69-p3 script",
    required: true,
  },
  {
    id: "TSR-P4",
    layer: "P4",
    snapshotPath: "lib/technical-governance/v69/technical-standards/",
    rollbackAction: "Delete P4 technical-standards modules + verify:v69-p4 script",
    required: true,
  },
  {
    id: "TSR-P5",
    layer: "P5",
    snapshotPath: "lib/technical-governance/v69/security-governance/",
    rollbackAction: "Delete P5 security-governance modules + verify:v69-p5 script",
    required: true,
  },
  {
    id: "TSR-P6",
    layer: "P6",
    snapshotPath: "lib/technical-governance/v69/quality-governance/",
    rollbackAction: "Delete P6 quality-governance modules + verify:v69-p6 script",
    required: true,
  },
  {
    id: "TSR-P7",
    layer: "P7",
    snapshotPath: "lib/technical-governance/v69/architecture-compliance/",
    rollbackAction: "Delete P7 architecture-compliance modules + verify:v69-p7 script",
    required: true,
  },
  {
    id: "TSR-P8",
    layer: "P8",
    snapshotPath: "lib/technical-governance/v69/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v69-p8 script",
    required: true,
  },
  {
    id: "TSR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert index.ts exports to pre-P8 state",
    required: true,
  },
  {
    id: "TSR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-* scripts from package.json",
    required: true,
  },
  {
    id: "TSR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/",
    rollbackAction: "Delete V69 technical governance docs",
    required: true,
  },
  {
    id: "TSR-UP",
    layer: "upstream",
    snapshotPath: "lib/platform/v68/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V68)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshotIndex {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-snapshot entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}

export function getRollbackSnapshotByLayer(layer: string): RollbackSnapshotEntry[] {
  return ROLLBACK_SNAPSHOT_INDEX.filter((e) => e.layer === layer);
}
