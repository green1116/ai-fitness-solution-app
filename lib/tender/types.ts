/**
 * V2 Tender Intelligence — 统一类型（与 V1 PDF freeze 解耦）
 */

export type ParsedPage = {
  page: number;
  text: string;
};

export type TenderSection = {
  id: string;
  title: string;
  content: string;
  startPage?: number;
  endPage?: number;
};

export type TenderTableBlock = {
  title?: string;
  rows: string[][];
  page?: number;
};

export type TenderParseMetadata = {
  projectName?: string;
  tenderCompany?: string;
  projectCode?: string;
  publishDate?: string;
  deadline?: string;
};

export type TenderParseResult = {
  rawText: string;
  metadata: TenderParseMetadata;
  sections: TenderSection[];
  tables: TenderTableBlock[];
  pages: ParsedPage[];
};

export type TenderRequirementCategory =
  | "technical"
  | "commercial"
  | "qualification"
  | "scoring"
  | "attachment";

export type TenderRequirementImportance = "mandatory" | "preferred" | "scored";

export type TenderRequirement = {
  id: string;
  category: TenderRequirementCategory;
  title: string;
  requirement: string;
  sourcePage?: number;
  importance: TenderRequirementImportance;
  rawChunk: string;
};

export type TenderIntelligenceResult = TenderParseResult & {
  requirements: TenderRequirement[];
};

export type TenderRequirementCounts = {
  total: number;
  technical: number;
  commercial: number;
  qualification: number;
  scoring: number;
  attachment: number;
};
