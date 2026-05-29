import type {
  GovernanceComplexityProfile,
  GovernanceEvolutionAssessment,
  GovernanceEvolutionDecision,
  GovernanceMetaGovernanceScore,
} from "./meta-governance-types";

export function computeGovernanceMetaGovernanceScore(input: {
  deploymentId: string;
  assessment: GovernanceEvolutionAssessment;
  decisions: GovernanceEvolutionDecision[];
  complexity: GovernanceComplexityProfile;
}): GovernanceMetaGovernanceScore {
  const criticalCount = input.decisions.filter((d) => d.priority === "critical").length;
  const freezeCount = input.decisions.filter((d) => d.action === "freeze").length;
  const standardizeCount = input.decisions.filter((d) => d.action === "standardize").length;

  const evolutionClarity = Math.max(
    0,
    Math.min(100, 100 - input.assessment.complexityScore * 0.4 - criticalCount * 8),
  );
  const complexityControl =
    input.complexity.verdict === "healthy"
      ? 90
      : input.complexity.verdict === "elevated"
        ? 65
        : 40;
  const lifecycleHealth = Math.max(
    0,
    Math.min(100, 100 - freezeCount * 12 - criticalCount * 10),
  );
  const standardizationReadiness = Math.min(100, standardizeCount * 20 + 40);

  const compositeScore = Math.round(
    (evolutionClarity + complexityControl + lifecycleHealth + standardizationReadiness) / 4,
  );

  return {
    scoreId: `meta-governance-score-${input.deploymentId}`,
    evolutionClarity,
    complexityControl,
    lifecycleHealth,
    standardizationReadiness,
    compositeScore,
  };
}
