/**
 * Product Customer Profile — public exports
 * Isolated namespace: lib/product/customer-profile
 */

export {
  ATTRIBUTE_KINDS,
  CONTACT_KINDS,
  CUSTOMER_PROFILE_MANAGER_STATUSES,
  CUSTOMER_PROFILE_READINESS_VERDICTS,
  PREFERENCE_KINDS,
  PRODUCT_CUSTOMER_PROFILE_BASE,
  PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_ID,
  PRODUCT_CUSTOMER_PROFILE_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_VERSION,
  PROFILE_STATUSES,
} from "./profile/profile.constants";

export type {
  CustomerProfileManagerStatus,
  CustomerProfileReadinessCheck,
  CustomerProfileReadinessResult,
  CustomerProfileReadinessVerdict,
  CustomerProfileRegistryManifest,
} from "./profile/profile.types";

export type {
  CustomerProfileIdentity,
  IdentityMetadata,
  ProfileStatus,
  UpdateIdentityStatusInput,
  UpsertIdentityInput,
} from "./identity/identity.types";

export {
  clearIdentities,
  getIdentity,
  listIdentities,
  updateIdentityStatus,
  upsertIdentity,
} from "./identity/identity.registry";

export type {
  AddContactInput,
  ContactKind,
  ContactMetadata,
  CustomerProfileContact,
} from "./contact/contact.types";

export {
  addContact,
  clearContacts,
  getContact,
  listContacts,
} from "./contact/contact.registry";

export type {
  CustomerProfilePreference,
  PreferenceKind,
  PreferenceMetadata,
  SetPreferenceInput,
} from "./preference/preference.types";

export {
  clearPreferences,
  getPreference,
  listPreferences,
  setPreference,
} from "./preference/preference.registry";

export type {
  AssignAttributeInput,
  AttributeKind,
  AttributeMetadata,
  CustomerProfileAttribute,
} from "./attribute/attribute.types";

export {
  assignAttribute,
  clearAttributes,
  getAttribute,
  listAttributes,
} from "./attribute/attribute.registry";

export {
  assertCustomerProfileReadinessReady,
  evaluateCustomerProfileReadiness,
} from "./profile/profile.readiness";

export {
  clearCustomerProfileLayer,
  createCustomerProfileManager,
  getCustomerProfileRegistryManifest,
  type CustomerProfileManager,
  type CustomerProfileManagerSnapshot,
} from "./customer-profile.manager";

export {
  assertProductCustomerProfileReleaseGatePass,
  checkProductCustomerProfileReleaseGate,
  PRODUCT_CUSTOMER_PROFILE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
