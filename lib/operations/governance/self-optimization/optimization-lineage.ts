import type {
  GovernanceFeedbackLoop,
  GovernanceImpactAssessment,
  GovernanceMechanismScore,
  GovernanceModuleOptimization,
  GovernanceResilienceOptimization,
  GovernanceSelfOptimizationLineageGraph,
  GovernanceSelfOptimizationScore,
  GovernanceStrategyOptimization,
} from "./optimization-types";

export function buildGovernanceSelfOptimizationLineageGraph(input: {
  deploymentId: string;
  feedback: GovernanceFeedbackLoop;
  mechanisms: GovernanceMechanismScore[];
  strategies: GovernanceStrategyOptimization[];
  modules: GovernanceModuleOptimization[];
  impact: GovernanceImpactAssessment;
  resilience: GovernanceResilienceOptimization;
  loopClosed: boolean;
  optimizationScore: GovernanceSelfOptimizationScore;
}): GovernanceSelfOptimizationLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `self-optimization-lineage-${input.deploymentId}`,
    entries: [
      { entryId: `lineage-feedback-${input.feedback.loopId}`, event: "feedback", detail: `entries=${input.feedback.entries.length} complete=${input.feedback.cycleComplete}`, timestamp: now },
      { entryId: `lineage-effectiveness-${input.deploymentId}`, event: "effectiveness", detail: `mechanisms=${input.mechanisms.length}`, timestamp: now },
      { entryId: `lineage-strategy-${input.deploymentId}`, event: "strategy", detail: `strategies=${input.strategies.length}`, timestamp: now },
      { entryId: `lineage-module-${input.deploymentId}`, event: "module", detail: `optimize=${input.modules.filter((m) => m.shouldOptimize).length}`, timestamp: now },
      { entryId: `lineage-impact-${input.impact.assessmentId}`, event: "impact", detail: `overall=${input.impact.overallImpact}`, timestamp: now },
      { entryId: `lineage-resilience-${input.resilience.resilienceId}`, event: "resilience", detail: `${input.resilience.currentResilience}>${input.resilience.targetResilience}`, timestamp: now },
      { entryId: `lineage-loop-${input.deploymentId}`, event: "loop", detail: `closed=${input.loopClosed}`, timestamp: now },
      { entryId: `lineage-score-${input.optimizationScore.scoreId}`, event: "score", detail: `composite=${input.optimizationScore.compositeScore}`, timestamp: now },
    ],
  };
}
