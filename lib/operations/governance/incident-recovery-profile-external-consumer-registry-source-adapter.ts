import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterInput,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType,
} from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";
import { loadIncidentRecoveryProfileExternalConsumerRegistrySource } from "./incident-recovery-profile-external-consumer-registry-source-adapter.loader";
import { parseIncidentRecoveryProfileExternalConsumerRegistrySource } from "./incident-recovery-profile-external-consumer-registry-source-adapter.parser";
import { validateIncidentRecoveryProfileExternalConsumerRegistrySource } from "./incident-recovery-profile-external-consumer-registry-source-adapter.validator";
import { resolveIncidentRecoveryProfileExternalConsumerRegistrySource } from "./incident-recovery-profile-external-consumer-registry-source-adapter.resolver";
import { buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace } from "./incident-recovery-profile-external-consumer-registry-source-adapter.trace";
import { summarizeIncidentRecoveryProfileExternalConsumerRegistrySourceAdapter } from "./incident-recovery-profile-external-consumer-registry-source-adapter.summary";
import { buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport } from "./incident-recovery-profile-external-consumer-registry-source-adapter.report";

function resolveActiveSourceType(
  input: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterInput,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType {
  if (input.sourceType) return input.sourceType;
  if (input.inlineConfig) return "inline";
  if (input.sourcePath) return "localJson";
  return "localJson";
}

export function buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterRuntime(
  input: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterInput,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult {
  const activeSourceType = resolveActiveSourceType(input);
  const inlinePayload = input.inlineConfig
    ? JSON.stringify({
        version: input.inlineConfig.configVersion,
        source: { name: "inline", owner: "runtime-input", updatedAt: new Date().toISOString() },
        mergeStrategy: input.inlineConfig.mergeStrategy,
        consumers: input.inlineConfig.consumers,
      })
    : undefined;
  const loaded = loadIncidentRecoveryProfileExternalConsumerRegistrySource({
    sourceType: activeSourceType,
    sourcePath: input.sourcePath,
    inlinePayload,
  });
  const parsed = parseIncidentRecoveryProfileExternalConsumerRegistrySource(loaded.rawPayload);
  const validated = validateIncidentRecoveryProfileExternalConsumerRegistrySource(parsed.parsed);
  const inlineFallback = input.inlineConfig
    ? {
        useAdapterSource: false,
        fallbackToBuiltin: false,
        resolvedSourceType: "inline" as const,
        configVersion: input.inlineConfig.configVersion,
        mergeStrategy: input.inlineConfig.mergeStrategy,
        consumers: input.inlineConfig.consumers,
      }
    : undefined;
  const resolved = resolveIncidentRecoveryProfileExternalConsumerRegistrySource({
    sourceType: activeSourceType,
    loaded: loaded.loaded,
    valid: validated.valid,
    schema: parsed.parsed,
    inlineFallback,
  });
  const trace = buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace({
    deploymentId: input.deploymentId,
    load: [`type=${activeSourceType}`, `path=${loaded.path}`, `loaded=${loaded.loaded}`, `error=${loaded.error ?? "none"}`],
    parse: [`parsed=${parsed.parsed !== null}`, `error=${parsed.error ?? "none"}`],
    validate: [`valid=${validated.valid}`, ...validated.errors],
    resolve: [
      `resolvedSource=${resolved.resolvedSourceType}`,
      `consumers=${resolved.consumers.length}`,
      `fallback=${resolved.fallbackToBuiltin}`,
    ],
    fallback: resolved.fallbackToBuiltin ? ["Fallback to builtin consumer registry config."] : [],
  });
  const report = buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport({
    source: {
      sourceId: `source-${activeSourceType}`,
      type: activeSourceType,
      identifier: loaded.path,
    },
    resolved,
    loadPath: loaded.path,
    validationErrors: validated.errors,
  });
  const status: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult["status"] =
    !loaded.loaded || !validated.valid
      ? parsed.error || loaded.error
        ? "invalid"
        : "fallback"
      : "loaded";
  const core: Omit<GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION,
    snapshot: {
      adapterId: "incident-recovery-profile-external-consumer-registry-source-adapter",
      version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION,
      activeSourceType,
    },
    source: {
      sourceId: `source-${activeSourceType}`,
      type: activeSourceType,
      identifier: loaded.path,
    },
    loaded,
    validated,
    resolved,
    trace,
    report,
    status,
    parsedSchema: parsed.parsed,
  };
  return {
    ...core,
    summary: summarizeIncidentRecoveryProfileExternalConsumerRegistrySourceAdapter(core),
  };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION };
