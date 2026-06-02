import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerMatch,
} from "./incident-recovery-profile-external-consumer-registry.types";

export function resolveIncidentRecoveryProfileExternalConsumer(input: {
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  requestedConsumerId?: string;
}): {
  resolved: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer;
  matches: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerMatch[];
  usedFallback: boolean;
} {
  const sorted = [...input.consumers].sort((a, b) => b.priority - a.priority);
  const requested = input.requestedConsumerId
    ? sorted.find((c) => c.consumerId === input.requestedConsumerId)
    : undefined;
  const resolved = requested ?? sorted[0];
  const matches = sorted.map((consumer) => ({
    consumerId: consumer.consumerId,
    matched: consumer.consumerId === resolved.consumerId,
    reason:
      consumer.consumerId === resolved.consumerId
        ? requested
          ? "requestedConsumerMatched"
          : "prioritySelected"
        : "notSelected",
  }));
  return {
    resolved,
    matches,
    usedFallback: Boolean(input.requestedConsumerId && !requested),
  };
}
