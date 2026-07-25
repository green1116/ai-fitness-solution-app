/**
 * Product BI — BI Integration Manager
 */

import {
  clearCatalogEntries,
  getCatalogEntry,
  listCatalogEntries,
  registerCatalogEntry,
} from "./catalog/catalog.registry";
import type {
  BiCatalogEntry,
  RegisterCatalogEntryInput,
} from "./catalog/catalog.types";
import {
  clearConnectors,
  connectBi,
  getConnector,
  listConnectors,
  registerConnector,
} from "./connector/connector.registry";
import type {
  BiConnector,
  ConnectBiInput,
  RegisterConnectorInput,
} from "./connector/connector.types";
import {
  PRODUCT_BI_INTEGRATION_BASE,
  PRODUCT_BI_INTEGRATION_FREEZE_VERSION,
  PRODUCT_BI_INTEGRATION_ID,
  PRODUCT_BI_INTEGRATION_VERSION,
} from "./integration/integration.constants";
import {
  assertBiIntegrationReadinessReady,
  evaluateBiIntegrationReadiness,
} from "./integration/integration.readiness";
import type {
  BiManagerStatus,
  BiReadinessResult,
  BiRegistryManifest,
} from "./integration/integration.types";
import {
  clearBiQueries,
  executeBiQuery,
  getBiQuery,
  listBiQueries,
} from "./query/query.registry";
import type {
  BiQuery,
  ExecuteBiQueryInput,
} from "./query/query.types";
import {
  clearBiSyncs,
  getBiSync,
  listBiSyncs,
  runBiSync,
} from "./sync/sync.registry";
import type {
  BiSyncRun,
  RunBiSyncInput,
} from "./sync/sync.types";

export type BiManagerSnapshot = {
  managerId: string;
  status: BiManagerStatus;
  layerId: typeof PRODUCT_BI_INTEGRATION_ID;
  version: typeof PRODUCT_BI_INTEGRATION_VERSION;
  connectorCount: number;
  catalogCount: number;
  syncCount: number;
  queryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type BiManager = {
  initialize: () => BiManagerSnapshot;
  start: () => BiManagerSnapshot;
  stop: () => BiManagerSnapshot;
  status: () => BiManagerSnapshot;
  registerConnector: (input: RegisterConnectorInput) => BiConnector;
  connectBi: (input: ConnectBiInput) => BiConnector;
  registerCatalogEntry: (
    input: RegisterCatalogEntryInput,
  ) => BiCatalogEntry;
  runBiSync: (input: RunBiSyncInput) => BiSyncRun;
  executeBiQuery: (input: ExecuteBiQueryInput) => BiQuery;
  evaluateReadiness: () => BiReadinessResult;
  manifest: () => BiRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getBiRegistryManifest(): BiRegistryManifest {
  return {
    integrationId: PRODUCT_BI_INTEGRATION_ID,
    version: PRODUCT_BI_INTEGRATION_VERSION,
    freezeVersion: PRODUCT_BI_INTEGRATION_FREEZE_VERSION,
    base: PRODUCT_BI_INTEGRATION_BASE,
    connectorCount: listConnectors().length,
    catalogCount: listCatalogEntries().length,
    syncCount: listBiSyncs().length,
    queryCount: listBiQueries().length,
  };
}

export function clearBiIntegrationLayer(): void {
  clearBiQueries();
  clearBiSyncs();
  clearCatalogEntries();
  clearConnectors();
}

export function createBiManager(options?: {
  managerId?: string;
}): BiManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-bi-mgr");
  let state: BiManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): BiManagerSnapshot {
    const reg = getBiRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_BI_INTEGRATION_ID,
      version: PRODUCT_BI_INTEGRATION_VERSION,
      connectorCount: reg.connectorCount,
      catalogCount: reg.catalogCount,
      syncCount: reg.syncCount,
      queryCount: reg.queryCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): BiManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearBiIntegrationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): BiManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): BiManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerConnector: (input) => {
      assertRunning("registerConnector");
      return registerConnector(input);
    },
    connectBi: (input) => {
      assertRunning("connectBi");
      return connectBi(input);
    },
    registerCatalogEntry: (input) => {
      assertRunning("registerCatalogEntry");
      return registerCatalogEntry(input);
    },
    runBiSync: (input) => {
      assertRunning("runBiSync");
      return runBiSync(input);
    },
    executeBiQuery: (input) => {
      assertRunning("executeBiQuery");
      return executeBiQuery(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateBiIntegrationReadiness();
    },
    manifest: getBiRegistryManifest,
  };
}

export {
  assertBiIntegrationReadinessReady,
  getBiQuery,
  getBiSync,
  getCatalogEntry,
  getConnector,
  listBiQueries,
  listBiSyncs,
  listCatalogEntries,
  listConnectors,
};
