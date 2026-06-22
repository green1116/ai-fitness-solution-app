/**
 * V65 — SEO engine orchestrator
 */

import { generateSEOContent } from "./content.generator";
import { buildKeywordStrategy, rankKeywordsByOpportunity } from "./keyword.strategy";
import { optimizeContentStructure, optimizeSearchRanking } from "./ranking.optimizer";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export function generateSEOContentBundle(topic?: string) {
  const content = generateSEOContent(topic);
  const optimized = optimizeContentStructure(content);
  const ranking = optimizeSearchRanking();

  appendGrowthEvent({
    event: "growth.seo_generated",
    meta: { slug: content.slug, keywords: content.keywords.length, layer: "v65" },
  });

  return {
    strategy: buildKeywordStrategy(),
    keywords: rankKeywordsByOpportunity(),
    content: optimized,
    rankingActions: ranking,
  };
}

export { generateSEOContent };
