import type { ProductSKU } from "@/lib/tender/sku/skuTypes";
import { getSkuById } from "@/lib/tender/sku/skuDatabase";

import type { ComplianceResult, TechnicalRequirement } from "./types";

function categoryLabel(category?: string): string {
  if (category === "performance") return "商用跑步机";
  return "健身设备";
}

/**
 * 生成参数级投标响应段落（evidence-driven，克制表述）
 */
export function composeComplianceResponse(
  req: TechnicalRequirement,
  result: ComplianceResult,
): string {
  const sku = result.skuId ? getSkuById(result.skuId) : undefined;
  const q = req.requirementText.slice(0, 72);
  const match = result.matchedParameters[0];

  if (!sku) {
    return `针对「${q}」技术要求，我方可按招标条款组织响应说明，并在投标文件中提供可核验的参数表与证明材料。`;
  }

  const label = categoryLabel(req.category);
  const paramLine = match
    ? `招标要求 ${match.required}，拟投 ${sku.brand} ${sku.model} ${label} 对应实测/标称值为 ${match.actual}`
    : `拟投 ${sku.brand} ${sku.model} ${label}`;

  if (result.status === "covered") {
    return `针对「${q}」要求，推荐采用 ${sku.brand} ${sku.model} ${label}，${paramLine}，满足招标技术要求下限，并支持后续参数证明材料与验收核验。`;
  }

  if (result.status === "partial" || result.status === "risky") {
    return `针对「${q}」要求，推荐采用 ${sku.brand} ${sku.model} ${label}，${paramLine}；我方可提供补充说明及证明材料，具体以合同约定及验收为准。`;
  }

  return `针对「${q}」要求，当前选型 ${sku.brand} ${sku.model} 与该条款存在差异，我方可提供偏离说明、替代方案及支撑材料，供评标委员会审核。`;
}

export function composeComplianceResponses(
  requirements: TechnicalRequirement[],
  results: ComplianceResult[],
): string[] {
  const byReq = new Map(results.map((r) => [r.requirementId, r]));
  return requirements
    .map((req) => {
      const res = byReq.get(req.id);
      return res ? composeComplianceResponse(req, res) : null;
    })
    .filter((s): s is string => Boolean(s));
}
