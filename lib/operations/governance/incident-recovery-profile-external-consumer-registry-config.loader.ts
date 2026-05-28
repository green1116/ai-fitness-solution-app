import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResolvedInput,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSource,
} from "./incident-recovery-profile-external-consumer-registry-config.types";

export function loadIncidentRecoveryProfileExternalConsumerRegistryConfigSource(input: {
  sourceAdapterResolved: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResolvedInput;
  inlineConfig?: {
    sourceType?: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSource["type"];
    configVersion: string;
    mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSource["mergeStrategy"];
    consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSource["consumers"];
  };
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSource {
  if (input.sourceAdapterResolved.useAdapterSource || input.sourceAdapterResolved.fallbackToBuiltin) {
    return {
      sourceId: `source-${input.sourceAdapterResolved.resolvedSourceType}`,
      type: input.sourceAdapterResolved.resolvedSourceType,
      configVersion: input.sourceAdapterResolved.configVersion,
      mergeStrategy: input.sourceAdapterResolved.mergeStrategy,
      consumers: input.sourceAdapterResolved.consumers,
    };
  }
  if (input.inlineConfig) {
    return {
      sourceId: "source-inline",
      type: input.inlineConfig.sourceType ?? "inline",
      configVersion: input.inlineConfig.configVersion,
      mergeStrategy: input.inlineConfig.mergeStrategy,
      consumers: input.inlineConfig.consumers,
    };
  }
  return {
    sourceId: "source-builtin-fallback",
    type: "builtinFallback",
    configVersion: "builtin-external-consumer-registry-v1",
    mergeStrategy: "fallback",
    consumers: [],
  };
}
