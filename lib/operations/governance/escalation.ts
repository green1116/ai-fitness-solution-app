import type {
  GovernanceApprovalResult,
  GovernanceControlResult,
  GovernanceEscalationResult,
  GovernancePolicyResult,
} from "./types";

export function buildGovernanceEscalation(input: {
  policy: GovernancePolicyResult[];
  controls: GovernanceControlResult[];
  approvals: GovernanceApprovalResult[];
}): GovernanceEscalationResult[] {
  const items: GovernanceEscalationResult[] = [];
  const hasMissingControl = input.controls.some((c) => c.status === "missing");
  if (hasMissingControl) {
    items.push({
      escalationId: "gesc-missing-control",
      triggered: true,
      triggerType: "missingControl",
      severity: "high",
      reason: "At least one required control is missing.",
      target: "releaseManager",
      source: "governance.escalation",
      traceId: "trace-escalation-missing-control",
    });
  }
  for (const p of input.policy.filter((x) => x.action === "needsEscalation")) {
    items.push({
      escalationId: `gesc-${p.recommendationId}`,
      triggered: true,
      triggerType: "thresholdExceeded",
      severity: "high",
      reason: p.reason,
      target: "governanceBoard",
      source: "governance.escalation",
      traceId: `trace-escalation-${p.recommendationId}`,
    });
  }
  return items;
}
