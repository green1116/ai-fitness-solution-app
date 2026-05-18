import type {
  BuildRuntimePolicyInput,
  RuntimePolicyPackage,
  RuntimePolicyResult,
  RuntimePolicyRule,
} from "../types";
import { RUNTIME_POLICY_ENGINE_VERSION } from "../types";
import { formatRuntimePolicyDebug } from "../debug/runtimePolicyDebug";
import { buildPolicyMetrics } from "./buildPolicyMetrics";
import { DEFAULT_ENTERPRISE_RUNTIME_POLICIES } from "./defaultPolicies";
import type {
  RuntimePolicyMetrics,
  RuntimePolicyOperator,
} from "../types";

function compare(
  operator: RuntimePolicyOperator,
  actual: number | boolean | string,
  expected: number | boolean | string,
): boolean {
  if (typeof actual === "boolean" || typeof expected === "boolean") {
    const a = actual === true || actual === "true" || actual === 1;
    const e = expected === true || expected === "true" || expected === 1;
    if (operator === "eq") return a === e;
    if (operator === "neq") return a !== e;
    return false;
  }

  if (typeof actual === "string" || typeof expected === "string") {
    const a = String(actual);
    const e = String(expected);
    if (operator === "eq") return a === e;
    if (operator === "neq") return a !== e;
    return false;
  }

  const a = Number(actual);
  const e = Number(expected);
  if (Number.isNaN(a) || Number.isNaN(e)) return false;

  switch (operator) {
    case "lt":
      return a < e;
    case "lte":
      return a <= e;
    case "gt":
      return a > e;
    case "gte":
      return a >= e;
    case "eq":
      return a === e;
    case "neq":
      return a !== e;
    default:
      return false;
  }
}

function ruleTriggered(rule: RuntimePolicyRule, metrics: RuntimePolicyMetrics): boolean {
  const actual = metrics[rule.metric];
  if (actual === undefined) return false;
  return compare(rule.operator, actual, rule.value);
}

function actionWarning(rule: RuntimePolicyRule): string {
  return `[${rule.id}] ${rule.metric} ${rule.operator} ${String(rule.value)} → ${rule.action}`;
}

function aggregatePolicyResult(triggered: RuntimePolicyRule[]): RuntimePolicyResult {
  const triggeredPolicies = triggered.map((r) => r.id);
  const actions = [...new Set(triggered.map((r) => r.action))];
  const warnings = triggered.map(actionWarning);

  const blocked = actions.includes("block-release");
  const conditionalRelease =
    !blocked && actions.includes("conditional-release");
  const executiveReviewRequired = actions.includes("require-executive-review");

  return {
    triggeredPolicies,
    actions,
    blocked,
    conditionalRelease,
    executiveReviewRequired,
    warnings: [...new Set(warnings)],
  };
}

/**
 * V3.4-E14 — 确定性 Runtime Policy Engine
 */
export function evaluateRuntimePolicy(
  input: BuildRuntimePolicyInput,
): RuntimePolicyPackage {
  const metrics = buildPolicyMetrics(input);
  const rules = input.policies?.length
    ? input.policies
    : DEFAULT_ENTERPRISE_RUNTIME_POLICIES;

  const triggered = rules.filter((rule) => ruleTriggered(rule, metrics));
  const aggregated = aggregatePolicyResult(triggered);

  const debug = formatRuntimePolicyDebug({
    metrics,
    triggeredPolicies: aggregated.triggeredPolicies,
    actions: aggregated.actions,
    blocked: aggregated.blocked,
    warnings: aggregated.warnings,
  });

  return {
    version: RUNTIME_POLICY_ENGINE_VERSION,
    ...aggregated,
    metrics,
    rulesEvaluated: rules.length,
    debug,
  };
}
