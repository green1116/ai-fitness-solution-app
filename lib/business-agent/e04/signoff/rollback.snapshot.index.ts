/**
 * E04-P8 — Rollback snapshot index (declarative catalog)
 */

import type { RollbackSnapshot, RollbackSnapshotEntry } from "./signoff.types";
import { E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION } from "./signoff.types";

export const ROLLBACK_SNAPSHOT_INDEX: RollbackSnapshotEntry[] = [
  {
    id: "BA-RS-P1",
    layer: "P1",
    snapshotPath: "lib/business-agent/e04/core+capability+runtime/",
    rollbackAction: "Delete P1 foundation modules + verify-e04-p1 script",
    required: true,
  },
  {
    id: "BA-RS-P2",
    layer: "P2",
    snapshotPath: "lib/business-agent/e04/workflow/",
    rollbackAction: "Delete P2 workflow modules + verify-e04-p2 script",
    required: true,
  },
  {
    id: "BA-RS-P3",
    layer: "P3",
    snapshotPath: "lib/business-agent/e04/process/",
    rollbackAction: "Delete P3 process modules + verify-e04-p3 script",
    required: true,
  },
  {
    id: "BA-RS-P4",
    layer: "P4",
    snapshotPath: "lib/business-agent/e04/decision/",
    rollbackAction: "Delete P4 decision modules + verify-e04-p4 script",
    required: true,
  },
  {
    id: "BA-RS-P5",
    layer: "P5",
    snapshotPath: "lib/business-agent/e04/memory/",
    rollbackAction: "Delete P5 memory modules + verify-e04-p5 script",
    required: true,
  },
  {
    id: "BA-RS-P6",
    layer: "P6",
    snapshotPath: "lib/business-agent/e04/knowledge/",
    rollbackAction: "Delete P6 knowledge modules + verify-e04-p6 script",
    required: true,
  },
  {
    id: "BA-RS-P7",
    layer: "P7",
    snapshotPath: "lib/business-agent/e04/collaboration/",
    rollbackAction: "Delete P7 collaboration modules + verify-e04-p7 script",
    required: true,
  },
  {
    id: "BA-RS-P8",
    layer: "P8",
    snapshotPath: "lib/business-agent/e04/signoff/",
    rollbackAction: "Delete P8 signoff modules + verify-e04-p8 script",
    required: true,
  },
  {
    id: "BA-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e04-p*.ts",
    rollbackAction: "Delete E04 verify scripts",
    required: true,
  },
  {
    id: "BA-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/business-agent/e04/",
    rollbackAction: "Remove E04 business-agent tree if rolling back program",
    required: true,
  },
  {
    id: "BA-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/agent-platform/e03/",
    rollbackAction: "DO NOT MODIFY — frozen upstream E03 Agent Platform",
    required: true,
  },
  {
    id: "BA-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/business-agent/e04/{core,capability,runtime,workflow,process,decision,memory,knowledge,collaboration}/",
    rollbackAction: "DO NOT MODIFY — frozen E04 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
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
