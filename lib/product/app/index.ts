/**
 * Product App — Registry public exports
 * Isolated namespace: lib/product/app
 */

export {
  APP_KINDS,
  APP_MANAGER_STATUSES,
  APP_OWNERSHIP_STATUSES,
  APP_READINESS_VERDICTS,
  APP_STATUSES,
  APP_VERSION_STATUSES,
  PRODUCT_APP_FREEZE_TAG,
  PRODUCT_APP_REGISTRY_BASE,
  PRODUCT_APP_REGISTRY_FREEZE_VERSION,
  PRODUCT_APP_REGISTRY_ID,
  PRODUCT_APP_REGISTRY_VERSION,
} from "./management/management.constants";

export type {
  AppManagerStatus,
  AppReadinessCheck,
  AppReadinessResult,
  AppReadinessVerdict,
  AppRegistryManifest,
} from "./management/management.types";

export type {
  AppKind,
  AppMetadata,
  AppStatus,
  ProductApp,
  RegisterAppInput,
  UpdateAppStatusInput,
} from "./registry/app.types";

export {
  clearApps,
  getApp,
  listApps,
  registerApp,
  updateAppStatus,
} from "./registry/app.registry";

export type {
  AppDefinition,
  DefinitionMetadata,
  RegisterAppDefinitionInput,
} from "./definition/definition.types";

export {
  clearAppDefinitions,
  getAppDefinition,
  listAppDefinitions,
  registerAppDefinition,
} from "./definition/definition.registry";

export type {
  AppVersion,
  AppVersionStatus,
  RegisterAppVersionInput,
  UpdateAppVersionStatusInput,
  VersionMetadata,
} from "./version/version.types";

export {
  clearAppVersions,
  getAppVersion,
  listAppVersions,
  registerAppVersion,
  updateAppVersionStatus,
} from "./version/version.registry";

export type {
  AppOwnership,
  AppOwnershipStatus,
  AssignAppOwnershipInput,
  OwnershipMetadata,
  UpdateAppOwnershipStatusInput,
} from "./ownership/ownership.types";

export {
  assignAppOwnership,
  clearAppOwnerships,
  getAppOwnership,
  listAppOwnerships,
  updateAppOwnershipStatus,
} from "./ownership/ownership.registry";

export type { AppReleaseManifest } from "./manifest/manifest.registry";

export {
  clearAppReleaseManifests,
  createAppReleaseManifest,
  getAppReleaseManifest,
  listAppReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertAppRegistryReadinessReady,
  evaluateAppRegistryReadiness,
} from "./management/management.readiness";

export {
  clearAppRegistryLayer,
  createAppManager,
  getAppRegistryManifest,
  type AppManager,
  type AppManagerSnapshot,
} from "./app.manager";

export {
  assertProductAppReleaseGatePass,
  checkProductAppReleaseGate,
  PRODUCT_APP_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
