import { WORKFLOW_STEPS, type WorkflowStepId } from "../workflow/types";
import type { RetryPolicy, RetryRecord } from "./types";

export function buildRetryPolicy(input?: { deploymentId?: string }): RetryPolicy {
  const deploymentId = input?.deploymentId ?? "retry-default";
  return {
    policyId: `retry-policy-${deploymentId}`,
    maxAttempts: 3,
    backoffMs: 2000,
    fallbackRoute: "ai-integration/gateway-stub",
  };
}

export function buildRetryRecords(input?: {
  deploymentId?: string;
  simulateFailure?: WorkflowStepId;
}): RetryRecord[] {
  const deploymentId = input?.deploymentId ?? "retry-default";
  const policy = buildRetryPolicy({ deploymentId });
  const simulateFailure = input?.simulateFailure ?? "proposal-pdf";

  return WORKFLOW_STEPS.map((stepId) => {
    const failed = stepId === simulateFailure;
    const attempt = failed ? 2 : 1;
    const usedFallback = failed;
    return {
      recordId: `retry-${stepId}-${deploymentId}`,
      stepId,
      attempt,
      maxAttempts: policy.maxAttempts,
      usedFallback,
      fallbackRoute: usedFallback ? policy.fallbackRoute : stepId,
      outcome: failed && attempt < policy.maxAttempts ? "pending" : "success",
    };
  });
}

export function shouldRetry(record: RetryRecord, policy: RetryPolicy): boolean {
  return record.outcome === "failed" && record.attempt < policy.maxAttempts;
}
