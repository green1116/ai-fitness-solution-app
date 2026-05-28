import type { GovernancePersistenceRuntimeResult } from "./persistence.types";

export function summarizeGovernancePersistence(
  runtime: Omit<GovernancePersistenceRuntimeResult, "summary">,
): GovernancePersistenceRuntimeResult["summary"] {
  return {
    summaryId: `persist-sum-${runtime.snapshot.snapshotId.slice(0, 12)}`,
    text: [
      `status=${runtime.status}`,
      `snapshot=${runtime.snapshot.snapshotId}`,
      `snapshotVersion=${runtime.snapshot.snapshotVersion}`,
      `checkpoint=${runtime.checkpoint.checkpointId}`,
      `checkpointHash=${runtime.checkpoint.checkpointHash}`,
      `restored=${runtime.restore.restored}`,
      `replayable=${runtime.replay.replayable}`,
      `versionDrift=${runtime.metadata.versionDriftDetected}`,
    ].join(" "),
    traceId: `trace-persistence-${runtime.snapshot.snapshotId}`,
  };
}
