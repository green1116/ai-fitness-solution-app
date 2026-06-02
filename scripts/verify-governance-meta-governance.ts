/**
 * V4-A3-R14 Operational Governance Meta-Governance Runtime — verification
 */
import {
  buildGovernanceMetaGovernanceRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION,
  buildGovernanceMechanismInventory,
  assessGovernanceComplexity,
  assessGovernanceEvolution,
  deriveGovernanceEvolutionDecisions,
  buildGovernanceStandardizationPlan,
  computeGovernanceMetaGovernanceScore,
  buildGovernanceMetaGovernanceLineageGraph,
  buildGovernanceMetaGovernanceAuditRecords,
  runGovernanceMetaGovernanceHooks,
  buildGovernanceSelfOptimizationRuntime,
  buildGovernanceAutonomousRuntime,
  buildGovernanceIntelligenceRuntime,
  buildGovernanceFederationObservabilityRuntime,
  buildGovernanceFederationRuntime,
  buildGovernanceFederationConsensusRuntime,
  buildGovernanceFederationPolicyPropagationRuntime,
  buildGovernanceFederationLifecycleContinuityRuntime,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-governance-meta-governance",
  });
  assert(
    runtime.governanceMetaGovernanceVersion === GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION,
    "meta-governance version",
  );
  assert(runtime.governanceMetaGovernanceInventory.length >= 9, "inventory");
  assert(runtime.governanceMetaGovernanceAssessment.assessmentId.length > 0, "assessment");
  assert(runtime.governanceMetaGovernanceDecisions.length >= 9, "decisions");
  assert(runtime.governanceMetaGovernanceComplexity.profileId.length > 0, "complexity");
  assert(runtime.governanceMetaGovernanceStandardization.planId.length > 0, "standardization");
  assert(runtime.governanceMetaGovernanceScore.compositeScore >= 0, "meta score");
  assert(runtime.governanceMetaGovernanceLineage.entries.length >= 6, "lineage");
  assert(runtime.governanceMetaGovernanceAudit.length > 0, "audit");
  assert(runtime.governanceMetaGovernanceHooks.length >= 6, "hooks");
  assert(runtime.governanceMetaGovernanceSummary.length > 0, "summary");
  assert(
    ["evolving", "stabilizing", "consolidating", "frozen"].includes(
      runtime.governanceMetaGovernanceStatus,
    ),
    "status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-meta-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-meta-consensus",
    federation,
  });
  const policyPropagation = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "unit-meta-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  const lifecycleContinuity = buildGovernanceFederationLifecycleContinuityRuntime({
    deploymentId: "unit-meta-lifecycle",
    federation,
    consensus,
    policyPropagation,
  });
  const observability = buildGovernanceFederationObservabilityRuntime({
    deploymentId: "unit-meta-obs",
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });
  const intelligence = buildGovernanceIntelligenceRuntime({
    deploymentId: "unit-meta-intel",
    observability,
    federation,
    lifecycleContinuity,
  });
  const autonomous = buildGovernanceAutonomousRuntime({
    deploymentId: "unit-meta-auto",
    intelligence,
    observability,
    federation,
    lifecycleContinuity,
  });
  const selfOptimization = buildGovernanceSelfOptimizationRuntime({
    deploymentId: "unit-meta-opt",
    observability,
    intelligence,
    autonomous,
  });

  const metaInput = {
    deploymentId: "unit-meta",
    selfOptimization,
    observability,
    intelligence,
    autonomous,
  };

  const inventory = buildGovernanceMechanismInventory(metaInput);
  assert(inventory.length >= 9, "unit inventory");
  const complexity = assessGovernanceComplexity({
    deploymentId: "unit-meta",
    inventory,
    selfOptimization,
  });
  assert(complexity.moduleCount >= 9, "unit complexity");
  const assessment = assessGovernanceEvolution({
    deploymentId: "unit-meta",
    inventory,
    complexity,
  });
  assert(assessment.assessmentId.length > 0, "unit assessment");
  const decisions = deriveGovernanceEvolutionDecisions({
    deploymentId: "unit-meta",
    inventory,
    assessment,
    selfOptimization,
    autonomous,
  });
  assert(decisions.length >= 9, "unit decisions");
  assert(
    decisions.some((d) =>
      ["retain", "upgrade", "merge", "standardize", "freeze", "retire", "deprecate"].includes(
        d.action,
      ),
    ),
    "evolution actions",
  );
  const standardization = buildGovernanceStandardizationPlan({
    deploymentId: "unit-meta",
    assessment,
    decisions,
  });
  assert(standardization.actions.length > 0, "unit standardization");
  const metaScore = computeGovernanceMetaGovernanceScore({
    deploymentId: "unit-meta",
    assessment,
    decisions,
    complexity,
  });
  assert(metaScore.compositeScore >= 0, "unit meta score");
  const lineage = buildGovernanceMetaGovernanceLineageGraph({
    deploymentId: "unit-meta",
    inventory,
    assessment,
    decisions,
    complexity,
    standardization,
    metaScore,
  });
  assert(lineage.entries.length >= 6, "unit lineage");
  const audit = buildGovernanceMetaGovernanceAuditRecords({
    metaGovernanceId: "unit-meta",
    federationId: selfOptimization.feedback.federationId,
    decisionCount: decisions.length,
    overComplex: assessment.overComplex,
    metaScore,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runGovernanceMetaGovernanceHooks({
    inventoryCount: inventory.length,
    decisionCount: decisions.length,
    overComplex: assessment.overComplex,
  });
  assert(hooks.some((h) => h.phase === "afterEvolutionDecisions"), "unit hooks");

  const direct = buildGovernanceMetaGovernanceRuntime(metaInput);
  assert(direct.registry.metaGovernanceId.length > 0, "direct registry");

  console.log("✓ governance meta-governance runtime");
  console.log(" ", runtime.governanceMetaGovernanceSummary);
  console.log("META-GOVERNANCE VERIFY PASS");
}

main();
