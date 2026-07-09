/**
 * V78 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V78_EXECUTION_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "EXE-RS-P1",
    layer: "P1",
    snapshotPath: "lib/execution/v78/execution.types.ts",
    rollbackAction: "Delete P1 execution inventory modules + verify:v78-p1 script",
    required: true,
  },
  {
    id: "EXE-RS-P2",
    layer: "P2",
    snapshotPath: "lib/execution/v78/execution.policy.ts",
    rollbackAction: "Delete P2 execution policy modules + verify:v78-p2 script",
    required: true,
  },
  {
    id: "EXE-RS-P3",
    layer: "P3",
    snapshotPath: "lib/execution/v78/execution.context.ts",
    rollbackAction: "Delete P3 execution context modules + verify:v78-p3 script",
    required: true,
  },
  {
    id: "EXE-RS-P4",
    layer: "P4",
    snapshotPath: "lib/execution/v78/execution.constraint.ts",
    rollbackAction: "Delete P4 execution constraint modules + verify:v78-p4 script",
    required: true,
  },
  {
    id: "EXE-RS-P5",
    layer: "P5",
    snapshotPath: "lib/execution/v78/execution.evaluation.ts",
    rollbackAction: "Delete P5 execution evaluation modules + verify:v78-p5 script",
    required: true,
  },
  {
    id: "EXE-RS-P6",
    layer: "P6",
    snapshotPath: "lib/execution/v78/execution.simulation.ts",
    rollbackAction: "Delete P6 execution simulation modules + verify:v78-p6 script",
    required: true,
  },
  {
    id: "EXE-RS-P7",
    layer: "P7",
    snapshotPath: "lib/execution/v78/execution.compliance.ts",
    rollbackAction: "Delete P7 execution compliance modules + verify:v78-p7 script",
    required: true,
  },
  {
    id: "EXE-RS-P8",
    layer: "P8",
    snapshotPath: "lib/execution/v78/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v78-p8 script",
    required: true,
  },
  {
    id: "EXE-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v78-* scripts from package.json",
    required: true,
  },
  {
    id: "EXE-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V78-EXECUTION-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V78 execution signoff docs",
    required: true,
  },
  {
    id: "EXE-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v78-p*.ts",
    rollbackAction: "Delete V78 verify scripts",
    required: true,
  },
  {
    id: "EXE-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/planning/v77/",
    rollbackAction: "DO NOT MODIFY — frozen upstream V77 planning (V48–V77)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V78_EXECUTION_FREEZE_VERSION,
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
