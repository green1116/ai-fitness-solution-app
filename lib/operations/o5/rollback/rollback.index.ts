/**
 * Operations O5 — Rollback snapshot index
 */

import { OPERATIONS_O5_FREEZE_VERSION } from "../freeze/freeze.lock";
import {
  OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES,
  type OperationsO5RollbackSnapshotEntry,
} from "./rollback.snapshot";

export type OperationsO5RollbackSnapshot = {
  version: typeof OPERATIONS_O5_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: OperationsO5RollbackSnapshotEntry[];
  summary: string;
  readOnly: true;
};

export function buildOperationsRollbackSnapshotIndex(): OperationsO5RollbackSnapshot {
  const entries = OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES.map((e) => ({
    ...e,
  }));
  const required = entries.filter((e) => e.required);
  const indexComplete =
    required.length === 5 &&
    required.every((e) => e.snapshotPath.length > 0 && e.id.length > 0);

  return {
    version: OPERATIONS_O5_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: `ops-rollback entries=${entries.length} complete=${indexComplete}`,
    readOnly: true,
  };
}

export {
  OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES,
  getOperationsRollbackSnapshotByLayer,
} from "./rollback.snapshot";
