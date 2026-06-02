import type { GovernanceStoreContract } from "./store.types";
import { getGovernanceMemoryStore } from "./store.memory";

export function createMemoryGovernanceStoreContract(): GovernanceStoreContract {
  const mem = getGovernanceMemoryStore();
  return {
    saveSnapshot: (snapshot) => {
      mem.snapshots.set(snapshot.snapshotId, snapshot);
    },
    loadSnapshot: (snapshotId) => mem.snapshots.get(snapshotId) ?? null,
    saveCheckpoint: (checkpoint) => {
      mem.checkpoints.set(checkpoint.checkpointId, checkpoint);
    },
    loadCheckpoint: (checkpointId) => mem.checkpoints.get(checkpointId) ?? null,
    listSnapshots: (keyspace) =>
      [...mem.snapshots.values()].filter((s) =>
        s.inputSnapshot.deploymentId.includes(keyspace),
      ),
    listCheckpoints: (keyspace) =>
      [...mem.checkpoints.values()].filter((c) => c.checkpointId.includes(keyspace)),
    saveArchive: (archive) => {
      mem.archives.set(archive.restoreId, archive);
    },
    loadArchive: (restoreId) => mem.archives.get(restoreId) ?? null,
    replay: (snapshotId) => mem.replay.get(snapshotId) ?? null,
    restore: (checkpointId) =>
      [...mem.archives.values()].find((a) => a.auditNote.includes(checkpointId)) ?? null,
    deleteById: (resourceId) => {
      const a = mem.snapshots.delete(resourceId);
      const b = mem.checkpoints.delete(resourceId);
      const c = mem.archives.delete(resourceId);
      const d = mem.replay.delete(resourceId);
      return a || b || c || d;
    },
    listByKeyspace: (keyspace) => {
      const snapshotIds = [...mem.snapshots.values()]
        .filter((s) => s.inputSnapshot.deploymentId.includes(keyspace))
        .map((s) => s.snapshotId);
      const checkpointIds = [...mem.checkpoints.values()]
        .filter((c) => c.checkpointId.includes(keyspace))
        .map((c) => c.checkpointId);
      return [...snapshotIds, ...checkpointIds];
    },
  };
}
