import type {
  GovernanceIncidentRecoveryProfileJsonSourceResolveResult,
  GovernanceIncidentRecoveryProfileJsonSourceSchema,
} from "./incident-recovery-profile-config.json-source.types";
import type { GovernanceIncidentRecoveryProfileDecision } from "./incident-recovery-profile.types";

export function resolveIncidentRecoveryProfileJsonSource(input: {
  loaded: boolean;
  valid: boolean;
  schema: GovernanceIncidentRecoveryProfileJsonSourceSchema | null;
  builtinDecision: GovernanceIncidentRecoveryProfileDecision;
}): GovernanceIncidentRecoveryProfileJsonSourceResolveResult {
  if (!input.loaded || !input.valid || !input.schema) {
    return {
      useJsonSource: false,
      fallbackToBuiltin: true,
      decision: input.builtinDecision,
    };
  }

  const chosen = input.schema.profiles.find((p) => p.enabled)?.strategy;
  return {
    useJsonSource: true,
    fallbackToBuiltin: false,
    decision: {
      ...input.builtinDecision,
      strategy: chosen ?? input.builtinDecision.strategy,
    },
  };
}
