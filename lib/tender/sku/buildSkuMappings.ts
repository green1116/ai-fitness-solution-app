import type { SemanticRequirement } from "@/lib/tender/semantic/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

import { findAlternativeSkus } from "./skuAlternatives";
import { matchSkuForRequirement } from "./skuMatcher";
import { computeSkuScoringInsight } from "./skuScoring";
import type {
  SKURequirementMapping,
  SKUIntelligenceResult,
  SkuMatchContext,
  SkuMatchResult,
} from "./skuTypes";

export type BuildSkuMappingsOptions = {
  budgetTier?: SkuMatchContext["budgetTier"];
  requirements?: SemanticRequirement[];
};

/**
 * semantic requirements → SKU intelligence pipeline
 */
export function buildSkuMappings(
  graph: TenderSemanticGraph,
  options: BuildSkuMappingsOptions = {},
): SKUIntelligenceResult {
  const reqs =
    options.requirements ??
    graph.requirements.filter(
      (r) =>
        r.category === "technical" ||
        r.measurable ||
        /跑步机|椭圆|单车|力量|器械|设备|参数|km\/h|kg/i.test(r.requirement),
    );

  const ctx: SkuMatchContext = { budgetTier: options.budgetTier ?? "mid" };
  const matchResults: SkuMatchResult[] = [];
  const mappings: SKURequirementMapping[] = [];
  const recommendedSet = new Map<string, import("./skuTypes").ProductSKU>();
  const alternativeSet = new Map<string, import("./skuTypes").ProductSKU>();

  for (const req of reqs) {
    const match = matchSkuForRequirement(req, ctx);
    matchResults.push(match);

    if (match.sku) {
      recommendedSet.set(match.sku.id, match.sku);
      const alts = findAlternativeSkus(match.sku, req, [match.sku.id]);
      match.alternatives = alts;
      for (const alt of alts) alternativeSet.set(alt.id, alt);

      mappings.push({
        requirementId: req.id,
        skuId: match.sku.id,
        compliance: match.compliance,
        matchedFields: match.matchedFields,
        missingFields: match.missingFields,
        riskNotes: match.riskNotes,
      });
    } else {
      mappings.push({
        requirementId: req.id,
        skuId: "",
        compliance: match.compliance,
        matchedFields: [],
        missingFields: match.missingFields,
        riskNotes: match.riskNotes,
      });
    }
  }

  const complianceSummary = {
    covered: mappings.filter((m) => m.compliance === "covered").length,
    partial: mappings.filter((m) => m.compliance === "partial").length,
    missing: mappings.filter((m) => m.compliance === "missing").length,
    risky: mappings.filter((m) => m.compliance === "risky").length,
  };

  const recommendedSkus = [...recommendedSet.values()];
  const alternativeSkus = [...alternativeSet.values()].filter(
    (s) => !recommendedSet.has(s.id),
  );

  const scoring = computeSkuScoringInsight(
    mappings,
    recommendedSkus,
    graph.scoringItems,
  );

  return {
    mappings,
    recommendedSkus,
    alternativeSkus,
    complianceSummary,
    scoring,
    matchResults,
  };
}
