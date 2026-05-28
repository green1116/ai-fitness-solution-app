import type { GovernancePolicyResult, OperationalGovernanceRuntimeInput } from "./types";

export function buildGovernancePolicy(input: OperationalGovernanceRuntimeInput): GovernancePolicyResult[] {
  const recommendations = input.intelligence?.recommendations ?? [];
  return recommendations.map((rec, idx) => {
    const action =
      rec.priority === "high"
        ? "mustExecute"
        : rec.recommendationType === "escalate"
          ? "needsEscalation"
          : rec.priority === "medium"
            ? "needsApproval"
            : "canDefer";
    return {
      policyId: `gpolicy-${idx + 1}`,
      recommendationId: rec.recommendationId,
      action,
      reason: `Derived from recommendation priority=${rec.priority} type=${rec.recommendationType}.`,
      source: "governance.policy",
      traceId: `trace-policy-${rec.recommendationId}`,
      confidence: rec.confidence,
    };
  });
}
