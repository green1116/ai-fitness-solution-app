import type { GovernanceLifecycleTransition } from "./lifecycle.types";
import { createLifecycleTransition } from "./lifecycle.transition";

export function buildLifecycleResumeTransition(input: {
  timestamp: string;
  from: "waitingApproval" | "suspended" | "retrying";
  reason: string;
}): GovernanceLifecycleTransition {
  return createLifecycleTransition({
    from: input.from,
    to: "resumed",
    reason: input.reason,
    timestamp: input.timestamp,
  });
}
