/**
 * V4-A3-R9.1.7 Operational Governance Incident Recovery Profile External Consumer Registry Runtime — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-external-consumer-registry",
  });
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistryVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
    "external consumer registry version",
  );
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConsumers.length >= 3, "consumer registered");
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistryResolvedConsumer.consumerId.length > 0,
    "consumer resolved",
  );
  assert(
    ["resolved", "fallback", "incompatible"].includes(
      runtime.incidentRecoveryProfileExternalConsumerRegistryStatus,
    ),
    "status valid",
  );
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryTrace.traceId.length > 0, "trace generated");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "summary generated");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryReport.consumerCount >= 3, "report generated");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter linked");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config linked");

  const fallback = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-external-consumer-registry-fallback",
    incidentRecoveryProfileExternalConsumerId: "unknown-consumer-id",
  });
  assert(
    fallback.incidentRecoveryProfileExternalConsumerRegistryStatus === "fallback",
    "fallback for unknown consumer",
  );

  console.log("✓ operational incident recovery profile external consumer registry runtime");
  console.log(" ", runtime.incidentRecoveryProfileExternalConsumerRegistrySummary);
}

main();
