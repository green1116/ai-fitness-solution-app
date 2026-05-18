/**
 * V3.2 Semantic Runtime Reasoning Engine
 *
 * 确定性语义运行时决策推理（非 LLM）
 */
export * from "./types";
export { runSemanticRuntimeReasoning } from "./engine/runSemanticRuntimeReasoning";
export { buildSemanticVocabulary } from "./vocabulary/buildSemanticVocabulary";
export { extractRequirementIntents } from "./intent/extractRequirementIntents";
export { buildEvidenceSemanticProfiles } from "./profile/buildEvidenceSemanticProfiles";
export { runSemanticEvidenceMatching } from "./matching/runSemanticEvidenceMatching";
export {
  buildSemanticRuntimeDecision,
  type BuildSemanticRuntimeDecisionInput,
} from "./decision/buildSemanticRuntimeDecision";
