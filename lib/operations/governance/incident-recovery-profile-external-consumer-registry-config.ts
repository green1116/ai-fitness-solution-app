import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigInput,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult,
} from "./incident-recovery-profile-external-consumer-registry-config.types";
import { buildBuiltinIncidentRecoveryProfileExternalConsumers } from "./incident-recovery-profile-external-consumer-registry.consumer";
import { loadIncidentRecoveryProfileExternalConsumerRegistryConfigSource } from "./incident-recovery-profile-external-consumer-registry-config.loader";
import { mergeIncidentRecoveryProfileExternalConsumerRegistryConfig } from "./incident-recovery-profile-external-consumer-registry-config.merge";
import { buildIncidentRecoveryProfileExternalConsumerRegistryConfigRegistry } from "./incident-recovery-profile-external-consumer-registry-config.registry";
import { buildIncidentRecoveryProfileExternalConsumerRegistryConfigTrace } from "./incident-recovery-profile-external-consumer-registry-config.trace";
import { summarizeIncidentRecoveryProfileExternalConsumerRegistryConfig } from "./incident-recovery-profile-external-consumer-registry-config.summary";

export function buildIncidentRecoveryProfileExternalConsumerRegistryConfigRuntime(
  input: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigInput,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult {
  const source = loadIncidentRecoveryProfileExternalConsumerRegistryConfigSource({
    sourceAdapterResolved: input.sourceAdapterResolved,
    inlineConfig: input.inlineConfig,
  });
  const merged = mergeIncidentRecoveryProfileExternalConsumerRegistryConfig({
    mergeStrategy: source.mergeStrategy,
    externalConsumers: source.consumers,
  });
  const registry = buildIncidentRecoveryProfileExternalConsumerRegistryConfigRegistry();
  const fallbackUsed = merged.fallbackUsed || source.type === "builtinFallback";
  const status: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult["status"] =
    source.type === "builtinFallback"
      ? "fallback"
      : source.consumers.length === 0 && !fallbackUsed
        ? "invalidExternalConfig"
        : "resolved";
  const trace = buildIncidentRecoveryProfileExternalConsumerRegistryConfigTrace({
    deploymentId: input.deploymentId,
    sourceType: source.type,
    mergeTrace: merged.trace,
    consumerCount: merged.merged.length,
    fallbackUsed,
  });
  const report = {
    reportId: `incident-profile-external-consumer-config-report-${input.deploymentId}`,
    sourceType: source.type,
    consumerCount: merged.merged.length,
    status,
  };
  const resolvedConsumer =
    [...merged.merged].sort((a, b) => b.priority - a.priority)[0] ??
    buildBuiltinIncidentRecoveryProfileExternalConsumers()[0];
  const core: Omit<GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
    snapshot: {
      sourceType: source.type,
      configVersion: source.configVersion,
      consumerCount: merged.merged.length,
      fallbackUsed,
    },
    source,
    mergedConsumers: merged.merged,
    resolvedConsumer,
    compatibility: {
      status,
      fallbackUsed,
      consumerCount: merged.merged.length,
    },
    registry,
    trace,
    report,
    status,
  };
  return { ...core, summary: summarizeIncidentRecoveryProfileExternalConsumerRegistryConfig(core) };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION };
