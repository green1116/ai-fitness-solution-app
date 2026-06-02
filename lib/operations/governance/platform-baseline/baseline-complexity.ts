import type {
  GovernanceCapabilityClassification,
  GovernanceCapabilityDependencyGraph,
  GovernanceCapabilityInventoryEntry,
  GovernanceComplexityReport,
} from "./baseline-types";
import type { GovernanceMetaGovernanceRuntimeResult } from "../meta-governance/meta-governance-types";
import type { GovernanceSelfOptimizationRuntimeResult } from "../self-optimization/optimization-types";
import { computeDependencyDepth } from "./baseline-dependency";

export function buildGovernanceComplexityReport(input: {
  deploymentId: string;
  inventory: GovernanceCapabilityInventoryEntry[];
  classifications: GovernanceCapabilityClassification[];
  dependencyGraph: GovernanceCapabilityDependencyGraph;
  metaGovernance: GovernanceMetaGovernanceRuntimeResult;
  selfOptimization: GovernanceSelfOptimizationRuntimeResult;
}): GovernanceComplexityReport {
  const capabilityCount = input.inventory.length;
  const tierCount = input.classifications.length;
  const dependencyDepth = computeDependencyDepth(input.dependencyGraph);
  const overComplex =
    input.metaGovernance.assessment.overComplex ||
    input.metaGovernance.complexity.verdict === "excessive";
  const complexityScore = Math.round(
    (input.metaGovernance.complexity.overlapScore + dependencyDepth * 8 + tierCount * 4) / 2,
  );
  const tuningPressure = input.selfOptimization.modules.filter((module) => module.shouldOptimize).length;

  let verdict: GovernanceComplexityReport["verdict"] = "baseline-acceptable";
  if (overComplex || complexityScore >= 70) verdict = "baseline-excessive";
  else if (complexityScore >= 45 || tuningPressure > 3) verdict = "baseline-elevated";

  const findings: string[] = [
    `capabilities=${capabilityCount}`,
    `tiers=${tierCount}`,
    `dependencyDepth=${dependencyDepth}`,
    `metaComplexity=${input.metaGovernance.complexity.verdict}`,
    `tuningPressure=${tuningPressure}`,
  ];
  if (overComplex) findings.push("meta-governance-over-complex");

  return {
    reportId: `complexity-report-${input.deploymentId}`,
    capabilityCount,
    tierCount,
    dependencyDepth,
    overComplex,
    complexityScore,
    tuningPressure,
    verdict,
    findings,
  };
}
