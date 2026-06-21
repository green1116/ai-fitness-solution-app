/**
 * V65 — SEO ranking optimizer
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { rankKeywordsByOpportunity } from "./keyword.strategy";
import type { SEOContent } from "../growth-marketing.types";

export function optimizeContentStructure(content: SEOContent): SEOContent & { recommendations: string[] } {
  const metrics = aggregateGrowthMetrics();
  const recommendations: string[] = [];

  if (!content.body.includes("##")) {
    recommendations.push("Add H2 sections for featured snippets");
  }
  if (content.keywords.length < 3) {
    recommendations.push("Expand keyword cluster in headings");
  }
  if (metrics.visitors < metrics.signups * 5) {
    recommendations.push("Improve meta description CTR with stronger CTA");
  }

  const ranked = rankKeywordsByOpportunity();
  const enrichedKeywords = [...new Set([...content.keywords, ...ranked.slice(0, 3).map((r) => r.keyword)])];

  return {
    ...content,
    keywords: enrichedKeywords.slice(0, 8),
    recommendations,
  };
}

export function optimizeSearchRanking(): string[] {
  const ranked = rankKeywordsByOpportunity();
  return ranked.slice(0, 5).map((r) => `Prioritize content for "${r.keyword}" (score ${r.score})`);
}
