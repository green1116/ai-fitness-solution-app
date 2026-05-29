import {
  GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION,
  type GovernanceSelfOptimizationRuntimeInput,
  type GovernanceSelfOptimizationRuntimeResult,
  type SelfOptimizationStatus,
} from "./optimization-types";
import { collectGovernanceFeedbackLoop } from "./optimization-feedback";
import { evaluateGovernanceMechanismEffectiveness } from "./optimization-effectiveness";
import { optimizeGovernanceStrategies } from "./optimization-strategy";
import { prioritizeModuleOptimizations } from "./optimization-module";
import { assessGovernanceOptimizationImpact } from "./optimization-impact";
import { optimizeGovernanceResilience } from "./optimization-resilience";
import { closeGovernanceOptimizationLoop } from "./optimization-loop";
import { computeGovernanceSelfOptimizationScore } from "./optimization-score";
import { buildGovernanceSelfOptimizationLineageGraph } from "./optimization-lineage";
import { buildGovernanceSelfOptimizationAuditRecords } from "./optimization-audit";
import { runGovernanceSelfOptimizationHooks } from "./optimization-hooks";

export function buildGovernanceSelfOptimizationRuntime(
  input: GovernanceSelfOptimizationRuntimeInput,
): GovernanceSelfOptimizationRuntimeResult {
  const feedback = collectGovernanceFeedbackLoop({
    deploymentId: input.deploymentId,
    observability: input.observability,
    intelligence: input.intelligence,
    autonomous: input.autonomous,
  });
  const mechanisms = evaluateGovernanceMechanismEffectiveness({
    deploymentId: input.deploymentId,
    observability: input.observability,
    intelligence: input.intelligence,
    autonomous: input.autonomous,
  });
  const strategies = optimizeGovernanceStrategies({
    deploymentId: input.deploymentId,
    observability: input.observability,
    autonomous: input.autonomous,
  });
  const modules = prioritizeModuleOptimizations({
    deploymentId: input.deploymentId,
    mechanisms,
  });
  const impact = assessGovernanceOptimizationImpact({
    deploymentId: input.deploymentId,
    observability: input.observability,
    autonomous: input.autonomous,
    strategies,
  });
  const resilience = optimizeGovernanceResilience({
    deploymentId: input.deploymentId,
    observability: input.observability,
    autonomous: input.autonomous,
    impact,
  });
  const loopClosed = closeGovernanceOptimizationLoop({ feedback, mechanisms, impact });
  const optimizationScore = computeGovernanceSelfOptimizationScore({
    deploymentId: input.deploymentId,
    feedback,
    mechanisms,
    strategies,
    impact,
    loopClosed,
  });

  const lineage = buildGovernanceSelfOptimizationLineageGraph({
    deploymentId: input.deploymentId,
    feedback,
    mechanisms,
    strategies,
    modules,
    impact,
    resilience,
    loopClosed,
    optimizationScore,
  });

  const optimizationId = `governance-self-optimization-${input.deploymentId}`;
  const audit = buildGovernanceSelfOptimizationAuditRecords({
    optimizationId,
    federationId: feedback.federationId,
    mechanismCount: mechanisms.length,
    strategyCount: strategies.length,
    optimizationScore,
  });
  const hooks = runGovernanceSelfOptimizationHooks({
    feedbackCount: feedback.entries.length,
    mechanismCount: mechanisms.length,
    loopClosed,
  });

  let status: SelfOptimizationStatus = "stable";
  if (loopClosed && impact.overallImpact > 5) status = "improving";
  else if (modules.filter((m) => m.shouldOptimize).length > 3) status = "tuning";
  else if (impact.overallImpact < -5 || optimizationScore.compositeScore < 40) status = "degraded";

  const traceId = `governance-self-optimization-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION,
    registry: { optimizationId, loopCycles: loopClosed ? 1 : 0 },
    feedback,
    mechanisms,
    strategies,
    modules,
    impact,
    resilience,
    loopClosed,
    optimizationScore,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `self-optimization-summary-${Date.now()}`,
      text: `optimization=${optimizationId} loop=${loopClosed} mechanisms=${mechanisms.length} tune=${modules.filter((m) => m.shouldOptimize).length} impact=${impact.overallImpact} composite=${optimizationScore.compositeScore} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION };
