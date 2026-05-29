/**
 * V4-A3 Operational Governance Runtime — verification
 */
import {
  buildGovernanceRuleRegistry,
  evaluateGovernanceRules,
  adaptGovernanceCandidates,
  loadGovernanceRulebook,
  buildGovernanceRulebookRegistry,
  evaluateGovernanceRulebook,
  buildGovernanceRulebookSnapshot,
  summarizeGovernanceRulebookEvaluation,
  DEFAULT_RULEBOOK_VERSION,
  DEFAULT_POLICY_PACK_VERSION,
  loadGovernancePolicyPacks,
  buildGovernancePolicyPackRegistry,
  evaluateGovernancePolicyPack,
  GOVERNANCE_ORCHESTRATION_VERSION,
  GOVERNANCE_LIFECYCLE_VERSION,
  GOVERNANCE_PERSISTENCE_VERSION,
  GOVERNANCE_STORE_VERSION,
  GOVERNANCE_RECOVERY_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION,
  GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION,
  GOVERNANCE_FEDERATION_RUNTIME_VERSION,
  GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION,
  GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION,
  GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION,
  GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION,
  GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION,
  GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION,
  GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION,
  GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION,
  GOVERNANCE_PLATFORM_BASELINE_VERSION,
  buildOperationalGovernanceRuntime,
} from "../lib/operations/governance";
import { buildV4OperationalIntelligenceRuntime } from "../lib/operations/intelligence";

const DEPLOYMENT_ID = "v4-verify-governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const intelligence = buildV4OperationalIntelligenceRuntime({
    deploymentId: `${DEPLOYMENT_ID}-intelligence`,
  });
  const rulebook = loadGovernanceRulebook();
  assert(rulebook.version === DEFAULT_RULEBOOK_VERSION, "default rulebook version");
  assert(rulebook.entries.length >= 7, "rulebook base rules exist");
  const rulebookRegistry = buildGovernanceRulebookRegistry({ rulebook });
  assert(rulebookRegistry.activeVersion === DEFAULT_RULEBOOK_VERSION, "rulebook registry version");
  const candidates = adaptGovernanceCandidates({ deploymentId: DEPLOYMENT_ID, intelligence });
  const rulebookEval = evaluateGovernanceRulebook({ candidates, rulebook });
  const rulebookSnapshot = buildGovernanceRulebookSnapshot({ rulebook });
  const rulebookSummary = summarizeGovernanceRulebookEvaluation({
    evaluation: rulebookEval,
    snapshot: rulebookSnapshot,
  });
  assert(rulebookSummary.length > 0, "rulebook summary non-empty");

  const registry = buildGovernanceRuleRegistry();
  assert(registry.rules.length >= 8, "base rules exist");
  const evalResult = evaluateGovernanceRules(candidates);
  assert(evalResult.matchedRules.length >= 1, "rule matcher hit");
  assert(evalResult.ruleTrace.length >= 8, "rule trace covers rulebook");

  const stressedCandidates = [
    ...candidates,
    {
      candidateId: "cand-rec-stress",
      kind: "recommendation" as const,
      refId: "rec-stress",
      priority: "critical" as const,
      confidence: 55,
      title: "Immediate remediation required",
      evidence: ["a", "b", "c"],
    },
    {
      candidateId: "cand-anomaly-stress",
      kind: "anomaly" as const,
      refId: "an-stress",
      priority: "critical" as const,
      confidence: 88,
      title: "Critical anomaly burst",
      evidence: ["burst"],
    },
  ];
  const stressedEval = evaluateGovernanceRules(stressedCandidates);
  assert(stressedEval.triggeredApprovals.length >= 1, "stressed approval trigger");
  assert(stressedEval.triggeredEscalations.length >= 1, "stressed escalation trigger");

  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: DEPLOYMENT_ID,
    intelligence,
  });
  assert(runtime.summary.text.length > 0, "summary non-empty");
  assert(Array.isArray(runtime.policy), "policy exists");
  assert(Array.isArray(runtime.controls), "controls exists");
  assert(Array.isArray(runtime.approvals), "approvals exists");
  assert(Array.isArray(runtime.escalation), "escalation exists");
  assert(Array.isArray(runtime.exceptions), "exceptions exists");
  assert(runtime.auditTrail.auditId.length > 0, "audit trail exists");
  assert(runtime.inputSnapshot.intelligenceRuntimeId.length > 0, "intelligence linked");
  assert(runtime.ruleTrace.length > 0, "rule trace exists");
  assert(runtime.governanceScore >= 0 && runtime.governanceScore <= 100, "governance score valid");
  assert(["low", "medium", "high"].includes(runtime.governanceConfidence), "governance confidence valid");
  assert(runtime.rulebookVersion === DEFAULT_RULEBOOK_VERSION, "runtime rulebook version");
  assert(runtime.rulebookMatches.length > 0, "runtime rulebook matches");
  assert(runtime.rulebookRules.length >= 7, "runtime rulebook rules");
  assert(runtime.rulebookSummary.length > 0, "runtime rulebook summary");

  const packs = loadGovernancePolicyPacks();
  assert(packs.length >= 3, "policy pack loaded");
  const packRegistry = buildGovernancePolicyPackRegistry({ packs });
  assert(packRegistry.defaultMode === "standard", "policy pack default mode");
  const packEval = evaluateGovernancePolicyPack({
    deploymentId: DEPLOYMENT_ID,
    intelligence,
    candidates,
    rulebookEvaluation: rulebookEval,
    packs,
  });
  assert(packEval.selectedPackId.length > 0, "policy pack selected");
  assert(runtime.policyPackSummary.length > 0, "policy pack summary");
  assert(runtime.policyPackMatches.length > 0, "policy pack matches");
  assert(runtime.policyPackMode === packEval.mode, "runtime policy pack mode");
  assert(runtime.policyPackVersion === DEFAULT_POLICY_PACK_VERSION, "policy pack version");

  assert(runtime.orchestrationVersion === GOVERNANCE_ORCHESTRATION_VERSION, "orchestration version");
  assert(runtime.orchestrationPlan.steps.length > 0, "orchestration plan");
  assert(runtime.orchestrationState.totalSteps > 0, "orchestration state");
  assert(runtime.orchestrationTimeline.entries.length > 0, "orchestration timeline");
  assert(Array.isArray(runtime.orchestrationConflicts), "orchestration conflicts");
  assert(runtime.orchestrationSummary.length > 0, "orchestration summary");
  assert(runtime.orchestrationQueue.length > 0, "orchestration queue");
  assert(runtime.lifecycleVersion === GOVERNANCE_LIFECYCLE_VERSION, "lifecycle version");
  assert(runtime.lifecycleState.status.length > 0, "lifecycle state");
  assert(runtime.lifecycleTransitions.length > 0, "lifecycle transitions");
  assert(runtime.lifecycleRetries.length >= 0, "lifecycle retries");
  assert(runtime.lifecycleReplay.supported, "lifecycle replay");
  assert(runtime.lifecycleArchive.archiveId.length > 0, "lifecycle archive");
  assert(runtime.lifecycleSnapshots.length > 0, "lifecycle snapshots");
  assert(runtime.lifecycleSummary.length > 0, "lifecycle summary");
  assert(runtime.persistenceVersion === GOVERNANCE_PERSISTENCE_VERSION, "persistence version");
  assert(runtime.persistenceSnapshot.snapshotId.length > 0, "persistence snapshot");
  assert(runtime.persistenceCheckpoint.checkpointId.length > 0, "persistence checkpoint");
  assert(runtime.persistenceRestore.restored, "persistence restore");
  assert(runtime.persistenceReplay.replayable, "persistence replay");
  assert(runtime.persistenceMetadata.schemaVersion.length > 0, "persistence metadata");
  assert(runtime.persistenceSummary.length > 0, "persistence summary");
  assert(runtime.storeVersion === GOVERNANCE_STORE_VERSION, "store version");
  assert(runtime.storeBackend === "memory", "store backend");
  assert(runtime.store.loaded.snapshot !== null, "store snapshot load");
  assert(runtime.store.loaded.checkpoint !== null, "store checkpoint load");
  assert(runtime.store.loaded.archive !== null, "store archive load");
  assert(runtime.storeTrace.operations.length > 0, "store trace");
  assert(runtime.storeSummary.length > 0, "store summary");
  assert(runtime.recoveryVersion === GOVERNANCE_RECOVERY_VERSION, "recovery version");
  assert(runtime.recoveryRollback.executed, "recovery rollback");
  assert(runtime.recoveryReplay.executed, "recovery replay");
  assert(runtime.recoveryPartial.executed, "recovery partial");
  assert(typeof runtime.recoveryDegraded.active === "boolean", "recovery degraded evaluated");
  assert(runtime.recoveryAudit.actions.length > 0, "recovery audit");
  assert(runtime.recoverySummary.length > 0, "recovery summary");
  assert(runtime.recoveryTrace.length > 0, "recovery trace");
  assert(runtime.incidentRecoveryProfileVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION, "incident profile version");
  assert(runtime.incidentRecoveryProfileRegistry.profiles.length >= 3, "incident profile registry");
  assert(runtime.incidentRecoveryProfileMatches.length > 0, "incident profile matches");
  assert(runtime.incidentRecoveryProfileTrace.candidateProfiles.length > 0, "incident profile trace");
  assert(runtime.incidentRecoveryProfileSummary.length > 0, "incident profile summary");
  assert(runtime.incidentRecoveryProfileDecision.strategy === runtime.recoveryStrategy, "profile affects recovery strategy");
  assert(runtime.incidentRecoveryProfileConfigVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION, "incident profile config version");
  assert(runtime.incidentRecoveryProfileConfigSnapshot.profileVersion.length > 0, "incident profile config snapshot");
  assert(runtime.incidentRecoveryProfileConfigSource.sourceId.length > 0, "incident profile config source");
  assert(runtime.incidentRecoveryProfileConfigResolved.selectedProfileId.length > 0, "incident profile config resolved");
  assert(runtime.incidentRecoveryProfileConfigMerged.length > 0, "incident profile config merge");
  assert(runtime.incidentRecoveryProfileConfigRegistry.sources.length > 0, "incident profile config registry");
  assert(runtime.incidentRecoveryProfileConfigTrace.traceId.length > 0, "incident profile config trace");
  assert(runtime.incidentRecoveryProfileConfigSummary.length > 0, "incident profile config summary");
  assert(runtime.incidentRecoveryProfileConfigResolved.decision.strategy === runtime.recoveryStrategy, "config affects final strategy");
  assert(runtime.incidentRecoveryProfileJsonSourceVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION, "incident profile json source version");
  assert(runtime.incidentRecoveryProfileJsonSourcePath.length > 0, "incident profile json source path");
  assert(typeof runtime.incidentRecoveryProfileJsonSourceLoaded.loaded === "boolean", "incident profile json source loaded");
  assert(Array.isArray(runtime.incidentRecoveryProfileJsonSourceValidated.errors), "incident profile json source validated");
  assert(runtime.incidentRecoveryProfileJsonSourceResolved.decision.strategy.length > 0, "incident profile json source resolved");
  assert(runtime.incidentRecoveryProfileJsonSourceMerged.mergedProfiles.length > 0, "incident profile json source merged");
  assert(runtime.incidentRecoveryProfileJsonSourceTrace.traceId.length > 0, "incident profile json source trace");
  assert(runtime.incidentRecoveryProfileJsonSourceSummary.length > 0, "incident profile json source summary");
  assert(runtime.incidentRecoveryProfileJsonSourceResolved.decision.strategy === runtime.recoveryStrategy, "json source keeps strategy compatibility");
  assert(runtime.incidentRecoveryProfileJsonSchemaGuardVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION, "json schema guard version");
  assert(runtime.incidentRecoveryProfileJsonSchemaGuardSummary.length > 0, "json schema guard summary");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION, "json schema evolution version");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionCompatibility.length > 0, "json schema evolution compatibility");
  assert(Array.isArray(runtime.incidentRecoveryProfileJsonSchemaEvolutionMigrations), "json schema evolution migrations");
  assert(Array.isArray(runtime.incidentRecoveryProfileJsonSchemaEvolutionAliases), "json schema evolution aliases");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionTrace.traceId.length > 0, "json schema evolution trace");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionSummary.length > 0, "json schema evolution summary");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistryVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION, "migration registry version");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistryMatches.length > 0, "migration registry matches");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistryTrace.traceId.length > 0, "migration registry trace");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistrySummary.length > 0, "migration registry summary");
  assert(runtime.incidentRecoveryProfileRenderingPolicyVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION, "rendering policy version");
  assert(["strict", "lenient", "audit", "compat"].includes(runtime.incidentRecoveryProfileRenderingPolicyMode), "rendering policy mode");
  assert(runtime.incidentRecoveryProfileRenderingPolicyMatches.length > 0, "rendering policy matches");
  assert(runtime.incidentRecoveryProfileRenderingPolicyTrace.traceId.length > 0, "rendering policy trace");
  assert(runtime.incidentRecoveryProfileRenderingPolicySummary.length > 0, "rendering policy summary");
  assert(runtime.incidentRecoveryProfileMigrationExecutionVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION, "migration execution version");
  assert(runtime.incidentRecoveryProfileMigrationExecutionPlan.orderedSteps.length > 0, "migration execution plan");
  assert(runtime.incidentRecoveryProfileMigrationExecutionCanonical.canonicalProfiles.length > 0, "migration execution canonical");
  assert(runtime.incidentRecoveryProfileMigrationExecutionTrace.traceId.length > 0, "migration execution trace");
  assert(runtime.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "migration execution summary");
  assert(["strict", "compat", "audit", "dry-run"].includes(runtime.incidentRecoveryProfileMigrationExecutionMode), "migration execution mode");
  assert(
    runtime.incidentRecoveryProfileCanonicalContractVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
    "canonical contract version",
  );
  assert(runtime.incidentRecoveryProfileCanonicalContractMatrix.entries.length >= 6, "canonical contract matrix");
  assert(runtime.incidentRecoveryProfileCanonicalContractReport.consumerCount >= 6, "canonical contract report");
  assert(runtime.incidentRecoveryProfileCanonicalContractTrace.traceId.length > 0, "canonical contract trace");
  assert(runtime.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(
    ["compatible", "compatibleWithWarnings", "incompatible", "fallbackCompatible"].includes(
      runtime.incidentRecoveryProfileCanonicalContractStatus,
    ),
    "canonical contract status",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistryVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION,
    "external consumer registry version",
  );
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConsumers.length >= 3, "external consumer registered");
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistryResolvedConsumer.consumerId.length > 0,
    "external consumer resolved",
  );
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryTrace.traceId.length > 0, "external consumer trace");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryReport.consumerCount >= 3, "external consumer report");
  assert(
    ["resolved", "fallback", "incompatible"].includes(
      runtime.incidentRecoveryProfileExternalConsumerRegistryStatus,
    ),
    "external consumer status",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION,
    "external consumer source adapter version",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace.traceId.length > 0,
    "external consumer source adapter trace",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0,
    "external consumer source adapter summary",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport.reportId.length > 0,
    "external consumer source adapter report",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistryConfigVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION,
    "external consumer registry config version",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistryConfigConsumers.length >= 3,
    "external consumer registry config consumers",
  );
  assert(
    runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0,
    "external consumer registry config summary",
  );
  assert(
    runtime.consumerCapabilityNegotiationVersion === GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION,
    "consumer capability negotiation version",
  );
  assert(runtime.consumerCapabilityNegotiationResult.negotiationId.length > 0, "capability negotiation");
  assert(runtime.consumerCapabilityNegotiationResolvedCapabilities.length > 0, "capability resolved");
  assert(runtime.consumerCapabilityNegotiationDegradationPlan.steps.length > 0, "capability degradation");
  assert(runtime.consumerCapabilityNegotiationLineage.entries.length > 0, "capability lineage");
  assert(runtime.consumerCapabilityNegotiationAudit.length > 0, "capability audit");
  assert(runtime.consumerCapabilityNegotiationSummary.length > 0, "capability negotiation summary");
  assert(
    runtime.governanceFederationVersion === GOVERNANCE_FEDERATION_RUNTIME_VERSION,
    "federation runtime version",
  );
  assert(runtime.governanceFederationTopology.domains.length >= 4, "federation topology");
  assert(runtime.governanceFederationRouting.routingId.length > 0, "federation routing");
  assert(runtime.governanceFederationLineage.entries.length >= 4, "federation lineage");
  assert(runtime.governanceFederationSummary.length > 0, "federation summary");
  assert(
    runtime.governanceFederationConsensusVersion === GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION,
    "federation consensus version",
  );
  assert(runtime.governanceFederationConsensusNodes.length >= 4, "federation consensus nodes");
  assert(runtime.governanceFederationConsensusQuorum.participatingNodes.length > 0, "consensus quorum");
  assert(runtime.governanceFederationConsensusLineage.entries.length >= 5, "consensus lineage");
  assert(runtime.governanceFederationConsensusSummary.length > 0, "consensus summary");
  assert(
    runtime.governanceFederationPolicyPropagationVersion ===
      GOVERNANCE_FEDERATION_POLICY_PROPAGATION_RUNTIME_VERSION,
    "federation policy propagation version",
  );
  assert(runtime.governanceFederationPolicyPropagationBundle.bundleId.length > 0, "policy bundle");
  assert(runtime.governanceFederationPolicyPropagationSync.syncId.length > 0, "policy sync");
  assert(runtime.governanceFederationPolicyPropagationLineage.entries.length >= 8, "policy lineage");
  assert(runtime.governanceFederationPolicyPropagationSummary.length > 0, "policy propagation summary");
  assert(
    runtime.governanceFederationLifecycleContinuityVersion ===
      GOVERNANCE_FEDERATION_LIFECYCLE_CONTINUITY_RUNTIME_VERSION,
    "federation lifecycle continuity version",
  );
  assert(runtime.governanceFederationLifecycleContinuityDomainLifecycle.length >= 4, "domain lifecycle");
  assert(runtime.governanceFederationLifecycleContinuityHandoff.handoffId.length > 0, "continuity handoff");
  assert(runtime.governanceFederationLifecycleContinuityLineage.entries.length >= 8, "lifecycle lineage");
  assert(runtime.governanceFederationLifecycleContinuitySummary.length > 0, "lifecycle continuity summary");
  assert(
    runtime.governanceFederationObservabilityVersion ===
      GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION,
    "federation observability version",
  );
  assert(runtime.governanceFederationObservabilityHealth.healthScore >= 0, "observability health");
  assert(
    runtime.governanceFederationObservabilityGovernanceScore.compositeScore >= 0,
    "observability governance score",
  );
  assert(runtime.governanceFederationObservabilityLineage.entries.length >= 8, "observability lineage");
  assert(runtime.governanceFederationObservabilitySummary.length > 0, "observability summary");
  assert(
    runtime.governanceIntelligenceVersion === GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION,
    "governance intelligence version",
  );
  assert(runtime.governanceIntelligenceSignals.signals.length >= 10, "governance intelligence signals");
  assert(runtime.governanceIntelligenceRecommendations.length > 0, "governance intelligence recommendations");
  assert(runtime.governanceIntelligenceLineage.entries.length >= 8, "governance intelligence lineage");
  assert(runtime.governanceIntelligenceSummary.length > 0, "governance intelligence summary");
  assert(
    runtime.governanceAutonomousVersion === GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION,
    "governance autonomous version",
  );
  assert(runtime.governanceAutonomousProposals.length > 0, "autonomous proposals");
  assert(runtime.governanceAutonomousExecutionPlan.steps.length > 0, "autonomous execution plan");
  assert(runtime.governanceAutonomousLineage.entries.length >= 9, "autonomous lineage");
  assert(runtime.governanceAutonomousSummary.length > 0, "governance autonomous summary");
  assert(
    runtime.governanceSelfOptimizationVersion === GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION,
    "governance self-optimization version",
  );
  assert(runtime.governanceSelfOptimizationMechanisms.length >= 7, "self-optimization mechanisms");
  assert(runtime.governanceSelfOptimizationStrategies.length >= 6, "self-optimization strategies");
  assert(runtime.governanceSelfOptimizationLineage.entries.length >= 8, "self-optimization lineage");
  assert(runtime.governanceSelfOptimizationSummary.length > 0, "self-optimization summary");
  assert(
    runtime.governanceMetaGovernanceVersion === GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION,
    "governance meta-governance version",
  );
  assert(runtime.governanceMetaGovernanceInventory.length >= 9, "meta-governance inventory");
  assert(runtime.governanceMetaGovernanceDecisions.length >= 9, "meta-governance decisions");
  assert(runtime.governanceMetaGovernanceLineage.entries.length >= 6, "meta-governance lineage");
  assert(runtime.governanceMetaGovernanceSummary.length > 0, "meta-governance summary");
  assert(
    runtime.governancePlatformBaselineVersion === GOVERNANCE_PLATFORM_BASELINE_VERSION,
    "governance platform baseline version",
  );
  assert(runtime.governancePlatformBaselineInventory.length >= 30, "platform baseline inventory");
  assert(runtime.governancePlatformBaselineRelease.frozen === true, "platform baseline frozen");
  assert(runtime.governancePlatformBaselineLineage.entries.length >= 6, "platform baseline lineage");
  assert(runtime.governancePlatformBaselineSummary.length > 0, "platform baseline summary");

  assert(Array.isArray(runtime.policy), "legacy field policy compatibility");
  assert(Array.isArray(runtime.controls), "legacy field controls compatibility");
  console.log("✓ governance runtime build");
  console.log(
    `✓ rules loaded=${registry.rules.length} rulebook=${rulebook.entries.length} matched=${runtime.matchedRules.length}`,
  );
  console.log(" ", runtime.summary.text);
  console.log("All operational governance checks passed.");
}

main();
