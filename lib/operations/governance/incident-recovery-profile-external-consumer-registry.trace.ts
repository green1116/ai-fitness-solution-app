import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerMatch,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryTrace,
} from "./incident-recovery-profile-external-consumer-registry.types";

export function buildIncidentRecoveryProfileExternalConsumerRegistryTrace(input: {
  deploymentId: string;
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  matches: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerMatch[];
  compatibility: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility;
  usedFallback: boolean;
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistryTrace {
  return {
    traceId: `incident-profile-external-consumer-registry-trace-${input.deploymentId}`,
    registration: input.consumers.map(
      (c) => `${c.consumerId}@${c.consumerVersion}:${c.source}:enabled=${c.enabled}`,
    ),
    resolution: input.matches.map((m) => `${m.consumerId}:${m.matched}:${m.reason}`),
    compatibility: [
      `${input.compatibility.consumerId}:${input.compatibility.status}:missing=${input.compatibility.missingRequiredFields.join(",") || "none"}`,
    ],
    fallback: input.usedFallback ? ["requested consumer not found, fallback to builtin"] : [],
  };
}
