import type {
  ApprovalDecision,
  ApprovalGate,
  ApprovalPolicy,
  ChangeAssessment,
  ChangeRequest,
} from "./types";
import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";

export const DEFAULT_APPROVAL_POLICY: ApprovalPolicy = {
  policyId: "change-approval-policy-default",
  name: "autonomous-change-approval-policy",
  autoApproveBelowRisk: "moderate",
  requiresManualAboveRisk: "elevated",
  multiStageThreshold: "high",
};

const RISK_ORDER = ["minimal", "moderate", "elevated", "critical"] as const;

function riskAtOrAbove(risk: ChangeRequest["risk"], threshold: ChangeRequest["risk"]): boolean {
  return RISK_ORDER.indexOf(risk) >= RISK_ORDER.indexOf(threshold);
}

function buildApprovalGates(input: {
  request: ChangeRequest;
  assessment: ChangeAssessment;
  mode: ApprovalDecision["mode"];
  autonomous: GovernanceAutonomousRuntimeResult;
}): ApprovalGate[] {
  const gates: ApprovalGate[] = [
    {
      gateId: `gate-policy-${input.request.requestId}`,
      stage: 1,
      name: "policy-gate",
      required: true,
      passed: input.assessment.approvedForWorkflow,
    },
    {
      gateId: `gate-risk-${input.request.requestId}`,
      stage: 2,
      name: "risk-gate",
      required: input.request.risk !== "minimal",
      passed: input.assessment.risk.score < 80,
    },
    {
      gateId: `gate-rollback-${input.request.requestId}`,
      stage: 3,
      name: "rollback-gate",
      required: input.request.changeType === "recovery" || input.request.changeType === "deployment",
      passed: input.assessment.rollback.rollbackReady,
    },
  ];

  if (input.mode === "multi-stage") {
    gates.push({
      gateId: `gate-executive-${input.request.requestId}`,
      stage: 4,
      name: "executive-gate",
      required: true,
      passed: input.autonomous.approval.status !== "blocked" && input.autonomous.approval.status !== "executive_review",
    });
  }

  return gates;
}

function resolveApprovalMode(
  request: ChangeRequest,
  policy: ApprovalPolicy,
  autonomous: GovernanceAutonomousRuntimeResult,
): ApprovalDecision["mode"] {
  if (autonomous.approval.status === "executive_review") return "multi-stage";
  if (
    request.priority === policy.multiStageThreshold ||
    request.priority === "critical" ||
    riskAtOrAbove(request.risk, policy.requiresManualAboveRisk)
  ) {
    return autonomous.approval.status === "auto_approved" ? "auto" : "manual";
  }
  if (riskAtOrAbove(request.risk, policy.autoApproveBelowRisk)) return "manual";
  return "auto";
}

export function evaluateChangeApprovals(input: {
  deploymentId: string;
  requests: ChangeRequest[];
  assessments: ChangeAssessment[];
  autonomous: GovernanceAutonomousRuntimeResult;
  policy?: ApprovalPolicy;
}): ApprovalDecision[] {
  const policy = input.policy ?? DEFAULT_APPROVAL_POLICY;

  return input.requests.map((request) => {
    const assessment = input.assessments.find((a) => a.requestId === request.requestId);
    if (!assessment) {
      return {
        decisionId: `approval-${request.requestId}`,
        requestId: request.requestId,
        mode: "manual" as const,
        approved: false,
        gates: [],
        reason: "missing-assessment",
        timestamp: new Date().toISOString(),
      };
    }

    const mode = resolveApprovalMode(request, policy, input.autonomous);
    const gates = buildApprovalGates({ request, assessment, mode, autonomous: input.autonomous });

    let approved = gates.filter((g) => g.required).every((g) => g.passed);
    if (input.autonomous.approval.status === "blocked") approved = false;
    if (mode === "auto" && assessment.approvedForWorkflow && input.autonomous.approval.status === "auto_approved") {
      approved = true;
    }
    if (mode === "manual" && input.autonomous.approval.status === "manual_review") approved = false;

    return {
      decisionId: `approval-${request.requestId}`,
      requestId: request.requestId,
      mode,
      approved,
      gates,
      reason: approved ? `approved:${mode}` : `rejected:${mode}`,
      timestamp: new Date().toISOString(),
    };
  });
}
