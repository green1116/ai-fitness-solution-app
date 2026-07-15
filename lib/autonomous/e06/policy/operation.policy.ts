/**
 * E06-P1 — Operation Policy Evaluation
 */

import type {
  OperationPolicyCondition,
  OperationPolicyDefinition,
  OperationPolicyEvaluation,
  OperationPolicyResult,
} from "../core/operation.types";

export type OperationFacts = Readonly<Record<string, unknown>>;

function readFact(facts: OperationFacts, field: string): unknown {
  return facts[field];
}

export function evaluateOperationCondition(
  condition: OperationPolicyCondition,
  facts: OperationFacts,
): boolean {
  const actual = readFact(facts, condition.field);

  switch (condition.op) {
    case "eq":
      return actual === condition.value;
    case "neq":
      return actual !== condition.value;
    case "gte":
      return (
        typeof actual === "number" &&
        typeof condition.value === "number" &&
        actual >= condition.value
      );
    case "lte":
      return (
        typeof actual === "number" &&
        typeof condition.value === "number" &&
        actual <= condition.value
      );
    case "truthy":
      return Boolean(actual);
    case "falsy":
      return !actual;
    default:
      return false;
  }
}

export function evaluateOperationPolicy(
  policy: OperationPolicyDefinition,
  facts: OperationFacts,
): OperationPolicyEvaluation {
  const failedFields: string[] = [];
  for (const condition of policy.conditions) {
    if (!evaluateOperationCondition(condition, facts)) {
      failedFields.push(condition.field);
    }
  }

  const matched = failedFields.length === 0 && policy.conditions.length > 0;

  return {
    policyId: policy.id,
    matched,
    effect: matched ? policy.onMatch : undefined,
    failedFields,
    readOnly: true,
  };
}

export function selectOperationPolicyEffect(
  policies: OperationPolicyDefinition[],
  facts: OperationFacts,
  defaultEffect: OperationPolicyDefinition["onMatch"] = "allow",
): OperationPolicyResult {
  const sorted = [...policies].sort((a, b) => b.priority - a.priority);
  const evaluations = sorted.map((policy) =>
    evaluateOperationPolicy(policy, facts),
  );
  const matched = evaluations.find((e) => e.matched);
  const effect = matched?.effect ?? defaultEffect;

  return {
    effect,
    matchedPolicyId: matched?.policyId,
    evaluations,
    allowed: effect !== "deny",
    readOnly: true,
  };
}
