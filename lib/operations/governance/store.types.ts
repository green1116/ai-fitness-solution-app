import type {
  GovernanceCheckpoint,
  GovernancePersistenceRuntimeResult,
  GovernanceSnapshot,
} from "./persistence.types";

export const GOVERNANCE_STORE_VERSION = "v4-a3-r7-store-1" as const;
export type GovernanceStoreVersion = typeof GOVERNANCE_STORE_VERSION;

export type GovernanceStoreBackend = "memory" | "file" | "db" | "redis" | "objectStore";

export type GovernanceStoreStatus = "initialized" | "saved" | "loaded" | "ready";

export type GovernanceStoreOperationType =
  | "saveSnapshot"
  | "loadSnapshot"
  | "saveCheckpoint"
  | "loadCheckpoint"
  | "listSnapshots"
  | "listCheckpoints"
  | "saveArchive"
  | "loadArchive"
  | "replay"
  | "restore"
  | "deleteById"
  | "listByKeyspace";

export type GovernanceStoreOperation = {
  operationId: string;
  operationType: GovernanceStoreOperationType;
  storeType: GovernanceStoreBackend;
  resourceId: string;
  result: "success" | "miss" | "failed";
  timestamp: string;
  reason: string;
};

export type GovernanceStoreTrace = {
  traceId: string;
  operations: GovernanceStoreOperation[];
};

export type GovernanceStoreContract = {
  saveSnapshot: (snapshot: GovernanceSnapshot) => void;
  loadSnapshot: (snapshotId: string) => GovernanceSnapshot | null;
  saveCheckpoint: (checkpoint: GovernanceCheckpoint) => void;
  loadCheckpoint: (checkpointId: string) => GovernanceCheckpoint | null;
  listSnapshots: (keyspace: string) => GovernanceSnapshot[];
  listCheckpoints: (keyspace: string) => GovernanceCheckpoint[];
  saveArchive: (archive: GovernancePersistenceRuntimeResult["restore"]) => void;
  loadArchive: (restoreId: string) => GovernancePersistenceRuntimeResult["restore"] | null;
  replay: (snapshotId: string) => GovernancePersistenceRuntimeResult["replay"] | null;
  restore: (checkpointId: string) => GovernancePersistenceRuntimeResult["restore"] | null;
  deleteById: (resourceId: string) => boolean;
  listByKeyspace: (keyspace: string) => string[];
};

export type GovernanceStoreMemory = {
  snapshots: Map<string, GovernanceSnapshot>;
  checkpoints: Map<string, GovernanceCheckpoint>;
  archives: Map<string, GovernancePersistenceRuntimeResult["restore"]>;
  replay: Map<string, GovernancePersistenceRuntimeResult["replay"]>;
};

export type GovernanceStoreRegistry = {
  defaultBackend: GovernanceStoreBackend;
  availableBackends: GovernanceStoreBackend[];
};

export type GovernanceStoreAdapter = {
  backend: GovernanceStoreBackend;
  keyspace: string;
};

export type GovernanceStoreSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceStoreRuntimeInput = {
  persistence: GovernancePersistenceRuntimeResult;
  keyspace: string;
  backend?: GovernanceStoreBackend;
};

export type GovernanceStoreRuntimeResult = {
  version: GovernanceStoreVersion;
  backend: GovernanceStoreBackend;
  adapter: GovernanceStoreAdapter;
  registry: GovernanceStoreRegistry;
  trace: GovernanceStoreTrace;
  summary: GovernanceStoreSummary;
  status: GovernanceStoreStatus;
  operations: GovernanceStoreOperation[];
  loaded: {
    snapshot: GovernanceSnapshot | null;
    checkpoint: GovernanceCheckpoint | null;
    archive: GovernancePersistenceRuntimeResult["restore"] | null;
  };
  listed: {
    snapshots: GovernanceSnapshot[];
    checkpoints: GovernanceCheckpoint[];
    keyspaceResources: string[];
  };
};
