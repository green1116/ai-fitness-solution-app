/**
 * Post-Launch P8 — Rollback snapshot index (declarative catalog)
 */

import { OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION } from "./governance.freeze.lock";

export type OperationsP8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type OperationsP8RollbackSnapshot = {
  version: typeof OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: OperationsP8RollbackSnapshotEntry[];
  summary: string;
};

export const OPERATIONS_ROLLBACK_SNAPSHOT_INDEX: OperationsP8RollbackSnapshotEntry[] =
  [
    {
      id: "OPS-RS-P1",
      layer: "P1",
      snapshotPath: "lib/operations/production/",
      rollbackAction:
        "Delete P1 production + verify-post-launch-p1-production-operations-foundation.ts",
      required: true,
    },
    {
      id: "OPS-RS-P2",
      layer: "P2",
      snapshotPath: "lib/operations/customer-success/",
      rollbackAction:
        "Delete P2 customer success + verify-post-launch-p2-customer-success-operations.ts",
      required: true,
    },
    {
      id: "OPS-RS-P3",
      layer: "P3",
      snapshotPath: "lib/operations/incident/",
      rollbackAction:
        "Delete P3 incident + verify-post-launch-p3-incident-response-operations.ts",
      required: true,
    },
    {
      id: "OPS-RS-P4",
      layer: "P4",
      snapshotPath: "lib/operations/release/",
      rollbackAction:
        "Delete P4 release + verify-post-launch-p4-release-management-operations.ts",
      required: true,
    },
    {
      id: "OPS-RS-P5",
      layer: "P5",
      snapshotPath: "lib/operations/growth/",
      rollbackAction:
        "Delete P5 growth + verify-post-launch-p5-growth-analytics-operations.ts",
      required: true,
    },
    {
      id: "OPS-RS-P6",
      layer: "P6",
      snapshotPath: "lib/operations/support/",
      rollbackAction:
        "Delete P6 support + verify-post-launch-p6-enterprise-support-operations.ts",
      required: true,
    },
    {
      id: "OPS-RS-P7",
      layer: "P7",
      snapshotPath: "lib/operations/control/",
      rollbackAction:
        "Delete P7 control + verify-post-launch-p7-operations-control-plane.ts",
      required: true,
    },
    {
      id: "OPS-RS-P8",
      layer: "P8",
      snapshotPath: "lib/operations/signoff/",
      rollbackAction:
        "Delete P8 signoff + verify-post-launch-p8-operations-governance-freeze.ts",
      required: true,
    },
  ];

export function buildOperationsRollbackSnapshotIndex(): OperationsP8RollbackSnapshot {
  const entries = OPERATIONS_ROLLBACK_SNAPSHOT_INDEX.map((e) => ({ ...e }));
  const required = entries.filter((e) => e.required);
  const indexComplete =
    required.length === 8 &&
    required.every((e) => e.snapshotPath.length > 0 && e.id.length > 0);

  return {
    version: OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: `ops-rollback entries=${entries.length} complete=${indexComplete}`,
  };
}

export function getOperationsRollbackSnapshotByLayer(
  layer: string,
): OperationsP8RollbackSnapshotEntry | undefined {
  const entry = OPERATIONS_ROLLBACK_SNAPSHOT_INDEX.find(
    (e) => e.layer === layer.trim().toUpperCase(),
  );
  return entry ? { ...entry } : undefined;
}
