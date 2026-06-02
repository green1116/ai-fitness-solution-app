/**
 * V4-A3-R13 Operational Governance Self-Optimization Runtime — verification
 */
import {
  buildGovernanceSelfOptimizationRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION,
  collectGovernanceFeedbackLoop,
  evaluateGovernanceMechanismEffectiveness,
  optimizeGovernanceStrategies,
  prioritizeModuleOptimizations,
  assessGovernanceOptimizationImpact,
  optimizeGovernanceResilience,
  closeGovernanceOptimizationLoop,
  computeGovernanceSelfOptimizationScore,
  buildGovernanceSelfOptimizationLineageGraph,
  buildGovernanceSelfOptimizationAuditRecords,
  runGovernanceSelfOptimizationHooks,
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
    deploymentId: "v4-verify-governance-self-optimization",
  });
  assert(
    runtime.governanceSelfOptimizationVersion === GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION,
    "self-optimization version",
  );
  assert(runtime.governanceSelfOptimizationFeedback.loopId.length > 0, "feedback loop");
  assert(runtime.governanceSelfOptimizationMechanisms.length >= 7, "mechanisms");
  assert(runtime.governanceSelfOptimizationStrategies.length >= 6, "strategies");
  assert(runtime.governanceSelfOptimizationModules.length >= 7, "modules");
  assert(runtime.governanceSelfOptimizationImpact.assessmentId.length > 0, "impact");
  assert(runtime.governanceSelfOptimizationResilience.resilienceId.length > 0, "resilience");
  assert(typeof runtime.governanceSelfOptimizationLoopClosed === "boolean", "loop closed");
  assert(runtime.governanceSelfOptimizationScore.compositeScore >= 0, "optimization score");
  assert(runtime.governanceSelfOptimizationLineage.entries.length >= 8, "lineage");
  assert(runtime.governanceSelfOptimizationAudit.length > 0, "audit");
  assert(runtime.governanceSelfOptimizationHooks.length >= 6, "hooks");
  assert(runtime.governanceSelfOptimizationSummary.length > 0, "summary");
  assert(
    ["stable", "tuning", "improving", "degraded"].includes(runtime.governanceSelfOptimizationStatus),
    "status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-opt-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-opt-consensus",
    federation,
  });
  const policyPropagation = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "unit-opt-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  const lifecycleContinuity = buildGovernanceFederationLifecycleContinuityRuntime({
    deploymentId: "unit-opt-lifecycle",
    federation,
    consensus,
    policyPropagation,
  });
  const observability = buildGovernanceFederationObservabilityRuntime({
    deploymentId: "unit-opt-obs",
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });
  const intelligence = buildGovernanceIntelligenceRuntime({
    deploymentId: "unit-opt-intel",
    observability,
    federation,
    lifecycleContinuity,
  });
  const autonomous = buildGovernanceAutonomousRuntime({
    deploymentId: "unit-opt-auto",
    intelligence,
    observability,
    federation,
    lifecycleContinuity,
  });

  const feedback = collectGovernanceFeedbackLoop({
    deploymentId: "unit-opt",
    observability,
    intelligence,
    autonomous,
  });
  assert(feedback.entries.length >= 6, "unit feedback");
  const mechanisms = evaluateGovernanceMechanismEffectiveness({
    deploymentId: "unit-opt",
    observability,
    intelligence,
    autonomous,
  });
  assert(mechanisms.length >= 7, "unit mechanisms");
  const strategies = optimizeGovernanceStrategies({
    deploymentId: "unit-opt",
    observability,
    autonomous,
  });
  assert(strategies.length >= 6, "unit strategies");
  const modules = prioritizeModuleOptimizations({ deploymentId: "unit-opt", mechanisms });
  assert(modules.length >= 7, "unit modules");
  const impact = assessGovernanceOptimizationImpact({
    deploymentId: "unit-opt",
    observability,
    autonomous,
    strategies,
  });
  assert(impact.assessmentId.length > 0, "unit impact");
  const resilience = optimizeGovernanceResilience({
    deploymentId: "unit-opt",
    observability,
    autonomous,
    impact,
  });
  assert(resilience.actions.length > 0, "unit resilience");
  const loopClosed = closeGovernanceOptimizationLoop({ feedback, mechanisms, impact });
  assert(typeof loopClosed === "boolean", "unit loop closed");
  const optimizationScore = computeGovernanceSelfOptimizationScore({
    deploymentId: "unit-opt",
    feedback,
    mechanisms,
    strategies,
    impact,
    loopClosed,
  });
  assert(optimizationScore.compositeScore >= 0, "unit score");
  const lineage = buildGovernanceSelfOptimizationLineageGraph({
    deploymentId: "unit-opt",
    feedback,
    mechanisms,
    strategies,
    modules,
    impact,
    resilience,
    loopClosed,
    optimizationScore,
  });
  assert(lineage.entries.length >= 8, "unit lineage");
  const audit = buildGovernanceSelfOptimizationAuditRecords({
    optimizationId: "unit-opt",
    federationId: feedback.federationId,
    mechanismCount: mechanisms.length,
    strategyCount: strategies.length,
    optimizationScore,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runGovernanceSelfOptimizationHooks({
    feedbackCount: feedback.entries.length,
    mechanismCount: mechanisms.length,
    loopClosed,
  });
  assert(hooks.some((h) => h.phase === "afterOptimizationLoop"), "unit hooks");

  const direct = buildGovernanceSelfOptimizationRuntime({
    deploymentId: "v4-verify-self-optimization-direct",
    observability,
    intelligence,
    autonomous,
  });
  assert(direct.registry.optimizationId.length > 0, "direct registry");

  console.log("✓ governance self-optimization runtime");
  console.log(" ", runtime.governanceSelfOptimizationSummary);
  console.log("SELF-OPTIMIZATION VERIFY PASS");
}

main();
