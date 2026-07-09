/**
 * V72 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V72_INTELLIGENCE_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "INT-RS-P1",
    layer: "P1",
    snapshotPath: "lib/intelligence/v72/intelligence.types.ts",
    rollbackAction: "Delete P1 intelligence catalog modules + verify:v72-p1 script",
    required: true,
  },
  {
    id: "INT-RS-P2",
    layer: "P2",
    snapshotPath: "lib/intelligence/v72/signal.dependency.ts",
    rollbackAction: "Delete P2 signal dependency modules + verify:v72-p2 script",
    required: true,
  },
  {
    id: "INT-RS-P3",
    layer: "P3",
    snapshotPath: "lib/intelligence/v72/intelligence.policy.ts",
    rollbackAction: "Delete P3 intelligence policy modules + verify:v72-p3 script",
    required: true,
  },
  {
    id: "INT-RS-P4",
    layer: "P4",
    snapshotPath: "lib/intelligence/v72/intelligence.compatibility.ts",
    rollbackAction: "Delete P4 intelligence compatibility modules + verify:v72-p4 script",
    required: true,
  },
  {
    id: "INT-RS-P5",
    layer: "P5",
    snapshotPath: "lib/intelligence/v72/intelligence.governance.ts",
    rollbackAction: "Delete P5 intelligence governance modules + verify:v72-p5 script",
    required: true,
  },
  {
    id: "INT-RS-P6",
    layer: "P6",
    snapshotPath: "lib/intelligence/v72/lifecycle.management.ts",
    rollbackAction: "Delete P6 intelligence lifecycle modules + verify:v72-p6 script",
    required: true,
  },
  {
    id: "INT-RS-P7",
    layer: "P7",
    snapshotPath: "lib/intelligence/v72/intelligence.compliance.ts",
    rollbackAction: "Delete P7 intelligence compliance modules + verify:v72-p7 script",
    required: true,
  },
  {
    id: "INT-RS-P8",
    layer: "P8",
    snapshotPath: "lib/intelligence/v72/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v72-p8 script",
    required: true,
  },
  {
    id: "INT-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v72-* scripts from package.json",
    required: true,
  },
  {
    id: "INT-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V72-P8-INTELLIGENCE-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V72 intelligence signoff docs",
    required: true,
  },
  {
    id: "INT-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/orchestration/v71/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V71)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V72_INTELLIGENCE_FREEZE_VERSION,
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
