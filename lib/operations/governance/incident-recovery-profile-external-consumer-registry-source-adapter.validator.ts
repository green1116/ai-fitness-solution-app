import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterValidation,
} from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";

export function validateIncidentRecoveryProfileExternalConsumerRegistrySource(
  schema: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema | null,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterValidation {
  if (!schema) {
    return { valid: false, errors: ["Schema is null."] };
  }
  const errors: string[] = [];
  if (!schema.version) errors.push("Missing version.");
  if (!schema.source.name) errors.push("Missing source.name.");
  if (schema.consumers.length === 0) errors.push("Consumers array is empty.");
  for (const consumer of schema.consumers) {
    if (!consumer.consumerId) errors.push("Consumer missing consumerId.");
    if (consumer.requiredFields.length === 0) errors.push(`Consumer ${consumer.consumerId} has no requiredFields.`);
  }
  return { valid: errors.length === 0, errors };
}
