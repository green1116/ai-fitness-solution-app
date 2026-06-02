import type { GovernanceLifecycleRetry } from "./lifecycle.types";

export function buildLifecycleRetry(input: {
  attempt: number;
  reason: string;
  timestamp: string;
  escalated?: boolean;
}): GovernanceLifecycleRetry {
  return {
    retryId: `retry-${input.attempt}-${Date.now()}`,
    attempt: input.attempt,
    delayMs: Math.min(30_000, 1_000 * Math.max(1, input.attempt)),
    reason: input.reason,
    escalated: input.escalated ?? false,
    timestamp: input.timestamp,
  };
}
