import {
  GOVERNANCE_FEDERATION_RUNTIME_VERSION,
  type FederationRuntimeInput,
  type FederationRuntimeResult,
  type FederationRuntimeStatus,
} from "./federation-types";
import { buildFederationRegistry } from "./federation-registry";
import { resolveFederationDomain } from "./federation-domain";
import { buildFederationNodes } from "./federation-node";
import { buildFederationTopology } from "./federation-topology";
import { routeFederationRequest } from "./federation-routing";
import { buildFederationOrchestrationPlan } from "./federation-orchestration";
import { propagateFederationPolicies } from "./federation-policy";
import { coordinateFederationRecovery } from "./federation-recovery";
import { buildFederationLineageGraph } from "./federation-lineage";
import { buildFederationAuditRecords } from "./federation-audit";
import { runFederationGovernanceHooks } from "./federation-hooks";

export function buildGovernanceFederationRuntime(
  input: FederationRuntimeInput,
): FederationRuntimeResult {
  const domains = buildFederationRegistry();
  const sourceDomain = resolveFederationDomain({
    domains,
    requestedDomainId: input.requestedDomainId,
  });
  const targetDomain =
    domains.find((d) => d.domainType === "consumer") ??
    domains.find((d) => d.domainId !== sourceDomain.domainId) ??
    sourceDomain;
  const peerDomains = domains.filter(
    (d) => d.domainId !== sourceDomain.domainId && d.domainId !== targetDomain.domainId,
  );
  const nodes = buildFederationNodes(domains, input.deploymentId);
  const topology = buildFederationTopology({
    deploymentId: input.deploymentId,
    domains,
    nodes,
  });

  const capabilityDecision = input.capabilityNegotiation.negotiation.governanceDecision;
  const routing = routeFederationRequest({
    deploymentId: input.deploymentId,
    sourceDomain,
    targetDomain,
    policyPackMode: input.policyPackMode,
    capabilityDecision,
  });
  const orchestration = buildFederationOrchestrationPlan({
    deploymentId: input.deploymentId,
    orchestration: input.orchestration,
    sourceDomain,
    targetDomains: [targetDomain, ...peerDomains.slice(0, 1)],
  });
  const policy = propagateFederationPolicies({
    deploymentId: input.deploymentId,
    sourceDomain,
    targetDomains: [targetDomain, ...peerDomains],
    policyPackMode: input.policyPackMode,
  });
  const recovery = coordinateFederationRecovery({
    deploymentId: input.deploymentId,
    routing,
    domains,
    orchestrationFailed:
      input.orchestration.state.requiresManualReview ||
      input.orchestration.state.highSeverityPending,
  });
  const lineage = buildFederationLineageGraph({
    deploymentId: input.deploymentId,
    topology,
    routing,
    policy,
    recovery,
  });
  const federationId = `federation-${input.deploymentId}`;
  const audit = buildFederationAuditRecords({
    federationId,
    routing,
    policy,
    recovery,
    capabilityDecision,
  });
  const hooks = runFederationGovernanceHooks({ routing, policy, recovery });

  let status: FederationRuntimeStatus = "stable";
  if (recovery.rerouteApplied || routing.status === "degraded") status = "degraded";
  if (recovery.stabilizationAction.includes("failover")) status = "recovering";
  if (routing.status === "isolated") status = "isolated";

  const traceId = `federation-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_FEDERATION_RUNTIME_VERSION,
    registry: {
      federationId,
      domainCount: domains.length,
      nodeCount: nodes.length,
    },
    topology,
    routing,
    orchestration,
    policy,
    recovery,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `federation-summary-${Date.now()}`,
      text: `federation=${federationId} domains=${domains.length} routing=${routing.status} policyAccepted=${policy.accepted.length} recovery=${recovery.stabilizationAction} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_FEDERATION_RUNTIME_VERSION };
