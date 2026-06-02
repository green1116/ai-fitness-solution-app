import type { GovernanceLifecycleRuntimeInput, GovernanceLifecycleState } from "./lifecycle.types";

export function buildInitialGovernanceLifecycleState(
  input: GovernanceLifecycleRuntimeInput,
): GovernanceLifecycleState {
  return {
    lifecycleId: `glc-${input.deploymentId.slice(0, 10)}`,
    status: "created",
    stepIndex: 0,
    isComplete: false,
    isFailed: false,
    canReplay: true,
  };
}
