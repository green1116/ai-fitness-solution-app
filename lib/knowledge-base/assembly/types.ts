import type { KNOWLEDGE_BASE_VERSION, ReadinessStubMode } from "../shared/types";
import type { ComplianceKnowledgeRuntimePayload } from "../compliance/types";
import type { EquipmentKnowledgeRuntimePayload } from "../equipment/types";
import type { ProjectKnowledgeRuntimePayload } from "../project/types";
import type { ProposalKnowledgeRuntimePayload } from "../proposal/types";
import type { RiskKnowledgeRuntimePayload } from "../risk/types";
import type { KnowledgeCatalogRuntimePayload } from "../catalog/types";
import type { KnowledgeSearchRuntimePayload } from "../search/types";

export const KNOWLEDGE_ASSEMBLY_RUNTIME_VERSION = "v12.5-knowledge-assembly-1" as const;

export interface KnowledgeAssetPackage {
  packageId: string;
  projectAssetCount: number;
  equipmentAssetCount: number;
  proposalAssetCount: number;
  riskAssetCount: number;
  complianceAssetCount: number;
  catalogAssetCount: number;
  totalAssets: number;
  completeness: number;
  mode: ReadinessStubMode;
  generatedAt: string;
}

export interface KnowledgeAssemblyRuntimePayload {
  version: typeof KNOWLEDGE_ASSEMBLY_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  project: ProjectKnowledgeRuntimePayload;
  equipment: EquipmentKnowledgeRuntimePayload;
  proposal: ProposalKnowledgeRuntimePayload;
  risk: RiskKnowledgeRuntimePayload;
  compliance: ComplianceKnowledgeRuntimePayload;
  catalog: KnowledgeCatalogRuntimePayload;
  search: KnowledgeSearchRuntimePayload;
  package: KnowledgeAssetPackage;
  summary: string;
}
