/**
 * Product Partner — Management public exports
 * Isolated namespace: lib/product/partner
 */

export {
  PARTNER_ACCESS_STATUSES,
  PARTNER_AGREEMENT_STATUSES,
  PARTNER_KINDS,
  PARTNER_MANAGER_STATUSES,
  PARTNER_READINESS_VERDICTS,
  PARTNER_STATUSES,
  PRODUCT_PARTNER_FREEZE_TAG,
  PRODUCT_PARTNER_MANAGEMENT_BASE,
  PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PARTNER_MANAGEMENT_ID,
  PRODUCT_PARTNER_MANAGEMENT_VERSION,
} from "./management/management.constants";

export type {
  PartnerManagerStatus,
  PartnerReadinessCheck,
  PartnerReadinessResult,
  PartnerReadinessVerdict,
  PartnerRegistryManifest,
} from "./management/management.types";

export type {
  PartnerKind,
  PartnerMetadata,
  PartnerStatus,
  ProductPartner,
  RegisterPartnerInput,
  UpdatePartnerStatusInput,
} from "./registry/partner.types";

export {
  clearPartners,
  getPartner,
  listPartners,
  registerPartner,
  updatePartnerStatus,
} from "./registry/partner.registry";

export type {
  PartnerProfile,
  ProfileMetadata,
  RegisterPartnerProfileInput,
} from "./profile/profile.types";

export {
  clearPartnerProfiles,
  getPartnerProfile,
  listPartnerProfiles,
  registerPartnerProfile,
} from "./profile/profile.registry";

export type {
  AgreementMetadata,
  PartnerAgreement,
  PartnerAgreementStatus,
  RegisterPartnerAgreementInput,
  UpdatePartnerAgreementStatusInput,
} from "./agreement/agreement.types";

export {
  clearPartnerAgreements,
  getPartnerAgreement,
  listPartnerAgreements,
  registerPartnerAgreement,
  updatePartnerAgreementStatus,
} from "./agreement/agreement.registry";

export type {
  AccessMetadata,
  GrantPartnerAccessInput,
  PartnerAccess,
  PartnerAccessStatus,
  UpdatePartnerAccessStatusInput,
} from "./access/access.types";

export {
  clearPartnerAccesses,
  getPartnerAccess,
  grantPartnerAccess,
  listPartnerAccesses,
  updatePartnerAccessStatus,
} from "./access/access.registry";

export type { PartnerReleaseManifest } from "./manifest/manifest.registry";

export {
  clearPartnerReleaseManifests,
  createPartnerReleaseManifest,
  getPartnerReleaseManifest,
  listPartnerReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertPartnerManagementReadinessReady,
  evaluatePartnerManagementReadiness,
} from "./management/management.readiness";

export {
  clearPartnerManagementLayer,
  createPartnerManager,
  getPartnerRegistryManifest,
  type PartnerManager,
  type PartnerManagerSnapshot,
} from "./partner.manager";

export {
  assertProductPartnerReleaseGatePass,
  checkProductPartnerReleaseGate,
  PRODUCT_PARTNER_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
