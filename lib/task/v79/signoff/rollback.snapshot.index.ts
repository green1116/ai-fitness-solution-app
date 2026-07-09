/**
 * V79 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V79_TASK_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "TSK-RS-P1",
    layer: "P1",
    snapshotPath: "lib/task/v79/task.types.ts",
    rollbackAction: "Delete P1 task inventory modules + verify:v79-p1 script",
    required: true,
  },
  {
    id: "TSK-RS-P2",
    layer: "P2",
    snapshotPath: "lib/task/v79/task.policy.ts",
    rollbackAction: "Delete P2 task policy modules + verify:v79-p2 script",
    required: true,
  },
  {
    id: "TSK-RS-P3",
    layer: "P3",
    snapshotPath: "lib/task/v79/task.context.ts",
    rollbackAction: "Delete P3 task context modules + verify:v79-p3 script",
    required: true,
  },
  {
    id: "TSK-RS-P4",
    layer: "P4",
    snapshotPath: "lib/task/v79/task.constraint.ts",
    rollbackAction: "Delete P4 task constraint modules + verify:v79-p4 script",
    required: true,
  },
  {
    id: "TSK-RS-P5",
    layer: "P5",
    snapshotPath: "lib/task/v79/task.evaluation.ts",
    rollbackAction: "Delete P5 task evaluation modules + verify:v79-p5 script",
    required: true,
  },
  {
    id: "TSK-RS-P6",
    layer: "P6",
    snapshotPath: "lib/task/v79/task.simulation.ts",
    rollbackAction: "Delete P6 task simulation modules + verify:v79-p6 script",
    required: true,
  },
  {
    id: "TSK-RS-P7",
    layer: "P7",
    snapshotPath: "lib/task/v79/task.compliance.ts",
    rollbackAction: "Delete P7 task compliance modules + verify:v79-p7 script",
    required: true,
  },
  {
    id: "TSK-RS-P8",
    layer: "P8",
    snapshotPath: "lib/task/v79/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v79-p8 script",
    required: true,
  },
  {
    id: "TSK-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v79-* scripts from package.json",
    required: true,
  },
  {
    id: "TSK-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V79-TASK-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V79 task signoff docs",
    required: true,
  },
  {
    id: "TSK-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v79-p*.ts",
    rollbackAction: "Delete V79 verify scripts",
    required: true,
  },
  {
    id: "TSK-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/execution/v78/",
    rollbackAction: "DO NOT MODIFY — frozen upstream V78 execution (V48–V78)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V79_TASK_FREEZE_VERSION,
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
