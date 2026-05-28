import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType,
} from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";
import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResolvedInput } from "./incident-recovery-profile-external-consumer-registry-config.types";

export function resolveIncidentRecoveryProfileExternalConsumerRegistrySource(input: {
  sourceType: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType;
  loaded: boolean;
  valid: boolean;
  schema: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema | null;
  inlineFallback?: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResolvedInput;
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult {
  if (input.loaded && input.valid && input.schema) {
    const mappedSourceType =
      input.sourceType === "localJson" || input.sourceType === "file"
        ? "localJson"
        : input.sourceType === "env"
          ? "env"
          : input.sourceType === "inline"
            ? "inline"
            : input.sourceType;
    return {
      useAdapterSource: true,
      fallbackToBuiltin: false,
      resolvedSourceType: mappedSourceType,
      configVersion: input.schema.version,
      mergeStrategy: input.schema.mergeStrategy,
      consumers: input.schema.consumers,
    };
  }
  if (input.inlineFallback && input.inlineFallback.consumers.length > 0) {
    return {
      useAdapterSource: false,
      fallbackToBuiltin: false,
      resolvedSourceType: input.inlineFallback.resolvedSourceType,
      configVersion: input.inlineFallback.configVersion,
      mergeStrategy: input.inlineFallback.mergeStrategy,
      consumers: input.inlineFallback.consumers,
    };
  }
  return {
    useAdapterSource: false,
    fallbackToBuiltin: true,
    resolvedSourceType: "builtinFallback",
    configVersion: "builtin-external-consumer-registry-v1",
    mergeStrategy: "fallback",
    consumers: [],
  };
}
