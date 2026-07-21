/**
 * E10-P8 — Rollback snapshot index (declarative catalog)
 * Freeze-only — no feature changes
 */

import { E10_P8_PLATFORM_FREEZE_VERSION } from "./governance.freeze.lock";

export type E10P8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type E10P8RollbackSnapshot = {
  version: typeof E10_P8_PLATFORM_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: E10P8RollbackSnapshotEntry[];
  summary: string;
};

export const ROLLBACK_SNAPSHOT_INDEX: E10P8RollbackSnapshotEntry[] = [
  {
    id: "E10-RS-P1",
    layer: "P1",
    snapshotPath: "lib/platform/e10/core/",
    rollbackAction:
      "Delete P1 foundation modules + verify-e10-p1-platform-foundation.ts",
    required: true,
  },
  {
    id: "E10-RS-P2",
    layer: "P2",
    snapshotPath: "lib/platform/e10/runtime/",
    rollbackAction:
      "Delete P2 runtime modules + verify-e10-p2-platform-runtime.ts",
    required: true,
  },
  {
    id: "E10-RS-P3",
    layer: "P3",
    snapshotPath: "lib/platform/e10/resource/",
    rollbackAction:
      "Delete P3 resource modules + verify-e10-p3-platform-resource.ts",
    required: true,
  },
  {
    id: "E10-RS-P4",
    layer: "P4",
    snapshotPath: "lib/platform/e10/event/",
    rollbackAction:
      "Delete P4 event modules + verify-e10-p4-platform-event.ts",
    required: true,
  },
  {
    id: "E10-RS-P5",
    layer: "P5",
    snapshotPath: "lib/platform/e10/gateway/",
    rollbackAction:
      "Delete P5 gateway modules + verify-e10-p5-platform-gateway.ts",
    required: true,
  },
  {
    id: "E10-RS-P6",
    layer: "P6",
    snapshotPath: "lib/platform/e10/marketplace/",
    rollbackAction:
      "Delete P6 marketplace modules + verify-e10-p6-platform-marketplace.ts",
    required: true,
  },
  {
    id: "E10-RS-P7",
    layer: "P7",
    snapshotPath: "lib/platform/e10/os/",
    rollbackAction:
      "Delete P7 OS modules + verify-e10-p7-platform-os.ts",
    required: true,
  },
  {
    id: "E10-RS-P8",
    layer: "P8",
    snapshotPath: "lib/platform/e10/signoff/governance.*.ts",
    rollbackAction:
      "Delete P8 governance freeze + verify-e10-p8-governance-freeze.ts",
    required: true,
  },
  {
    id: "E10-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e10-p*.ts",
    rollbackAction: "Delete E10 verify scripts",
    required: true,
  },
  {
    id: "E10-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/platform/e10/",
    rollbackAction: "Remove E10 platform tree if rolling back program",
    required: true,
  },
  {
    id: "E10-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/global-network/e09/",
    rollbackAction:
      "DO NOT MODIFY — frozen upstream E09 Global Autonomous Enterprise Network",
    required: true,
  },
  {
    id: "E10-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/platform/e10/{core,runtime,resource,event,gateway,marketplace,os}/",
    rollbackAction: "DO NOT MODIFY — frozen E10 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): E10P8RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E10_P8_PLATFORM_FREEZE_VERSION,
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
): E10P8RollbackSnapshotEntry[] {
  return ROLLBACK_SNAPSHOT_INDEX.filter((e) => e.layer === layer);
}
