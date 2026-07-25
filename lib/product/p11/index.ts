/**
 * Product P11 — Commercial Release public exports
 * Isolated namespace: lib/product/p11
 */

export {
  DEPLOYMENT_STATUSES,
  ENVIRONMENT_KINDS,
  FEATURE_FLAGS,
  LICENSE_STATUSES,
  P11_MANAGER_STATUSES,
  P11_READINESS_VERDICTS,
  PRODUCT_P11_COMMERCIAL_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
  PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_ID,
  PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
  RELEASE_STATUSES,
  TENANT_STATUSES,
  VERSION_CHANNELS,
} from "./release/release.constants";

export type {
  CommercialRelease,
  CreateReleaseInput,
  P11ManagerStatus,
  P11ReadinessCheck,
  P11ReadinessResult,
  P11ReadinessVerdict,
  P11RegistryManifest,
  ReleaseMetadata,
  ReleaseStatus,
  UpdateReleaseStatusInput,
} from "./release/release.types";

export {
  clearReleases,
  createRelease,
  getRelease,
  listReleases,
  updateReleaseStatus,
} from "./release/release.registry";

export type {
  FeatureFlag,
  FeatureMetadata,
  RegisterFeatureInput,
  ReleaseFeature,
  UpdateFeatureFlagInput,
} from "./feature/feature.types";

export {
  clearFeatures,
  getFeature,
  listFeatures,
  registerFeature,
  updateFeatureFlag,
} from "./feature/feature.registry";

export type {
  PublishVersionInput,
  ReleaseVersion,
  VersionChannel,
  VersionMetadata,
} from "./version/version.types";

export {
  clearVersions,
  getVersion,
  listVersions,
  publishVersion,
} from "./version/version.registry";

export type {
  CommercialTenant,
  ProvisionTenantInput,
  TenantMetadata,
  TenantStatus,
  UpdateTenantStatusInput,
} from "./tenant/tenant.types";

export {
  clearTenants,
  getTenant,
  listTenants,
  provisionTenant,
  updateTenantStatus,
} from "./tenant/tenant.registry";

export type {
  CreateEnvironmentInput,
  EnvironmentKind,
  EnvironmentMetadata,
  ReleaseEnvironment,
} from "./environment/environment.types";

export {
  clearEnvironments,
  createEnvironment,
  getEnvironment,
  listEnvironments,
} from "./environment/environment.registry";

export type {
  CompleteDeploymentInput,
  DeploymentMetadata,
  DeploymentStatus,
  ReleaseDeployment,
  StartDeploymentInput,
} from "./deployment/deployment.types";

export {
  clearDeployments,
  completeDeployment,
  getDeployment,
  listDeployments,
  startDeployment,
} from "./deployment/deployment.registry";

export type {
  ActivateLicenseInput,
  CommercialLicense,
  IssueLicenseInput,
  LicenseMetadata,
  LicenseStatus,
} from "./license/license.types";

export {
  activateLicense,
  clearLicenses,
  getLicense,
  issueLicense,
  listLicenses,
} from "./license/license.registry";

export {
  assertP11CommercialReleaseReadinessReady,
  evaluateP11CommercialReleaseReadiness,
} from "./release/release.readiness";

export {
  clearP11CommercialReleaseLayer,
  createP11CommercialManager,
  getP11RegistryManifest,
  type P11CommercialManager,
  type P11CommercialManagerSnapshot,
} from "./commercial.manager";

export {
  assertProductP11ReleaseGatePass,
  checkProductP11ReleaseGate,
  PRODUCT_P11_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
