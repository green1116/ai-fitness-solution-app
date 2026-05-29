import type { FederationHealthSnapshot } from "./observability-types";
import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import type { PolicyPropagationRuntimeResult } from "../federation-policy/propagation-types";
import { clampScore } from "./observability-registry";

export function buildFederationHealthSnapshot(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  consensus: ConsensusRuntimeResult;
  policyPropagation: PolicyPropagationRuntimeResult;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
}): FederationHealthSnapshot {
  const domains = input.federation.topology.domains;
  const nodes = input.federation.topology.nodes;
  const now = new Date().toISOString();

  const activeDomains = input.lifecycleContinuity.domainLifecycle
    .filter((d) => d.activated && d.phase !== "frozen" && d.phase !== "archived")
    .map((d) => d.domainId);
  const degradedDomains = input.lifecycleContinuity.domainLifecycle
    .filter((d) => d.phase === "degraded" || d.phase === "recovering")
    .map((d) => d.domainId);
  const isolatedDomains = domains
    .filter((d) => d.governanceLevel === "isolated" || d.trustLevel === "restricted")
    .map((d) => d.domainId);

  const activeNodes = nodes.filter((n) => n.status !== "failed").map((n) => n.nodeId);
  const failedNodes = nodes.filter((n) => n.status === "failed").map((n) => n.nodeId);

  const approveVotes = input.consensus.votes.filter((v) => v.vote === "approve").length;
  const consensusSuccessRate =
    input.consensus.votes.length > 0 ? approveVotes / input.consensus.votes.length : 0;

  const propagationSuccessRate = input.policyPropagation.sync.syncRate;

  const stableDomains = input.lifecycleContinuity.domainLifecycle.filter(
    (d) => d.phase === "active",
  ).length;
  const lifecycleStability =
    domains.length > 0 ? stableDomains / domains.length : 1;

  let healthScore = 100;
  healthScore -= degradedDomains.length * 8;
  healthScore -= isolatedDomains.length * 5;
  healthScore -= failedNodes.length * 10;
  if (!input.consensus.quorum.quorumReached) healthScore -= 15;
  if (input.policyPropagation.status === "rolled_back") healthScore -= 20;
  else if (input.policyPropagation.status === "frozen") healthScore -= 12;
  healthScore += consensusSuccessRate * 10;
  healthScore += propagationSuccessRate * 10;
  healthScore += lifecycleStability * 10;

  return {
    snapshotId: `health-snapshot-${input.deploymentId}`,
    federationId: input.federation.registry.federationId,
    healthScore: clampScore(healthScore),
    activeDomains,
    degradedDomains,
    isolatedDomains,
    activeNodes,
    failedNodes,
    consensusSuccessRate,
    propagationSuccessRate,
    lifecycleStability,
    observedAt: now,
  };
}
