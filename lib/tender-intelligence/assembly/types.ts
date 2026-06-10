import type { BudgetIntelligenceRuntimePayload } from "../budget/types";
import type { ProjectClassificationRuntimePayload } from "../classification/types";
import type { ComplianceIntelligenceRuntimePayload } from "../compliance/types";
import type { EquipmentIntelligenceRuntimePayload } from "../equipment/types";
import type { RiskIntelligenceRuntimePayload } from "../risk/types";
import type { ProjectScaleRuntimePayload } from "../scale/types";
import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const TENDER_INTELLIGENCE_ASSEMBLY_RUNTIME_VERSION =
  "v12.0-tender-intelligence-assembly-runtime-1" as const;

export interface TenderIntelligenceProfile {
  profileId: string;
  projectId: string;
  projectName: string;
  classification: string;
  scale: string;
  riskLevel: string;
  equipmentComplexity: string;
  budgetTier: string;
  complianceCoverage: number;
  completeness: number;
  generatedAt: string;
  mode: "readiness-stub";
}

export interface TenderIntelligenceAssemblyRuntimePayload {
  version: typeof TENDER_INTELLIGENCE_ASSEMBLY_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  classification: ProjectClassificationRuntimePayload;
  scale: ProjectScaleRuntimePayload;
  risk: RiskIntelligenceRuntimePayload;
  equipment: EquipmentIntelligenceRuntimePayload;
  budget: BudgetIntelligenceRuntimePayload;
  compliance: ComplianceIntelligenceRuntimePayload;
  profile: TenderIntelligenceProfile;
  summary: string;
}
