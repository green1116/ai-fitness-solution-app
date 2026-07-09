/**
 * V68 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshotEntry, RollbackSnapshotIndex } from "./signoff.types";
import { V68_PLATFORM_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "RSI-P1",
    layer: "P1",
    snapshotPath: "lib/platform/v68/service-catalog/",
    rollbackAction: "Delete P1 service-catalog modules + verify:v68-p1 script",
    required: true,
  },
  {
    id: "RSI-P2",
    layer: "P2",
    snapshotPath: "lib/platform/v68/dependency-graph/",
    rollbackAction: "Delete P2 dependency-graph modules + verify:v68-p2 script",
    required: true,
  },
  {
    id: "RSI-P3",
    layer: "P3",
    snapshotPath: "lib/platform/v68/configuration/",
    rollbackAction: "Delete P3 configuration modules + verify:v68-p3 script",
    required: true,
  },
  {
    id: "RSI-P4",
    layer: "P4",
    snapshotPath: "lib/platform/v68/feature-flag/",
    rollbackAction: "Delete P4 feature-flag modules + verify:v68-p4 script",
    required: true,
  },
  {
    id: "RSI-P5",
    layer: "P5",
    snapshotPath: "lib/platform/v68/capacity-planning/",
    rollbackAction: "Delete P5 capacity-planning modules + verify:v68-p5 script",
    required: true,
  },
  {
    id: "RSI-P6",
    layer: "P6",
    snapshotPath: "lib/platform/v68/reliability-policy/",
    rollbackAction: "Delete P6 reliability-policy modules + verify:v68-p6 script",
    required: true,
  },
  {
    id: "RSI-P7",
    layer: "P7",
    snapshotPath: "lib/platform/v68/observability-policy/",
    rollbackAction: "Delete P7 observability-policy modules + verify:v68-p7 script",
    required: true,
  },
  {
    id: "RSI-P8",
    layer: "P8",
    snapshotPath: "lib/platform/v68/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v68-p8 script",
    required: true,
  },
  {
    id: "RSI-IDX",
    layer: "index",
    snapshotPath: "lib/platform/v68/index.ts",
    rollbackAction: "Revert index.ts exports to pre-P8 state",
    required: true,
  },
  {
    id: "RSI-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v68-* scripts from package.json",
    required: true,
  },
  {
    id: "RSI-DOCS",
    layer: "docs",
    snapshotPath: "docs/platform/",
    rollbackAction: "Delete V68 platform governance docs",
    required: true,
  },
  {
    id: "RSI-UP",
    layer: "upstream",
    snapshotPath: "lib/monitoring/v67/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V67)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshotIndex {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V68_PLATFORM_FREEZE_VERSION,
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
