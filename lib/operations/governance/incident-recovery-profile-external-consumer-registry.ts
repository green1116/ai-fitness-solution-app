import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistryInput,
  type GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult,
} from "./incident-recovery-profile-external-consumer-registry.types";
import { loadIncidentRecoveryProfileExternalConsumerRegistry } from "./incident-recovery-profile-external-consumer-registry.loader";
import { buildIncidentRecoveryProfileExternalConsumerRegistrySnapshot } from "./incident-recovery-profile-external-consumer-registry.registry";
import { resolveIncidentRecoveryProfileExternalConsumer } from "./incident-recovery-profile-external-consumer-registry.resolver";
import { evaluateIncidentRecoveryProfileExternalConsumerCompatibility } from "./incident-recovery-profile-external-consumer-registry.compatibility";
import { buildIncidentRecoveryProfileExternalConsumerRegistryTrace } from "./incident-recovery-profile-external-consumer-registry.trace";
import { summarizeIncidentRecoveryProfileExternalConsumerRegistry } from "./incident-recovery-profile-external-consumer-registry.summary";
import { buildIncidentRecoveryProfileExternalConsumerRegistryReport } from "./incident-recovery-profile-external-consumer-registry.report";

export function buildIncidentRecoveryProfileExternalConsumerRegistryRuntime(
  input: GovernanceIncidentRecoveryProfileExternalConsumerRegistryInput,
): GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult {
  const consumers = loadIncidentRecoveryProfileExternalConsumerRegistry({
    externalConsumers: input.externalConsumers,
  });
  const snapshot = buildIncidentRecoveryProfileExternalConsumerRegistrySnapshot({ consumers });
  const resolved = resolveIncidentRecoveryProfileExternalConsumer({
    consumers,
    requestedConsumerId: input.requestedConsumerId,
  });
  const canonicalCompatibility =
    input.canonicalContract.matrix.entries.find((entry) => entry.consumerId === resolved.resolved.consumerId) ??
    input.canonicalContract.compatibility;
  const compatibility = evaluateIncidentRecoveryProfileExternalConsumerCompatibility({
    consumer: resolved.resolved,
    canonicalCompatibility,
  });
  const status =
    compatibility.status === "incompatible"
      ? "incompatible"
      : compatibility.status === "fallback"
        ? "fallback"
        : "resolved";
  const trace = buildIncidentRecoveryProfileExternalConsumerRegistryTrace({
    deploymentId: input.deploymentId,
    consumers,
    matches: resolved.matches,
    compatibility,
    usedFallback: resolved.usedFallback,
  });
  const report = buildIncidentRecoveryProfileExternalConsumerRegistryReport({
    consumers,
    compatibility,
  });
  const core: Omit<GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
    snapshot,
    consumers,
    resolvedConsumer: resolved.resolved,
    compatibility,
    canonicalCompatibility,
    trace,
    report,
    status,
    matches: resolved.matches,
  };
  return { ...core, summary: summarizeIncidentRecoveryProfileExternalConsumerRegistry(core) };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION };
