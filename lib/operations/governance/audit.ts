import type {
  GovernanceApprovalResult,
  GovernanceAuditTrail,
  GovernanceControlResult,
  GovernanceEscalationResult,
  GovernancePolicyResult,
} from "./types";

export function buildGovernanceAuditTrail(input: {
  observedAt: string;
  policy: GovernancePolicyResult[];
  controls: GovernanceControlResult[];
  approvals: GovernanceApprovalResult[];
  escalation: GovernanceEscalationResult[];
}): GovernanceAuditTrail {
  return {
    auditId: `gaudit-${input.observedAt.slice(0, 10)}`,
    inputSource: "operational-intelligence-runtime",
    decisionBasis: input.policy.map((p) => p.reason),
    controlsApplied: input.controls.map((c) => c.controlId),
    approvals: input.approvals.map((a) => `${a.approvalId}:${a.status}`),
    escalationPath: input.escalation.map((e) => `${e.target}:${e.reason}`),
    finalStatus: input.escalation.length > 0 ? "escalated" : "governed",
    observedAt: input.observedAt,
  };
}
