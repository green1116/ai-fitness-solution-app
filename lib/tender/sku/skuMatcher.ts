import type { SemanticRequirement } from "@/lib/tender/semantic/types";

import { getAllSkus, getSkusByCategory } from "./skuDatabase";
import { evaluateSkuCompliance, parseRequirementSpec } from "./skuCompliance";
import type {
  ProductSKU,
  SkuCategory,
  SkuMatchContext,
  SkuMatchResult,
} from "./skuTypes";

const CATEGORY_PATTERNS: { category: SkuCategory; pattern: RegExp }[] = [
  { category: "treadmill", pattern: /跑步机|跑步機|treadmill/i },
  { category: "elliptical", pattern: /椭圆|elliptical/i },
  { category: "bike", pattern: /动感单车|健身车|单车|spin\s*bike|bike/i },
  { category: "strength", pattern: /力量|器械|哑铃|杠铃|strength/i },
  { category: "rack", pattern: /深蹲架|架|rack/i },
  { category: "free_weight", pattern: /自由重量|壶铃|哑铃组/i },
  { category: "functional", pattern: /功能性|functional|crossfit/i },
  { category: "recovery", pattern: /康复|恢复|拉伸|foam|recovery/i },
];

export function inferRequirementCategory(
  req: SemanticRequirement,
): SkuCategory | null {
  const text = `${req.title} ${req.requirement}`;
  for (const { category, pattern } of CATEGORY_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  const spec = parseRequirementSpec(req);
  if (spec.keywords.includes("treadmill")) return "treadmill";
  if (spec.keywords.includes("bike")) return "bike";
  if (spec.keywords.includes("strength")) return "strength";
  if (spec.keywords.includes("recovery")) return "recovery";
  return null;
}

function scoreSkuForRequirement(
  sku: ProductSKU,
  req: SemanticRequirement,
  ctx: SkuMatchContext,
): number {
  const ev = evaluateSkuCompliance(req, sku);
  const rank = { covered: 100, partial: 60, risky: 40, missing: 0 };
  let score = rank[ev.compliance];
  if (ctx.budgetTier && sku.productTier === ctx.budgetTier) score += 15;
  if (sku.productTier === "high") score += 5;
  score -= (sku.leadTimeDays ?? 50) * 0.1;
  return score;
}

/**
 * requirement → 最佳 SKU 匹配
 */
export function matchSkuForRequirement(
  req: SemanticRequirement,
  ctx: SkuMatchContext = {},
): SkuMatchResult {
  const category = inferRequirementCategory(req);
  const pool = category ? getSkusByCategory(category) : getAllSkus();

  if (!pool.length) {
    return {
      matched: false,
      requirementId: req.id,
      compliance: "missing",
      matchedFields: [],
      missingFields: ["无可用 SKU 库条目"],
    };
  }

  const ranked = pool
    .map((sku) => ({ sku, score: scoreSkuForRequirement(sku, req, ctx) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score <= 0) {
    return {
      matched: false,
      requirementId: req.id,
      compliance: "missing",
      matchedFields: [],
      missingFields: ["未找到满足参数的 SKU"],
    };
  }

  const ev = evaluateSkuCompliance(req, best.sku);
  return {
    matched: ev.compliance === "covered" || ev.compliance === "partial",
    requirementId: req.id,
    sku: best.sku,
    compliance: ev.compliance,
    matchedFields: ev.matchedFields,
    missingFields: ev.missingFields.length ? ev.missingFields : undefined,
    riskNotes: ev.riskNotes.length ? ev.riskNotes : undefined,
  };
}
