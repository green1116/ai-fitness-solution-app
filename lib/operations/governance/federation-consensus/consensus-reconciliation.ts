import type {
  ConsensusProposal,
  ConsensusProposalType,
  ConsensusReconciliationResult,
  ConsensusResolution,
} from "./consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import { resolveConsensusQuorumThreshold } from "./consensus-registry";

export function buildConsensusProposal(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  proposalType?: ConsensusProposalType;
}): ConsensusProposal {
  const federationId = input.federation.registry.federationId;
  const proposalType = input.proposalType ?? "policy";
  const payload =
    proposalType === "policy"
      ? `propagate:${input.federation.policy.accepted.join(",")}`
      : proposalType === "routing"
        ? `route:${input.federation.routing.routePath.join(">")}`
        : proposalType === "topology"
          ? `topology:${input.federation.topology.domains.length}`
          : `recovery:${input.federation.recovery.stabilizationAction}`;

  return {
    proposalId: `proposal-${input.deploymentId}-${proposalType}`,
    federationId,
    proposalType,
    payload,
    requiredQuorum: resolveConsensusQuorumThreshold(proposalType),
    distributedAt: new Date().toISOString(),
  };
}

export function reconcileFederationConsensus(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  resolution: ConsensusResolution;
}): ConsensusReconciliationResult {
  const policyReconciled =
    input.resolution.decision === "approved" ||
    input.resolution.decision === "approved_with_restrictions";
  const routingReconciled =
    input.federation.routing.status !== "failed" ||
    input.resolution.decision === "recovery_required";
  const topologyReconciled = input.federation.topology.edges.length > 0;
  const recoveryReconciled =
    input.federation.recovery.stabilizationAction.length > 0 &&
    (input.resolution.converged || input.resolution.decision === "recovery_required");

  const checks = [policyReconciled, routingReconciled, topologyReconciled, recoveryReconciled];
  const convergenceScore = checks.filter(Boolean).length / checks.length;

  return {
    reconciliationId: `consensus-reconciliation-${input.deploymentId}`,
    stateReconciled: routingReconciled && topologyReconciled,
    policyReconciled,
    topologyReconciled,
    recoveryReconciled,
    convergenceScore,
    detail: `score=${convergenceScore.toFixed(2)} policy=${policyReconciled} routing=${routingReconciled}`,
  };
}
