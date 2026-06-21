/**
 * V64+ — Template rating system
 */

import { analyzeTemplatePerformance } from "../analytics/template.performance";
import { listMarketplaceTemplates } from "./template.store";

export function rateTemplate(templateId: string): {
  templateId: string;
  score: number;
  stars: number;
  metrics: ReturnType<typeof analyzeTemplatePerformance>[0] | null;
} {
  const metrics = analyzeTemplatePerformance(templateId)[0] ?? null;
  const template = listMarketplaceTemplates().find((t) => t.id === templateId);

  let score = template?.rating ?? 3;
  if (metrics) {
    score =
      2 +
      metrics.conversionRate / 30 +
      metrics.paidRate / 25 +
      metrics.downloadRate / 20 +
      Math.min(metrics.generations / 10, 1);
  }

  const stars = Math.min(5, Math.round(score * 10) / 10);

  return { templateId, score: Math.round(score * 10) / 10, stars, metrics };
}

export function rankTemplatesByRevenue(): ReturnType<typeof rateTemplate>[] {
  return listMarketplaceTemplates()
    .map((t) => rateTemplate(t.id))
    .sort((a, b) => b.score - a.score);
}
