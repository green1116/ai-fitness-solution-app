import { buildBuiltinIncidentRecoveryProfileExternalConsumers } from "./incident-recovery-profile-external-consumer-registry.consumer";
import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer } from "./incident-recovery-profile-external-consumer-registry.types";
import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy } from "./incident-recovery-profile-external-consumer-registry-config.types";

export function mergeIncidentRecoveryProfileExternalConsumerRegistryConfig(input: {
  mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
  externalConsumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
}): {
  merged: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  trace: string[];
  fallbackUsed: boolean;
} {
  const builtin = buildBuiltinIncidentRecoveryProfileExternalConsumers();
  const trace: string[] = [];
  if (input.mergeStrategy === "fallback" || input.externalConsumers.length === 0) {
    trace.push("merge=fallback-to-builtin");
    return { merged: builtin, trace, fallbackUsed: true };
  }
  if (input.mergeStrategy === "override") {
    trace.push("merge=override-external");
    return { merged: input.externalConsumers, trace, fallbackUsed: false };
  }
  const byId = new Map<string, GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer>();
  for (const consumer of builtin) byId.set(consumer.consumerId, consumer);
  for (const consumer of input.externalConsumers) {
    const existing = byId.get(consumer.consumerId);
    if (!existing || input.mergeStrategy === "priorityMerge") {
      if (existing && consumer.priority >= existing.priority) {
        byId.set(consumer.consumerId, consumer);
        trace.push(`merge=priority-replace:${consumer.consumerId}`);
      } else if (!existing) {
        byId.set(consumer.consumerId, consumer);
        trace.push(`merge=extend-add:${consumer.consumerId}`);
      }
    } else {
      byId.set(consumer.consumerId, { ...existing, ...consumer, source: "external" });
      trace.push(`merge=extend-merge:${consumer.consumerId}`);
    }
  }
  return { merged: [...byId.values()], trace, fallbackUsed: false };
}
