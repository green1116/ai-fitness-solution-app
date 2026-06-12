import { buildEquipmentIntelligenceProfiles } from "../equipment-intelligence/builders";
import type { EquipmentMatchResult, EquipmentMatchingSnapshot, TenderRequirementSet } from "./types";

export function buildTenderRequirementSet(input?: { deploymentId?: string }): TenderRequirementSet {
  const deploymentId = input?.deploymentId ?? "equipment-matching-default";
  return {
    requirementId: `tender-req-${deploymentId}`,
    projectName: "Smart Campus Fitness Center Equipment Procurement",
    requiredCategories: ["cardio", "strength", "functional", "group-training"],
    budgetTier: "mid",
    complianceTags: ["ISO 9001", "Domestic brand option", "3-year warranty"],
    minEquipmentCount: 8,
  };
}

function scoreMatch(
  profile: ReturnType<typeof buildEquipmentIntelligenceProfiles>[number],
  requirements: TenderRequirementSet,
): EquipmentMatchResult {
  let score = 50;

  if (requirements.requiredCategories.includes(profile.category)) score += 25;
  if (requirements.budgetTier === "low" && profile.commercial.warrantyYears <= 2) score += 10;
  if (requirements.budgetTier === "mid" && profile.commercial.warrantyYears === 2) score += 15;
  if (requirements.budgetTier === "premium" && profile.commercial.warrantyYears >= 3) score += 20;
  if (requirements.complianceTags.includes("Domestic brand option") &&
    (profile.brandName === "Shuhua" || profile.brandName === "IntelligentFit" || profile.brandName === "Impulse")) {
    score += 10;
  }
  if (profile.technical.connectivity.length > 1) score += 5;

  score = Math.min(100, score);

  return {
    modelId: profile.modelId,
    modelName: profile.modelName,
    brandName: profile.brandName,
    category: profile.category,
    matchingScore: score,
    matchReason: `Category ${profile.category} match; ${profile.brandName} fits ${requirements.budgetTier} budget tier`,
  };
}

export function buildEquipmentMatchingSnapshot(input?: { deploymentId?: string }): EquipmentMatchingSnapshot {
  const deploymentId = input?.deploymentId ?? "equipment-matching-default";
  const requirements = buildTenderRequirementSet({ deploymentId });
  const profiles = buildEquipmentIntelligenceProfiles({ deploymentId });

  const allMatches = profiles
    .map((profile) => scoreMatch(profile, requirements))
    .filter((match) => match.matchingScore >= 60)
    .sort((a, b) => b.matchingScore - a.matchingScore);

  const preferredOptions = allMatches.slice(0, 4);
  const alternativeOptions = allMatches.slice(4, 8);

  const avgScore = preferredOptions.length > 0
    ? Math.round(preferredOptions.reduce((s, m) => s + m.matchingScore, 0) / preferredOptions.length)
    : 0;
  const matchingReadiness = Math.round(
    (avgScore * Math.min(1, preferredOptions.length / requirements.minEquipmentCount)) * (alternativeOptions.length > 0 ? 1 : 0.8),
  );

  return {
    snapshotId: `equipment-matching-${deploymentId}`,
    tenderRequirements: requirements,
    preferredOptions,
    alternativeOptions,
    matchingReadiness,
  };
}
