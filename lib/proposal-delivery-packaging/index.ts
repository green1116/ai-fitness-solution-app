/**
 * V19.5 Proposal Delivery Packaging — deliverable, explainable, auditable proposal packages.
 * Runtime bridge to bidder-proposal-composer, proposal-differentiation, equipment-selection.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export { buildPackagingContext, buildAllPackagingContexts } from "./bridge/packaging-bridge";
export * from "./budget-justification";
export * from "./lifecycle-cost";
export * from "./maintenance-narrative";
export * from "./roi-narrative";
export * from "./tco-runtime";
export * from "./proposal-delivery-package";
export * from "./delivery-readiness";
export * from "./dashboard";
export * from "./report";
export { PROPOSAL_DELIVERY_PACKAGING_DOMAINS, buildProposalDeliveryPackagingEvidence } from "./evidence";
