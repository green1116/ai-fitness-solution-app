import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { AttachmentLinkResult, ExtractedAttachment } from "../types";

function tokenize(text: string): string[] {
  return text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9%/.\-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2);
}

/**
 * V3.3 附件 ↔ 招标需求 确定性链接（关键词 + 类型启发）
 */
export function linkAttachmentsToRequirements(
  extractions: ExtractedAttachment[],
  graph: TenderSemanticGraph,
  minScore = 0.35,
): { extractions: ExtractedAttachment[]; links: AttachmentLinkResult[] } {
  const links: AttachmentLinkResult[] = [];
  const updated = extractions.map((ext) => ({ ...ext, linkedRequirementIds: [...ext.linkedRequirementIds] }));

  for (const ext of updated) {
    const attTokens = new Set([
      ...tokenize(ext.fileName),
      ...tokenize(ext.rawText.slice(0, 2000)),
      ...ext.semanticTags,
    ]);

    for (const req of graph.requirements) {
      const reqTokens = tokenize(req.normalizedRequirement || req.requirement);
      const matchedTerms = reqTokens.filter((t) => attTokens.has(t));
      let score = reqTokens.length
        ? matchedTerms.length / Math.max(3, reqTokens.length)
        : 0;

      if (ext.evidenceType === "certification" && req.category === "qualification") {
        score += 0.35;
      }
      if (ext.evidenceType === "datasheet" && req.measurable) {
        score += 0.25;
      }
      if (ext.evidenceType === "test_report" && /检测|报告/.test(req.requirement)) {
        score += 0.3;
      }
      if (req.evidenceRequired) score += 0.1;

      if (score >= minScore) {
        links.push({
          attachmentId: ext.attachmentId,
          requirementId: req.id,
          score: Math.min(1, Math.round(score * 100) / 100),
          matchedTerms: matchedTerms.slice(0, 6),
        });
        if (!ext.linkedRequirementIds.includes(req.id)) {
          ext.linkedRequirementIds.push(req.id);
        }
      }
    }
  }

  return { extractions: updated, links };
}
