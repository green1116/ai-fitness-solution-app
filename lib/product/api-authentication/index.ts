/**
 * Product API Authentication — public exports
 * Isolated namespace: lib/product/api-authentication
 */

export {
  API_AUTH_MANAGER_STATUSES,
  API_AUTH_READINESS_VERDICTS,
  API_CREDENTIAL_KINDS,
  API_CREDENTIAL_STATUSES,
  API_TOKEN_VALIDATION_VERDICTS,
  PRODUCT_API_AUTHENTICATION_BASE,
  PRODUCT_API_AUTHENTICATION_FREEZE_TAG,
  PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
  PRODUCT_API_AUTHENTICATION_ID,
  PRODUCT_API_AUTHENTICATION_VERSION,
} from "./management/management.constants";

export type {
  ApiAuthManagerStatus,
  ApiAuthReadinessCheck,
  ApiAuthReadinessResult,
  ApiAuthReadinessVerdict,
  ApiAuthRegistryManifest,
} from "./management/management.types";

export type {
  ApiCredential,
  ApiCredentialKind,
  ApiCredentialStatus,
  CredentialMetadata,
  RegisterApiCredentialInput,
  UpdateApiCredentialStatusInput,
} from "./credential/credential.types";

export {
  clearApiCredentials,
  getApiCredential,
  listApiCredentials,
  registerApiCredential,
  updateApiCredentialStatus,
} from "./credential/credential.registry";

export type {
  ApiAuthKey,
  IssueApiAuthKeyInput,
  KeyMetadata,
} from "./key/key.types";

export {
  clearApiAuthKeys,
  getApiAuthKey,
  hashApiAuthSecret,
  issueApiAuthKey,
  listApiAuthKeys,
} from "./key/key.registry";

export type {
  ApiTokenValidation,
  ApiTokenValidationVerdict,
  TokenMetadata,
  ValidateApiTokenInput,
} from "./token/token.types";

export {
  clearApiTokenValidations,
  getApiTokenValidation,
  listApiTokenValidations,
  validateApiToken,
} from "./token/token.registry";

export type {
  ApiIdentityMapping,
  IdentityMetadata,
  MapApiIdentityInput,
} from "./identity/identity.types";

export {
  clearApiIdentityMappings,
  getApiIdentityMapping,
  listApiIdentityMappings,
  mapApiIdentity,
} from "./identity/identity.registry";

export type {
  ApiAuthenticationContext,
  BuildApiAuthenticationContextInput,
  ContextMetadata,
} from "./context/context.types";

export {
  buildApiAuthenticationContext,
  clearApiAuthenticationContexts,
  getApiAuthenticationContext,
  listApiAuthenticationContexts,
} from "./context/context.registry";

export type { ApiAuthenticationReleaseManifest } from "./manifest/manifest.registry";

export {
  clearApiAuthenticationReleaseManifests,
  createApiAuthenticationReleaseManifest,
  getApiAuthenticationReleaseManifest,
  listApiAuthenticationReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertApiAuthenticationReadinessReady,
  evaluateApiAuthenticationReadiness,
} from "./management/management.readiness";

export {
  clearApiAuthenticationLayer,
  createApiAuthManager,
  getApiAuthRegistryManifest,
  type ApiAuthManager,
  type ApiAuthManagerSnapshot,
} from "./api-authentication.manager";

export {
  assertProductApiAuthenticationReleaseGatePass,
  checkProductApiAuthenticationReleaseGate,
  PRODUCT_API_AUTHENTICATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
