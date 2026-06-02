/**
 * V2.1 Tender Semantic Engine — 类型定义
 */

export type SemanticRole =
  | "overview"
  | "requirement"
  | "planning"
  | "configuration"
  | "implementation"
  | "response"
  | "scoring"
  | "risk"
  | "appendix";

export type TenderPhase =
  | "qualification"
  | "technical"
  | "commercial"
  | "evaluation"
  | "delivery";

export type SemanticSection = {
  id: string;
  title: string;
  semanticRole: SemanticRole;
  tenderPhase: TenderPhase;
  content: string;
  linkedRequirements: string[];
  linkedScoringItems: string[];
  linkedRisks: string[];
};

export type SemanticRequirementCategory =
  | "technical"
  | "commercial"
  | "qualification"
  | "scoring"
  | "attachment";

export type SemanticRequirementImportance = "mandatory" | "preferred" | "scored";

export type SemanticRequirement = {
  id: string;
  category: SemanticRequirementCategory;
  title: string;
  requirement: string;
  normalizedRequirement: string;
  sourceSectionId?: string;
  sourcePage?: number;
  importance: SemanticRequirementImportance;
  evidenceRequired: boolean;
  measurable: boolean;
  measurableFields?: string[];
  relatedRisks?: string[];
  relatedScoringItems?: string[];
};

export type ScoringCategory =
  | "technical"
  | "commercial"
  | "qualification"
  | "service";

export type SemanticScoringItem = {
  id: string;
  title: string;
  scoringCategory: ScoringCategory;
  evidenceNeeded: string[];
  relatedSections: string[];
  evaluationFocus: string[];
  possibleRiskFactors: string[];
};

export type SemanticRiskType =
  | "technical"
  | "commercial"
  | "delivery"
  | "procurement"
  | "compliance";

export type SemanticRiskSeverity = "low" | "medium" | "high";

export type SemanticRisk = {
  id: string;
  riskType: SemanticRiskType;
  title: string;
  description: string;
  severity: SemanticRiskSeverity;
  mitigation?: string;
  linkedRequirements?: string[];
  linkedScoringItems?: string[];
};

export type ComplianceStatus = "covered" | "partial" | "missing";

export type ComplianceNode = {
  requirementId: string;
  linkedSections: string[];
  linkedScoringItems: string[];
  linkedRisks: string[];
  responseStatus: ComplianceStatus;
};

export type TenderSemanticGraph = {
  sections: SemanticSection[];
  requirements: SemanticRequirement[];
  scoringItems: SemanticScoringItem[];
  risks: SemanticRisk[];
  compliance: ComplianceNode[];
};

export type SemanticOverview = {
  sectionCount: number;
  requirementCount: number;
  scoringCount: number;
  riskCount: number;
  complianceCovered: number;
  compliancePartial: number;
  complianceMissing: number;
  risksByType: Record<SemanticRiskType, number>;
};
