import type {
  GovernanceComplexityProfile,
  GovernanceEvolutionAssessment,
  GovernanceEvolutionDecision,
  GovernanceMechanismInventoryEntry,
  GovernanceMetaGovernanceLineageGraph,
  GovernanceMetaGovernanceScore,
  GovernanceStandardizationPlan,
} from "./meta-governance-types";

export function buildGovernanceMetaGovernanceLineageGraph(input: {
  deploymentId: string;
  inventory: GovernanceMechanismInventoryEntry[];
  assessment: GovernanceEvolutionAssessment;
  decisions: GovernanceEvolutionDecision[];
  complexity: GovernanceComplexityProfile;
  standardization: GovernanceStandardizationPlan;
  metaScore: GovernanceMetaGovernanceScore;
}): GovernanceMetaGovernanceLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `meta-governance-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-inventory-${input.deploymentId}`,
        event: "inventory",
        detail: `entries=${input.inventory.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-assessment-${input.assessment.assessmentId}`,
        event: "assessment",
        detail: `overComplex=${input.assessment.overComplex} redundant=${input.assessment.redundantPairs.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-decision-${input.deploymentId}`,
        event: "decision",
        detail: `decisions=${input.decisions.length} critical=${input.decisions.filter((d) => d.priority === "critical").length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-complexity-${input.complexity.profileId}`,
        event: "complexity",
        detail: `verdict=${input.complexity.verdict} overlap=${input.complexity.overlapScore}`,
        timestamp: now,
      },
      {
        entryId: `lineage-standardization-${input.standardization.planId}`,
        event: "standardization",
        detail: `candidates=${input.standardization.candidates.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-score-${input.metaScore.scoreId}`,
        event: "score",
        detail: `composite=${input.metaScore.compositeScore}`,
        timestamp: now,
      },
    ],
  };
}
