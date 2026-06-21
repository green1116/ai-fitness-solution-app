/**
 * V64+ — Tender business loop (Traffic → Template → Generate → Pay → Retain)
 */

import { createTraceId } from "@/lib/ai-execution/core/execution.context";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { TenderBusinessLoopResult } from "../tender-market.types";
import { listTemplateMarketplace } from "../marketplace/template.listing";
import { getTopPerformingTemplates } from "../analytics/template.performance";
import { recommendTemplates } from "../marketplace/template.recommender";
import { rankTemplatesByRevenue } from "../marketplace/template.rating";
import { getTotalMarketplaceUsage } from "../analytics/template.performance";

export function runTenderBusinessLoop(traceId?: string): TenderBusinessLoopResult {
  const tid = traceId ?? createTraceId();
  const templates = listTemplateMarketplace();
  const topPerformers = getTopPerformingTemplates(5);
  const recommendations = recommendTemplates({ currentIndustry: "fitness", preferPaid: true });
  const rankings = rankTemplatesByRevenue();
  const usage = getTotalMarketplaceUsage();

  const actions: string[] = [
    "Traffic → Landing → Template Store listing",
    "Free templates drive preview → paid unlock via Feature Gate",
    "Post-download → recommend cross-industry templates",
  ];

  if (topPerformers[0]) {
    actions.push(`Promote top converter: ${topPerformers[0].templateId}`);
  }

  for (const rec of recommendations.slice(0, 2)) {
    actions.push(`Recommend: ${rec.name} — ${rec.reason}`);
  }

  const optimizations: string[] = [
    `Marketplace templates: ${templates.length}`,
    `Total usage events: ${usage}`,
    `Top rated: ${rankings[0]?.templateId ?? "n/a"}`,
    "Retention loop: template recommendation → more traffic",
  ];

  const lowConversion = topPerformers.filter((t) => t.conversionRate < 10);
  if (lowConversion.length > 0) {
    optimizations.push(`Optimize ${lowConversion.length} low-conversion templates`);
  }

  appendGrowthEvent({
    event: "tender.business_loop_completed",
    meta: { traceId: tid, templateCount: templates.length, layer: "v64-tender-loop" },
  });

  return {
    traceId: tid,
    templates,
    topPerformers,
    recommendations,
    actions,
    optimizations,
    generatedAt: new Date().toISOString(),
  };
}
