/**
 * Commercialization P8 — Rollback snapshot index
 */

import { COMMERCIALIZATION_P8_FREEZE_VERSION } from "../freeze/freeze.lock";
import {
  COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES,
  type CommercializationP8RollbackSnapshotEntry,
} from "./rollback.snapshot";

export type CommercializationP8RollbackSnapshot = {
  version: typeof COMMERCIALIZATION_P8_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: CommercializationP8RollbackSnapshotEntry[];
  summary: string;
  readOnly: true;
};

export function buildCommercializationRollbackSnapshotIndex(): CommercializationP8RollbackSnapshot {
  const entries = COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES.map((e) => ({
    ...e,
  }));
  const required = entries.filter((e) => e.required);
  const indexComplete =
    required.length === 8 &&
    required.every((e) => e.snapshotPath.length > 0 && e.id.length > 0);

  return {
    version: COMMERCIALIZATION_P8_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: `com-rollback entries=${entries.length} complete=${indexComplete}`,
    readOnly: true,
  };
}

export {
  COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES,
  getCommercializationRollbackSnapshotByLayer,
} from "./rollback.snapshot";

