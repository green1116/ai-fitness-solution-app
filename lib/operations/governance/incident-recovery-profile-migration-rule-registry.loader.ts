import type { GovernanceIncidentRecoveryProfileMigrationRule } from "./incident-recovery-profile-migration-rule-registry.types";
import { buildIncidentRecoveryProfileMigrationRules } from "./incident-recovery-profile-migration-rule-registry.rules";

export function loadIncidentRecoveryProfileMigrationRuleRegistry(): GovernanceIncidentRecoveryProfileMigrationRule[] {
  return buildIncidentRecoveryProfileMigrationRules().filter((rule) => rule.enabled);
}
