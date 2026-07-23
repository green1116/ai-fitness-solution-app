/**
 * Launch L5 — Rollback snapshot entries (declarative)
 */

export type LaunchL5RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export const LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES: LaunchL5RollbackSnapshotEntry[] =
  [
    {
      id: "LR-RS-L1",
      layer: "L1",
      snapshotPath: "lib/launch/readiness/l1/",
      rollbackAction: "Delete L1 demo + verify-launch-l1.ts",
      required: true,
    },
    {
      id: "LR-RS-L2",
      layer: "L2",
      snapshotPath: "lib/launch/readiness/l2/",
      rollbackAction: "Delete L2 pilot + verify-launch-l2.ts",
      required: true,
    },
    {
      id: "LR-RS-L3",
      layer: "L3",
      snapshotPath: "lib/launch/readiness/l3/",
      rollbackAction: "Delete L3 hardening + verify-launch-l3.ts",
      required: true,
    },
    {
      id: "LR-RS-L4",
      layer: "L4",
      snapshotPath: "lib/launch/readiness/l4/",
      rollbackAction: "Delete L4 validation + verify-launch-l4.ts",
      required: true,
    },
    {
      id: "LR-RS-L5",
      layer: "L5",
      snapshotPath: "lib/launch/readiness/l5/",
      rollbackAction: "Delete L5 freeze + verify-launch-l5.ts",
      required: true,
    },
  ];

export function getLaunchReadinessRollbackSnapshotByLayer(
  layer: string,
): LaunchL5RollbackSnapshotEntry | undefined {
  const entry = LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES.find(
    (e) => e.layer === layer.trim().toUpperCase(),
  );
  return entry ? { ...entry } : undefined;
}
