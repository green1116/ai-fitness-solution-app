import type {
  SemanticEvidenceContext,
  SemanticEvidenceIntelligenceInput,
} from "../types";

function newContextId() {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * V3.1 创建语义证据运行时上下文
 */
export function createSemanticEvidenceContext(
  input: SemanticEvidenceIntelligenceInput,
): SemanticEvidenceContext {
  return {
    contextId: newContextId(),
    createdAt: new Date().toISOString(),
    graph: input.graph,
    registry: input.registry,
    sourceName: input.sourceName ?? null,
  };
}
