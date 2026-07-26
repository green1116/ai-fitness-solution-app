/**
 * Product API Portal — public exports
 * Isolated namespace: lib/product/api-portal
 */

export {
  PORTAL_CATALOG_STATUSES,
  PORTAL_DOC_KINDS,
  PORTAL_MANAGER_STATUSES,
  PORTAL_READINESS_VERDICTS,
  PORTAL_STATUSES,
  PORTAL_SURFACE_KINDS,
  PRODUCT_API_PORTAL_BASE,
  PRODUCT_API_PORTAL_FREEZE_TAG,
  PRODUCT_API_PORTAL_FREEZE_VERSION,
  PRODUCT_API_PORTAL_ID,
  PRODUCT_API_PORTAL_VERSION,
} from "./management/management.constants";

export type {
  PortalManagerStatus,
  PortalReadinessCheck,
  PortalReadinessResult,
  PortalReadinessVerdict,
  PortalRegistryManifest,
} from "./management/management.types";

export type {
  PortalMetadata,
  PortalStatus,
  ProductPortal,
  RegisterPortalInput,
  UpdatePortalStatusInput,
} from "./registry/portal.types";

export {
  clearPortals,
  getPortal,
  listPortals,
  registerPortal,
  updatePortalStatus,
} from "./registry/portal.registry";

export type {
  PortalDocKind,
  PortalDocMetadata,
  PortalDocument,
  RegisterPortalDocumentInput,
} from "./documentation/documentation.types";

export {
  clearPortalDocuments,
  getPortalDocument,
  listPortalDocuments,
  registerPortalDocument,
} from "./documentation/documentation.registry";

export type {
  PortalCatalogEntry,
  PortalCatalogMetadata,
  PortalCatalogStatus,
  RegisterPortalCatalogEntryInput,
  UpdatePortalCatalogStatusInput,
} from "./catalog/catalog.types";

export {
  clearPortalCatalogEntries,
  getPortalCatalogEntry,
  listPortalCatalogEntries,
  registerPortalCatalogEntry,
  updatePortalCatalogStatus,
} from "./catalog/catalog.registry";

export type {
  PortalSurface,
  PortalSurfaceKind,
  PortalSurfaceMetadata,
  RegisterPortalSurfaceInput,
} from "./surface/surface.types";

export {
  clearPortalSurfaces,
  getPortalSurface,
  listPortalSurfaces,
  registerPortalSurface,
} from "./surface/surface.registry";

export type { ApiPortalReleaseManifest } from "./manifest/manifest.registry";

export {
  clearApiPortalReleaseManifests,
  createApiPortalReleaseManifest,
  getApiPortalReleaseManifest,
  listApiPortalReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertApiPortalReadinessReady,
  evaluateApiPortalReadiness,
} from "./management/management.readiness";

export {
  clearApiPortalLayer,
  createApiPortalManager,
  getApiPortalRegistryManifest,
  type ApiPortalManager,
  type PortalManagerSnapshot,
} from "./api-portal.manager";

export {
  assertProductApiPortalReleaseGatePass,
  checkProductApiPortalReleaseGate,
  PRODUCT_API_PORTAL_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
