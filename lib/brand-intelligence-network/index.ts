/**
 * V38 Brand Intelligence Network — read-only extension over V30–V37.
 * No V20–V37 frozen module modifications.
 */
export * from "./shared/types";
export * from "./brand-engine-compat";
export * from "./brand-scoring";
export * from "./brand-alias";
export {
  buildBrandRegistryRecords,
  buildBrandRegistry,
  registerBrand,
  updateBrand,
  findBrandById,
  findBrandByNameOrAlias,
  findBrands as findBrandRecords,
  findBrandsByTier as findBrandRecordsByTier,
  findBrandsBySector as findBrandRecordsBySector,
  validateBrandRegistry,
  validateBrandManufacturerRelations,
} from "./brand-registry";
export * from "./manufacturer-registry";
export * from "./brand-context";
export * from "./brand-mapping/brand-link-registry";
export * from "./brand-mapping/supplier-link-registry";
export * from "./brand-mapping/sku-link-registry";
export * from "./brand-mapping/authorization-link-registry";
export {
  buildBrandNetworkContext,
  enrichBrandWithNetworkLinks,
  matchBrandToSupplier,
  matchBrandToSku as matchBrandToSkuByBrand,
  matchBrandToCatalog as matchBrandToCatalogFromNetwork,
  matchAuthorizedBrands,
  findTopBrands as findTopBrandRecords,
  validateBrandNetworkContext,
} from "./brand-network-context";
export * from "./evidence-link/evidence-link-builder";
export * from "./evidence-link/evidence-link-registry";
export * from "./tender-stub/tender-brand-stub";
export * from "./brand-query";
export * from "./brand-matcher";
export * from "./brand-decision/decision-context";
export * from "./brand-decision/proposal-brand-decision";
export * from "./brand-validation";
