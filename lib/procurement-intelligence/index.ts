/**
 * V43 Procurement Intelligence — Phase 1 skeleton.
 * Read-only extension over V42 Equivalent Product Intelligence Decision Engine.
 */
export * from "./shared/constants";
export * from "./shared/types";

export type {
  EquivalentDecision,
  EquivalentRecommendation,
} from "@/lib/equivalent-product-intelligence";
export { runEquivalentDecisionEngine } from "@/lib/equivalent-product-intelligence";

export * from "./supplier-foundation/supplier-types";
export { buildSupplierRegistry } from "./supplier-foundation/supplier-registry";
export { buildSupplierCapabilityRegistry } from "./supplier-foundation/supplier-capability-registry";
export { validateSupplierFoundation } from "./supplier-foundation/supplier-validation";

export * from "./procurement-matching/procurement-match-types";
export { buildProcurementRequirementLinks } from "./procurement-matching/procurement-requirement-link";
export { buildProcurementSupplierLinks } from "./procurement-matching/procurement-supplier-link";
export {
  buildProcurementMatchContext,
  resolveProductBrandId,
} from "./procurement-matching/procurement-match-context";
export {
  buildProcurementMatches,
  getProcurementMatchContextSummary,
} from "./procurement-matching/procurement-match-builder";
export {
  calculateProcurementMatchScore,
  resolveDecisionFitScore,
} from "./procurement-matching/procurement-match-scoring";
export { validateProcurementMatching } from "./procurement-matching/procurement-match-validation";

export * from "./procurement-decision/procurement-decision-types";
export {
  rankProcurementCandidates,
  rankProcurementCandidatesForRequirement,
} from "./procurement-decision/procurement-ranking";
export { simulateProcurementOutcome } from "./procurement-decision/procurement-simulation";
export {
  buildProcurementRecommendation,
  resolveProcurementDecisionLevel,
} from "./procurement-decision/procurement-recommendation";
export {
  runProcurementDecisionEngine,
  getProcurementDecisionEngineMode,
} from "./procurement-decision/procurement-decision-engine";
export { validateProcurementDecision } from "./procurement-decision/procurement-validation";

export type { SupplierLeadTimeRecord } from "./pricing-availability/supplier-leadtime-registry";
export { buildSupplierPricingRegistry } from "./pricing-availability/supplier-pricing-registry";
export { buildSupplierAvailabilityRegistry } from "./pricing-availability/supplier-availability-registry";
export { buildSupplierLeadTimeRegistry } from "./pricing-availability/supplier-leadtime-registry";
export { buildPricingAvailabilityContext } from "./pricing-availability/pricing-availability-context";
export {
  validatePricingAvailability,
  getPricingAvailabilityContextSummary,
} from "./pricing-availability/pricing-availability-validation";

/** Legacy commercial bundle API (V22/V23 backward compatibility). */
export {
  buildCommercialBundle,
  resolveRegionFromCity,
} from "./bridge/commercial-bridge";
export {
  buildProcurementBundle,
  buildProcurementSnapshot,
} from "./bridge/procurement-bridge";
