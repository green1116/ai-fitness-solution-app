import type { GovernanceFeedbackLoop } from "./optimization-types";
import type { GovernanceMechanismScore } from "./optimization-types";
import type { GovernanceImpactAssessment } from "./optimization-types";

export function closeGovernanceOptimizationLoop(input: {
  feedback: GovernanceFeedbackLoop;
  mechanisms: GovernanceMechanismScore[];
  impact: GovernanceImpactAssessment;
}): boolean {
  if (!input.feedback.cycleComplete) return false;

  const effectiveCount = input.mechanisms.filter(
    (m) => m.effectiveness === "high" || m.effectiveness === "medium",
  ).length;
  const majorityEffective = effectiveCount >= Math.ceil(input.mechanisms.length / 2);

  return majorityEffective && input.impact.overallImpact >= -10;
}
