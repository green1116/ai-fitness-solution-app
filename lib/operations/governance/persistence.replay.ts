import type {
  GovernanceCheckpoint,
  GovernanceReplayResult,
  GovernanceSnapshot,
  GovernancePersistenceRuntimeInput,
} from "./persistence.types";

export function replayGovernancePersistence(input: {
  runtime: GovernancePersistenceRuntimeInput;
  snapshot: GovernanceSnapshot;
  checkpoint: GovernanceCheckpoint;
}): GovernanceReplayResult {
  const events = input.runtime.lifecycle.timeline;
  return {
    replayId: `preplay-${input.snapshot.snapshotId}`,
    replayable: events.length > 0,
    source: "snapshot",
    events,
    reason:
      events.length > 0
        ? `replayable-via-snapshot=${input.snapshot.snapshotId} checkpoint=${input.checkpoint.checkpointId}`
        : "no-events-for-replay",
  };
}
