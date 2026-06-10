/**
 * V11.2 Proposal PDF Engine — Proposal Package → formal bid document PDF.
 * Decoupled from Plan PDF / Budget PDF / Tender Runtime.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./shared/metadata";
export * from "./cover";
export * from "./sections";
export * from "./toc";
export * from "./assembly";
export * from "./dashboard";
export {
  PROPOSAL_PDF_DOMAINS,
  buildProposalPdfEvidence,
} from "./evidence";
