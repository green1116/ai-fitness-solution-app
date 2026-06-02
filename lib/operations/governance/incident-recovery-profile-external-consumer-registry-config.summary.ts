import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult } from "./incident-recovery-profile-external-consumer-registry-config.types";

export function summarizeIncidentRecoveryProfileExternalConsumerRegistryConfig(
  result: Omit<GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult, "summary">,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult["summary"] {
  return {
    summaryId: `incident-profile-external-consumer-config-summary-${Date.now()}`,
    text: `source=${result.source.type} version=${result.source.configVersion} merge=${result.source.mergeStrategy} consumers=${result.mergedConsumers.length} fallback=${result.trace.fallbackUsed} status=${result.status}`,
    traceId: result.trace.traceId,
  };
}
