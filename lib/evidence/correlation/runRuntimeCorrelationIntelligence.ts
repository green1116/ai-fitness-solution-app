import { buildRuntimeCorrelation } from "./buildRuntimeCorrelation";
import type {
  RuntimeCorrelationIntelligenceResult,
  RuntimeCorrelationIntelligenceRuntimeInput,
} from "../types";
import { appendCorrelationEvent, createCorrelationTrace } from "./correlationTrace";

/**
 * V3.4-E13 Runtime Correlation Intelligence Runtime
 */
export function runRuntimeCorrelationIntelligence(
  input: RuntimeCorrelationIntelligenceRuntimeInput,
): RuntimeCorrelationIntelligenceResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createCorrelationTrace(input.runId);

  trace = appendCorrelationEvent(trace, "collect_runtime_state", "收集各层 runtime 状态");
  const pkg = buildRuntimeCorrelation(input);
  trace = appendCorrelationEvent(trace, "build_dependency_edges", `${pkg.edges.length} edges`);
  trace = appendCorrelationEvent(
    trace,
    "resolve_critical_paths",
    `${pkg.criticalPaths.length} paths`,
  );
  trace = appendCorrelationEvent(
    trace,
    "correlation_warnings",
    `${pkg.correlationWarnings.length} warnings`,
  );
  trace = appendCorrelationEvent(trace, "debug", "生成 correlation debug");

  return {
    ...pkg,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    trace,
  };
}
