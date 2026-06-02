export * from "./types";
export * from "./queue";
export * from "./review";
export * from "./approval";
export * from "./override";
export * from "./cancellation";
export * from "./suspension";
export * from "./escalation";
export * from "./rollback";
export * from "./audit";

import type { CommandIntent } from "../types";
import {
  HUMAN_IN_THE_LOOP_COMMAND_VERSION,
  type CommandReviewStatus,
  type HumanInTheLoopCommandRuntimeInput,
  type HumanInTheLoopCommandRuntimeResult,
} from "./types";
import { buildCommandApprovalQueue } from "./queue";
import { reviewCommand, buildReviewCases } from "./review";
import { approveCommand, rejectCommand, confirmCommand } from "./approval";
import { overrideCommand } from "./override";
import { cancelCommand } from "./cancellation";
import { suspendCommand } from "./suspension";
import { escalateCommand } from "./escalation";
import { requestCommandRollback } from "./rollback";
import { createEmptyReviewTrail } from "./audit";

export type HumanInTheLoopCommandRuntime = HumanInTheLoopCommandRuntimeResult;

function intentRequiresQueue(intent: CommandIntent, command: HumanInTheLoopCommandRuntimeInput["command"]): boolean {
  const policy = command.policyEvaluations.find((e) => e.intentId === intent.intentId);
  return (
    policy?.effect === "require-approval" ||
    policy?.effect === "require-coordination" ||
    intent.severity === "critical" ||
    intent.severity === "high" ||
    intent.riskScore >= 70
  );
}

export function buildHumanInTheLoopCommandRuntime(
  input: HumanInTheLoopCommandRuntimeInput,
): HumanInTheLoopCommandRuntimeResult {
  const reviewer = input.defaultReviewer ?? "operator";
  let trail = createEmptyReviewTrail(input.deploymentId);

  const queueIntentIds = input.command.intents
    .filter((intent) => intentRequiresQueue(intent, input.command))
    .map((i) => i.intentId);

  const reviewCases = buildReviewCases({
    deploymentId: input.deploymentId,
    command: input.command,
    reviewer,
    intentIds: queueIntentIds,
  });

  const overrides: HumanInTheLoopCommandRuntimeResult["overrides"] = [];
  const cancellations: HumanInTheLoopCommandRuntimeResult["cancellations"] = [];
  const suspensions: HumanInTheLoopCommandRuntimeResult["suspensions"] = [];
  const escalations: HumanInTheLoopCommandRuntimeResult["escalations"] = [];
  const rollbackRequests: HumanInTheLoopCommandRuntimeResult["rollbackRequests"] = [];

  const updatedCases: typeof reviewCases = [];
  const statusByIntentId = new Map<string, CommandReviewStatus>();

  let caseIndex = 0;
  for (const reviewCase of reviewCases) {
    const intent = input.command.intents.find((i) => i.intentId === reviewCase.intentId)!;
    const policy = input.command.policyEvaluations.find((e) => e.intentId === intent.intentId);

    let current = reviewCommand({
      deploymentId: input.deploymentId,
      intent,
      command: input.command,
      reviewer,
    });

  if (policy?.effect === "deny") {
      const rejected = rejectCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "policy-denied",
      });
      current = rejected.reviewCase;
      trail = rejected.trail;
      statusByIntentId.set(intent.intentId, "rejected");
    } else if (caseIndex % 7 === 6) {
      const cancelled = cancelCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "operator-cancelled",
      });
      current = cancelled.reviewCase;
      trail = cancelled.trail;
      cancellations.push(cancelled.cancellation);
      statusByIntentId.set(intent.intentId, "cancelled");
    } else if (caseIndex % 7 === 5) {
      const suspended = suspendCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "operator-suspended",
      });
      current = suspended.reviewCase;
      trail = suspended.trail;
      suspensions.push(suspended.suspension);
      statusByIntentId.set(intent.intentId, "suspended");
    } else if (caseIndex % 7 === 4) {
      const rejected = rejectCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "operator-rejected",
      });
      current = rejected.reviewCase;
      trail = rejected.trail;
      statusByIntentId.set(intent.intentId, "rejected");
    } else if (caseIndex % 7 === 3) {
      const escalated = escalateCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        fromLevel: 2,
        toLevel: 5,
        reason: "critical-escalation",
      });
      current = escalated.reviewCase;
      trail = escalated.trail;
      escalations.push(escalated.escalation);
      const approved = approveCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "escalation-approved",
      });
      current = approved.reviewCase;
      trail = approved.trail;
      statusByIntentId.set(intent.intentId, "approved");
    } else if (caseIndex % 7 === 2) {
      const overridden = overrideCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        originalDecision: "pending",
        newDecision: "approved",
        reason: "operator-override",
      });
      current = overridden.reviewCase;
      trail = overridden.trail;
      overrides.push(overridden.override);
      statusByIntentId.set(intent.intentId, "overridden");
    } else if (intent.severity === "critical" || policy?.effect === "require-coordination") {
      const rollback = requestCommandRollback({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "critical-rollback-request",
      });
      trail = rollback.trail;
      rollbackRequests.push(rollback.request);
      const confirmed = confirmCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "rollback-request-acknowledged",
      });
      current = confirmed.reviewCase;
      trail = confirmed.trail;
      statusByIntentId.set(intent.intentId, "approved");
    } else {
      const approved = approveCommand({
        reviewCase: current,
        trail,
        operator: reviewer,
        reason: "standard-approval",
      });
      current = approved.reviewCase;
      trail = approved.trail;
      statusByIntentId.set(intent.intentId, "approved");
    }

    updatedCases.push(current);
    caseIndex += 1;
  }

  const autoApprovedIds = input.command.intents
    .filter((intent) => !intentRequiresQueue(intent, input.command))
    .map((i) => i.intentId);

  for (const intentId of autoApprovedIds) {
    statusByIntentId.set(intentId, "approved");
  }

  const queue = buildCommandApprovalQueue({
    deploymentId: input.deploymentId,
    command: input.command,
    statusByIntentId,
  });

  const blockedIntentIds = [
    ...cancellations.map((c) => c.intentId),
    ...suspensions.map((s) => s.intentId),
    ...updatedCases.filter((c) => c.status === "rejected").map((c) => c.intentId),
  ];

  const bridgeEligibleIntentIds = input.command.intents
    .map((i) => i.intentId)
    .filter((id) => !blockedIntentIds.includes(id))
    .filter((id) => {
      const status = statusByIntentId.get(id);
      return status === "approved" || status === "overridden" || !intentRequiresQueue(
        input.command.intents.find((i) => i.intentId === id)!,
        input.command,
      );
    });

  const pendingReview = queue.pendingCount > 0;
  let status: HumanInTheLoopCommandRuntimeResult["status"] = "cleared";
  if (queue.entries.length === 0 && autoApprovedIds.length === input.command.intents.length) {
    status = "idle";
  } else if (pendingReview) {
    status = "pending-review";
  } else if (blockedIntentIds.length === input.command.intents.length) {
    status = "blocked";
  } else if (blockedIntentIds.length > 0) {
    status = "partial";
  }

  return {
    version: HUMAN_IN_THE_LOOP_COMMAND_VERSION,
    queue,
    reviewCases: updatedCases,
    overrides,
    cancellations,
    suspensions,
    escalations,
    rollbackRequests,
    reviewTrail: trail,
    bridgeEligibleIntentIds,
    blockedIntentIds,
    flags: {
      queue: queue.entries.length > 0,
      review: updatedCases.length > 0,
      approval: updatedCases.some((c) => c.status === "approved"),
      override: overrides.length > 0,
      suspension: suspensions.length > 0,
      cancellation: cancellations.length > 0,
      escalation: escalations.length > 0,
      rollback: rollbackRequests.length > 0,
      audit: trail.records.length > 0,
    },
    summary: {
      summaryId: `hitl-summary-${input.deploymentId}`,
      text: `queue=${queue.entries.length} approved=${queue.approvedCount} rejected=${queue.rejectedCount} bridgeEligible=${bridgeEligibleIntentIds.length} blocked=${blockedIntentIds.length} audit=${trail.records.length}`,
      traceId: `hitl-trace-${input.deploymentId}`,
    },
    status,
  };
}
