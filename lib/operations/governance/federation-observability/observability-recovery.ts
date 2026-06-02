import type { FederationRecoveryObservability } from "./observability-types";
import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";
import { clampScore } from "./observability-registry";

export function observeFederationRecovery(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  consensus: ConsensusRuntimeResult;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
}): FederationRecoveryObservability {
  let recoveryActions = 0;
  if (input.federation.recovery.rerouteApplied) recoveryActions += 1;
  if (input.federation.recovery.sharedRecovery) recoveryActions += 1;
  if (input.consensus.recovery.fallbackConsensus) recoveryActions += 1;

  const stabilizationPending = input.lifecycleContinuity.recoveryLifecycle.stabilizationPending;
  const failoverActive = input.federation.recovery.stabilizationAction.includes("failover");

  let recoveryHealthScore = 100;
  if (stabilizationPending) recoveryHealthScore -= 30;
  if (failoverActive) recoveryHealthScore -= 20;
  recoveryHealthScore -= recoveryActions * 10;

  return {
    observabilityId: `recovery-observability-${input.deploymentId}`,
    recoveryActions,
    stabilizationPending,
    failoverActive,
    recoveryHealthScore: clampScore(recoveryHealthScore),
  };
}
