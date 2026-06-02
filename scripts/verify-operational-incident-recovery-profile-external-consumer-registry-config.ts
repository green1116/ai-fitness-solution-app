/**
 * V4-A3-R9.1.8 Operational Governance Incident Recovery Profile External Consumer Registry Config — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const inline = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-external-consumer-registry-config-inline",
    incidentRecoveryProfileJsonSourcePath: "config/not-found-for-inline-priority.json",
    incidentRecoveryProfileExternalConsumerRegistrySourceType: "inline",
    incidentRecoveryProfileExternalConsumerRegistryConfig: {
      configVersion: "external-inline-v1",
      mergeStrategy: "extend",
      consumers: [
        {
          consumerId: "integration-consumer",
          consumerName: "Integration Consumer",
          consumerVersion: "v2",
          enabled: true,
          priority: 95,
          category: "integration",
          requiredFields: ["canonicalVersion", "canonicalProfileId"],
          optionalFields: [],
          fallbackPolicy: "compat",
          compatibilityTarget: "compat",
          description: "Inline integration consumer.",
          owner: "integration-team",
          source: "external",
        },
      ],
    },
  });
  assert(
    inline.incidentRecoveryProfileExternalConsumerRegistryConfigVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
    "config version",
  );
  assert(
    inline.incidentRecoveryProfileExternalConsumerRegistryConfigConsumers.length >= 3,
    "config merged consumers",
  );
  assert(
    inline.incidentRecoveryProfileExternalConsumerRegistryConfigResolvedConsumer.consumerId.length > 0,
    "config resolved consumer",
  );
  assert(
    inline.incidentRecoveryProfileExternalConsumerRegistryConfigTrace.traceId.length > 0,
    "config trace",
  );
  assert(
    inline.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0,
    "config summary",
  );
  assert(
    inline.incidentRecoveryProfileExternalConsumerRegistryConfigReport.consumerCount >= 3,
    "config report",
  );

  const json = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-external-consumer-registry-config-json",
  });
  assert(
    json.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus === "loaded" ||
      json.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus === "fallback",
    "json source adapter status",
  );
  assert(
    json.incidentRecoveryProfileExternalConsumerRegistryConfigStatus === "resolved" ||
      json.incidentRecoveryProfileExternalConsumerRegistryConfigStatus === "fallback",
    "config status",
  );

  console.log("✓ operational incident recovery profile external consumer registry config runtime");
  console.log(" ", inline.incidentRecoveryProfileExternalConsumerRegistryConfigSummary);
}

main();
