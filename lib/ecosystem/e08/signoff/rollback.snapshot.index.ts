/**
 * E08-P8 — Rollback snapshot index (declarative catalog)
 */

import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "EE-RS-P1",
    layer: "P1",
    snapshotPath: "lib/ecosystem/e08/core+runtime+relationship/",
    rollbackAction: "Delete P1 foundation modules + verify-e08-p1 script",
    required: true,
  },
  {
    id: "EE-RS-P2",
    layer: "P2",
    snapshotPath: "lib/ecosystem/e08/network/",
    rollbackAction: "Delete P2 network modules + verify-e08-p2 script",
    required: true,
  },
  {
    id: "EE-RS-P3",
    layer: "P3",
    snapshotPath: "lib/ecosystem/e08/exchange/",
    rollbackAction: "Delete P3 exchange modules + verify-e08-p3 script",
    required: true,
  },
  {
    id: "EE-RS-P4",
    layer: "P4",
    snapshotPath: "lib/ecosystem/e08/workflow/",
    rollbackAction: "Delete P4 workflow modules + verify-e08-p4 script",
    required: true,
  },
  {
    id: "EE-RS-P5",
    layer: "P5",
    snapshotPath: "lib/ecosystem/e08/intelligence/",
    rollbackAction: "Delete P5 intelligence modules + verify-e08-p5 script",
    required: true,
  },
  {
    id: "EE-RS-P6",
    layer: "P6",
    snapshotPath: "lib/ecosystem/e08/market/",
    rollbackAction: "Delete P6 market modules + verify-e08-p6 script",
    required: true,
  },
  {
    id: "EE-RS-P7",
    layer: "P7",
    snapshotPath: "lib/ecosystem/e08/network-os/",
    rollbackAction: "Delete P7 network-os modules + verify-e08-p7 script",
    required: true,
  },
  {
    id: "EE-RS-P8",
    layer: "P8",
    snapshotPath: "lib/ecosystem/e08/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify-e08-p8 script",
    required: true,
  },
  {
    id: "EE-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e08-p*.ts",
    rollbackAction: "Delete E08 verify scripts",
    required: true,
  },
  {
    id: "EE-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/ecosystem/e08/",
    rollbackAction: "Remove E08 ecosystem tree if rolling back program",
    required: true,
  },
  {
    id: "EE-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/workforce/e07/",
    rollbackAction:
      "DO NOT MODIFY — frozen upstream E07 Digital Workforce Platform",
    required: true,
  },
  {
    id: "EE-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/ecosystem/e08/{core,runtime,relationship,network,exchange,workflow,intelligence,market,network-os}/",
    rollbackAction: "DO NOT MODIFY — frozen E08 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
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
