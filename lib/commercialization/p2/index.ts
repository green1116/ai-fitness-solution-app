/**
 * Commercialization P2 — Product Packaging Foundation public exports
 * Isolated namespace: lib/commercialization/p2
 */

export {
  COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
  COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
  DELIVERY_MODELS,
  DELIVERY_SCOPES,
  PACKAGE_KINDS,
  PACKAGE_STATUSES,
  PACKAGING_MANAGER_STATUSES,
  PACKAGING_READINESS_VERDICTS,
  PRODUCT_STATUSES,
  TIER_LEVELS,
} from "./tier/tier.constants";

export {
  buildTierMatrix,
  getTierEntitlement,
  scoreTierFeatures,
  type TierEntitlement,
} from "./tier/tier.matrix";

export type {
  CatalogProductInput,
  CommercialProduct,
  ProductCatalogEntry,
  ProductStatus,
  RegisterProductInput,
} from "./product/product.types";

export {
  activateProduct,
  clearCommercialProducts,
  getCommercialProduct,
  listCommercialProducts,
  registerProduct,
} from "./product/product.registry";

export {
  catalogProduct,
  clearProductCatalog,
  getProductCatalogEntry,
  listProductCatalog,
} from "./product/product.catalog";

export type {
  ComposePackageInput,
  PackageComposition,
  PackageKind,
  PackageStatus,
  ProductPackage,
  RegisterPackageInput,
  TierLevel,
} from "./package/package.types";

export {
  clearProductPackages,
  getProductPackage,
  listProductPackages,
  markPackageComposed,
  publishPackage,
  registerPackage,
} from "./package/package.registry";

export {
  clearPackageCompositions,
  composePackage,
  getPackageComposition,
  listPackageCompositions,
} from "./package/package.composer";

export type {
  DefineDeliveryModelInput,
  DefineDeliveryScopeInput,
  DeliveryModelKind,
  DeliveryModelProfile,
  DeliveryScopeKind,
  DeliveryScopeProfile,
} from "./delivery/delivery.types";

export {
  clearDeliveryScopes,
  defineDeliveryScope,
  getDeliveryScope,
  listDeliveryScopes,
} from "./delivery/delivery.scope";

export {
  clearDeliveryModels,
  defineDeliveryModel,
  getDeliveryModel,
  listDeliveryModels,
} from "./delivery/delivery.model";

export type {
  PackagingManagerStatus,
  PackagingReadinessCheck,
  PackagingReadinessResult,
  PackagingReadinessVerdict,
  PackagingRegistryManifest,
} from "./packaging.types";

export {
  assertPackagingFoundationReadinessReady,
  evaluatePackagingFoundationReadiness,
} from "./packaging.readiness";

export {
  clearPackagingFoundationLayer,
  createPackagingFoundationManager,
  getPackagingRegistryManifest,
  type PackagingFoundationManager,
  type PackagingFoundationManagerSnapshot,
} from "./packaging.manager";

export {
  assertCommercializationP2ReleaseGatePass,
  checkCommercializationP2ReleaseGate,
  COMMERCIALIZATION_P2_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/commercialization.release.gate";
