/**
 * V67 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshotEntry, RollbackSnapshotIndex } from "./signoff.types";
import { V67_MONITORING_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "RSI-P1",
    layer: "P1",
    snapshotPath: "lib/monitoring/v67/foundation.ts",
    rollbackAction: "Delete P1 root contracts + verify:v67-p1 script",
    required: true,
  },
  {
    id: "RSI-P2",
    layer: "P2",
    snapshotPath: "lib/monitoring/v67/incident/",
    rollbackAction: "Delete P2 incident modules + verify:v67-p2 script",
    required: true,
  },
  {
    id: "RSI-P3",
    layer: "P3",
    snapshotPath: "lib/monitoring/v67/alerting/",
    rollbackAction: "Delete P3 alerting modules + verify:v67-p3 script",
    required: true,
  },
  {
    id: "RSI-P4",
    layer: "P4",
    snapshotPath: "lib/monitoring/v67/slo/",
    rollbackAction: "Delete P4 SLO modules + verify:v67-p4 script",
    required: true,
  },
  {
    id: "RSI-P5",
    layer: "P5",
    snapshotPath: "lib/monitoring/v67/oncall/",
    rollbackAction: "Delete P5 oncall modules + verify:v67-p5 script",
    required: true,
  },
  {
    id: "RSI-P6",
    layer: "P6",
    snapshotPath: "lib/monitoring/v67/observability/",
    rollbackAction: "Delete P6 observability modules + verify:v67-p6 script",
    required: true,
  },
  {
    id: "RSI-P7",
    layer: "P7",
    snapshotPath: "lib/monitoring/v67/postmortem/",
    rollbackAction: "Delete P7 postmortem modules + verify:v67-p7 script",
    required: true,
  },
  {
    id: "RSI-P8",
    layer: "P8",
    snapshotPath: "lib/monitoring/v67/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v67-p8 script",
    required: true,
  },
  {
    id: "RSI-IDX",
    layer: "index",
    snapshotPath: "lib/monitoring/v67/index.ts",
    rollbackAction: "Revert index.ts exports to pre-P8 state",
    required: true,
  },
  {
    id: "RSI-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v67-* scripts from package.json",
    required: true,
  },
  {
    id: "RSI-DOCS",
    layer: "docs",
    snapshotPath: "docs/monitoring/",
    rollbackAction: "Delete V67 monitoring docs",
    required: true,
  },
  {
    id: "RSI-UP",
    layer: "upstream",
    snapshotPath: "lib/deployment/v66/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V66)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshotIndex {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V67_MONITORING_FREEZE_VERSION,
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
