/**
 * Product Connector — Framework public exports
 * Isolated namespace: lib/product/connector
 */

export {
  CONNECTOR_BINDING_STATUSES,
  CONNECTOR_CONTRACT_KINDS,
  CONNECTOR_KINDS,
  CONNECTOR_MANAGER_STATUSES,
  CONNECTOR_READINESS_VERDICTS,
  CONNECTOR_STATUSES,
  PRODUCT_CONNECTOR_FRAMEWORK_BASE,
  PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_CONNECTOR_FRAMEWORK_ID,
  PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
  PRODUCT_CONNECTOR_FREEZE_TAG,
} from "./management/management.constants";

export type {
  ConnectorManagerStatus,
  ConnectorReadinessCheck,
  ConnectorReadinessResult,
  ConnectorReadinessVerdict,
  ConnectorRegistryManifest,
} from "./management/management.types";

export type {
  ConnectorKind,
  ConnectorMetadata,
  ConnectorStatus,
  ProductConnector,
  RegisterConnectorInput,
  UpdateConnectorStatusInput,
} from "./registry/connector.types";

export {
  clearConnectors,
  getConnector,
  listConnectors,
  registerConnector,
  updateConnectorStatus,
} from "./registry/connector.registry";

export type {
  ConnectorDefinition,
  DefineConnectorDefinitionInput,
  DefinitionMetadata,
} from "./definition/definition.types";

export {
  clearConnectorDefinitions,
  defineConnectorDefinition,
  getConnectorDefinition,
  listConnectorDefinitions,
} from "./definition/definition.registry";

export type {
  ConnectorContract,
  ConnectorContractKind,
  ContractMetadata,
  RegisterConnectorContractInput,
} from "./contract/contract.types";

export {
  clearConnectorContracts,
  getConnectorContract,
  listConnectorContracts,
  registerConnectorContract,
} from "./contract/contract.registry";

export type {
  BindConnectorInput,
  BindingMetadata,
  ConnectorBinding,
  ConnectorBindingStatus,
  UpdateConnectorBindingStatusInput,
} from "./binding/binding.types";

export {
  bindConnector,
  clearConnectorBindings,
  getConnectorBinding,
  listConnectorBindings,
  updateConnectorBindingStatus,
} from "./binding/binding.registry";

export type { ConnectorReleaseManifest } from "./manifest/manifest.registry";

export {
  clearConnectorReleaseManifests,
  createConnectorReleaseManifest,
  getConnectorReleaseManifest,
  listConnectorReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertConnectorFrameworkReadinessReady,
  evaluateConnectorFrameworkReadiness,
} from "./management/management.readiness";

export {
  clearConnectorFrameworkLayer,
  createConnectorManager,
  getConnectorRegistryManifest,
  type ConnectorManager,
  type ConnectorManagerSnapshot,
} from "./connector.manager";

export {
  assertProductConnectorReleaseGatePass,
  checkProductConnectorReleaseGate,
  PRODUCT_CONNECTOR_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
