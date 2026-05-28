import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult } from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";

export function summarizeIncidentRecoveryProfileExternalConsumerRegistrySourceAdapter(
  result: Omit<GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult, "summary">,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult["summary"] {
  return {
    summaryId: `incident-profile-external-consumer-source-adapter-summary-${Date.now()}`,
    text: `source=${result.source.type} path=${result.loaded.path} status=${result.status} resolved=${result.resolved.resolvedSourceType} consumers=${result.resolved.consumers.length} fallback=${result.resolved.fallbackToBuiltin}`,
    traceId: result.trace.traceId,
  };
}
