/**
 * E02-P8 — Rollback snapshot index (declarative catalog)
 */

import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V102_KNOWLEDGE_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "KG-RS-P1",
    layer: "P1",
    snapshotPath: "lib/tender-intelligence/v102/knowledge/",
    rollbackAction: "Delete P1 knowledge modules + verify-v102-p1 script",
    required: true,
  },
  {
    id: "KG-RS-P2",
    layer: "P2",
    snapshotPath: "lib/tender-intelligence/v102/extraction/",
    rollbackAction: "Delete P2 extraction modules + verify-v102-p2 script",
    required: true,
  },
  {
    id: "KG-RS-P3",
    layer: "P3",
    snapshotPath: "lib/tender-intelligence/v102/relationship/",
    rollbackAction: "Delete P3 relationship modules + verify-v102-p3 script",
    required: true,
  },
  {
    id: "KG-RS-P4",
    layer: "P4",
    snapshotPath: "lib/tender-intelligence/v102/retrieval/",
    rollbackAction: "Delete P4 retrieval modules + verify-v102-p4 script",
    required: true,
  },
  {
    id: "KG-RS-P5",
    layer: "P5",
    snapshotPath: "lib/tender-intelligence/v102/similarity/",
    rollbackAction: "Delete P5 similarity modules + verify-v102-p5 script",
    required: true,
  },
  {
    id: "KG-RS-P6",
    layer: "P6",
    snapshotPath: "lib/tender-intelligence/v102/memory-agent/",
    rollbackAction: "Delete P6 memory-agent modules + verify-v102-p6 script",
    required: true,
  },
  {
    id: "KG-RS-P7",
    layer: "P7",
    snapshotPath: "lib/tender-intelligence/v102/knowledge-delivery/",
    rollbackAction: "Delete P7 knowledge-delivery modules + verify-v102-p7 script",
    required: true,
  },
  {
    id: "KG-RS-P8",
    layer: "P8",
    snapshotPath: "lib/tender-intelligence/v102/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify-v102-p8 script",
    required: true,
  },
  {
    id: "KG-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v102-p*.ts",
    rollbackAction: "Delete V102 E02 verify scripts",
    required: true,
  },
  {
    id: "KG-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/tender-intelligence/v102/",
    rollbackAction: "Remove E02 tender-intelligence v102 tree if rolling back program",
    required: true,
  },
  {
    id: "KG-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/tender-intelligence/v101/",
    rollbackAction: "DO NOT MODIFY — frozen upstream E01 V101",
    required: true,
  },
  {
    id: "KG-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/tender-intelligence/v102/{knowledge,extraction,relationship,retrieval,similarity,memory-agent,knowledge-delivery}/",
    rollbackAction: "DO NOT MODIFY — frozen E02 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V102_KNOWLEDGE_FREEZE_VERSION,
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
