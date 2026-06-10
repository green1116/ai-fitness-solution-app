import type { KNOWLEDGE_BASE_VERSION, ReadinessStubMode } from "../shared/types";

export const COMPLIANCE_KNOWLEDGE_RUNTIME_VERSION = "v12.5-compliance-knowledge-1" as const;

export const COMPLIANCE_DOMAINS = [
  "qualification",
  "technical-spec",
  "safety-standard",
  "warranty-service",
  "environmental",
] as const;

export type ComplianceDomain = (typeof COMPLIANCE_DOMAINS)[number];

export interface RequirementPattern {
  patternId: string;
  domain: ComplianceDomain;
  requirement: string;
  mandatory: boolean;
}

export interface CompliancePattern {
  complianceId: string;
  domain: ComplianceDomain;
  response: string;
  coverageScore: number;
}

export interface EvidencePattern {
  evidenceId: string;
  domain: ComplianceDomain;
  evidenceType: string;
  description: string;
}

export interface ComplianceKnowledgeAsset {
  assetId: string;
  domain: ComplianceDomain;
  domainLabel: string;
  requirement: RequirementPattern;
  compliance: CompliancePattern;
  evidence: EvidencePattern;
  mode: ReadinessStubMode;
}

export interface ComplianceKnowledgeRuntimePayload {
  version: typeof COMPLIANCE_KNOWLEDGE_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  assets: ComplianceKnowledgeAsset[];
  assetCount: number;
  summary: string;
}
