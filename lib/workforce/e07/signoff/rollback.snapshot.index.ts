/**
 * E07-P8 — Rollback snapshot index (declarative catalog)
 */

import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { E07_WORKFORCE_PLATFORM_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "DW-RS-P1",
    layer: "P1",
    snapshotPath: "lib/workforce/e07/core+runtime+skill/",
    rollbackAction: "Delete P1 foundation modules + verify-e07-p1 script",
    required: true,
  },
  {
    id: "DW-RS-P2",
    layer: "P2",
    snapshotPath: "lib/workforce/e07/employee/",
    rollbackAction: "Delete P2 employee modules + verify-e07-p2 script",
    required: true,
  },
  {
    id: "DW-RS-P3",
    layer: "P3",
    snapshotPath: "lib/workforce/e07/marketplace/",
    rollbackAction: "Delete P3 marketplace modules + verify-e07-p3 script",
    required: true,
  },
  {
    id: "DW-RS-P4",
    layer: "P4",
    snapshotPath: "lib/workforce/e07/orchestration/",
    rollbackAction: "Delete P4 orchestration modules + verify-e07-p4 script",
    required: true,
  },
  {
    id: "DW-RS-P5",
    layer: "P5",
    snapshotPath: "lib/workforce/e07/collaboration/",
    rollbackAction: "Delete P5 collaboration modules + verify-e07-p5 script",
    required: true,
  },
  {
    id: "DW-RS-P6",
    layer: "P6",
    snapshotPath: "lib/workforce/e07/learning/",
    rollbackAction: "Delete P6 learning modules + verify-e07-p6 script",
    required: true,
  },
  {
    id: "DW-RS-P7",
    layer: "P7",
    snapshotPath: "lib/workforce/e07/organization/",
    rollbackAction: "Delete P7 organization modules + verify-e07-p7 script",
    required: true,
  },
  {
    id: "DW-RS-P8",
    layer: "P8",
    snapshotPath: "lib/workforce/e07/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify-e07-p8 script",
    required: true,
  },
  {
    id: "DW-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e07-p*.ts",
    rollbackAction: "Delete E07 verify scripts",
    required: true,
  },
  {
    id: "DW-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/workforce/e07/",
    rollbackAction: "Remove E07 workforce tree if rolling back program",
    required: true,
  },
  {
    id: "DW-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/autonomous/e06/",
    rollbackAction:
      "DO NOT MODIFY — frozen upstream E06 Autonomous Enterprise OS",
    required: true,
  },
  {
    id: "DW-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/workforce/e07/{core,runtime,skill,employee,marketplace,orchestration,collaboration,learning,organization}/",
    rollbackAction: "DO NOT MODIFY — frozen E07 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
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
