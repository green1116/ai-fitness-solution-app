import type {
  ChangeClassification,
  ChangePriority,
  ChangeRequest,
  ChangeRisk,
  ChangeScope,
  ChangeType,
} from "./types";

function inferChangeType(action: string): ChangeType {
  const lower = action.toLowerCase();
  if (lower.includes("policy")) return "policy";
  if (lower.includes("rule")) return "rule";
  if (lower.includes("depend")) return "dependency";
  if (lower.includes("version") || lower.includes("migrate")) return "version";
  if (lower.includes("deploy")) return "deployment";
  if (lower.includes("recover") || lower.includes("rollback")) return "recovery";
  if (lower.includes("optim")) return "optimization";
  if (lower.includes("config")) return "configuration";
  return "configuration";
}

function inferPriority(confidence: number): ChangePriority {
  if (confidence >= 85) return "critical";
  if (confidence >= 70) return "high";
  if (confidence >= 50) return "medium";
  return "low";
}

function inferRisk(confidence: number, action: string): ChangeRisk {
  if (action.includes("failover") || confidence < 40) return "critical";
  if (confidence < 55) return "elevated";
  if (confidence < 75) return "moderate";
  return "minimal";
}

function inferScope(changeType: ChangeType): ChangeScope {
  if (changeType === "recovery" || changeType === "deployment") return "federation";
  if (changeType === "policy" || changeType === "rule") return "platform";
  return "domain";
}

export function buildChangeRequests(input: {
  deploymentId: string;
  proposals: {
    proposalId: string;
    action: string;
    rationale: string;
    confidence: number;
  }[];
}): ChangeRequest[] {
  return input.proposals.slice(0, 6).map((proposal) => {
    const changeType = inferChangeType(proposal.action);
    const priority = inferPriority(proposal.confidence);
    const risk = inferRisk(proposal.confidence, proposal.action);

    return {
      requestId: `change-request-${proposal.proposalId}`,
      title: proposal.action,
      description: proposal.rationale,
      changeType,
      priority,
      risk,
      scope: inferScope(changeType),
      owner: "autonomous-agent",
      reason: {
        reasonId: `reason-${proposal.proposalId}`,
        category: changeType === "recovery" ? "recovery" : changeType === "optimization" ? "optimization" : "maintenance",
        description: proposal.rationale,
      },
      sourceProposalId: proposal.proposalId,
      status: "draft",
    };
  });
}

export function classifyChangeRequests(input: {
  deploymentId: string;
  requests: ChangeRequest[];
}): ChangeClassification[] {
  const categoryLabels: Record<ChangeType, string> = {
    configuration: "Configuration Change",
    policy: "Policy Change",
    rule: "Rule Change",
    dependency: "Dependency Change",
    version: "Version Change",
    deployment: "Deployment Change",
    recovery: "Recovery Change",
    optimization: "Optimization Change",
  };

  return input.requests.map((request) => ({
    classificationId: `classification-${request.requestId}`,
    requestId: request.requestId,
    changeType: request.changeType,
    category: categoryLabels[request.changeType],
    tags: [request.scope, request.priority, request.risk],
  }));
}

export { inferChangeType, inferPriority, inferRisk };
