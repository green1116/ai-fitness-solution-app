import type { GovernanceStandardizationPlan } from "./meta-governance-types";
import type { GovernanceEvolutionAssessment } from "./meta-governance-types";
import type { GovernanceEvolutionDecision } from "./meta-governance-types";

export function buildGovernanceStandardizationPlan(input: {
  deploymentId: string;
  assessment: GovernanceEvolutionAssessment;
  decisions: GovernanceEvolutionDecision[];
}): GovernanceStandardizationPlan {
  const candidates = input.decisions
    .filter((d) => d.action === "standardize")
    .map((d) => d.module);

  const mergeCount = input.decisions.filter((d) => d.action === "merge").length;
  const expectedReduction = candidates.length * 5 + mergeCount * 8;

  const actions: string[] = [];
  if (candidates.length > 0) {
    actions.push(`promote-standard:${candidates.join(",")}`);
  }
  if (input.assessment.standardizationReady.length > candidates.length) {
    actions.push("prepare-baseline-templates");
  }
  if (mergeCount > 0) {
    actions.push(`consolidate-modules:${mergeCount}`);
  }
  if (actions.length === 0) {
    actions.push("monitor-standardization-signals");
  }

  return {
    planId: `standardization-${input.deploymentId}`,
    candidates: [...new Set([...candidates, ...input.assessment.standardizationReady])],
    expectedReduction,
    actions,
  };
}
