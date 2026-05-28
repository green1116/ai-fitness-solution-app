import type { GovernanceApprovalResult, GovernancePolicyResult } from "./types";

export function buildGovernanceApprovals(policy: GovernancePolicyResult[]): GovernanceApprovalResult[] {
  return policy.map((p, idx) => {
    const required = p.action === "needsApproval" || p.action === "needsEscalation";
    return {
      approvalId: `gapp-${idx + 1}`,
      recommendationId: p.recommendationId,
      required,
      reason: required ? p.reason : "No manual gate required.",
      approverRole: p.action === "needsEscalation" ? "governanceBoard" : "opsLead",
      status: required ? "required" : "not-required",
      source: "governance.approvals",
      traceId: `trace-approval-${p.recommendationId}`,
    };
  });
}
