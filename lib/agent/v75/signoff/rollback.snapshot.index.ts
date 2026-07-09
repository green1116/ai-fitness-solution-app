/**
 * V75 P8 — Rollback snapshot index (declarative catalog)
 */
import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { V75_AGENT_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "AGT-RS-P1",
    layer: "P1",
    snapshotPath: "lib/agent/v75/agent.types.ts",
    rollbackAction: "Delete P1 agent inventory modules + verify:v75-p1 script",
    required: true,
  },
  {
    id: "AGT-RS-P2",
    layer: "P2",
    snapshotPath: "lib/agent/v75/agent.policy.ts",
    rollbackAction: "Delete P2 agent policy modules + verify:v75-p2 script",
    required: true,
  },
  {
    id: "AGT-RS-P3",
    layer: "P3",
    snapshotPath: "lib/agent/v75/agent.context.ts",
    rollbackAction: "Delete P3 agent context modules + verify:v75-p3 script",
    required: true,
  },
  {
    id: "AGT-RS-P4",
    layer: "P4",
    snapshotPath: "lib/agent/v75/agent.constraint.ts",
    rollbackAction: "Delete P4 agent constraint modules + verify:v75-p4 script",
    required: true,
  },
  {
    id: "AGT-RS-P5",
    layer: "P5",
    snapshotPath: "lib/agent/v75/agent.evaluation.ts",
    rollbackAction: "Delete P5 agent evaluation modules + verify:v75-p5 script",
    required: true,
  },
  {
    id: "AGT-RS-P6",
    layer: "P6",
    snapshotPath: "lib/agent/v75/agent.simulation.ts",
    rollbackAction: "Delete P6 agent simulation modules + verify:v75-p6 script",
    required: true,
  },
  {
    id: "AGT-RS-P7",
    layer: "P7",
    snapshotPath: "lib/agent/v75/agent.compliance.ts",
    rollbackAction: "Delete P7 agent compliance modules + verify:v75-p7 script",
    required: true,
  },
  {
    id: "AGT-RS-P8",
    layer: "P8",
    snapshotPath: "lib/agent/v75/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify:v75-p8 script",
    required: true,
  },
  {
    id: "AGT-RS-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v75-* scripts from package.json",
    required: true,
  },
  {
    id: "AGT-RS-DOCS",
    layer: "docs",
    snapshotPath: "docs/V75-AGENT-SIGNOFF-FREEZE.md",
    rollbackAction: "Delete V75 agent signoff docs",
    required: true,
  },
  {
    id: "AGT-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-v75-p*.ts",
    rollbackAction: "Delete V75 verify scripts",
    required: true,
  },
  {
    id: "AGT-RS-UP",
    layer: "upstream",
    snapshotPath: "lib/decision/v74/",
    rollbackAction: "DO NOT MODIFY — frozen upstream V74 decision (V48–V74)",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: V75_AGENT_FREEZE_VERSION,
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
