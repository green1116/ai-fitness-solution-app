/**
 * V12 Tender Intelligence Foundation — structured tender project understanding.
 * No real AI; no external knowledge base; decoupled from lib/tender/ production runtime.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export { buildTenderProjectSnapshot } from "./shared/tender-input";
export type { TenderProjectSnapshot } from "./shared/tender-input";
export * from "./classification";
export * from "./scale";
export * from "./risk";
export * from "./equipment";
export * from "./budget";
export * from "./compliance";
export * from "./assembly";
export * from "./dashboard";
export {
  TENDER_INTELLIGENCE_DOMAINS,
  buildTenderIntelligenceEvidence,
} from "./evidence";
