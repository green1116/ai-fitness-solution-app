/**
 * V19 Bidder Intelligence Foundation — profile/brand/catalog/supplier/personalization.
 * Bridges Tender context to proposal differentiation without modifying production engines.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./bidder-profile";
export * from "./brand-library";
export * from "./equipment-catalog";
export * from "./supplier-capability";
export * from "./proposal-personalization";
export * from "./dashboard";
export { BIDDER_INTELLIGENCE_DOMAINS, buildBidderIntelligenceEvidence } from "./evidence";
