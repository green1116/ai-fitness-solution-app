/**
 * Product API SDK — public exports
 * Isolated namespace: lib/product/api-sdk
 */

export {
  PRODUCT_API_SDK_BASE,
  PRODUCT_API_SDK_FREEZE_TAG,
  PRODUCT_API_SDK_FREEZE_VERSION,
  PRODUCT_API_SDK_ID,
  PRODUCT_API_SDK_VERSION,
  SDK_CLIENT_KINDS,
  SDK_CLIENT_STATUSES,
  SDK_MANAGER_STATUSES,
  SDK_OPERATION_METHODS,
  SDK_PACKAGE_STATUSES,
  SDK_READINESS_VERDICTS,
  SDK_SCHEMA_KINDS,
} from "./management/management.constants";

export type {
  SdkManagerStatus,
  SdkReadinessCheck,
  SdkReadinessResult,
  SdkReadinessVerdict,
  SdkRegistryManifest,
} from "./management/management.types";

export type {
  RegisterSdkClientInput,
  SdkClient,
  SdkClientKind,
  SdkClientMetadata,
  SdkClientStatus,
  UpdateSdkClientStatusInput,
} from "./client/client.types";

export {
  clearSdkClients,
  getSdkClient,
  listSdkClients,
  registerSdkClient,
  updateSdkClientStatus,
} from "./client/client.registry";

export type {
  RegisterSdkOperationInput,
  SdkOperation,
  SdkOperationMetadata,
  SdkOperationMethod,
} from "./operation/operation.types";

export {
  clearSdkOperations,
  getSdkOperation,
  listSdkOperations,
  registerSdkOperation,
} from "./operation/operation.registry";

export type {
  RegisterSdkSchemaInput,
  SdkSchema,
  SdkSchemaKind,
  SdkSchemaMetadata,
} from "./schema/schema.types";

export {
  clearSdkSchemas,
  getSdkSchema,
  listSdkSchemas,
  registerSdkSchema,
} from "./schema/schema.registry";

export type {
  PublishSdkPackageInput,
  SdkPackage,
  SdkPackageMetadata,
  SdkPackageStatus,
  UpdateSdkPackageStatusInput,
} from "./package/package.types";

export {
  clearSdkPackages,
  getSdkPackage,
  listSdkPackages,
  publishSdkPackage,
  updateSdkPackageStatus,
} from "./package/package.registry";

export type { ApiSdkReleaseManifest } from "./manifest/manifest.registry";

export {
  clearApiSdkReleaseManifests,
  createApiSdkReleaseManifest,
  getApiSdkReleaseManifest,
  listApiSdkReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertApiSdkReadinessReady,
  evaluateApiSdkReadiness,
} from "./management/management.readiness";

export {
  clearApiSdkLayer,
  createApiSdkManager,
  getApiSdkRegistryManifest,
  type ApiSdkManager,
  type SdkManagerSnapshot,
} from "./api-sdk.manager";

export {
  assertProductApiSdkReleaseGatePass,
  checkProductApiSdkReleaseGate,
  PRODUCT_API_SDK_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
