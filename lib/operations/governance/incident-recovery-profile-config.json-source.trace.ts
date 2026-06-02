import type { GovernanceIncidentRecoveryProfileJsonSourceTrace } from "./incident-recovery-profile-config.json-source.types";

export function buildIncidentRecoveryProfileJsonSourceTrace(input: {
  load: string[];
  parse: string[];
  validate: string[];
  merge: string[];
  resolve: string[];
  fallback: string[];
}): GovernanceIncidentRecoveryProfileJsonSourceTrace {
  return {
    traceId: `incident-profile-json-trace-${Date.now()}`,
    load: input.load,
    parse: input.parse,
    validate: input.validate,
    merge: input.merge,
    resolve: input.resolve,
    fallback: input.fallback,
  };
}
