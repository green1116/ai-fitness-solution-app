import type { ComplianceNode, SemanticRequirement } from "@/lib/tender/semantic/types";
import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { SkuMatchResult } from "@/lib/tender/sku/skuTypes";

import {
  complianceResponseForRequirement,
  enrichTechnicalContentWithSku,
} from "./skuEnrichment";
import { finalizeBlock } from "./responseQuality";
import type { TenderResponseBlock } from "./types";
import {
  extractEvidenceRefs,
  inferConfidence,
  nextBlockId,
  quoteRequirement,
} from "./responseUtils";

function composeMeasurableParagraph(req: SemanticRequirement): string {
  const q = quoteRequirement(req.requirement);
  const metrics = (req.measurableFields || []).join("、");
  const metricClause = metrics
    ? `所推荐配置在${metrics}等指标上满足不低于招标技术下限，`
    : "所推荐配置满足不低于招标技术下限，";
  return `针对「${q}」要求，${metricClause}并可在最终选型阶段提供品牌型号、参数说明及验收证明材料。`;
}

function composeEvidenceParagraph(req: SemanticRequirement): string {
  const q = quoteRequirement(req.requirement);
  const refs = extractEvidenceRefs(req.requirement);
  const refText =
    refs.length > 0
      ? refs.join("、")
      : "资质证明、检测报告或业绩佐证材料";
  return `针对「${q}」要求，我方可按招标文件规定提交${refText}，材料纳入投标附件索引，接受采购人核验。`;
}

function composeMandatoryParagraph(req: SemanticRequirement): string {
  const q = quoteRequirement(req.requirement);
  return `针对「${q}」要求，我方拟投方案逐条响应招标强制性条款，实施过程按合同及技术规范组织交付，原则上可满足且无实质性负偏离。`;
}

function composePreferredParagraph(req: SemanticRequirement): string {
  const q = quoteRequirement(req.requirement);
  return `针对「${q}」要求，我方在满足强制性条款基础上，按优选指标提供增强配置与实施保障，以提升方案先进性与交付可靠性。`;
}

function composeScoredParagraph(req: SemanticRequirement): string {
  const q = quoteRequirement(req.requirement);
  return `针对「${q}」评分相关条款，我方提供可核验的响应说明与支撑材料，评分点对应内容完整、逻辑闭环、证据可检索。`;
}

function composeParagraph(req: SemanticRequirement): string {
  if (req.measurable) return composeMeasurableParagraph(req);
  if (req.evidenceRequired) return composeEvidenceParagraph(req);
  if (req.importance === "mandatory") return composeMandatoryParagraph(req);
  if (req.importance === "scored") return composeScoredParagraph(req);
  return composePreferredParagraph(req);
}

/**
 * 技术类要求 → 投标化技术响应段落
 */
export function composeTechnicalResponse(
  requirements: SemanticRequirement[],
  complianceByReq: Map<string, ComplianceNode>,
  skuMatchByReq?: Map<string, SkuMatchResult>,
  compliancePackage?: TechnicalCompliancePackage,
): TenderResponseBlock[] {
  const technical = requirements.filter(
    (r) =>
      r.category === "technical" ||
      r.category === "qualification" ||
      (r.category === "scoring" && /技术|参数|功能|性能/.test(r.requirement)),
  );

  const mandatory = technical.filter((r) => r.importance === "mandatory");
  const rest = technical.filter((r) => !mandatory.includes(r));
  const ordered = [...mandatory, ...rest];

  let seq = 0;
  return ordered.map((req) => {
    seq += 1;
    const compliance = complianceByReq.get(req.id);
    const evidenceRefs = req.evidenceRequired
      ? extractEvidenceRefs(req.requirement)
      : undefined;
    const hint = req.measurable
      ? "具体参数以投标配置表及检测报告为准"
      : "响应说明见技术方案对应章节";

    const skuMatch = skuMatchByReq?.get(req.id);
    const rawContent = composeParagraph(req);
    const complianceText = complianceResponseForRequirement(
      compliancePackage,
      req.id,
    );
    const content = enrichTechnicalContentWithSku(
      req,
      rawContent,
      skuMatch,
      complianceText,
    );

    return finalizeBlock(
      {
        id: nextBlockId("TR", seq),
        title: skuMatch?.sku
          ? `${skuMatch.sku.brand} ${skuMatch.sku.model} · ${req.title || `技术响应 ${seq}`}`
          : req.title || `技术响应 ${seq}`,
        type: "technical",
        sectionId: req.sourceSectionId,
        relatedRequirementIds: [req.id],
        relatedScoringItemIds: req.relatedScoringItems,
        relatedRiskIds: req.relatedRisks,
        content,
        confidence: skuMatch?.sku
          ? skuMatch.compliance === "covered"
            ? "high"
            : inferConfidence(req, compliance)
          : inferConfidence(req, compliance),
        evidenceRefs: evidenceRefs?.length ? evidenceRefs : undefined,
        sectionRef: req.sourceSectionId
          ? `招标章节 ${req.sourceSectionId}`
          : undefined,
      },
      hint,
    );
  });
}
