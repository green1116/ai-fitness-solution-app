import type { AutonomousCommandRuntimeResult, CommandIntent } from "../types";
import type { CommandApprovalQueue, CommandApprovalQueueEntry, CommandReviewStatus } from "./types";

function requiresHumanReview(intent: CommandIntent, command: AutonomousCommandRuntimeResult): boolean {
  const policy = command.policyEvaluations.find((e) => e.intentId === intent.intentId);
  const authority = command.authorityEvaluations.find((e) => e.intentId === intent.intentId);

  if (policy?.effect === "require-approval" || policy?.effect === "require-coordination") return true;
  if (intent.severity === "critical" || intent.severity === "high") return true;
  if (!authority?.authorized) return true;
  if (intent.riskScore >= 70) return true;
  return false;
}

function queueReason(intent: CommandIntent, command: AutonomousCommandRuntimeResult): string {
  const policy = command.policyEvaluations.find((e) => e.intentId === intent.intentId);
  if (policy?.effect === "require-approval") return "policy-require-approval";
  if (policy?.effect === "require-coordination") return "policy-require-coordination";
  if (intent.severity === "critical") return "severity-critical";
  if (intent.riskScore >= 70) return "high-risk-score";
  return "standard-review";
}

export function buildCommandApprovalQueue(input: {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  statusByIntentId?: Map<string, CommandReviewStatus>;
}): CommandApprovalQueue {
  const now = new Date().toISOString();
  const entries: CommandApprovalQueueEntry[] = [];

  for (const intent of input.command.intents) {
    if (!requiresHumanReview(intent, input.command)) continue;

    const status = input.statusByIntentId?.get(intent.intentId) ?? "pending";

    entries.push({
      entryId: `queue-entry-${intent.intentId}`,
      intentId: intent.intentId,
      intentName: intent.name,
      severity: intent.severity,
      priority: intent.priority,
      reason: queueReason(intent, input.command),
      status,
      queuedAt: now,
    });
  }

  const pendingCount = entries.filter((e) => e.status === "pending" || e.status === "in-review").length;
  const approvedCount = entries.filter((e) => e.status === "approved" || e.status === "overridden").length;
  const rejectedCount = entries.filter((e) => e.status === "rejected" || e.status === "cancelled").length;

  return {
    queueId: `command-approval-queue-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    entries,
    pendingCount,
    approvedCount,
    rejectedCount,
  };
}
