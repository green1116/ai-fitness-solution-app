/**
 * V19.1 Brand & Catalog Intelligence — enriched brand/equipment knowledge assets.
 * Read-only bridge to lib/bidder-intelligence; no production engine modifications.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./brand-intelligence";
export * from "./brand-comparison";
export * from "./equipment-intelligence";
export * from "./equipment-matching";
export * from "./budget-mapping";
export * from "./catalog-coverage";
export * from "./dashboard";
export * from "./report";
export {
  BRAND_CATALOG_INTELLIGENCE_DOMAINS,
  buildBrandCatalogIntelligenceEvidence,
} from "./evidence";
