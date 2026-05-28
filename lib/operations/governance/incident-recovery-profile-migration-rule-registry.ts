import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION,
  type GovernanceIncidentRecoveryProfileMigrationRuleRegistryInput,
  type GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult,
} from "./incident-recovery-profile-migration-rule-registry.types";
import { loadIncidentRecoveryProfileMigrationRuleRegistry } from "./incident-recovery-profile-migration-rule-registry.loader";
import { resolveIncidentRecoveryProfileMigrationRules } from "./incident-recovery-profile-migration-rule-registry.resolver";
import { buildIncidentRecoveryProfileMigrationRuleRegistryTrace } from "./incident-recovery-profile-migration-rule-registry.trace";
import { summarizeIncidentRecoveryProfileMigrationRuleRegistry } from "./incident-recovery-profile-migration-rule-registry.summary";

export function buildIncidentRecoveryProfileMigrationRuleRegistryRuntime(
  input: GovernanceIncidentRecoveryProfileMigrationRuleRegistryInput,
): GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult {
  const rules = loadIncidentRecoveryProfileMigrationRuleRegistry();
  const targetVersion =
    input.evolution.evolvedSchema?.version ??
    (input.evolution.compatibility === "compatibleWithFallback" ? "builtin" : "json-local-v2");
  const resolved = resolveIncidentRecoveryProfileMigrationRules({
    rules,
    sourceVersion: input.evolution.snapshot.sourceVersion,
    targetVersion,
    compatibility: input.evolution.compatibility,
  });
  const fallbackUsed = resolved.selectedRule.fallbackBehavior === "useBuiltin";
  const status: GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult["status"] =
    resolved.matches.some((m) => m.matched)
      ? fallbackUsed
        ? "fallback"
        : "resolved"
      : "noMatch";
  const trace = buildIncidentRecoveryProfileMigrationRuleRegistryTrace({
    deploymentId: input.deploymentId,
    matches: resolved.matches,
    selectedRuleId: resolved.selectedRule.ruleId,
    fallbackUsed,
  });
  const core: Omit<GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION,
    snapshot: {
      sourceVersion: input.evolution.snapshot.sourceVersion,
      targetVersion: resolved.selectedRule.targetVersion,
      selectedRuleId: resolved.selectedRule.ruleId,
    },
    rules,
    matches: resolved.matches,
    trace,
    status,
  };
  return { ...core, summary: summarizeIncidentRecoveryProfileMigrationRuleRegistry(core) };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION };
