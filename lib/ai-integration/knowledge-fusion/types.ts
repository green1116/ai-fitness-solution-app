import type { AI_INTEGRATION_VERSION } from "../shared/types";

export const AI_KNOWLEDGE_FUSION_RUNTIME_VERSION = "v13.0-ai-knowledge-fusion-1" as const;

export interface ProjectContext {
  projectId: string;
  projectName: string;
  tenderCompany: string;
  areaSqm: number;
  budgetCny: number;
}

export interface AiProposalContext {
  contextId: string;
  projectName: string;
  proposalSections: string[];
  knowledgeRefs: string[];
  tenderClassification: string;
  mode: "stub" | "real";
}

export interface AiTenderContext {
  contextId: string;
  projectType: string;
  scale: string;
  riskLevel: string;
  complianceCoverage: number;
}

export interface AiRiskContext {
  contextId: string;
  riskLevel: string;
  drivers: string[];
  knowledgePatterns: string[];
}

export interface AiComplianceContext {
  contextId: string;
  coverage: number;
  missingAreas: string[];
  attentionAreas: string[];
}

export interface AiKnowledgeFusionRuntimePayload {
  version: typeof AI_KNOWLEDGE_FUSION_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  projectContext: ProjectContext;
  proposalContext: AiProposalContext;
  tenderContext: AiTenderContext;
  riskContext: AiRiskContext;
  complianceContext: AiComplianceContext;
  summary: string;
}
