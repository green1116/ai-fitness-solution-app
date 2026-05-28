import type {
  GovernanceIncidentRecoveryProfile,
  GovernanceIncidentRecoveryProfileInput,
  GovernanceIncidentRecoveryProfileMatch,
} from "./incident-recovery-profile.types";

function evaluatePredicate(
  input: GovernanceIncidentRecoveryProfileInput,
  predicate: GovernanceIncidentRecoveryProfile["rules"][number]["predicate"],
): boolean {
  switch (predicate) {
    case "severeFailure":
      return input.lifecycle.state.isFailed || input.recovery.status === "degraded";
    case "checkpointAvailable":
      return input.persistence.checkpoint.checkpointStatus === "restorable";
    case "storeUnavailable":
      return input.store.loaded.snapshot === null || input.store.loaded.checkpoint === null;
    case "auditRequired":
      return input.recovery.audit.actions.length > 0 && input.persistence.replay.replayable;
    case "manualRequired":
      return (
        input.lifecycle.state.status === "waitingApproval" ||
        input.recovery.strategy === "manualIntervention"
      );
    case "partialOnly":
      return input.recovery.partial.executed && input.recovery.degraded.active;
    default:
      return false;
  }
}

export function matchIncidentRecoveryProfile(input: {
  profile: GovernanceIncidentRecoveryProfile;
  context: GovernanceIncidentRecoveryProfileInput;
}): GovernanceIncidentRecoveryProfileMatch {
  const matchedRules = input.profile.rules.filter((rule) =>
    evaluatePredicate(input.context, rule.predicate),
  );
  const score = matchedRules.reduce(
    (sum, rule) =>
      sum +
      (rule.severity === "critical"
        ? 40
        : rule.severity === "high"
          ? 25
          : rule.severity === "medium"
            ? 15
            : 10),
    0,
  );
  return {
    profileId: input.profile.profileId,
    matched: matchedRules.length > 0,
    score,
    reason:
      matchedRules.length > 0
        ? `Matched ${matchedRules.map((r) => r.ruleId).join(",")}`
        : "No rule matched for this profile.",
  };
}
