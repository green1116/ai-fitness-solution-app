import type { GovernanceIncidentRecoveryProfileMigrationRule } from "./incident-recovery-profile-migration-rule-registry.types";

export function buildIncidentRecoveryProfileMigrationRules(): GovernanceIncidentRecoveryProfileMigrationRule[] {
  return [
    {
      ruleId: "rule-migrate-v1-to-v2",
      ruleName: "Migrate legacy schema v1 to canonical v2",
      category: "schema",
      enabled: true,
      priority: 100,
      sourceVersion: "json-local-v1",
      targetVersion: "json-local-v2",
      conditions: ["compatibility=compatibleWithMigration"],
      actions: ["apply evolution migrations", "preserve aliases", "emit migration trace"],
      rationale: "Canonical schema v2 is required for stable consumers.",
      fallbackBehavior: "useBuiltin",
    },
    {
      ruleId: "rule-compat-no-migration",
      ruleName: "Keep canonical schema without migration",
      category: "schema",
      enabled: true,
      priority: 60,
      sourceVersion: "json-local-v2",
      targetVersion: "json-local-v2",
      conditions: ["compatibility=fullyCompatible"],
      actions: ["reuse canonical payload", "record no-op migration"],
      rationale: "Already canonical.",
      fallbackBehavior: "keepCurrent",
    },
    {
      ruleId: "rule-fallback-builtin",
      ruleName: "Fallback to builtin profile config",
      category: "fallback",
      enabled: true,
      priority: 10,
      sourceVersion: "*",
      targetVersion: "builtin",
      conditions: ["compatibility=incompatible|compatibleWithFallback"],
      actions: ["fallback to builtin config", "emit fallback reason"],
      rationale: "Protect runtime stability.",
      fallbackBehavior: "useBuiltin",
    },
  ];
}
