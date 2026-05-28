import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace } from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";

export function buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace(input: {
  deploymentId: string;
  load: string[];
  parse: string[];
  validate: string[];
  resolve: string[];
  fallback: string[];
}): GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace {
  return {
    traceId: `incident-profile-external-consumer-source-adapter-trace-${input.deploymentId}`,
    load: input.load,
    parse: input.parse,
    validate: input.validate,
    resolve: input.resolve,
    fallback: input.fallback,
  };
}
