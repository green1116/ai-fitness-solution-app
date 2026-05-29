/**
 * V4-A3-R9.2 Consumer Capability Negotiation Runtime — verification
 */
import {
  buildConsumerCapabilityNegotiationRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION,
  negotiateConsumerCapabilities,
  resolveConsumerCapabilitySet,
  buildConsumerCapabilityProfile,
  buildCapabilityDegradationPlan,
  evaluateCapabilityVersionGovernance,
  buildCapabilityLineageGraph,
  buildCapabilityAuditRecords,
  runCapabilityGovernanceHooks,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-consumer-capability-negotiation",
  });
  assert(
    runtime.consumerCapabilityNegotiationVersion === GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION,
    "negotiation version",
  );
  assert(runtime.consumerCapabilityNegotiationProfile.consumerId.length > 0, "capability profile");
  assert(runtime.consumerCapabilityNegotiationResult.negotiationId.length > 0, "negotiation result");
  assert(runtime.consumerCapabilityNegotiationResolvedCapabilities.length > 0, "resolved capabilities");
  assert(runtime.consumerCapabilityNegotiationDegradationPlan.steps.length > 0, "degradation plan");
  assert(runtime.consumerCapabilityNegotiationVersionMatrix.length > 0, "version matrix");
  assert(runtime.consumerCapabilityNegotiationLineage.entries.length > 0, "lineage graph");
  assert(runtime.consumerCapabilityNegotiationAudit.length > 0, "audit records");
  assert(runtime.consumerCapabilityNegotiationHooks.length >= 2, "governance hooks");
  assert(runtime.consumerCapabilityNegotiationSummary.length > 0, "negotiation summary");
  assert(
    ["negotiated", "degraded", "restricted", "denied"].includes(
      runtime.consumerCapabilityNegotiationStatus,
    ),
    "negotiation status",
  );
  assert(
    ["allow", "allow_with_degradation", "restricted", "deny"].includes(
      runtime.consumerCapabilityNegotiationResult.governanceDecision,
    ),
    "governance decision",
  );

  const profile = buildConsumerCapabilityProfile(
    runtime.incidentRecoveryProfileExternalConsumerRegistryResolvedConsumer,
    runtime.incidentRecoveryProfileCanonicalContractSnapshot.canonicalVersion,
  );
  const negotiation = negotiateConsumerCapabilities({
    deploymentId: "unit-negotiation",
    profile,
    requestedCapabilities: ["canonical-payload-read", "schema-v2", "full-rendering"],
    canonicalCompatible: true,
  });
  assert(negotiation.acceptedCapabilities.length > 0, "unit negotiation accepted");
  const resolution = resolveConsumerCapabilitySet({
    profile,
    negotiationAccepted: negotiation.acceptedCapabilities,
  });
  assert(resolution.resolved.length > 0, "unit capability resolution");
  const degradation = buildCapabilityDegradationPlan({ profile, negotiation });
  assert(degradation.finalMode.length > 0, "unit degradation");
  const versionGov = evaluateCapabilityVersionGovernance({
    profile,
    canonicalVersion: runtime.incidentRecoveryProfileCanonicalContractSnapshot.canonicalVersion,
  });
  assert(versionGov.matrix.length > 0, "unit version governance");
  const lineage = buildCapabilityLineageGraph({
    deploymentId: "unit-lineage",
    negotiation,
    degradationPlan: degradation,
    versionConflicts: versionGov.conflicts,
  });
  assert(lineage.entries.length > 0, "unit lineage");
  const audit = buildCapabilityAuditRecords(negotiation);
  assert(audit.length > 0, "unit audit");
  const hooks = runCapabilityGovernanceHooks({ profile, negotiation, degradationPlan: degradation });
  assert(hooks.some((h) => h.phase === "afterNegotiation"), "unit hooks");

  const direct = buildConsumerCapabilityNegotiationRuntime({
    deploymentId: "v4-verify-consumer-capability-direct",
    resolvedConsumer: runtime.incidentRecoveryProfileExternalConsumerRegistryResolvedConsumer,
    canonicalContract: runtime.incidentRecoveryProfileCanonicalContract,
  });
  assert(direct.negotiation.compatibilityScore >= 0, "direct negotiation score");

  console.log("✓ consumer capability negotiation runtime");
  console.log(" ", runtime.consumerCapabilityNegotiationSummary);
  console.log("NEGOTIATION VERIFY PASS");
}

main();
