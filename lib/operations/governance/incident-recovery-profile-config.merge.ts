import type { GovernanceIncidentRecoveryProfile } from "./incident-recovery-profile.types";
import type {
  GovernanceIncidentRecoveryProfileConfigMergeStrategy,
  GovernanceIncidentRecoveryProfileConfigSource,
} from "./incident-recovery-profile-config.types";

function mergeByPriority(
  builtinProfiles: GovernanceIncidentRecoveryProfile[],
  externalProfiles: GovernanceIncidentRecoveryProfile[],
): GovernanceIncidentRecoveryProfile[] {
  const byId = new Map<string, GovernanceIncidentRecoveryProfile>();
  for (const p of builtinProfiles) byId.set(p.profileId, p);
  for (const p of externalProfiles) {
    const current = byId.get(p.profileId);
    if (!current || p.priority >= current.priority) byId.set(p.profileId, p);
  }
  return [...byId.values()];
}

export function mergeIncidentRecoveryProfiles(input: {
  source: GovernanceIncidentRecoveryProfileConfigSource;
  builtinProfiles: GovernanceIncidentRecoveryProfile[];
  externalProfiles: GovernanceIncidentRecoveryProfile[];
}): { merged: GovernanceIncidentRecoveryProfile[]; trace: string[]; fallbackUsed: boolean } {
  const strategy: GovernanceIncidentRecoveryProfileConfigMergeStrategy = input.source.mergeStrategy;
  if (input.externalProfiles.length === 0) {
    return {
      merged: input.builtinProfiles,
      trace: ["No external profiles available; fallback to builtin."],
      fallbackUsed: true,
    };
  }

  if (strategy === "override") {
    return {
      merged: input.externalProfiles,
      trace: ["Merge strategy override: external profiles replace builtin."],
      fallbackUsed: false,
    };
  }
  if (strategy === "extend") {
    return {
      merged: [...input.externalProfiles, ...input.builtinProfiles],
      trace: ["Merge strategy extend: external profiles prepended to builtin."],
      fallbackUsed: false,
    };
  }
  if (strategy === "priorityMerge") {
    return {
      merged: mergeByPriority(input.builtinProfiles, input.externalProfiles),
      trace: ["Merge strategy priorityMerge: highest priority profile kept per id."],
      fallbackUsed: false,
    };
  }

  return {
    merged: [...input.builtinProfiles, ...input.externalProfiles],
    trace: ["Merge strategy fallback: builtin first with external fallback tail."],
    fallbackUsed: false,
  };
}
