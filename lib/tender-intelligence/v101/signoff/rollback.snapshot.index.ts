/**
 * E01-P8 — Rollback snapshot index (declarative catalog)
 */

import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V101_TENDER_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "TI-RS-P1",
    layer: "P1",
    snapshotPath: "lib/tender-intelligence/v101/intake/",
    rollbackAction: "Delete P1 intake modules + verify-v101-p1 script",
    required: true,
  },
  {
    id: "TI-RS-P2",
    layer: "P2",
    snapshotPath: "lib/tender-intelligence/v101/understanding/",
    rollbackAction: "Delete P2 understanding modules + verify-v101-p2 script",
    required: true,
  },
  {
    id: "TI-RS-P3",
    layer: "P3",
    snapshotPath: "lib/tender-intelligence/v101/intelligence/",
    rollbackAction: "Delete P3 intelligence modules + verify-v101-p3 script",
    required: true,
  },
  {
    id: "TI-RS-P4",
    layer: "P4",
    snapshotPath: "lib/tender-intelligence/v101/strategy/",
    rollbackAction: "Delete P4 strategy modules + verify-v101-p4 script",
    required: true,
  },
  {
    id: "TI-RS-P5",
    layer: "P5",
    snapshotPath: "lib/tender-intelligence/v101/proposal/",
    rollbackAction: "Delete P5 proposal modules + verify-v101-p5 script",
    required: true,
  },
  {
    id: "TI-RS-P6",
    layer: "P6",
    snapshotPath: "lib/tender-intelligence/v101/agent/",
    rollbackAction: "Delete P6 agent modules + verify-v101-p6 script",
    required: true,
  },
  {
    id: "TI-RS-P7",
    layer: "P7",
    snapshotPath: "lib/tender-intelligence/v101/delivery/",
    rollbackAction: "Delete P7 delivery modules + verify-v101-p7 script",
    required: true,
  },
  {
    id: "TI-RS-P8",
    layer: "P8",
    snapshotPath: "lib/tender-intelligence/v101/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify-v101-p8 script",
    required: true,
  },
  {
    id: "TI-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v101-p*.ts",
    rollbackAction: "Delete V101 E01 verify scripts",
    required: true,
  },
  {
    id: "TI-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/tender-intelligence/v101/",
    rollbackAction: "Remove E01 tender-intelligence v101 tree if rolling back program",
    required: true,
  },
  {
    id: "TI-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/pilot/v100/",
    rollbackAction: "DO NOT MODIFY — frozen upstream V100 Pilot",
    required: true,
  },
  {
    id: "TI-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/tender-intelligence/v101/{intake,understanding,intelligence,strategy,proposal,agent,delivery}/",
    rollbackAction: "DO NOT MODIFY — frozen E01 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V101_TENDER_FREEZE_VERSION,
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
