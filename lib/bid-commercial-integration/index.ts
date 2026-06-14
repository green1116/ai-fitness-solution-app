/**
 * V23 Bid Commercial Integration — Commercial → Proposal integration layer.
 * Phase 1: read-only aggregation of V20 catalog + V21 supplier + V22 procurement.
 * Phase 2: commercial proposal section builder (equipment / supply chain / procurement / delivery).
 * Phase 3: proposal composer integration (CommercialProposalPack + tender response compatibility).
 * Freeze: commercial proposal freeze manifest, coverage, validation, evidence, reporting.
 * No Runtime. No Dashboard. No V20/V21/V22/PDF Engine modifications.
 */

export * from "./shared/types";
export * from "./validation";
export * from "./report";
export * from "./proposal-sections";
export * from "./proposal-composer-integration";
export * from "./freeze";
export { buildBidCommercialBundle } from "./bridge/commercial-bid-bridge";
export {
  validateBidCommercialBundle,
  validateCommercialProposalSections,
  validateCommercialProposalSectionsFromInput,
} from "./validation/validators";
export {
  buildBidCommercialReport,
  buildCommercialProposalReadinessReport,
} from "./report/builders";
