/**
 * E11-P8 — Rollback snapshot index (declarative catalog)
 * Freeze-only — no feature changes
 */

import { E11_P8_CLOUD_RUNTIME_FREEZE_VERSION } from "./governance.freeze.lock";

export type E11P8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type E11P8RollbackSnapshot = {
  version: typeof E11_P8_CLOUD_RUNTIME_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: E11P8RollbackSnapshotEntry[];
  summary: string;
};

export const ROLLBACK_SNAPSHOT_INDEX: E11P8RollbackSnapshotEntry[] = [
  {
    id: "E11-RS-P1",
    layer: "P1",
    snapshotPath: "lib/cloud-runtime/e11/core/",
    rollbackAction:
      "Delete P1 foundation modules + verify-e11-p1-cloud-runtime-foundation.ts",
    required: true,
  },
  {
    id: "E11-RS-P2",
    layer: "P2",
    snapshotPath: "lib/cloud-runtime/e11/execution/",
    rollbackAction:
      "Delete P2 execution modules + verify-e11-p2-cloud-runtime-execution.ts",
    required: true,
  },
  {
    id: "E11-RS-P3",
    layer: "P3",
    snapshotPath: "lib/cloud-runtime/e11/tenant/",
    rollbackAction:
      "Delete P3 tenant modules + verify-e11-p3-cloud-runtime-tenant.ts",
    required: true,
  },
  {
    id: "E11-RS-P4",
    layer: "P4",
    snapshotPath: "lib/cloud-runtime/e11/governance/",
    rollbackAction:
      "Delete P4 governance modules + verify-e11-p4-cloud-runtime-governance.ts",
    required: true,
  },
  {
    id: "E11-RS-P5",
    layer: "P5",
    snapshotPath: "lib/cloud-runtime/e11/observability/",
    rollbackAction:
      "Delete P5 observability modules + verify-e11-p5-cloud-runtime-observability.ts",
    required: true,
  },
  {
    id: "E11-RS-P6",
    layer: "P6",
    snapshotPath: "lib/cloud-runtime/e11/autonomous/",
    rollbackAction:
      "Delete P6 autonomous modules + verify-e11-p6-cloud-runtime-autonomous.ts",
    required: true,
  },
  {
    id: "E11-RS-P7",
    layer: "P7",
    snapshotPath: "lib/cloud-runtime/e11/control-plane/",
    rollbackAction:
      "Delete P7 control plane modules + verify-e11-p7-cloud-runtime-control-plane.ts",
    required: true,
  },
  {
    id: "E11-RS-P8",
    layer: "P8",
    snapshotPath: "lib/cloud-runtime/e11/signoff/governance.*.ts",
    rollbackAction:
      "Delete P8 governance freeze + verify-e11-p8-cloud-runtime-governance-freeze.ts",
    required: true,
  },
  {
    id: "E11-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e11-p*.ts",
    rollbackAction: "Delete E11 verify scripts",
    required: true,
  },
  {
    id: "E11-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/cloud-runtime/e11/",
    rollbackAction: "Remove E11 cloud runtime tree if rolling back program",
    required: true,
  },
  {
    id: "E11-RS-BOUNDARY",
    layer: "boundary",
    snapshotPath: "lib/platform/e10/",
    rollbackAction:
      "DO NOT MODIFY — frozen upstream E10 Autonomous Platform",
    required: true,
  },
  {
    id: "E11-RS-UP",
    layer: "upstream",
    snapshotPath:
      "lib/cloud-runtime/e11/{core,execution,tenant,governance,observability,autonomous,control-plane}/",
    rollbackAction: "DO NOT MODIFY — frozen E11 P1–P7 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): E11P8RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
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
): E11P8RollbackSnapshotEntry[] {
  return ROLLBACK_SNAPSHOT_INDEX.filter((e) => e.layer === layer);
}
