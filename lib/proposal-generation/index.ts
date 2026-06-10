/**
 * V11 AI Proposal Generation Foundation — Tender Parse → Proposal description layer.
 * No real AI/OpenAI calls; does not modify Plan/Budget/Tender/ZIP engines.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export { buildTenderParseSnapshot } from "./shared/tender-input";
export type { TenderParseSnapshot, TenderRequirementSnapshot } from "./shared/tender-input";
export * from "./executive-summary";
export * from "./technical-proposal";
export * from "./implementation-plan";
export * from "./risk-analysis";
export * from "./delivery-schedule";
export * from "./compliance-matrix";
export * from "./assembly";
export * from "./dashboard";
export {
  PROPOSAL_GENERATION_DOMAINS,
  buildProposalGenerationEvidence,
} from "./evidence";
