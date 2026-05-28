import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigTrace } from "./incident-recovery-profile-external-consumer-registry-config.types";

export function buildIncidentRecoveryProfileExternalConsumerRegistryConfigTrace(input: {
  deploymentId: string;
  sourceType: string;
  mergeTrace: string[];
  consumerCount: number;
  fallbackUsed: boolean;
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigTrace {
  return {
    traceId: `incident-profile-external-consumer-config-trace-${input.deploymentId}`,
    loading: [`sourceType=${input.sourceType}`],
    merge: input.mergeTrace,
    resolution: [`consumerCount=${input.consumerCount}`],
    fallbackUsed: input.fallbackUsed,
  };
}
