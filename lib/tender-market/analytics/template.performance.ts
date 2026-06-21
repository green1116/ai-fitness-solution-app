/**
 * V64+ — Template performance analytics
 */

import type { TemplateMetrics } from "../tender-market.types";
import { aggregateUsageByTemplate, getTemplateUsageSnapshot } from "./template.usage";
import { getMarketplaceTemplate, listMarketplaceTemplates } from "../marketplace/template.store";

export function analyzeTemplatePerformance(templateId?: string): TemplateMetrics[] {
  const catalogIds = templateId
    ? [templateId]
    : listMarketplaceTemplates().map((t) => t.id);

  return catalogIds.map((id) => {
    const t = getMarketplaceTemplate(id);
    if (!t) {
      return {
        templateId: id,
        views: 0,
        generations: 0,
        previews: 0,
        unlockAttempts: 0,
        purchases: 0,
        downloads: 0,
        conversionRate: 0,
        paidRate: 0,
        downloadRate: 0,
      };
    }
    const usage = aggregateUsageByTemplate(t.id);
    const views = Math.max(usage.view, 1);
    const generations = usage.generate;
    const previews = usage.preview;
    const unlockAttempts = usage.unlock_attempt;
    const purchases = usage.purchase;
    const downloads = usage.download;

    return {
      templateId: t.id,
      views: usage.view,
      generations,
      previews,
      unlockAttempts,
      purchases,
      downloads,
      conversionRate: Math.round((generations / views) * 100),
      paidRate: unlockAttempts > 0 ? Math.round((purchases / unlockAttempts) * 100) : 0,
      downloadRate: purchases > 0 ? Math.round((downloads / purchases) * 100) : 0,
    };
  });
}

export function getTopPerformingTemplates(limit = 5): TemplateMetrics[] {
  return [...analyzeTemplatePerformance()]
    .sort((a, b) => b.conversionRate * 2 + b.paidRate - (a.conversionRate * 2 + a.paidRate))
    .slice(0, limit);
}

export function getTotalMarketplaceUsage(): number {
  return getTemplateUsageSnapshot().length;
}
