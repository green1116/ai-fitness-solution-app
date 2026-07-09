/**
 * V76 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V76_COLLABORATION_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "COL-RS-P1",
    layer: "P1",
    snapshotPath: "lib/collaboration/v76/collaboration.types.ts",
    rollbackAction: "Delete P1 collaboration inventory modules + verify:v76-p1 script",
    required: true,
  },
  {
    id: "COL-RS-P2",
    layer: "P2",
    snapshotPath: "lib/collaboration/v76/collaboration.policy.ts",
    rollbackAction: "Delete P2 collaboration policy modules + verify:v76-p2 script",
    required: true,
  },
  {
    id: "COL-RS-P3",
    layer: "P3",
    snapshotPath: "lib/collaboration/v76/collaboration.context.ts",
    rollbackAction: "Delete P3 collaboration context modules + verify:v76-p3 script",
    required: true,
  },
  {
    id: "COL-RS-P4",
    layer: "P4",
    snapshotPath: "lib/collaboration/v76/collaboration.constraint.ts",
    rollbackAction: "Delete P4 collaboration constraint modules + verify:v76-p4 script",
    required: true,
  },
  {
    id: "COL-RS-P5",
    layer: "P5",
    snapshotPath: "lib/collaboration/v76/collaboration.evaluation.ts",
    rollbackAction: "Delete P5 collaboration evaluation modules + verify:v76-p5 script",
    required: true,
  },
  {
    id: "COL-RS-P6",
    layer: "P6",
    snapshotPath: "lib/collaboration/v76/collaboration.simulation.ts",
    rollbackAction: "Delete P6 collaboration simulation modules + verify:v76-p6 script",
    required: true,
  },
  {
    id: "COL-RS-P7",
    layer: "P7",
    snapshotPath: "lib/collaboration/v76/collaboration.compliance.ts",
    rollbackAction: "Delete P7 collaboration compliance modules + verify:v76-p7 script",
    required: true,
  },
  {
    id: "COL-RS-P8",
    layer: "P8",
    snapshotPath: "lib/collaboration/v76/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v76-p8 script",
    required: true,
  },
  {
    id: "COL-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v76-* scripts from package.json",
    required: true,
  },
  {
    id: "COL-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V76-COLLABORATION-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V76 collaboration signoff docs",
    required: true,
  },
  {
    id: "COL-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v76-p*.ts",
    rollbackAction: "Delete V76 verify scripts",
    required: true,
  },
  {
    id: "COL-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/agent/v75/",
    rollbackAction: "DO NOT MODIFY — frozen upstream V75 agent (V48–V75)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V76_COLLABORATION_FREEZE_VERSION,
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
