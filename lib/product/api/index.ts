/**
 * Product API — Foundation public exports
 * Isolated namespace: lib/product/api
 */

export {
  API_KINDS,
  API_LIFECYCLE_STATES,
  API_MANAGER_STATUSES,
  API_POLICY_MODES,
  API_READINESS_VERDICTS,
  PRODUCT_API_FOUNDATION_BASE,
  PRODUCT_API_FOUNDATION_FREEZE_VERSION,
  PRODUCT_API_FOUNDATION_ID,
  PRODUCT_API_FOUNDATION_VERSION,
  PRODUCT_API_FREEZE_VERSION,
} from "./management/management.constants";

export type {
  ApiManagerStatus,
  ApiReadinessCheck,
  ApiReadinessResult,
  ApiReadinessVerdict,
  ApiRegistryManifest,
} from "./management/management.types";

export type {
  ApiKind,
  ApiMetadata,
  ProductApi,
  RegisterApiInput,
} from "./registry/api.types";

export {
  clearApis,
  getApi,
  getApiByKey,
  listApis,
  registerApi,
} from "./registry/api.registry";

export type {
  ApiDefinition,
  DefineApiDefinitionInput,
  DefinitionMetadata,
} from "./definition/definition.types";

export {
  clearApiDefinitions,
  defineApiDefinition,
  getApiDefinition,
  listApiDefinitions,
} from "./definition/definition.registry";

export type {
  ApiVersion,
  RegisterApiVersionInput,
  VersionMetadata,
} from "./version/version.types";

export {
  clearApiVersions,
  getApiVersion,
  listApiVersions,
  registerApiVersion,
} from "./version/version.registry";

export type {
  ApiLifecycle,
  ApiLifecycleState,
  LifecycleMetadata,
  OpenApiLifecycleInput,
  TransitionApiLifecycleInput,
} from "./lifecycle/lifecycle.types";

export {
  clearApiLifecycles,
  getApiLifecycle,
  listApiLifecycles,
  openApiLifecycle,
  transitionApiLifecycle,
} from "./lifecycle/lifecycle.registry";

export type {
  ApiPolicy,
  ApiPolicyMode,
  AttachApiPolicyInput,
  PolicyMetadata,
} from "./policy/policy.types";

export {
  attachApiPolicy,
  clearApiPolicies,
  getApiPolicy,
  listApiPolicies,
} from "./policy/policy.registry";

export type { ApiReleaseManifest } from "./manifest/manifest.registry";

export {
  clearApiReleaseManifests,
  createApiReleaseManifest,
  getApiReleaseManifest,
  listApiReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertApiFoundationReadinessReady,
  evaluateApiFoundationReadiness,
} from "./management/management.readiness";

export {
  clearApiFoundationLayer,
  createApiManager,
  getApiRegistryManifest,
  type ApiManager,
  type ApiManagerSnapshot,
} from "./api.manager";

export {
  assertProductApiReleaseGatePass,
  checkProductApiReleaseGate,
  PRODUCT_API_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
