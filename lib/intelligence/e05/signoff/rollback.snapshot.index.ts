/**
 * E05-P8 — Rollback snapshot index (declarative catalog)
 */

import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "EI-RS-P1",
    layer: "P1",
    snapshotPath: "lib/intelligence/e05/core+runtime+insight/",
    rollbackAction: "Delete P1 foundation modules + verify-e05-p1 script",
    required: true,
  },
  {
    id: "EI-RS-P2",
    layer: "P2",
    snapshotPath: "lib/intelligence/e05/analytics/",
    rollbackAction: "Delete P2 analytics modules + verify-e05-p2 script",
    required: true,
  },
  {
    id: "EI-RS-P3",
    layer: "P3",
    snapshotPath: "lib/intelligence/e05/kpi/",
    rollbackAction: "Delete P3 kpi modules + verify-e05-p3 script",
    required: true,
  },
  {
    id: "EI-RS-P4",
    layer: "P4",
    snapshotPath: "lib/intelligence/e05/forecast/",
    rollbackAction: "Delete P4 forecast modules + verify-e05-p4 script",
    required: true,
  },
  {
    id: "EI-RS-P5",
    layer: "P5",
    snapshotPath: "lib/intelligence/e05/optimization/",
    rollbackAction: "Delete P5 optimization modules + verify-e05-p5 script",
    required: true,
  },
  {
    id: "EI-RS-P6",
    layer: "P6",
    snapshotPath: "lib/intelligence/e05/simulation/",
    rollbackAction: "Delete P6 simulation modules + verify-e05-p6 script",
    required: true,
  },
  {
    id: "EI-RS-P7",
    layer: "P7",
    snapshotPath: "lib/intelligence/e05/strategy/",
    rollbackAction: "Delete P7 strategy modules + verify-e05-p7 script",
    required: true,
  },
  {
    id: "EI-RS-P8",
    layer: "P8",
    snapshotPath: "lib/intelligence/e05/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify-e05-p8 script",
    required: true,
  },
  {
    id: "EI-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e05-p*.ts",
    rollbackAction: "Delete E05 verify scripts",
    required: true,
  },
  {
    id: "EI-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/intelligence/e05/",
    rollbackAction: "Remove E05 intelligence tree if rolling back program",
    required: true,
  },
  {
    id: "EI-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/business-agent/e04/",
    rollbackAction: "DO NOT MODIFY — frozen upstream E04 Business Agent Platform",
    required: true,
  },
  {
    id: "EI-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/intelligence/e05/{core,runtime,insight,analytics,kpi,forecast,optimization,simulation,strategy}/",
    rollbackAction: "DO NOT MODIFY — frozen E05 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
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
