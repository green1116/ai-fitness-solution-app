import type {
  GovernanceIncidentRecoveryProfileMigrationRule,
  GovernanceIncidentRecoveryProfileMigrationRuleMatch,
} from "./incident-recovery-profile-migration-rule-registry.types";

export function resolveIncidentRecoveryProfileMigrationRules(input: {
  rules: GovernanceIncidentRecoveryProfileMigrationRule[];
  sourceVersion: string;
  targetVersion: string;
  compatibility: string;
}): {
  matches: GovernanceIncidentRecoveryProfileMigrationRuleMatch[];
  selectedRule: GovernanceIncidentRecoveryProfileMigrationRule;
} {
  const matches = input.rules.map((rule) => {
    const versionMatch =
      (rule.sourceVersion === input.sourceVersion || rule.sourceVersion === "*") &&
      (rule.targetVersion === input.targetVersion || rule.targetVersion === "builtin");
    const compatibilityMatch = rule.conditions.some((condition) =>
      condition.includes(input.compatibility),
    );
    const matched = versionMatch || compatibilityMatch;
    return {
      ruleId: rule.ruleId,
      matched,
      reason: matched ? "rule matched by version/compatibility" : "rule not matched",
      score: matched ? rule.priority : 0,
    };
  });
  const selected =
    [...input.rules]
      .filter((rule) => matches.some((m) => m.ruleId === rule.ruleId && m.matched))
      .sort((a, b) => b.priority - a.priority)[0] ?? input.rules[input.rules.length - 1];
  return { matches, selectedRule: selected };
}
