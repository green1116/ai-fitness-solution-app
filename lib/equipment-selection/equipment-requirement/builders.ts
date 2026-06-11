import { buildSelectionTenderContext } from "../bridge/catalog-bridge";
import type { RequirementProfile } from "./types";

export function buildRequirementProfile(input?: { deploymentId?: string }): RequirementProfile {
  const deploymentId = input?.deploymentId ?? "equipment-requirement-default";
  const tender = buildSelectionTenderContext({ deploymentId });

  const cardioRequirement = {
    category: "cardio",
    minQuantity: 4,
    priority: "required" as const,
    specification: "Commercial-grade cardio with min 150kg user capacity",
  };
  const strengthRequirement = {
    category: "strength",
    minQuantity: 3,
    priority: "required" as const,
    specification: "Plate-loaded and selectorized strength stations",
  };
  const functionalRequirement = {
    category: "functional",
    minQuantity: 2,
    priority: "required" as const,
    specification: "Multi-station functional training zone",
  };
  const recoveryRequirement = {
    category: "recovery",
    minQuantity: 1,
    priority: "recommended" as const,
    specification: "Stretching and recovery equipment zone",
  };
  const groupTrainingRequirement = {
    category: "group-training",
    minQuantity: 1,
    priority: "recommended" as const,
    specification: "Group cycling or training station",
  };

  const totalMinQuantity =
    cardioRequirement.minQuantity +
    strengthRequirement.minQuantity +
    functionalRequirement.minQuantity +
    recoveryRequirement.minQuantity +
    groupTrainingRequirement.minQuantity;

  const coveredCategories = tender.requiredCategories.length;
  const requirementReadiness = Math.round((coveredCategories / 4) * 100);

  return {
    profileId: `requirement-profile-${deploymentId}`,
    tenderId: tender.tenderId,
    projectName: tender.projectName,
    cardioRequirement,
    strengthRequirement,
    functionalRequirement,
    recoveryRequirement,
    groupTrainingRequirement,
    totalMinQuantity,
    requirementReadiness,
  };
}
