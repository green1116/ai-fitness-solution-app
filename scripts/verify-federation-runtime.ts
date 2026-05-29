/**
 * V4-A3-R9.3 Operational Governance Federation Runtime — verification
 */
import {
  buildGovernanceFederationRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_FEDERATION_RUNTIME_VERSION,
  buildFederationRegistry,
  buildFederationTopology,
  buildFederationNodes,
  routeFederationRequest,
  propagateFederationPolicies,
  coordinateFederationRecovery,
  buildFederationLineageGraph,
  buildFederationAuditRecords,
  runFederationGovernanceHooks,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-federation-runtime",
  });
  assert(
    runtime.governanceFederationVersion === GOVERNANCE_FEDERATION_RUNTIME_VERSION,
    "federation version",
  );
  assert(runtime.governanceFederationTopology.domains.length >= 4, "federation topology domains");
  assert(runtime.governanceFederationTopology.edges.length > 0, "federation topology edges");
  assert(runtime.governanceFederationRouting.routingId.length > 0, "federation routing");
  assert(runtime.governanceFederationOrchestration.crossRuntime, "cross-runtime orchestration");
  assert(runtime.governanceFederationPolicy.propagatedPolicies.length > 0, "policy propagation");
  assert(runtime.governanceFederationRecovery.coordinationId.length > 0, "federation recovery");
  assert(runtime.governanceFederationLineage.entries.length >= 4, "federation lineage");
  assert(runtime.governanceFederationAudit.length > 0, "federation audit");
  assert(runtime.governanceFederationHooks.length >= 4, "federation hooks");
  assert(runtime.governanceFederationSummary.length > 0, "federation summary");
  assert(
    ["stable", "degraded", "recovering", "isolated"].includes(runtime.governanceFederationStatus),
    "federation status",
  );

  const domains = buildFederationRegistry();
  const nodes = buildFederationNodes(domains, "unit-federation");
  const topology = buildFederationTopology({
    deploymentId: "unit-federation",
    domains,
    nodes,
  });
  assert(topology.nodes.length >= 4, "unit topology nodes");
  const routing = routeFederationRequest({
    deploymentId: "unit-routing",
    sourceDomain: domains[0],
    targetDomain: domains[3],
    policyPackMode: "standard",
    capabilityDecision: "allow",
  });
  assert(routing.routePath.length > 0, "unit routing path");
  const policy = propagateFederationPolicies({
    deploymentId: "unit-policy",
    sourceDomain: domains[0],
    targetDomains: domains.slice(1),
    policyPackMode: "standard",
  });
  assert(policy.accepted.length > 0, "unit policy accepted");
  const recovery = coordinateFederationRecovery({
    deploymentId: "unit-recovery",
    routing,
    domains,
    orchestrationFailed: false,
  });
  assert(recovery.stabilizationAction.length > 0, "unit recovery action");
  const lineage = buildFederationLineageGraph({
    deploymentId: "unit-lineage",
    topology,
    routing,
    policy,
    recovery,
  });
  assert(lineage.entries.length >= 4, "unit lineage");
  const audit = buildFederationAuditRecords({
    federationId: "fed-unit",
    routing,
    policy,
    recovery,
    capabilityDecision: "allow",
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runFederationGovernanceHooks({ routing, policy, recovery });
  assert(hooks.some((h) => h.phase === "afterFederationRouting"), "unit hooks");

  const direct = buildGovernanceFederationRuntime({
    deploymentId: "v4-verify-federation-direct",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  assert(direct.registry.domainCount >= 4, "direct federation registry");

  console.log("✓ governance federation runtime");
  console.log(" ", runtime.governanceFederationSummary);
  console.log("FEDERATION VERIFY PASS");
}

main();
