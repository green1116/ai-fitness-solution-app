/**
 * V64+ — Template usage event store
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export type TemplateUsageEvent =
  | "view"
  | "generate"
  | "preview"
  | "unlock_attempt"
  | "purchase"
  | "download";

export type TemplateUsageRecord = {
  templateId: string;
  event: TemplateUsageEvent;
  industry?: string;
  timestamp: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __templateUsageEvents: TemplateUsageRecord[] | undefined;
}

function getStore(): TemplateUsageRecord[] {
  globalThis.__templateUsageEvents ||= [];
  return globalThis.__templateUsageEvents;
}

export function trackTemplateUsage(input: {
  templateId: string;
  event: TemplateUsageEvent;
  industry?: string;
}) {
  getStore().push({
    ...input,
    timestamp: Date.now(),
  });
  if (getStore().length > 10000) getStore().splice(0, getStore().length - 10000);

  const growthEventMap: Record<TemplateUsageEvent, string> = {
    view: "template.market_view",
    generate: "template.tender_generated",
    preview: "template.preview_shown",
    unlock_attempt: "paywall.shown",
    purchase: "payment.completed",
    download: "template.pdf_downloaded",
  };

  appendGrowthEvent({
    event: growthEventMap[input.event],
    meta: { templateId: input.templateId, industry: input.industry, layer: "v64-tender-loop" },
  });
}

export function getTemplateUsageSnapshot(): TemplateUsageRecord[] {
  return [...getStore()];
}

export function clearTemplateUsageStoreForTests(): void {
  globalThis.__templateUsageEvents = [];
}

export function aggregateUsageByTemplate(templateId: string): Record<TemplateUsageEvent, number> {
  const counts: Record<TemplateUsageEvent, number> = {
    view: 0,
    generate: 0,
    preview: 0,
    unlock_attempt: 0,
    purchase: 0,
    download: 0,
  };
  for (const e of getStore()) {
    if (e.templateId === templateId) counts[e.event] += 1;
  }
  return counts;
}
