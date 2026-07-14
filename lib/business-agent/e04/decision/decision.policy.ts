/**
 * E04-P4 — Decision Policy Evaluation
 */

import type {
  DecisionFacts,
  DecisionPolicyCondition,
  DecisionPolicyEvaluation,
  DecisionPolicyRule,
} from "./decision.types";

function readFact(facts: DecisionFacts, field: string): unknown {
  return facts[field];
}

export function evaluateCondition(
  condition: DecisionPolicyCondition,
  facts: DecisionFacts,
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

export function evaluatePolicyRule(
  rule: DecisionPolicyRule,
  facts: DecisionFacts,
): DecisionPolicyEvaluation {
  const failedFields: string[] = [];
  for (const condition of rule.conditions) {
    if (!evaluateCondition(condition, facts)) {
      failedFields.push(condition.field);
    }
  }

  const matched = failedFields.length === 0 && rule.conditions.length > 0;

  return {
    policyId: rule.id,
    matched,
    outcome: matched ? rule.onMatch : undefined,
    failedFields,
    readOnly: true,
  };
}

export function selectOutcomeFromPolicies(
  rules: DecisionPolicyRule[],
  facts: DecisionFacts,
  defaultOutcome: DecisionPolicyRule["onMatch"],
): {
  outcome: DecisionPolicyRule["onMatch"];
  matchedPolicyId?: string;
  evaluations: DecisionPolicyEvaluation[];
} {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);
  const evaluations = sorted.map((rule) => evaluatePolicyRule(rule, facts));
  const matched = evaluations.find((e) => e.matched);

  return {
    outcome: matched?.outcome ?? defaultOutcome,
    matchedPolicyId: matched?.policyId,
    evaluations,
  };
}
