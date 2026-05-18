/**
 * V2.2 Tender Response Composer — 类型定义
 */

export type TenderResponseBlockType =
  | "technical"
  | "commercial"
  | "scoring"
  | "risk"
  | "attachment";

export type ResponseConfidence = "high" | "medium" | "low";

export type TenderResponseBlock = {
  id: string;
  title: string;
  type: TenderResponseBlockType;
  sectionId?: string;
  relatedRequirementIds?: string[];
  relatedScoringItemIds?: string[];
  relatedRiskIds?: string[];
  content: string;
  confidence: ResponseConfidence;
  evidenceRefs?: string[];
  /** 评分/正文章节引用提示 */
  sectionRef?: string;
};

export type AttachmentIndexItem = {
  title: string;
  reason: string;
  linkedRequirementIds?: string[];
  linkedScoringItemIds?: string[];
};

/** 规范输出：按类型分组的响应包 */
export type TenderResponsePackage = {
  technicalBlocks: TenderResponseBlock[];
  commercialBlocks: TenderResponseBlock[];
  scoringBlocks: TenderResponseBlock[];
  riskBlocks: TenderResponseBlock[];
  attachmentBlocks: TenderResponseBlock[];
  attachmentIndex: AttachmentIndexItem[];
};

export type TenderResponsePackageSummary = {
  technical: number;
  commercial: number;
  scoring: number;
  risk: number;
  attachment: number;
  total: number;
};

/** 兼容旧聚合结构 */
export type TenderComposedResponses = {
  package: TenderResponsePackage;
  blocks: TenderResponseBlock[];
  summary: TenderResponsePackageSummary & {
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
  };
};

export function summarizeResponsePackage(
  pkg: TenderResponsePackage,
): TenderComposedResponses["summary"] {
  const blocks = [
    ...pkg.technicalBlocks,
    ...pkg.commercialBlocks,
    ...pkg.scoringBlocks,
    ...pkg.riskBlocks,
    ...pkg.attachmentBlocks,
  ];
  return {
    technical: pkg.technicalBlocks.length,
    commercial: pkg.commercialBlocks.length,
    scoring: pkg.scoringBlocks.length,
    risk: pkg.riskBlocks.length,
    attachment: pkg.attachmentBlocks.length,
    total: blocks.length,
    highConfidence: blocks.filter((b) => b.confidence === "high").length,
    mediumConfidence: blocks.filter((b) => b.confidence === "medium").length,
    lowConfidence: blocks.filter((b) => b.confidence === "low").length,
  };
}

export function flattenResponsePackage(
  pkg: TenderResponsePackage,
): TenderResponseBlock[] {
  return [
    ...pkg.technicalBlocks,
    ...pkg.commercialBlocks,
    ...pkg.scoringBlocks,
    ...pkg.riskBlocks,
    ...pkg.attachmentBlocks,
  ];
}
