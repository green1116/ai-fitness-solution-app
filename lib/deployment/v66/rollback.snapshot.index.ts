/**
 * V66 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshotEntry, RollbackSnapshotIndex } from "./signoff.types";
import { V66_DEPLOYMENT_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "RSI-P1",
    layer: "P1",
    snapshotPath: "lib/deployment/v66/baseline.ts",
    rollbackAction: "Delete P1 modules + verify:v66-p1 script",
    required: true,
  },
  {
    id: "RSI-P2",
    layer: "P2",
    snapshotPath: "lib/deployment/v66/execution.ts",
    rollbackAction: "Delete P2 modules + verify:v66-p2 script",
    required: true,
  },
  {
    id: "RSI-P3",
    layer: "P3",
    snapshotPath: "lib/deployment/v66/observability.ts",
    rollbackAction: "Delete P3 modules + verify:v66-p3 script",
    required: true,
  },
  {
    id: "RSI-P4",
    layer: "P4",
    snapshotPath: "lib/deployment/v66/release.ts",
    rollbackAction: "Delete P4 modules + verify:v66-p4 script",
    required: true,
  },
  {
    id: "RSI-P5",
    layer: "P5",
    snapshotPath: "lib/deployment/v66/security.ts",
    rollbackAction: "Delete P5 modules + verify:v66-p5 script",
    required: true,
  },
  {
    id: "RSI-P6",
    layer: "P6",
    snapshotPath: "lib/deployment/v66/dr.ts",
    rollbackAction: "Delete P6 modules + verify:v66-p6 script",
    required: true,
  },
  {
    id: "RSI-P7",
    layer: "P7",
    snapshotPath: "lib/deployment/v66/ops.ts",
    rollbackAction: "Delete P7 modules + verify:v66-p7 script",
    required: true,
  },
  {
    id: "RSI-P8",
    layer: "P8",
    snapshotPath: "lib/deployment/v66/signoff.ts",
    rollbackAction: "Delete P8 modules + verify:v66-p8 script",
    required: true,
  },
  {
    id: "RSI-IDX",
    layer: "index",
    snapshotPath: "lib/deployment/v66/index.ts",
    rollbackAction: "Revert index.ts exports to pre-P8 state",
    required: true,
  },
  {
    id: "RSI-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v66-* scripts from package.json",
    required: true,
  },
  {
    id: "RSI-DOCS",
    layer: "docs",
    snapshotPath: "docs/deployment/",
    rollbackAction: "Delete V66 deployment docs",
    required: true,
  },
  {
    id: "RSI-UP",
    layer: "upstream",
    snapshotPath: "lib/production/v65/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V65)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshotIndex {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V66_DEPLOYMENT_FREEZE_VERSION,
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
