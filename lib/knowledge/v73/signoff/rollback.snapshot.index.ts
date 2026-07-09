/**
 * V73 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V73_KNOWLEDGE_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "KNW-RS-P1",
    layer: "P1",
    snapshotPath: "lib/knowledge/v73/knowledge.types.ts",
    rollbackAction: "Delete P1 knowledge catalog modules + verify:v73-p1 script",
    required: true,
  },
  {
    id: "KNW-RS-P2",
    layer: "P2",
    snapshotPath: "lib/knowledge/v73/knowledge.dependency.ts",
    rollbackAction: "Delete P2 knowledge dependency modules + verify:v73-p2 script",
    required: true,
  },
  {
    id: "KNW-RS-P3",
    layer: "P3",
    snapshotPath: "lib/knowledge/v73/knowledge.policy.ts",
    rollbackAction: "Delete P3 knowledge policy modules + verify:v73-p3 script",
    required: true,
  },
  {
    id: "KNW-RS-P4",
    layer: "P4",
    snapshotPath: "lib/knowledge/v73/knowledge.compatibility.ts",
    rollbackAction: "Delete P4 knowledge compatibility modules + verify:v73-p4 script",
    required: true,
  },
  {
    id: "KNW-RS-P5",
    layer: "P5",
    snapshotPath: "lib/knowledge/v73/knowledge.governance.ts",
    rollbackAction: "Delete P5 knowledge governance modules + verify:v73-p5 script",
    required: true,
  },
  {
    id: "KNW-RS-P6",
    layer: "P6",
    snapshotPath: "lib/knowledge/v73/lifecycle.management.ts",
    rollbackAction: "Delete P6 knowledge lifecycle modules + verify:v73-p6 script",
    required: true,
  },
  {
    id: "KNW-RS-P7",
    layer: "P7",
    snapshotPath: "lib/knowledge/v73/knowledge.compliance.ts",
    rollbackAction: "Delete P7 knowledge compliance modules + verify:v73-p7 script",
    required: true,
  },
  {
    id: "KNW-RS-P8",
    layer: "P8",
    snapshotPath: "lib/knowledge/v73/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v73-p8 script",
    required: true,
  },
  {
    id: "KNW-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v73-* scripts from package.json",
    required: true,
  },
  {
    id: "KNW-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V73-P8-KNOWLEDGE-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V73 knowledge signoff docs",
    required: true,
  },
  {
    id: "KNW-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/intelligence/v72/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V72)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V73_KNOWLEDGE_FREEZE_VERSION,
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
