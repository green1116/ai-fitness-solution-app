/**
 * Commercialization P8 — Rollback snapshot entries (declarative)
 */

export type CommercializationP8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export const COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES: CommercializationP8RollbackSnapshotEntry[] =
  [
    {
      id: "COM-RS-P1",
      layer: "P1",
      snapshotPath: "lib/commercialization/p1/",
      rollbackAction:
        "Delete P1 sales + verify-commercialization-p1.ts",
      required: true,
    },
    {
      id: "COM-RS-P2",
      layer: "P2",
      snapshotPath: "lib/commercialization/p2/",
      rollbackAction:
        "Delete P2 packaging + verify-commercialization-p2.ts",
      required: true,
    },
    {
      id: "COM-RS-P3",
      layer: "P3",
      snapshotPath: "lib/commercialization/p3/",
      rollbackAction:
        "Delete P3 pricing + verify-commercialization-p3.ts",
      required: true,
    },
    {
      id: "COM-RS-P4",
      layer: "P4",
      snapshotPath: "lib/commercialization/p4/",
      rollbackAction:
        "Delete P4 onboarding + verify-commercialization-p4.ts",
      required: true,
    },
    {
      id: "COM-RS-P5",
      layer: "P5",
      snapshotPath: "lib/commercialization/p5/",
      rollbackAction:
        "Delete P5 delivery + verify-commercialization-p5.ts",
      required: true,
    },
    {
      id: "COM-RS-P6",
      layer: "P6",
      snapshotPath: "lib/commercialization/p6/",
      rollbackAction:
        "Delete P6 revenue + verify-commercialization-p6.ts",
      required: true,
    },
    {
      id: "COM-RS-P7",
      layer: "P7",
      snapshotPath: "lib/commercialization/p7/",
      rollbackAction:
        "Delete P7 governance + verify-commercialization-p7.ts",
      required: true,
    },
    {
      id: "COM-RS-P8",
      layer: "P8",
      snapshotPath: "lib/commercialization/p8/",
      rollbackAction:
        "Delete P8 freeze + verify-commercialization-p8.ts",
      required: true,
    },
  ];

export function getCommercializationRollbackSnapshotByLayer(
  layer: string,
): CommercializationP8RollbackSnapshotEntry | undefined {
  const entry = COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES.find(
    (e) => e.layer === layer.trim().toUpperCase(),
  );
  return entry ? { ...entry } : undefined;
}
