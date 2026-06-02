import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource,
} from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";

export function buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport(input: {
  source: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource;
  resolved: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult;
  loadPath: string;
  validationErrors: string[];
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport {
  return {
    reportId: `incident-profile-external-consumer-source-adapter-report-${Date.now()}`,
    activeSource: `${input.source.type}:${input.source.identifier}`,
    resolvedSource: input.resolved.resolvedSourceType,
    consumerCount: input.resolved.consumers.length,
    fallbackUsed: input.resolved.fallbackToBuiltin,
    details: [
      `loadPath=${input.loadPath}`,
      `useAdapterSource=${input.resolved.useAdapterSource}`,
      `validationErrors=${input.validationErrors.join(",") || "none"}`,
    ],
  };
}
