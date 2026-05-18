import type { EvidenceCoverageStatus, EvidenceType } from "../types";

/** 证据来源模块（adapter 输入侧） */
export type EvidenceSourceKind =
  | "technical"
  | "compliance"
  | "risk"
  | "scoring"
  | "qualification"
  | "response"
  | "sku"
  | "matrix"
  | "attachment";

/**
 * 归一化证据载荷（写入 Registry 前的标准形态）
 */
export type NormalizedEvidencePayload = {
  sourceKind: EvidenceSourceKind;
  sourceId: string;
  evidenceType: EvidenceType;
  title: string;
  summary?: string;
  confidence?: number;
  coverageStatus?: EvidenceCoverageStatus;
  brand?: string;
  skuId?: string;
  fileRef?: string;
  extractedText?: string;
  linkedRequirementIds?: string[];
  linkedScoringItemIds?: string[];
  linkedRiskIds?: string[];
  matchedField?: string;
  trace?: string;
  createdAt?: string;
};

export type ApplyPayloadsResult = {
  registry: import("../types").EvidenceRegistry;
  documentsAdded: number;
  linksAdded: number;
};
