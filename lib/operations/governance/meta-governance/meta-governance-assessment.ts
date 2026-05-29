import type {
  GovernanceEvolutionAssessment,
  GovernanceMechanismInventoryEntry,
} from "./meta-governance-types";
import type { GovernanceComplexityProfile } from "./meta-governance-types";
import { MERGE_CANDIDATE_PAIRS } from "./meta-governance-registry";

export function assessGovernanceEvolution(input: {
  deploymentId: string;
  inventory: GovernanceMechanismInventoryEntry[];
  complexity: GovernanceComplexityProfile;
}): GovernanceEvolutionAssessment {
  const redundantPairs: string[] = [];
  for (const [a, b] of MERGE_CANDIDATE_PAIRS) {
    const scoreA = input.inventory.find((e) => e.module === a)?.effectivenessScore ?? 100;
    const scoreB = input.inventory.find((e) => e.module === b)?.effectivenessScore ?? 100;
    if (scoreA < 55 && scoreB < 55) redundantPairs.push(`${a}+${b}`);
  }

  const standardizationReady = input.inventory
    .filter((e) => e.effectivenessScore >= 85)
    .map((e) => e.module);

  const overComplex =
    input.complexity.verdict === "excessive" ||
    redundantPairs.length >= 2 ||
    input.complexity.tuningPressure > 3;

  const rationale = overComplex
    ? `complexity=${input.complexity.verdict} overlap=${input.complexity.overlapScore} redundant=${redundantPairs.length}`
    : `complexity=${input.complexity.verdict} modules=${input.complexity.moduleCount} ready=${standardizationReady.length}`;

  return {
    assessmentId: `evolution-assessment-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    overComplex,
    complexityScore: input.complexity.overlapScore,
    redundantPairs,
    standardizationReady,
    rationale,
  };
}
