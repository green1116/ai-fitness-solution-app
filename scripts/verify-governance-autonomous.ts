/**
 * V4-A3-R12 Operational Governance Autonomous Runtime — verification
 */
import {
  buildGovernanceAutonomousRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION,
  buildAutonomousSignalBundle,
  analyzeAutonomousReadiness,
  buildGovernanceDecisionCandidates,
  buildGovernanceActionProposals,
  buildGovernanceExecutionPlan,
  buildGovernanceRemediationPlans,
  buildGovernanceOptimizationProposals,
  evaluateGovernanceApproval,
  computeGovernanceAutonomousScore,
  buildGovernanceAutonomousLineageGraph,
  buildGovernanceAutonomousAuditRecords,
  runGovernanceAutonomousHooks,
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
    deploymentId: "v4-verify-governance-autonomous",
  });
  assert(
    runtime.governanceAutonomousVersion === GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION,
    "autonomous version",
  );
  assert(runtime.governanceAutonomousSignals.signals.length > 0, "autonomous signals");
  assert(runtime.governanceAutonomousAnalysis.analysisId.length > 0, "autonomous analysis");
  assert(runtime.governanceAutonomousDecisions.length > 0, "decision candidates");
  assert(runtime.governanceAutonomousProposals.length > 0, "action proposals");
  assert(runtime.governanceAutonomousExecutionPlan.planId.length > 0, "execution plan");
  assert(runtime.governanceAutonomousExecutionPlan.steps.length > 0, "execution steps");
  assert(runtime.governanceAutonomousRemediations.length > 0, "remediations");
  assert(runtime.governanceAutonomousOptimizations.length > 0, "optimizations");
  assert(runtime.governanceAutonomousApproval.approvalId.length > 0, "approval");
  assert(runtime.governanceAutonomousScore.compositeScore >= 0, "autonomous score");
  assert(runtime.governanceAutonomousLineage.entries.length >= 9, "autonomous lineage");
  assert(runtime.governanceAutonomousAudit.length > 0, "autonomous audit");
  assert(runtime.governanceAutonomousHooks.length >= 8, "autonomous hooks");
  assert(runtime.governanceAutonomousSummary.length > 0, "autonomous summary");
  assert(
    ["advisory", "proposed", "planned", "awaiting_approval", "autopilot_ready"].includes(
      runtime.governanceAutonomousStatus,
    ),
    "autonomous status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-auto-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-auto-consensus",
    federation,
  });
  const policyPropagation = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "unit-auto-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  const lifecycleContinuity = buildGovernanceFederationLifecycleContinuityRuntime({
    deploymentId: "unit-auto-lifecycle",
    federation,
    consensus,
    policyPropagation,
  });
  const observability = buildGovernanceFederationObservabilityRuntime({
    deploymentId: "unit-auto-obs",
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });
  const intelligence = buildGovernanceIntelligenceRuntime({
    deploymentId: "unit-auto-intel",
    observability,
    federation,
    lifecycleContinuity,
  });

  const signals = buildAutonomousSignalBundle({ deploymentId: "unit-auto", intelligence });
  assert(signals.signals.length > 0, "unit signals");
  const analysis = analyzeAutonomousReadiness({ deploymentId: "unit-auto", signals, intelligence });
  assert(analysis.analysisId.length > 0, "unit analysis");
  const decisions = buildGovernanceDecisionCandidates({
    deploymentId: "unit-auto",
    intelligence,
    observability,
    lifecycleContinuity,
  });
  assert(decisions.length > 0, "unit decisions");
  const proposals = buildGovernanceActionProposals({
    deploymentId: "unit-auto",
    decisions,
    intelligence,
  });
  assert(proposals.length > 0, "unit proposals");
  const executionPlan = buildGovernanceExecutionPlan({ deploymentId: "unit-auto", proposals });
  assert(executionPlan.steps.length > 0, "unit plan");
  const remediations = buildGovernanceRemediationPlans({
    deploymentId: "unit-auto",
    intelligence,
    observability,
  });
  assert(remediations.length > 0, "unit remediations");
  const optimizations = buildGovernanceOptimizationProposals({
    deploymentId: "unit-auto",
    intelligence,
    observability,
  });
  assert(optimizations.length > 0, "unit optimizations");
  const approval = evaluateGovernanceApproval({
    deploymentId: "unit-auto",
    analysis,
    proposals,
    executionPlan,
    intelligence,
  });
  assert(approval.status.length > 0, "unit approval");
  const autonomousScore = computeGovernanceAutonomousScore({
    deploymentId: "unit-auto",
    decisions,
    executionPlan,
    remediations,
    optimizations,
    approval,
  });
  assert(autonomousScore.compositeScore >= 0, "unit score");
  const lineage = buildGovernanceAutonomousLineageGraph({
    deploymentId: "unit-auto",
    signals,
    analysis,
    decisions,
    proposals,
    executionPlan,
    remediations,
    optimizations,
    approval,
    autonomousScore,
  });
  assert(lineage.entries.length >= 9, "unit lineage");
  const audit = buildGovernanceAutonomousAuditRecords({
    autonomousId: "unit-auto",
    federationId: observability.health.federationId,
    proposalCount: proposals.length,
    approval,
    autonomousScore,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runGovernanceAutonomousHooks({
    proposalCount: proposals.length,
    stepCount: executionPlan.steps.length,
    approvalStatus: approval.status,
  });
  assert(hooks.some((h) => h.phase === "afterApprovalGate"), "unit hooks");

  const direct = buildGovernanceAutonomousRuntime({
    deploymentId: "v4-verify-autonomous-direct",
    intelligence,
    observability,
    federation,
    lifecycleContinuity,
  });
  assert(direct.registry.proposalCount > 0, "direct autonomous registry");

  console.log("✓ governance autonomous runtime");
  console.log(" ", runtime.governanceAutonomousSummary);
  console.log("AUTONOMOUS VERIFY PASS");
}

main();
