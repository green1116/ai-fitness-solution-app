import type { GovernanceFeedbackLoop, GovernanceSelfOptimizationScore } from "./optimization-types";
import type { GovernanceImpactAssessment } from "./optimization-types";
import type { GovernanceMechanismScore } from "./optimization-types";
import type { GovernanceStrategyOptimization } from "./optimization-types";
import { clampOptimizationScore } from "./optimization-registry";

export function computeGovernanceSelfOptimizationScore(input: {
  deploymentId: string;
  feedback: GovernanceFeedbackLoop;
  mechanisms: GovernanceMechanismScore[];
  strategies: GovernanceStrategyOptimization[];
  impact: GovernanceImpactAssessment;
  loopClosed: boolean;
}): GovernanceSelfOptimizationScore {
  const feedbackQuality = clampOptimizationScore(
    input.feedback.cycleComplete ? 85 : 45 + input.feedback.entries.length * 3,
  );

  const mechanismAvg =
    input.mechanisms.length > 0
      ? input.mechanisms.reduce((s, m) => s + m.score, 0) / input.mechanisms.length
      : 50;
  const effectivenessScore = clampOptimizationScore(mechanismAvg);

  const strategyGain =
    input.strategies.length > 0
      ? input.strategies.reduce((s, st) => s + st.expectedGain, 0) / input.strategies.length
      : 0;
  const strategyScore = clampOptimizationScore(50 + strategyGain);

  const impactScore = clampOptimizationScore(50 + input.impact.overallImpact);

  const loopHealth = clampOptimizationScore(input.loopClosed ? 90 : input.feedback.cycleComplete ? 70 : 40);

  const compositeScore = clampOptimizationScore(
    (feedbackQuality + effectivenessScore + strategyScore + impactScore + loopHealth) / 5,
  );

  return {
    scoreId: `self-optimization-score-${input.deploymentId}`,
    feedbackQuality,
    effectivenessScore,
    strategyScore,
    impactScore,
    loopHealth,
    compositeScore,
  };
}
