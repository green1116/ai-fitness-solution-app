/**
 * V19.4 Bidder Proposal Composer — orchestrates bidder/brand/equipment/budget/differentiation into full proposals.
 * Runtime bridge to bidder-intelligence, brand-catalog-intelligence, proposal-differentiation, equipment-selection.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export { buildProposalContext, buildAllProposalContexts } from "./bridge/context-bridge";
export * from "./proposal-context";
export * from "./executive-composer";
export * from "./technical-composer";
export * from "./equipment-plan-composer";
export * from "./budget-narrative";
export * from "./competitive-narrative";
export * from "./proposal-variant";
export * from "./proposal-quality";
export * from "./dashboard";
export * from "./report";
export { BIDDER_PROPOSAL_COMPOSER_DOMAINS, buildBidderProposalComposerEvidence } from "./evidence";
