import type {
  GovernanceIncidentRecoveryProfileConfigAdapter,
  GovernanceIncidentRecoveryProfileConfigResolver,
  GovernanceIncidentRecoveryProfileConfigTrace,
} from "./incident-recovery-profile-config.types";

export function buildIncidentRecoveryProfileConfigTrace(input: {
  sourceType: string;
  adapter: GovernanceIncidentRecoveryProfileConfigAdapter;
  mergeTrace: string[];
  resolver: GovernanceIncidentRecoveryProfileConfigResolver;
  fallbackUsed: boolean;
}): GovernanceIncidentRecoveryProfileConfigTrace {
  return {
    traceId: `incident-profile-config-trace-${Date.now()}`,
    loading: [`source=${input.sourceType}`],
    adaptation: [
      `adapter=${input.adapter.adapterId}`,
      `adapted=${input.adapter.adapted}`,
      ...input.adapter.warnings,
    ],
    merge: input.mergeTrace,
    resolution: [
      `resolver=${input.resolver.resolverId}`,
      `selectedSource=${input.resolver.selectedSourceId}`,
      `selectedProfile=${input.resolver.selectedProfileId}`,
      `resolvedFrom=${input.resolver.resolvedFrom}`,
    ],
    fallbackUsed: input.fallbackUsed,
  };
}
