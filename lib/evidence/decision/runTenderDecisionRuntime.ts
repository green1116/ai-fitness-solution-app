import type { TenderDecisionResult, TenderDecisionRuntimeInput } from "../types";
import { TENDER_DECISION_RUNTIME_VERSION } from "../types";
import { buildDecisionFactors, buildDecisionInputsSnapshot } from "./buildDecisionFactors";
import { appendDecisionEvent, createDecisionTrace } from "./decisionTrace";
import {
  computeDecisionConfidence,
  resolveTenderDecisionStatus,
} from "./resolveDecisionStatus";

/**
 * V3.4-E7 Tender Decision Runtime
 *
 * Coverage → Validation → Audit → Decision → Tender Decision Result
 */
export function runTenderDecisionRuntime(
  input: TenderDecisionRuntimeInput,
): TenderDecisionResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createDecisionTrace(input.runId);

  trace = appendDecisionEvent(trace, "collect_inputs", "收集决策输入快照");
  const inputs = buildDecisionInputsSnapshot(input);
  trace = appendDecisionEvent(trace, "collect_inputs", "输入就绪", inputs);

  trace = appendDecisionEvent(trace, "build_factors", "构建决策因子");
  const factors = buildDecisionFactors(input);
  trace = appendDecisionEvent(trace, "build_factors", `${factors.length} 个因子`, {
    critical: factors.filter((f) => f.severity === "critical").length,
  });

  trace = appendDecisionEvent(trace, "resolve_status", "解析决策状态");
  const resolved = resolveTenderDecisionStatus({
    factors,
    inputs,
    policy: input.policy,
  });
  const confidence = computeDecisionConfidence(resolved.status, factors, inputs);

  trace = appendDecisionEvent(trace, "finalize", `决策 ${resolved.status}`, {
    confidence,
  });

  return {
    version: TENDER_DECISION_RUNTIME_VERSION,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    documentId: input.documentId,
    status: resolved.status,
    title: resolved.title,
    message: resolved.message,
    confidence,
    factors,
    reasons: resolved.reasons,
    recommendedActions: resolved.recommendedActions,
    inputs,
    trace,
  };
}
