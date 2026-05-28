import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult } from "./incident-recovery-profile-external-consumer-registry.types";

export function summarizeIncidentRecoveryProfileExternalConsumerRegistry(
  input: Omit<GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult, "summary">,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult["summary"] {
  return {
    summaryId: `incident-profile-external-consumer-registry-summary-${Date.now()}`,
    text: `registry=${input.snapshot.registryId} version=${input.version} consumers=${input.consumers.length} resolved=${input.resolvedConsumer.consumerId}@${input.resolvedConsumer.consumerVersion} status=${input.status}`,
    traceId: input.trace.traceId,
  };
}
