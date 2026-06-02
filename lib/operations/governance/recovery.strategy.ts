import type { GovernanceRecoveryRuntimeInput, GovernanceRecoveryStrategy } from "./recovery.types";

export function selectGovernanceRecoveryStrategy(
  input: GovernanceRecoveryRuntimeInput,
): GovernanceRecoveryStrategy {
  const lifecycleFailed = input.lifecycle.state.isFailed;
  const lifecycleNeedsManual = input.lifecycle.state.status === "waitingApproval";
  const storeIncomplete =
    input.store.loaded.snapshot === null || input.store.loaded.checkpoint === null;

  if (lifecycleFailed) return "rollback";
  if (storeIncomplete) return "replay";
  if (lifecycleNeedsManual) return "manualIntervention";
  if (input.lifecycle.state.status === "archived") return "partial";
  return "retry";
}
