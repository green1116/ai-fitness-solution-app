/**
 * Operations O5 — Rollback snapshot entries (declarative)
 */

export type OperationsO5RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export const OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES: OperationsO5RollbackSnapshotEntry[] =
  [
    {
      id: "OPS-RS-O1",
      layer: "O1",
      snapshotPath: "lib/operations/o1/",
      rollbackAction:
        "Delete O1 customer success + verify-operations-o1.ts",
      required: true,
    },
    {
      id: "OPS-RS-O2",
      layer: "O2",
      snapshotPath: "lib/operations/o2/",
      rollbackAction:
        "Delete O2 usage intelligence + verify-operations-o2.ts",
      required: true,
    },
    {
      id: "OPS-RS-O3",
      layer: "O3",
      snapshotPath: "lib/operations/o3/",
      rollbackAction:
        "Delete O3 support operations + verify-operations-o3.ts",
      required: true,
    },
    {
      id: "OPS-RS-O4",
      layer: "O4",
      snapshotPath: "lib/operations/o4/",
      rollbackAction:
        "Delete O4 growth analytics + verify-operations-o4.ts",
      required: true,
    },
    {
      id: "OPS-RS-O5",
      layer: "O5",
      snapshotPath: "lib/operations/o5/",
      rollbackAction:
        "Delete O5 governance freeze + verify-operations-o5.ts",
      required: true,
    },
  ];

export function getOperationsRollbackSnapshotByLayer(
  layer: string,
): OperationsO5RollbackSnapshotEntry | undefined {
  const entry = OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES.find(
    (e) => e.layer === layer.trim().toUpperCase(),
  );
  return entry ? { ...entry } : undefined;
}
