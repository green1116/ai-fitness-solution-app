/**
 * Product Configuration — System Configuration public exports
 * Isolated namespace: lib/product/configuration
 */

export {
  CONFIG_NAMESPACE_SCOPES,
  CONFIG_NAMESPACE_STATUSES,
  CONFIG_OVERRIDE_TARGETS,
  CONFIG_PARAMETER_TYPES,
  CONFIG_RELEASE_STATUSES,
  CONFIGURATION_MANAGER_STATUSES,
  CONFIGURATION_READINESS_VERDICTS,
  PRODUCT_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_BASE,
  PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_ID,
  PRODUCT_SYSTEM_CONFIGURATION_VERSION,
} from "./management/management.constants";

export type {
  ConfigurationManagerStatus,
  ConfigurationReadinessCheck,
  ConfigurationReadinessResult,
  ConfigurationReadinessVerdict,
  ConfigurationRegistryManifest,
} from "./management/management.types";

export type {
  ConfigNamespace,
  ConfigNamespaceScope,
  ConfigNamespaceStatus,
  NamespaceMetadata,
  RegisterConfigNamespaceInput,
  UpdateConfigNamespaceStatusInput,
} from "./namespace/namespace.types";

export {
  clearConfigNamespaces,
  getConfigNamespace,
  listConfigNamespaces,
  registerConfigNamespace,
  updateConfigNamespaceStatus,
} from "./namespace/namespace.registry";

export type {
  ConfigParameter,
  ConfigParameterType,
  ParameterMetadata,
  SetConfigParameterInput,
} from "./parameter/parameter.types";

export {
  clearConfigParameters,
  getConfigParameter,
  listConfigParameters,
  setConfigParameter,
} from "./parameter/parameter.registry";

export type {
  ApplyConfigOverrideInput,
  ConfigOverride,
  ConfigOverrideTarget,
  OverrideMetadata,
} from "./override/override.types";

export {
  applyConfigOverride,
  clearConfigOverrides,
  getConfigOverride,
  listConfigOverrides,
} from "./override/override.registry";

export type {
  ConfigRelease,
  ConfigReleaseStatus,
  CreateConfigReleaseInput,
  ReleaseMetadata,
  UpdateConfigReleaseStatusInput,
} from "./release/release.types";

export {
  clearConfigReleases,
  createConfigRelease,
  getConfigRelease,
  listConfigReleases,
  updateConfigReleaseStatus,
} from "./release/release.registry";

export {
  assertSystemConfigurationReadinessReady,
  evaluateSystemConfigurationReadiness,
} from "./management/management.readiness";

export {
  clearSystemConfigurationLayer,
  createConfigurationManager,
  getConfigurationRegistryManifest,
  type ConfigurationManager,
  type ConfigurationManagerSnapshot,
} from "./configuration.manager";

export {
  assertProductConfigurationReleaseGatePass,
  checkProductConfigurationReleaseGate,
  PRODUCT_CONFIGURATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
