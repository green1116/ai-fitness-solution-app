import type { SemanticScoringItem } from "@/lib/tender/semantic/types";

import type { ProductSKU, SkuScoringInsight } from "./skuTypes";
import type { SKURequirementMapping } from "./skuTypes";

/**
 * 品牌等级 + 参数满足度 + 交付 → 投标评分辅助
 */
export function computeSkuScoringInsight(
  mappings: SKURequirementMapping[],
  recommendedSkus: ProductSKU[],
  scoringItems: SemanticScoringItem[],
): SkuScoringInsight {
  const notes: string[] = [];
  const covered = mappings.filter((m) => m.compliance === "covered").length;
  const risky = mappings.filter((m) => m.compliance === "risky").length;
  const missing = mappings.filter((m) => m.compliance === "missing").length;

  const highTierCount = recommendedSkus.filter(
    (s) => s.productTier === "high",
  ).length;
  const premiumBrands = recommendedSkus.filter((s) =>
    /Life Fitness|Technogym|Matrix/i.test(s.brand),
  ).length;

  let technicalScoreBoost = false;
  if (covered >= Math.max(1, mappings.length * 0.6)) {
    technicalScoreBoost = true;
    notes.push("多数技术要求已由推荐 SKU 覆盖，有利于技术评分");
  }
  if (highTierCount >= 1 && premiumBrands >= 1) {
    technicalScoreBoost = true;
    notes.push("高端品牌与高端档位组合有助于方案先进性评分");
  }

  if (scoringItems.some((s) => /类似案例|业绩/.test(s.title))) {
    notes.push("建议同步提交推荐 SKU 对应业绩与检测报告");
  }

  let commercialRisk: SkuScoringInsight["commercialRisk"] = "low";
  if (missing > 0) commercialRisk = "high";
  else if (risky > 0) commercialRisk = "medium";

  const longLead = recommendedSkus.some((s) => (s.leadTimeDays ?? 0) > 60);
  if (longLead) {
    commercialRisk = commercialRisk === "low" ? "medium" : commercialRisk;
    notes.push("部分 SKU 交期偏长，需关注商务与交付风险");
  }

  return {
    technicalScoreBoost,
    commercialRisk,
    notes: notes.length ? notes : undefined,
  };
}
