/**
 * Product BI — BI Integration public exports
 * Isolated namespace: lib/product/bi
 */

export {
  BI_CONNECTOR_KINDS,
  BI_CONNECTOR_STATUSES,
  BI_MANAGER_STATUSES,
  BI_QUERY_KINDS,
  BI_READINESS_VERDICTS,
  BI_SYNC_RESULTS,
  PRODUCT_BI_FREEZE_VERSION,
  PRODUCT_BI_INTEGRATION_BASE,
  PRODUCT_BI_INTEGRATION_FREEZE_VERSION,
  PRODUCT_BI_INTEGRATION_ID,
  PRODUCT_BI_INTEGRATION_VERSION,
} from "./integration/integration.constants";

export type {
  BiManagerStatus,
  BiReadinessCheck,
  BiReadinessResult,
  BiReadinessVerdict,
  BiRegistryManifest,
} from "./integration/integration.types";

export type {
  BiConnector,
  BiConnectorKind,
  BiConnectorStatus,
  ConnectBiInput,
  ConnectorMetadata,
  RegisterConnectorInput,
} from "./connector/connector.types";

export {
  clearConnectors,
  connectBi,
  getConnector,
  listConnectors,
  registerConnector,
} from "./connector/connector.registry";

export type {
  BiCatalogEntry,
  CatalogMetadata,
  RegisterCatalogEntryInput,
} from "./catalog/catalog.types";

export {
  clearCatalogEntries,
  getCatalogEntry,
  listCatalogEntries,
  registerCatalogEntry,
} from "./catalog/catalog.registry";

export type {
  BiSyncResult,
  BiSyncRun,
  RunBiSyncInput,
  SyncMetadata,
} from "./sync/sync.types";

export {
  clearBiSyncs,
  getBiSync,
  listBiSyncs,
  runBiSync,
} from "./sync/sync.registry";

export type {
  BiQuery,
  BiQueryKind,
  ExecuteBiQueryInput,
  QueryMetadata,
} from "./query/query.types";

export {
  clearBiQueries,
  executeBiQuery,
  getBiQuery,
  listBiQueries,
} from "./query/query.registry";

export {
  assertBiIntegrationReadinessReady,
  evaluateBiIntegrationReadiness,
} from "./integration/integration.readiness";

export {
  clearBiIntegrationLayer,
  createBiManager,
  getBiRegistryManifest,
  type BiManager,
  type BiManagerSnapshot,
} from "./bi.manager";

export {
  assertProductBiReleaseGatePass,
  checkProductBiReleaseGate,
  PRODUCT_BI_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
