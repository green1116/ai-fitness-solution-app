import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryReport,
} from "./incident-recovery-profile-external-consumer-registry.types";

export function buildIncidentRecoveryProfileExternalConsumerRegistryReport(input: {
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  compatibility: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility;
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistryReport {
  return {
    reportId: `incident-profile-external-consumer-registry-report-${Date.now()}`,
    consumerCount: input.consumers.length,
    enabledCount: input.consumers.filter((c) => c.enabled).length,
    compatibilityStatus: input.compatibility.status,
    details: input.consumers.map(
      (c) =>
        `${c.consumerId}@${c.consumerVersion} category=${c.category} mode=${c.compatibilityTarget} fallback=${c.fallbackPolicy}`,
    ),
  };
}
