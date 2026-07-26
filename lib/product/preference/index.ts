/**
 * Product Preference — Preference Management public exports
 * Isolated namespace: lib/product/preference
 */

export {
  PREFERENCE_CONSENT_STATES,
  PREFERENCE_KINDS,
  PREFERENCE_MANAGER_STATUSES,
  PREFERENCE_READINESS_VERDICTS,
  PREFERENCE_RESOLUTION_STRATEGIES,
  PREFERENCE_SCOPE_LEVELS,
  PREFERENCE_VALIDATION_VERDICTS,
  PRODUCT_PREFERENCE_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_BASE,
  PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_ID,
  PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
} from "./management/management.constants";

export type {
  PreferenceManagerStatus,
  PreferenceReadinessCheck,
  PreferenceReadinessResult,
  PreferenceReadinessVerdict,
  PreferenceRegistryManifest,
} from "./management/management.types";

export type {
  NotificationPreference,
  PreferenceKind,
  PreferenceMetadata,
  RegisterPreferenceInput,
} from "./registry/preference.types";

export {
  clearPreferences,
  getPreference,
  getPreferenceByKey,
  listPreferences,
  registerPreference,
} from "./registry/preference.registry";

export type {
  AttachPreferenceScopeInput,
  PreferenceScope,
  PreferenceScopeLevel,
  ScopeMetadata,
} from "./scope/scope.types";

export {
  attachPreferenceScope,
  clearPreferenceScopes,
  getPreferenceScope,
  listPreferenceScopes,
} from "./scope/scope.registry";

export type {
  ConsentMetadata,
  PreferenceConsent,
  PreferenceConsentState,
  RecordPreferenceConsentInput,
  UpdatePreferenceConsentInput,
} from "./consent/consent.types";

export {
  clearPreferenceConsents,
  getPreferenceConsent,
  listPreferenceConsents,
  recordPreferenceConsent,
  updatePreferenceConsent,
} from "./consent/consent.registry";

export type {
  DefinePreferenceResolutionRuleInput,
  PreferenceResolutionRule,
  PreferenceResolutionStrategy,
  ResolutionMetadata,
} from "./resolution/resolution.types";

export {
  clearPreferenceResolutionRules,
  definePreferenceResolutionRule,
  getPreferenceResolutionRule,
  listPreferenceResolutionRules,
} from "./resolution/resolution.registry";

export type {
  PreferenceValidation,
  PreferenceValidationVerdict,
  ValidatePreferenceInput,
  ValidationMetadata,
} from "./validation/validation.types";

export {
  clearPreferenceValidations,
  getPreferenceValidation,
  listPreferenceValidations,
  validatePreference,
} from "./validation/validation.registry";

export type { PreferenceReleaseManifest } from "./manifest/manifest.registry";

export {
  clearPreferenceReleaseManifests,
  createPreferenceReleaseManifest,
  getPreferenceReleaseManifest,
  listPreferenceReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertPreferenceManagementReadinessReady,
  evaluatePreferenceManagementReadiness,
} from "./management/management.readiness";

export {
  clearPreferenceManagementLayer,
  createPreferenceManager,
  getPreferenceRegistryManifest,
  type PreferenceManager,
  type PreferenceManagerSnapshot,
} from "./preference.manager";

export {
  assertProductPreferenceReleaseGatePass,
  checkProductPreferenceReleaseGate,
  PRODUCT_PREFERENCE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
