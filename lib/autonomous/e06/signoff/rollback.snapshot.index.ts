/**
 * E06-P8 — Rollback snapshot index (declarative catalog)
 */

import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { E06_AUTONOMOUS_OS_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "EA-RS-P1",
    layer: "P1",
    snapshotPath: "lib/autonomous/e06/core+runtime+policy/",
    rollbackAction: "Delete P1 foundation modules + verify-e06-p1 script",
    required: true,
  },
  {
    id: "EA-RS-P2",
    layer: "P2",
    snapshotPath: "lib/autonomous/e06/action/",
    rollbackAction: "Delete P2 action modules + verify-e06-p2 script",
    required: true,
  },
  {
    id: "EA-RS-P3",
    layer: "P3",
    snapshotPath: "lib/autonomous/e06/workflow/",
    rollbackAction: "Delete P3 workflow modules + verify-e06-p3 script",
    required: true,
  },
  {
    id: "EA-RS-P4",
    layer: "P4",
    snapshotPath: "lib/autonomous/e06/control/",
    rollbackAction: "Delete P4 control modules + verify-e06-p4 script",
    required: true,
  },
  {
    id: "EA-RS-P5",
    layer: "P5",
    snapshotPath: "lib/autonomous/e06/optimization/",
    rollbackAction: "Delete P5 optimization modules + verify-e06-p5 script",
    required: true,
  },
  {
    id: "EA-RS-P6",
    layer: "P6",
    snapshotPath: "lib/autonomous/e06/digital-twin/",
    rollbackAction: "Delete P6 digital twin modules + verify-e06-p6 script",
    required: true,
  },
  {
    id: "EA-RS-P7",
    layer: "P7",
    snapshotPath: "lib/autonomous/e06/agent/",
    rollbackAction: "Delete P7 agent modules + verify-e06-p7 script",
    required: true,
  },
  {
    id: "EA-RS-P8",
    layer: "P8",
    snapshotPath: "lib/autonomous/e06/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify-e06-p8 script",
    required: true,
  },
  {
    id: "EA-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e06-p*.ts",
    rollbackAction: "Delete E06 verify scripts",
    required: true,
  },
  {
    id: "EA-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/autonomous/e06/",
    rollbackAction: "Remove E06 autonomous tree if rolling back program",
    required: true,
  },
  {
    id: "EA-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/intelligence/e05/",
    rollbackAction:
      "DO NOT MODIFY — frozen upstream E05 Enterprise Intelligence Layer",
    required: true,
  },
  {
    id: "EA-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/autonomous/e06/{core,runtime,policy,action,workflow,control,optimization,digital-twin,agent}/",
    rollbackAction: "DO NOT MODIFY — frozen E06 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E06_AUTONOMOUS_OS_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-snapshot entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}

export function getRollbackSnapshotByLayer(
  layer: string,
): RollbackSnapshotEntry[] {
  return ROLLBACK_SNAPSHOT_INDEX.filter((e) => e.layer === layer);
}
