/**
 * V71 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V71_WORKFLOW_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "ORC-RS-P1",
    layer: "P1",
    snapshotPath: "lib/orchestration/v71/orchestration.types.ts",
    rollbackAction: "Delete P1 orchestration catalog modules + verify:v71-p1 script",
    required: true,
  },
  {
    id: "ORC-RS-P2",
    layer: "P2",
    snapshotPath: "lib/orchestration/v71/workflow.dependency.ts",
    rollbackAction: "Delete P2 workflow dependency modules + verify:v71-p2 script",
    required: true,
  },
  {
    id: "ORC-RS-P3",
    layer: "P3",
    snapshotPath: "lib/orchestration/v71/workflow.policy.ts",
    rollbackAction: "Delete P3 workflow policy modules + verify:v71-p3 script",
    required: true,
  },
  {
    id: "ORC-RS-P4",
    layer: "P4",
    snapshotPath: "lib/orchestration/v71/workflow.compatibility.ts",
    rollbackAction: "Delete P4 workflow compatibility modules + verify:v71-p4 script",
    required: true,
  },
  {
    id: "ORC-RS-P5",
    layer: "P5",
    snapshotPath: "lib/orchestration/v71/workflow.governance.ts",
    rollbackAction: "Delete P5 workflow governance modules + verify:v71-p5 script",
    required: true,
  },
  {
    id: "ORC-RS-P6",
    layer: "P6",
    snapshotPath: "lib/orchestration/v71/lifecycle.management.ts",
    rollbackAction: "Delete P6 workflow lifecycle modules + verify:v71-p6 script",
    required: true,
  },
  {
    id: "ORC-RS-P7",
    layer: "P7",
    snapshotPath: "lib/orchestration/v71/workflow.compliance.ts",
    rollbackAction: "Delete P7 workflow compliance modules + verify:v71-p7 script",
    required: true,
  },
  {
    id: "ORC-RS-P8",
    layer: "P8",
    snapshotPath: "lib/orchestration/v71/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v71-p8 script",
    required: true,
  },
  {
    id: "ORC-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v71-* scripts from package.json",
    required: true,
  },
  {
    id: "ORC-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V71-P8-WORKFLOW-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V71 workflow signoff docs",
    required: true,
  },
  {
    id: "ORC-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/delivery/v70/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V70)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V71_WORKFLOW_FREEZE_VERSION,
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
