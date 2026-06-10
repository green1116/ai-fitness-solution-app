import type { KNOWLEDGE_BASE_VERSION, ReadinessStubMode } from "../shared/types";

export const PROPOSAL_KNOWLEDGE_RUNTIME_VERSION = "v12.5-proposal-knowledge-1" as const;

export const PROPOSAL_TEMPLATE_TYPES = [
  "executive-summary",
  "technical-proposal",
  "implementation",
  "compliance",
] as const;

export type ProposalTemplateType = (typeof PROPOSAL_TEMPLATE_TYPES)[number];

export interface ProposalTemplate {
  templateId: string;
  type: ProposalTemplateType;
  title: string;
  sections: string[];
  wordCountEstimate: number;
}

export interface ProposalKnowledgeAsset {
  assetId: string;
  template: ProposalTemplate;
  mode: ReadinessStubMode;
}

export interface ProposalKnowledgeRuntimePayload {
  version: typeof PROPOSAL_KNOWLEDGE_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  assets: ProposalKnowledgeAsset[];
  assetCount: number;
  summary: string;
}
