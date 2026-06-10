import { runBudgetIntelligenceRuntime } from "../budget/runtime";
import { runProjectClassificationRuntime } from "../classification/runtime";
import { runComplianceIntelligenceRuntime } from "../compliance/runtime";
import { runEquipmentIntelligenceRuntime } from "../equipment/runtime";
import { runRiskIntelligenceRuntime } from "../risk/runtime";
import { runProjectScaleRuntime } from "../scale/runtime";
import { buildTenderProjectSnapshot } from "../shared/tender-input";
import type { TenderIntelligenceProfile } from "./types";

export function collectTenderIntelligence(deploymentId: string) {
  return {
    classification: runProjectClassificationRuntime({ deploymentId }),
    scale: runProjectScaleRuntime({ deploymentId }),
    risk: runRiskIntelligenceRuntime({ deploymentId }),
    equipment: runEquipmentIntelligenceRuntime({ deploymentId }),
    budget: runBudgetIntelligenceRuntime({ deploymentId }),
    compliance: runComplianceIntelligenceRuntime({ deploymentId }),
  };
}

export function buildTenderIntelligenceProfile(input: {
  deploymentId: string;
  collected: ReturnType<typeof collectTenderIntelligence>;
}): TenderIntelligenceProfile {
  const snapshot = buildTenderProjectSnapshot({ deploymentId: input.deploymentId });
  const { classification, scale, risk, equipment, budget, compliance } = input.collected;

  return {
    profileId: `tender-intel-profile-${input.deploymentId}`,
    projectId: snapshot.projectId,
    projectName: snapshot.projectName,
    classification: classification.payload.classification.projectType,
    scale: scale.payload.scale.tier,
    riskLevel: risk.payload.risk.riskLevel,
    equipmentComplexity: equipment.payload.equipment.complexity,
    budgetTier: budget.payload.budget.budgetTier,
    complianceCoverage: compliance.payload.compliance.complianceCoverage,
    completeness: 100,
    generatedAt: new Date().toISOString(),
    mode: "readiness-stub",
  };
}
