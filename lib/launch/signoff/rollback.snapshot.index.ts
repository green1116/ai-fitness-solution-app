/**
 * Launch P8 — Rollback snapshot index (declarative catalog)
 */

import { LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION } from "./governance.freeze.lock";

export type LaunchP8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type LaunchP8RollbackSnapshot = {
  version: typeof LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: LaunchP8RollbackSnapshotEntry[];
  summary: string;
};

export const ROLLBACK_SNAPSHOT_INDEX: LaunchP8RollbackSnapshotEntry[] = [
  {
    id: "LN-RS-P1",
    layer: "P1",
    snapshotPath: "lib/launch/",
    rollbackAction:
      "Delete P1 production foundation + verify-launch-p1-production-deployment-foundation.ts",
    required: true,
  },
  {
    id: "LN-RS-P2",
    layer: "P2",
    snapshotPath: "lib/launch/onboarding/",
    rollbackAction:
      "Delete P2 onboarding + verify-launch-p2-customer-onboarding.ts",
    required: true,
  },
  {
    id: "LN-RS-P3",
    layer: "P3",
    snapshotPath: "lib/launch/demo/",
    rollbackAction:
      "Delete P3 demo + verify-launch-p3-demo-environment.ts",
    required: true,
  },
  {
    id: "LN-RS-P4",
    layer: "P4",
    snapshotPath: "lib/launch/security/",
    rollbackAction:
      "Delete P4 security + verify-launch-p4-security-readiness.ts",
    required: true,
  },
  {
    id: "LN-RS-P5",
    layer: "P5",
    snapshotPath: "lib/launch/support/",
    rollbackAction:
      "Delete P5 SLA support + verify-launch-p5-sla-support.ts",
    required: true,
  },
  {
    id: "LN-RS-P6",
    layer: "P6",
    snapshotPath: "lib/launch/documentation/",
    rollbackAction:
      "Delete P6 documentation + verify-launch-p6-documentation.ts",
    required: true,
  },
  {
    id: "LN-RS-P7",
    layer: "P7",
    snapshotPath: "lib/launch/control/",
    rollbackAction:
      "Delete P7 control plane + verify-launch-p7-control-plane.ts",
    required: true,
  },
  {
    id: "LN-RS-P8",
    layer: "P8",
    snapshotPath: "lib/launch/signoff/",
    rollbackAction:
      "Delete P8 signoff + verify-launch-p8-final-release-freeze.ts",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): LaunchP8RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX.map((e) => ({ ...e }));
  const required = entries.filter((e) => e.required);
  const indexComplete =
    required.length === 8 &&
    required.every((e) => e.snapshotPath.length > 0 && e.id.length > 0);

  return {
    version: LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `launch-p8-rollback entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}

export function getRollbackSnapshotByLayer(
  layer: string,
): LaunchP8RollbackSnapshotEntry | undefined {
  const entry = ROLLBACK_SNAPSHOT_INDEX.find((e) => e.layer === layer);
  return entry ? { ...entry } : undefined;
}
