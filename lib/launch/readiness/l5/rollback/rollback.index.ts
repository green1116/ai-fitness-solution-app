/**
 * Launch L5 — Rollback snapshot index
 */

import { LAUNCH_L5_FREEZE_VERSION } from "../freeze/freeze.lock";
import {
  LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES,
  type LaunchL5RollbackSnapshotEntry,
} from "./rollback.snapshot";

export type LaunchL5RollbackSnapshot = {
  version: typeof LAUNCH_L5_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: LaunchL5RollbackSnapshotEntry[];
  summary: string;
  readOnly: true;
};

export function buildLaunchReadinessRollbackSnapshotIndex(): LaunchL5RollbackSnapshot {
  const entries = LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES.map((e) => ({
    ...e,
  }));
  const required = entries.filter((e) => e.required);
  const indexComplete =
    required.length === 5 &&
    required.every((e) => e.snapshotPath.length > 0 && e.id.length > 0);

  return {
    version: LAUNCH_L5_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: `launch-readiness-rollback entries=${entries.length} complete=${indexComplete}`,
    readOnly: true,
  };
}

export {
  LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES,
  getLaunchReadinessRollbackSnapshotByLayer,
} from "./rollback.snapshot";
