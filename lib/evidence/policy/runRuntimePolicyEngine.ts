import { evaluateRuntimePolicy } from "./evaluateRuntimePolicy";
import type {
  RuntimePolicyEngineResult,
  RuntimePolicyEngineRuntimeInput,
} from "../types";
import { appendPolicyEvent, createPolicyTrace } from "./policyTrace";

/**
 * V3.4-E14 Runtime Policy Engine
 */
export function runRuntimePolicyEngine(
  input: RuntimePolicyEngineRuntimeInput,
): RuntimePolicyEngineResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createPolicyTrace(input.runId);

  trace = appendPolicyEvent(trace, "collect_metrics", "收集 policy 指标");
  trace = appendPolicyEvent(trace, "load_policies", "加载企业治理策略");
  const pkg = evaluateRuntimePolicy(input);
  trace = appendPolicyEvent(trace, "evaluate_rules", `${pkg.triggeredPolicies.length} triggered`);
  trace = appendPolicyEvent(trace, "aggregate_actions", pkg.actions.join(","), {
    blocked: pkg.blocked,
    conditionalRelease: pkg.conditionalRelease,
  });
  trace = appendPolicyEvent(trace, "debug", "生成 policy debug");

  return {
    ...pkg,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    trace,
  };
}
