import type { GovernanceRecoveryAudit, GovernanceRecoveryRuntimeInput, GovernanceRecoveryStrategy } from "./recovery.types";

function action(strategy: GovernanceRecoveryStrategy, success: boolean, reason: string) {
  return {
    actionId: `recovery-action-${strategy}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    strategy,
    success,
    reason,
    timestamp: new Date().toISOString(),
  };
}

export function buildGovernanceRecoveryAudit(input: {
  runtime: GovernanceRecoveryRuntimeInput;
  strategy: GovernanceRecoveryStrategy;
  rollbackExecuted: boolean;
  replayExecuted: boolean;
  partialExecuted: boolean;
  degradedActive: boolean;
}): GovernanceRecoveryAudit {
  return {
    auditId: `recovery-audit-${input.runtime.deploymentId.slice(0, 10)}-${Date.now()}`,
    actions: [
      action(input.strategy, true, "Selected recovery strategy."),
      action("rollback", input.rollbackExecuted, "Rollback path evaluated."),
      action("replay", input.replayExecuted, "Replay recovery evaluated."),
      action("partial", input.partialExecuted, "Partial recovery evaluated."),
      action("degraded", input.degradedActive || !input.degradedActive, "Degraded mode evaluated."),
    ],
  };
}
