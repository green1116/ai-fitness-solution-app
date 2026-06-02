import type { GovernanceComplexityProfile } from "./meta-governance-types";
import type { GovernanceMechanismInventoryEntry } from "./meta-governance-types";
import type { GovernanceSelfOptimizationRuntimeResult } from "../self-optimization/optimization-types";

export function assessGovernanceComplexity(input: {
  deploymentId: string;
  inventory: GovernanceMechanismInventoryEntry[];
  selfOptimization: GovernanceSelfOptimizationRuntimeResult;
}): GovernanceComplexityProfile {
  const moduleCount = input.inventory.length;
  const ineffectiveCount = input.selfOptimization.mechanisms.filter(
    (m) => m.effectiveness === "ineffective" || m.effectiveness === "low",
  ).length;
  const tuningPressure = input.selfOptimization.modules.filter((m) => m.shouldOptimize).length;
  const overlapScore = Math.min(
    100,
    ineffectiveCount * 15 + tuningPressure * 10 + (moduleCount > 9 ? 20 : 0),
  );

  let verdict: GovernanceComplexityProfile["verdict"] = "healthy";
  if (overlapScore >= 60 || tuningPressure > 4) verdict = "excessive";
  else if (overlapScore >= 35 || tuningPressure > 2) verdict = "elevated";

  return {
    profileId: `complexity-${input.deploymentId}`,
    moduleCount,
    ineffectiveCount,
    tuningPressure,
    overlapScore,
    verdict,
  };
}
