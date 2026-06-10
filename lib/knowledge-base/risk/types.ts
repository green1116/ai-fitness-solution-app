import type { KNOWLEDGE_BASE_VERSION, ReadinessStubMode } from "../shared/types";

export const RISK_KNOWLEDGE_RUNTIME_VERSION = "v12.5-risk-knowledge-1" as const;

export const RISK_CATEGORIES = [
  "schedule",
  "budget",
  "technical",
  "compliance",
  "supply-chain",
] as const;

export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export interface RiskPattern {
  patternId: string;
  category: RiskCategory;
  name: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface MitigationPattern {
  mitigationId: string;
  category: RiskCategory;
  strategy: string;
  actions: string[];
  effectiveness: number;
}

export interface RiskKnowledgeAsset {
  assetId: string;
  category: RiskCategory;
  categoryLabel: string;
  riskPattern: RiskPattern;
  mitigation: MitigationPattern;
  mode: ReadinessStubMode;
}

export interface RiskKnowledgeRuntimePayload {
  version: typeof RISK_KNOWLEDGE_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  assets: RiskKnowledgeAsset[];
  assetCount: number;
  summary: string;
}
