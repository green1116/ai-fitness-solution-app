/**
 * Product Marketplace — Foundation public exports
 * Isolated namespace: lib/product/marketplace
 */

export {
  MARKETPLACE_LIFECYCLE_STATES,
  MARKETPLACE_LISTING_KINDS,
  MARKETPLACE_MANAGER_STATUSES,
  MARKETPLACE_POLICY_MODES,
  MARKETPLACE_READINESS_VERDICTS,
  PRODUCT_MARKETPLACE_FOUNDATION_BASE,
  PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_FOUNDATION_ID,
  PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
  PRODUCT_MARKETPLACE_FREEZE_VERSION,
} from "./management/management.constants";

export type {
  MarketplaceManagerStatus,
  MarketplaceReadinessCheck,
  MarketplaceReadinessResult,
  MarketplaceReadinessVerdict,
  MarketplaceRegistryManifest,
} from "./management/management.types";

export type {
  ListingMetadata,
  MarketplaceListing,
  MarketplaceListingKind,
  RegisterMarketplaceListingInput,
} from "./registry/listing.types";

export {
  clearMarketplaceListings,
  getMarketplaceListing,
  getMarketplaceListingByKey,
  listMarketplaceListings,
  registerMarketplaceListing,
} from "./registry/listing.registry";

export type {
  DefineMarketplaceDefinitionInput,
  DefinitionMetadata,
  MarketplaceDefinition,
} from "./definition/definition.types";

export {
  clearMarketplaceDefinitions,
  defineMarketplaceDefinition,
  getMarketplaceDefinition,
  listMarketplaceDefinitions,
} from "./definition/definition.registry";

export type {
  MarketplaceVersion,
  RegisterMarketplaceVersionInput,
  VersionMetadata,
} from "./version/version.types";

export {
  clearMarketplaceVersions,
  getMarketplaceVersion,
  listMarketplaceVersions,
  registerMarketplaceVersion,
} from "./version/version.registry";

export type {
  LifecycleMetadata,
  MarketplaceLifecycle,
  MarketplaceLifecycleState,
  OpenMarketplaceLifecycleInput,
  TransitionMarketplaceLifecycleInput,
} from "./lifecycle/lifecycle.types";

export {
  clearMarketplaceLifecycles,
  getMarketplaceLifecycle,
  listMarketplaceLifecycles,
  openMarketplaceLifecycle,
  transitionMarketplaceLifecycle,
} from "./lifecycle/lifecycle.registry";

export type {
  AttachMarketplacePolicyInput,
  MarketplacePolicy,
  MarketplacePolicyMode,
  PolicyMetadata,
} from "./policy/policy.types";

export {
  attachMarketplacePolicy,
  clearMarketplacePolicies,
  getMarketplacePolicy,
  listMarketplacePolicies,
} from "./policy/policy.registry";

export type { MarketplaceReleaseManifest } from "./manifest/manifest.registry";

export {
  clearMarketplaceReleaseManifests,
  createMarketplaceReleaseManifest,
  getMarketplaceReleaseManifest,
  listMarketplaceReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertMarketplaceFoundationReadinessReady,
  evaluateMarketplaceFoundationReadiness,
} from "./management/management.readiness";

export {
  clearMarketplaceFoundationLayer,
  createMarketplaceManager,
  getMarketplaceRegistryManifest,
  type MarketplaceManager,
  type MarketplaceManagerSnapshot,
} from "./marketplace.manager";

export {
  assertProductMarketplaceReleaseGatePass,
  checkProductMarketplaceReleaseGate,
  PRODUCT_MARKETPLACE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
