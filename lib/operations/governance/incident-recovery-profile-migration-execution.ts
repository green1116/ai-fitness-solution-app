import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION,
  type GovernanceIncidentRecoveryProfileMigrationExecutionInput,
  type GovernanceIncidentRecoveryProfileMigrationExecutionResult,
} from "./incident-recovery-profile-migration-execution.types";
import { planIncidentRecoveryProfileMigrationExecution } from "./incident-recovery-profile-migration-execution.plan";
import { resolveIncidentRecoveryProfileMigrationExecutionFallback } from "./incident-recovery-profile-migration-execution.fallback";
import { executeIncidentRecoveryProfileMigrationPlan } from "./incident-recovery-profile-migration-execution.executor";
import { canonicalizeIncidentRecoveryProfileMigration } from "./incident-recovery-profile-migration-execution.canonical";
import { buildIncidentRecoveryProfileMigrationExecutionTrace } from "./incident-recovery-profile-migration-execution.trace";
import { summarizeIncidentRecoveryProfileMigrationExecution } from "./incident-recovery-profile-migration-execution.summary";

export function buildIncidentRecoveryProfileMigrationExecutionRuntime(
  input: GovernanceIncidentRecoveryProfileMigrationExecutionInput,
): GovernanceIncidentRecoveryProfileMigrationExecutionResult {
  const plan = planIncidentRecoveryProfileMigrationExecution(input);
  const fallback = resolveIncidentRecoveryProfileMigrationExecutionFallback({
    runtime: input,
    plan,
  });
  const execution = executeIncidentRecoveryProfileMigrationPlan({
    plan,
    fallback,
  });
  const canonical = canonicalizeIncidentRecoveryProfileMigration({
    runtime: input,
    fallbackUsed: fallback.used,
  });
  const trace = buildIncidentRecoveryProfileMigrationExecutionTrace({
    deploymentId: input.deploymentId,
    mode: plan.mode,
    selectedRuleId: plan.selectedRuleId,
    appliedSteps: execution.appliedSteps,
    warnings: execution.warnings,
    fallbackUsed: fallback.used,
  });
  const core: Omit<GovernanceIncidentRecoveryProfileMigrationExecutionResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION,
    mode: plan.mode,
    plan,
    canonical,
    fallback,
    trace,
    status: execution.status,
  };
  return { ...core, summary: summarizeIncidentRecoveryProfileMigrationExecution(core) };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION };
