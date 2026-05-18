/**
 * V2.4 Technical Compliance Engine — 类型定义
 */

export type TechnicalRequirementCategory =
  | "performance"
  | "dimension"
  | "electrical"
  | "safety"
  | "certification"
  | "service";

export type ParameterOperator = ">=" | "<=" | "=" | "contains";

export type TechnicalRequirement = {
  id: string;
  requirementText: string;
  category?: TechnicalRequirementCategory;
  parameterName?: string;
  operator?: ParameterOperator;
  targetValue?: string;
  unit?: string;
  mandatory: boolean;
  sourceSectionId?: string;
  sourcePage?: number;
  rawChunk?: string;
};

export type NormalizedParameter = {
  name: string;
  value: number | string;
  unit?: string;
  operator?: ParameterOperator;
  display: string;
};

export type ComplianceStatus = "covered" | "partial" | "failed" | "risky";

export type ComplianceResult = {
  requirementId: string;
  skuId?: string;
  status: ComplianceStatus;
  matchedParameters: {
    parameter: string;
    required?: string;
    actual?: string;
  }[];
  missingParameters?: string[];
  riskNotes?: string[];
  evidenceRequired?: boolean;
};

export type ComplianceMatrixRow = {
  requirementText: string;
  skuName?: string;
  requiredValue?: string;
  actualValue?: string;
  result: "covered" | "partial" | "failed";
  notes?: string;
};

export type TechnicalDeviationType =
  | "parameter"
  | "certification"
  | "service"
  | "documentation";

export type DeviationSeverity = "low" | "medium" | "high";

export type TechnicalDeviation = {
  id: string;
  requirementId: string;
  deviationType: TechnicalDeviationType;
  severity: DeviationSeverity;
  description: string;
  suggestedFix?: string;
};

export type TechnicalEvidenceType =
  | "datasheet"
  | "certification"
  | "test_report"
  | "warranty"
  | "case_study";

export type TechnicalEvidence = {
  id: string;
  type: TechnicalEvidenceType;
  title: string;
  relatedSkuId?: string;
  relatedRequirementIds?: string[];
  fileRef?: string;
};

export type ComplianceRiskLevel = "low" | "medium" | "high" | "risky";

export type TechnicalCompliancePackage = {
  requirements: TechnicalRequirement[];
  complianceResults: ComplianceResult[];
  matrix: ComplianceMatrixRow[];
  deviations: TechnicalDeviation[];
  risks: string[];
  responses: string[];
  evidence: TechnicalEvidence[];
  riskLevel: ComplianceRiskLevel;
};
