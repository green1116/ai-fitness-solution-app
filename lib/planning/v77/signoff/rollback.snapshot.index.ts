/**
 * V77 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V77_PLANNING_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "PLN-RS-P1",
    layer: "P1",
    snapshotPath: "lib/planning/v77/planning.types.ts",
    rollbackAction: "Delete P1 planning inventory modules + verify:v77-p1 script",
    required: true,
  },
  {
    id: "PLN-RS-P2",
    layer: "P2",
    snapshotPath: "lib/planning/v77/planning.policy.ts",
    rollbackAction: "Delete P2 planning policy modules + verify:v77-p2 script",
    required: true,
  },
  {
    id: "PLN-RS-P3",
    layer: "P3",
    snapshotPath: "lib/planning/v77/planning.context.ts",
    rollbackAction: "Delete P3 planning context modules + verify:v77-p3 script",
    required: true,
  },
  {
    id: "PLN-RS-P4",
    layer: "P4",
    snapshotPath: "lib/planning/v77/planning.constraint.ts",
    rollbackAction: "Delete P4 planning constraint modules + verify:v77-p4 script",
    required: true,
  },
  {
    id: "PLN-RS-P5",
    layer: "P5",
    snapshotPath: "lib/planning/v77/planning.evaluation.ts",
    rollbackAction: "Delete P5 planning evaluation modules + verify:v77-p5 script",
    required: true,
  },
  {
    id: "PLN-RS-P6",
    layer: "P6",
    snapshotPath: "lib/planning/v77/planning.simulation.ts",
    rollbackAction: "Delete P6 planning simulation modules + verify:v77-p6 script",
    required: true,
  },
  {
    id: "PLN-RS-P7",
    layer: "P7",
    snapshotPath: "lib/planning/v77/planning.compliance.ts",
    rollbackAction: "Delete P7 planning compliance modules + verify:v77-p7 script",
    required: true,
  },
  {
    id: "PLN-RS-P8",
    layer: "P8",
    snapshotPath: "lib/planning/v77/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v77-p8 script",
    required: true,
  },
  {
    id: "PLN-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v77-* scripts from package.json",
    required: true,
  },
  {
    id: "PLN-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V77-PLANNING-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V77 planning signoff docs",
    required: true,
  },
  {
    id: "PLN-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v77-p*.ts",
    rollbackAction: "Delete V77 verify scripts",
    required: true,
  },
  {
    id: "PLN-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/collaboration/v76/",
    rollbackAction: "DO NOT MODIFY — frozen upstream V76 collaboration (V48–V76)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V77_PLANNING_FREEZE_VERSION,
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
