/**
 * V4-A3-R9.4 Operational Governance Federation Consensus Runtime — verification
 */
import {
  buildGovernanceFederationConsensusRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION,
  buildFederationConsensusNodes,
  buildConsensusProposal,
  runConsensusVoting,
  evaluateConsensusQuorum,
  resolveConsensusDecision,
  reconcileFederationConsensus,
  convergeConsensusState,
  coordinateConsensusRecovery,
  buildConsensusLineageGraph,
  buildConsensusAuditRecords,
  runConsensusGovernanceHooks,
  buildGovernanceFederationRuntime,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-federation-consensus",
  });
  assert(
    runtime.governanceFederationConsensusVersion === GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION,
    "consensus version",
  );
  assert(runtime.governanceFederationConsensusNodes.length >= 4, "consensus nodes");
  assert(runtime.governanceFederationConsensusProposal.proposalId.length > 0, "consensus proposal");
  assert(runtime.governanceFederationConsensusVotes.length > 0, "consensus votes");
  assert(
    runtime.governanceFederationConsensusQuorum.participatingNodes.length > 0,
    "quorum participating nodes",
  );
  assert(
    runtime.governanceFederationConsensusResolution.resolutionId.length > 0,
    "consensus resolution",
  );
  assert(
    runtime.governanceFederationConsensusReconciliation.reconciliationId.length > 0,
    "consensus reconciliation",
  );
  assert(
    runtime.governanceFederationConsensusConvergence.convergenceId.length > 0,
    "consensus convergence",
  );
  assert(
    runtime.governanceFederationConsensusRecovery.recoveryId.length > 0,
    "consensus recovery",
  );
  assert(runtime.governanceFederationConsensusLineage.entries.length >= 5, "consensus lineage");
  assert(runtime.governanceFederationConsensusAudit.length > 0, "consensus audit");
  assert(runtime.governanceFederationConsensusHooks.length >= 4, "consensus hooks");
  assert(runtime.governanceFederationConsensusSummary.length > 0, "consensus summary");
  assert(
    ["converged", "partial", "recovering", "failed"].includes(
      runtime.governanceFederationConsensusStatus,
    ),
    "consensus status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-consensus-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const nodes = buildFederationConsensusNodes(
    federation.topology.domains,
    federation.topology.nodes,
  );
  assert(nodes.length >= 4, "unit consensus nodes");
  const proposal = buildConsensusProposal({
    deploymentId: "unit-consensus",
    federation,
    proposalType: "policy",
  });
  assert(proposal.requiredQuorum > 0, "unit proposal quorum");
  const votes = runConsensusVoting({ proposal, nodes, federation });
  assert(votes.length > 0, "unit votes");
  const quorum = evaluateConsensusQuorum({
    proposalId: proposal.proposalId,
    votes,
    nodes,
    requiredQuorum: proposal.requiredQuorum,
  });
  assert(quorum.participatingNodes.length > 0, "unit quorum");
  const resolution = resolveConsensusDecision({ deploymentId: "unit-consensus", quorum });
  assert(resolution.resolutionId.length > 0, "unit resolution");
  const reconciliation = reconcileFederationConsensus({
    deploymentId: "unit-consensus",
    federation,
    resolution,
  });
  assert(reconciliation.convergenceScore >= 0, "unit reconciliation");
  const convergence = convergeConsensusState({
    deploymentId: "unit-consensus",
    federation,
    resolution,
    reconciliation,
  });
  assert(convergence.convergenceId.length > 0, "unit convergence");
  const recovery = coordinateConsensusRecovery({
    deploymentId: "unit-consensus",
    federation,
    quorum,
    resolution,
  });
  assert(recovery.stabilizationAction.length > 0, "unit recovery");
  const lineage = buildConsensusLineageGraph({
    deploymentId: "unit-consensus",
    votes,
    quorum,
    reconciliation,
    convergence,
    recovery,
  });
  assert(lineage.entries.length >= 5, "unit lineage");
  const audit = buildConsensusAuditRecords({
    federationId: federation.registry.federationId,
    quorum,
    resolution,
    reconciliation,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runConsensusGovernanceHooks({
    votes,
    quorum,
    reconciliation,
    recovery,
  });
  assert(hooks.some((h) => h.phase === "afterConsensusVote"), "unit hooks");

  const direct = buildGovernanceFederationConsensusRuntime({
    deploymentId: "v4-verify-consensus-direct",
    federation,
    proposalType: "recovery",
  });
  assert(direct.registry.nodeCount >= 4, "direct consensus registry");

  console.log("✓ governance federation consensus runtime");
  console.log(" ", runtime.governanceFederationConsensusSummary);
  console.log("CONSENSUS VERIFY PASS");
}

main();
