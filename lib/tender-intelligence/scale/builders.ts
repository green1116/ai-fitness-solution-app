import { buildTenderProjectSnapshot } from "../shared/tender-input";
import type { ProjectScale, ProjectScaleTier } from "./types";

const TIER_LABELS: Record<ProjectScaleTier, string> = {
  small: "Small 小型",
  medium: "Medium 中型",
  large: "Large 大型",
  enterprise: "Enterprise 企业级",
};

function inferTier(areaSqm: number, budgetCny: number): ProjectScaleTier {
  if (areaSqm >= 3000 || budgetCny >= 5_000_000) return "enterprise";
  if (areaSqm >= 1500 || budgetCny >= 2_500_000) return "large";
  if (areaSqm >= 500 || budgetCny >= 800_000) return "medium";
  return "small";
}

export function buildProjectScale(input?: { deploymentId?: string }): ProjectScale {
  const deploymentId = input?.deploymentId ?? "scale-default";
  const snapshot = buildTenderProjectSnapshot({ deploymentId });
  const tier = inferTier(snapshot.estimatedAreaSqm, snapshot.estimatedBudgetCny);

  return {
    scaleId: `scale-${deploymentId}`,
    tier,
    label: TIER_LABELS[tier],
    areaSqm: snapshot.estimatedAreaSqm,
    budgetCny: snapshot.estimatedBudgetCny,
    requirementCount: snapshot.requirementCount,
    rationale: `面积 ${snapshot.estimatedAreaSqm}㎡、预算 ¥${snapshot.estimatedBudgetCny.toLocaleString()}、需求 ${snapshot.requirementCount} 条`,
  };
}

export { TIER_LABELS };
