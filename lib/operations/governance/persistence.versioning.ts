import {
  GOVERNANCE_CHECKPOINT_VERSION,
  GOVERNANCE_PERSISTENCE_VERSION,
  GOVERNANCE_SNAPSHOT_VERSION,
} from "./persistence.types";

export function detectPersistenceVersionDrift(input: {
  runtimeVersion: string;
  snapshotVersion: string;
  checkpointVersion: string;
}): boolean {
  return (
    input.runtimeVersion !== GOVERNANCE_PERSISTENCE_VERSION ||
    input.snapshotVersion !== GOVERNANCE_SNAPSHOT_VERSION ||
    input.checkpointVersion !== GOVERNANCE_CHECKPOINT_VERSION
  );
}
