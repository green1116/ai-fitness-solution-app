/**
 * V19.3 Equipment Selection Engine — model-level equipment packages per bidder.
 * Runtime bridge to brand-catalog-intelligence and bidder-intelligence.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export { buildCatalogModels, buildSelectionTenderContext, getBrandPackageConfig } from "./bridge/catalog-bridge";
export * from "./equipment-requirement";
export * from "./model-selection";
export * from "./equipment-package";
export * from "./compatibility";
export * from "./equipment-differentiation";
export * from "./budget-package";
export * from "./dashboard";
export * from "./report";
export { EQUIPMENT_SELECTION_DOMAINS, buildEquipmentSelectionEvidence } from "./evidence";
