/**
 * V70 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V70_DELIVERY_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "DRS-P1",
    layer: "P1",
    snapshotPath: "lib/delivery/v70/release.types.ts",
    rollbackAction: "Delete P1 release catalog modules + verify:v70-p1 script",
    required: true,
  },
  {
    id: "DRS-P2",
    layer: "P2",
    snapshotPath: "lib/delivery/v70/release.dependency.ts",
    rollbackAction: "Delete P2 release dependency modules + verify:v70-p2 script",
    required: true,
  },
  {
    id: "DRS-P3",
    layer: "P3",
    snapshotPath: "lib/delivery/v70/release.policy.ts",
    rollbackAction: "Delete P3 release policy modules + verify:v70-p3 script",
    required: true,
  },
  {
    id: "DRS-P4",
    layer: "P4",
    snapshotPath: "lib/delivery/v70/version.compatibility.ts",
    rollbackAction: "Delete P4 version compatibility modules + verify:v70-p4 script",
    required: true,
  },
  {
    id: "DRS-P5",
    layer: "P5",
    snapshotPath: "lib/delivery/v70/upgrade.governance.ts",
    rollbackAction: "Delete P5 upgrade governance modules + verify:v70-p5 script",
    required: true,
  },
  {
    id: "DRS-P6",
    layer: "P6",
    snapshotPath: "lib/delivery/v70/lifecycle.management.ts",
    rollbackAction: "Delete P6 lifecycle management modules + verify:v70-p6 script",
    required: true,
  },
  {
    id: "DRS-P7",
    layer: "P7",
    snapshotPath: "lib/delivery/v70/delivery.compliance.ts",
    rollbackAction: "Delete P7 delivery compliance modules + verify:v70-p7 script",
    required: true,
  },
  {
    id: "DRS-P8",
    layer: "P8",
    snapshotPath: "lib/delivery/v70/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v70-p8 script",
    required: true,
  },
  {
    id: "DRS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v70-* scripts from package.json",
    required: true,
  },
  {
    id: "DRS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V70-P8-DELIVERY-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V70 delivery signoff docs",
    required: true,
  },
  {
    id: "DRS-UP",
    layer: "upstream",
    snapshotPath: "lib/technical-governance/v69/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V69)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 10;

  return {
    version: V70_DELIVERY_FREEZE_VERSION,
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
