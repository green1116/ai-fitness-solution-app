/**
 * V2.5 Evidence Foundation Layer — 类型契约（与 PDF / OCR / UI 解耦）
 */

export type EvidenceType =
  | "datasheet"
  | "certification"
  | "test_report"
  | "case_study"
  | "warranty"
  | "sla"
  | "drawing";

export type EvidenceCoverageStatus =
  | "fully_evidenced"
  | "partially_evidenced"
  | "unsupported"
  | "risky";

/** V2.8：证据来源血缘（adapter trace + stage） */
export type EvidenceProvenance = {
  trace?: string;
  sourceKind: string;
  sourceId: string;
  stageId?: string;
  ingestedAt?: string;
};

export type EvidenceDocument = {
  id: string;
  title: string;
  type: EvidenceType;
  brand?: string;
  skuId?: string;
  fileRef?: string;
  extractedText?: string;
  linkedRequirements?: string[];
  linkedScoringItems?: string[];
  linkedRisks?: string[];
  confidence?: number;
  provenance?: EvidenceProvenance;
};

export type RequirementEvidenceLink = {
  requirementId: string;
  evidenceId: string;
  matchedField?: string;
  confidence?: number;
};

export type EvidenceRegistry = {
  documents: EvidenceDocument[];
  links: RequirementEvidenceLink[];
};

/** 符合性矩阵输入（由 compliance / semantic 层提供，本层不解析招标正文） */
export type EvidenceMatrixRequirementInput = {
  requirementId: string;
  requirement: string;
  sku?: string;
  claimedValue?: string;
};

export type TenderEvidenceMatrixRow = {
  requirementId: string;
  requirement: string;
  sku?: string;
  claimedValue?: string;
  evidenceTitle?: string;
  evidenceStatus: EvidenceCoverageStatus;
};

/** coverage 评估上下文 */
export type RequirementCoverageInput = {
  requirementId: string;
  requirementText: string;
  mandatory?: boolean;
};

export type RequirementCoverageResult = {
  requirementId: string;
  status: EvidenceCoverageStatus;
  linkedEvidenceIds: string[];
  notes?: string[];
};
