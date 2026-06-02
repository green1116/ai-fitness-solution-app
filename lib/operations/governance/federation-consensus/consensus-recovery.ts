import type {
  ConsensusQuorumResult,
  ConsensusRecoveryCoordination,
  ConsensusResolution,
} from "./consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

export function coordinateConsensusRecovery(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  quorum: ConsensusQuorumResult;
  resolution: ConsensusResolution;
}): ConsensusRecoveryCoordination {
  const needsRecovery =
    !input.quorum.quorumReached ||
    input.quorum.consensusDecision === "recovery_required" ||
    input.federation.status === "recovering" ||
    input.federation.recovery.rerouteApplied;

  const degradedQuorum = !input.quorum.quorumReached && input.quorum.approvalRate >= 0.5;

  let stabilizationAction = "consensus-stable";
  let fallbackConsensus = false;
  let emergencyMode = false;

  if (input.quorum.consensusDecision === "rejected") {
    stabilizationAction = "restricted-governance-continuity";
    fallbackConsensus = true;
  } else if (input.quorum.consensusDecision === "recovery_required" || needsRecovery) {
    stabilizationAction = "fallback-consensus-mode";
    fallbackConsensus = true;
    emergencyMode = input.federation.routing.status === "failed";
  } else if (input.quorum.consensusDecision === "approved_with_restrictions") {
    stabilizationAction = "partial-federation-agreement";
  } else if (input.federation.recovery.stabilizationAction.includes("failover")) {
    stabilizationAction = "federation-recovery-consensus";
    fallbackConsensus = true;
  }

  return {
    recoveryId: `consensus-recovery-${input.deploymentId}`,
    trigger: needsRecovery ? "consensus-failure" : "quorum-stable",
    fallbackConsensus,
    emergencyMode,
    degradedQuorum,
    stabilizationAction,
  };
}
