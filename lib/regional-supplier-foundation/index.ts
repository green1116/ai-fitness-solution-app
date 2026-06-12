/**
 * V21 Regional Supplier Network Foundation — industry supply chain data assets.
 * Phase 1: supplier / dealer / coverage catalogs.
 * Phase 2: inventory / service catalogs.
 * Phase 3: supplier network bundle aggregation.
 * No Runtime. No Dashboard.
 */

export * from "./shared/types";
export * from "./supplier-catalog";
export * from "./dealer-catalog";
export * from "./coverage-catalog";
export * from "./inventory-catalog";
export * from "./service-catalog";
export * from "./validation";
export * from "./report";
export {
  buildRegionalSupplySnapshot,
  buildSupplierNetworkBundle,
} from "./bridge/supplier-bridge";
export { buildSupplierNetworkEvidence } from "./evidence";
