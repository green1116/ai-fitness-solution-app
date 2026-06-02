import type { SemanticRequirement } from "@/lib/tender/semantic/types";
import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { SkuMatchResult, SKUIntelligenceResult } from "@/lib/tender/sku/skuTypes";
import { formatAlternativeLabel } from "@/lib/tender/sku/skuAlternatives";

import { quoteRequirement } from "./responseUtils";

export function buildSkuMatchMap(
  skuResult?: SKUIntelligenceResult,
): Map<string, SkuMatchResult> {
  const map = new Map<string, SkuMatchResult>();
  if (!skuResult) return map;
  for (const m of skuResult.matchResults) {
    map.set(m.requirementId, m);
  }
  return map;
}

/**
 * 将 Response Composer 技术段落升级为真实 SKU 引用
 */
export function complianceResponseForRequirement(
  compliancePackage: TechnicalCompliancePackage | undefined,
  requirementIdPrefix: string,
): string | undefined {
  if (!compliancePackage) return undefined;
  const idx = compliancePackage.requirements.findIndex((r) =>
    r.id.startsWith(requirementIdPrefix),
  );
  if (idx < 0) return undefined;
  return compliancePackage.responses[idx];
}

export function enrichTechnicalContentWithSku(
  req: SemanticRequirement,
  baseContent: string,
  match?: SkuMatchResult,
  complianceText?: string,
): string {
  if (complianceText) return complianceText;
  if (!match?.sku) return baseContent;

  const q = quoteRequirement(req.requirement);
  const sku = match.sku;
  const categoryLabel =
    sku.category === "treadmill"
      ? "商用跑步机"
      : sku.category === "bike"
        ? "商用动感单车"
        : sku.category === "strength"
          ? "力量训练设备"
          : "健身设备";

  const paramHint =
    match.matchedFields.length > 0
      ? match.matchedFields.join("，")
      : "关键参数可按招标下限配置";

  const altHint =
    match.alternatives && match.alternatives.length > 0
      ? `；备选：${formatAlternativeLabel(match.alternatives)}`
      : "";

  const riskHint =
    match.riskNotes && match.riskNotes.length > 0
      ? `（交付提示：${match.riskNotes.join("；")}）`
      : "";

  return `针对「${q}」要求，推荐采用 ${sku.brand} ${sku.model} ${categoryLabel}，${paramHint}，可满足招标技术要求并支持参数证明材料与验收核验${altHint}${riskHint}。`;
}
