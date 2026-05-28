import {
  GOVERNANCE_CHECKPOINT_VERSION,
  GOVERNANCE_PERSISTENCE_VERSION,
  GOVERNANCE_SNAPSHOT_VERSION,
  type GovernancePersistenceRuntimeInput,
  type GovernancePersistenceRuntimeResult,
} from "./persistence.types";
import { buildGovernancePersistenceSnapshot } from "./persistence.snapshot";
import { buildGovernanceCheckpoint } from "./persistence.checkpoint";
import { restoreGovernanceFromCheckpoint } from "./persistence.restore";
import { replayGovernancePersistence } from "./persistence.replay";
import { summarizeGovernancePersistence } from "./persistence.summary";
import { detectPersistenceVersionDrift } from "./persistence.versioning";

export function buildGovernancePersistence(
  input: GovernancePersistenceRuntimeInput,
): GovernancePersistenceRuntimeResult {
  const snapshot = buildGovernancePersistenceSnapshot(input);
  const checkpoint = buildGovernanceCheckpoint({
    snapshot,
    reason: "runtime-governance-checkpoint",
  });
  const restore = restoreGovernanceFromCheckpoint({
    snapshot,
    checkpoint,
    runtime: input,
  });
  const replay = replayGovernancePersistence({
    runtime: input,
    snapshot,
    checkpoint,
  });
  const metadata: GovernancePersistenceRuntimeResult["metadata"] = {
    immutableAuditSnapshot: true,
    schemaVersion: GOVERNANCE_PERSISTENCE_VERSION,
    snapshotVersion: GOVERNANCE_SNAPSHOT_VERSION,
    checkpointVersion: GOVERNANCE_CHECKPOINT_VERSION,
    versionDriftDetected: detectPersistenceVersionDrift({
      runtimeVersion: GOVERNANCE_PERSISTENCE_VERSION,
      snapshotVersion: GOVERNANCE_SNAPSHOT_VERSION,
      checkpointVersion: GOVERNANCE_CHECKPOINT_VERSION,
    }),
    generatedAt: new Date().toISOString(),
  };

  const core: Omit<GovernancePersistenceRuntimeResult, "summary"> = {
    version: GOVERNANCE_PERSISTENCE_VERSION,
    status: restore.restored && replay.replayable ? "ready" : "checkpointCreated",
    snapshot,
    checkpoint,
    restore,
    replay,
    metadata,
  };

  return {
    ...core,
    summary: summarizeGovernancePersistence(core),
  };
}

export { GOVERNANCE_PERSISTENCE_VERSION };
