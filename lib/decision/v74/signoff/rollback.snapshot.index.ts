/**
 * V74 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V74_DECISION_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "DEC-RS-P1",
    layer: "P1",
    snapshotPath: "lib/decision/v74/decision.types.ts",
    rollbackAction: "Delete P1 decision inventory modules + verify:v74-p1 script",
    required: true,
  },
  {
    id: "DEC-RS-P2",
    layer: "P2",
    snapshotPath: "lib/decision/v74/decision.policy.ts",
    rollbackAction: "Delete P2 decision policy modules + verify:v74-p2 script",
    required: true,
  },
  {
    id: "DEC-RS-P3",
    layer: "P3",
    snapshotPath: "lib/decision/v74/decision.context.ts",
    rollbackAction: "Delete P3 decision context modules + verify:v74-p3 script",
    required: true,
  },
  {
    id: "DEC-RS-P4",
    layer: "P4",
    snapshotPath: "lib/decision/v74/decision.constraint.ts",
    rollbackAction: "Delete P4 decision constraint modules + verify:v74-p4 script",
    required: true,
  },
  {
    id: "DEC-RS-P5",
    layer: "P5",
    snapshotPath: "lib/decision/v74/decision.evaluation.ts",
    rollbackAction: "Delete P5 decision evaluation modules + verify:v74-p5 script",
    required: true,
  },
  {
    id: "DEC-RS-P6",
    layer: "P6",
    snapshotPath: "lib/decision/v74/decision.simulation.ts",
    rollbackAction: "Delete P6 decision simulation modules + verify:v74-p6 script",
    required: true,
  },
  {
    id: "DEC-RS-P7",
    layer: "P7",
    snapshotPath: "lib/decision/v74/decision.compliance.ts",
    rollbackAction: "Delete P7 decision compliance modules + verify:v74-p7 script",
    required: true,
  },
  {
    id: "DEC-RS-P8",
    layer: "P8",
    snapshotPath: "lib/decision/v74/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v74-p8 script",
    required: true,
  },
  {
    id: "DEC-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v74-* scripts from package.json",
    required: true,
  },
  {
    id: "DEC-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V74-DECISION-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V74 decision signoff docs",
    required: true,
  },
  {
    id: "DEC-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v74-p*.ts",
    rollbackAction: "Delete V74 verify scripts",
    required: true,
  },
  {
    id: "DEC-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/knowledge/v73/",
    rollbackAction: "DO NOT MODIFY — frozen upstream V73 knowledge (V48–V73)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V74_DECISION_FREEZE_VERSION,
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
