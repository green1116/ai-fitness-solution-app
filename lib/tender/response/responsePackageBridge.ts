import type { TenderResponsePackage } from "./types";

/**
 * 将响应包映射为 plan/PDF 章节可注入的正文（不改动 V1 版式，仅提供内容源）
 */
export type PlanSectionContentMap = {
  technical: string[];
  commercial: string[];
  scoring: string[];
  risk: string[];
  attachment: string[];
};

export function mapResponsePackageToPlanSections(
  pkg: TenderResponsePackage,
): PlanSectionContentMap {
  return {
    technical: pkg.technicalBlocks.map((b) => b.content),
    commercial: pkg.commercialBlocks.map((b) => b.content),
    scoring: pkg.scoringBlocks.map((b) => b.content),
    risk: pkg.riskBlocks.map((b) => b.content),
    attachment: pkg.attachmentBlocks.map((b) => b.content),
  };
}

/** 合并为单段正文（供现有章节 body 字段直接赋值） */
export function joinBlocksForSection(
  blocks: string[],
  separator = "\n\n",
): string {
  return blocks.filter(Boolean).join(separator);
}
