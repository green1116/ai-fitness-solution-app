/**
 * V4-A3-R9.1.9 Operational Governance Incident Recovery Profile External Consumer Registry Source Adapter — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-external-consumer-source-adapter",
  });
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION,
    "source adapter version",
  );
  assert(
    typeof runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoaded.loaded ===
      "boolean",
    "source loaded",
  );
  assert(
    Array.isArray(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterValidated.errors),
    "source validated",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolved.resolvedSourceType.length >
      0,
    "source resolved",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace.traceId.length > 0,
    "source trace",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0,
    "source summary",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport.reportId.length > 0,
    "source report",
  );
  assert(
    ["loaded", "fallback", "invalid"].includes(
      runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus,
    ),
    "source status",
  );

  const fallback = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-external-consumer-source-adapter-fallback",
    incidentRecoveryProfileExternalConsumerRegistrySourcePath: "config/not-found-external-consumer-registry.json",
  });
  assert(
    fallback.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus === "fallback" ||
      fallback.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus === "invalid",
    "source fallback on missing file",
  );

  console.log("✓ operational incident recovery profile external consumer registry source adapter runtime");
  console.log(" ", runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary);
}

main();
