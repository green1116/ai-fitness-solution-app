/**
 * V4-A3-FINAL Governance Platform Baseline Freeze — verification
 */
import {
  buildGovernancePlatformBaselineRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_PLATFORM_BASELINE_VERSION,
  GOVERNANCE_PLATFORM_CAPABILITY_CATALOG,
  buildGovernanceCapabilityInventory,
  classifyGovernanceCapabilities,
  buildGovernanceCapabilityDependencyGraph,
  buildGovernanceComplexityReport,
  buildGovernanceBaselineReport,
  buildGovernanceReleaseBaseline,
  buildGovernancePlatformBaselineLineageGraph,
  buildGovernancePlatformBaselineAuditRecords,
  runGovernancePlatformBaselineHooks,
  collectGovernanceCapabilityVersions,
  buildGovernanceMetaGovernanceRuntime,
  buildGovernanceSelfOptimizationRuntime,
  buildGovernanceAutonomousRuntime,
  buildGovernanceIntelligenceRuntime,
  buildGovernanceFederationObservabilityRuntime,
  buildGovernanceFederationRuntime,
  buildGovernanceFederationConsensusRuntime,
  buildGovernanceFederationPolicyPropagationRuntime,
  buildGovernanceFederationLifecycleContinuityRuntime,
  V4A3_OPERATIONAL_GOVERNANCE_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-governance-platform-baseline",
  });
  assert(
    runtime.governancePlatformBaselineVersion === GOVERNANCE_PLATFORM_BASELINE_VERSION,
    "platform baseline version",
  );
  assert(
    runtime.governancePlatformBaselineInventory.length === GOVERNANCE_PLATFORM_CAPABILITY_CATALOG.length,
    "capability inventory complete",
  );
  assert(
    runtime.governancePlatformBaselineInventory.every((entry) => entry.present && entry.frozen),
    "all capabilities frozen",
  );
  assert(runtime.governancePlatformBaselineClassifications.length >= 8, "classifications");
  assert(
    runtime.governancePlatformBaselineDependencyGraph.edges.length >=
      GOVERNANCE_PLATFORM_CAPABILITY_CATALOG.length - 1,
    "dependency graph",
  );
  assert(
    runtime.governancePlatformBaselineComplexityReport.reportId.length > 0,
    "complexity report",
  );
  assert(runtime.governancePlatformBaselineReport.capabilityCount >= 30, "baseline report");
  assert(runtime.governancePlatformBaselineRelease.frozen === true, "release baseline frozen");
  assert(runtime.governancePlatformBaselineRelease.releaseTag === "V4-A3-FINAL", "release tag");
  assert(runtime.governancePlatformBaselineRelease.manifestDigest.length > 0, "manifest digest");
  assert(runtime.governancePlatformBaselineLineage.entries.length >= 6, "lineage");
  assert(runtime.governancePlatformBaselineAudit.length > 0, "audit");
  assert(runtime.governancePlatformBaselineHooks.length >= 4, "hooks");
  assert(runtime.governancePlatformBaselineSummary.length > 0, "summary");
  assert(runtime.governancePlatformBaselineStatus === "frozen", "baseline status frozen");

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-baseline-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-baseline-consensus",
    federation,
  });
  const policyPropagation = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "unit-baseline-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  const lifecycleContinuity = buildGovernanceFederationLifecycleContinuityRuntime({
    deploymentId: "unit-baseline-lifecycle",
    federation,
    consensus,
    policyPropagation,
  });
  const observability = buildGovernanceFederationObservabilityRuntime({
    deploymentId: "unit-baseline-obs",
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });
  const intelligence = buildGovernanceIntelligenceRuntime({
    deploymentId: "unit-baseline-intel",
    observability,
    federation,
    lifecycleContinuity,
  });
  const autonomous = buildGovernanceAutonomousRuntime({
    deploymentId: "unit-baseline-auto",
    intelligence,
    observability,
    federation,
    lifecycleContinuity,
  });
  const selfOptimization = buildGovernanceSelfOptimizationRuntime({
    deploymentId: "unit-baseline-opt",
    observability,
    intelligence,
    autonomous,
  });
  const metaGovernance = buildGovernanceMetaGovernanceRuntime({
    deploymentId: "unit-baseline-meta",
    selfOptimization,
    observability,
    intelligence,
    autonomous,
  });

  const capabilities = collectGovernanceCapabilityVersions({
    governanceRulesVersion: runtime.governanceRules.version,
    rulebookVersion: runtime.rulebookVersion,
    policyPackVersion: runtime.policyPackVersion,
    orchestrationVersion: runtime.orchestrationVersion,
    lifecycleVersion: runtime.lifecycleVersion,
    persistenceVersion: runtime.persistenceVersion,
    storeVersion: runtime.storeVersion,
    recoveryVersion: runtime.recoveryVersion,
    incidentRecoveryProfileVersion: runtime.incidentRecoveryProfileVersion,
    incidentRecoveryProfileConfigVersion: runtime.incidentRecoveryProfileConfigVersion,
    incidentRecoveryProfileJsonSourceVersion: runtime.incidentRecoveryProfileJsonSourceVersion,
    incidentRecoveryProfileJsonSchemaGuardVersion: runtime.incidentRecoveryProfileJsonSchemaGuardVersion,
    incidentRecoveryProfileJsonSchemaEvolutionVersion:
      runtime.incidentRecoveryProfileJsonSchemaEvolutionVersion,
    incidentRecoveryProfileMigrationRuleRegistryVersion:
      runtime.incidentRecoveryProfileMigrationRuleRegistryVersion,
    incidentRecoveryProfileRenderingPolicyVersion: runtime.incidentRecoveryProfileRenderingPolicyVersion,
    incidentRecoveryProfileMigrationExecutionVersion:
      runtime.incidentRecoveryProfileMigrationExecutionVersion,
    incidentRecoveryProfileCanonicalContractVersion: runtime.incidentRecoveryProfileCanonicalContractVersion,
    incidentRecoveryProfileExternalConsumerRegistryVersion:
      runtime.incidentRecoveryProfileExternalConsumerRegistryVersion,
    incidentRecoveryProfileExternalConsumerRegistryConfigVersion:
      runtime.incidentRecoveryProfileExternalConsumerRegistryConfigVersion,
    incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion:
      runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion,
    consumerCapabilityNegotiationVersion: runtime.consumerCapabilityNegotiationVersion,
    governanceFederationVersion: runtime.governanceFederationVersion,
    governanceFederationConsensusVersion: runtime.governanceFederationConsensusVersion,
    governanceFederationPolicyPropagationVersion: runtime.governanceFederationPolicyPropagationVersion,
    governanceFederationLifecycleContinuityVersion: runtime.governanceFederationLifecycleContinuityVersion,
    governanceFederationObservabilityVersion: runtime.governanceFederationObservabilityVersion,
    governanceIntelligenceVersion: runtime.governanceIntelligenceVersion,
    governanceAutonomousVersion: runtime.governanceAutonomousVersion,
    governanceSelfOptimizationVersion: runtime.governanceSelfOptimizationVersion,
    governanceMetaGovernanceVersion: runtime.governanceMetaGovernanceVersion,
  });

  const baselineInput = {
    deploymentId: "unit-baseline",
    platformVersion: V4A3_OPERATIONAL_GOVERNANCE_VERSION,
    capabilities,
    metaGovernance,
    selfOptimization,
  };

  const inventory = buildGovernanceCapabilityInventory(baselineInput);
  assert(inventory.length === GOVERNANCE_PLATFORM_CAPABILITY_CATALOG.length, "unit inventory");
  const classifications = classifyGovernanceCapabilities({
    deploymentId: "unit-baseline",
    inventory,
  });
  assert(classifications.length >= 8, "unit classifications");
  const dependencyGraph = buildGovernanceCapabilityDependencyGraph({
    deploymentId: "unit-baseline",
  });
  assert(dependencyGraph.edges.length >= 29, "unit dependency graph");
  const complexityReport = buildGovernanceComplexityReport({
    deploymentId: "unit-baseline",
    inventory,
    classifications,
    dependencyGraph,
    metaGovernance,
    selfOptimization,
  });
  assert(complexityReport.findings.length > 0, "unit complexity report");
  const baselineReport = buildGovernanceBaselineReport({
    runtimeInput: baselineInput,
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
  });
  assert(baselineReport.summary.length > 0, "unit baseline report");
  const releaseBaseline = buildGovernanceReleaseBaseline({
    runtimeInput: baselineInput,
    inventory,
  });
  assert(releaseBaseline.frozen === true, "unit release baseline");
  const lineage = buildGovernancePlatformBaselineLineageGraph({
    deploymentId: "unit-baseline",
    inventory,
    classifications,
    dependencyGraph,
    complexityReport,
    baselineReport,
    releaseBaseline,
  });
  assert(lineage.entries.length >= 6, "unit lineage");
  const audit = buildGovernancePlatformBaselineAuditRecords({
    baselineId: releaseBaseline.baselineId,
    deploymentId: "unit-baseline",
    capabilityCount: inventory.length,
    frozen: releaseBaseline.frozen,
    manifestDigest: releaseBaseline.manifestDigest,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runGovernancePlatformBaselineHooks({
    inventoryCount: inventory.length,
    frozenCount: inventory.filter((entry) => entry.frozen).length,
  });
  assert(hooks.some((hook) => hook.phase === "afterBaselineFreeze"), "unit hooks");

  const direct = buildGovernancePlatformBaselineRuntime(baselineInput);
  assert(direct.registry.baselineId.length > 0, "direct registry");

  console.log("✓ governance platform baseline freeze");
  console.log(" ", runtime.governancePlatformBaselineSummary);
  console.log("BASELINE FREEZE VERIFY PASS");
}

main();
