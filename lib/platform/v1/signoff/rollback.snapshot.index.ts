/**
 * Platform v1 — Rollback snapshot index (declarative catalog)
 * Governance freeze only — no feature changes
 */

import { PLATFORM_V1_GOVERNANCE_FREEZE_VERSION } from "./governance.freeze.lock";

export type PlatformV1P8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type PlatformV1P8RollbackSnapshot = {
  version: typeof PLATFORM_V1_GOVERNANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: PlatformV1P8RollbackSnapshotEntry[];
  summary: string;
};

export const ROLLBACK_SNAPSHOT_INDEX: PlatformV1P8RollbackSnapshotEntry[] = [
  {
    id: "PV1-RS-E09",
    layer: "E09",
    snapshotPath: "lib/global-network/e09/",
    rollbackAction:
      "Delete E09 network modules + verify-e09-p8-governance-freeze.ts",
    required: true,
  },
  {
    id: "PV1-RS-E10",
    layer: "E10",
    snapshotPath: "lib/platform/e10/",
    rollbackAction:
      "Delete E10 platform modules + verify-e10-p8-governance-freeze.ts",
    required: true,
  },
  {
    id: "PV1-RS-E11",
    layer: "E11",
    snapshotPath: "lib/cloud-runtime/e11/",
    rollbackAction:
      "Delete E11 cloud runtime modules + verify-e11-p8-cloud-runtime-governance-freeze.ts",
    required: true,
  },
  {
    id: "PV1-RS-ALIGN",
    layer: "alignment",
    snapshotPath: "lib/platform/v1/",
    rollbackAction:
      "Delete Platform v1 alignment + verify-platform-v1-alignment.ts",
    required: true,
  },
  {
    id: "PV1-RS-P8",
    layer: "P8",
    snapshotPath: "lib/platform/v1/signoff/governance.*.ts",
    rollbackAction:
      "Delete Platform v1 governance freeze + verify-platform-v1-governance-freeze.ts",
    required: true,
  },
  {
    id: "PV1-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-platform-v1*.ts",
    rollbackAction: "Delete Platform v1 verify scripts",
    required: true,
  },
  {
    id: "PV1-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/platform/v1/",
    rollbackAction: "Remove Platform v1 tree if rolling back program",
    required: true,
  },
  {
    id: "PV1-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/cloud-runtime/e11/signoff/",
    rollbackAction:
      "DO NOT MODIFY — frozen upstream E11 cloud runtime governance",
    required: true,
  },
  {
    id: "PV1-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/{global-network/e09,platform/e10,cloud-runtime/e11}/",
    rollbackAction: "DO NOT MODIFY — frozen E09/E10/E11 complete baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): PlatformV1P8RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 9;

  return {
    version: PLATFORM_V1_GOVERNANCE_FREEZE_VERSION,
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
): PlatformV1P8RollbackSnapshotEntry[] {
  return ROLLBACK_SNAPSHOT_INDEX.filter((e) => e.layer === layer);
}
