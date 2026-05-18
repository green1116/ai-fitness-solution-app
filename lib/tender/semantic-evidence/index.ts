/**
 * V3.1 Semantic Evidence Intelligence Foundation
 *
 * 确定性语义推理基础设施（非 LLM / 非向量 / 非 OCR）
 */
export * from "./types";
export { createSemanticEvidenceContext } from "./context/createSemanticEvidenceContext";
export {
  inferSemanticEvidenceNeeds,
  resetEvidenceNeedSequence,
} from "./inference/inferEvidenceNeeds";
export { buildSemanticEvidenceExecutionGraph } from "./graph/buildSemanticEvidenceGraph";
export {
  resolveLifecycleState,
  lifecycleToCoverageStatus,
} from "./lifecycle/resolveLifecycleState";
export { evaluateSemanticEvidenceCoverage } from "./reasoning/evaluateSemanticCoverage";
export {
  runSemanticEvidenceReasoning,
  type RunSemanticEvidenceReasoningOptions,
} from "./reasoning/runSemanticEvidenceReasoning";
