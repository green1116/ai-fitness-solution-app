import {
  GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION,
  type ConsensusRuntimeInput,
  type ConsensusRuntimeResult,
  type ConsensusRuntimeStatus,
} from "./consensus-types";
import { buildFederationConsensusNodes } from "./consensus-node";
import { buildConsensusProposal, reconcileFederationConsensus } from "./consensus-reconciliation";
import { runConsensusVoting } from "./consensus-voting";
import { evaluateConsensusQuorum } from "./consensus-quorum";
import { resolveConsensusDecision } from "./consensus-resolution";
import { convergeConsensusState } from "./consensus-state";
import { coordinateConsensusRecovery } from "./consensus-recovery";
import { buildConsensusLineageGraph } from "./consensus-lineage";
import { buildConsensusAuditRecords } from "./consensus-audit";
import { runConsensusGovernanceHooks } from "./consensus-hooks";

export function buildGovernanceFederationConsensusRuntime(
  input: ConsensusRuntimeInput,
): ConsensusRuntimeResult {
  const federation = input.federation;
  const nodes = buildFederationConsensusNodes(
    federation.topology.domains,
    federation.topology.nodes,
  );
  const proposal = buildConsensusProposal({
    deploymentId: input.deploymentId,
    federation,
    proposalType: input.proposalType,
  });
  const votes = runConsensusVoting({ proposal, nodes, federation });
  const quorum = evaluateConsensusQuorum({
    proposalId: proposal.proposalId,
    votes,
    nodes,
    requiredQuorum: proposal.requiredQuorum,
  });
  const resolution = resolveConsensusDecision({ deploymentId: input.deploymentId, quorum });
  const reconciliation = reconcileFederationConsensus({
    deploymentId: input.deploymentId,
    federation,
    resolution,
  });
  const convergence = convergeConsensusState({
    deploymentId: input.deploymentId,
    federation,
    resolution,
    reconciliation,
  });
  const recovery = coordinateConsensusRecovery({
    deploymentId: input.deploymentId,
    federation,
    quorum,
    resolution,
  });
  const lineage = buildConsensusLineageGraph({
    deploymentId: input.deploymentId,
    votes,
    quorum,
    reconciliation,
    convergence,
    recovery,
  });
  const federationId = federation.registry.federationId;
  const audit = buildConsensusAuditRecords({
    federationId,
    quorum,
    resolution,
    reconciliation,
  });
  const hooks = runConsensusGovernanceHooks({
    votes,
    quorum,
    reconciliation,
    recovery,
  });

  let status: ConsensusRuntimeStatus = "converged";
  if (recovery.fallbackConsensus || recovery.emergencyMode) status = "recovering";
  else if (convergence.partialAgreement) status = "partial";
  else if (resolution.decision === "rejected") status = "failed";
  else if (!convergence.converged) status = "partial";

  const consensusId = `consensus-${input.deploymentId}`;
  const traceId = `consensus-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION,
    registry: {
      consensusId,
      nodeCount: nodes.length,
      proposalCount: 1,
    },
    nodes,
    proposal,
    votes,
    quorum,
    resolution,
    reconciliation,
    convergence,
    recovery,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `consensus-summary-${Date.now()}`,
      text: `consensus=${consensusId} nodes=${nodes.length} quorum=${quorum.quorumReached} decision=${resolution.decision} convergence=${convergence.converged} recovery=${recovery.stabilizationAction} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION };
