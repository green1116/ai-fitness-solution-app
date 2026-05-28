/**
 * V4-A3 Operational Governance Runtime — unified entry
 */

export * from "./types";
export * from "./policy";
export * from "./controls";
export * from "./approvals";
export * from "./escalation";
export * from "./exceptions";
export * from "./audit";
export * from "./summary";
export * from "./rules";
export * from "./adapter";
export * from "./registry";
export * from "./matcher";
export * from "./evaluator";
export * from "./rulebook.types";
export * from "./rulebook";
export * from "./rulebook.loader";
export * from "./rulebook.registry";
export * from "./rulebook.matcher";
export * from "./rulebook.evaluator";
export * from "./rulebook.summary";
export * from "./policy-pack.types";
export * from "./policy-pack";
export * from "./policy-pack.loader";
export * from "./policy-pack.registry";
export * from "./policy-pack.evaluator";
export * from "./policy-pack.summary";
export * from "./orchestration.types";
export * from "./orchestration";
export * from "./orchestration.plan";
export * from "./orchestration.conflict";
export * from "./orchestration.timeline";
export * from "./orchestration.executor";
export * from "./orchestration.queue";
export * from "./orchestration.summary";
export * from "./lifecycle.types";
export * from "./lifecycle";
export * from "./lifecycle.state";
export * from "./lifecycle.transition";
export * from "./lifecycle.retry";
export * from "./lifecycle.resume";
export * from "./lifecycle.archive";
export * from "./lifecycle.replay";
export * from "./lifecycle.timeline";
export * from "./lifecycle.summary";
export * from "./persistence.types";
export * from "./persistence";
export * from "./persistence.snapshot";
export * from "./persistence.checkpoint";
export * from "./persistence.restore";
export * from "./persistence.replay";
export * from "./persistence.versioning";
export * from "./persistence.summary";
export * from "./store.types";
export * from "./store";
export * from "./store.adapter";
export * from "./store.memory";
export * from "./store.contract";
export * from "./store.registry";
export * from "./store.trace";
export * from "./store.summary";
export * from "./recovery.types";
export * from "./recovery";
export * from "./recovery.strategy";
export * from "./recovery.rollback";
export * from "./recovery.partial";
export * from "./recovery.replay";
export * from "./recovery.degraded";
export * from "./recovery.audit";
export * from "./recovery.summary";
export * from "./incident-recovery-profile.types";
export * from "./incident-recovery-profile";
export * from "./incident-recovery-profile.registry";
export * from "./incident-recovery-profile.selector";
export * from "./incident-recovery-profile.matcher";
export * from "./incident-recovery-profile.summary";
export * from "./incident-recovery-profile.trace";
export * from "./incident-recovery-profile-config.types";
export * from "./incident-recovery-profile-config";
export * from "./incident-recovery-profile-config.adapter";
export * from "./incident-recovery-profile-config.loader";
export * from "./incident-recovery-profile-config.resolver";
export * from "./incident-recovery-profile-config.merge";
export * from "./incident-recovery-profile-config.registry";
export * from "./incident-recovery-profile-config.summary";
export * from "./incident-recovery-profile-config.trace";
export * from "./incident-recovery-profile-config.json-source.types";
export * from "./incident-recovery-profile-config.json-source";
export * from "./incident-recovery-profile-config.json-source.loader";
export * from "./incident-recovery-profile-config.json-source.parser";
export * from "./incident-recovery-profile-config.json-source.validator";
export * from "./incident-recovery-profile-config.json-source.resolver";
export * from "./incident-recovery-profile-config.json-source.merge";
export * from "./incident-recovery-profile-config.json-source.summary";
export * from "./incident-recovery-profile-config.json-source.trace";
export * from "./incident-recovery-profile-config.json-schema-guard.types";
export * from "./incident-recovery-profile-config.json-schema-guard";
export * from "./incident-recovery-profile-config.json-schema-evolution.types";
export * from "./incident-recovery-profile-config.json-schema-evolution";
export * from "./incident-recovery-profile-config.json-schema-evolution.migrations";
export * from "./incident-recovery-profile-config.json-schema-evolution.aliases";
export * from "./incident-recovery-profile-config.json-schema-evolution.compatibility";
export * from "./incident-recovery-profile-config.json-schema-evolution.versioning";
export * from "./incident-recovery-profile-config.json-schema-evolution.summary";
export * from "./incident-recovery-profile-config.json-schema-evolution.trace";
export * from "./incident-recovery-profile-migration-rule-registry.types";
export * from "./incident-recovery-profile-migration-rule-registry";
export * from "./incident-recovery-profile-migration-rule-registry.rules";
export * from "./incident-recovery-profile-migration-rule-registry.loader";
export * from "./incident-recovery-profile-migration-rule-registry.resolver";
export * from "./incident-recovery-profile-migration-rule-registry.trace";
export * from "./incident-recovery-profile-migration-rule-registry.summary";
export * from "./incident-recovery-profile-rendering-policy.types";
export * from "./incident-recovery-profile-rendering-policy";
export * from "./incident-recovery-profile-rendering-policy.loader";
export * from "./incident-recovery-profile-rendering-policy.resolver";
export * from "./incident-recovery-profile-rendering-policy.render";
export * from "./incident-recovery-profile-rendering-policy.trace";
export * from "./incident-recovery-profile-rendering-policy.summary";
export * from "./incident-recovery-profile-migration-execution.types";
export * from "./incident-recovery-profile-migration-execution";
export * from "./incident-recovery-profile-migration-execution.plan";
export * from "./incident-recovery-profile-migration-execution.executor";
export * from "./incident-recovery-profile-migration-execution.canonical";
export * from "./incident-recovery-profile-migration-execution.fallback";
export * from "./incident-recovery-profile-migration-execution.trace";
export * from "./incident-recovery-profile-migration-execution.summary";
export * from "./incident-recovery-profile-canonical-contract.types";
export * from "./incident-recovery-profile-canonical-contract";
export * from "./incident-recovery-profile-canonical-contract.registry";
export * from "./incident-recovery-profile-canonical-contract.consumer";
export * from "./incident-recovery-profile-canonical-contract.validator";
export * from "./incident-recovery-profile-canonical-contract.compatibility";
export * from "./incident-recovery-profile-canonical-contract.matrix";
export * from "./incident-recovery-profile-canonical-contract.report";
export * from "./incident-recovery-profile-canonical-contract.trace";
export * from "./incident-recovery-profile-canonical-contract.summary";
export * from "./incident-recovery-profile-external-consumer-registry.types";
export * from "./incident-recovery-profile-external-consumer-registry";
export * from "./incident-recovery-profile-external-consumer-registry.registry";
export * from "./incident-recovery-profile-external-consumer-registry.loader";
export * from "./incident-recovery-profile-external-consumer-registry.resolver";
export * from "./incident-recovery-profile-external-consumer-registry.consumer";
export * from "./incident-recovery-profile-external-consumer-registry.compatibility";
export * from "./incident-recovery-profile-external-consumer-registry.trace";
export * from "./incident-recovery-profile-external-consumer-registry.summary";
export * from "./incident-recovery-profile-external-consumer-registry.report";
export * from "./incident-recovery-profile-external-consumer-registry-config.types";
export * from "./incident-recovery-profile-external-consumer-registry-config";
export * from "./incident-recovery-profile-external-consumer-registry-config.loader";
export * from "./incident-recovery-profile-external-consumer-registry-config.merge";
export * from "./incident-recovery-profile-external-consumer-registry-config.registry";
export * from "./incident-recovery-profile-external-consumer-registry-config.trace";
export * from "./incident-recovery-profile-external-consumer-registry-config.summary";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.loader";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.parser";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.validator";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.resolver";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.trace";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.summary";
export * from "./incident-recovery-profile-external-consumer-registry-source-adapter.report";

import { buildV4OperationalIntelligenceRuntime } from "../intelligence";
import { buildGovernancePolicy } from "./policy";
import { buildGovernanceControls } from "./controls";
import { buildGovernanceApprovals } from "./approvals";
import { buildGovernanceEscalation } from "./escalation";
import { buildGovernanceExceptions } from "./exceptions";
import { buildGovernanceAuditTrail } from "./audit";
import { buildGovernanceSummary } from "./summary";
import { adaptGovernanceCandidates } from "./adapter";
import { loadGovernanceRulebook } from "./rulebook.loader";
import { evaluateGovernanceRulebook } from "./rulebook.evaluator";
import { buildGovernanceRulebookSnapshot, summarizeGovernanceRulebookEvaluation } from "./rulebook.summary";
import { loadGovernancePolicyPacks } from "./policy-pack.loader";
import {
  evaluateGovernancePolicyPack,
  selectGovernancePolicyPack,
} from "./policy-pack.evaluator";
import {
  buildGovernancePolicyPackSnapshot,
  summarizeGovernancePolicyPackEvaluation,
} from "./policy-pack.summary";
import { buildGovernanceOrchestration } from "./orchestration";
import { buildGovernanceLifecycle } from "./lifecycle";
import { buildGovernancePersistence } from "./persistence";
import { buildGovernanceStoreRuntime } from "./store";
import { buildGovernanceRecovery } from "./recovery";
import { buildIncidentRecoveryProfileRuntime } from "./incident-recovery-profile";
import { buildIncidentRecoveryProfileConfigRuntime } from "./incident-recovery-profile-config";
import { buildIncidentRecoveryProfileJsonSourceRuntime } from "./incident-recovery-profile-config.json-source";
import { buildIncidentRecoveryProfileJsonSchemaGuard } from "./incident-recovery-profile-config.json-schema-guard";
import { buildIncidentRecoveryProfileJsonSchemaEvolution } from "./incident-recovery-profile-config.json-schema-evolution";
import { buildIncidentRecoveryProfileMigrationRuleRegistryRuntime } from "./incident-recovery-profile-migration-rule-registry";
import { buildIncidentRecoveryProfileRenderingPolicyRuntime } from "./incident-recovery-profile-rendering-policy";
import { buildIncidentRecoveryProfileMigrationExecutionRuntime } from "./incident-recovery-profile-migration-execution";
import { buildIncidentRecoveryProfileCanonicalContractRuntime } from "./incident-recovery-profile-canonical-contract";
import { buildIncidentRecoveryProfileExternalConsumerRegistryRuntime } from "./incident-recovery-profile-external-consumer-registry";
import { buildIncidentRecoveryProfileExternalConsumerRegistryConfigRuntime } from "./incident-recovery-profile-external-consumer-registry-config";
import { buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterRuntime } from "./incident-recovery-profile-external-consumer-registry-source-adapter";
import {
  V4A3_OPERATIONAL_GOVERNANCE_VERSION,
  type OperationalGovernanceRuntimeInput,
  type OperationalGovernanceRuntimeResult,
} from "./types";

export function buildOperationalGovernanceRuntime(
  input?: OperationalGovernanceRuntimeInput,
): OperationalGovernanceRuntimeResult {
  const deploymentId = input?.deploymentId ?? "v4-operational-governance";
  const intelligence =
    input?.intelligence ??
    buildV4OperationalIntelligenceRuntime({ deploymentId: `${deploymentId}-intelligence` });
  const observedAt = intelligence.signals.collectedAt;

  const policy = buildGovernancePolicy({ deploymentId, intelligence });
  const candidates = adaptGovernanceCandidates({ deploymentId, intelligence });
  const rulebook = loadGovernanceRulebook();
  const rulebookEvaluation = evaluateGovernanceRulebook({ candidates, rulebook });
  const rulebookSnapshot = buildGovernanceRulebookSnapshot({ rulebook });
  const rulebookSummary = summarizeGovernanceRulebookEvaluation({
    evaluation: rulebookEvaluation,
    snapshot: rulebookSnapshot,
  });

  const policyPacks = loadGovernancePolicyPacks();
  const selectedPolicyPack = selectGovernancePolicyPack({
    deploymentId,
    intelligence,
    packs: policyPacks,
  });
  const policyPackEvaluation = evaluateGovernancePolicyPack({
    deploymentId,
    intelligence,
    candidates,
    rulebookEvaluation,
    packs: policyPacks,
  });
  const policyPackSnapshot = buildGovernancePolicyPackSnapshot({
    pack: selectedPolicyPack,
    packs: policyPacks,
  });
  const policyPackSummary = summarizeGovernancePolicyPackEvaluation({
    evaluation: policyPackEvaluation,
    snapshot: policyPackSnapshot,
  });
  const ruleEvaluation = policyPackEvaluation.adjustedRuleEvaluation;

  const orchestration = buildGovernanceOrchestration({
    deploymentId,
    observedAt,
    policyPackMode: policyPackEvaluation.mode,
    ruleEvaluation,
    rulebookEvaluation,
    policyPackEvaluation,
  });
  const lifecycle = buildGovernanceLifecycle({
    deploymentId,
    observedAt,
    orchestration,
  });
  const persistence = buildGovernancePersistence({
    runtimeName: "V4-A3 Operational Governance Runtime",
    runtimeVersion: V4A3_OPERATIONAL_GOVERNANCE_VERSION,
    inputSnapshot: {
      deploymentId,
      intelligenceRuntimeId: intelligence.runtimeId,
      intelligenceSummary: intelligence.summary.summary,
    },
    rulebookVersion: rulebook.version,
    policyPackVersion: selectedPolicyPack.version,
    policyPackMode: policyPackEvaluation.mode,
    orchestration,
    lifecycle,
    summaryText: lifecycle.summary.text,
  });
  const store = buildGovernanceStoreRuntime({
    persistence,
    keyspace: deploymentId,
    backend: "memory",
  });
  const recovery = buildGovernanceRecovery({
    deploymentId,
    lifecycle,
    persistence,
    store,
  });
  const incidentRecoveryProfile = buildIncidentRecoveryProfileRuntime({
    deploymentId,
    lifecycle,
    persistence,
    store,
    recovery,
  });
  const incidentRecoveryProfileJsonSource = buildIncidentRecoveryProfileJsonSourceRuntime({
    deploymentId,
    jsonPath: input?.incidentRecoveryProfileJsonSourcePath,
    builtinProfiles: incidentRecoveryProfile.registry.profiles,
    builtinDecision: incidentRecoveryProfile.decision,
  });
  const incidentRecoveryProfileJsonSchemaGuard = buildIncidentRecoveryProfileJsonSchemaGuard({
    deploymentId,
    loaded: incidentRecoveryProfileJsonSource.loaded.loaded,
    schema: incidentRecoveryProfileJsonSource.parsedSchema,
  });
  const incidentRecoveryProfileJsonSchemaEvolution = buildIncidentRecoveryProfileJsonSchemaEvolution({
    deploymentId,
    schema: incidentRecoveryProfileJsonSource.parsedSchema,
    guardValid: incidentRecoveryProfileJsonSchemaGuard.valid,
  });
  const incidentRecoveryProfileMigrationRuleRegistry =
    buildIncidentRecoveryProfileMigrationRuleRegistryRuntime({
      deploymentId,
      evolution: incidentRecoveryProfileJsonSchemaEvolution,
    });
  const incidentRecoveryProfileRenderingPolicy =
    buildIncidentRecoveryProfileRenderingPolicyRuntime({
      deploymentId,
      mode: input?.incidentRecoveryProfileRenderingPolicyMode,
      migration: incidentRecoveryProfileMigrationRuleRegistry,
    });
  const incidentRecoveryProfileMigrationExecution =
    buildIncidentRecoveryProfileMigrationExecutionRuntime({
      deploymentId,
      mode:
        input?.incidentRecoveryProfileMigrationExecutionMode ??
        (incidentRecoveryProfileRenderingPolicy.mode === "lenient"
          ? "compat"
          : incidentRecoveryProfileRenderingPolicy.mode),
      evolution: incidentRecoveryProfileJsonSchemaEvolution,
      registry: incidentRecoveryProfileMigrationRuleRegistry,
      renderingPolicy: incidentRecoveryProfileRenderingPolicy,
      builtinProfiles: incidentRecoveryProfile.registry.profiles,
    });
  const incidentRecoveryProfileCanonicalContract =
    buildIncidentRecoveryProfileCanonicalContractRuntime({
      deploymentId,
      canonicalPayload: incidentRecoveryProfileMigrationExecution.canonical,
    });
  const incidentRecoveryProfileExternalConsumerRegistrySourceAdapter =
    buildIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterRuntime({
      deploymentId,
      sourceType: input?.incidentRecoveryProfileExternalConsumerRegistrySourceType,
      sourcePath: input?.incidentRecoveryProfileExternalConsumerRegistrySourcePath,
      inlineConfig: input?.incidentRecoveryProfileExternalConsumerRegistryConfig,
    });
  const incidentRecoveryProfileExternalConsumerRegistryConfig =
    buildIncidentRecoveryProfileExternalConsumerRegistryConfigRuntime({
      deploymentId,
      sourceAdapterResolved: incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.resolved,
      inlineConfig: input?.incidentRecoveryProfileExternalConsumerRegistryConfig,
    });
  const incidentRecoveryProfileExternalConsumerRegistry =
    buildIncidentRecoveryProfileExternalConsumerRegistryRuntime({
      deploymentId,
      canonicalContract: incidentRecoveryProfileCanonicalContract,
      requestedConsumerId: input?.incidentRecoveryProfileExternalConsumerId,
      externalConsumers:
        input?.incidentRecoveryProfileExternalConsumers ??
        incidentRecoveryProfileExternalConsumerRegistryConfig.mergedConsumers,
    });
  const externalConfig =
    incidentRecoveryProfileJsonSource.resolved.useJsonSource &&
    incidentRecoveryProfileJsonSchemaEvolution.evolvedSchema !== null &&
    incidentRecoveryProfileJsonSchemaGuard.valid
      ? {
          sourceType: "jsonLocal" as const,
          profileVersion: incidentRecoveryProfileJsonSchemaEvolution.evolvedSchema.version,
          mergeStrategy: incidentRecoveryProfileJsonSchemaEvolution.evolvedSchema.mergeStrategy,
          profiles: incidentRecoveryProfileJsonSchemaEvolution.evolvedSchema.profiles,
        }
      : input?.incidentRecoveryProfileConfig;
  const incidentRecoveryProfileConfig = buildIncidentRecoveryProfileConfigRuntime({
    deploymentId,
    incidentRecoveryProfile,
    inlineConfig: externalConfig,
  });
  const effectiveRecovery = {
    ...recovery,
    strategy: incidentRecoveryProfileConfig.resolved.decision.strategy,
    status: incidentRecoveryProfileConfig.resolved.decision.degradedMode
      ? "degraded"
      : recovery.status,
    trace: [...recovery.trace, `profile=${incidentRecoveryProfile.snapshot.profileId}`],
    summary: {
      ...recovery.summary,
      text: `${recovery.summary.text} profile=${incidentRecoveryProfile.snapshot.profileName} profileStrategy=${incidentRecoveryProfileConfig.resolved.decision.strategy}`,
    },
  };

  const controls = buildGovernanceControls(policy);
  const approvals = buildGovernanceApprovals(policy);
  const escalation = buildGovernanceEscalation({ policy, controls, approvals });
  const exceptions = buildGovernanceExceptions(policy);
  const auditTrail = buildGovernanceAuditTrail({
    observedAt,
    policy,
    controls,
    approvals,
    escalation,
  });

  const base: Omit<OperationalGovernanceRuntimeResult, "summary"> = {
    runtimeName: "V4-A3 Operational Governance Runtime",
    version: V4A3_OPERATIONAL_GOVERNANCE_VERSION,
    inputSnapshot: {
      deploymentId,
      intelligenceRuntimeId: intelligence.runtimeId,
      intelligenceSummary: intelligence.summary.summary,
    },
    policy,
    controls,
    approvals,
    escalation,
    exceptions,
    auditTrail,
    isGoverned: policy.length > 0 && controls.length > 0,
    needsHumanApproval:
      approvals.some((a) => a.required) ||
      ruleEvaluation.triggeredApprovals.length > 0 ||
      orchestration.state.requiresManualReview,
    needsEscalation:
      escalation.length > 0 ||
      ruleEvaluation.triggeredEscalations.length > 0 ||
      orchestration.plan.steps.some((s) => s.action === "escalate"),
    hasExceptions:
      exceptions.some((e) => e.active) || ruleEvaluation.triggeredExceptions.length > 0,
    controlCount: controls.length,
    approvalCount: approvals.filter((a) => a.required).length,
    escalationCount: escalation.length,
    governanceRules: ruleEvaluation.governanceRules,
    matchedRules: ruleEvaluation.matchedRules,
    unmatchedRules: ruleEvaluation.unmatchedRules,
    triggeredControls: ruleEvaluation.triggeredControls,
    triggeredApprovals: ruleEvaluation.triggeredApprovals,
    triggeredEscalations: ruleEvaluation.triggeredEscalations,
    triggeredExceptions: ruleEvaluation.triggeredExceptions,
    governanceScore: ruleEvaluation.governanceScore,
    governanceConfidence: ruleEvaluation.governanceConfidence,
    ruleTrace: ruleEvaluation.ruleTrace,
    rulebook,
    rulebookVersion: rulebook.version,
    rulebookSnapshot,
    rulebookMatches: rulebookEvaluation.matches,
    rulebookRules: rulebook.entries,
    rulebookEvaluation,
    rulebookSummary,
    policyPack: selectedPolicyPack,
    policyPackVersion: selectedPolicyPack.version,
    policyPackSnapshot,
    policyPackMatches: policyPackEvaluation.matches,
    policyPackRules: policyPacks,
    policyPackEvaluation,
    policyPackSummary,
    policyPackMode: policyPackEvaluation.mode,
    policyPackOverrides: policyPackEvaluation.overrides,
    orchestration,
    orchestrationVersion: orchestration.version,
    orchestrationPlan: orchestration.plan,
    orchestrationState: orchestration.state,
    orchestrationTimeline: orchestration.timeline,
    orchestrationConflicts: orchestration.conflicts,
    orchestrationSummary: orchestration.summary.text,
    orchestrationQueue: orchestration.queue,
    lifecycle,
    lifecycleVersion: lifecycle.version,
    lifecycleState: lifecycle.state,
    lifecycleStatus: lifecycle.state.status,
    lifecycleTransitions: lifecycle.transitions,
    lifecycleTimeline: lifecycle.timeline,
    lifecycleRetries: lifecycle.retries,
    lifecycleReplay: lifecycle.replay,
    lifecycleArchive: lifecycle.archive,
    lifecycleSummary: lifecycle.summary.text,
    lifecycleSnapshots: lifecycle.snapshots,
    persistence,
    persistenceVersion: persistence.version,
    persistenceStatus: persistence.status,
    persistenceSnapshot: persistence.snapshot,
    persistenceSnapshotVersion: persistence.snapshot.snapshotVersion,
    persistenceCheckpoint: persistence.checkpoint,
    persistenceCheckpointVersion: persistence.checkpoint.checkpointVersion,
    persistenceRestore: persistence.restore,
    persistenceReplay: persistence.replay,
    persistenceMetadata: persistence.metadata,
    persistenceSummary: persistence.summary.text,
    store,
    storeVersion: store.version,
    storeBackend: store.backend,
    storeAdapter: store.adapter,
    storeRegistry: store.registry,
    storeTrace: store.trace,
    storeSummary: store.summary.text,
    storeStatus: store.status,
    storeOperations: store.operations,
    recovery: effectiveRecovery,
    recoveryVersion: effectiveRecovery.version,
    recoveryStrategy: effectiveRecovery.strategy,
    recoveryRollback: effectiveRecovery.rollback,
    recoveryReplay: effectiveRecovery.replay,
    recoveryPartial: effectiveRecovery.partial,
    recoveryDegraded: effectiveRecovery.degraded,
    recoveryAudit: effectiveRecovery.audit,
    recoverySummary: effectiveRecovery.summary.text,
    recoveryStatus: effectiveRecovery.status,
    recoveryTrace: effectiveRecovery.trace,
    incidentRecoveryProfile,
    incidentRecoveryProfileVersion: incidentRecoveryProfile.version,
    incidentRecoveryProfileSnapshot: incidentRecoveryProfile.snapshot,
    incidentRecoveryProfileMatches: incidentRecoveryProfile.matches,
    incidentRecoveryProfileRegistry: incidentRecoveryProfile.registry,
    incidentRecoveryProfileTrace: incidentRecoveryProfile.trace,
    incidentRecoveryProfileSummary: incidentRecoveryProfile.summary.text,
    incidentRecoveryProfileStatus: incidentRecoveryProfile.status,
    incidentRecoveryProfileDecision: incidentRecoveryProfile.decision,
    incidentRecoveryProfileConfig,
    incidentRecoveryProfileConfigVersion: incidentRecoveryProfileConfig.version,
    incidentRecoveryProfileConfigSnapshot: incidentRecoveryProfileConfig.snapshot,
    incidentRecoveryProfileConfigSource: incidentRecoveryProfileConfig.source,
    incidentRecoveryProfileConfigResolved: incidentRecoveryProfileConfig.resolved,
    incidentRecoveryProfileConfigMerged: incidentRecoveryProfileConfig.merged,
    incidentRecoveryProfileConfigRegistry: incidentRecoveryProfileConfig.registry,
    incidentRecoveryProfileConfigTrace: incidentRecoveryProfileConfig.trace,
    incidentRecoveryProfileConfigSummary: incidentRecoveryProfileConfig.summary.text,
    incidentRecoveryProfileConfigStatus: incidentRecoveryProfileConfig.status,
    incidentRecoveryProfileJsonSource: incidentRecoveryProfileJsonSource,
    incidentRecoveryProfileJsonSourceVersion: incidentRecoveryProfileJsonSource.version,
    incidentRecoveryProfileJsonSourcePath: incidentRecoveryProfileJsonSource.path,
    incidentRecoveryProfileJsonSourceSnapshot: incidentRecoveryProfileJsonSource.snapshot,
    incidentRecoveryProfileJsonSourceLoaded: incidentRecoveryProfileJsonSource.loaded,
    incidentRecoveryProfileJsonSourceValidated: incidentRecoveryProfileJsonSource.validated,
    incidentRecoveryProfileJsonSourceResolved: incidentRecoveryProfileJsonSource.resolved,
    incidentRecoveryProfileJsonSourceMerged: incidentRecoveryProfileJsonSource.merged,
    incidentRecoveryProfileJsonSourceTrace: incidentRecoveryProfileJsonSource.trace,
    incidentRecoveryProfileJsonSourceSummary: incidentRecoveryProfileJsonSource.summary.text,
    incidentRecoveryProfileJsonSourceStatus: incidentRecoveryProfileJsonSource.status,
    incidentRecoveryProfileJsonSchemaGuard,
    incidentRecoveryProfileJsonSchemaGuardVersion: incidentRecoveryProfileJsonSchemaGuard.version,
    incidentRecoveryProfileJsonSchemaGuardSummary: incidentRecoveryProfileJsonSchemaGuard.summary.text,
    incidentRecoveryProfileJsonSchemaGuardStatus: incidentRecoveryProfileJsonSchemaGuard.status,
    incidentRecoveryProfileJsonSchemaEvolution,
    incidentRecoveryProfileJsonSchemaEvolutionVersion: incidentRecoveryProfileJsonSchemaEvolution.version,
    incidentRecoveryProfileJsonSchemaEvolutionSnapshot: incidentRecoveryProfileJsonSchemaEvolution.snapshot,
    incidentRecoveryProfileJsonSchemaEvolutionCompatibility: incidentRecoveryProfileJsonSchemaEvolution.compatibility,
    incidentRecoveryProfileJsonSchemaEvolutionMigrations: incidentRecoveryProfileJsonSchemaEvolution.migrations,
    incidentRecoveryProfileJsonSchemaEvolutionAliases: incidentRecoveryProfileJsonSchemaEvolution.aliases,
    incidentRecoveryProfileJsonSchemaEvolutionTrace: incidentRecoveryProfileJsonSchemaEvolution.trace,
    incidentRecoveryProfileJsonSchemaEvolutionSummary: incidentRecoveryProfileJsonSchemaEvolution.summary.text,
    incidentRecoveryProfileJsonSchemaEvolutionStatus: incidentRecoveryProfileJsonSchemaEvolution.status,
    incidentRecoveryProfileMigrationRuleRegistry,
    incidentRecoveryProfileMigrationRuleRegistryVersion:
      incidentRecoveryProfileMigrationRuleRegistry.version,
    incidentRecoveryProfileMigrationRuleRegistrySnapshot:
      incidentRecoveryProfileMigrationRuleRegistry.snapshot,
    incidentRecoveryProfileMigrationRuleRegistryMatches:
      incidentRecoveryProfileMigrationRuleRegistry.matches,
    incidentRecoveryProfileMigrationRuleRegistryTrace:
      incidentRecoveryProfileMigrationRuleRegistry.trace,
    incidentRecoveryProfileMigrationRuleRegistrySummary:
      incidentRecoveryProfileMigrationRuleRegistry.summary.text,
    incidentRecoveryProfileMigrationRuleRegistryStatus:
      incidentRecoveryProfileMigrationRuleRegistry.status,
    incidentRecoveryProfileRenderingPolicy,
    incidentRecoveryProfileRenderingPolicyVersion: incidentRecoveryProfileRenderingPolicy.version,
    incidentRecoveryProfileRenderingPolicySnapshot: incidentRecoveryProfileRenderingPolicy.snapshot,
    incidentRecoveryProfileRenderingPolicyMatches: incidentRecoveryProfileRenderingPolicy.matches,
    incidentRecoveryProfileRenderingPolicyTrace: incidentRecoveryProfileRenderingPolicy.trace,
    incidentRecoveryProfileRenderingPolicySummary: incidentRecoveryProfileRenderingPolicy.summary.text,
    incidentRecoveryProfileRenderingPolicyStatus: incidentRecoveryProfileRenderingPolicy.status,
    incidentRecoveryProfileRenderingPolicyMode: incidentRecoveryProfileRenderingPolicy.mode,
    incidentRecoveryProfileMigrationExecution,
    incidentRecoveryProfileMigrationExecutionVersion: incidentRecoveryProfileMigrationExecution.version,
    incidentRecoveryProfileMigrationExecutionPlan: incidentRecoveryProfileMigrationExecution.plan,
    incidentRecoveryProfileMigrationExecutionCanonical:
      incidentRecoveryProfileMigrationExecution.canonical,
    incidentRecoveryProfileMigrationExecutionFallback:
      incidentRecoveryProfileMigrationExecution.fallback,
    incidentRecoveryProfileMigrationExecutionTrace: incidentRecoveryProfileMigrationExecution.trace,
    incidentRecoveryProfileMigrationExecutionSummary:
      incidentRecoveryProfileMigrationExecution.summary.text,
    incidentRecoveryProfileMigrationExecutionStatus: incidentRecoveryProfileMigrationExecution.status,
    incidentRecoveryProfileMigrationExecutionMode: incidentRecoveryProfileMigrationExecution.mode,
    incidentRecoveryProfileCanonicalContract,
    incidentRecoveryProfileCanonicalContractVersion: incidentRecoveryProfileCanonicalContract.version,
    incidentRecoveryProfileCanonicalContractSnapshot: incidentRecoveryProfileCanonicalContract.snapshot,
    incidentRecoveryProfileCanonicalContractConsumer: incidentRecoveryProfileCanonicalContract.consumer,
    incidentRecoveryProfileCanonicalContractConsumerVersion:
      incidentRecoveryProfileCanonicalContract.consumerVersion,
    incidentRecoveryProfileCanonicalContractCompatibility:
      incidentRecoveryProfileCanonicalContract.compatibility,
    incidentRecoveryProfileCanonicalContractMatrix: incidentRecoveryProfileCanonicalContract.matrix,
    incidentRecoveryProfileCanonicalContractReport: incidentRecoveryProfileCanonicalContract.report,
    incidentRecoveryProfileCanonicalContractTrace: incidentRecoveryProfileCanonicalContract.trace,
    incidentRecoveryProfileCanonicalContractSummary:
      incidentRecoveryProfileCanonicalContract.summary.text,
    incidentRecoveryProfileCanonicalContractStatus: incidentRecoveryProfileCanonicalContract.status,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapter,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.version,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSnapshot:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.snapshot,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.source,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoaded:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.loaded,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterValidated:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.validated,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolved:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.resolved,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.trace,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.summary.text,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.report,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus:
      incidentRecoveryProfileExternalConsumerRegistrySourceAdapter.status,
    incidentRecoveryProfileExternalConsumerRegistryConfig,
    incidentRecoveryProfileExternalConsumerRegistryConfigVersion:
      incidentRecoveryProfileExternalConsumerRegistryConfig.version,
    incidentRecoveryProfileExternalConsumerRegistryConfigSnapshot:
      incidentRecoveryProfileExternalConsumerRegistryConfig.snapshot,
    incidentRecoveryProfileExternalConsumerRegistryConfigConsumers:
      incidentRecoveryProfileExternalConsumerRegistryConfig.mergedConsumers,
    incidentRecoveryProfileExternalConsumerRegistryConfigResolvedConsumer:
      incidentRecoveryProfileExternalConsumerRegistryConfig.resolvedConsumer,
    incidentRecoveryProfileExternalConsumerRegistryConfigCompatibility:
      incidentRecoveryProfileExternalConsumerRegistryConfig.compatibility,
    incidentRecoveryProfileExternalConsumerRegistryConfigTrace:
      incidentRecoveryProfileExternalConsumerRegistryConfig.trace,
    incidentRecoveryProfileExternalConsumerRegistryConfigSummary:
      incidentRecoveryProfileExternalConsumerRegistryConfig.summary.text,
    incidentRecoveryProfileExternalConsumerRegistryConfigReport:
      incidentRecoveryProfileExternalConsumerRegistryConfig.report,
    incidentRecoveryProfileExternalConsumerRegistryConfigStatus:
      incidentRecoveryProfileExternalConsumerRegistryConfig.status,
    incidentRecoveryProfileExternalConsumerRegistry,
    incidentRecoveryProfileExternalConsumerRegistryVersion:
      incidentRecoveryProfileExternalConsumerRegistry.version,
    incidentRecoveryProfileExternalConsumerRegistrySnapshot:
      incidentRecoveryProfileExternalConsumerRegistry.snapshot,
    incidentRecoveryProfileExternalConsumerRegistryConsumers:
      incidentRecoveryProfileExternalConsumerRegistry.consumers,
    incidentRecoveryProfileExternalConsumerRegistryResolvedConsumer:
      incidentRecoveryProfileExternalConsumerRegistry.resolvedConsumer,
    incidentRecoveryProfileExternalConsumerRegistryCompatibility:
      incidentRecoveryProfileExternalConsumerRegistry.compatibility,
    incidentRecoveryProfileExternalConsumerRegistryTrace:
      incidentRecoveryProfileExternalConsumerRegistry.trace,
    incidentRecoveryProfileExternalConsumerRegistrySummary:
      incidentRecoveryProfileExternalConsumerRegistry.summary.text,
    incidentRecoveryProfileExternalConsumerRegistryReport:
      incidentRecoveryProfileExternalConsumerRegistry.report,
    incidentRecoveryProfileExternalConsumerRegistryStatus:
      incidentRecoveryProfileExternalConsumerRegistry.status,
  };

  return {
    ...base,
    summary: buildGovernanceSummary(base),
  };
}
