import type { AutonomousCommandRuntimeResult, CommandIntent } from "../types";
import type { HumanInTheLoopCommandRuntimeResult } from "../hitl/types";
import type { BridgeEligibilityProfile, EligibilityReason } from "./types";

function resolveReviewStatus(
  intentId: string,
  hitl: HumanInTheLoopCommandRuntimeResult,
): string | null {
  const reviewCase = hitl.reviewCases.find((c) => c.intentId === intentId);
  if (reviewCase) return reviewCase.status;
  const queueEntry = hitl.queue.entries.find((e) => e.intentId === intentId);
  if (queueEntry) return queueEntry.status;
  return null;
}

function reasonFromHitlState(input: {
  intent: CommandIntent;
  hitl: HumanInTheLoopCommandRuntimeResult;
  command: AutonomousCommandRuntimeResult;
}): { eligible: boolean; reason: EligibilityReason } {
  const { intent, hitl, command } = input;
  const policy = command.policyEvaluations.find((e) => e.intentId === intent.intentId);

  if (policy?.effect === "deny" || !policy?.allowed) {
    return { eligible: false, reason: "policy-denied" };
  }

  if (hitl.blockedIntentIds.includes(intent.intentId)) {
    const cancelled = hitl.cancellations.some((c) => c.intentId === intent.intentId);
    const suspended = hitl.suspensions.some((s) => s.intentId === intent.intentId);
    const rejected = hitl.reviewCases.some(
      (c) => c.intentId === intent.intentId && c.status === "rejected",
    );
    if (cancelled) return { eligible: false, reason: "cancelled" };
    if (suspended) return { eligible: false, reason: "suspended" };
    if (rejected) return { eligible: false, reason: "rejected" };
    return { eligible: false, reason: "rejected" };
  }

  const reviewCase = hitl.reviewCases.find((c) => c.intentId === intent.intentId);
  const rollbackPending = hitl.rollbackRequests.some(
    (r) => r.intentId === intent.intentId && r.status === "pending",
  );

  if (rollbackPending && reviewCase?.status !== "approved" && reviewCase?.status !== "overridden") {
    return { eligible: false, reason: "rollback-request-pending" };
  }

  if (hitl.rollbackRequests.some((r) => r.intentId === intent.intentId)) {
    if (hitl.bridgeEligibleIntentIds.includes(intent.intentId)) {
      return { eligible: true, reason: "rollback-request-cleared" };
    }
  }

  if (reviewCase?.status === "pending" || reviewCase?.status === "in-review") {
    return { eligible: false, reason: "pending-review" };
  }

  if (reviewCase?.status === "overridden") {
    return { eligible: true, reason: "overridden" };
  }

  if (reviewCase?.status === "escalated" && hitl.bridgeEligibleIntentIds.includes(intent.intentId)) {
    return { eligible: true, reason: "escalated-approved" };
  }

  if (reviewCase?.status === "approved") {
    return { eligible: true, reason: "approved" };
  }

  if (hitl.bridgeEligibleIntentIds.includes(intent.intentId)) {
    const inQueue = hitl.queue.entries.some((e) => e.intentId === intent.intentId);
    if (!inQueue) return { eligible: true, reason: "auto-cleared" };
    return { eligible: true, reason: "approved" };
  }

  const inQueue = hitl.queue.entries.some((e) => e.intentId === intent.intentId);
  if (!inQueue) return { eligible: true, reason: "not-queued" };

  return { eligible: false, reason: "pending-review" };
}

export function evaluateBridgeEligibility(input: {
  deploymentId: string;
  intent: CommandIntent;
  command: AutonomousCommandRuntimeResult;
  hitl: HumanInTheLoopCommandRuntimeResult;
}): BridgeEligibilityProfile {
  const { eligible, reason } = reasonFromHitlState({
    intent: input.intent,
    hitl: input.hitl,
    command: input.command,
  });

  return {
    profileId: `eligibility-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    eligible,
    reason,
    reviewStatus: resolveReviewStatus(input.intent.intentId, input.hitl),
    hitlCleared: input.hitl.bridgeEligibleIntentIds.includes(input.intent.intentId),
  };
}

export function evaluateBridgeEligibilities(input: {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  hitl: HumanInTheLoopCommandRuntimeResult;
}): BridgeEligibilityProfile[] {
  return input.command.intents.map((intent) =>
    evaluateBridgeEligibility({
      deploymentId: input.deploymentId,
      intent,
      command: input.command,
      hitl: input.hitl,
    }),
  );
}
