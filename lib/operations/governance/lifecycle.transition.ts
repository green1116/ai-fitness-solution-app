import type {
  GovernanceLifecycleStatus,
  GovernanceLifecycleTransition,
} from "./lifecycle.types";

const ALLOWED: Record<GovernanceLifecycleStatus, GovernanceLifecycleStatus[]> = {
  created: ["pending", "queued"],
  pending: ["queued", "suspended", "failed"],
  queued: ["running", "suspended", "failed"],
  running: ["waitingApproval", "escalated", "completed", "failed", "suspended"],
  waitingApproval: ["resumed", "failed", "suspended"],
  escalated: ["running", "completed", "failed"],
  suspended: ["resumed", "failed"],
  retrying: ["resumed", "failed"],
  resumed: ["running", "waitingApproval", "completed", "failed"],
  completed: ["archived"],
  archived: [],
  failed: ["retrying"],
};

export function canTransitionLifecycle(
  from: GovernanceLifecycleStatus,
  to: GovernanceLifecycleStatus,
): boolean {
  return ALLOWED[from].includes(to);
}

export function createLifecycleTransition(input: {
  from: GovernanceLifecycleStatus;
  to: GovernanceLifecycleStatus;
  reason: string;
  timestamp: string;
}): GovernanceLifecycleTransition {
  return {
    transitionId: `lct-${input.from}-${input.to}-${Date.now()}`,
    from: input.from,
    to: input.to,
    reason: input.reason,
    timestamp: input.timestamp,
  };
}
