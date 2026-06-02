import type { AutonomousCommandRuntimeResult, CommandIntent } from "../types";
import type { CommandReviewCase, CommandReviewDecision, CommandReviewStatus } from "./types";

export function reviewCommand(input: {
  deploymentId: string;
  intent: CommandIntent;
  command: AutonomousCommandRuntimeResult;
  reviewer: string;
}): CommandReviewCase {
  const policy = input.command.policyEvaluations.find((e) => e.intentId === input.intent.intentId);
  const authority = input.command.authorityEvaluations.find((e) => e.intentId === input.intent.intentId);

  let status: CommandReviewStatus = "in-review";
  let decision: CommandReviewDecision | null = null;
  let rationale = "awaiting-human-decision";

  if (policy?.effect === "deny" || !authority?.authorized) {
    status = "rejected";
    decision = "reject";
    rationale = "policy-deny-or-unauthorized";
  } else if (policy?.effect === "require-approval" || input.intent.severity === "critical") {
    status = "pending";
    rationale = "requires-explicit-approval";
  } else if (input.intent.severity === "high") {
    status = "pending";
    rationale = "high-severity-review";
  }

  return {
    caseId: `review-case-${input.intent.intentId}`,
    intentId: input.intent.intentId,
    reviewer: input.reviewer,
    status,
    decision,
    rationale,
    openedAt: new Date().toISOString(),
    closedAt: decision ? new Date().toISOString() : null,
  };
}

export function buildReviewCases(input: {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  reviewer: string;
  intentIds: string[];
}): CommandReviewCase[] {
  return input.intentIds
    .map((intentId) => input.command.intents.find((i) => i.intentId === intentId))
    .filter((intent): intent is CommandIntent => !!intent)
    .map((intent) =>
      reviewCommand({
        deploymentId: input.deploymentId,
        intent,
        command: input.command,
        reviewer: input.reviewer,
      }),
    );
}

export function closeReviewCase(
  reviewCase: CommandReviewCase,
  status: CommandReviewStatus,
  decision: CommandReviewDecision,
  rationale: string,
): CommandReviewCase {
  return {
    ...reviewCase,
    status,
    decision,
    rationale,
    closedAt: new Date().toISOString(),
  };
}
