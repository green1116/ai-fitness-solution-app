import type { FederationLifecyclePhase, FederationRecoveryLifecycleState } from "./continuity-types";
import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

export function buildFederationRecoveryLifecycle(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  consensus: ConsensusRuntimeResult;
  globalPhase: FederationLifecyclePhase;
}): FederationRecoveryLifecycleState {
  const recoveryAction = input.federation.recovery.stabilizationAction;
  const stabilizationPending =
    input.federation.status === "recovering" ||
    input.consensus.recovery.fallbackConsensus ||
    input.consensus.recovery.emergencyMode;

  let phase = input.globalPhase;
  if (stabilizationPending) phase = "recovering";
  else if (input.federation.status === "degraded") phase = "degraded";

  return {
    lifecycleId: `recovery-lifecycle-${input.deploymentId}`,
    phase,
    recoveryAction,
    stabilizationPending,
  };
}
