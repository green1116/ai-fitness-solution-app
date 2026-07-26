/**
 * Product Marketplace Surface — public exports
 * Isolated namespace: lib/product/marketplace-surface
 */

export {
  PRODUCT_MARKETPLACE_SURFACE_BASE,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_TAG,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_SURFACE_ID,
  PRODUCT_MARKETPLACE_SURFACE_VERSION,
  SURFACE_CATALOG_KINDS,
  SURFACE_CATALOG_STATUSES,
  SURFACE_LISTING_STATUSES,
  SURFACE_MANAGER_STATUSES,
  SURFACE_PLACEMENT_KINDS,
  SURFACE_READINESS_VERDICTS,
  SURFACE_VISIBILITY_MODES,
} from "./management/management.constants";

export type {
  MarketplaceSurfaceRegistryManifest,
  SurfaceManagerStatus,
  SurfaceReadinessCheck,
  SurfaceReadinessResult,
  SurfaceReadinessVerdict,
} from "./management/management.types";

export type {
  CatalogMetadata,
  MarketplaceSurfaceCatalog,
  RegisterSurfaceCatalogInput,
  SurfaceCatalogKind,
  SurfaceCatalogStatus,
  UpdateSurfaceCatalogStatusInput,
} from "./catalog/catalog.types";

export {
  clearSurfaceCatalogs,
  getSurfaceCatalog,
  listSurfaceCatalogs,
  registerSurfaceCatalog,
  updateSurfaceCatalogStatus,
} from "./catalog/catalog.registry";

export type {
  ListingMetadata,
  MarketplaceSurfaceListing,
  RegisterSurfaceListingInput,
  SurfaceListingStatus,
  UpdateSurfaceListingStatusInput,
} from "./listing/listing.types";

export {
  clearSurfaceListings,
  getSurfaceListing,
  listSurfaceListings,
  registerSurfaceListing,
  updateSurfaceListingStatus,
} from "./listing/listing.registry";

export type {
  AttachSurfaceVisibilityInput,
  MarketplaceSurfaceVisibility,
  SurfaceVisibilityMode,
  VisibilityMetadata,
} from "./visibility/visibility.types";

export {
  attachSurfaceVisibility,
  clearSurfaceVisibilities,
  getSurfaceVisibility,
  listSurfaceVisibilities,
} from "./visibility/visibility.registry";

export type {
  MarketplaceSurfacePlacement,
  PlacementMetadata,
  RegisterSurfacePlacementInput,
  SurfacePlacementKind,
} from "./placement/placement.types";

export {
  clearSurfacePlacements,
  getSurfacePlacement,
  listSurfacePlacements,
  registerSurfacePlacement,
} from "./placement/placement.registry";

export type { MarketplaceSurfaceReleaseManifest } from "./manifest/manifest.registry";

export {
  clearMarketplaceSurfaceReleaseManifests,
  createMarketplaceSurfaceReleaseManifest,
  getMarketplaceSurfaceReleaseManifest,
  listMarketplaceSurfaceReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertMarketplaceSurfaceReadinessReady,
  evaluateMarketplaceSurfaceReadiness,
} from "./management/management.readiness";

export {
  clearMarketplaceSurfaceLayer,
  createMarketplaceSurfaceManager,
  getMarketplaceSurfaceRegistryManifest,
  type MarketplaceSurfaceManager,
  type MarketplaceSurfaceManagerSnapshot,
} from "./marketplace-surface.manager";

export {
  assertProductMarketplaceSurfaceReleaseGatePass,
  checkProductMarketplaceSurfaceReleaseGate,
  PRODUCT_MARKETPLACE_SURFACE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
