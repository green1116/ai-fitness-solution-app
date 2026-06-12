/**
 * V20 Real Catalog Foundation — industry-real brand, equipment, pricing, maintenance, replacement data assets.
 * No Runtime. No Dashboard. Data-first commercial moat.
 */

export * from "./shared/types";
export * from "./brand-catalog";
export * from "./equipment-catalog";
export * from "./pricing-catalog";
export * from "./maintenance-catalog";
export * from "./replacement-catalog";
export * from "./validation";
export * from "./report";
export {
  buildRealCatalogBundle,
  buildRealCatalogBundleByBrand,
  getRealCatalogSummary,
} from "./bridge/catalog-bridge";
export { REAL_CATALOG_DOMAINS, buildRealCatalogFoundationEvidence } from "./evidence";
