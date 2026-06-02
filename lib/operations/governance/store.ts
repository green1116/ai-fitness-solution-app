import { GOVERNANCE_STORE_VERSION, type GovernanceStoreRuntimeInput, type GovernanceStoreRuntimeResult } from "./store.types";
import { normalizeStoreRuntimeInput, resolveGovernanceStoreContract } from "./store.adapter";
import { buildGovernanceStoreRegistry } from "./store.registry";
import { buildStoreTrace, createStoreOperation } from "./store.trace";
import { summarizeGovernanceStore } from "./store.summary";
import { getGovernanceMemoryStore } from "./store.memory";

export function buildGovernanceStoreRuntime(
  rawInput: GovernanceStoreRuntimeInput,
): GovernanceStoreRuntimeResult {
  const input = normalizeStoreRuntimeInput(rawInput);
  const registry = buildGovernanceStoreRegistry();
  const contract = resolveGovernanceStoreContract({ backend: input.backend });
  const operations: GovernanceStoreRuntimeResult["operations"] = [];

  contract.saveSnapshot(input.persistence.snapshot);
  operations.push(
    createStoreOperation({
      operationType: "saveSnapshot",
      storeType: input.backend,
      resourceId: input.persistence.snapshot.snapshotId,
      result: "success",
      reason: "saved snapshot to store",
    }),
  );

  contract.saveCheckpoint(input.persistence.checkpoint);
  operations.push(
    createStoreOperation({
      operationType: "saveCheckpoint",
      storeType: input.backend,
      resourceId: input.persistence.checkpoint.checkpointId,
      result: "success",
      reason: "saved checkpoint to store",
    }),
  );

  contract.saveArchive(input.persistence.restore);
  operations.push(
    createStoreOperation({
      operationType: "saveArchive",
      storeType: input.backend,
      resourceId: input.persistence.restore.restoreId,
      result: "success",
      reason: "saved archive/restore payload",
    }),
  );

  // replay data persistence in memory backend
  getGovernanceMemoryStore().replay.set(
    input.persistence.snapshot.snapshotId,
    input.persistence.replay,
  );

  const loadedSnapshot = contract.loadSnapshot(input.persistence.snapshot.snapshotId);
  operations.push(
    createStoreOperation({
      operationType: "loadSnapshot",
      storeType: input.backend,
      resourceId: input.persistence.snapshot.snapshotId,
      result: loadedSnapshot ? "success" : "miss",
      reason: "load snapshot by id",
    }),
  );

  const loadedCheckpoint = contract.loadCheckpoint(input.persistence.checkpoint.checkpointId);
  operations.push(
    createStoreOperation({
      operationType: "loadCheckpoint",
      storeType: input.backend,
      resourceId: input.persistence.checkpoint.checkpointId,
      result: loadedCheckpoint ? "success" : "miss",
      reason: "load checkpoint by id",
    }),
  );

  const loadedArchive = contract.loadArchive(input.persistence.restore.restoreId);
  operations.push(
    createStoreOperation({
      operationType: "loadArchive",
      storeType: input.backend,
      resourceId: input.persistence.restore.restoreId,
      result: loadedArchive ? "success" : "miss",
      reason: "load archive by id",
    }),
  );

  const listedSnapshots = contract.listSnapshots(input.keyspace);
  operations.push(
    createStoreOperation({
      operationType: "listSnapshots",
      storeType: input.backend,
      resourceId: input.keyspace,
      result: "success",
      reason: "list snapshots by keyspace",
    }),
  );

  const listedCheckpoints = contract.listCheckpoints(input.keyspace);
  operations.push(
    createStoreOperation({
      operationType: "listCheckpoints",
      storeType: input.backend,
      resourceId: input.keyspace,
      result: "success",
      reason: "list checkpoints by keyspace",
    }),
  );

  const keyspaceResources = contract.listByKeyspace(input.keyspace);
  operations.push(
    createStoreOperation({
      operationType: "listByKeyspace",
      storeType: input.backend,
      resourceId: input.keyspace,
      result: "success",
      reason: "list resources by keyspace",
    }),
  );

  const replay = contract.replay(input.persistence.snapshot.snapshotId);
  operations.push(
    createStoreOperation({
      operationType: "replay",
      storeType: input.backend,
      resourceId: input.persistence.snapshot.snapshotId,
      result: replay ? "success" : "miss",
      reason: "replay from stored snapshot",
    }),
  );

  const restored = contract.restore(input.persistence.checkpoint.checkpointId);
  operations.push(
    createStoreOperation({
      operationType: "restore",
      storeType: input.backend,
      resourceId: input.persistence.checkpoint.checkpointId,
      result: restored ? "success" : "miss",
      reason: "restore from stored checkpoint",
    }),
  );

  const trace = buildStoreTrace(operations);
  const status: GovernanceStoreRuntimeResult["status"] =
    loadedSnapshot && loadedCheckpoint && loadedArchive ? "ready" : "loaded";

  const core: Omit<GovernanceStoreRuntimeResult, "summary"> = {
    version: GOVERNANCE_STORE_VERSION,
    backend: input.backend,
    adapter: {
      backend: input.backend,
      keyspace: input.keyspace,
    },
    registry,
    trace,
    status,
    operations,
    loaded: {
      snapshot: loadedSnapshot,
      checkpoint: loadedCheckpoint,
      archive: loadedArchive,
    },
    listed: {
      snapshots: listedSnapshots,
      checkpoints: listedCheckpoints,
      keyspaceResources,
    },
  };

  return {
    ...core,
    summary: summarizeGovernanceStore(core),
  };
}

export { GOVERNANCE_STORE_VERSION };
