/**
 * V19.2 Proposal Differentiation Engine — same tender, different bidder proposals.
 * Runtime bridge to bidder-intelligence, brand-catalog-intelligence, knowledge-base.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export { buildDifferentiationTenderContext } from "./bridge/tender-context";
export * from "./brand-strategy";
export * from "./value-proposition";
export * from "./competitive-advantage";
export * from "./equipment-strategy";
export * from "./budget-strategy";
export * from "./differentiation-profile";
export * from "./dashboard";
export * from "./report";
export {
  PROPOSAL_DIFFERENTIATION_DOMAINS,
  buildProposalDifferentiationEvidence,
} from "./evidence";
